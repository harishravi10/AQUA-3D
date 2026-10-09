import React, { useState } from 'react';
import {
  X, User, Bell, Mail, Smartphone, Sliders, Shield,
  Check, Loader2, Send, Clock, Sparkles, ExternalLink
} from 'lucide-react';
import {
  UserProfile, HydrationGoal, ReminderSettings,
  EmailPreferences, DeliveryLog, BottleStyle
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  goal: HydrationGoal | null;
  reminders: ReminderSettings | null;
  emailPrefs: EmailPreferences | null;
  deliveryLogs: DeliveryLog[];
  onUpdateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  onUpdateGoal: (target_ml: number) => Promise<void>;
  onUpdateReminders: (updates: Partial<ReminderSettings>) => Promise<void>;
  onUpdateEmailPrefs: (updates: Partial<EmailPreferences>) => Promise<void>;
  onSendTestEmail: (emailType: string, recipient?: string) => Promise<any>;
  onSubscribePush: () => Promise<void>;
  onTestPush: () => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  goal,
  reminders,
  emailPrefs,
  deliveryLogs,
  onUpdateProfile,
  onUpdateGoal,
  onUpdateReminders,
  onUpdateEmailPrefs,
  onSendTestEmail,
  onSubscribePush,
  onTestPush,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'reminders' | 'email' | 'push' | 'logs'>('profile');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Profile local state
  const [displayName, setDisplayName] = useState<string>(profile?.display_name || '');
  const [dailyTarget, setDailyTarget] = useState<number>(goal?.daily_target_ml || 2500);
  const [bottleCapacity, setBottleCapacity] = useState<number>(profile?.bottle_capacity || 1000);
  const [bottleStyle, setBottleStyle] = useState<BottleStyle>(profile?.bottle_style || 'futuristic_glass');
  const [unitPref, setUnitPref] = useState<'ml' | 'oz'>(profile?.unit_preference || 'ml');
  const [reducedMotion, setReducedMotion] = useState<boolean>(profile?.reduced_motion || false);
  const [lowPower3D, setLowPower3D] = useState<boolean>(profile?.low_power_3d || false);

  // Reminders local state
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(reminders?.enabled ?? true);
  const [startTime, setStartTime] = useState<string>(reminders?.start_time || '08:00');
  const [endTime, setEndTime] = useState<string>(reminders?.end_time || '21:00');
  const [frequencyMinutes, setFrequencyMinutes] = useState<number>(reminders?.frequency_minutes || 60);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState<boolean>(reminders?.quiet_hours_enabled ?? true);
  const [quietStart, setQuietStart] = useState<string>(reminders?.quiet_start || '22:00');
  const [quietEnd, setQuietEnd] = useState<string>(reminders?.quiet_end || '07:00');
  const [dailyLimit, setDailyLimit] = useState<number>(reminders?.daily_reminder_limit || 8);

  // Email local state
  const [recipientEmail, setRecipientEmail] = useState<string>(emailPrefs?.recipient_email || profile?.email || '');
  const [emailSending, setEmailSending] = useState<boolean>(false);
  const [testEmailResult, setTestEmailResult] = useState<string | null>(null);

  // Push local state
  const [pushTesting, setPushTesting] = useState<boolean>(false);
  const [pushResult, setPushResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateProfile({
      display_name: displayName,
      bottle_capacity: bottleCapacity,
      bottle_style: bottleStyle,
      unit_preference: unitPref,
      reduced_motion: reducedMotion,
      low_power_3d: lowPower3D,
    });
    await onUpdateGoal(dailyTarget);
    setSavedFeedback('Profile & goals saved successfully!');
    setTimeout(() => setSavedFeedback(null), 2500);
  };

  const handleSaveReminders = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdateReminders({
      enabled: reminderEnabled,
      start_time: startTime,
      end_time: endTime,
      frequency_minutes: frequencyMinutes,
      quiet_hours_enabled: quietHoursEnabled,
      quiet_start: quietStart,
      quiet_end: quietEnd,
      daily_reminder_limit: dailyLimit,
    });
    setSavedFeedback('Reminder schedule updated!');
    setTimeout(() => setSavedFeedback(null), 2500);
  };

  const handleSendTestEmailClick = async () => {
    setEmailSending(true);
    setTestEmailResult(null);
    try {
      const res = await onSendTestEmail('reminder', recipientEmail);
      setTestEmailResult(
        res.status === 'delivered'
          ? `✓ Dispatched live email via Resend to ${recipientEmail}`
          : `✓ Simulated notification test recorded in delivery log (Status: ${res.status})`
      );
    } catch (e: any) {
      setTestEmailResult(`Error: ${e.message}`);
    } finally {
      setEmailSending(false);
    }
  };

  const handleTestPushClick = async () => {
    setPushTesting(true);
    setPushResult(null);
    try {
      await onTestPush();
      setPushResult('✓ Browser notification alert sent!');
    } catch (e: any) {
      setPushResult(`Notice: ${e.message}`);
    } finally {
      setPushTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl h-[650px] max-h-[92vh] glass-panel flex flex-col overflow-hidden border border-cyan-500/30 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Hydration & System Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Feedback Toast */}
        {savedFeedback && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 px-4 py-2 text-xs flex items-center gap-2 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedFeedback}</span>
          </div>
        )}

        {/* Tabs Bar */}
        <div className="flex items-center gap-1 p-2 bg-slate-950/80 border-b border-slate-800 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile & Goals
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'reminders'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Reminders
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'email'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Gmail / Email
          </button>
          <button
            onClick={() => setActiveTab('push')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'push'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Web Push
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'logs'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Delivery Logs
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 1. Profile & Goals Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Daily Target (ml)</label>
                  <input
                    type="number"
                    min="500"
                    max="8000"
                    step="50"
                    value={dailyTarget}
                    onChange={(e) => setDailyTarget(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Configurable personal baseline</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bottle Capacity (ml)</label>
                  <input
                    type="number"
                    min="300"
                    max="3000"
                    step="50"
                    value={bottleCapacity}
                    onChange={(e) => setBottleCapacity(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Measurement Unit</label>
                  <select
                    value={unitPref}
                    onChange={(e) => setUnitPref(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="ml">Milliliters (ml)</option>
                    <option value="oz">Fluid Ounces (fl oz)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">3D Bottle Style</label>
                  <select
                    value={bottleStyle}
                    onChange={(e) => setBottleStyle(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="futuristic_glass">Futuristic Glass Cylinder</option>
                    <option value="hydro_flask">Hydro Sports Flask</option>
                    <option value="smart_tumbler">Smart Ergonomic Tumbler</option>
                    <option value="crystal_decanter">Crystal Cut Decanter</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lowPower3D}
                    onChange={(e) => setLowPower3D(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-400"
                  />
                  <span className="text-slate-300">Low-Power 3D Mode (saves battery on laptops & phones)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-cyan-400"
                  />
                  <span className="text-slate-300">Reduced Motion Preferences</span>
                </label>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold uppercase tracking-wider text-xs shadow-md"
                >
                  Save Profile Settings
                </button>
              </div>
            </form>
          )}

          {/* 2. Reminders Tab */}
          {activeTab === 'reminders' && (
            <form onSubmit={handleSaveReminders} className="space-y-4 text-xs">
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 p-3 rounded-xl border border-slate-800">
                <input
                  type="checkbox"
                  checked={reminderEnabled}
                  onChange={(e) => setReminderEnabled(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-cyan-400 w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-white block">Enable Hydration Reminders</span>
                  <span className="text-slate-400 text-[11px]">
                    Receive scheduled gentle prompts during your active hours
                  </span>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Interval (Minutes)</label>
                  <select
                    value={frequencyMinutes}
                    onChange={(e) => setFrequencyMinutes(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value={30}>Every 30 Minutes</option>
                    <option value={45}>Every 45 Minutes</option>
                    <option value={60}>Every 60 Minutes (Standard)</option>
                    <option value={90}>Every 90 Minutes</option>
                    <option value={120}>Every 2 Hours</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Max Reminders per Day</label>
                  <input
                    type="number"
                    min="1"
                    max="24"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quietHoursEnabled}
                    onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                    className="rounded text-cyan-400"
                  />
                  <span className="font-semibold text-slate-300">Quiet Hours (Do Not Disturb)</span>
                </label>
                {quietHoursEnabled && (
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Quiet From:</span>
                      <input
                        type="time"
                        value={quietStart}
                        onChange={(e) => setQuietStart(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white"
                      />
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-0.5">Quiet Until:</span>
                      <input
                        type="time"
                        value={quietEnd}
                        onChange={(e) => setQuietEnd(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold uppercase tracking-wider text-xs shadow-md"
                >
                  Save Reminders
                </button>
              </div>
            </form>
          )}

          {/* 3. Gmail / Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>Branded Email Notifications</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">
                  Receive hydration reminders, daily progress summaries, and milestone celebrations directly in your Gmail or inbox.
                </p>

                <label className="block text-slate-300 font-semibold mb-1">Your Notification Email</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="you@gmail.com"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-400 text-xs"
                  />
                  <button
                    onClick={() => onUpdateEmailPrefs({ recipient_email: recipientEmail })}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Save Email
                  </button>
                </div>
              </div>

              {/* Test Action */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-cyan-500/20">
                <h4 className="font-semibold text-white mb-1">Instant Email Test & Preview</h4>
                <p className="text-slate-400 text-[11px] mb-3">
                  Triggers an immediate branded hydration alert. Uses Resend when API key is set or generates verified simulated delivery.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-test-email"
                    disabled={emailSending}
                    onClick={handleSendTestEmailClick}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {emailSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Send Test Email</span>
                  </button>
                </div>

                {testEmailResult && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-200 text-xs">
                    {testEmailResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Web Push Tab */}
          {activeTab === 'push' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-white">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <span>Browser & PWA Push Notifications</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mb-3">
                  Delivers subtle push prompts right on your desktop or mobile screen even when the window is in the background.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={onSubscribePush}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-md"
                  >
                    Request Push Permission
                  </button>
                  <button
                    disabled={pushTesting}
                    onClick={handleTestPushClick}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                  >
                    {pushTesting ? 'Testing...' : 'Dispatch Test Alert'}
                  </button>
                </div>

                {pushResult && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-950 border border-cyan-500/30 text-cyan-200 text-xs">
                    {pushResult}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. Delivery Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-semibold text-white">Notification Audit History</span>
                <span className="text-slate-400 text-[11px]">{deliveryLogs.length} recent events</span>
              </div>

              {deliveryLogs.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  No notification logs recorded yet. Send a test email or push above!
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {deliveryLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white capitalize">{log.channel}</span>
                          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/30">
                            {log.notification_type}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                              log.status === 'delivered'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-cyan-500/20 text-cyan-300'
                            }`}
                          >
                            {log.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 break-all">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
