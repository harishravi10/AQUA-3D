import React, { useState } from 'react';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import { Download, Calendar, Flame, Trophy, TrendingUp, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { AnalyticsSummary } from '../types';
import { api } from '../services/api';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  period: string;
  onPeriodChange: (p: string) => void;
  loading: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  period,
  onPeriodChange,
  loading,
}) => {
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  if (!analytics && loading) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400">
        Loading hydration analytics...
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="glass-panel p-12 text-center text-slate-400">
        No analytics data available yet. Log some drinks to unlock charts!
      </div>
    );
  }

  // Format hourly distribution for Recharts
  const hourlyData = Object.entries(analytics.hourly_distribution).map(([hour, amount]) => ({
    hour,
    amount,
  }));

  const handleDownloadCSV = () => {
    window.open(api.getCSVExportUrl(), '_blank');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Controls & KPI Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-cyan-500/20">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>Hydration Intelligence & Analytics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Comprehensive intake trends, time-of-day distribution, and streaks
          </p>
        </div>

        {/* Period Selector & Export Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => onPeriodChange('7d')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                period === '7d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => onPeriodChange('30d')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                period === '30d'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
          </div>

          <button
            id="btn-export-csv"
            onClick={handleDownloadCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs font-medium transition-all"
            title="Download full CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 text-white text-xs font-medium shadow-sm transition-all"
            title="Generate printable PDF summary"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>PDF Summary</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Daily Average */}
        <div className="glass-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Daily Average</span>
          <div className="my-2">
            <span className="text-2xl font-black text-white glow-text-cyan">
              {analytics.daily_average_ml.toLocaleString()}
            </span>
            <span className="text-xs text-cyan-400 font-medium ml-1">ml</span>
          </div>
          <span className="text-[11px] text-slate-500">Across {period} period</span>
        </div>

        {/* Goal Completion Rate */}
        <div className="glass-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Goal Completion</span>
          <div className="my-2">
            <span className="text-2xl font-black text-emerald-400">
              {analytics.goal_completion_rate}%
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Days target reached</span>
        </div>

        {/* Current & Longest Streak */}
        <div className="glass-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Current Streak</span>
          <div className="my-2 flex items-center gap-2">
            <span className="text-2xl font-black text-amber-400">
              {analytics.current_streak}
            </span>
            <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
          </div>
          <span className="text-[11px] text-slate-500">Record: {analytics.longest_streak} days</span>
        </div>

        {/* Best Day Volume */}
        <div className="glass-panel p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-400">Peak Intake Day</span>
          <div className="my-2">
            <span className="text-2xl font-black text-sky-400">
              {analytics.best_day?.amount_ml.toLocaleString() || 0}
            </span>
            <span className="text-xs text-sky-400 font-medium ml-1">ml</span>
          </div>
          <span className="text-[11px] text-slate-500">{analytics.best_day?.date || 'N/A'}</span>
        </div>
      </div>

      {/* Main Fluid Intake Chart (Area Chart) */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Hydration Volume Timeline</h3>
            <p className="text-xs text-slate-400">Logged intake vs configured daily target</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> Intaked
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" /> Target
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={analytics.daily_history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day_name" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#091322', borderColor: '#1e3a5f', borderRadius: '10px' }}
                itemStyle={{ color: '#38bdf8' }}
              />
              <Area
                type="monotone"
                dataKey="consumed_ml"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorIntake)"
                name="Intake (ml)"
              />
              <Area
                type="monotone"
                dataKey="target_ml"
                stroke="#475569"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                fill="none"
                name="Target (ml)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Habit Pattern Chart & Habit Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hourly Distribution */}
        <div className="glass-panel p-5">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Time-of-Day Pacing Pattern</span>
            </h3>
            <p className="text-xs text-slate-400">Total volume consumed across typical active hours</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} interval={2} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#091322', borderColor: '#1e3a5f', borderRadius: '10px' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="amount" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Volume (ml)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30-Day Completion Heatmap */}
        <div className="glass-panel p-5 flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Hydration Habit Heatmap</span>
            </h3>
            <p className="text-xs text-slate-400">Daily goal fulfillment consistency matrix</p>
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 gap-2 my-auto">
            {analytics.daily_history.map((day, idx) => {
              const rate = day.completion_rate;
              let bg = 'bg-slate-800/60 border-slate-700/60 text-slate-500';
              if (rate >= 100) bg = 'bg-cyan-500/40 border-cyan-400 text-cyan-200 shadow-sm';
              else if (rate >= 60) bg = 'bg-sky-600/30 border-sky-500/40 text-sky-200';
              else if (rate > 0) bg = 'bg-blue-900/30 border-blue-700/40 text-blue-300';

              return (
                <div
                  key={idx}
                  title={`${day.date}: ${day.consumed_ml} / ${day.target_ml} ml (${day.completion_rate}%)`}
                  className={`h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] select-none transition-all hover:scale-105 ${bg}`}
                >
                  <span className="font-semibold">{day.day_name}</span>
                  <span className="text-[9px] opacity-80">{Math.round(rate)}%</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-cyan-500/10 flex items-center justify-between text-[11px] text-slate-400">
            <span>Low intake</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 inline-block" />
              <span className="w-3 h-3 rounded bg-blue-900/30 border border-blue-700 inline-block" />
              <span className="w-3 h-3 rounded bg-sky-600/30 border border-sky-500 inline-block" />
              <span className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-400 inline-block" />
            </div>
            <span>Goal 100%+</span>
          </div>
        </div>
      </div>

      {/* PDF Summary Report Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base">AQUA 3D Hydration Health Summary</h3>
              </div>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="py-6 space-y-4 text-sm text-slate-300">
              <p className="leading-relaxed">
                This report summarizes your personal hydration tracking records over the selected{' '}
                <strong className="text-cyan-300">{period}</strong> period.
              </p>
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400">Total Hydration Logged:</span>
                  <p className="text-base font-bold text-white">{analytics.total_consumed_ml.toLocaleString()} ml</p>
                </div>
                <div>
                  <span className="text-slate-400">Daily Average:</span>
                  <p className="text-base font-bold text-white">{analytics.daily_average_ml.toLocaleString()} ml / day</p>
                </div>
                <div>
                  <span className="text-slate-400">Goal Adherence Rate:</span>
                  <p className="text-base font-bold text-emerald-400">{analytics.goal_completion_rate}%</p>
                </div>
                <div>
                  <span className="text-slate-400">Current Continuous Streak:</span>
                  <p className="text-base font-bold text-amber-400">{analytics.current_streak} days</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 italic">
                * Note: Hydration needs vary with physiological activity, environment, and medical requirements. Not a medical diagnosis.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handlePrintReport}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print or Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
