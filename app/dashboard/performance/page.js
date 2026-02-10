"use client";
import React from 'react';
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { LineChart, BarChart, Activity, CheckCircle, Target, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PerformanceTracker() {
  const { user } = useUser();
  const stats = useQuery(api.quizzes.getUserStats, { 
    userEmail: user?.primaryEmailAddress?.emailAddress || "" 
  });

  if (!stats) return <div className="p-10 text-center text-slate-400">Loading your progress...</div>;

  const avgScore = stats.results.length > 0 
    ? Math.round(stats.results.reduce((acc, curr) => acc + curr.percentage, 0) / stats.results.length)
    : 0;

  const completedTasks = stats.tasks.filter(t => t.isCompleted).length;

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Performance Tracking</h1>
        <p className="text-slate-500">Real-time insights into your learning journey.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard icon={<Target className="text-blue-600" />} label="Avg. Quiz Score" value={`${avgScore}%`} color="bg-blue-50" />
        <StatCard icon={<CheckCircle className="text-green-600" />} label="Tasks Completed" value={completedTasks} color="bg-green-50" />
        <StatCard icon={<Activity className="text-purple-600" />} label="Study Sessions" value={stats.results.length} color="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quiz History List */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-slate-400" />
            <h2 className="font-bold text-slate-800">Recent Quiz Activity</h2>
          </div>
          <div className="space-y-4">
            {stats.results.reverse().slice(0, 5).map((result, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Attempt #{stats.results.length - i}</p>
                  <p className="text-[10px] text-slate-400 uppercase">{new Date(result.timestamp).toLocaleDateString()}</p>
                </div>
                <div className={`font-black ${result.percentage >= 70 ? 'text-green-500' : 'text-orange-500'}`}>
                  {result.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task Efficiency */}
        <div className="bg-slate-900 p-6 rounded-3xl text-white">
          <h2 className="text-lg font-bold mb-2">Your helpdesk score</h2>
          <p className="text-slate-400 text-sm mb-6">Based on your recent quiz scores and task completion.</p>
          <div className="flex items-center justify-center py-6">
            <div className="relative h-32 w-32">
              <svg className="h-full w-full" viewBox="0 0 36 36">
                <path className="text-slate-800" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-green-500" strokeDasharray={`${avgScore}, 100`} strokeWidth="3" strokeLinecap="round" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-black">
                {avgScore}%
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4 italic">"Keep it up! Your retention is higher than average."</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>{icon}</div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{label}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </motion.div>
  );
}