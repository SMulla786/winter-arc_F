import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';

// User Pages
import LoginPage from './pages/user/LoginPage';
import RegisterPage from './pages/user/RegisterPage';
import ProfileSetupPage from './pages/user/ProfileSetupPage';
import HomeDashboardPage from './pages/user/HomeDashboardPage';
import FoodPage from './pages/user/FoodPage';
import FoodAnalysisPage from './pages/user/FoodAnalysisPage';
import ActivityPage from './pages/user/ActivityPage';
import WorkoutPage from './pages/user/WorkoutPage';
import ExpensesPage from './pages/user/ExpensesPage';
import AIAssistantPage from './pages/user/AIAssistantPage';
import ProgressPage from './pages/user/ProgressPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminUserDetailsPage from './pages/admin/AdminUserDetailsPage';
import AdminPlansPage from './pages/admin/AdminPlansPage';
import AdminSubscriptionsPage from './pages/admin/AdminSubscriptionsPage';
import AdminContentPage from './pages/admin/AdminContentPage';

// Modals
import MealLoggerModal from './components/MealLoggerModal';
import ExpenseLoggerModal from './components/ExpenseLoggerModal';
import AddActivityModal from './components/AddActivityModal';
import WorkoutRunningModal from './components/WorkoutRunningModal';
import ExerciseDetailModal from './components/ExerciseDetailModal';
import UpgradePlanModal from './components/UpgradePlanModal';
import OnboardingWizard from './components/OnboardingWizard';

