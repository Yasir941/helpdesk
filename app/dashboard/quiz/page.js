"use client";
import React from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Loader2, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function QuizDashboard() {
  const { user } = useUser();
  
  // Fetch the same files as the workspace
  const fileList = useQuery(api.filestorage.GetUserFiles, {
    userEmail: user?.primaryEmailAddress?.emailAddress
  });

  if (fileList === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-green-600" />
      </div>
    );
  }

  return (
    <div className="p-10">
      <h2 className="font-bold text-3xl flex items-center gap-3">
        <GraduationCap className="h-8 w-8 text-green-600" />
        AI Quiz Hall
      </h2>
      <p className="text-gray-500">Select a document to test your knowledge.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
        {fileList?.length > 0 ? fileList.map((file, index) => (
          <div key={index} className="border p-5 rounded-2xl shadow-sm flex flex-col items-center bg-white hover:shadow-md transition-all">
            <Image src={'/file.svg'} alt='file' width={50} height={50} />
            <h2 className="font-medium text-lg mt-3 text-center line-clamp-1">{file.fileName}</h2>
            
            <Link href={'/dashboard/quiz/' + file.fileId} className="w-full mt-4">
              <Button className="w-full bg-slate-900 hover:bg-green-600">
                Start Quiz
              </Button>
            </Link>
          </div>
        )) : (
          <div className="col-span-full text-center p-10 border-2 border-dashed rounded-3xl">
            <p className="text-gray-400">No documents found. Upload a PDF in the workspace first!</p>
          </div>
        )}
      </div>
    </div>
  );
}