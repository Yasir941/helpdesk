"use client"
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import WorkspaceHeader from '../_components/WorkspaceHeader';
import ChatInterface from '../_components/ChatInterface';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function Workspace() {
    const { fileId } = useParams();
    
    // 1. Lifted State: Messages now live here
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! How can I help you with this document today?' }
    ]);

    // 2. Fetch file details
    const fileInfo = useQuery(api.filestorage.GetFileRecord, {
        fileId: fileId
    });

    // 3. Optional: Auto-load previous chat history from DB
    const existingChat = useQuery(api.filestorage.GetChatHistory, { fileId });
    
    useEffect(() => {
        if (existingChat?.messages) {
            setMessages(existingChat.messages);
        }
    }, [existingChat]);

    return (
        <div className='bg-gray-50 min-h-screen'>
            {/* 4. Pass fileName, fileId, and messages to the Header */}
            <WorkspaceHeader 
                fileName={fileInfo?.fileName} 
                fileId={fileId} 
                messages={messages} 
            />
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5 p-5'>
                {/* Left Side: PDF Viewer */}
                <div className='h-[85vh] border rounded-lg shadow-sm overflow-hidden bg-white'>
                    {fileInfo?.fileUrl ? (
                        <iframe 
                            src={fileInfo.fileUrl + "#toolbar=0"} 
                            width='100%' 
                            height='100%' 
                            className='border-none'
                            title="PDF Viewer"
                        />
                    ) : (
                        <div className='h-full w-full bg-gray-50 animate-pulse flex items-center justify-center'>
                            <p className='text-gray-400'>Loading PDF Viewer...</p>
                        </div>
                    )}
                </div>

                {/* Right Side: AI Chat Interface */}
                <div className='h-[85vh] border rounded-lg shadow-sm bg-white overflow-hidden'>
                    {/* 5. Pass messages and setMessages to the ChatInterface */}
                    <ChatInterface 
                        fileId={fileId} 
                        messages={messages} 
                        setMessages={setMessages} 
                    />
                </div>
            </div>
        </div>
    )
}

export default Workspace