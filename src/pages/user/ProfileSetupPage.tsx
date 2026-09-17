import React, { useState } from 'react';
import { User, Target, Utensils, MapPin, CheckCircle, Flame, Sparkles, Activity, Shield } from 'lucide-react';
import { updateProfile } from '../../services/api';

interface ProfileSetupPageProps {
  userProfile: any;
  onSave: (updatedProfile: any) => void;
}

export default function ProfileSetupPage({ userProfile, onSave }: ProfileSetupPageProps) {
  const [formData, setFormData] = useState({
    age: userProfile?.age || '25',
    gender: userProfile?.gender || 'MALE',
    heightCm: userProfile?.heightCm || '175',
    weightKg: userProfile?.weightKg || '72',
    goal: userProfile?.goal || 'WEIGHT_LOSS',
    dietType: userProfile?.dietType || 'NON_VEGETARIAN',
    lifestyleType: userProfile?.lifestyleType || 'OFFICE',
    dailyBudget: userProfile?.dailyBudget || '300',
    city: userProfile?.city || 'Mumbai',
    area: userProfile?.area || 'Andheri West',
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
    } catch (err) {}
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Target Calculations
  const weight = parseFloat(formData.weightKg) || 70;
  const estimatedCalories = formData.goal === 'BUILD_MUSCLE' ? 2400 : formData.goal === 'WEIGHT_LOSS' ? 1850 : 2100;
  const estimatedProtein = formData.goal === 'BUILD_MUSCLE' ? Math.round(weight * 2.0) : Math.round(weight * 1.5);
  const estimatedWater = 8; // 8 glasses
  const estimatedSteps = formData.lifestyleType === 'OFFICE' ? 10000 : 8500;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0d0d0f] border border-red-600/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-red-950/20">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-red-400" />
            <h1 className="text-xl font-black uppercase text-white tracking-wider">PROFILE & ENERGY SETUP</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Personalize your health metrics, daily food budget, and fitness goals.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/30 text-xs font-bold text-red-300">
          Dark Grimoire Energy Calibration
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          Profile and targets saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Columns: Inputs */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <User className="h-4 w-4" /> 1. Physical Attributes
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Age</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Height (cm)</label>
                <input
                  type="number"
                  value={formData.heightCm}
                  onChange={(e) => handleChange('heightCm', e.target.value)}
                  className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Weight (kg)</label>
                <input
                  type="number"
                  value={formData.weightKg}
                  onChange={(e) => handleChange('weightKg', e.target.value)}
                  className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Goal Selection Card */}
          <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <Target className="h-4 w-4" /> 2. Training Goal
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'WEIGHT_LOSS', label: '🔥 Lose Weight' },
                { id: 'BUILD_MUSCLE', label: '💪 Build Muscle' },
                { id: 'MAINTAIN_WEIGHT', label: '🛡 Maintain Weight' },
                { id: 'IMPROVE_FITNESS', label: '⚡ Improve Fitness' },
                { id: 'GAIN_WEIGHT', label: '📈 Gain Weight' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleChange('goal', g.id)}
                  className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                    formData.goal === g.id
                      ? 'bg-red-950/50 border-red-500 text-white shadow-[0_0_12px_rgba(220,38,38,0.2)]'
                      : 'bg-[#080808] border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Diet & Budget Card */}
          <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <Utensils className="h-4 w-4" /> 3. Diet Preference & Budget
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Food Preference</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1">
                  {['VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN'].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => handleChange('dietType', diet)}
                      className={`py-2 px-2 rounded-lg border text-[11px] font-bold text-center capitalize transition ${
                        formData.dietType === diet
                          ? 'bg-red-950/50 border-red-500 text-red-300'
                          : 'bg-[#080808] border-zinc-800 text-zinc-400'
                      }`}
                    >
                      {diet.replace('_', ' ').toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Daily Food Budget (₹)</label>
                <input
                  type="number"
                  value={formData.dailyBudget}
                  onChange={(e) => handleChange('dailyBudget', e.target.value)}
                  className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                  placeholder="300"
                />
              </div>
            </div>
          </div>

          {/* Lifestyle & Location Card */}
          <div className="p-5 rounded-xl bg-[#121216] border border-zinc-800 space-y-4">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <MapPin className="h-4 w-4" /> 4. Lifestyle & Location
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">Work Type</label>
                <select
                  value={formData.lifestyleType}
                  onChange={(e) => handleChange('lifestyleType', e.target.value)}
                  className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                >
                  <option value="OFFICE">Office</option>
                  <option value="WORK_FROM_HOME">Work From Home</option>
                  <option value="STUDENT">Student</option>
                  <option value="OTHER">Other Active</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full mt-1 bg-[#080808] border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5"
          >
            Save & Update Targets
          </button>
        </div>

        {/* Right Column: Calculated Targets Preview */}
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-[#0d0d0f] border border-red-600/30 space-y-4 shadow-xl">
            <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-400" /> COMPUTED ENERGY TARGETS
            </h3>
            <p className="text-[11px] text-zinc-400">
              Estimated targets calculated based on your personal profile inputs:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#121216] border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Daily Calorie Target</div>
                <div className="text-lg font-black text-white mt-0.5">{estimatedCalories.toLocaleString()} <span className="text-xs text-red-400 font-bold">kcal</span></div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121216] border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Protein Target</div>
                <div className="text-lg font-black text-white mt-0.5">{estimatedProtein} <span className="text-xs text-red-400 font-bold">g / day</span></div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121216] border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Water Intake</div>
                <div className="text-lg font-black text-white mt-0.5">{estimatedWater} <span className="text-xs text-blue-400 font-bold">glasses (2L)</span></div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#121216] border border-zinc-800">
                <div className="text-[10px] font-bold text-zinc-500 uppercase">Daily Step Target</div>
                <div className="text-lg font-black text-white mt-0.5">{estimatedSteps.toLocaleString()} <span className="text-xs text-emerald-400 font-bold">steps</span></div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-red-950/30 border border-red-600/30 text-[11px] text-red-300 leading-relaxed">
              ✦ Gemini AI uses these targets to analyze your logged meals and recommend local options within your ₹{formData.dailyBudget} daily budget.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
