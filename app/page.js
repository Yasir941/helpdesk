"use client";
import React, { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser, SignInButton } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, useScroll, useSpring } from "framer-motion";
import { 
  Zap, BrainCircuit, Shield, ArrowRight, Sparkles, Star, 
  Menu, X, Moon, Sun, Play, Twitter, Github, Linkedin, Mail 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// --- ENHANCED MULTI-LAYER FALLING STARS ---
const BackgroundStars = () => {
  const starData = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const type = Math.random() > 0.8 ? 'streak' : Math.random() > 0.4 ? 'shining' : 'distant';
      return {
        id: i,
        type,
        left: `${Math.random() * 100}%`,
        size: type === 'streak' ? 2 : type === 'shining' ? 3 : 1.5,
        duration: type === 'streak' ? Math.random() * 2 + 1.5 : Math.random() * 5 + 4,
        delay: Math.random() * 15,
        drift: Math.random() * 100 - 50, // Individual horizontal drift
      };
    });
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-transparent">
      {starData.map((star) => (
        <motion.div
          key={star.id}
          initial={{ top: "-10%", opacity: 0, x: 0 }}
          animate={{ 
            top: "110%", 
            opacity: [0, 1, 1, 0],
            x: star.drift 
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "linear",
          }}
          className="absolute rounded-full"
          style={{
            left: star.left,
            width: star.type === 'streak' ? '1px' : star.size,
            height: star.type === 'streak' ? '40px' : star.size,
            background: star.type === 'streak' 
              ? 'linear-gradient(to bottom, transparent, #34d399)' 
              : '#34d399',
            boxShadow: star.type !== 'distant' 
              ? '0 0 15px 2px rgba(52, 211, 153, 0.6)' 
              : 'none',
            filter: star.type === 'distant' ? 'blur(1px)' : 'none',
          }}
        />
      ))}
    </div>
  );
};

// --- REST OF THE COMPONENTS ---

const Logo = () => (
  <div className="relative group flex items-center gap-3">
    <div className="relative">
      <div className="absolute -inset-1 bg-emerald-500/20 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000" />
      <Image
        src='/logo1.svg'
        alt='logo'
        width={40}
        height={40}
        priority
        className="relative rounded-lg object-contain"
      />
    </div>
    <span className="font-black text-2xl tracking-tighter dark:text-white">
      help<span className="text-emerald-500">desk</span>
    </span>
  </div>
);

