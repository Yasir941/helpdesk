"use client";
import { UserButton, useUser } from '@clerk/nextjs'
import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, X, CheckCircle2, FileText, Sparkles, Inbox, Calendar, UserCheck } from 'lucide-react'

// Helper function to trigger notifications from ANY file
export const notify = (title, desc, type = 'default') => {
  const event = new CustomEvent('app-notification', {
    detail: { title, desc, type, id: Date.now() }
  });
  window.dispatchEvent(event);
};

function Header({ onSearch }) {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const timerRef = useRef(null);

  const unreadCount = notifications.length;

  /**
   * 🔍 SEARCH LOGIC: 
   * We wrap the local state update and the parent callback 
   * into one function to ensure they stay in sync.
   */
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value); // This sends the text to the parent component to filter the UI
    }
  };

  const clearSearch = () => {
    handleSearchChange("");
  };

  // 1. Listen for Live Events from other components
  useEffect(() => {
    const handleNewNotif = (event) => {
      const { title, desc, type, id } = event.detail;
      const newEntry = {
        id,
        title,
        desc,
        time: "Just now",
        icon: getIcon(type),
        isRead: false
      };
      setNotifications(prev => [newEntry, ...prev]);
      setShowNotifications(true); 
    };

    window.addEventListener('app-notification', handleNewNotif);
    return () => window.removeEventListener('app-notification', handleNewNotif);
  }, []);

  // 2. Auto-Sign-In Notification
  useEffect(() => {
    if (user) {
      const welcomed = sessionStorage.getItem('notified-signin');
      if (!welcomed) {
        notify("Welcome Back!", `Signed in as ${user.firstName}`, "user");
        sessionStorage.setItem('notified-signin', 'true');
      }
    }
  }, [user]);

  // 3. Auto-Close Logic (4 seconds)
  useEffect(() => {
    if (showNotifications) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShowNotifications(false), 3000);
    }
  }, [showNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'quiz': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'schedule': return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'user': return <UserCheck className="h-4 w-4 text-emerald-500" />;
      default: return <Sparkles className="h-4 w-4 text-orange-500" />;
    }
  };

  const markAllAsRead = () => {
    setNotifications([]); 
  };

  return (
    <div className='sticky top-0 z-20 flex justify-between items-center p-4 px-8 border-b bg-white/80 backdrop-blur-md'>
      
      {/* 🚀 Functional Search Bar */}
      <div className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl w-80 border transition-all ${
        searchTerm ? 'border-green-400 bg-white shadow-sm' : 'bg-slate-50 border-slate-100'
      } focus-within:border-green-400 focus-within:bg-white focus-within:shadow-md`}>
        
        <Search className={`h-4 w-4 transition-colors ${searchTerm ? 'text-green-500' : 'text-slate-400'}`} />
        
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search your documents..." 
          className='bg-transparent outline-none text-sm w-full font-medium text-slate-700 placeholder:text-slate-400'
        />

        {searchTerm && (
          <button onClick={clearSearch} className="hover:bg-green-100 p-0.5 rounded-full transition-colors">
            <X className="h-4.5 w-4.5 text-slate-400" />
          </button>
        )}
      </div>

      <div className='flex items-center gap-6 ml-auto'>
        {/* Notification Bell Section */}
        <div className="relative">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl relative transition-colors ${showNotifications ? 'bg-green-50 text-green-600' : 'text-slate-500 hover:bg-slate-100'}`}
          >
            <Bell className='h-5 w-5' />
            {unreadCount > 0 && (
              <span className='absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-bounce'></span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50"
              >
                <div className='p-4 border-b bg-slate-50/50 flex justify-between items-center'>
                    <h3 className="font-bold text-sm text-slate-800">Activity</h3>
                    {unreadCount > 0 && <span className='text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold'>{unreadCount} NEW</span>}
                </div>
                
                <div className="max-h-75 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div key={n.id} className="p-4 flex gap-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                          <div className='mt-0.5'>{n.icon}</div>
                          <div className='flex-1'>
                              <p className="text-xs font-bold text-slate-800">{n.title}</p>
                              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{n.desc}</p>
                              <p className='text-[9px] text-slate-400 mt-2 font-medium'>{n.time}</p>
                          </div>
                      </div>
                    ))
                  ) : (
                    <div className='p-10 flex flex-col items-center justify-center text-slate-400'>
                      <Inbox className='h-8 w-8 mb-2 opacity-20' />
                      <p className='text-xs font-medium'>No new notifications</p>
                    </div>
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className='p-3 text-center border-t bg-slate-50/30'>
                      <button onClick={markAllAsRead} className='text-[11px] font-bold text-green-600 hover:text-green-700'>
                        Clear All
                      </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Section */}
        <div className='flex items-center gap-3 border-l pl-6 border-slate-200'>
          <div className='hidden flex-col items-end md:flex'>
            <span className='text-sm font-bold text-slate-900'>{user?.fullName}</span>
            <span className='text-[10px] font-extrabold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg border border-green-100 tracking-tight'>STUDENT</span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  )
}

export default Header;