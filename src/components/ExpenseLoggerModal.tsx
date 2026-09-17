import { useState } from 'react';
import { X, IndianRupee, CheckCircle } from 'lucide-react';

interface ExpenseLoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expenseData: any) => void;
}

export default function ExpenseLoggerModal({ isOpen, onClose, onAddExpense }: ExpenseLoggerModalProps) {
  const [category, setCategory] = useState('LUNCH');
  const [foodName, setFoodName] = useState('');
  const [amount, setAmount] = useState('180');
  const [restaurantName, setRestaurantName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    onAddExpense({
      category,
      foodName: foodName || category,
      amount: Number(amount),
      restaurantName,
    });

    setFoodName('');
    setRestaurantName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <IndianRupee className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-100">Log Food Expense</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs text-slate-300">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            >
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
              <option value="SNACK">Snack</option>
              <option value="RESTAURANT">Restaurant</option>
              <option value="GROCERY">Grocery</option>
              <option value="DRINKS">Drinks</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-300">Amount (₹)</label>
            <input
              type="number"
              required
              placeholder="e.g. 180"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Food / Item Name</label>
            <input
              type="text"
              placeholder="e.g. Chicken Rice Thali"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Restaurant / Store (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Taste of Punjab"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle className="h-4 w-4" /> Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
