import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const generateQuiz = action({
  args: {
    fileId: v.string(),
    userEmail: v.string(),
    pdfText: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Check if questions already exist to avoid double API costs
      const existing = await ctx.runQuery(api.quizzes.getQuizByFileId, { fileId: args.fileId });
      if (existing && existing.length > 0) return "Questions already exist";

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: "You are an expert educator. Generate 5 multiple-choice questions based on the text. Return ONLY a JSON object with a 'questions' array where each object has: 'question', 'options' (array of 4 strings), 'correctAnswer' (index 0-3), and 'explanation'."
            },
            {
              role: "user",
              content: `Text: ${args.pdfText.slice(0, 12000)}`
            }
          ],
          response_format: { type: "json_object" },
        }),
      });

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      const quizArray = content.questions || content;

      for (const q of quizArray) {
        await ctx.runMutation(api.quizzes.saveQuizQuestion, {
          fileId: args.fileId,
          userEmail: args.userEmail,
          ...q
        });
      }
      return "Success";
    } catch (e) {
      console.error(e);
      throw new Error("Quiz generation failed");
    }
  },
});

export const saveQuizQuestion = mutation({
  args: {
    fileId: v.string(),
    userEmail: v.string(),
    question: v.string(),
    options: v.array(v.string()),
    correctAnswer: v.number(),
    explanation: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("quizzes", args);
  },
});

export const getQuizByFileId = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("quizzes")
      .withIndex("by_fileId", q => q.eq("fileId", args.fileId))
      .collect();
  },
});

// --- PERFORMANCE TRACKING FUNCTIONS ---

export const saveQuizResult = mutation({
  args: {
    fileId: v.string(),
    userEmail: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
    percentage: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("quizResults", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getUserStats = query({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_userEmail", (q) => q.eq("userEmail", args.userEmail))
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userEmail))
      .collect();

    return {
      results: results || [],
      tasks: tasks || []
    };
  },
});

/**
 * NEW: Useful for your "Helpdesk/Admin" features to 
 * clear out old performance data if needed.
 */
export const clearUserHistory = mutation({
  args: { userEmail: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("quizResults")
      .withIndex("by_userEmail", (q) => q.eq("userEmail", args.userEmail))
      .collect();
    
    for (const result of results) {
      await ctx.db.delete(result._id);
    }
  },
});