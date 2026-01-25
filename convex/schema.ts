import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.string(),
    avatarUrl: v.optional(v.string()),
    onboardingCompleted: v.optional(v.boolean()),
  }),

  projects: defineTable({
    userId: v.string(),
    title: v.string(),
    type: v.string(), // "BTS", "Licence", "Master"
    academicYear: v.optional(v.string()),
    companyName: v.optional(v.string()),
    companyDescription: v.optional(v.string()),
    domains: v.optional(v.array(v.string())), // Added for better context
    duration: v.optional(v.string()), // Added for context
    numPages: v.optional(v.number()), // Made optional for backward compatibility
    missions: v.array(v.string()),
    status: v.string(), // "draft", "completed"
    content: v.optional(v.string()), // Deprecated but kept for migration
    modelStorageId: v.optional(v.string()), // ID of the uploaded PDF/Docx model
    initialContent: v.optional(v.string()), // AI generated plan or initial state
    // DEPRECATED: Storing pages in array hits the 1MB limit. Use the 'pages' table instead.
    pages: v.optional(v.any()), 
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_user", ["userId"])
  .index("by_user_status", ["userId", "status"]),

  pages: defineTable({
    projectId: v.id("projects"),
    title: v.string(),
    content: v.string(), // HTML/JSON content
    order: v.number(), // For sorting pages
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),
});