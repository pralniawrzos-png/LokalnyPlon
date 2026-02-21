import React from 'react';
import { TrendingUp, Settings } from 'lucide-react';

export const Navigation = ({ view, setView, pendingCount }) => {
  return (
    <nav className="bg-emerald-900 text-white p-4 sticky top-0 z-40">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('board')}>
          <TrendingUp className="text-emerald-400" />
          <span className="font-black">LOKALNY PLON</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setView('board')} className="text-xs font-bold hidden sm:block">TABLICA</button>
          <button onClick={() => setView('add')} className="bg-emerald-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-500 transition">WYSTAW TOWAR</button>
          
          <div className="w-px h-6 bg-emerald-700 mx-1 hidden sm:block"></div>
          <button 
            onClick={() => setView('admin')} 
            className={`flex items-center gap-1.5 text-xs font-bold transition ${view === 'admin' ? 'text-emerald-400' : 'opacity-80 hover:opacity-100'}`}
          >
            <Settings size={16}/> 
            <span className="hidden sm:inline">PANEL ADMINA</span>
            {pendingCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
