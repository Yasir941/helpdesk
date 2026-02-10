"use client";
import React from "react";
import Image from "next/image";
import { 
  Layout, 
  Shield, 
  CalendarDays, 
  BrainCircuit, 
  GraduationCap, 
  TrendingUp,
  CloudUpload
} from "lucide-react"; 
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import UploadPdfDialog from "./UploadPdfDialog"; 
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";

function SideBar() {
  const path = usePathname();
  const { user, isLoaded } = useUser();

  const fileCount = useQuery(
    api.filestorage.GetUserFileCount, 
    user?.primaryEmailAddress?.emailAddress 
      ? { userEmail: user.primaryEmailAddress.emailAddress } 
      : "skip"
  ) ?? 0;

  const fileLimit = 5;
  const progressValue = (fileCount / fileLimit) * 100;

  const menuList = [
    {
      name: 'Workspace',
      icon: Layout,
      path: '/dashboard',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      name: 'Performance',
      icon: TrendingUp,
      path: '/dashboard/performance',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      name: 'Flashcards',
      icon: BrainCircuit,
      path: '/dashboard/flashcards',
      color: 'text-pink-600',
      bg: 'bg-pink-50'
    },
    {
      name: 'Quiz',
      icon: GraduationCap,
      path: '/dashboard/quiz',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      name: 'Schedule',
      icon: CalendarDays,
      path: '/dashboard/schedule',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      name: 'Upgrade',
      icon: Shield,
      path: '/dashboard/upgrade',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50'
    },
  ];

  if (!isLoaded) return null; 

  return (
    <div className="shadow-sm h-screen p-6 border-r bg-slate-50/50 backdrop-blur-md relative flex flex-col">
      <div className="flex justify-center mb-8">
         <Image src="/logo.svg" alt="logo" width={150} height={100} priority className="object-contain" />
      </div>

      <div className="space-y-6 flex-1">
        <UploadPdfDialog>
            <Button 
              className="w-full bg-slate-900 hover:bg-slate-800 transition-all text-white shadow-lg h-12 rounded-xl group"
              disabled={fileCount >= fileLimit} 
            >
              <CloudUpload className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Upload PDF
            </Button>
        </UploadPdfDialog>

        <nav className="space-y-1">
          {menuList.map((menu, index) => {
            const isActive = path === menu.path || (menu.path !== '/dashboard' && path.includes(menu.path));
            
            return (
              <Link href={menu.path} key={index}>
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex gap-3 items-center p-3.5 rounded-xl cursor-pointer transition-all relative group
                  ${isActive 
                    ? `${menu.bg} ${menu.color} shadow-sm border border-white` 
                    : "text-slate-500 hover:bg-white hover:text-slate-900"}`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-pill"
                      className={`absolute left-0 w-1 h-6 rounded-r-full ${menu.color.replace('text', 'bg')}`}
                    />
                  )}
                  <menu.icon className={`h-5 w-5 ${isActive ? menu.color : "group-hover:text-slate-900"}`} />
                  <h2 className="font-semibold text-sm">{menu.name}</h2>
                </motion.div>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Progress Card */}
      <div className="mt-auto pt-0">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">File Uploaded</span>
            <span className="text-[11px] font-bold text-slate-600">{fileCount}/{fileLimit}</span>
          </div>
          <Progress value={progressValue} className="h-1.5 bg-slate-100" />
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            {fileCount >= fileLimit 
              ? "Storage full. Upgrade to add more." 
              : "Upgrade now for unlimited PDF uploads."}
              
          </p>
        </div>
      </div>
    </div>
  );
}

export default SideBar;