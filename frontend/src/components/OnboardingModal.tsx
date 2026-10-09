import React, { useState } from 'react';
import { Droplets, ArrowRight, Sparkles, Check } from 'lucide-react';
import { BottleStyle } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: {
    displayName: string;
    dailyTarget: number;
    bottleCapacity: number;
    bottleStyle: BottleStyle;
    unit: 'ml' | 'oz';
  }) => Promise<void>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [displayName, setDisplayName] = useState<string>('Hydro Voyager');
  const [dailyTarget, setDailyTarget] = useState<number>(2500);
  const [bottleCapacity, setBottleCapacity] = useState<number>(1000);
  const [bottleStyle, setBottleStyle] = useState<BottleStyle>('futuristic_glass');
  const [unit, setUnit] = useState<'ml' | 'oz'>('ml');
  const [submitting, setSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleFinish = async () => {
    setSubmitting(true);
    try {
      await onComplete({
        displayName,
        dailyTarget,
        bottleCapacity,
        bottleStyle,
        unit,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg glass-panel p-6 sm:p-8 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 p-0.5 shadow-md flex items-center justify-center">
            <Droplets className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Welcome to AQUA 3D</h2>
            <p className="text-xs text-slate-400">Configure your hydration companion baseline</p>
          </div>
        </div>

        {/* Step 1: Identity & Target */}
        {step === 1 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">What should we call you?</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
                className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Daily Baseline Hydration Target (ml)
              </label>
              <input
                type="number"
                min="1000"
                max="8000"
                step="100"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                * General wellness baseline. Adjust based on your personal climate, activity level, and medical advice.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Preferred Units</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setUnit('ml')}
                  className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                    unit === 'ml'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Milliliters (ml)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('oz')}
                  className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                    unit === 'oz'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  Fluid Ounces (fl oz)
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <span>Next: Customize Bottle</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Bottle Customization */}
        {step === 2 && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-2">Select Your 3D Bottle Vessel</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'futuristic_glass', label: 'Futuristic Glass', desc: 'Sleek crystal cylinder with cyber ring' },
                  { id: 'hydro_flask', label: 'Hydro Flask', desc: 'Dual-tone matte sports flask' },
                  { id: 'smart_tumbler', label: 'Smart Tumbler', desc: 'Tapered ergonomic desk tumbler' },
                  { id: 'crystal_decanter', label: 'Crystal Decanter', desc: 'Faceted radiant refraction vessel' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBottleStyle(b.id as any)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      bottleStyle === b.id
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold block text-white text-xs">{b.label}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{b.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Standard Bottle Capacity</label>
              <select
                value={bottleCapacity}
                onChange={(e) => setBottleCapacity(parseInt(e.target.value, 10))}
                className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-white"
              >
                <option value={500}>500 ml (Standard)</option>
                <option value={750}>750 ml</option>
                <option value={1000}>1,000 ml (1 Liter Pro)</option>
                <option value={1500}>1,500 ml (XL Hydro)</option>
                <option value={2000}>2,000 ml (Gallon Half)</option>
              </select>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Launch AQUA 3D</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
