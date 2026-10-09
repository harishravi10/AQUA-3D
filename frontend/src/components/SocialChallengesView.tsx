import React, { useState } from 'react';
import { Users, Plus, Trophy, Flame, Shield, Share2, Check, ArrowRight, UserCheck } from 'lucide-react';
import { Challenge } from '../types';

interface SocialChallengesViewProps {
  challenges: Challenge[];
  onCreateChallenge: (title: string, desc: string, target_daily_ml: number, duration_days: number) => Promise<void>;
  onJoinChallenge: (inviteCode: string) => Promise<void>;
  loading: boolean;
}

export const SocialChallengesView: React.FC<SocialChallengesViewProps> = ({
  challenges,
  onCreateChallenge,
  onJoinChallenge,
  loading,
}) => {
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [targetDailyMl, setTargetDailyMl] = useState<number>(2500);
  const [durationDays, setDurationDays] = useState<number>(7);

  const [joinCode, setJoinCode] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      await onCreateChallenge(title.trim(), description.trim(), targetDailyMl, durationDays);
      setTitle('');
      setDescription('');
      setIsCreateOpen(false);
    }
  };

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinCode.trim()) {
      await onJoinChallenge(joinCode.trim());
      setJoinCode('');
    }
  };

  const copyInvite = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Join/Create controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyan-500/20">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <span>Social Hydration Challenges</span>
          </h2>
          <p className="text-xs text-slate-400">
            Compete in friendly hydration sprints with your crew and leaderboard
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Join with Invite Code Form */}
          <form onSubmit={handleJoinSubmit} className="flex items-center gap-1.5">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Invite Code (e.g. OCEAN7)"
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-cyan-200 placeholder-slate-500 uppercase tracking-wider w-36 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={!joinCode.trim() || loading}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-all disabled:opacity-40"
            >
              Join
            </button>
          </form>

          <button
            id="btn-create-challenge"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map((ch) => (
          <div key={ch.id} className="glass-panel p-5 flex flex-col justify-between space-y-4">
            <div>
              {/* Challenge Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-white text-base">{ch.title}</h3>
                  <span className="text-[11px] text-cyan-400 font-medium">
                    {ch.target_daily_ml.toLocaleString()} ml / day • {ch.duration_days} Days
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {ch.is_joined ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                      <UserCheck className="w-3 h-3" /> Joined
                    </span>
                  ) : (
                    <button
                      onClick={() => onJoinChallenge(ch.invite_code)}
                      className="px-3 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-semibold hover:bg-cyan-500/30 transition-all"
                    >
                      Join Challenge
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{ch.description}</p>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2 pb-1 border-b border-slate-800">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>Leaderboard ({ch.members_count} participants)</span>
                </span>
                <span>Volume</span>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {ch.members.map((member, index) => (
                  <div
                    key={member.user_id}
                    className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg bg-slate-900/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-center font-bold text-slate-400 text-[10px]">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                      </span>
                      <span className="font-medium text-white">{member.display_name}</span>
                      <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" /> {member.streak}d
                      </span>
                    </div>
                    <span className="font-mono text-cyan-300 font-semibold">
                      {member.total_ml.toLocaleString()} ml
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invite code footer */}
            <div className="flex items-center justify-between pt-2 border-t border-cyan-500/10 text-xs text-slate-400">
              <span className="text-[11px]">Invite Code: <strong className="text-white font-mono">{ch.invite_code}</strong></span>
              <button
                onClick={() => copyInvite(ch.invite_code)}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                {copiedCode === ch.invite_code ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                <span>{copiedCode === ch.invite_code ? 'Copied Link!' : 'Share Invite'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Challenge Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <form
            onSubmit={handleCreateSubmit}
            className="w-full max-w-md bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Create Hydration Challenge</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Challenge Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 7-Day Office Flow"
                className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Goal</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Encourage your friends to stay hydrated together..."
                className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Daily (ml)</label>
                <input
                  type="number"
                  min="1000"
                  max="6000"
                  step="100"
                  value={targetDailyMl}
                  onChange={(e) => setTargetDailyMl(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md"
              >
                Launch Challenge
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
