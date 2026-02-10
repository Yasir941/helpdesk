"use node";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

/**
 * 1. Process PDF: Splits text and saves vectors
 */
export const processPdf = action({
  args: {
    storageId: v.id("_storage"),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    const fileUrl = await ctx.storage.getUrl(args.storageId);
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const loader = new WebPDFLoader(blob);
    const docs = await loader.load();
    const pdfTextContent = docs.map(doc => doc.pageContent).join(" ");

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 600,
      chunkOverlap: 50,
    });
    const outputChunks = await splitter.splitText(pdfTextContent);

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
      model: "sentence-transformers/all-MiniLM-L6-v2", 
    });

    console.log(`Vectorizing ${outputChunks.length} chunks for fileId: ${args.fileId}`);

    for (let i = 0; i < outputChunks.length; i++) {
      try {
        const [vector] = await embeddings.embedDocuments([outputChunks[i]]);

        await ctx.runMutation(api.filestorage.SaveChunks, {
          fileId: args.fileId,
          content: outputChunks[i],
          embedding: vector
        });

      } catch (error) {
        console.error(`Failed at chunk ${i}:`, error.message);
        throw new Error(`Ingestion failed: ${error.message}`);
      }
    }
    console.log("✅ Ingestion complete.");
    return "PDF processed successfully.";
  },
});

/**
 * 2. Search Similar Chunks: UPDATED FOR CITATIONS
 */
export const searchSimiliarChunks = action({
  args: {
    query: v.string(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`🔎 Searching for: "${args.query}" in file: ${args.fileId}`);

    const embeddings = new HuggingFaceInferenceEmbeddings({
      apiKey: process.env.HUGGINGFACEHUB_API_TOKEN,
      model: "sentence-transformers/all-MiniLM-L6-v2",
    });

    const vector = await embeddings.embedQuery(args.query);

    const searchResults = await ctx.vectorSearch("documents", "byEmbedding", {
      vector: vector,
      filter: (q) => q.eq("fileId", args.fileId),
      limit: 5,
    });

    if (searchResults.length === 0) {
      return "No relevant information found in the document.";
    }

    const fullDocuments = await ctx.runQuery(api.filestorage.fetchResultsByIds, {
      ids: searchResults.map((result) => result._id),
    });

    // 🔥 THE FIX FOR CITATIONS:
    // Map through documents and label each one so the AI knows which is which.
    const contextWithCitations = fullDocuments
      .map((doc, index) => {
        return `--- SOURCE [${index + 1}] ---\n${doc.content}\n`;
      })
      .join("\n");
    
    console.log(`📄 Labeled context created with ${fullDocuments.length} sources.`);
    return contextWithCitations;
  },
});