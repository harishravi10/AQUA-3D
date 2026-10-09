import React from 'react';
import { Droplets, Flame, Sun, Moon, Bell, Settings, Award, Users, Bot, BarChart3, WifiOff } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenAI: () => void;
  onOpenAuth: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  offlineCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenAI,
  onOpenAuth,
  isDarkMode,
  onToggleTheme,
  offlineCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/75 border-b border-cyan-500/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onTabChange('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-400 to-blue-600 p-0.5 shadow-md group-hover:glow-cyan transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Droplets className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400">
                AQUA 3D
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">Next-Gen Hydration Companion</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-cyan-500/15">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Analytics
          </button>
          <button
            onClick={() => onTabChange('gamification')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'gamification'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Rewards
          </button>
          <button
            onClick={() => onTabChange('challenges')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'challenges'
                ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Challenges
          </button>
        </nav>

        {/* Right Action Icons & Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline Pending Queue Indicator */}
          {offlineCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2 py-1 rounded-full animate-pulse">
              <WifiOff className="w-3 h-3" />
              <span>{offlineCount} queued</span>
            </div>
          )}

          {/* Streak Counter */}
          <div
            title="Continuous Daily Hydration Streak"
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2.5 py-1 rounded-full text-xs font-semibold select-none shadow-sm"
          >
            <Flame className="w-4 h-4 text-amber-400 animate-pulse fill-amber-400/30" />
            <span>{profile?.current_streak || 0}</span>
            <span className="text-[10px] text-amber-300/70 hidden sm:inline">days</span>
          </div>

          {/* AI Hydration Assistant Trigger Button */}
          <button
            id="btn-ai-assistant"
            onClick={onOpenAI}
            className="relative p-2 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-sky-400/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 hover:glow-cyan-sm transition-all"
            title="Ask AI Hydration Assistant"
          >
            <Bot className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full" />
          </button>

          {/* Dark/Light Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Settings Trigger */}
          <button
            id="btn-settings-modal"
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
            title="Hydration & Notification Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Mini Badge & Auth Trigger */}
          <button
            id="btn-auth-user"
            onClick={onOpenAuth}
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-400/50 cursor-pointer group transition-all"
            title="Account, Login & Multi-User Switcher"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm group-hover:scale-105 transition-transform">
              {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 hidden sm:inline max-w-[100px] truncate">
              {profile?.display_name || 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
