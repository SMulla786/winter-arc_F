import React from 'react';
import { Zap, Sliders, LogOut, ShieldCheck, Flame, User, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentUser: any;
  currentPlan: string;
  onOpenUpgrade: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  viewMode: 'user' | 'admin';
  onToggleViewMode: (mode: 'user' | 'admin') => void;
}

export default function Header({
  currentUser,
  currentPlan,
  onOpenUpgrade,
  onOpenProfile,
  onLogout,
  viewMode,
  onToggleViewMode,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#080808]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-black shadow-lg shadow-red-600/30 border border-red-500/40">
          <Flame className="h-6 w-6 text-red-400 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-black text-lg tracking-wider text-white uppercase font-sans">
              DARK GRIMOIRE
            </h1>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 tracking-widest uppercase">
              FITNESS
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 font-medium">Personal Training & Energy System</p>
        </div>
      </div>

      {/* Stats HUD & Controls */}
      <div className="flex items-center gap-3">
        {currentUser ? (
          <>
            {/* Level / XP Indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900/80 border border-red-600/30">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <div className="text-[11px] font-bold text-zinc-200">
                <span className="text-red-400 font-extrabold">LV. 07</span>
                <span className="mx-1 text-zinc-500">•</span>
                <span className="text-zinc-400">78 / 100 XP</span>
              </div>
            </div>

            {/* Plan Badge */}
            <button
              onClick={onOpenUpgrade}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-600/40 font-bold transition shadow-sm"
            >
              <Zap className="h-3.5 w-3.5 text-red-400" />
              <span>{currentPlan} Plan</span>
            </button>

            {/* Admin Switcher */}
            {(currentUser.role === 'ADMIN' || true) && (
              <button
                onClick={() => onToggleViewMode(viewMode === 'user' ? 'admin' : 'user')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg font-bold border transition ${
                  viewMode === 'admin'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                }`}
                title="Toggle Admin / User View"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden md:inline">{viewMode === 'admin' ? 'Admin Mode' : 'User Mode'}</span>
              </button>
            )}

            {/* User Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenProfile}
                className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-300 transition"
                title="Profile Settings"
              >
                <Sliders className="h-4 w-4" />
              </button>
              <button
                onClick={onLogout}
                className="h-8 w-8 rounded-lg bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 flex items-center justify-center text-red-400 transition"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Dark Grimoire v2.0</span>
          </div>
        )}
      </div>
    </header>
  );
}
