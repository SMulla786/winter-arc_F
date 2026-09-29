import React, { useState } from 'react';
import { User, ShieldCheck, Zap, CreditCard, Activity, ArrowLeft } from 'lucide-react';
import { toggleAdminUserStatus } from '../../services/api';

interface AdminUserDetailsPageProps {
  selectedUser: any;
  onBack: () => void;
}

export default function AdminUserDetailsPage({
  selectedUser,
  onBack,
}: AdminUserDetailsPageProps) {
  const [user, setUser] = useState(
    selectedUser || {
      id: 'u1',
      name: 'Suhel Mulla',
      email: 'suhel@example.com',
      plan: 'Pro',
      status: 'ACTIVE',
      joined: '15 Aug 2026',
      scans: 42,
      aiChats: 118,
    }
  );

  const [plan, setPlan] = useState(user.plan);
  const [status, setStatus] = useState(user.status);

  const handleSavePlan = (newPlan: string) => {
    setPlan(newPlan);
    alert(`Updated ${user.name}'s plan to ${newPlan}`);
  };

  const handleToggleStatus = async () => {
    const newStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStatus(newStatus);
    try {
      if (user.id && !user.id.startsWith('u')) {
        await toggleAdminUserStatus(user.id);
      }
    } catch (err) {}
    alert(`User ${user.name} status changed to ${newStatus}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <button
        onClick={onBack}
        className="px-3.5 py-2 rounded-xl bg-[#121216] hover:bg-zinc-800 text-zinc-300 text-xs font-bold flex items-center gap-2 border border-zinc-800 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Users Directory
      </button>

      {/* User Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-lg">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-black text-white">{user.name}</h1>
            <p className="text-xs text-zinc-400">{user.email} • Joined {user.joined}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase">
            {plan} Plan
          </span>
          <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-500'}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Account & Subscription Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Info Card */}
        <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <CreditCard className="h-4 w-4" /> SUBSCRIPTION & BILLING
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Current Subscription</span>
              <span className="font-extrabold text-white">{plan} Tier (₹299/mo)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Payment Status</span>
              <span className="font-extrabold text-emerald-400">Success (Razorpay)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Renewal Date</span>
              <span className="font-extrabold text-white">15 Oct 2026</span>
            </div>
          </div>
        </div>

        {/* System Usage Stats */}
        <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <Activity className="h-4 w-4" /> USAGE & AI LOGS
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Gemini AI Food Photo Scans</span>
              <span className="font-extrabold text-white">{user.scans} scans</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">AI Coach Chat Messages</span>
              <span className="font-extrabold text-white">{user.aiChats} messages</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-800">
              <span className="text-zinc-400">Workouts Executed</span>
              <span className="font-extrabold text-white">14 sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Action Controls */}
      <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
        <h2 className="text-xs font-black uppercase tracking-wider text-white">ADMINISTRATIVE CONTROLS</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleSavePlan('Free')}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-300 transition"
          >
            Change to Free Plan
          </button>
          <button
            onClick={() => handleSavePlan('Pro')}
            className="px-4 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-xs font-bold text-red-300 border border-red-600/40 transition"
          >
            Change to Pro Plan
          </button>
          <button
            onClick={() => handleSavePlan('Premium')}
            className="px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 text-xs font-bold text-purple-300 border border-purple-500/40 transition"
          >
            Change to Premium Plan
          </button>
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${status === 'ACTIVE' ? 'bg-red-950/80 text-red-400 border border-red-500/40' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'}`}
          >
            {status === 'ACTIVE' ? 'Deactivate User Account' : 'Activate User Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
