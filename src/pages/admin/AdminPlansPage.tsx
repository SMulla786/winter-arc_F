import React, { useState } from 'react';
import { CheckSquare, Zap, Shield, Save, Check } from 'lucide-react';

export default function AdminPlansPage() {
  const [selectedPlan, setSelectedPlan] = useState<'Free' | 'Pro' | 'Premium'>('Pro');
  const [planData, setPlanData] = useState({
    name: 'Pro',
    price: '299',
    foodScansLimit: '100',
    aiMessagesLimit: '100',
    foodScanOn: true,
    aiChatOn: true,
    mealRecsOn: true,
    workoutRecsOn: true,
    expenseTrackOn: true,
    weeklyReportOn: true,
  });

  const [savedMessage, setSavedMessage] = useState(false);

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">SAAS PLANS & FEATURE LIMITS</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Configure subscription pricing tiers, feature toggles, and monthly usage limits</p>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
          ✓ Plan configuration saved successfully!
        </div>
      )}

      {/* 3 Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { name: 'Free', price: '₹0', scans: '10/mo', chat: '10 msgs/mo' },
          { name: 'Pro', price: '₹299', scans: '100/mo', chat: '100 msgs/mo' },
          { name: 'Premium', price: '₹599', scans: 'Unlimited', chat: 'Unlimited' },
        ].map((p) => (
          <div
            key={p.name}
            onClick={() => {
              setSelectedPlan(p.name as any);
              setPlanData((prev) => ({ ...prev, name: p.name, price: p.price.replace('₹', '') }));
            }}
            className={`p-5 rounded-xl border cursor-pointer transition ${
              selectedPlan === p.name
                ? 'bg-amber-950/30 border-amber-500 text-white shadow-lg'
                : 'bg-[#121216] border-zinc-800 text-zinc-400 hover:border-zinc-700'
            }`}
          >
            <div className="text-xs font-black uppercase tracking-wider text-amber-400">{p.name} Tier</div>
            <div className="text-3xl font-black text-white mt-1">{p.price} <span className="text-xs text-zinc-400 font-normal">/ month</span></div>
            <div className="text-[11px] text-zinc-400 mt-3 space-y-1">
              <div>• {p.scans} food scans</div>
              <div>• {p.chat} AI coach chat</div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Editor Form */}
      <form onSubmit={handleSavePlan} className="p-6 rounded-2xl bg-[#121216] border border-zinc-800 space-y-6">
        <h2 className="text-xs font-black uppercase tracking-wider text-white border-b border-zinc-800 pb-3">
          EDITING PLAN: <span className="text-amber-400">{selectedPlan.toUpperCase()} TIER</span>
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase">Plan Name</label>
            <input
              type="text"
              value={planData.name}
              onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
              className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase">Price (₹ / month)</label>
            <input
              type="number"
              value={planData.price}
              onChange={(e) => setPlanData({ ...planData, price: e.target.value })}
              className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Usage Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase">Food Scans / Month Limit</label>
            <input
              type="number"
              value={planData.foodScansLimit}
              onChange={(e) => setPlanData({ ...planData, foodScansLimit: e.target.value })}
              className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-zinc-400 uppercase">AI Chat / Month Limit</label>
            <input
              type="number"
              value={planData.aiMessagesLimit}
              onChange={(e) => setPlanData({ ...planData, aiMessagesLimit: e.target.value })}
              className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-3">
          <label className="text-[11px] font-bold text-zinc-400 uppercase">Feature Access Controls</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'foodScanOn', label: 'Food Photo Scan (Gemini Vision)' },
              { key: 'aiChatOn', label: 'AI Lifestyle Coach Chat' },
              { key: 'mealRecsOn', label: 'AI Meal Recommendations' },
              { key: 'workoutRecsOn', label: 'AI Workout Recommendations' },
              { key: 'expenseTrackOn', label: 'Expense Tracking & Receipts' },
              { key: 'weeklyReportOn', label: 'Weekly Progress Reports' },
            ].map((feat) => (
              <div key={feat.key} className="p-3 rounded-lg bg-[#080808] border border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300">{feat.label}</span>
                <button
                  type="button"
                  onClick={() => setPlanData({ ...planData, [feat.key]: !(planData as any)[feat.key] })}
                  className={`px-3 py-1 rounded text-xs font-extrabold uppercase transition ${
                    (planData as any)[feat.key]
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {(planData as any)[feat.key] ? 'ON' : 'OFF'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
        >
          <Save className="h-4 w-4" /> Save Plan Configuration
        </button>
      </form>
    </div>
  );
}
