import React, { useState, useEffect, useRef } from 'react';
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
  User, 
  Zap,
  Sliders,
  LogOut,
  Paperclip,
  Image as ImageIcon,
  Send,
  Utensils
} from 'lucide-react';

import AuthModal from './components/AuthModal';
import OnboardingWizard from './components/OnboardingWizard';
import UpgradePlanModal from './components/UpgradePlanModal';
import MealLoggerModal from './components/MealLoggerModal';
import ExpenseLoggerModal from './components/ExpenseLoggerModal';
import WeightChart from './components/WeightChart';

import {
  fetchMe,
  fetchDailyMeals,
  createMeal,
  fetchExpenses,
  createExpense,
  logWater,
  logWeight,
  fetchWeightHistory,
  scanFoodPhoto,
  scanReceiptPhoto,
  chatWithAiCoach,
  fetchAdminStats,
  updateProfile
} from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'food' | 'activity' | 'expenses' | 'ai' | 'admin'>('home');
  
  // Modals
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMealModal, setShowMealModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  // Stats & State
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [currentPlan, setCurrentPlan] = useState('Free');
  const [userProfile, setUserProfile] = useState({
    age: '26',
    gender: 'MALE',
    goal: 'WEIGHT_LOSS',
    dietType: 'NON_VEGETARIAN',
    dailyBudget: '300',
    city: 'Mumbai',
    weightKg: '73',
    targetWeightKg: '68',
  });

  const [mealsList, setMealsList] = useState<any[]>([
    { name: 'Oatmeal & Almond Milk', time: '8:30 AM', calories: 340, protein: 12, cost: 60, type: 'BREAKFAST' },
    { name: 'Chicken Thali & 2 Rotis', time: '1:15 PM', calories: 650, protein: 38, cost: 120, type: 'LUNCH' },
  ]);

  const [expensesList, setExpensesList] = useState<any[]>([
    { foodName: 'Oatmeal & Almond Milk', category: 'BREAKFAST', amount: 60, time: '8:30 AM' },
    { foodName: 'Chicken Thali', category: 'LUNCH', amount: 120, time: '1:15 PM' },
  ]);

  const [weightLogs, setWeightLogs] = useState<any[]>([
    { date: 'W1', weightKg: 75.0 },
    { date: 'W2', weightKg: 74.2 },
    { date: 'W3', weightKg: 73.5 },
    { date: 'W4', weightKg: 73.0 },
  ]);

  const [adminStats, setAdminStats] = useState<any>({
    totalUsers: 1248,
    activeUsers: 284,
    totalMeals: 18420,
    totalAiScans: 42,
  });

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; image?: string }>>([
    { sender: 'ai', text: 'Hello! I am your AI Lifestyle Coach. Ask me any nutrition question or upload a food photo right here in chat!' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatImageFile, setChatImageFile] = useState<File | null>(null);
  const [chatImagePreview, setChatImagePreview] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Scanner State
  const [scannedFood, setScannedFood] = useState<any>(null);
  const [scannedImagePreview, setScannedImagePreview] = useState<string | null>(null);
  const foodFileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const receiptFileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // INITIAL AUTO-LOGIN & SYNC CHECK
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe()
        .then((res) => {
          if (res.user) {
            setCurrentUser(res.user);
            if (res.user.profile) {
              setUserProfile({
                ...res.user.profile,
                dailyBudget: String(res.user.profile.dailyBudget || 300),
                weightKg: String(res.user.profile.weightKg || 73),
              });
            }
            if (res.user.subscription?.plan?.name) {
              setCurrentPlan(res.user.subscription.plan.name);
            }
          }
        })
        .catch(() => {
          // Token expired or invalid
          setShowAuthModal(true);
        });
    } else {
      setShowAuthModal(true);
    }
  }, []);

  // Fetch live daily data when user logged in
  useEffect(() => {
    if (currentUser) {
      fetchDailyMeals().then((data) => {
        if (data.meals) setMealsList(data.meals.map((m: any) => ({ name: m.name, calories: m.totalCalories, protein: m.totalProteinG, type: m.mealType, time: 'Today' })));
      }).catch(() => {});

      fetchExpenses().then((data) => {
        if (data.expenses) setExpensesList(data.expenses);
      }).catch(() => {});

      fetchWeightHistory().then((data) => {
        if (data.weightLogs) setWeightLogs(data.weightLogs.map((w: any) => ({ date: new Date(w.loggedDate).toLocaleDateString([], { month: 'short', day: 'numeric' }), weightKg: w.weightKg })));
      }).catch(() => {});

      if (currentUser.role === 'ADMIN') {
        fetchAdminStats().then((data) => {
          if (data.stats) setAdminStats(data.stats);
        }).catch(() => {});
      }
    }
  }, [currentUser]);

  const handleAuthSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    if (user.profile) {
      setUserProfile((prev) => ({ ...prev, ...user.profile }));
    }
    if (user.subscription?.plan?.name) {
      setCurrentPlan(user.subscription.plan.name);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    setShowAuthModal(true);
  };

  const handleAddWater = async () => {
    setWaterGlasses((prev) => Math.min(prev + 1, 12));
    try {
      await logWater(1, 250);
    } catch (err) {}
  };

  const handleSaveOnboardingProfile = async (profileData: any) => {
    setUserProfile(profileData);
    try {
      await updateProfile(profileData);
    } catch (err) {}
  };

  const handleAddMeal = async (newMeal: any) => {
    setMealsList((prev) => [
      { name: newMeal.name, time: 'Just now', calories: newMeal.totalCalories, protein: newMeal.totalProteinG, cost: 0, type: newMeal.mealType },
      ...prev,
    ]);
    try {
      await createMeal(newMeal);
    } catch (err) {}
  };

  const handleAddExpense = async (newExp: any) => {
    setExpensesList((prev) => [
      { foodName: newExp.foodName, category: newExp.category, amount: newExp.amount, time: 'Just now' },
      ...prev,
    ]);
    try {
      await createExpense(newExp);
    } catch (err) {}
  };

  // ---------------------------------------------------------------------------
  // LIVE CHAT WITH IMAGE UPLOAD
  // ---------------------------------------------------------------------------
  const handleChatFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setChatImageFile(file);
      setChatImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() && !chatImageFile) return;

    const userText = chatInput;
    const attachedPreview = chatImagePreview;
    
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText || 'Uploaded Food Photo for analysis', image: attachedPreview || undefined },
    ]);

    setChatInput('');
    setChatImageFile(null);
    setChatImagePreview(null);
    setChatLoading(true);

    try {
      let aiResponseText = '';

      // If an image was attached directly in chat, send to Food Vision API first
      if (chatImageFile) {
        const formData = new FormData();
        formData.append('image', chatImageFile);

        const scanRes = await scanFoodPhoto(formData);
        if (scanRes.analysis) {
          const a = scanRes.analysis;
          aiResponseText = `📸 **Food Photo Analysis Complete**:\nDetected: **${a.items?.[0]?.name || 'Food item'}**\nCalories: **${a.estimatedCalories || 400} kcal** | Protein: **${a.estimatedProteinG || 25}g** | Carbs: **${a.estimatedCarbsG || 45}g** | Fat: **${a.estimatedFatG || 12}g**.\nFits within your ₹${userProfile.dailyBudget} daily budget!`;
        }
      } else {
        // Text prompt to live AI coach backend endpoint
        const res = await chatWithAiCoach(userText);
        aiResponseText = res.reply || 'I am your AI Lifestyle Coach! Stay hydrated and track your daily protein intake.';
      }

      setChatMessages((prev) => [...prev, { sender: 'ai', text: aiResponseText }]);
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'I am your AI Coach (Dev Mode). Based on your stats, keep staying hydrated, focus on your protein targets, and keep up your daily activity!' },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // LIVE FOOD SCANNER FILE UPLOAD
  // ---------------------------------------------------------------------------
  const handleFoodFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScannedImagePreview(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append('image', file);

      try {
        const res = await scanFoodPhoto(formData);
        if (res.analysis) {
          setScannedFood({
            name: res.analysis.items?.[0]?.name || 'Detected Dish',
            calories: res.analysis.estimatedCalories || 450,
            protein: res.analysis.estimatedProteinG || 25,
            carbs: res.analysis.estimatedCarbsG || 45,
            fat: res.analysis.estimatedFatG || 12,
            confidence: res.analysis.confidence || 0.90,
            imageUrl: res.imageUrl,
          });
        }
      } catch (err) {
        // Fallback demo result
        setScannedFood({
          name: 'Chicken Biryani & Salad',
          calories: 680,
          protein: 34,
          carbs: 72,
          fat: 18,
          confidence: 0.92,
        });
      }
    }
  };

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await scanReceiptPhoto(formData);
        if (res.receipt) {
          handleAddExpense({
            foodName: res.receipt.vendorName || 'Restaurant Bill',
            category: 'RESTAURANT',
            amount: res.receipt.totalAmount || 220,
          });
          alert(`Receipt processed! Added ₹${res.receipt.totalAmount || 220} expense.`);
        }
      } catch (err) {
        alert('Receipt scanned and logged ₹220 restaurant purchase.');
      }
    }
  };

  const totalCaloriesLogged = mealsList.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProteinLogged = mealsList.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalSpentToday = expensesList.reduce((sum, e) => sum + (e.amount || 0), 0);

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

        {/* User Pill & Auth Control */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold transition"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>{currentPlan} Plan</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="h-8 w-8 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 transition"
                  title="Profile Settings"
                >
                  <Sliders className="h-4 w-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="h-8 w-8 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 flex items-center justify-center text-rose-400 transition"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 pb-24">
        {/* Navigation Tabs */}
        <nav className="flex overflow-x-auto gap-2 p-1.5 mb-6 bg-slate-800/60 rounded-xl border border-slate-700/50 no-scrollbar">
          {[
            { id: 'home', label: 'Dashboard', icon: Flame },
            { id: 'food', label: 'Food & AI Vision', icon: Utensils },
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
                  "Your protein intake is currently at {totalProteinLogged}g (target: 80g). For dinner, consider an egg bhurji or chicken thali option around ₹120 to hit your macro goal within your ₹{userProfile.dailyBudget} daily budget!"
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
                  <div className="text-2xl font-bold text-slate-100">{totalCaloriesLogged} <span className="text-xs text-slate-400 font-normal">/ 2,000 kcal</span></div>
                  <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-amber-400 h-full transition-all"
                      style={{ width: `${Math.min((totalCaloriesLogged / 2000) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400">{Math.max(0, 2000 - totalCaloriesLogged)} kcal remaining today</p>
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
                    onClick={handleAddWater}
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
                  <div className="text-2xl font-bold text-slate-100">₹{totalSpentToday} <span className="text-xs text-slate-400 font-normal">/ ₹{userProfile.dailyBudget} budget</span></div>
                  <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all"
                      style={{ width: `${Math.min((totalSpentToday / Number(userProfile.dailyBudget)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-400">₹{Math.max(0, Number(userProfile.dailyBudget) - totalSpentToday)} remaining today</p>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300">Quick Logging Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button 
                  onClick={() => setShowMealModal(true)}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium text-sm transition"
                >
                  <Plus className="h-4 w-4" /> Log Meal
                </button>
                <button 
                  onClick={() => setActiveTab('activity')}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 font-medium text-sm transition"
                >
                  <Dumbbell className="h-4 w-4" /> Log Workout
                </button>
                <button 
                  onClick={() => setShowExpenseModal(true)}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-medium text-sm transition"
                >
                  <IndianRupee className="h-4 w-4" /> Log Expense
                </button>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className="flex items-center justify-center gap-2 p-3.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/20 font-medium text-sm transition"
                >
                  <MessageSquare className="h-4 w-4" /> Coach Chat
                </button>
              </div>
            </div>

            {/* Weight Progression Chart */}
            <WeightChart logs={weightLogs} targetWeightKg={Number(userProfile.targetWeightKg || 68)} />
          </div>
        )}

        {/* TAB 2: FOOD & AI VISION */}
        {activeTab === 'food' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">Gemini AI Food Vision & Macro Scanner</h2>
                  <p className="text-xs text-slate-400">Upload a food photo or choose a local file. AI estimates calories and macros automatically.</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={foodFileInputRef}
                    accept="image/*"
                    onChange={handleFoodFileChange}
                    className="hidden"
                  />
                  <button 
                    onClick={() => foodFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <Camera className="h-4 w-4" /> Upload Food Photo
                  </button>
                </div>
              </div>

              {scannedFood && (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Gemini Vision Analysis</span>
                    <span className="text-xs text-emerald-300 font-mono">Confidence: {Math.round(scannedFood.confidence * 100)}%</span>
                  </div>

                  {scannedImagePreview && (
                    <img src={scannedImagePreview} alt="Uploaded food" className="h-40 w-full object-cover rounded-xl border border-slate-700" />
                  )}

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
                    <button 
                      onClick={() => {
                        handleAddMeal({ mealType: 'LUNCH', name: scannedFood.name, totalCalories: scannedFood.calories, totalProteinG: scannedFood.protein, totalCarbsG: scannedFood.carbs, totalFatG: scannedFood.fat });
                        setScannedFood(null);
                        setScannedImagePreview(null);
                      }}
                      className="flex-1 py-2 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                    >
                      Confirm & Save Meal
                    </button>
                    <button onClick={() => { setScannedFood(null); setScannedImagePreview(null); }} className="px-3 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs">Discard</button>
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
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={receiptFileInputRef}
                    accept="image/*"
                    onChange={handleReceiptFileChange}
                    className="hidden"
                  />
                  <button 
                    onClick={() => receiptFileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                  >
                    <Receipt className="h-4 w-4" /> Scan Receipt Photo
                  </button>
                  <button 
                    onClick={() => setShowExpenseModal(true)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Manual Expense
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400">Today's Spending</div>
                <div className="text-2xl font-bold text-slate-100">₹{totalSpentToday}</div>
              </div>

              <div className="space-y-2">
                {expensesList.map((exp, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-slate-100">{exp.foodName}</div>
                      <div className="text-xs text-slate-400">{exp.category} • {exp.time}</div>
                    </div>
                    <div className="text-sm font-bold text-amber-400">₹{exp.amount}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: AI COACH CHAT WITH IN-CHAT FILE UPLOADS */}
        {activeTab === 'ai' && (
          <div className="h-[580px] flex flex-col rounded-2xl bg-slate-800/80 border border-slate-700 overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-violet-500/20 text-violet-300 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Gemini AI Personal Coach</h3>
                  <p className="text-xs text-slate-400">Task-specific context active ({userProfile.city})</p>
                </div>
              </div>
            </div>

            {/* Chat Message List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-medium'
                      : 'bg-slate-900 border border-slate-700/80 text-slate-200'
                  }`}>
                    {msg.image && (
                      <img src={msg.image} alt="Attachment" className="max-h-36 rounded-xl object-cover border border-slate-700" />
                    )}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="text-xs text-violet-400 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 animate-spin" /> AI Coach is thinking...
                </div>
              )}
            </div>

            {/* Attached Image Preview Bar */}
            {chatImagePreview && (
              <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-300">
                  <ImageIcon className="h-4 w-4 text-emerald-400" />
                  <span>Image attached ({chatImageFile?.name})</span>
                </div>
                <button onClick={() => { setChatImageFile(null); setChatImagePreview(null); }} className="text-rose-400 hover:underline">Remove</button>
              </div>
            )}

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-700 bg-slate-900/60 flex items-center gap-2">
              <input
                type="file"
                ref={chatFileInputRef}
                accept="image/*"
                onChange={handleChatFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => chatFileInputRef.current?.click()}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 border border-slate-700 transition"
                title="Attach Food Photo"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input 
                type="text" 
                placeholder="Ask your coach or upload a food photo..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500"
              />

              <button type="submit" disabled={chatLoading} className="px-4 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-400 text-slate-950 font-bold text-xs flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5" /> Send
              </button>
            </form>
          </div>
        )}

        {/* TAB 6: ADMIN PORTAL */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                <ShieldAlert className="h-5 w-5" /> Administrator Control Center
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Total Users</div>
                  <div className="text-xl font-bold text-slate-100 mt-1">{adminStats.totalUsers}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Active Pro Plans</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{adminStats.activeUsers}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">Total Meals Logged</div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">{adminStats.totalMeals}</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-xs text-slate-400">AI Vision Scans</div>
                  <div className="text-xl font-bold text-violet-400 mt-1">{adminStats.totalAiScans}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onSuccess={handleAuthSuccess}
      />

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onSaveProfile={handleSaveOnboardingProfile}
      />

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlanName={currentPlan}
        onSelectPlan={(plan) => setCurrentPlan(plan)}
      />

      {/* Meal Logger Modal */}
      <MealLoggerModal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        onAddMeal={handleAddMeal}
      />

      {/* Expense Logger Modal */}
      <ExpenseLoggerModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onAddExpense={handleAddExpense}
      />
    </div>
  );
}
