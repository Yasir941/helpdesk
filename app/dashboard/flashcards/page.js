"use client";
import React from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { BrainCircuit, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function FlashcardsHub() {
  const { user } = useUser();
  const files = useQuery(api.filestorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress ?? ""
  });

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold text-slate-800">Your Study Sets</h2>
      <p className="text-slate-500 mt-2">Select a document to start practicing your flashcards.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {files?.map((file, index) => (
          <Link href={`/dashboard/flashcards/${file.fileId}`} key={index}>
            <div className="p-6 border rounded-2xl bg-white hover:shadow-xl hover:border-green-400 transition-all group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl group-hover:bg-green-100 transition-colors">
                  <BrainCircuit className="text-green-600 h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 line-clamp-1">{file.fileName}</h3>
                  <p className="text-xs text-slate-400 italic">Click to practice</p>
                </div>
              </div>
              <ArrowRight className="text-slate-300 group-hover:text-green-600 transition-colors" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}