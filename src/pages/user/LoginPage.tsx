import React, { useState } from 'react';
import { Flame, User, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { loginUser } from '../../services/api';

interface LoginPageProps {
  onSuccess: (userData: any, token: string) => void;
  onNavigateRegister: () => void;
}

export default function LoginPage({ onSuccess, onNavigateRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginUser({ email, password });
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
      const demoUser = {
        id: role === 'admin' ? 'admin-1' : 'demo-1',
        email: role === 'admin' ? 'admin@lifestyle.com' : 'demo@lifestyle.com',
        name: role === 'admin' ? 'System Admin' : 'Suhel',
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
    <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-4 bg-grimoire-pattern">
      <div className="max-w-md w-full bg-[#0d0d0f] border border-red-600/30 rounded-2xl p-8 shadow-[0_0_50px_rgba(220,38,38,0.15)] relative overflow-hidden">
        {/* Energetic Crimson Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-500 to-amber-500" />

        {/* Logo & Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center mx-auto shadow-lg shadow-red-600/40 border border-red-500/40">
            <Flame className="h-9 w-9 text-red-400 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">
              DARK GRIMOIRE
            </h1>
            <p className="text-xs font-bold text-red-500 tracking-widest uppercase mt-0.5">
              TRAIN YOUR BODY • MASTER YOUR DAY
            </p>
          </div>
          <p className="text-xs text-zinc-400">
            Sign in to access your personal AI training system
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs leading-relaxed">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Email Address</label>
            <div className="relative mt-1">
              <Mail className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="email"
                required
                placeholder="suhel@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121216] border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Password</label>
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Reset link simulated.'); }} className="text-[11px] text-red-400 hover:underline font-semibold">Forgot Password?</a>
            </div>
            <div className="relative mt-1">
              <Lock className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121216] border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500/50 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5"
          >
            {loading ? 'Entering System...' : 'Sign In'}
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Register Link */}
          <div className="text-center pt-2 text-xs text-zinc-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              className="text-red-400 font-bold hover:underline"
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo Sign In */}
          <div className="pt-4 border-t border-zinc-800 space-y-2">
            <div className="text-[11px] text-center text-zinc-500 font-semibold uppercase tracking-wider">Quick Demo Sign In</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('user')}
                className="py-2 px-3 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-red-400 flex items-center justify-center gap-1.5 transition"
              >
                <User className="h-3.5 w-3.5" /> User Demo
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="py-2 px-3 rounded-xl bg-[#121216] hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-amber-400 flex items-center justify-center gap-1.5 transition"
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
