import React, { useState } from 'react';
import { Sparkles, User, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onSuccess: (userData: any, token: string) => void;
}

export default function AuthModal({ isOpen, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await loginUser({ email, password });
      } else {
        res = await registerUser({ email, password, name });
      }

      if (res.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) localStorage.setItem('refreshToken', res.refreshToken);
        onSuccess(res.user, res.accessToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    setError('');
    setLoading(true);
    try {
      const demoEmail = role === 'admin' ? 'admin@lifestyle.com' : 'test@lifestyle.com';
      const demoPass = role === 'admin' ? 'Admin@123456' : 'Password@123';
      
      const res = await loginUser({ email: demoEmail, password: demoPass });
      if (res.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
        onSuccess(res.user, res.accessToken);
      }
    } catch (err: any) {
      // Fallback demo login state for offline testing
      const demoUser = {
        id: role === 'admin' ? 'admin-1' : 'demo-1',
        email: role === 'admin' ? 'admin@lifestyle.com' : 'demo@lifestyle.com',
        name: role === 'admin' ? 'System Admin' : 'Demo User',
        role: role === 'admin' ? 'ADMIN' : 'USER',
        profile: { city: 'Mumbai', dailyBudget: 300, goal: 'WEIGHT_LOSS' },
        subscription: { plan: { name: role === 'admin' ? 'Premium' : 'Pro' } },
      };
      localStorage.setItem('accessToken', 'demo-token');
      onSuccess(demoUser, 'demo-token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 text-center space-y-2 border-b border-slate-800 bg-slate-900/60">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 font-bold mx-auto shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-slate-400">
            AI Personal Lifestyle, Nutrition & Fitness Assistant
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs leading-relaxed">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-medium text-slate-300">Full Name</label>
              <div className="relative mt-1">
                <User className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300">Email Address</label>
            <div className="relative mt-1">
              <Mail className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300">Password</label>
            <div className="relative mt-1">
              <Lock className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:opacity-95 transition"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Mode Switcher */}
          <div className="text-center pt-2 text-xs text-slate-400">
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button type="button" onClick={() => setMode('register')} className="text-emerald-400 font-semibold hover:underline">
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already registered?{' '}
                <button type="button" onClick={() => setMode('login')} className="text-emerald-400 font-semibold hover:underline">
                  Sign In
                </button>
              </span>
            )}
          </div>

          {/* Quick Demo Login Buttons */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-[11px] text-center text-slate-400 font-medium">Or 1-Tap Quick Demo Sign In:</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-emerald-400 flex items-center justify-center gap-1"
              >
                <User className="h-3.5 w-3.5" /> Demo User
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-amber-400 flex items-center justify-center gap-1"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin Demo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
