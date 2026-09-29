import React from 'react';
import { X, Target, CheckCircle, Dumbbell } from 'lucide-react';

interface ExerciseDetailModalProps {
  exercise: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExerciseDetailModal({ exercise, isOpen, onClose }: ExerciseDetailModalProps) {
  if (!isOpen || !exercise) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0d0d0f] border border-red-600/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-[#121216] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-950/60 text-red-400 border border-red-600/30">
              <Dumbbell className="h-4 w-4" />
            </div>
            <h2 className="text-xs font-black uppercase text-white tracking-wider">EXERCISE DETAILS</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="relative h-48 rounded-xl overflow-hidden bg-[#080808]">
            <img src={exercise.image} alt={exercise.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded bg-red-950/80 text-xs font-black text-white border border-red-500/40">
              {exercise.sets} Sets × {exercise.reps}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-black uppercase text-white">{exercise.name}</h3>
            <div className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1">
              <Target className="h-3.5 w-3.5" /> Target Muscles: {exercise.target}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="text-xs font-extrabold uppercase text-white">How to Perform:</div>
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">{exercise.description}</p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
          >
            <CheckCircle className="h-4 w-4" /> Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
