"use client";
import React, { useContext } from 'react';
import FileList from './_components/FileList';
/** * 🔗 Pulling the search query from our central context 
 * to filter the documents in real-time.
 */
import { SearchContext } from './_components/SearchContext';

function Dashboard() {
  const { searchQuery } = useContext(SearchContext);

  return (
    <div className='p-5 md:p-10'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='font-black text-3xl text-slate-900'>My Documents</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">
            {searchQuery 
              ? `Showing results for "${searchQuery}"` 
              : "Access and manage your study materials."}
          </p>
        </div>
      </div>

      <hr className='my-8 border-slate-100' />

      {/* We pass the searchQuery down to FileList so it can 
          handle the .filter() logic internally.
      */}
      <FileList searchTerm={searchQuery} />
    </div>
  )
}

export default Dashboard;