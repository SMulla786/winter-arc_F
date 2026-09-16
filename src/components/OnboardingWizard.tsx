import React, { useState } from 'react';
import { User, Target, Utensils, IndianRupee, MapPin, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profileData: any) => void;
}

export default function OnboardingWizard({ isOpen, onClose, onSaveProfile }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    age: '25',
    gender: 'MALE',
    heightCm: '175',
    weightKg: '72',
    targetWeightKg: '68',
    goal: 'WEIGHT_LOSS',
    lifestyleType: 'OFFICE_WORKER',
    dietType: 'NON_VEGETARIAN',
    dailyBudget: '300',
    city: 'Mumbai',
    area: 'Andheri West',
  });

  if (!isOpen) return null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFinish = () => {
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Setup Your Profile</span>
            <h2 className="text-base font-bold text-slate-100">Lifestyle Personalization Wizard</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">Step {step} of 4</span>
        </div>

        {/* Step Indicator Bar */}
        <div className="w-full bg-slate-800 h-1">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5 flex-1">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <User className="h-4 w-4" /> Step 1: Basic Physical Details
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => handleChange('age', e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300">Height (cm)</label>
                  <input
                    type="number"
                    value={formData.heightCm}
                    onChange={(e) => handleChange('heightCm', e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Current Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => handleChange('weightKg', e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
                <Target className="h-4 w-4" /> Step 2: Fitness Goal & Target Weight
              </div>

              <div>
                <label className="text-xs text-slate-300">Target Weight (kg)</label>
                <input
                  type="number"
                  value={formData.targetWeightKg}
                  onChange={(e) => handleChange('targetWeightKg', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300">Primary Goal</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {[
                    { id: 'WEIGHT_LOSS', label: 'Weight Loss' },
                    { id: 'BUILD_MUSCLE', label: 'Build Muscle' },
                    { id: 'MAINTAIN_WEIGHT', label: 'Maintain Weight' },
                    { id: 'IMPROVE_FITNESS', label: 'Improve Fitness' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleChange('goal', g.id)}
                      className={`p-2.5 rounded-xl border text-xs font-medium text-left transition ${
                        formData.goal === g.id
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-400">
                <Utensils className="h-4 w-4" /> Step 3: Diet & Daily Food Budget
              </div>

              <div>
                <label className="text-xs text-slate-300">Dietary Preference</label>
                <select
                  value={formData.dietType}
                  onChange={(e) => handleChange('dietType', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                >
                  <option value="NON_VEGETARIAN">Non-Vegetarian</option>
                  <option value="VEGETARIAN">Vegetarian</option>
                  <option value="EGGETARIAN">Eggetarian</option>
                  <option value="VEGAN">Vegan</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300">Daily Food Budget (₹)</label>
                <input
                  type="number"
                  value={formData.dailyBudget}
                  onChange={(e) => handleChange('dailyBudget', e.target.value)}
                  className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-amber-500 focus:outline-none"
                  placeholder="e.g. 300"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-violet-400">
                <MapPin className="h-4 w-4" /> Step 4: City & Local Area
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300">Local Area / Locality</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => handleChange('area', e.target.value)}
                    className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-violet-950/40 border border-violet-500/30 text-xs text-violet-200">
                ✨ Gemini AI will use your location and ₹{formData.dailyBudget} daily budget to provide personalized local food recommendations!
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-between items-center">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md"
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle className="h-4 w-4" /> Save Profile & Start
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
