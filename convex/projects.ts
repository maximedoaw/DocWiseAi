import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const create = mutation({
  args: {
    title: v.string(),
    type: v.string(),
    academicYear: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companyDescription: v.optional(v.string()),
    domains: v.optional(v.array(v.string())),
    duration: v.optional(v.string()),
    numPages: v.number(),
    missions: v.array(v.string()),
    pageCount: v.optional(v.number()), // Not in schema but might be useful to store config
    modelStorageId: v.optional(v.string()), // ID of the uploaded PDF/Docx model
    initialContent: v.optional(v.string()),
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
      domains: args.domains,
      duration: args.duration,
      missions: args.missions,
      modelStorageId: args.modelStorageId,
      initialContent: args.initialContent,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      numPages: args.numPages,
    });

    // Create initial page in the new table
    await ctx.db.insert("pages", {
        projectId,
        title: "Introduction",
        order: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        content: args.initialContent ? args.initialContent : JSON.stringify({
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
    if (!identity) return null;

    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== identity.subject) return null;

    // Fetch pages from standalone table
    const pages = await ctx.db
        .query("pages")
        .withIndex("by_project", (q) => q.eq("projectId", args.id))
        .collect();
    
    // Sort by order
    const sortedPages = pages.sort((a, b) => a.order - b.order);

    // MIGRATION: If no pages found in pages table, check for deprecated inline pages
    if (sortedPages.length === 0 && (project as any).pages?.length > 0) {
        // Return inline pages for this query result only. 
        // Real migration happens on first save/edit.
        return {
            ...project,
            pages: (project as any).pages.map((p: any, idx: number) => ({
                _id: p.id,
                title: p.title,
                content: p.content,
                order: idx
            }))
        };
    }

    return {
        ...project,
        pages: sortedPages
    };
  },
});

export const updatePageContent = mutation({
  args: {
    projectId: v.id("projects"),
    pageId: v.string(), // This could be v.id("pages") or the old UUID string
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthorized");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== identity.subject) throw new Error("Unauthorized");

    // Try to find the page in the standalone 'pages' table
    let page: any = null;
    try {
        // First try to treat pageId as a real document ID
        page = await ctx.db.get(args.pageId as any);
    } catch {
        // Fallback: search by 'projectId' and custom ID/title for legacy
        const allPages = await ctx.db.query("pages")
            .withIndex("by_project", q => q.eq("projectId", args.projectId))
            .collect();
        page = allPages.find((p: any) => p._id === args.pageId);
    }

    if (page) {
        await ctx.db.patch(page._id, {
            content: args.content,
            updatedAt: Date.now(),
        });
    } else {
        // FALLBACK: If it was a legacy inline page that hasn't been migrated yet, 
        // we create it in the new table now.
        await ctx.db.insert("pages", {
            projectId: args.projectId,
            title: "Page Migrée",
            content: args.content,
            order: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    }

    await ctx.db.patch(args.projectId, { updatedAt: Date.now() });
  },
});

export const addPage = mutation({
    args: {
        projectId: v.id("projects"),
        title: v.string(),
        content: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const project = await ctx.db.get(args.projectId);
        if (!project || project.userId !== identity.subject) throw new Error("Unauthorized");

        // Determine next order
        const existingPages = await ctx.db.query("pages")
            .withIndex("by_project", q => q.eq("projectId", args.projectId))
            .collect();
        const maxOrder = existingPages.reduce((max, p) => Math.max(max, p.order), -1);

        const pageId = await ctx.db.insert("pages", {
            projectId: args.projectId,
            title: args.title,
            content: args.content || `<h1>${args.title}</h1><p><br></p>`,
            order: maxOrder + 1,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
        
        await ctx.db.patch(args.projectId, { updatedAt: Date.now() });
        return pageId;
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

        try {
            await ctx.db.delete(args.pageId as any);
        } catch {
            const allPages = await ctx.db.query("pages")
                .withIndex("by_project", q => q.eq("projectId", args.projectId))
                .collect();
            const page = allPages.find((p: any) => p._id === args.pageId);
            if (page) await ctx.db.delete(page._id);
        }
        
        await ctx.db.patch(args.projectId, { updatedAt: Date.now() });
    }
});

export const deleteProject = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const project = await ctx.db.get(args.id);
        if (!project || project.userId !== identity.subject) throw new Error("Unauthorized");

        // Delete all associated pages
        const pages = await ctx.db.query("pages")
            .withIndex("by_project", q => q.eq("projectId", args.id))
            .collect();
        for (const page of pages) {
            await ctx.db.delete(page._id);
        }

        await ctx.db.delete(args.id);
    }
})
