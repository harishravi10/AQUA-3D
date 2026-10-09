import React, { useState } from 'react';
import { Undo2, Trash2, Edit3, Clock, Check, X, AlertCircle } from 'lucide-react';
import { WaterLog } from '../types';

interface IntakeHistoryDrawerProps {
  logs: WaterLog[];
  onUndo: () => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, newAmount: number) => Promise<void>;
  loading: boolean;
}

export const IntakeHistoryDrawer: React.FC<IntakeHistoryDrawerProps> = ({
  logs,
  onUndo,
  onDelete,
  onUpdate,
  loading,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const startEdit = (log: WaterLog) => {
    setEditingId(log.id);
    setEditAmount(log.amount_ml.toString());
  };

  const handleSaveEdit = async (id: string) => {
    const val = parseInt(editAmount, 10);
    if (!isNaN(val) && val >= 10 && val <= 3000) {
      await onUpdate(id, val);
      setEditingId(null);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString.slice(11, 16);
    }
  };

  const getContainerEmoji = (type: string) => {
    switch (type) {
      case 'glass': return '🥛';
      case 'bottle': return '🍶';
      case 'mug': return '☕';
      case 'flask': return '🧊';
      case 'straw': return '🥤';
      default: return '💧';
    }
  };

  return (
    <div className="glass-panel p-5 w-full flex flex-col">
      {/* Header with Undo button */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/15">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Today's Drink History</span>
          </h3>
          <p className="text-xs text-slate-400">
            {logs.length} {logs.length === 1 ? 'drink' : 'drinks'} logged today
          </p>
        </div>

        {/* Undo Button */}
        {logs.length > 0 && (
          <button
            id="btn-undo-drink"
            disabled={loading}
            onClick={onUndo}
            title="Undo last water log"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
          >
            <Undo2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Undo Last</span>
          </button>
        )}
      </div>

      {/* Drink List */}
      <div className="flex-1 overflow-y-auto max-h-[310px] space-y-2 pr-1">
        {logs.length === 0 ? (
          <div className="py-8 text-center text-slate-500 flex flex-col items-center">
            <span className="text-2xl mb-1">💧</span>
            <p className="text-xs">No drinks logged yet today.</p>
            <p className="text-[11px] text-slate-600 mt-0.5">Use the quick add bar above to get started!</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-cyan-500/25 transition-all text-xs"
            >
              {/* Vessel emoji & amount */}
              <div className="flex items-center gap-2.5">
                <span className="text-base select-none">{getContainerEmoji(log.container_type)}</span>
                {editingId === log.id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="w-16 bg-slate-950 border border-cyan-400 rounded px-1.5 py-0.5 text-xs text-white"
                      autoFocus
                    />
                    <span className="text-[11px] text-slate-400">ml</span>
                    <button
                      onClick={() => handleSaveEdit(log.id)}
                      className="p-1 text-emerald-400 hover:bg-emerald-500/10 rounded"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1 text-slate-400 hover:bg-slate-800 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-sm">{log.amount_ml} ml</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 capitalize">
                        {log.temperature.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{formatTime(log.logged_at)}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                {confirmDeleteId === log.id ? (
                  <div className="flex items-center gap-1 bg-rose-950/60 border border-rose-500/40 px-2 py-1 rounded-lg">
                    <span className="text-[10px] text-rose-300">Delete?</span>
                    <button
                      onClick={() => onDelete(log.id)}
                      className="text-rose-400 font-bold hover:underline text-[10px] ml-1"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-slate-400 hover:text-slate-200 text-[10px] ml-1"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(log)}
                      title="Edit amount"
                      className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(log.id)}
                      title="Delete record"
                      className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