import {
  fetchMe,
  fetchDailyMeals,
  createMeal,
  deleteMeal,
  fetchExpenses,
  createExpense,
  deleteExpense,
  logWater,
  fetchDailyWater,
  fetchActivities,
  logActivity,
  logWorkoutSession,
  deleteActivity,
  fetchWeightHistory,
  chatWithAiCoach,
  fetchAdminStats,
  updateProfile,
} from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'user' | 'admin'>('user');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentPlan, setCurrentPlan] = useState('Free');

  // User Profile Stats (Default clean baseline)
  const [userProfile, setUserProfile] = useState({
    age: '25',
    gender: 'MALE',
    heightCm: '175',
    weightKg: '72',
    goal: 'WEIGHT_LOSS',
    dietType: 'NON_VEGETARIAN',
    lifestyleType: 'OFFICE_WORKER',
    dailyBudget: '300',
    city: 'Mumbai',
    area: 'Andheri West',
  });

  // Real Logged States (Initialized CLEANLY to 0 / empty for authenticated user)
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [stepsLogged, setStepsLogged] = useState(0);
  const [mealsList, setMealsList] = useState<any[]>([]);
  const [expensesList, setExpensesList] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);

  const [adminStats, setAdminStats] = useState<any>({
    totalUsers: 0,
    activeUsers: 0,
    totalMeals: 0,
    totalAiScans: 0,
  });

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; image?: string }>>([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Lifestyle Coach. Ask me any nutrition question, workout advice, or upload a food photo right here!',
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  // Modals state
  const [showMealModal, setShowMealModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showWorkoutRunningModal, setShowWorkoutRunningModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Selected Exercise & Admin User details state
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [showExerciseDetailModal, setShowExerciseDetailModal] = useState(false);
  const [selectedAdminUser, setSelectedAdminUser] = useState<any>(null);

  // Food Analysis Page data
  const [scannedFoodData, setScannedFoodData] = useState<any>(null);
  const [scannedImagePreview, setScannedImagePreview] = useState<string | null>(null);

  // Initial Auto-Login Sync from Backend
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchMe()
        .then((res) => {
          const u = res.data?.user || res.user;
          if (u) {
            setCurrentUser(u);
            if (u.role === 'ADMIN') setViewMode('admin');
            if (u.profile) setUserProfile((prev) => ({ ...prev, ...u.profile }));
            if (u.subscription?.plan?.name) setCurrentPlan(u.subscription.plan.name);
          }
        })
        .catch(() => {
          // Token expired or server unreachable
          setCurrentUser(null);
          setActiveTab('login');
        });
    } else {
      setCurrentUser(null);
      setActiveTab('login');
    }
  }, []);

  // Sync Real User Backend Data for Today
  useEffect(() => {
    if (currentUser) {
      // 1. Daily Meals
      fetchDailyMeals()
        .then((res) => {
          const payload = res.data || res;
          const mealsArr = payload.meals || [];
          setMealsList(
            mealsArr.map((m: any) => ({
              id: m.id,
              name: m.name,
              calories: m.totalCalories || 0,
              protein: m.totalProteinG || 0,
              type: m.mealType || 'LUNCH',
              time: new Date(m.loggedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }))
          );
        })
        .catch(() => setMealsList([]));

      // 2. Expenses
      fetchExpenses()
        .then((res) => {
          const payload = res.data || res;
          const expArr = payload.expenses || [];
          setExpensesList(
            expArr.map((e: any) => ({
              id: e.id,
              foodName: e.foodName || e.category,
              category: e.category,
              amount: e.amount || 0,
              time: new Date(e.loggedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }))
          );
        })
        .catch(() => setExpensesList([]));

      // 3. Daily Water Intake
      fetchDailyWater()
        .then((res) => {
          const payload = res.data || res;
          if (payload.totalGlasses !== undefined) {
            setWaterGlasses(payload.totalGlasses);
          }
        })
        .catch(() => setWaterGlasses(0));

      // 4. Daily Activities & Steps
      fetchActivities()
        .then((res) => {
          const payload = res.data || res;
          const actArr = payload.activities || [];
          setActivitiesList(actArr);
          const totalSteps = actArr.reduce((sum: number, a: any) => sum + (a.steps || 0), 0);
          setStepsLogged(totalSteps);
        })
        .catch(() => {
          setActivitiesList([]);
          setStepsLogged(0);
        });

      // 5. Weight History
      fetchWeightHistory()
        .then((res) => {
          const payload = res.data || res;
          const wArr = payload.weightLogs || [];
          setWeightLogs(
            wArr.map((w: any) => ({
              date: new Date(w.loggedDate).toLocaleDateString([], { month: 'short', day: 'numeric' }),
              weightKg: w.weightKg,
            }))
          );
        })
        .catch(() => setWeightLogs([]));

      // 6. Admin Stats if Admin
      if (currentUser.role === 'ADMIN') {
        fetchAdminStats()
          .then((res) => {
            const payload = res.data || res;
            if (payload.stats) setAdminStats(payload.stats);
          })
          .catch(() => {});
      }
    }
  }, [currentUser]);

  const handleAuthSuccess = (user: any, token: string) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setViewMode('admin');
      setActiveTab('admin-dashboard');
    } else {
      setViewMode('user');
      setActiveTab('home');
    }
    if (user.profile) setUserProfile((prev) => ({ ...prev, ...user.profile }));
    if (user.subscription?.plan?.name) setCurrentPlan(user.subscription.plan.name);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    setActiveTab('login');
  };

  const handleAddMeal = async (newMeal: any) => {
    try {
      const res = await createMeal(newMeal);
      const created = res.data?.meal || res.meal || newMeal;
      setMealsList((prev) => [
        {
          id: created.id || String(Date.now()),
          name: created.name || newMeal.name,
          time: 'Just now',
          calories: created.totalCalories || newMeal.totalCalories || 0,
          protein: created.totalProteinG || newMeal.totalProteinG || 0,
          cost: 0,
          type: created.mealType || newMeal.mealType || 'LUNCH',
        },
        ...prev,
      ]);
    } catch (err) {
      // Local fallback state update
      setMealsList((prev) => [
        {
          name: newMeal.name,
          time: 'Just now',
          calories: newMeal.totalCalories || 0,
          protein: newMeal.totalProteinG || 0,
          cost: 0,
          type: newMeal.mealType || 'LUNCH',
        },
        ...prev,
      ]);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      await deleteMeal(mealId);
      setMealsList((prev) => prev.filter((m) => m.id !== mealId));
    } catch (err) {
      setMealsList((prev) => prev.filter((m) => m.id !== mealId));
    }
  };

  const handleAddExpense = async (newExp: any) => {
    try {
      const res = await createExpense(newExp);
      const created = res.data?.expense || res.expense || newExp;
      setExpensesList((prev) => [
        {
          id: created.id || String(Date.now()),
          foodName: created.foodName || newExp.foodName || created.category,
          category: created.category || newExp.category,
          amount: created.amount || newExp.amount || 0,
          time: 'Just now',
        },
        ...prev,
      ]);
    } catch (err) {
      setExpensesList((prev) => [
        { foodName: newExp.foodName, category: newExp.category, amount: newExp.amount, time: 'Just now' },
        ...prev,
      ]);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await deleteExpense(expenseId);
      setExpensesList((prev) => prev.filter((e) => e.id !== expenseId));
    } catch (err) {
      setExpensesList((prev) => prev.filter((e) => e.id !== expenseId));
    }
  };

  const mapActivityType = (name: string): string => {
    const upper = (name || '').toUpperCase();
    if (upper.includes('WALK')) return 'WALKING';
    if (upper.includes('RUN')) return 'RUNNING';
    if (upper.includes('CYCL')) return 'CYCLING';
    if (upper.includes('WORKOUT') || upper.includes('GYM')) return 'WORKOUT';
    return 'OTHER';
  };

  const handleAddActivity = async (actData: any) => {
    try {
      const type = mapActivityType(actData.name);
      const stepsToAdd = type === 'WALKING' ? 2500 : type === 'RUNNING' ? 3500 : 500;
      const duration = parseInt(actData.duration) || 30;
      const calories = parseInt(actData.calories) || 150;
      const res = await logActivity({
        activityType: type,
        durationMinutes: duration,
        steps: stepsToAdd,
        caloriesBurned: calories,
      });
      const created = res.data?.activity || res.activity || {
        id: String(Date.now()),
        activityType: type,
        durationMinutes: duration,
        steps: stepsToAdd,
        caloriesBurned: calories,
        loggedAt: new Date().toISOString(),
      };
      setActivitiesList((prev) => [created, ...prev]);
      setStepsLogged((prev) => prev + stepsToAdd);
    } catch (err) {
      setStepsLogged((prev) => prev + 2500);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity(activityId);
      setActivitiesList((prev) => prev.filter((a) => a.id !== activityId));
    } catch (err) {
      setActivitiesList((prev) => prev.filter((a) => a.id !== activityId));
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      await logWorkoutSession({
        workoutPlanId: undefined,
        title: 'Full Body HIIT Blast',
        durationMinutes: 25,
        caloriesBurned: 180,
      });
      setStepsLogged((prev) => prev + 1500);
    } catch (err) {
      setStepsLogged((prev) => prev + 1500);
    }
  };

  const handleAddWater = async () => {
    try {
      await logWater(1, 250);
      setWaterGlasses((prev) => Math.min(prev + 1, 12));
    } catch (err) {
      setWaterGlasses((prev) => Math.min(prev + 1, 12));
    }
  };

  const handleLogWeight = async (weightKg: number) => {
    try {
      const res = await logWeight({ weightKg });
      const created = res.data?.weightLog || res.weightLog;
      const newEntry = {
        date: new Date(created?.loggedDate || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        weightKg: Number(weightKg),
      };
      setWeightLogs((prev) => [...prev, newEntry]);
      setUserProfile((prev) => ({ ...prev, weightKg: String(weightKg) }));
    } catch (err) {
      setWeightLogs((prev) => [
        ...prev,
        {
          date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
          weightKg: Number(weightKg),
        },
      ]);
    }
  };

  const handleSendMessage = async (text: string, imageFile?: File) => {
    const preview = imageFile ? URL.createObjectURL(imageFile) : undefined;
    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: text || 'Uploaded image for analysis', image: preview },
    ]);
    setChatLoading(true);

    try {
      const res = await chatWithAiCoach(text || 'What should I eat tonight?');
      const reply = res.data?.reply || res.reply || `Based on your target (${userProfile.dailyBudget} daily budget), consider eggs or dal!`;
      setChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `✦ AI Recommendation: You have remaining calories today. Egg bhurji with 2 rotis (₹90) fits your ₹${userProfile.dailyBudget} budget and adds 22g protein!`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // If user is explicitly logged out or needs to sign in / register
  if (!currentUser && activeTab === 'login') {
    return <LoginPage onSuccess={handleAuthSuccess} onNavigateRegister={() => setActiveTab('register')} />;
  }
  if (!currentUser && activeTab === 'register') {
    return <RegisterPage onSuccess={handleAuthSuccess} onNavigateLogin={() => setActiveTab('login')} />;
  }

  // Calculated totals & dynamic user level stats
  const totalCaloriesLogged = mealsList.reduce((sum, m) => sum + (m.calories || 0), 0);
  const totalProteinLogged = mealsList.reduce((sum, m) => sum + (m.protein || 0), 0);
  const totalSpentToday = expensesList.reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalUserActivityXP = (mealsList.length * 20) + (waterGlasses * 5) + Math.floor(stepsLogged / 500) + (expensesList.length * 10);
  const userLevel = Math.max(1, Math.floor(totalUserActivityXP / 100) + 1);
  const userXp = totalUserActivityXP % 100;
  const dayStreak = currentUser?.createdAt
    ? Math.max(1, Math.ceil((Date.now() - new Date(currentUser.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
    : 1;
  const displayName = currentUser?.name || (currentUser?.email ? currentUser.email.split('@')[0] : 'User');

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans bg-grimoire-pattern selection:bg-red-600 selection:text-white">
      {/* Header Bar */}
      <Header
        currentUser={currentUser}
        currentPlan={currentPlan}
        userLevel={userLevel}
        userXp={userXp}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
        onOpenProfile={() => setActiveTab('profile-setup')}
        onLogout={handleLogout}
        viewMode={viewMode}
        onToggleViewMode={(mode) => {
          setViewMode(mode);
          setActiveTab(mode === 'admin' ? 'admin-dashboard' : 'home');
        }}
      />

      {/* Main Body Layout with Desktop Sidebar & Content Panel */}
      <div className="flex-1 flex w-full">
        <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} viewMode={viewMode} />

        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-8 overflow-y-auto">
          {/* USER PAGES (11 Pages) */}
          {activeTab === 'home' && (
            <HomeDashboardPage
              userName={displayName}
              userLevel={userLevel}
              userXp={userXp}
              dayStreak={dayStreak}
              totalCaloriesLogged={totalCaloriesLogged}
              calorieTarget={userProfile.goal === 'BUILD_MUSCLE' ? 2400 : 2000}
              totalProteinLogged={totalProteinLogged}
              proteinTarget={130}
              stepsLogged={stepsLogged}
              stepsTarget={10000}
              waterGlasses={waterGlasses}
              waterTarget={8}
              totalSpentToday={totalSpentToday}
              dailyBudget={Number(userProfile.dailyBudget || 300)}
              mealsList={mealsList}
              onOpenMealModal={() => setShowMealModal(true)}
              onOpenExpenseModal={() => setShowExpenseModal(true)}
              onOpenActivityModal={() => setShowActivityModal(true)}
              onAddWater={handleAddWater}
              onNavigateAi={() => setActiveTab('ai')}
              onNavigateWorkout={() => setActiveTab('workout')}
              onNavigateFood={() => setActiveTab('food')}
            />
          )}

          {activeTab === 'food' && (
            <FoodPage
              mealsList={mealsList}
              onOpenMealModal={() => setShowMealModal(true)}
              onDeleteMeal={handleDeleteMeal}
            />
          )}

          {activeTab === 'food-analysis' && (
            <FoodAnalysisPage
              scannedData={scannedFoodData}
              imagePreviewUrl={scannedImagePreview}
              onConfirm={(meal) => {
                handleAddMeal(meal);
                setActiveTab('food');
              }}
              onRetry={() => setShowMealModal(true)}
            />
          )}

          {activeTab === 'activity' && (
            <ActivityPage
              stepsLogged={stepsLogged}
              stepsTarget={10000}
              activitiesList={activitiesList}
              onOpenActivityModal={() => setShowActivityModal(true)}
              onDeleteActivity={handleDeleteActivity}
            />
          )}

          {activeTab === 'workout' && (
            <WorkoutPage
              onStartWorkout={() => setShowWorkoutRunningModal(true)}
              onOpenExerciseDetails={(ex) => {
                setSelectedExercise(ex);
                setShowExerciseDetailModal(true);
              }}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesPage
              expensesList={expensesList}
              dailyBudget={Number(userProfile.dailyBudget || 300)}
              onOpenExpenseModal={() => setShowExpenseModal(true)}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'ai' && (
            <AIAssistantPage
              chatMessages={chatMessages}
              chatLoading={chatLoading}
              onSendMessage={handleSendMessage}
              userBudget={userProfile.dailyBudget}
            />
          )}

          {activeTab === 'progress' && <ProgressPage weightLogs={weightLogs} onLogWeight={handleLogWeight} />}

          {activeTab === 'profile-setup' && (
            <ProfileSetupPage userProfile={userProfile} onSave={(prof) => setUserProfile(prof)} />
          )}

          {activeTab === 'login' && (
            <LoginPage onSuccess={handleAuthSuccess} onNavigateRegister={() => setActiveTab('register')} />
          )}

          {activeTab === 'register' && (
            <RegisterPage onSuccess={handleAuthSuccess} onNavigateLogin={() => setActiveTab('login')} />
          )}

          {/* ADMIN PAGES (6 Pages) */}
          {activeTab === 'admin-dashboard' && (
            <AdminDashboardPage
              stats={adminStats}
              onNavigateUsers={() => setActiveTab('admin-users')}
              onNavigatePlans={() => setActiveTab('admin-plans')}
              onNavigateSubscriptions={() => setActiveTab('admin-subscriptions')}
              onNavigateContent={() => setActiveTab('admin-content')}
            />
          )}

          {activeTab === 'admin-users' && (
            <AdminUsersPage
              onSelectUser={(u) => {
                setSelectedAdminUser(u);
                setActiveTab('admin-user-details');
              }}
            />
          )}

          {activeTab === 'admin-user-details' && (
            <AdminUserDetailsPage
              selectedUser={selectedAdminUser}
              onBack={() => setActiveTab('admin-users')}
            />
          )}

          {activeTab === 'admin-plans' && <AdminPlansPage />}

          {activeTab === 'admin-subscriptions' && <AdminSubscriptionsPage />}

          {activeTab === 'admin-content' && <AdminContentPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} viewMode={viewMode} />

      {/* Dialog Modals / Drawers System (NOT separate pages) */}
      <MealLoggerModal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        onAddMeal={handleAddMeal}
        onNavigateAnalysis={(data, url) => {
          setScannedFoodData(data);
          setScannedImagePreview(url);
          setActiveTab('food-analysis');
        }}
      />

      <ExpenseLoggerModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        onAddExpense={handleAddExpense}
      />

      <AddActivityModal
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onAddActivity={handleAddActivity}
      />

      <WorkoutRunningModal
        isOpen={showWorkoutRunningModal}
        onClose={() => setShowWorkoutRunningModal(false)}
        onCompleteWorkout={handleCompleteWorkout}
      />

      <ExerciseDetailModal
        isOpen={showExerciseDetailModal}
        exercise={selectedExercise}
        onClose={() => setShowExerciseDetailModal(false)}
      />

      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentPlanName={currentPlan}
        onSelectPlan={(plan) => setCurrentPlan(plan)}
      />

      <OnboardingWizard
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onSaveProfile={(prof) => setUserProfile(prof)}
      />
    </div>
  );
}
