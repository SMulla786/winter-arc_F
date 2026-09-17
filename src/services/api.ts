import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized access, clearing tokens.');
    }
    return Promise.reject(error);
  }
);

// -----------------------------------------------------------------------------
// AUTH API
// -----------------------------------------------------------------------------
export const registerUser = async (data: { email: string; password: string; name: string }) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data: { email: string; password: string }) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const fetchMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

// -----------------------------------------------------------------------------
// PROFILE API
// -----------------------------------------------------------------------------
export const fetchProfile = async () => {
  const res = await api.get('/profile');
  return res.data;
};

export const updateProfile = async (profileData: any) => {
  const res = await api.put('/profile', profileData);
  return res.data;
};

// -----------------------------------------------------------------------------
// MEALS & NUTRITION API
// -----------------------------------------------------------------------------
export const fetchDailyMeals = async (date?: string) => {
  const res = await api.get('/meals/daily', { params: { date } });
  return res.data;
};

export const createMeal = async (mealData: any) => {
  const res = await api.post('/meals', mealData);
  return res.data;
};

// -----------------------------------------------------------------------------
// EXPENSES API
// -----------------------------------------------------------------------------
export const fetchExpenses = async (days: number = 30) => {
  const res = await api.get('/expenses', { params: { days } });
  return res.data;
};

export const createExpense = async (expenseData: any) => {
  const res = await api.post('/expenses', expenseData);
  return res.data;
};

// -----------------------------------------------------------------------------
// ACTIVITIES & EXERCISES API
// -----------------------------------------------------------------------------
export const fetchActivities = async () => {
  const res = await api.get('/activity');
  return res.data;
};

export const logActivity = async (activityData: any) => {
  const res = await api.post('/activity', activityData);
  return res.data;
};

export const fetchExercises = async (search?: string, category?: string) => {
  const res = await api.get('/activity/exercises', { params: { search, category } });
  return res.data;
};

// -----------------------------------------------------------------------------
// TRACKING (WATER & WEIGHT) API
// -----------------------------------------------------------------------------
export const logWater = async (glassCount: number = 1, amountMl: number = 250) => {
  const res = await api.post('/tracking/water', { glassCount, amountMl });
  return res.data;
};

export const fetchDailyWater = async () => {
  const res = await api.get('/tracking/water/daily');
  return res.data;
};

export const logWeight = async (weightData: any) => {
  const res = await api.post('/tracking/weight', weightData);
  return res.data;
};

export const fetchWeightHistory = async () => {
  const res = await api.get('/tracking/weight/history');
  return res.data;
};

// -----------------------------------------------------------------------------
// AI API (VISION, OCR & CHAT)
// -----------------------------------------------------------------------------
export const scanFoodPhoto = async (formData: FormData) => {
  const res = await api.post('/ai/scan-food', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const scanReceiptPhoto = async (formData: FormData) => {
  const res = await api.post('/ai/scan-receipt', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const chatWithAiCoach = async (message: string) => {
  const res = await api.post('/ai/chat', { message });
  return res.data;
};

// -----------------------------------------------------------------------------
// ADMIN API
// -----------------------------------------------------------------------------
export const fetchAdminStats = async () => {
  const res = await api.get('/admin/stats');
  return res.data;
};

export default api;
