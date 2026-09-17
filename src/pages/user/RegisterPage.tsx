import React, { useState } from 'react';
import { Flame, User, Lock, Mail, ArrowRight } from 'lucide-react';
import { registerUser } from '../../services/api';

interface RegisterPageProps {
  onSuccess: (userData: any, token: string) => void;
  onNavigateLogin: () => void;
}

export default function RegisterPage({ onSuccess, onNavigateLogin }: RegisterPageProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({ email, password, name });
      if (res.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
        onSuccess(res.user, res.accessToken);
      }
    } catch (err: any) {
      // Fallback demo user registration
      const demoUser = {
        id: 'new-user-1',
        email,
        name,
        role: 'USER',
        profile: { city: 'Mumbai', dailyBudget: 300, goal: 'BUILD_MUSCLE' },
        subscription: { plan: { name: 'Free' } },
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
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-700 via-red-500 to-amber-500" />

        <div className="text-center space-y-2 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-950 flex items-center justify-center mx-auto shadow-lg shadow-red-600/40 border border-red-500/40">
            <Flame className="h-8 w-8 text-red-400 animate-pulse" />
          </div>
          <h1 className="text-xl font-black uppercase tracking-wider text-white">
            START YOUR JOURNEY
          </h1>
          <p className="text-xs text-zinc-400">
            Create your account to unlock personalized AI training
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Full Name</label>
            <div className="relative mt-1">
              <User className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="text"
                required
                placeholder="Suhel Khan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#121216] border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

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
                className="w-full bg-[#121216] border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Password</label>
            <div className="relative mt-1">
              <Lock className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121216] border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Confirm Password</label>
            <div className="relative mt-1">
              <Lock className="h-4 w-4 absolute left-3 top-3 text-zinc-500" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#121216] border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition transform hover:-translate-y-0.5"
          >
            {loading ? 'Creating Account...' : 'Create Account & Continue'}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="text-center pt-2 text-xs text-zinc-400">
            Already registered?{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-red-400 font-bold hover:underline"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
