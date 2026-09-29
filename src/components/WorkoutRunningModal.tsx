import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, Trophy, Flame, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

interface WorkoutRunningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteWorkout: () => void;
}

export default function WorkoutRunningModal({
  isOpen,
  onClose,
  onCompleteWorkout,
}: WorkoutRunningModalProps) {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState<number[]>([0, 0, 0, 0]);
  const [isFinished, setIsFinished] = useState(false);
  const [seconds, setSeconds] = useState(25);
  const [timerActive, setTimerActive] = useState(true);

  const exercises = [
    { name: 'Bodyweight Squats', target: 'Quads & Glutes', setsTotal: 3, reps: '12 reps' },
    { name: 'Standard Push-Ups', target: 'Chest & Shoulders', setsTotal: 3, reps: '8 reps' },
    { name: 'Forearm Plank Hold', target: 'Core', setsTotal: 3, reps: '30 sec' },
    { name: 'Walking Lunges', target: 'Legs & Hamstrings', setsTotal: 3, reps: '10 reps / leg' },
  ];

  useEffect(() => {
    let interval: any = null;
    if (isOpen && timerActive && seconds > 0 && !isFinished) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timerActive, seconds, isFinished]);

  if (!isOpen) return null;

  const currentEx = exercises[currentExerciseIdx];

  const handleNextSet = () => {
    const newSets = [...completedSets];
    newSets[currentExerciseIdx] = (newSets[currentExerciseIdx] || 0) + 1;
    setCompletedSets(newSets);

    if (newSets[currentExerciseIdx] >= currentEx.setsTotal) {
      if (currentExerciseIdx < exercises.length - 1) {
        setCurrentExerciseIdx((prev) => prev + 1);
        setSeconds(25);
      } else {
        setIsFinished(true);
      }
    } else {
      setSeconds(15); // Rest timer
    }
  };

  const handleFinishWorkoutSession = () => {
    onCompleteWorkout();
    setIsFinished(false);
    setCurrentExerciseIdx(0);
    setCompletedSets([0, 0, 0, 0]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#0d0d0f] border border-red-600/50 rounded-2xl shadow-[0_0_60px_rgba(220,38,38,0.3)] overflow-hidden flex flex-col relative">
        {/* Top Header */}
        <div className="p-4 border-b border-zinc-800 bg-[#121216] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-500 animate-pulse" />
            <span className="text-xs font-black uppercase text-white tracking-wider">LIVE TRAINING SESSION</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {!isFinished ? (
          <div className="p-6 space-y-6 text-center">
            {/* Exercise Title */}
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded bg-red-950/80 text-red-400 border border-red-500/30">
                EXERCISE {currentExerciseIdx + 1} OF {exercises.length}
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-2">{currentEx.name}</h2>
              <p className="text-xs text-zinc-400 font-medium mt-1">Target: {currentEx.target}</p>
            </div>

            {/* Timer Countdown */}
            <div className="py-4">
              <div className="text-5xl font-black text-white font-mono tracking-tight">
                00:{seconds < 10 ? `0${seconds}` : seconds}
              </div>
              <div className="text-[10px] font-bold text-red-400 uppercase mt-1">REST / TEMPO TIMER</div>
            </div>

            {/* Set Progress Indicators */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-zinc-300">
                Set {completedSets[currentExerciseIdx] || 0} / {currentEx.setsTotal} ({currentEx.reps})
              </div>
              <div className="flex justify-center gap-2">
                {Array.from({ length: currentEx.setsTotal }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 flex-1 rounded-full transition-all ${
                      i < (completedSets[currentExerciseIdx] || 0)
                        ? 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                        : 'bg-zinc-800'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Action Checkbox Button */}
            <button
              onClick={handleNextSet}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/40 transition transform active:scale-95"
            >
              <CheckCircle2 className="h-5 w-5 text-white" /> Complete Set & Next
            </button>
          </div>
        ) : (
          /* Training Complete Energetic Burst Celebration */
          <div className="p-8 text-center space-y-6 animate-fadeIn">
            <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-red-600 via-amber-500 to-red-950 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(220,38,38,0.5)] border border-red-500/50">
              <Trophy className="h-10 w-10 text-white animate-bounce" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider">TRAINING COMPLETE!</h2>
              <div className="text-xs font-bold text-amber-400 uppercase tracking-widest">+120 XP GAINED</div>
              <p className="text-xs text-zinc-400 mt-2">Awesome consistency! Your character level progress has been updated.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#121216] border border-red-600/30 text-xs font-bold text-zinc-300">
              ⚡ 25 Min Full Body Workout Logged
            </div>

            <button
              onClick={handleFinishWorkoutSession}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/40 transition"
            >
              Return to Arena Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
