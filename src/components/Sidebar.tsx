import React from 'react';
import {
  Home,
  Utensils,
  Footprints,
  Dumbbell,
  IndianRupee,
  Bot,
  TrendingUp,
  LayoutDashboard,
  Users,
  ShieldAlert,
  CreditCard,
  FileText,
  ScanLine,
  UserCheck,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: any) => void;
  viewMode: 'user' | 'admin';
}

export default function Sidebar({ activeTab, onSelectTab, viewMode }: SidebarProps) {
  const userNavItems = [
    { id: 'home', label: 'Home Dashboard', icon: Home },
    { id: 'food', label: 'Food Log', icon: Utensils },
    { id: 'food-analysis', label: 'Food Analysis', icon: ScanLine },
    { id: 'activity', label: 'Activity Tracker', icon: Footprints },
    { id: 'workout', label: 'Workout Hub', icon: Dumbbell },
    { id: 'expenses', label: 'Food Expenses', icon: IndianRupee },
    { id: 'ai', label: 'AI Assistant', icon: Bot },
    { id: 'progress', label: 'Progress & XP', icon: TrendingUp },
    { id: 'profile-setup', label: 'Profile Setup', icon: UserCheck },
  ];

  const adminNavItems = [
    { id: 'admin-dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { id: 'admin-users', label: 'User Directory', icon: Users },
    { id: 'admin-user-details', label: 'User Details', icon: ShieldAlert },
    { id: 'admin-plans', label: 'Plans & Features', icon: CheckSquare },
    { id: 'admin-subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'admin-content', label: 'Exercise Content', icon: FileText },
  ];

  const navItems = viewMode === 'admin' ? adminNavItems : userNavItems;

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0d0d0f] border-r border-white/10 p-4 min-h-[calc(100vh-61px)]">
      <div className="mb-4">
        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-2">
          {viewMode === 'admin' ? 'SYSTEM ADMINISTRATION' : 'TRAINING NAVIGATION'}
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-semibold text-xs transition duration-150 ${
                  isActive
                    ? 'bg-red-950/50 text-white border border-red-600/40 shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-red-400' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Level Card Widget */}
      <div className="mt-auto p-3.5 rounded-xl bg-[#121216] border border-red-600/20 text-xs">
        <div className="flex items-center justify-between font-bold text-zinc-200 mb-1">
          <span>CONSISTENCY LEVEL</span>
          <span className="text-red-400">LVL 07</span>
        </div>
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden my-2 border border-zinc-700">
          <div className="bg-gradient-to-r from-red-600 to-red-400 h-full w-[78%] rounded-full shadow-[0_0_10px_#dc2626]" />
        </div>
        <p className="text-[10px] text-zinc-400">78 / 100 XP to next level</p>
      </div>
    </aside>
  );
}
