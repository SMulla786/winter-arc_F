import React from 'react';
import { Home, Utensils, Footprints, IndianRupee, Bot, TrendingUp, LayoutDashboard } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  viewMode: 'user' | 'admin';
}

export default function BottomNav({ activeTab, onSelectTab, viewMode }: BottomNavProps) {
  const userTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'activity', label: 'Activity', icon: Footprints },
    { id: 'expenses', label: 'Money', icon: IndianRupee },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'ai', label: 'AI', icon: Bot },
  ];

  const adminTabs = [
    { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin-users', label: 'Users', icon: LayoutDashboard },
    { id: 'admin-plans', label: 'Plans', icon: LayoutDashboard },
    { id: 'admin-subscriptions', label: 'Payments', icon: LayoutDashboard },
    { id: 'admin-content', label: 'Exercises', icon: LayoutDashboard },
  ];

  const tabs = viewMode === 'admin' ? adminTabs : userTabs;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080808]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg transition-all relative ${
              isActive ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {isActive && (
              <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-red-600 shadow-[0_0_8px_#dc2626]" />
            )}
            <Icon className={`h-5 w-5 ${isActive ? 'text-red-500 scale-110' : 'text-zinc-500'}`} />
            <span className={`text-[10px] font-bold ${isActive ? 'text-red-400 font-extrabold' : 'text-zinc-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
