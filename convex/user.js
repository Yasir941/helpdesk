import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const createUser = mutation({
  args: {
    email: v.string(),
    userName: v.string(),
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    // If not, insert new user
    if (!user) {
      const userId = await ctx.db.insert("users", {
        email: args.email,
        userName: args.userName,
        imageUrl: args.imageUrl,
      });

      return {
        status: "created",
        message: "Inserted new user",
        userId,
      };
    }

    return {
      status: "exists",
      message: "User already exists",
      user,
    };
  },
});
