import React from 'react';
import { Search, Bell, User, Zap } from 'lucide-react';

const Header = ({ title }) => {
  return (
    <header className="h-20 border-b border-zinc-800/50 bg-zinc-950/30 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
        <div className="h-6 w-[1px] bg-zinc-800 mx-2 hidden md:block" />
        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Revenue Engine Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search leads, data, or AI logs..." 
            className="pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 transition-all w-64 lg:w-96"
          />
        </div>

        <button className="p-2.5 bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-zinc-950" />
        </button>

        <button className="flex items-center gap-3 pl-2 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-all">
          <div className="w-8 h-8 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
            <User size={18} className="text-zinc-400" />
          </div>
          <div className="flex flex-col items-start hidden lg:flex">
            <span className="text-xs font-semibold text-white leading-none">Admin</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Premium Plan</span>
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;
