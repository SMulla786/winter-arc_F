import React from 'react';
import { Dumbbell, Play, Info, Flame, Target, Trophy, Sparkles } from 'lucide-react';

interface WorkoutPageProps {
  onStartWorkout: () => void;
  onOpenExerciseDetails: (exercise: any) => void;
}

export default function WorkoutPage({
  onStartWorkout,
  onOpenExerciseDetails,
}: WorkoutPageProps) {
  const exercises = [
    {
      id: 'squats',
      name: 'Bodyweight Squats',
      sets: 3,
      reps: '12 reps',
      target: 'Quads & Glutes',
      difficulty: 'Beginner',
      image: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=400&q=80',
      description: 'Stand feet shoulder-width apart, lower hips back as if sitting in a chair, keep chest high, press through heels to return upward.',
    },
    {
      id: 'pushups',
      name: 'Standard Push-Ups',
      sets: 3,
      reps: '8 reps',
      target: 'Chest, Shoulders & Triceps',
      difficulty: 'Beginner',
      image: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?auto=format&fit=crop&w=400&q=80',
      description: 'Place hands slightly wider than shoulder-width, lower body until chest nearly touches floor, press back up while maintaining flat core.',
    },
    {
      id: 'plank',
      name: 'Forearm Plank Hold',
      sets: 3,
      reps: '30 sec',
      target: 'Core & Abdominals',
      difficulty: 'Beginner',
      image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?auto=format&fit=crop&w=400&q=80',
      description: 'Rest on forearms and toes, keep body in straight line from head to heels, engage core and breathe steadily.',
    },
    {
      id: 'lunges',
      name: 'Walking Lunges',
      sets: 3,
      reps: '10 reps / leg',
      target: 'Hamstrings & Glutes',
      difficulty: 'Intermediate',
      image: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?auto=format&fit=crop&w=400&q=80',
      description: 'Step forward with one leg, lower hips until both knees bend at 90-degree angles, push off front foot to step forward.',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner - Training Arena */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-red-600/40 relative overflow-hidden shadow-xl shadow-red-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase tracking-widest">
              TRAINING ARENA
            </span>
            <span className="text-xs text-zinc-400 font-bold">✦ FULL BODY POWER</span>
          </div>
          <h1 className="text-2xl font-black uppercase text-white tracking-wider">
            TODAY'S WORKOUT ROUTINE
          </h1>
          <p className="text-xs text-zinc-400">25 Minutes • 4 Exercises • +120 XP Reward</p>
        </div>

        <button
          onClick={onStartWorkout}
          className="relative z-10 px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2.5 shadow-lg shadow-red-600/40 transition transform hover:scale-105"
        >
          <Play className="h-4 w-4 fill-white" /> ⚔ START TRAINING SESSION
        </button>
      </div>

      {/* Exercises List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exercises.map((ex, idx) => (
          <div
            key={ex.id}
            className="p-4 rounded-xl bg-[#121216] border border-zinc-800 hover:border-red-600/40 transition flex flex-col justify-between group shadow-md"
          >
            <div className="space-y-3">
              <div className="relative h-36 rounded-lg overflow-hidden bg-[#080808]">
                <img
                  src={ex.image}
                  alt={ex.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-red-400 uppercase border border-red-600/30">
                  {idx + 1}. {ex.difficulty}
                </span>
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-red-950/80 text-[11px] font-black text-white border border-red-500/40">
                  {ex.sets} × {ex.reps}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-white">{ex.name}</h3>
                <div className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
                  <Target className="h-3.5 w-3.5 text-red-400" /> {ex.target}
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenExerciseDetails(ex)}
              className="mt-4 w-full py-2 rounded-lg bg-[#080808] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition"
            >
              <Info className="h-3.5 w-3.5 text-zinc-400" /> Exercise Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
