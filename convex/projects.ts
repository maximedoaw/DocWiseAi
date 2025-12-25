import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    academicYear: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companyDescription: v.optional(v.string()),
    numPages: v.number(),
    missions: v.array(v.string()),
    pageCount: v.optional(v.number()), // Not in schema but might be useful to store config
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const projectId = await ctx.db.insert("projects", {
      userId: identity.subject,
      title: args.title,
      type: args.type,
      academicYear: args.academicYear,
      companyName: args.companyName,
      companyDescription: args.companyDescription,
      missions: args.missions,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      numPages: args.numPages,
      pages: [
        {
          id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          title: "Introduction",
          content: JSON.stringify({
            root: {
              children: [
                {
                  children: [
                    {
                      detail: 0,
                      format: 0,
                      mode: "normal",
                      style: "",
                      text: `Introduction`,
                      type: "text",
                      version: 1,
                    },
                  ],
                  direction: "ltr",
                  format: "start",
                  indent: 0,
                  type: "heading",
                  version: 1,
                  tag: "h1"
                },
                {
                    children: [],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "paragraph",
                    version: 1
                }
              ],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "root",
              version: 1,
            },
          }),
        }
      ]
    });

    return projectId;
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    return projects;
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      // Instead of throwing, we return null to let the UI handle it (e.g. redirecting or showing login)
      // Throwing causes a crash in the UI which is not ideal for the initial load
      return null;
    }

    const project = await ctx.db.get(args.id);
    if (!project) return null;

    if (project.userId !== identity.subject) {
      // If user is logged in but doesn't own the project, we can return null or throw.
      // Returning null treats it as "Not Found" for this user.
      console.warn(`User ${identity.subject} tried to access project ${args.id} owned by ${project.userId}`);
      return null; 
    }

    // Migration for old projects without pages or numPages
    const needsMigration = 
      project.numPages === undefined || 
      !project.pages || 
      project.pages.length === 0;
    
    if (needsMigration) {
      const migratedProject: any = { ...project };
      
      // Add numPages if missing (use pages length or default to 1)
      if (migratedProject.numPages === undefined) {
        migratedProject.numPages = migratedProject.pages?.length || 1;
      }
      
      // Migrate old content to pages array if needed
      if (!migratedProject.pages || migratedProject.pages.length === 0) {
        const oldContent = (project as any).content || JSON.stringify({
          root: {
            children: [{
              children: [],
              direction: "ltr",
              format: "",
              indent: 0,
              type: "paragraph",
              version: 1
            }],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "root",
            version: 1
          }
        });
        
        migratedProject.pages = [
          {
            id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: "Introduction",
            content: oldContent
          }
        ];
      }
      
      // Update the project in database if migration was needed
      // Note: We cannot perform side-effects (writes) in a query. 
      // The migration will effectively happen in the DB when the user saves the project.
      // For now, we just return the migrated structure so the UI works.
      
      return migratedProject;
    }

    return project;
  },
});

export const updatePageContent = mutation({
  args: {
    projectId: v.id("projects"),
    pageId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) {
      throw new Error("Unauthorized");
    }

    // Ensure pages array exists
    if (!project.pages || project.pages.length === 0) {
        // Create default page if none exists
        project.pages = [{
            id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: "Introduction",
            content: "{}"
        }];
    }
    
    const pages = project.pages;
    const pageIndex = pages.findIndex(p => p.id === args.pageId);
    
    if (pageIndex === -1) {
        throw new Error("Page not found");
    }

    const newPages = [...pages];
    newPages[pageIndex] = { ...newPages[pageIndex], content: args.content };

    await ctx.db.patch(args.projectId, {
      pages: newPages,
      updatedAt: Date.now(),
    });
  },
});

export const addPage = mutation({
    args: {
        projectId: v.id("projects"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const project = await ctx.db.get(args.projectId);
        if (!project || project.userId !== identity.subject) throw new Error("Unauthorized");

        const newPage = {
            id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: args.title,
            content: JSON.stringify({
                root: {
                    children: [
                        {
                            children: [{ detail: 0, format: 0, mode: "normal", style: "", text: args.title, type: "text", version: 1 }],
                            direction: "ltr",
                            format: "start",
                            indent: 0,
                            type: "heading",
                            version: 1,
                            tag: "h1"
                        }
                    ],
                    direction: "ltr",
                    format: "",
                    indent: 0,
                    type: "root",
                    version: 1
                }
            })
        };

        await ctx.db.patch(args.projectId, {
            pages: [...(project.pages || []), newPage],
            updatedAt: Date.now()
        });
        
        return newPage.id;
    }
});

export const deletePage = mutation({
    args: {
        projectId: v.id("projects"),
        pageId: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const project = await ctx.db.get(args.projectId);
        if (!project || project.userId !== identity.subject) throw new Error("Unauthorized");

        const newPages = (project.pages || []).filter(p => p.id !== args.pageId);

        await ctx.db.patch(args.projectId, {
            pages: newPages,
            updatedAt: Date.now()
        });
    }
});

export const deleteProject = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const project = await ctx.db.get(args.id);
        if (!project || project.userId !== identity.subject) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
    }
})
