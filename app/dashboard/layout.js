"use client";
import React, { useState } from 'react';
import SideBar from './_components/SideBar'; 
import Header from './_components/Header';   
import { SearchContext } from './_components/SearchContext'; // Updated import

export default function DashboardLayout({ children }) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SearchContext.Provider value={{ searchQuery, setSearchQuery }}>
      <div>
        <div className='md:w-64 h-screen fixed hidden md:block border-r bg-white'>
          <SideBar />
        </div>

        <div className='md:ml-64 min-h-screen bg-gray-50'>
          {/* Header updates the context */}
          <Header onSearch={(value) => setSearchQuery(value)} /> 
          
          <div className='p-10'>
              {children}
          </div>
        </div>
      </div>
    </SearchContext.Provider>
  );
}