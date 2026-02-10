"use client";
import React from 'react';
import { motion } from 'framer-motion';

// Now accepting isFlipped and setIsFlipped from parent props
export default function FlashcardItem({ card, isFlipped, setIsFlipped }) {
  
  return (
    <div 
      className="perspective-1000 w-full h-87.5 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-full shadow-2xl rounded-[2.5rem]"
      >
        {/* Front Side */}
        <div 
          className="absolute inset-0 backface-hidden bg-white dark:bg-slate-900 border-2 border-green-100 dark:border-green-900 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center"
        >
          <span className="text-xs font-bold uppercase tracking-widest text-green-500 mb-4">Question</span>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {card.front}
          </h2>
          <p className="mt-8 text-slate-400 text-sm italic">Click to reveal answer</p>
        </div>

        {/* Back Side */}
        <div 
          style={{ transform: "rotateY(180deg)" }}
          className="absolute inset-0 backface-hidden bg-green-500 rounded-[2.5rem] flex flex-col items-center justify-center p-10 text-center text-white"
        >
          <span className="text-xs font-bold uppercase tracking-widest opacity-70 mb-4">Answer</span>
          <p className="text-xl font-medium leading-relaxed">
            {card.back}
          </p>
        </div>
      </motion.div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </div>
  );
}