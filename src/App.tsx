import React, { useState } from 'react';
import { 
  Flame, 
  Footprints, 
  Droplets, 
  IndianRupee, 
  Sparkles, 
  Plus, 
  Camera, 
  Dumbbell, 
  Receipt, 
  MessageSquare, 
  ShieldAlert, 
  Check, 
  Utensils, 
  TrendingUp, 
  User, 
  Zap,
  Sliders
} from 'lucide-react';
import OnboardingWizard from './components/OnboardingWizard';
import UpgradePlanModal from './components/UpgradePlanModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'food' | 'activity' | 'expenses' | 'ai' | 'admin'>('home');
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [userProfile, setUserProfile] = useState({
    age: '25',
    gender: 'MALE',
    goal: 'WEIGHT_LOSS',
    dietType: 'NON_VEGETARIAN',
    dailyBudget: '300',
    city: 'Mumbai',
  });

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: 'Hello! I am your AI Lifestyle Coach. How can I help you reach your nutrition or fitness goals today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [foodInput, setFoodInput] = useState('');
  const [scannedFood, setScannedFood] = useState<any>(null);

  const addWater = () => setWaterGlasses((prev) => Math.min(prev + 1, 12));

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      let reply = `Based on your profile (${userProfile.city}, ₹${userProfile.dailyBudget}/day budget) and daily intake of 1,240 kcal with 42g protein, consider an Egg Bhurji or Chicken Roti dinner to hit your protein target within budget!`;
      if (userText.toLowerCase().includes('workout') || userText.toLowerCase().includes('exercise')) {
        reply = "Today's recommended workout: 3 sets of 12 Bodyweight Squats, 3 sets of 8 Push-ups, and a 15-minute post-dinner walk!";
      }
      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    }, 600);
  };

  const handleSimulateAiScan = () => {
    setScannedFood({
      name: 'Paneer Tikka & Roti',
      calories: 420,
      protein: 22,
      carbs: 38,
      fat: 14,
      cost: 140,
      confidence: 0.92
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Lifestyle AI
            </h1>
            <p className="text-xs text-slate-400">Personal Health & Budget Assistant</p>
          </div>
        </div>

        {/* User & Plan Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold transition"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{currentPlan} Plan</span>
          </button>

          <button
            onClick={() => setShowOnboarding(true)}
            className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition"
            title="Edit Lifestyle Profile"
          >
            <Sliders className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 pb-24">
        {/* Navigation Tabs */}
        <nav className="flex overflow-x-auto gap-2 p-1.5 mb-6 bg-slate-800/60 rounded-xl border border-slate-700/50 no-scrollbar">
          {[
            { id: 'home', label: 'Dashboard', icon: Flame },
            { id: 'food', label: 'Food & Nutrition', icon: Utensils },
            { id: 'activity', label: 'Activity & Exercises', icon: Dumbbell },
            { id: 'expenses', label: 'Food Expenses', icon: IndianRupee },
            { id: 'ai', label: 'AI Coach Chat', icon: MessageSquare },
            { id: 'admin', label: 'Admin Portal', icon: ShieldAlert },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* TAB 1: HOME DASHBOARD */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* AI Insight Highlight Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-slate-800 border border-violet-500/30 flex items-start gap-3 shadow-lg">
              <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 mt-0.5">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-violet-200">Daily AI Coach Suggestion ({userProfile.city})</h3>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  "Your protein intake is currently at 42g (target: 80g). For dinner, consider an egg bhurji or chicken thali option around ₹120 to hit your macro goal within your ₹{userProfile.dailyBudget} daily budget!"
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('ai')}
                className="px-3 py-1.5 rounded-lg bg-violet-500 hover:bg-violet-400 text-slate-950 font-semibold text-xs transition"
              >
                Ask AI
              </button>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Calories Card */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-3 relative overflow-hidden">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Calories</span>
                  <Flame className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">1,240 <span className="text-xs text-slate-400 font-normal">/ 2,000 kcal</span></div>
                  <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-400 h-full w-[62%]" />
                  </div>
                </div>
                <p className="text-xs text-slate-400">760 kcal remaining today</p>
              </div>

              {/* Steps Card */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-3">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Steps</span>
                  <Footprints className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">6,420 <span className="text-xs text-slate-400 font-normal">/ 10,000</span></div>
                  <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full w-[64%]" />
                  </div>
                </div>
                <p className="text-xs text-slate-400">3,580 steps to hit daily goal</p>
              </div>

              {/* Water Glasses Card */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-3">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Water Intake</span>
                  <Droplets className="h-5 w-5 text-cyan-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-100">{waterGlasses} <span className="text-xs text-slate-400 font-normal">/ 8 glasses</span></div>
                    <p className="text-xs text-cyan-400 mt-1">{waterGlasses * 250} ml logged</p>
                  </div>
                  <button 
                    onClick={addWater}
                    className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition-all font-bold"
                    title="Add 1 Glass"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Food Expenses Card */}
              <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/70 space-y-3">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Food Spending</span>
                  <IndianRupee className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-100">₹180 <span className="text-xs text-slate-400 font-normal">/ ₹{userProfile.dailyBudget} budget</span></div>
                  <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full w-[60%]" />
                  </div>
                </div>
                <p className="text-xs text-slate-400">₹{Math.max(0, Number(userProfile.dailyBudget) - 180)} remaining today</p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Quick Logging Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button 
                  onClick={() => setActiveTab('food')}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium text-sm transition"
                >
                  <Camera className="h-4 w-4" /> AI Food Scan
                </button>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 font-medium text-sm transition"
                >
                  <Dumbbell className="h-4 w-4" /> Log Workout
                </button>
                <button 
                  onClick={() => setActiveTab('expenses')}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-medium text-sm transition"
                >
                  <Receipt className="h-4 w-4" /> Scan Receipt
                </button>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 font-medium text-sm transition"
                >
                  <MessageSquare className="h-4 w-4" /> Coach Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FOOD & NUTRITION */}
        {activeTab === 'food' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">AI Food & Macro Recognition</h2>
                  <p className="text-xs text-slate-400">Take a photo or type what you ate. Gemini estimates nutrition automatically.</p>
                </div>
                <button 
                  onClick={handleSimulateAiScan}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <Camera className="h-4 w-4" /> Simulate Food Photo Scan
                </button>
              </div>

              {scannedFood && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gemini Vision Result</span>
                    <span className="text-xs text-emerald-300 font-mono">Confidence: {Math.round(scannedFood.confidence * 100)}%</span>
                  </div>
                  <div className="text-base font-bold text-slate-100">{scannedFood.name}</div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-slate-900/60 text-xs">
                      <div className="text-slate-400">Calories</div>
                      <div className="font-bold text-orange-400">{scannedFood.calories} kcal</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 text-xs">
                      <div className="text-slate-400">Protein</div>
                      <div className="font-bold text-emerald-400">{scannedFood.protein}g</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 text-xs">
                      <div className="text-slate-400">Carbs</div>
                      <div className="font-bold text-cyan-400">{scannedFood.carbs}g</div>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900/60 text-xs">
                      <div className="text-slate-400">Fat</div>
                      <div className="font-bold text-amber-400">{scannedFood.fat}g</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs">Confirm & Save Meal</button>
                    <button onClick={() => setScannedFood(null)} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">Discard</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVITY */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
              <h2 className="text-lg font-bold text-slate-100">Predefined Exercise Library</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'Bodyweight Squats', category: 'Strength', muscle: 'Legs', diff: 'Beginner', desc: 'Lower body movement targeting quadriceps and glutes.' },
                  { name: 'Push-ups', category: 'Strength', muscle: 'Chest & Arms', diff: 'Beginner', desc: 'Upper body exercise targeting chest, shoulders, and triceps.' },
                  { name: 'Brisk Walking', category: 'Cardio', muscle: 'Full Body', diff: 'Beginner', desc: 'Low impact cardio to burn calories and improve endurance.' },
                  { name: 'Plank Hold', category: 'Core', muscle: 'Abs', diff: 'Intermediate', desc: 'Isometric core stability hold.' },
                ].map((ex, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-100">{ex.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{ex.diff}</span>
                    </div>
                    <p className="text-xs text-slate-400">{ex.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: EXPENSES */}
        {activeTab === 'expenses' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Food Expense Tracking</h2>
                  <p className="text-xs text-slate-400">Monitor food purchases, restaurant bills, and grocery spending.</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-sm flex items-center gap-2">
                  <Receipt className="h-4 w-4" /> Scan Receipt Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI COACH */}
        {activeTab === 'ai' && (
          <div className="h-[550px] flex flex-col rounded-2xl bg-slate-800/80 border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-100">Gemini AI Personal Coach</h3>
                <p className="text-xs text-slate-400">Task-specific context builder active ({userProfile.city})</p>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-medium'
                      : 'bg-slate-900 border border-slate-700/80 text-slate-200'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 bg-slate-900/60 flex gap-2">
              <input 
                type="text" 
                placeholder="Ask your coach anything (e.g. What should I eat for dinner with ₹120?)..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              />
              <button type="submit" className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold text-xs">
                Send
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: ADMIN */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                <ShieldAlert className="h-5 w-5" /> Administrator Control Center
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Total Users</div>
                  <div className="text-xl font-bold text-slate-100 mt-1">1,248</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Active Pro Plans</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">284</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">AI Requests Today</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">18,420</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Est. API Quota Used</div>
                  <div className="text-xl font-bold text-violet-400 mt-1">42%</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSaveProfile={(profile) => setUserProfile(profile)}
      />

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlanName={currentPlan}
        onSelectPlan={(plan) => setCurrentPlan(plan)}
      />
    </div>
  );
}
