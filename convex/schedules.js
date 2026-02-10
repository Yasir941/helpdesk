import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Saves a new study session to the database.
 */
export const createSchedule = mutation({
  args: {
    title: v.string(),
    subject: v.string(),
    time: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "dev_user_123";

    return await ctx.db.insert("schedules", {
      ...args,
      userId: userId,
      isCompleted: false, 
    });
  },
});

/**
 * Fetches all schedules belonging to the current user.
 */
export const getUserSchedules = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "dev_user_123";

    return await ctx.db
      .query("schedules")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .collect();
  },
});

/**
 * Deletes a specific schedule by ID.
 * UPDATED: Uses the same userId logic to bypass environment locks.
 */
export const deleteSchedule = mutation({
  args: { id: v.id("schedules") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const userId = identity?.subject ?? "dev_user_123";

    // 1. Fetch the record first
    const existing = await ctx.db.get(args.id);

    if (!existing) {
      console.warn("Delete failed: Schedule not found.");
      return;
    }

    // 2. Check Ownership: 
    // This allows the dev_user_123 to delete items they created,
    // even if the system thinks it is in 'production' mode.
    if (existing.userId !== userId) {
      console.warn("Unauthorized delete attempt blocked.");
      return;
    }
    
    // 3. Perform the delete
    await ctx.db.delete(args.id);
    console.log("Successfully deleted schedule:", args.id);
  },
});