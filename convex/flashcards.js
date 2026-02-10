import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

export const generateFlashcards = action({
  args: {
    fileId: v.string(),
    userEmail: v.string(),
    pdfText: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Call Groq AI using their specific endpoint
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, // Matches your GROQ_API_KEY in dashboard
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Powerful Groq model
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that generates study flashcards. Respond ONLY with a JSON array of objects containing 'front' and 'back' keys."
            },
            {
              role: "user",
              content: `Based on the following text, generate exactly 10 high-quality study flashcards. 
              Text: ${args.pdfText.slice(0, 10000)}`
            }
          ],
          // Groq supports JSON mode specifically
          response_format: { type: "json_object" },
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API Error:", errorText);
        throw new Error(`Groq API responded with status ${response.status}`);
      }

      const data = await response.json();
      
      // 2. Parse the content
      // Groq might return the array inside a root key like 'flashcards' if the prompt isn't strict
      const content = JSON.parse(data.choices[0].message.content);
      const aiResponse = Array.isArray(content) ? content : (content.flashcards || []);

      // 3. Save the real AI cards into your database
      for (const card of aiResponse) {
        await ctx.runMutation(api.flashcards.saveCard, {
          fileId: args.fileId,
          userEmail: args.userEmail,
          front: card.front,
          back: card.back,
        });
      }

      return "Success";
    } catch (error) {
      console.error("Groq Generation Error:", error);
      throw new Error("Failed to generate flashcards from Groq");
    }
  },
});

export const saveCard = mutation({
  args: {
    fileId: v.string(),
    userEmail: v.string(),
    front: v.string(),
    back: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("flashcards", args);
  },
});

export const getCardsByFileId = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_fileId", (q) => q.eq("fileId", args.fileId))
      .collect();
    return cards ?? [];
  },
});