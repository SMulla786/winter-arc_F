import React from 'react';
import { Users, ShieldCheck, Zap, IndianRupee, Activity, Bot, ArrowUpRight } from 'lucide-react';

interface AdminDashboardPageProps {
  stats: any;
  onNavigateUsers: () => void;
  onNavigatePlans: () => void;
  onNavigateSubscriptions: () => void;
  onNavigateContent: () => void;
}

export default function AdminDashboardPage({
  stats,
  onNavigateUsers,
  onNavigatePlans,
  onNavigateSubscriptions,
  onNavigateContent,
}: AdminDashboardPageProps) {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Admin Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">ADMINISTRATIVE OVERVIEW</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">SaaS metrics, user analytics, revenue, and system activity</p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-400 uppercase">
          System Status: Operational
        </span>
      </div>

      {/* 5 Main Admin Metric HUD Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Total Users</div>
          <div className="text-2xl font-black text-white mt-1">
            {stats?.totalUsers !== undefined ? stats.totalUsers.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-zinc-400 font-semibold mt-1">Registered accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Active Users</div>
          <div className="text-2xl font-black text-white mt-1">
            {stats?.activeUsers !== undefined ? stats.activeUsers.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-zinc-400 font-semibold mt-1">Active within 30 days</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Paid Subscribers</div>
          <div className="text-2xl font-black text-white mt-1">
            {stats?.paidSubscribers !== undefined ? stats.paidSubscribers.toLocaleString() : '—'}
          </div>
          <div className="text-[10px] text-amber-400 font-semibold mt-1">Active subscriptions</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">AI Requests</div>
          <div className="text-2xl font-black text-white mt-1">
            {stats?.totalAiScans !== undefined ? stats.totalAiScans.toLocaleString() : (stats?.totalMeals !== undefined ? stats.totalMeals.toLocaleString() : '—')}
          </div>
          <div className="text-[10px] text-red-400 font-semibold mt-1">Gemini Vision & Chat</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121216] border border-amber-500/30 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-bold text-zinc-500 uppercase">Monthly Revenue</div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {stats?.monthlyRevenue !== undefined ? `₹${stats.monthlyRevenue.toLocaleString()}` : '—'}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold mt-1">Backend calculated</div>
        </div>
      </div>


      {/* Admin Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onNavigateUsers}
          className="p-4 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-left transition space-y-1"
        >
          <Users className="h-5 w-5 text-red-400" />
          <div className="font-extrabold text-xs text-white">Manage Users</div>
          <div className="text-[11px] text-zinc-400">View user directory</div>
        </button>

        <button
          onClick={onNavigatePlans}
          className="p-4 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-left transition space-y-1"
        >
          <Zap className="h-5 w-5 text-amber-400" />
          <div className="font-extrabold text-xs text-white">Plans & Features</div>
          <div className="text-[11px] text-zinc-400">Edit pricing & limits</div>
        </button>

        <button
          onClick={onNavigateSubscriptions}
          className="p-4 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-left transition space-y-1"
        >
          <IndianRupee className="h-5 w-5 text-emerald-400" />
          <div className="font-extrabold text-xs text-white">Subscriptions</div>
          <div className="text-[11px] text-zinc-400">Payment logs & status</div>
        </button>

        <button
          onClick={onNavigateContent}
          className="p-4 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-left transition space-y-1"
        >
          <Activity className="h-5 w-5 text-blue-400" />
          <div className="font-extrabold text-xs text-white">Exercise Catalog</div>
          <div className="text-[11px] text-zinc-400">Content management</div>
        </button>
      </div>

      {/* System Activity Stream */}
      <div className="p-5 rounded-2xl bg-[#121216] border border-zinc-800 space-y-4">
        <h2 className="text-xs font-black uppercase text-white tracking-wider border-b border-zinc-800 pb-3 flex justify-between items-center">
          <span>RECENT SYSTEM ACTIVITY STREAM</span>
          <span className="text-zinc-500 font-bold">Live Log</span>
        </h2>

        <div className="py-6 text-center text-xs text-zinc-500 font-medium">
          System events, AI multimodal analysis, and user registrations are logged in the PostgreSQL database.
        </div>
      </div>
    </div>
  );
}
