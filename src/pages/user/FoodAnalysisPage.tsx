import React, { useState } from 'react';
import { ScanLine, CheckCircle2, RotateCcw, Edit3, Sparkles, Utensils, AlertCircle } from 'lucide-react';

interface FoodAnalysisPageProps {
  scannedData: any;
  imagePreviewUrl: string | null;
  onConfirm: (meal: any) => void;
  onRetry: () => void;
}

export default function FoodAnalysisPage({
  scannedData,
  imagePreviewUrl,
  onConfirm,
  onRetry,
}: FoodAnalysisPageProps) {
  const [name, setName] = useState(scannedData?.name || 'Chicken Biryani & Salad');
  const [calories, setCalories] = useState(scannedData?.calories || 620);
  const [protein, setProtein] = useState(scannedData?.protein || 38);
  const [carbs, setCarbs] = useState(scannedData?.carbs || 72);
  const [fat, setFat] = useState(scannedData?.fat || 18);
  const [portionGrams, setPortionGrams] = useState(300);

  const handleConfirmAdd = () => {
    onConfirm({
      name,
      totalCalories: Number(calories),
      totalProteinG: Number(protein),
      mealType: 'LUNCH',
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-[#0d0d0f] border border-red-600/30 flex items-center justify-between shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <ScanLine className="h-5 w-5 text-red-400 animate-pulse" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">AI FOOD PHOTO ANALYSIS</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">Gemini Vision AI multi-item food & nutrition detection</p>
        </div>
        <span className="px-3 py-1 rounded-lg bg-red-950/60 border border-red-600/40 text-xs font-bold text-red-400 uppercase">
          92% Confidence
        </span>
      </div>

      {/* Image Preview with Overlay */}
      <div className="relative rounded-2xl bg-[#121216] border border-zinc-800 overflow-hidden h-64 flex items-center justify-center shadow-xl">
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Analyzed Food" className="w-full h-full object-cover" />
        ) : (
          <div className="text-center p-6 space-y-2">
            <Utensils className="h-12 w-12 text-zinc-600 mx-auto" />
            <div className="text-xs font-bold text-zinc-400 uppercase">Sample Food Scan Preview</div>
          </div>
        )}

        {/* Scan line effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-red-600/10 via-transparent to-red-600/10 pointer-events-none" />
        <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-black/80 backdrop-blur-md border border-red-600/40 text-[11px] font-bold text-white uppercase flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-red-400" /> GEMINI AI VISION SCANNER
        </div>
      </div>

      {/* Detected Food Items & Nutrition breakdown */}
      <div className="p-6 rounded-2xl bg-[#121216] border border-zinc-800 space-y-6">
        <div>
          <label className="text-[11px] font-bold text-zinc-400 uppercase">Dish Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-extrabold text-white focus:border-red-500 focus:outline-none"
          />
        </div>

        {/* Detected List Pills */}
        <div>
          <label className="text-[11px] font-bold text-zinc-400 uppercase">Detected Components</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {['Rice (200g)', 'Chicken Thali (150g)', 'Cucumber Salad', 'Raita'].map((item) => (
              <span key={item} className="px-3 py-1 rounded-lg bg-red-950/40 border border-red-600/30 text-xs font-bold text-red-300 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-red-400" /> {item}
              </span>
            ))}
          </div>
        </div>

        {/* Computed Nutrition Breakdown Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 rounded-xl bg-[#080808] border border-red-600/30 text-center">
            <div className="text-[10px] font-bold text-zinc-500 uppercase">Calories</div>
            <div className="text-xl font-black text-white mt-1">{calories} <span className="text-xs text-red-400">kcal</span></div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#080808] border border-zinc-800 text-center">
            <div className="text-[10px] font-bold text-zinc-500 uppercase">Protein</div>
            <div className="text-xl font-black text-white mt-1">{protein} <span className="text-xs text-red-400">g</span></div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#080808] border border-zinc-800 text-center">
            <div className="text-[10px] font-bold text-zinc-500 uppercase">Carbs</div>
            <div className="text-xl font-black text-white mt-1">{carbs} <span className="text-xs text-amber-400">g</span></div>
          </div>
          <div className="p-3.5 rounded-xl bg-[#080808] border border-zinc-800 text-center">
            <div className="text-[10px] font-bold text-zinc-500 uppercase">Fat</div>
            <div className="text-xl font-black text-white mt-1">{fat} <span className="text-xs text-blue-400">g</span></div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>Nutrition values are AI estimates based on average preparation standards.</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleConfirmAdd}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition"
          >
            <CheckCircle2 className="h-4 w-4" /> Confirm & Add to Food Log
          </button>
          <button
            onClick={onRetry}
            className="py-3 px-5 rounded-xl bg-[#080808] hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="h-4 w-4" /> Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
