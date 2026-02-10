"use client";
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2, CheckCircle2, ChevronRight, Trophy, BrainCircuit, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "@clerk/nextjs";

/** * FIX: Using absolute alias '@' to ensure the module is found 
 * regardless of the nested folder depth.
 */
import { notify } from '@/app/dashboard/_components/Header'; 

export default function QuizSession() {
  const { fileId } = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  // Queries & Actions
  const quizData = useQuery(api.quizzes.getQuizByFileId, { fileId });
  const documentText = useQuery(api.documents.getDocumentText, { fileId });
  const generateQuizAction = useAction(api.quizzes.generateQuiz);
  
  // Mutation to save results
  const saveResult = useMutation(api.quizzes.saveQuizResult);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    notify("AI Quiz", "Analyzing document and generating questions...", "quiz");
    
    try {
      await generateQuizAction({
        fileId: fileId,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        pdfText: documentText || "No text found",
      });
      notify("Quiz Ready!", "Your custom AI quiz has been created.", "quiz");
    } catch (e) {
      console.error(e);
      notify("Generation Failed", "Could not create quiz from this PDF.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const handleOptionSelect = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);
    if (index === currentQuestion.correctAnswer) setScore(prev => prev + 1);
  };

  const nextQuestion = async () => {
    if (currentIndex < quizData.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setSaving(true);
      const percentage = Math.round((score / quizData.length) * 100);
      try {
        await saveResult({
          fileId: fileId,
          userEmail: user?.primaryEmailAddress?.emailAddress,
          score: score,
          totalQuestions: quizData.length,
          percentage: percentage,
        });

        notify(
          "Quiz Finished! 🏆", 
          `You scored ${percentage}%! Your progress has been updated.`, 
          percentage >= 70 ? "quiz" : "default"
        );

        setShowResult(true);
      } catch (error) {
        console.error("Failed to save result:", error);
        setShowResult(true); 
      } finally {
        setSaving(false);
      }
    }
  };

  if (quizData === undefined) return <LoadingScreen message="Loading Quiz..." />;

  if (quizData.length === 0) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-8 bg-white rounded-2xl shadow-lg border max-w-sm mx-4"
        >
          <Sparkles className="h-12 w-12 text-green-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-bold mb-2">Ready to test yourself?</h2>
          <p className="text-gray-500 mb-6 text-sm">AI will analyze your PDF and create challenging questions.</p>
          <Button 
            onClick={handleGenerate} 
            disabled={generating}
            className="w-full bg-black hover:bg-green-600 h-12 rounded-xl transition-all"
          >
            {generating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing PDF...</>
            ) : (
              "Generate Quiz ✨"
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quizData[currentIndex];

  if (showResult) {
    return <QuizResult score={score} total={quizData.length} onHome={() => router.push('/dashboard/performance')} />;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progress</p>
            <h2 className="text-sm font-bold text-slate-700">Question {currentIndex + 1} of {quizData.length}</h2>
          </div>
          <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-lg text-xs border border-green-100">
            Score: {score}
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-green-500" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / quizData.length) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex} 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-slate-100"
        >
          <h1 className="text-lg md:text-xl font-semibold text-slate-800 mb-6 leading-tight">
            {currentQuestion.question}
          </h1>
          
          <div className="grid gap-3">
            {currentQuestion.options.map((option, index) => {
              const isCorrect = index === currentQuestion.correctAnswer;
              const isSelected = selectedOption === index;
              let btnClass = "border-slate-200 hover:bg-slate-50";
              
              if (isAnswered) {
                if (isCorrect) btnClass = "bg-green-500 border-green-500 text-white shadow-md shadow-green-100";
                else if (isSelected) btnClass = "bg-red-500 border-red-500 text-white shadow-md shadow-red-100";
                else btnClass = "opacity-40 border-slate-100 grayscale-[0.5]";
              }

              return (
                <motion.button 
                  key={index} 
                  whileHover={!isAnswered ? { x: 4 } : {}}
                  onClick={() => handleOptionSelect(index)} 
                  disabled={isAnswered} 
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all text-sm font-medium flex justify-between items-center ${btnClass}`}
                >
                  {option}
                  {isAnswered && isCorrect && <CheckCircle2 className="h-4 w-4" />}
                </motion.button>
              );
            })}
          </div>

          {isAnswered && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200"
            >
              <div className="flex items-center gap-2 mb-1">
                <BrainCircuit className="h-3.5 w-3.5 text-slate-500" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">Explanation</p>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{currentQuestion.explanation}</p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex justify-end">
        <Button 
          disabled={!isAnswered || saving} 
          onClick={nextQuestion} 
          className="h-11 px-8 rounded-xl bg-slate-900 hover:bg-green-600 transition-all text-sm"
        >
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <>{currentIndex === quizData.length - 1 ? "Finish Quiz" : "Next Question"} <ChevronRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </div>
  );
}

function LoadingScreen({ message }) {
  return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function QuizResult({ score, total, onHome }) {
  return (
    <div className="flex items-center justify-center p-6 h-[80vh]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center border"
      >
        <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-1">Quiz Completed!</h1>
        <p className="text-slate-400 text-xs mb-6">Your data has been saved to your performance profile.</p>
        <div className="text-5xl font-black text-green-500 mb-8">
          {Math.round((score / total) * 100)}%
        </div>
        <Button onClick={onHome} className="w-full h-12 rounded-xl bg-slate-900">
          View My Progress
        </Button>
      </motion.div>
    </div>
  );
}