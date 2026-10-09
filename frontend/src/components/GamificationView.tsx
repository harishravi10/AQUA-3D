import React from 'react';
import { Award, Trophy, Flame, Zap, Sun, Star, Users, Crown, Shield, Lock, CheckCircle2 } from 'lucide-react';
import { AchievementItem, UserProfile } from '../types';

interface GamificationViewProps {
  achievements: AchievementItem[];
  profile: UserProfile | null;
  onToggleGamification: (enabled: boolean) => Promise<void>;
}

export const GamificationView: React.FC<GamificationViewProps> = ({
  achievements,
  profile,
  onToggleGamification,
}) => {
  const isEnabled = profile?.gamification_enabled ?? true;

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'droplet': return <Award className="w-5 h-5 text-cyan-400" />;
      case 'trophy': return <Trophy className="w-5 h-5 text-amber-400" />;
      case 'flame': return <Flame className="w-5 h-5 text-orange-400" />;
      case 'zap': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'crown': return <Crown className="w-5 h-5 text-purple-400" />;
      case 'sun': return <Sun className="w-5 h-5 text-amber-300" />;
      case 'star': return <Star className="w-5 h-5 text-sky-400" />;
      case 'users': return <Users className="w-5 h-5 text-emerald-400" />;
      default: return <Award className="w-5 h-5 text-cyan-400" />;
    }
  };

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyan-500/20">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Achievements & Droppy Companion</span>
          </h2>
          <p className="text-xs text-slate-400">
            Celebrate habit consistency and unlock hydration milestones
          </p>
        </div>

        {/* Gamification On/Off Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-300">Gamification:</span>
          <button
            onClick={() => onToggleGamification(!isEnabled)}
            className={`px-2.5 py-0.5 rounded text-xs font-semibold transition-all ${
              isEnabled
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            {isEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Mascot Hero Card */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90">
        {/* Animated Droppy Mascot */}
        <div className="relative w-28 h-28 flex items-center justify-center select-none">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-500 p-1 animate-mascot shadow-2xl flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center relative overflow-hidden">
              {/* Droppy Face */}
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
              </div>
              <div className="w-3 h-1.5 rounded-b-full bg-cyan-400" />
              {/* Cheerful highlight */}
              <div className="absolute top-2 left-4 w-3 h-3 rounded-full bg-white/30 pointer-events-none" />
            </div>
          </div>
          <span className="absolute -bottom-2 text-[10px] font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded-full border border-cyan-500/30">
            Droppy
          </span>
        </div>

        {/* Mascot Speech & Stats */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h3 className="font-extrabold text-white text-base">Droppy says:</h3>
            <span className="text-[11px] text-cyan-400 font-medium bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              Streak: {profile?.current_streak || 0} Days 🔥
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            {(profile?.current_streak || 0) >= 7
              ? "Incredible focus! You're maintaining a full weekly hydration flow. Your energy, cellular health, and cognitive stamina are performing at their peak!"
              : "Steady sips make great days! Remember: pacing water across your afternoon beats chugging a whole bottle at night. Let's keep your streak glowing!"}
          </p>

          <div className="mt-3 flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
            <span>
              Unlocked: <strong className="text-white">{unlockedCount}</strong> / {achievements.length} Badges
            </span>
            <span>•</span>
            <span>
              Total Fluid: <strong className="text-cyan-300">{profile?.total_volume_logged_ml.toLocaleString()} ml</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Achievements Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((a) => (
          <div
            key={a.id}
            className={`glass-panel p-4 flex flex-col justify-between transition-all ${
              a.unlocked
                ? 'border-cyan-500/40 bg-slate-900/80 shadow-md'
                : 'opacity-65 border-slate-800 bg-slate-950/60'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center p-2 ${
                    a.unlocked ? 'bg-cyan-500/20 border border-cyan-400/40' : 'bg-slate-900 border border-slate-800'
                  }`}
                >
                  {getBadgeIcon(a.icon)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">{a.title}</h4>
                  <span className="text-[10px] text-slate-500 capitalize">{a.category}</span>
                </div>
              </div>
              {a.unlocked ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </div>

            <p className="text-xs text-slate-300 leading-normal mb-3">{a.description}</p>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-400">
                  {a.unlocked ? 'Unlocked' : 'In Progress'}
                </span>
                <span className="font-semibold text-cyan-300">{a.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    a.unlocked
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-400'
                      : 'bg-gradient-to-r from-cyan-600 to-sky-500'
                  }`}
                  style={{ width: `${a.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
