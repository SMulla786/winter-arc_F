import React from 'react';
import {
  Flame,
  Footprints,
  Droplets,
  IndianRupee,
  Plus,
  Sparkles,
  Utensils,
  Dumbbell,
  ArrowRight,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface HomeDashboardPageProps {
  userName: string;
  totalCaloriesLogged: number;
  calorieTarget: number;
  totalProteinLogged: number;
  proteinTarget: number;
  stepsLogged: number;
  stepsTarget: number;
  waterGlasses: number;
  waterTarget: number;
  totalSpentToday: number;
  dailyBudget: number;
  mealsList: any[];
  onOpenMealModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenActivityModal: () => void;
  onAddWater: () => void;
  onNavigateAi: () => void;
  onNavigateWorkout: () => void;
  onNavigateFood: () => void;
}

export default function HomeDashboardPage({
  userName,
  totalCaloriesLogged,
  calorieTarget,
  totalProteinLogged,
  proteinTarget,
  stepsLogged,
  stepsTarget,
  waterGlasses,
  waterTarget,
  totalSpentToday,
  dailyBudget,
  mealsList,
  onOpenMealModal,
  onOpenExpenseModal,
  onOpenActivityModal,
  onAddWater,
  onNavigateAi,
  onNavigateWorkout,
  onNavigateFood,
}: HomeDashboardPageProps) {
  const caloriesPct = Math.min(Math.round((totalCaloriesLogged / calorieTarget) * 100), 100);
  const proteinPct = Math.min(Math.round((totalProteinLogged / proteinTarget) * 100), 100);
  const stepsPct = Math.min(Math.round((stepsLogged / stepsTarget) * 100), 100);
  const waterPct = Math.min(Math.round((waterGlasses / waterTarget) * 100), 100);

  // Group meals
  const breakfast = mealsList.filter((m) => m.type === 'BREAKFAST');
  const lunch = mealsList.filter((m) => m.type === 'LUNCH');
  const snack = mealsList.filter((m) => m.type === 'SNACK');
  const dinner = mealsList.filter((m) => m.type === 'DINNER');

  const bCal = breakfast.reduce((sum, m) => sum + (m.calories || 0), 0);
  const lCal = lunch.reduce((sum, m) => sum + (m.calories || 0), 0);
  const sCal = snack.reduce((sum, m) => sum + (m.calories || 0), 0);
  const dCal = dinner.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Greeting & Status HUD */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0d0d0f] border border-red-600/30 shadow-lg shadow-red-950/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">DAY 24 • CONSISTENCY CYCLE</span>
          </div>
          <h1 className="text-2xl font-black uppercase text-white tracking-wider mt-0.5">
            GOOD MORNING, {userName?.toUpperCase() || 'SUHEL'} 👋
          </h1>
          <p className="text-xs text-zinc-400 mt-1">Your daily energy system is online. Stay consistent today!</p>
        </div>

        {/* Level / XP HUD Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#121216] border border-red-600/40">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-red-600 to-amber-600 flex items-center justify-center font-black text-white text-sm shadow-md">
            07
          </div>
          <div>
            <div className="text-xs font-black text-white">LEVEL 07</div>
            <div className="w-24 bg-zinc-800 h-1.5 rounded-full mt-1 overflow-hidden">
              <div className="bg-red-500 h-full w-[78%] rounded-full shadow-[0_0_8px_#ef4444]" />
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">78 / 100 XP</div>
          </div>
        </div>
      </div>

      {/* Main Action Triggers Bar (1-Tap interactions) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={onOpenMealModal}
          className="p-3.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-600/40 text-left flex items-center justify-between group transition shadow-md"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-red-600/20 flex items-center justify-center text-red-400 font-bold group-hover:scale-110 transition">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold uppercase text-white tracking-wider">+ FOOD</span>
          </div>
          <Utensils className="h-4 w-4 text-zinc-600 group-hover:text-red-400 transition" />
        </button>

        <button
          onClick={onOpenActivityModal}
          className="p-3.5 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between group transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold group-hover:scale-110 transition">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold uppercase text-white tracking-wider">+ ACTIVITY</span>
          </div>
          <Footprints className="h-4 w-4 text-zinc-600 group-hover:text-emerald-400 transition" />
        </button>

        <button
          onClick={onOpenExpenseModal}
          className="p-3.5 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between group transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold group-hover:scale-110 transition">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold uppercase text-white tracking-wider">+ EXPENSE</span>
          </div>
          <IndianRupee className="h-4 w-4 text-zinc-600 group-hover:text-amber-400 transition" />
        </button>

        <button
          onClick={onAddWater}
          className="p-3.5 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-left flex items-center justify-between group transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold group-hover:scale-110 transition">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-xs font-extrabold uppercase text-white tracking-wider">+ WATER</span>
          </div>
          <Droplets className="h-4 w-4 text-zinc-600 group-hover:text-blue-400 transition" />
        </button>
      </div>

      {/* Main Energy Gauge Card & Stats HUD Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Energy Featured Card */}
        <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-red-600/40 relative overflow-hidden flex flex-col justify-between shadow-xl shadow-red-950/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-wider text-red-400 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-red-500 animate-pulse" /> DAILY ENERGY GAUGE
              </span>
              <span className="text-[11px] font-bold text-zinc-400">{caloriesPct}% Target</span>
            </div>

            <div className="text-center my-6">
              <div className="text-4xl font-black text-white tracking-tight font-sans">
                {totalCaloriesLogged.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-zinc-400 uppercase mt-1">
                / {calorieTarget.toLocaleString()} KCAL GOAL
              </div>

              {/* Crimson Energy Gauge Bar */}
              <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden my-4 border border-zinc-800">
                <div
                  className="bg-gradient-to-r from-red-600 to-amber-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_#dc2626]"
                  style={{ width: `${caloriesPct}%` }}
                />
              </div>

              <div className="text-xs font-bold text-red-400">
                {Math.max(0, calorieTarget - totalCaloriesLogged).toLocaleString()} kcal remaining today
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800/80 flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-medium">Metabolic Status</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Optimal Range
            </span>
          </div>
        </div>

        {/* 4 Compact Stat HUD Cards Grid */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          {/* Protein Card */}
          <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800 hover:border-red-600/40 transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase">
                <span>🥩 PROTEIN</span>
                <span className="text-red-400">{proteinPct}%</span>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {totalProteinLogged} <span className="text-xs text-zinc-400 font-normal">/ {proteinTarget}g</span>
              </div>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-4 border border-zinc-800">
              <div className="bg-red-500 h-full rounded-full" style={{ width: `${proteinPct}%` }} />
            </div>
          </div>

          {/* Steps Card */}
          <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800 hover:border-emerald-600/40 transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase">
                <span>🚶 STEPS</span>
                <span className="text-emerald-400">{stepsPct}%</span>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {stepsLogged.toLocaleString()} <span className="text-xs text-zinc-400 font-normal">/ {stepsTarget.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-4 border border-zinc-800">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stepsPct}%` }} />
            </div>
          </div>

          {/* Water Card */}
          <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800 hover:border-blue-600/40 transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase">
                <span>💧 WATER</span>
                <span className="text-blue-400">{waterGlasses} / {waterTarget}</span>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                {waterGlasses * 250} <span className="text-xs text-zinc-400 font-normal">ml ({waterGlasses} glasses)</span>
              </div>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-4 border border-zinc-800">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: `${waterPct}%` }} />
            </div>
          </div>

          {/* Food Spend Card */}
          <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800 hover:border-amber-600/40 transition flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase">
                <span>💰 FOOD SPEND</span>
                <span className="text-amber-400">Budget ₹{dailyBudget}</span>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                ₹{totalSpentToday} <span className="text-xs text-zinc-400 font-normal">today</span>
              </div>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden mt-4 border border-zinc-800">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${Math.min((totalSpentToday / dailyBudget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Suggestion Command Card */}
      <div className="p-5 rounded-2xl bg-[#0d0d0f] border border-red-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-950/60 border border-red-600/40 flex items-center justify-center text-red-400 shrink-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black uppercase text-red-400 tracking-wider">✦ AI INTELLIGENCE ADVICE</div>
            <p className="text-xs text-zinc-200 mt-1 font-medium leading-relaxed">
              "Protein is a little low today ({totalProteinLogged}g / {proteinTarget}g). Consider eggs, chicken, or dal for dinner to meet your muscle recovery target within your ₹{dailyBudget} budget."
            </p>
          </div>
        </div>
        <button
          onClick={onNavigateAi}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5 shrink-0 shadow-md shadow-red-600/20 transition"
        >
          [ Ask AI Assistant ] <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/* Today's Meals & Today's Activity Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Meals Summary */}
        <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Utensils className="h-4 w-4 text-red-400" /> TODAY'S MEALS
            </h3>
            <button onClick={onNavigateFood} className="text-xs font-bold text-red-400 hover:underline">
              View Log →
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#080808] border border-zinc-800/80">
              <span className="font-bold text-zinc-300">Breakfast</span>
              <span className="font-extrabold text-white">{bCal > 0 ? `${bCal} kcal` : '—'}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#080808] border border-zinc-800/80">
              <span className="font-bold text-zinc-300">Lunch</span>
              <span className="font-extrabold text-white">{lCal > 0 ? `${lCal} kcal` : '—'}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#080808] border border-zinc-800/80">
              <span className="font-bold text-zinc-300">Snack</span>
              <span className="font-extrabold text-white">{sCal > 0 ? `${sCal} kcal` : '—'}</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-lg bg-[#080808] border border-zinc-800/80">
              <span className="font-bold text-zinc-300">Dinner</span>
              <span className="font-extrabold text-white">{dCal > 0 ? `${dCal} kcal` : '—'}</span>
            </div>
          </div>
        </div>

        {/* Today's Activity Overview */}
        <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
            <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-emerald-400" /> TODAY'S TRAINING
            </h3>
            <button onClick={onNavigateWorkout} className="text-xs font-bold text-emerald-400 hover:underline">
              Training Arena →
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-lg bg-[#080808] border border-zinc-800/80">
              <div className="flex items-center gap-2 font-bold text-zinc-300">
                <Footprints className="h-4 w-4 text-emerald-400" /> Daily Steps
              </div>
              <span className="font-extrabold text-white">{stepsLogged.toLocaleString()} / 10,000</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-lg bg-[#080808] border border-zinc-800/80">
              <div className="flex items-center gap-2 font-bold text-zinc-300">
                <Dumbbell className="h-4 w-4 text-red-400" /> Full Body Workout
              </div>
              <span className="px-2.5 py-1 rounded bg-red-950/60 border border-red-600/40 text-red-400 font-extrabold text-[10px] uppercase">
                Ready to Start
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
