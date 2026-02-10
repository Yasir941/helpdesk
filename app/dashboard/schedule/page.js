"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Clock, PlusCircle, Calendar as CalendarIcon, 
  BookOpen, Sparkles, Loader2, BellOff 
} from 'lucide-react';

/** * FIX: Switched from relative './Header' to absolute alias '@'
 * This ensures Turbopack can resolve the module correctly.
 */
import { notify } from '@/app/dashboard/_components/Header'; 

export default function SchedulePage() {
  const [isOpen, setIsOpen] = useState(false);
  
  const sessions = useQuery(api.schedules.getUserSchedules);
  const saveSchedule = useMutation(api.schedules.createSchedule);
  const cancelReminder = useMutation(api.schedules.deleteSchedule);

  const handleAddSession = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title");
    const time = formData.get("time");

    try {
      await saveSchedule({
        title: title,
        subject: formData.get("subject"),
        time: time,
        date: formData.get("date"),
      });
      
      // LIVE NOTIFICATION: Schedule Created
      notify("Reminder Set", `"${title}" scheduled for ${time}`, "schedule");
      
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save:", error);
      notify("Schedule Error", "Failed to create reminder. Try again.", "error");
    }
  };

  const handleCancelReminder = async (id, title) => {
    try {
      await cancelReminder({ id });
      // LIVE NOTIFICATION: Reminder Deleted
      notify("Reminder Removed", `"${title}" has been deleted.`, "schedule");
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const getStatusStyles = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInHours = (date - now) / (1000 * 60 * 60);

    if (diffInHours < 0) return { 
        label: "Overdue", 
        variant: "destructive", 
        glow: "border-l-rose-500 bg-rose-50/50 shadow-rose-100",
        icon: "text-rose-500"
    };
    if (diffInHours < 24) return { 
        label: "Urgent", 
        variant: "default", 
        glow: "border-l-amber-500 bg-amber-50/50 shadow-amber-100",
        icon: "text-amber-500"
    };
    return { 
        label: "Upcoming", 
        variant: "secondary", 
        glow: "border-l-indigo-500 bg-indigo-50/50 shadow-indigo-100",
        icon: "text-indigo-500"
    };
  };

  if (sessions === undefined) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-10 bg-[#fafafa] p-6 md:p-10">
      {/* HEADER SECTION */}
      <div className="relative overflow-hidden rounded-[2.5rem] border bg-white p-10 shadow-sm transition-all hover:shadow-md">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-50/50 blur-3xl"></div>
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Image 
                src="/logo1.svg" 
                alt="logo" 
                width={48} 
                height={48}
              />
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-800">helpdesk reminder</h1>
                <div className="h-1 w-12 rounded-full bg-green-600 mt-1"></div>
              </div>
              <Sparkles className="h-6 w-6 animate-pulse text-amber-400 fill-amber-400" />
            </div>
            <p className="max-w-md text-lg font-medium leading-relaxed text-slate-500">
              Stay ahead of the curve with your smart tracker. 🚀
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="group h-16 rounded-2xl bg-emerald-300/85 px-10 text-md font-bold text-slate transition-all hover:scale-105 hover:bg-blue-200 active:scale-95 shadow-2xl shadow-slate-200">
                <PlusCircle className="mr-3 h-6 w-6 transition-transform group-hover:rotate-90" />
                Add New Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-none shadow-2xl rounded-3xl">
              <DialogHeader><DialogTitle className="text-2xl font-black">Create Task</DialogTitle></DialogHeader>
              <form onSubmit={handleAddSession} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label className="ml-1 font-bold">Task Title</Label>
                  <Input name="title" className="h-12 rounded-2xl bg-slate-50" placeholder="e.g. Final Thesis Prep" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="ml-1 font-bold">Time</Label>
                    <Input name="time" className="h-12 rounded-2xl bg-slate-50" placeholder="02:00 PM" required />
                  </div>
                  <div className="space-y-2">
                    <Label className="ml-1 font-bold">Date</Label>
                    <Input name="date" type="date" className="h-12 rounded-2xl bg-slate-50" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="ml-1 font-bold">Subject</Label>
                  <Input name="subject" className="h-12 rounded-2xl bg-slate-50" placeholder="e.g. Computer Science" required />
                </div>
                <Button type="submit" className="h-14 w-full rounded-2xl bg-emerald-400 text-lg font-bold shadow-lg">Schedule Now</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => {
          const style = getStatusStyles(session.date);
          return (
            <Card key={session._id} className={`group relative overflow-hidden rounded-[2rem] border-none border-l-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${style.glow}`}>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-2 font-bold text-slate-400 text-xs tracking-widest uppercase">
                  <CalendarIcon className="h-4 w-4" />
                  {new Date(session.date).toLocaleDateString()}
                </div>
                <Badge className="rounded-full px-3 py-1 font-black shadow-sm" variant={style.variant}>{style.label}</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <h3 className="text-2xl font-black leading-tight text-slate-800">{session.title}</h3>
                <div className="flex flex-wrap gap-3">
                   <div className="flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm border border-white/50">
                    <BookOpen className={`h-4 w-4 ${style.icon}`} /> {session.subject}
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 shadow-sm border border-white/50">
                    <Clock className={`h-4 w-4 ${style.icon}`} /> {session.time}
                  </div>
                </div>
                
                <div className="pt-4 mt-2 border-t border-slate-200/50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300">
                  <Button 
                    variant="ghost" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelReminder(session._id, session.title);
                    }}
                    className="relative z-30 w-full justify-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl font-bold py-6 transition-all active:scale-95"
                  >
                    <BellOff className="h-4 w-4" />
                    Cancel Reminder
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}