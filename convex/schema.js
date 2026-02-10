import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // 1. User profiles
  users: defineTable({
    userName: v.string(),
    email: v.string(),
    imageUrl: v.string(),
  }).index('by_email', ['email']),

  // 2. Uploaded PDF files
  pdfFiles: defineTable({
    fileId: v.string(),
    storageId: v.id("_storage"), 
    fileName: v.string(),
    createdBy: v.string(),
  }).index('by_createdBy', ['createdBy']),

  // 3. PDF text chunks for Vector Search & Highlighting
  documents: defineTable({
    fileId: v.string(), 
    content: v.string(), 
    embedding: v.array(v.float64()), 
    pageNumber: v.optional(v.number()), 
    metadata: v.optional(v.any()), 
  })
  .vectorIndex("byEmbedding", {
    vectorField: "embedding",
    dimensions: 384, 
    filterFields: ["fileId"], 
  })
  .index("by_fileId", ["fileId"]),

  // 4. Saved Chat History
  chatHistories: defineTable({
    fileId: v.string(),
    messages: v.array(
      v.object({
        role: v.string(), 
        content: v.string(),
      })
    ),
    timestamp: v.number(),
  }).index('by_fileId', ['fileId']),

  // 5. Tasks (General assignments/notes)
  tasks: defineTable({
    userId: v.string(), // Matches userEmail
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.number(), 
    type: v.string(), 
    priority: v.string(), 
    isCompleted: v.boolean(),
  }).index("by_userId", ["userId"]),

  // 6. Schedules (Specific for your Study Dashboard UI)
  schedules: defineTable({
    userId: v.string(),
    title: v.string(),
    subject: v.string(),
    time: v.string(), 
    date: v.string(), 
    isCompleted: v.boolean(),
  }).index("by_userId", ["userId"]),

  // 7. Flashcards (AI-Generated Q&A)
  flashcards: defineTable({
    fileId: v.string(), 
    userEmail: v.string(),
    front: v.string(),
    back: v.string(),
  }).index("by_fileId", ["fileId"]),

  // 8. Quizzes (AI-Generated Multiple Choice Questions)
  quizzes: defineTable({
    fileId: v.string(),
    userEmail: v.string(),
    question: v.string(),
    options: v.array(v.string()), 
    correctAnswer: v.number(),    
    explanation: v.string(),      
  }).index("by_fileId", ["fileId"]),

  // 9. NEW: Performance Tracking (Stores quiz outcomes)
  quizResults: defineTable({
    fileId: v.string(),
    userEmail: v.string(),
    score: v.number(),          // Number of correct answers
    totalQuestions: v.number(),  // Total number of questions
    percentage: v.number(),     // Final percentage (e.g., 85)
    timestamp: v.number(),      // Date.now()
  }).index("by_userEmail", ["userEmail"]),
});