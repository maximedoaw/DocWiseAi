import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const syncUser = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        avatarUrl: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        const existingUser = await ctx.db.query("users")
        .filter((q) => q.eq(q.field("clerkId"), args.clerkId))
        .first();

        if (existingUser) return 

        return await ctx.db.insert("users", {
            ...args,
            username: args.email.split("@")[0],
            avatarUrl: args.avatarUrl,
        })
    }
})

export const list = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const users = await ctx.db
            .query("users")
            .collect();

        return users;
    },
});

export const completeOnboarding = mutation({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Called completeOnboarding without authentication present");
        }

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), identity.subject))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(user._id, {
            onboardingCompleted: true,
        });
    },
});

export const getUserStatus = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("clerkId"), identity.subject))
            .first();

        return user ? { onboardingCompleted: user.onboardingCompleted } : null;
    },
});