export default function LandingPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const createUser = useMutation(api.user.createUser);
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [darkMode, setDarkMode] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const testimonials = [
    { name: "Ahmed R.", role: "Law Student", content: "Reduced my study review time by 70%. It's like having a senior partner helping me read." },
    { name: "Sarah M.", role: "Researcher", content: "The citations are spot on. I don't have to hunt for page numbers anymore." },
    { name: "Kevin L.", role: "Engineer", content: "Best tool for diving into complex documentation PDFs. Fast and accurate." },
  ];

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace('/dashboard');
  }, [isSignedIn, isLoaded, router]);

  useEffect(() => {
    if (user) checkUser();
  }, [user]);

  const checkUser = async () => {
    await createUser({
      email: user?.primaryEmailAddress?.emailAddress,
      imageUrl: user?.imageUrl,
      userName: user?.fullName,
    });
  };

  useEffect(() => {
    return scrollY.onChange((latest) => setScrolled(latest > 50));
  }, [scrollY]);

  if (!isLoaded) return null;

  return (
    <div className={`min-h-screen transition-colors duration-500 overflow-x-hidden relative ${darkMode ? 'dark bg-[#0a0c10] text-white' : 'bg-white text-slate-900'}`}>
      
      {/* Background Elements */}
      <BackgroundStars />
      
      {/* Glow Effect */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-20"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(16, 185, 129, 0.15), transparent 40%)`
        }}
      />

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-emerald-500 origin-left z-60" style={{ scaleX }} />

      {/* --- NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-4 bg-white/80 dark:bg-[#0a0c10]/80 backdrop-blur-lg border-b dark:border-white/5' : 'py-6 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 transition-all">
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-600" />}
            </button>
            <SignInButton mode="modal">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 font-bold shadow-lg shadow-emerald-500/20">
                Get Started
              </Button>
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* --- HERO (CENTERED) --- */}
      <main className="max-w-7xl mx-auto px-6 pt-32 md:pt-48 pb-24 relative z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-emerald-500 text-xs font-bold mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" /> Next-Gen Document Intelligence
          </motion.div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-8 leading-[1.1] max-w-4xl">
            Master Your PDFs <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-green-500">With AI.</span>
          </h1>
          
          <p className="text-slate-500 dark:text-gray-400 text-lg md:text-xl mb-12 max-w-2xl leading-relaxed">
            Stop scrolling through endless pages. Upload any PDF and start a conversation. 
            Generate quizzes, flashcards, and deep insights in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <SignInButton mode="modal">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-8 text-xl rounded-2xl shadow-xl shadow-emerald-500/20 group font-bold">
                Start for Free <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
              </Button>
            </SignInButton>
          </div>
        </div>

        {/* --- FEATURES SECTION --- */}
        <section className="mt-48">
          <div className="text-center mb-16">
            <h2 className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-4">Superpowers</h2>
            <h3 className="text-4xl md:text-5xl font-black">Everything you need to <br/><span className="dark:text-white/60">work 10x faster.</span></h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit className="text-emerald-500" />} 
              title="Smart Context" 
              desc="AI that doesn't just read words, it understands your documents' deep structure and hidden connections." 
            />
            <FeatureCard 
              icon={<Zap className="text-yellow-500" />} 
              title="Instant Replies" 
              desc="Get detailed answers with verified page citations in under 2 seconds. No more hunting for sources." 
            />
            <FeatureCard 
              icon={<Shield className="text-blue-500" />} 
              title="Safe & Secure" 
              desc="Bank-grade encryption for your data. We never train our models on your private files or personal data." 
            />
          </div>
        </section>
      </main>

      {/* --- TESTIMONIALS SECTION --- */}
      <section className="py-24 border-y dark:border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
            <h2 className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-4">User Stories</h2>
            <h3 className="text-4xl md:text-5xl font-black">Loved by students and <br/> <span className="dark:text-white/60">industry leaders alike.</span></h3>
        </div>

        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div key={i} className="bg-white dark:bg-white/5 p-8 rounded-3xl border dark:border-white/5 min-w-[320px] whitespace-normal">
              <div className="flex text-yellow-500 gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-slate-600 dark:text-gray-300 italic mb-6">"{t.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">{t.name[0]}</div>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-[#0a0c10] border-t border-white/5 pt-20 pb-10 px-4 sm:px-6 lg:px-8 relative z-10 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-4 flex flex-col items-start">
              <Logo />
              <p className="text-gray-400 text-sm leading-relaxed my-8 max-w-xs">
                Empowering modern students and professionals with next-generation AI document tools.
              </p>
              <div className="flex gap-3">
                {[Twitter, Github, Linkedin, Mail].map((Icon, index) => (
                  <a key={index} href="#" className="p-2.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 transition-all">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-6">Company</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                  {["About", "Blog", "Careers", "Partners"].map(link => (
                    <li key={link} className="hover:text-emerald-400 cursor-pointer">{link}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-6">Resources</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                  {["Documentation", "Help Center", "Community", "API"].map(link => (
                    <li key={link} className="hover:text-emerald-400 cursor-pointer">{link}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-6">Legal</h4>
                <ul className="space-y-4 text-gray-400 text-sm">
                  {["Privacy", "Terms", "Cookies", "Compliance"].map(link => (
                    <li key={link} className="hover:text-emerald-400 cursor-pointer">{link}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent mb-8" />
          <div className="flex flex-col md:row justify-between items-center gap-6 text-gray-500 text-sm">
            <p>© 2026 helpdesk AI. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="hover:text-emerald-400 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-emerald-400 cursor-pointer">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-10 rounded-[2.5rem] bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 hover:border-emerald-500/30 transition-all group">
      <div className="bg-slate-50 dark:bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-2xl font-black mb-4">{title}</h3>
      <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}