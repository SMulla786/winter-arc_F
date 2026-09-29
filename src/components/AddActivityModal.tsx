import React, { useState } from 'react';
import { X, Footprints, CheckCircle } from 'lucide-react';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddActivity: (actData: any) => void;
}

export default function AddActivityModal({ isOpen, onClose, onAddActivity }: AddActivityModalProps) {
  const [activityType, setActivityType] = useState('Walking');
  const [durationMin, setDurationMin] = useState('30');
  const [calories, setCalories] = useState('150');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddActivity({
      name: activityType,
      duration: `${durationMin} min`,
      calories: `${calories} kcal`,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0d0d0f] border border-emerald-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 bg-[#121216] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Footprints className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-black uppercase text-white tracking-wider">LOG CARDIO / ACTIVITY</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Activity Type</label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full mt-1 bg-[#121216] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            >
              <option value="Walking">Brisk Walking</option>
              <option value="Running">Outdoor Running</option>
              <option value="Cycling">Cycling</option>
              <option value="Gym Workout">Gym / Weight Training</option>
              <option value="Swimming">Swimming</option>
              <option value="Sports">Badminton / Football</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Duration (Minutes)</label>
            <input
              type="number"
              required
              value={durationMin}
              onChange={(e) => {
                const dur = e.target.value;
                setDurationMin(dur);
                setCalories(String(Number(dur) * 5));
              }}
              className="w-full mt-1 bg-[#121216] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Estimated Calories Burned (kcal)</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full mt-1 bg-[#121216] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/20 transition"
          >
            <CheckCircle className="h-4 w-4" /> Save Activity
          </button>
        </form>
      </div>
    </div>
  );
}
