import React, { useState } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { WeatherData } from '../types';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
  onRefreshCity: (cityName: string) => Promise<void>;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, loading, onRefreshCity }) => {
  const [cityInput, setCityInput] = useState<string>('');
  const [isEditingCity, setIsEditingCity] = useState<boolean>(false);

  const handleSubmitCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      await onRefreshCity(cityInput.trim());
      setIsEditingCity(false);
    }
  };

  const getWeatherIcon = (condition: string = '') => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-5 h-5 text-sky-400" />;
    if (c.includes('cloud') || c.includes('overcast')) return <Cloud className="w-5 h-5 text-slate-300" />;
    return <Sun className="w-5 h-5 text-amber-400" />;
  };

  if (!weather) {
    return (
      <div className="glass-panel p-4 flex items-center justify-between text-xs text-slate-400">
        <span>Loading live weather intelligence...</span>
        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 flex flex-col justify-between">
      {/* City and condition header */}
      <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15">
        <div className="flex items-center gap-2">
          {getWeatherIcon(weather.condition)}
          {isEditingCity ? (
            <form onSubmit={handleSubmitCity} className="flex items-center gap-1.5">
              <input
                type="text"
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
                placeholder="City name"
                className="bg-slate-950 border border-cyan-400 rounded px-2 py-0.5 text-xs text-white w-24"
                autoFocus
              />
              <button type="submit" className="text-[11px] text-cyan-300 hover:underline">
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingCity(false)}
                className="text-[11px] text-slate-400 hover:underline"
              >
                ✕
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white">{weather.city}</span>
              <button
                onClick={() => {
                  setCityInput(weather.city);
                  setIsEditingCity(true);
                }}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                title="Change city"
              >
                <MapPin className="w-3 h-3" />
                <span>Change</span>
              </button>
            </div>
          )}
        </div>

        {/* Temperature & Humidity badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-white text-sm">
            {weather.temperature_c}°C
            <span className="text-[11px] text-slate-400 font-normal ml-1">({weather.temperature_f}°F)</span>
          </span>
          <span className="text-[11px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
            💧 {weather.humidity}%
          </span>
        </div>
      </div>

      {/* Contextual Hydration Advice */}
      <div className="mt-2.5">
        <div className="flex items-start gap-1.5 text-xs text-slate-300 leading-relaxed">
          <span className="text-cyan-400 font-semibold shrink-0">Weather Tip:</span>
          <span>{weather.hydration_advice}</span>
        </div>
        {weather.recommended_intake_adjustment_ml > 0 && (
          <div className="mt-1.5 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md inline-block">
            + {weather.recommended_intake_adjustment_ml} ml recommended for today's climate
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-cyan-500/10 flex items-center justify-between text-[10px] text-slate-500">
        <span>Condition: {weather.condition}</span>
        <span>Updated: {weather.last_updated}</span>
      </div>
    </div>
  );
};
