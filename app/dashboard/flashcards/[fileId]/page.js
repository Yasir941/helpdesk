"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Added useRouter
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, ChevronLeft, ChevronRight, BrainCircuit } from 'lucide-react';
import FlashcardItem from '../../_components/FlashcardItem';
import { Button } from '@/components/ui/button';

export default function FlashcardSession() {
  const { fileId } = useParams();
  const router = useRouter(); // Initialize router for navigation
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false); // State lifted here to control flip

  // 1. Fetch data from Convex
  const flashcards = useQuery(api.flashcards.getCardsByFileId, { fileId });

  // 2. Loading State
  if (flashcards === undefined) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin h-12 w-12 text-green-600" />
          <p className="text-slate-500 font-medium animate-pulse">Loading your study set...</p>
        </div>
      </div>
    );
  }

  // 3. Empty State
  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-sm border flex flex-col items-center">
            <BrainCircuit className="h-16 w-16 text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800">No cards found!</h2>
            <p className="text-slate-500 mt-2 max-w-xs">
                Go back to your Workspace and click "Study Cards" to let AI generate them for you.
            </p>
        </div>
      </div>
    );
  }

  // 4. Navigation Logic
  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setIsFlipped(false); // Reset flip state before moving to next
      setCurrentIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setIsFlipped(false); // Reset flip state before moving back
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    router.push('/dashboard'); // Take user back to the main dashboard
  };

  const progressPercentage = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        
        {/* Header & Progress */}
        <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">Study Session</h1>
                    <p className="text-slate-500 font-medium mt-1">Mastering your document</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-green-600">{currentIndex + 1}</span>
                    <span className="text-slate-400 font-bold text-lg"> / {flashcards.length}</span>
                </div>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-green-500 transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>

        {/* The Card Component - Now controlled by parent state */}
        <div className="mb-10">
            <FlashcardItem 
                card={flashcards[currentIndex]} 
                isFlipped={isFlipped} 
                setIsFlipped={setIsFlipped}
            />
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between gap-6">
          <Button 
            onClick={prevCard} 
            disabled={currentIndex === 0}
            variant="outline" 
            className="flex-1 h-16 rounded-2xl border-2 hover:bg-white text-lg font-semibold disabled:opacity-30"
          >
            <ChevronLeft className="mr-2 h-6 w-6" /> Previous
          </Button>

          {currentIndex === flashcards.length - 1 ? (
            <Button 
                onClick={handleFinish}
                className="flex-1 h-16 rounded-2xl bg-slate-900 hover:bg-green-600 text-white text-lg font-semibold transition-all shadow-xl hover:shadow-green-200"
            >
                Finished! Back to Workspace
                <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          ) : (
            <Button 
                onClick={nextCard} 
                className="flex-1 h-16 rounded-2xl bg-slate-900 hover:bg-green-600 text-white text-lg font-semibold transition-all shadow-xl hover:shadow-green-200"
            >
                Next <ChevronRight className="ml-2 h-6 w-6" />
            </Button>
          )}
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm">
            Pro Tip: You can click the card to flip it and reveal the answer!
        </p>
      </div>
    </div>
  );
}