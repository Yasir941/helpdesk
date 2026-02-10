"use client";

import { Button } from '@/components/ui/button'
import { UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import dynamic from 'next/dynamic';
import { ChatPDF } from "./ChatPDF";

// Dynamically import PDFDownloadLink to prevent Next.js SSR errors
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

function WorkspaceHeader({ fileName, fileId, messages }) {
  const saveChat = useMutation(api.filestorage.SaveChatHistory);

  const handleSave = async () => {
    if (!fileId) return;
    try {
      await saveChat({
        fileId: fileId,
        messages: messages || [],
      });
      alert("✅ Chat saved successfully!");
    } catch (error) {
      console.error("Error saving chat:", error);
      alert("❌ Failed to save chat.");
    }
  };

  return (
    <div className='p-4 flex justify-between shadow-sm items-center border-b bg-white'>
      {/* Left: Logo and Filename */}
      <div className='flex gap-4 items-center'>
        <Link href={'/dashboard'}>
          <Image 
            src={'/logo.svg'} 
            alt='logo' 
            width={160}   // 🔥 Increased size for visibility
            height={70}   // 🔥 Increased size for visibility
            className='object-contain' 
          />
        </Link>
        <h2 className='font-bold text-xl truncate max-w-50 md:max-w-sm ml-2'>
          {fileName || 'Loading...'}
        </h2>
      </div>

      {/* Right: Action Buttons with Green Hover Effect */}
      <div className='flex gap-4 items-center'>
        
        {/* Save Changes Button */}
        <Button 
          onClick={handleSave} 
          variant="outline"
          className="hidden md:flex items-center gap-2 transition-all duration-300 hover:bg-green-300 hover:text-black hover:border-green-600"
        >
          Save Changes
        </Button>

        {/* Download PDF Button */}
        <PDFDownloadLink 
          document={<ChatPDF messages={messages || []} fileName={fileName} />} 
          fileName={`${fileName?.replace(/\s+/g, '_') || 'chat'}-history.pdf`}
        >
          {({ loading }) => (
            <Button 
              variant="outline" 
              disabled={loading} 
              className="flex items-center gap-2 transition-all duration-300 hover:bg-green-300 hover:text-black hover:border-green-600"
            >
              {loading ? "Preparing..." : "Download PDF"}
            </Button>
          )}
        </PDFDownloadLink>

        <UserButton />
      </div>
    </div>
  )
}

export default WorkspaceHeader;