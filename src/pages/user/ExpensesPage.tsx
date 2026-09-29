import React from 'react';
import { IndianRupee, Plus, Receipt, Trash2 } from 'lucide-react';

interface ExpensesPageProps {
  expensesList: any[];
  dailyBudget?: number;
  onOpenExpenseModal: () => void;
  onDeleteExpense?: (id: string) => void;
}

export default function ExpensesPage({
  expensesList,
  dailyBudget = 300,
  onOpenExpenseModal,
  onDeleteExpense,
}: ExpensesPageProps) {
  const todayTotal = expensesList.reduce((sum, e) => sum + (e.amount || 0), 0);
  const weekTotal = todayTotal;
  const monthTotal = todayTotal;

  // Compute category totals dynamically
  const categoryMap: Record<string, number> = {};
  expensesList.forEach((exp) => {
    const cat = exp.category || 'LUNCH';
    categoryMap[cat] = (categoryMap[cat] || 0) + (exp.amount || 0);
  });

  const categories = [
    { name: '🍳 Breakfast', amount: categoryMap['BREAKFAST'] || 0 },
    { name: '🍛 Lunch', amount: categoryMap['LUNCH'] || 0 },
    { name: '🍔 Dinner', amount: categoryMap['DINNER'] || 0 },
    { name: '🍿 Snacks', amount: categoryMap['SNACK'] || 0 },
    { name: '🛒 Grocery', amount: categoryMap['GROCERY'] || 0 },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-red-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">FOOD SPENDING & BUDGET TRACKER</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor daily, weekly, and monthly food expenses and grocery receipts.
          </p>
        </div>

        <button
          onClick={onOpenExpenseModal}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 hover:from-amber-500 hover:to-amber-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-600/20 transition transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" /> Add Expense / Receipt
        </button>
      </div>

      {/* Spending Totals Summary HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#121216] border border-amber-600/40 shadow-md">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Today's Food Spend</div>
          <div className="text-3xl font-black text-white mt-1">₹{todayTotal}</div>
          <div className="text-[11px] text-amber-400 font-bold mt-1">Daily Target ₹{dailyBudget}</div>
        </div>

        <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">This Week</div>
          <div className="text-3xl font-black text-white mt-1">₹{weekTotal.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Live weekly total</div>
        </div>

        <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">This Month</div>
          <div className="text-3xl font-black text-white mt-1">₹{monthTotal.toLocaleString()}</div>
          <div className="text-[11px] text-zinc-400 mt-1">30-day accumulation</div>
        </div>
      </div>

      {/* Category Spending Breakdown */}
      <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
        <h2 className="text-xs font-black uppercase text-white tracking-wider border-b border-zinc-800 pb-3">
          SPENDING BY CATEGORY
        </h2>

        <div className="space-y-3">
          {categories.map((cat) => {
            const pct = todayTotal > 0 ? Math.min(Math.round((cat.amount / todayTotal) * 100), 100) : 0;
            return (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-300">{cat.name}</span>
                  <span className="text-white">₹{cat.amount.toLocaleString()}</span>
                </div>
                <div className="w-full bg-[#080808] h-2 rounded-full overflow-hidden border border-zinc-800">
                  <div
                    className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Expenses List */}
      <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
        <h2 className="text-xs font-black uppercase text-white tracking-wider border-b border-zinc-800 pb-3 flex items-center justify-between">
          <span>RECENT FOOD EXPENSES</span>
          <span className="text-zinc-500 font-bold">{expensesList.length} items</span>
        </h2>

        {expensesList.length > 0 ? (
          <div className="space-y-2.5">
            {expensesList.map((exp, idx) => (
              <div
                key={exp.id || idx}
                className="p-3.5 rounded-xl bg-[#080808] border border-zinc-800/80 flex items-center justify-between hover:border-amber-600/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-amber-400">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-xs text-white">{exp.foodName || 'Food Item'}</div>
                    <div className="text-[11px] text-zinc-400">{exp.category || 'LUNCH'} • {exp.time || 'Today'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-black text-sm text-amber-400">₹{exp.amount}</div>
                  {onDeleteExpense && exp.id && (
                    <button
                      onClick={() => onDeleteExpense(exp.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition"
                      title="Delete expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center space-y-2">
            <div className="text-xs font-extrabold text-white uppercase tracking-wider">NO FOOD EXPENSES LOGGED YET</div>
            <p className="text-[11px] text-zinc-400">Start tracking where your food money goes today.</p>
            <button
              onClick={onOpenExpenseModal}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 text-xs font-bold transition mt-2"
            >
              + Add Expense
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
