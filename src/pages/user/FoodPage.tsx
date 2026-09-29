import React, { useState } from 'react';
import { Utensils, Plus, Calendar, Flame, Sparkles, Trash2 } from 'lucide-react';

interface FoodPageProps {
  mealsList: any[];
  onOpenMealModal: () => void;
  onDeleteMeal?: (id: string) => void;
}

export default function FoodPage({ mealsList, onOpenMealModal, onDeleteMeal }: FoodPageProps) {
  const [filter, setFilter] = useState<'today' | 'week' | 'month'>('today');

  const totalCalories = mealsList.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProtein = mealsList.reduce((sum, m) => sum + (m.protein || 0), 0);

  const breakfastList = mealsList.filter((m) => m.type === 'BREAKFAST');
  const lunchList = mealsList.filter((m) => m.type === 'LUNCH');
  const snackList = mealsList.filter((m) => m.type === 'SNACK');
  const dinnerList = mealsList.filter((m) => m.type === 'DINNER');

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-red-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-red-400" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">FOOD LOG & ENERGY INTAKE</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Track daily meals, calories, protein, and costs.
          </p>
        </div>

        <button
          onClick={onOpenMealModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Add Food Item
        </button>
      </div>

      {/* Top Energy Stats & Time Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="grid grid-cols-2 gap-3 flex-1">
          <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Energy Logged</div>
            <div className="text-2xl font-black text-white mt-1">
              {totalCalories.toLocaleString()} <span className="text-xs text-red-400 font-bold">kcal</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#121216] border border-zinc-800">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Protein Logged</div>
            <div className="text-2xl font-black text-white mt-1">
              {totalProtein} <span className="text-xs text-red-400 font-bold">g</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-[#121216] rounded-xl border border-zinc-800 self-start sm:self-auto">
          {(['today', 'week', 'month'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                filter === f
                  ? 'bg-red-950/60 text-white border border-red-600/40'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Meal Sections */}
      <div className="space-y-4">
        {[
          { title: 'BREAKFAST', items: breakfastList, defaultCalories: '320 kcal' },
          { title: 'LUNCH', items: lunchList, defaultCalories: '650 kcal' },
          { title: 'SNACK', items: snackList, defaultCalories: '120 kcal' },
          { title: 'DINNER', items: dinnerList, defaultCalories: '0 kcal' },
        ].map((sec) => (
          <div key={sec.title} className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-400">{sec.title}</h2>
              <span className="text-xs font-bold text-zinc-400">
                {sec.items.reduce((sum, i) => sum + (i.calories || 0), 0)} kcal
              </span>
            </div>

            {sec.items.length > 0 ? (
              <div className="space-y-2">
                {sec.items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-lg bg-[#080808] border border-zinc-800/80 flex items-center justify-between hover:border-red-600/30 transition"
                  >
                    <div>
                      <div className="font-extrabold text-xs text-white">{item.name}</div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        {item.protein ? `${item.protein}g protein` : ''} {item.cost ? `• ₹${item.cost}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-black text-xs text-red-400">{item.calories} kcal</div>
                        <div className="text-[10px] text-zinc-500">{item.time || 'Today'}</div>
                      </div>
                      {onDeleteMeal && item.id && (
                        <button
                          onClick={() => onDeleteMeal(item.id)}
                          className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                          title="Delete meal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-zinc-500 font-medium">
                No items logged for {sec.title.toLowerCase()} yet.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
