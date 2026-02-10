"use client"
import React, { useState } from 'react'
import { useParams } from 'next/navigation'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2Icon, Bot, User } from 'lucide-react'

// 🔥 NOTICE: We now accept messages and setMessages as props
function ChatInterface({ messages, setMessages }) {
    const { fileId } = useParams();
    const chatAction = useAction(api.myAction.chatWithPdf);
    
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);

    const onSendMessage = async () => {
        if (!userInput.trim()) return;

        const userQuery = userInput;
        setUserInput('');
        setLoading(true);
        
        // Add user message to SHARED state immediately
        setMessages(prev => [...prev, { role: 'user', content: userQuery }]);

        try {
            const aiResponse = await chatAction({ 
                userInput: userQuery, 
                fileId: fileId 
            });

            // Add AI response to SHARED state
            // Note: Ensuring role matches the schema ('assistant' vs 'ai')
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: "Sorry, I ran into an error processing that request." 
            }]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='flex flex-col h-[85vh] relative bg-white rounded-lg shadow-inner'>
            {/* Messages Area */}
            <div className='flex-1 overflow-y-auto p-5 space-y-4'>
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`p-2 rounded-full ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                            {msg.role === 'user' ? <User className='h-4 w-4 text-white'/> : <Bot className='h-4 w-4 text-gray-700'/>}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm max-w-[80%] shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-gray-100 text-gray-800 rounded-tl-none border'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className='flex items-center gap-2 text-gray-400 text-sm animate-pulse'>
                        <Loader2Icon className='h-4 w-4 animate-spin' />
                        AI is reading document...
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className='p-4 border-t bg-gray-50 rounded-b-lg'>
                <div className='flex gap-2 bg-white p-2 rounded-xl border shadow-sm'>
                    <Input 
                        placeholder='Ask a question...' 
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                        className='border-none focus-visible:ring-0'
                        disabled={loading}
                    />
                    <Button 
                        onClick={onSendMessage} 
                        disabled={loading || !userInput.trim()}
                        className='bg-blue-600 hover:bg-blue-700 rounded-lg h-10 w-10 p-0'
                    >
                        <Send className='h-4 w-4' />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default ChatInterface