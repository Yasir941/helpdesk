import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all tasks for the logged-in user
export const getUserTasks = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Add a new task or assignment
export const createTask = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(),
    type: v.string(),
    priority: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      ...args,
      isCompleted: false,
    });
  },
});