import React, { useState } from 'react';
import { Plus, Coffee, Wine, Thermometer, Check, Loader2 } from 'lucide-react';
import { ContainerType, WaterTemperature } from '../types';

interface QuickAddBarProps {
  onLogDrink: (amount_ml: number, container: ContainerType, temperature: WaterTemperature) => Promise<void>;
  loading: boolean;
}

const PRESET_AMOUNTS = [
  { label: '100 ml', amount: 100, desc: 'Small Sip' },
  { label: '150 ml', amount: 150, desc: 'Teacup' },
  { label: '250 ml', amount: 250, desc: 'Standard Glass' },
  { label: '500 ml', amount: 500, desc: 'Water Bottle' },
];

const CONTAINERS: { type: ContainerType; label: string; icon: string }[] = [
  { type: 'glass', label: 'Glass', icon: '🥛' },
  { type: 'bottle', label: 'Bottle', icon: '🍶' },
  { type: 'mug', label: 'Mug', icon: '☕' },
  { type: 'flask', label: 'Flask', icon: '🧊' },
  { type: 'straw', label: 'Straw', icon: '🥤' },
];

const TEMPERATURES: { type: WaterTemperature; label: string; color: string }[] = [
  { type: 'ice_cold', label: 'Ice Cold', color: 'text-blue-300' },
  { type: 'cool', label: 'Cool', color: 'text-cyan-300' },
  { type: 'room_temp', label: 'Room Temp', color: 'text-emerald-300' },
  { type: 'warm', label: 'Warm', color: 'text-amber-300' },
  { type: 'hot', label: 'Hot', color: 'text-rose-300' },
];

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onLogDrink, loading }) => {
  const [selectedContainer, setSelectedContainer] = useState<ContainerType>('glass');
  const [selectedTemp, setSelectedTemp] = useState<WaterTemperature>('cool');
  const [customAmount, setCustomAmount] = useState<string>('300');
  const [isCustomOpen, setIsCustomOpen] = useState<boolean>(false);
  const [justLogged, setJustLogged] = useState<number | null>(null);

  const handleQuickAdd = async (amount: number) => {
    if (loading) return;
    try {
      await onLogDrink(amount, selectedContainer, selectedTemp);
      setJustLogged(amount);
      setTimeout(() => setJustLogged(null), 1800);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val >= 10 && val <= 3000) {
      await handleQuickAdd(val);
      setIsCustomOpen(false);
    }
  };

  return (
    <div className="w-full glass-panel p-5 relative overflow-hidden">
      {/* Container & Temperature selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-cyan-500/15">
        {/* Reusable Container selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Vessel:</span>
          {CONTAINERS.map((c) => (
            <button
              key={c.type}
              id={`container-btn-${c.type}`}
              onClick={() => setSelectedContainer(c.type)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all ${
                selectedContainer === c.type
                  ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-sm'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{c.icon}</span>
              <span className="text-[11px] font-medium">{c.label}</span>
            </button>
          ))}
        </div>

        {/* Temperature selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-400 mr-1 hidden sm:inline">Temp:</span>
          {TEMPERATURES.map((t) => (
            <button
              key={t.type}
              onClick={() => setSelectedTemp(t.type)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                selectedTemp === t.type
                  ? `bg-slate-800 border border-cyan-500/50 ${t.color}`
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main One-Tap Quick Log Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {PRESET_AMOUNTS.map((preset) => (
          <button
            key={preset.amount}
            id={`quick-log-${preset.amount}`}
            disabled={loading}
            onClick={() => handleQuickAdd(preset.amount)}
            className="group relative flex flex-col items-center justify-center py-3.5 px-3 rounded-xl bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-slate-900 hover:shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="flex items-center gap-1 text-cyan-300 font-bold text-base group-hover:scale-105 transition-transform">
              {justLogged === preset.amount ? (
                <Check className="w-4 h-4 text-emerald-400 animate-scale" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{preset.label}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5">{preset.desc}</span>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400/0 to-transparent group-hover:via-cyan-400/70 transition-all rounded-b-xl" />
          </button>
        ))}

        {/* Custom Amount Button */}
        <button
          id="btn-custom-amount"
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          className={`flex flex-col items-center justify-center py-3.5 px-3 rounded-xl border transition-all active:scale-95 ${
            isCustomOpen
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'bg-slate-900/80 border-cyan-500/20 hover:border-cyan-400/50 text-slate-300'
          }`}
        >
          <div className="flex items-center gap-1 font-bold text-sm">
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Custom</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5">Enter ml</span>
        </button>
      </div>

      {/* Custom Amount Form Drawer */}
      {isCustomOpen && (
        <form onSubmit={handleCustomSubmit} className="mt-4 pt-3 border-t border-cyan-500/15 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              id="input-custom-ml"
              type="number"
              min="10"
              max="3000"
              step="10"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="e.g. 350"
              className="w-full bg-slate-950/80 border border-cyan-500/30 rounded-xl px-4 py-2 text-sm text-cyan-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <span className="absolute right-3 top-2 text-xs text-slate-400 font-mono">ml</span>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            <span>Log Drink</span>
          </button>
        </form>
      )}

      {/* Confirmation Flash */}
      {justLogged && (
        <div className="absolute top-2 right-4 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-md animate-fade-in">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Logged {justLogged} ml!</span>
        </div>
      )}
    </div>
  );
};
