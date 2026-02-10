import { v } from "convex/values";
import { query } from "./_generated/server";

export const getDocumentText = query({
  args: { 
    fileId: v.string() 
  },
  handler: async (ctx, args) => {
    // 1. Fetch all document chunks using the standard index 'by_fileId'
    // This is much faster and prevents the "not a database index" error.
    const segments = await ctx.db
      .query("documents")
      .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
      .collect();

    // 2. Join the content of all chunks into one string
    // This provides the full context to your Groq AI model.
    const fullText = segments.map((doc) => doc.content).join(" ");

    return fullText;
  },
});