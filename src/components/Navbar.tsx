'use client';

import { Sparkles, Plus, LogOut, Search, Terminal } from 'lucide-react';
import { User } from '@/types';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onOpenCreate: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function Navbar({
  user,
  onOpenAuth,
  onOpenCreate,
  onLogout,
  searchQuery,
  onSearchChange,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090e1c]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-0.5 shadow-blue-sm flex items-center justify-center">
            <div className="w-full h-full bg-[#0a1124] rounded-[10px] flex items-center justify-center">
              <Terminal className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                Snippet<span className="text-blue-400">Vault</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600/20 text-sky-300 border border-blue-500/30">
                <Sparkles className="w-2.5 h-2.5 text-sky-400" />
                Gemini AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Developer Code Vault & AI Publisher
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 sm:mx-6">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search code, title, tags (#react, #async)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 hover:border-slate-700 focus:border-blue-500 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={user ? onOpenCreate : onOpenAuth}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Snippet</span>
          </button>

          {user ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-semibold text-white leading-tight">
                  {user.name}
                </span>
                <span className="text-[10px] text-blue-300/80 leading-tight truncate max-w-[120px]">
                  {user.email}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-700/40 border border-blue-500/40 flex items-center justify-center text-blue-200 text-xs font-bold uppercase overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/80 transition"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium transition"
            >
              Sign In / Demo
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
