import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, ArrowRight, UserPlus, LogIn, Users, Check, X, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';
import { BottleStyle, UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'switch'>('login');

  // Form states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [displayName, setDisplayName] = useState<string>('');
  const [dailyTarget, setDailyTarget] = useState<number>(2500);
  const [bottleStyle, setBottleStyle] = useState<BottleStyle>('futuristic_glass');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [demoAccounts, setDemoAccounts] = useState<Array<{ display_name: string; email: string; user_id: string; tag: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      api.getDemoAccounts().then(setDemoAccounts).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.login(email, password);
      onAuthSuccess(res.user);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.register(email, password, displayName, dailyTarget, bottleStyle);
      onAuthSuccess(res.user);
      onClose();
    } catch (e: any) {
      setErrorMsg(e.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToAccount = async (acc: { user_id: string; display_name: string }) => {
    api.switchAccount(acc.user_id);
    const updated = await api.getProfile();
    onAuthSuccess(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md glass-panel p-6 border border-cyan-500/30 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-sky-400 p-0.5 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">AQUA 3D Identity</h3>
              <p className="text-[11px] text-slate-400">Private multi-user access & authentication</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl mb-4 text-xs font-semibold">
          <button
            onClick={() => { setTab('login'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'login' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'register' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign Up
          </button>
          <button
            onClick={() => { setTab('switch'); setErrorMsg(null); }}
            className={`py-1.5 rounded-lg transition-all ${
              tab === 'switch' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            Switch User
          </button>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1.5">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* 1. Login Tab */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. champion@aqua3d.app"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Sign In to AQUA 3D</span>
            </button>
          </form>
        )}

        {/* 2. Register Tab */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Display Name</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Kai Rivera"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Daily Target (ml)</label>
                <input
                  type="number"
                  min="500"
                  max="8000"
                  step="100"
                  value={dailyTarget}
                  onChange={(e) => setDailyTarget(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bottle Style</label>
                <select
                  value={bottleStyle}
                  onChange={(e) => setBottleStyle(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="futuristic_glass">Glass Cylinder</option>
                  <option value="hydro_flask">Hydro Flask</option>
                  <option value="smart_tumbler">Smart Tumbler</option>
                  <option value="crystal_decanter">Crystal Decanter</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 mt-3"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Create Independent Account</span>
            </button>
          </form>
        )}

        {/* 3. Fast Demo Account Switcher Tab */}
        {tab === 'switch' && (
          <div className="space-y-2 text-xs">
            <p className="text-slate-400 text-[11px] mb-3">
              Switch immediately between separate accounts to test private hydration bottles, distinct streaks, and mutual challenge participation.
            </p>

            <div className="space-y-2">
              {demoAccounts.map((acc) => (
                <div
                  key={acc.user_id}
                  onClick={() => handleSwitchToAccount(acc)}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-400/50 cursor-pointer flex items-center justify-between transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
                      {acc.display_name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-white group-hover:text-cyan-300 block">
                        {acc.display_name}
                      </span>
                      <span className="text-[10px] text-slate-500">{acc.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30">
                    {acc.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
