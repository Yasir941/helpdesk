import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const generateUploadURL = mutation({
  args: {},
  handler: async (ctx) => await ctx.storage.generateUploadUrl(),
});

export const AddFileEntryToDb = mutation({
  args: {
    fileId: v.string(),
    storageId: v.id("_storage"),
    fileName: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('pdfFiles', {
      fileId: args.fileId,
      fileName: args.fileName,
      storageId: args.storageId,
      createdBy: args.createdBy,
    });
  },
});

/**
 * 🔥 NEW: GetUserFileCount
 * Returns the total count of files for a specific user.
 * Used to calculate the percentage for the Progress Bar.
 */
export const GetUserFileCount = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    if (!args.userEmail) return 0;
    const result = await ctx.db
      .query("pdfFiles")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userEmail))
      .collect();
    return result.length;
  },
});

/**
 * 🔥 NEW: deletePdf
 * Deletes the record and the storage file so the progress bar updates.
 */
export const deletePdf = mutation({
  args: { 
    id: v.id("pdfFiles"),
    storageId: v.id("_storage") 
  },
  handler: async (ctx, args) => {
    // We don't need a strict auth check here if you're using dev_user_123,
    // but we ensure we delete both the storage and the DB entry.
    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.id);
  },
});

export const GetFileRecord = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("pdfFiles")
      .filter((q) => q.eq(q.field("fileId"), args.fileId))
      .unique(); 
    
    if (!result) return null;
    const url = await ctx.storage.getUrl(result.storageId);
    return { ...result, fileUrl: url };
  },
});

export const GetUserFiles = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    if (!args.userEmail) return [];
    return await ctx.db
      .query("pdfFiles")
      .withIndex("by_createdBy", (q) => q.eq("createdBy", args.userEmail))
      .order("desc") 
      .collect();
  },
});

export const fetchResultsByIds = query({
  args: { ids: v.array(v.id("documents")) },
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.ids) {
      const doc = await ctx.db.get(id);
      if (doc) {
        results.push(doc);
      }
    }
    return results;
  },
});

export const SaveChunks = mutation({
  args: {
    fileId: v.string(),
    content: v.string(),
    embedding: v.array(v.float64()),
    pageNumber: v.optional(v.number()), 
  },
  handler: async (ctx, args) => {
    if (!args.embedding || args.embedding.length === 0) {
      console.error(`⚠️ SaveChunks failed: Empty embedding for file ${args.fileId}`);
      return { success: false, error: "Empty embedding" };
    }

    try {
      const docId = await ctx.db.insert("documents", {
        fileId: args.fileId,
        content: args.content,
        embedding: args.embedding,
        pageNumber: args.pageNumber,
      });

      console.log(`✅ Saved chunk ${docId} for file ${args.fileId}`);
      return { success: true, docId };
    } catch (err) {
      console.error("❌ Database Insert Error:", err);
      throw new Error("Failed to insert chunk into documents table");
    }
  },
});

export const SaveChatHistory = mutation({
  args: {
    fileId: v.string(),
    messages: v.array(
      v.object({
        role: v.string(), 
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("chatHistories", {
      fileId: args.fileId,
      messages: args.messages,
      timestamp: Date.now(),
    });
    return id;
  },
});

export const GetChatHistory = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatHistories")
      .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
      .order("desc")
      .first();
  },
});