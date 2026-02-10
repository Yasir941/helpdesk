"use client"
import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadCloud, FileText, X, Loader2Icon } from 'lucide-react'
import { useMutation, useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import uuid4 from 'uuid4'
import { useUser } from '@clerk/nextjs'
import { notify } from './Header' // <-- Import the notify helper

function UploadPdfDialog({ children }) {
    // Convex Hooks
    const generateUploadURL = useMutation(api.filestorage.generateUploadURL);
    const addFileEntry = useMutation(api.filestorage.AddFileEntryToDb);
    const processPdf = useAction(api.ingest.processPdf); 
    
    const { user } = useUser(); 
    
    // State Management
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration errors
    useEffect(() => {
        setMounted(true);
    }, []);

    const onFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setFileName(selectedFile.name.replace(".pdf", ""));
        }
    }

    const OnUpload = async () => {
        setLoading(true);
        try {
            // 1. Get authenticated upload URL
            const postUrl = await generateUploadURL();

            // 2. POST the file
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            const { storageId } = await result.json();
            const fileId = uuid4(); 
            
            // 3. Save metadata
            await addFileEntry({
                fileId: fileId,
                storageId: storageId,
                fileName: fileName ?? 'Untitled File',
                createdBy: user?.primaryEmailAddress?.emailAddress
            });
            
            // 4. Trigger AI Notification (LIVE)
            notify("Upload Started", `Processing "${fileName}" with AI...`, "pdf");

            // 5. Trigger AI Ingestion
            await processPdf({ 
                storageId: storageId,
                fileId: fileId 
            });

            // 6. Success Notification
            notify("File Ready", `"${fileName}" is ready for your questions!`, "quiz");

            // 7. Reset UI State
            setLoading(false);
            setOpen(false); 
            setFile(null); 
            setFileName("");

        } catch (error) {
            setLoading(false);
            notify("Upload Failed", "Something went wrong while processing your PDF.", "error");
            console.error("Upload process failed:", error);
        }
    }

    const resetSelection = (e) => {
        e.preventDefault();
        setFile(null);
        setFileName("");
    };

    if (!mounted) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-106.25">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-800">Upload PDF</DialogTitle>
                    <DialogDescription className="text-gray-500">
                        Upload your document to start asking questions.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="mt-4 space-y-5">
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Select PDF</Label>
                        <div className="relative group">
                            <label 
                                htmlFor="file-upload" 
                                className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl transition-all cursor-pointer
                                ${file ? 'border-green-200 bg-green-50/50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-blue-400'}`}
                            >
                                <div className="flex flex-col items-center justify-center">
                                    {file ? (
                                        <div className="flex flex-col items-center animate-in zoom-in duration-300 px-4 text-center">
                                            <FileText className="w-10 h-10 text-green-600 mb-2" />
                                            <p className="text-sm font-medium text-green-800 truncate max-w-70">{file.name}</p>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
                                            <p className="text-sm text-gray-700 font-medium">Click to upload PDF</p>
                                        </>
                                    )}
                                </div>
                                <input 
                                    id="file-upload" 
                                    type="file" 
                                    accept=".pdf" 
                                    className="hidden" 
                                    onChange={onFileSelect}
                                    disabled={loading}
                                />
                            </label>

                            {file && !loading && (
                                <button
                                    onClick={resetSelection}
                                    className="absolute -top-2 -right-2 bg-white border shadow-md rounded-full p-1 hover:bg-red-50 hover:text-red-600 transition-all"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="file-name" className="text-sm font-semibold text-gray-700">Display Name</Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input 
                                id="file-name" 
                                placeholder="E.g. Project Proposal" 
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                className="pl-10 h-11 border-gray-200 focus-visible:ring-blue-500 transition-all"
                                disabled={loading}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <DialogClose asChild>
                        <Button variant="outline" className="font-medium" disabled={loading}>
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button 
                        onClick={OnUpload}
                        className="font-medium px-6 min-w-30 bg-blue-600 hover:bg-blue-700" 
                        disabled={!file || !fileName || loading}
                    >
                        {loading ? (
                            <div className='flex items-center gap-2'>
                                <Loader2Icon className='animate-spin h-4 w-4' />
                                Processing...
                            </div>
                        ) : 'Upload Now'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default UploadPdfDialog;