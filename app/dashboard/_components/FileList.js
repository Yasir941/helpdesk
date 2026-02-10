"use client"
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { FileText, Eye, BrainCircuit, Loader2, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link"; 
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * UPDATED: FileList now accepts searchTerm as a prop to handle
 * the live filtering from the Header/Dashboard.
 */
function FileList({ searchTerm = "" }) {
    const { user } = useUser();
    const router = useRouter();
    const [loadingFileId, setLoadingFileId] = useState(null);
    
    // 1. Hook to trigger the AI generation
    const generateFlashcards = useAction(api.flashcards.generateFlashcards);

    // Fetching the user's files from the database
    const files = useQuery(api.filestorage.GetUserFiles, {
        userEmail: user?.primaryEmailAddress?.emailAddress ?? ""
    });

    /**
     * 🔍 FILTER LOGIC
     * Filter the files array based on the searchTerm passed from the parent.
     */
    const filteredFiles = files?.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle Study Card Click
    const handleStudyCards = async (file) => {
        setLoadingFileId(file.fileId);
        try {
            await generateFlashcards({
                fileId: file.fileId,
                userEmail: user?.primaryEmailAddress?.emailAddress,
                pdfText: "Extracting content from " + file.fileName + "..." 
            });
            
            router.push(`/dashboard/flashcards/${file.fileId}`);
        } catch (error) {
            console.error("Flashcard generation failed:", error);
        } finally {
            setLoadingFileId(null);
        }
    }

    // Loading State (Skeleton)
    if (files === undefined) return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-10">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 w-full bg-gray-100 animate-pulse rounded-2xl shadow-sm"></div>
            ))}
        </div>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mt-10">
            {filteredFiles?.length > 0 ? filteredFiles.map((file, index) => (
                <div key={index} className="flex flex-col p-5 border rounded-[2rem] hover:shadow-2xl hover:border-green-300 transition-all group bg-white relative">
                    {/* Icon Container */}
                    <div className="flex flex-col items-center justify-center cursor-pointer" 
                         onClick={() => router.push(`/workspace/${file.fileId}`)}>
                        <div className="p-4 bg-blue-50 rounded-2xl group-hover:bg-green-50 transition-colors">
                            <FileText className="w-10 h-10 text-blue-600 group-hover:text-green-600" />
                        </div>

                        {/* File Name */}
                        <h2 className="mt-4 font-bold text-sm text-center line-clamp-2 text-gray-800 h-10">
                            {file.fileName}
                        </h2>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-4">
                        <Link href={`/workspace/${file.fileId}`} className="w-full">
                            <Button variant="outline" size="sm" className="w-full border-slate-200 hover:bg-blue-600 hover:text-white transition-all rounded-xl">
                                <Eye className="w-4 h-4 mr-2" /> View
                            </Button>
                        </Link>

                        <Button 
                            onClick={() => handleStudyCards(file)}
                            disabled={loadingFileId === file.fileId}
                            size="sm" 
                            className="w-full bg-slate-900 hover:bg-green-600 text-white transition-all rounded-xl shadow-md"
                        >
                            {loadingFileId === file.fileId ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <BrainCircuit className="w-4 h-4 mr-2" />
                            )}
                            {loadingFileId === file.fileId ? "Generating..." : "Study Cards"}
                        </Button>
                    </div>
                </div>
            )) : (
                <div className="col-span-full text-center text-gray-400 py-20 border-2 border-dashed rounded-[2rem] bg-gray-50/50">
                    <SearchX className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">
                        {searchTerm ? `No matches found for "${searchTerm}"` : "No documents found."}
                    </p>
                </div>
            )}
        </div>
    );
}

export default FileList;