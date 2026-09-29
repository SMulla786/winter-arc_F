import React from 'react';
import { Footprints, Plus, Flame, Timer, Compass, HeartPulse, CheckCircle2 } from 'lucide-react';

interface ActivityPageProps {
  stepsLogged: number;
  stepsTarget: number;
  activitiesList?: any[];
  onOpenActivityModal: () => void;
  onDeleteActivity?: (id: string) => void;
}

export default function ActivityPage({
  stepsLogged,
  stepsTarget,
  activitiesList = [],
  onOpenActivityModal,
  onDeleteActivity,
}: ActivityPageProps) {
  const pct = Math.min(Math.round((stepsLogged / stepsTarget) * 100), 100);
  const distanceKm = (stepsLogged * 0.00075).toFixed(1);
  const activeTimeMin = Math.round(stepsLogged / 120);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-red-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Footprints className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">TODAY'S ACTIVITY & MOVEMENT</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Track daily steps, active time, distance, and cardio sessions.
          </p>
        </div>

        <button
          onClick={onOpenActivityModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Log Activity
        </button>
      </div>

      {/* Main Movement Stats HUD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step Ring Progress Card */}
        <div className="p-6 rounded-2xl bg-[#121216] border border-zinc-800 text-center flex flex-col items-center justify-center shadow-xl">
          <div className="relative w-40 h-40 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="#1f1f26" strokeWidth="12" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#22c55e"
                strokeWidth="12"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * pct) / 100}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black text-white">{stepsLogged.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">/ {stepsTarget.toLocaleString()} steps</span>
              <span className="text-[11px] font-extrabold text-emerald-400 mt-1">{pct}% TARGET</span>
            </div>
          </div>
        </div>

        {/* 2 Compact Metric Cards */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase">
              <span>DISTANCE COVERED</span>
              <Compass className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white my-3">
              {distanceKm} <span className="text-sm text-zinc-400 font-normal">km</span>
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">Based on 0.75m average stride length</div>
          </div>

          <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-400 uppercase">
              <span>ACTIVE MOVEMENT</span>
              <Timer className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-white my-3">
              {activeTimeMin} <span className="text-sm text-zinc-400 font-normal">min</span>
            </div>
            <div className="text-[11px] text-zinc-500 font-medium">Brisk walking & exercise active time</div>
          </div>
        </div>
      </div>

      {/* Activity Breakdown List */}
      <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
        <h2 className="text-xs font-black uppercase text-white tracking-wider border-b border-zinc-800 pb-3 flex items-center justify-between">
          <span>LOGGED ACTIVITIES TODAY</span>
          <span className="text-zinc-500 font-bold">{activitiesList.length} Sessions</span>
        </h2>

        {activitiesList.length > 0 ? (
          <div className="space-y-3">
            {activitiesList.map((act, idx) => {
              const typeStr = (act.activityType || act.name || 'Activity').replace(/_/g, ' ');
              const isWalking = typeStr.toLowerCase().includes('walk');
              const isRunning = typeStr.toLowerCase().includes('run');
              const isCycling = typeStr.toLowerCase().includes('cycl');
              const Icon = isWalking ? Footprints : isCycling ? HeartPulse : isRunning ? Flame : Timer;
              const color = isWalking ? 'text-emerald-400' : isCycling ? 'text-amber-400' : 'text-red-400';

              return (
                <div
                  key={act.id || idx}
                  className="p-3.5 rounded-xl bg-[#080808] border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-white capitalize">{typeStr.toLowerCase()}</div>
                      <div className="text-[11px] text-zinc-400">
                        {act.durationMinutes || act.duration || 30} min • {act.steps ? `${act.steps} steps` : 'Active'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right font-black text-xs text-white">
                      {act.caloriesBurned || act.calories || 120} kcal
                    </div>
                    {onDeleteActivity && act.id && (
                      <button
                        onClick={() => onDeleteActivity(act.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                        title="Delete activity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-zinc-500">
            No activities logged today yet. Click "Log Activity" above to add your steps or cardio!
          </div>
        )}
      </div>

      {/* Optional Health Data Integration Banner */}
      <div className="p-4 rounded-xl bg-[#0d0d0f] border border-zinc-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 text-zinc-300 font-medium">
          <HeartPulse className="h-4 w-4 text-red-500" />
          <span>Connect Apple Health or Google Fit for automatic step syncing</span>
        </div>
        <button
          onClick={() => alert('Health Data Integration setup simulating... Connected!')}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white transition"
        >
          Connect Data
        </button>
      </div>
    </div>
  );
}
