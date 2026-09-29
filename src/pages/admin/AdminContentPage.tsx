import React, { useState } from 'react';
import { FileText, Plus, Edit, Trash2, CheckCircle2 } from 'lucide-react';

export default function AdminContentPage() {
  const [exercises, setExercises] = useState([
    { id: '1', name: 'Bodyweight Squats', difficulty: 'Beginner', muscle: 'Quads & Glutes', sets: 3, reps: '12' },
    { id: '2', name: 'Standard Push-Ups', difficulty: 'Beginner', muscle: 'Chest & Shoulders', sets: 3, reps: '8' },
    { id: '3', name: 'Forearm Plank', difficulty: 'Beginner', muscle: 'Core', sets: 3, reps: '30 sec' },
    { id: '4', name: 'Walking Lunges', difficulty: 'Intermediate', muscle: 'Legs & Hamstrings', sets: 3, reps: '10' },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newEx, setNewEx] = useState({
    name: '',
    difficulty: 'Beginner',
    muscle: 'Chest',
    sets: 3,
    reps: '12',
    description: '',
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setExercises((prev) => [
      ...prev,
      { id: String(Date.now()), name: newEx.name, difficulty: newEx.difficulty, muscle: newEx.muscle, sets: Number(newEx.sets), reps: newEx.reps },
    ]);
    setShowAddForm(false);
    setNewEx({ name: '', difficulty: 'Beginner', muscle: 'Chest', sets: 3, reps: '12', description: '' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">EXERCISE & CONTENT MANAGEMENT</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">Manage workout templates, exercise media, GIF links, and difficulty classifications</p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 transition"
        >
          <Plus className="h-4 w-4" /> Add Exercise Item
        </button>
      </div>

      {/* Add Exercise Modal / Drawer Form */}
      {showAddForm && (
        <form onSubmit={handleCreate} className="p-6 rounded-2xl bg-[#121216] border border-amber-500/40 space-y-4 shadow-2xl">
          <h2 className="text-xs font-black uppercase tracking-wider text-amber-400">ADD NEW EXERCISE TO CATALOG</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase">Exercise Name</label>
              <input
                type="text"
                required
                placeholder="Incline Dumbbell Press"
                value={newEx.name}
                onChange={(e) => setNewEx({ ...newEx, name: e.target.value })}
                className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase">Difficulty</label>
              <select
                value={newEx.difficulty}
                onChange={(e) => setNewEx({ ...newEx, difficulty: e.target.value })}
                className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase">Target Muscle</label>
              <input
                type="text"
                placeholder="Chest / Upper Pecs"
                value={newEx.muscle}
                onChange={(e) => setNewEx({ ...newEx, muscle: e.target.value })}
                className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-zinc-400 uppercase">Default Reps / Duration</label>
              <input
                type="text"
                value={newEx.reps}
                onChange={(e) => setNewEx({ ...newEx, reps: e.target.value })}
                className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs uppercase"
            >
              Save Exercise
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Exercise Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {exercises.map((ex) => (
          <div key={ex.id} className="p-4 rounded-xl bg-[#121216] border border-zinc-800 flex items-center justify-between">
            <div>
              <div className="font-extrabold text-xs text-white">{ex.name}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                {ex.muscle} • {ex.difficulty} • {ex.sets} × {ex.reps}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Editing exercise ${ex.name}`)}
                className="p-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
              >
                <Edit className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setExercises(exercises.filter((i) => i.id !== ex.id))}
                className="p-1.5 rounded bg-red-950/60 text-red-400 border border-red-600/30"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
