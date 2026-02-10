"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import Groq from "groq-sdk";

export const chatWithPdf = action({
  args: {
    userInput: v.string(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Initialize Groq INSIDE the handler
    // This ensures it only runs when the function is called, not at deployment time.
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set in the Convex Dashboard");
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    // 2. Fetch labeled context from ingest.js
    const context = await ctx.runAction(api.ingest.searchSimiliarChunks, {
      query: args.userInput,
      fileId: args.fileId,
    });

    const contextText = context || "No relevant context found in the document.";

    // 3. Optimized RAG Prompt for Llama 3.3 70B
    const systemPrompt = `
      You are a precise PDF research assistant. Your goal is to answer questions using ONLY the provided snippets.
      
      RULES:
      1. Every sentence that uses information from the context MUST end with a citation like [1], [2], etc.
      2. If multiple sources apply, use [1][3].
      3. If the answer is not in the context, strictly say: "I'm sorry, I couldn't find that information in the uploaded document."
      4. Do not mention "the provided context" or "source 1" in your prose; use the bracketed numbers.
      5. End your response with a "Sources Used" list.
    `;

    const userPrompt = `
      CONTEXT SNIPPETS:
      ${contextText}

      USER QUESTION: ${args.userInput}
    `;

    try {
      const result = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1, 
        max_tokens: 1024,
      });

      return result.choices[0]?.message?.content || "No response generated.";

    } catch (error) {
      console.error("Groq Generation Error:", error);
      if (error.status === 429) {
        return "The system is a bit busy. Please try again in a moment.";
      }
      return "I hit a snag communicating with the AI. Please verify your settings.";
    }
  },
});