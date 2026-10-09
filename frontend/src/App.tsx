import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ThreeBottle } from './components/ThreeBottle';
import { QuickAddBar } from './components/QuickAddBar';
import { IntakeHistoryDrawer } from './components/IntakeHistoryDrawer';
import { WeatherWidget } from './components/WeatherWidget';
import { AnalyticsView } from './components/AnalyticsView';
import { GamificationView } from './components/GamificationView';
import { SocialChallengesView } from './components/SocialChallengesView';
import { AIAssistantModal } from './components/AIAssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';

import {
  UserProfile, HydrationGoal, TodayHydration, WeatherData,
  AnalyticsSummary, AchievementItem, Challenge, ReminderSettings,
  EmailPreferences, DeliveryLog, ContainerType, WaterTemperature,
  BottleStyle, AIChatMessage
} from './types';
import { api } from './services/api';
import { Droplets, Sparkles, TrendingUp, Bot, ShieldCheck, Flame, Zap } from 'lucide-react';

export default function App() {
  // Main Data States
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [goal, setGoal] = useState<HydrationGoal | null>(null);
  const [todayHydration, setTodayHydration] = useState<TodayHydration | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [reminders, setReminders] = useState<ReminderSettings | null>(null);
  const [emailPrefs, setEmailPrefs] = useState<EmailPreferences | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);

  // UI Flow States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [analyticsPeriod, setAnalyticsPeriod] = useState<string>('7d');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [loadingAction, setLoadingAction] = useState<boolean>(false);
  const [offlineCount, setOfflineCount] = useState<number>(0);

  // Initial Load
  const loadData = useCallback(async () => {
    try {
      const [
        pData,
        gData,
        todayData,
        wData,
        anaData,
        achData,
        chalData,
        remData,
        emData,
        logsData,
      ] = await Promise.all([
        api.getProfile().catch(() => null),
        api.getGoal().catch(() => null),
        api.getTodayHydration().catch(() => null),
        api.getWeather().catch(() => null),
        api.getAnalytics(analyticsPeriod).catch(() => null),
        api.getAchievements().catch(() => []),
        api.getChallenges().catch(() => []),
        api.getReminders().catch(() => null),
        api.getEmailPreferences().catch(() => null),
        api.getDeliveryLogs(20).catch(() => []),
      ]);

      if (pData) {
        setProfile(pData);
        setIsDarkMode(pData.theme_preference !== 'light');
      }
      if (gData) setGoal(gData);
      if (todayData) setTodayHydration(todayData);
      if (wData) setWeather(wData);
      if (anaData) setAnalytics(anaData);
      setAchievements(achData);
      setChallenges(chalData);
      if (remData) setReminders(remData);
      if (emData) setEmailPrefs(emData);
      setDeliveryLogs(logsData);
      setOfflineCount(api.getOfflineCount());
    } catch (e) {
      console.error('Error loading hydration data', e);
    }
  }, [analyticsPeriod]);

  useEffect(() => {
    loadData();

    // Check online/offline sync
    const handleOnline = async () => {
      const synced = await api.syncOfflineQueue();
      if (synced > 0) {
        loadData();
      }
      setOfflineCount(api.getOfflineCount());
    };
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [loadData]);

  // Dark/Light Mode Class Toggle
  useEffect(() => {
    if (!isDarkMode) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [isDarkMode]);

  // Handlers
  const handleToggleTheme = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    if (profile) {
      const updated = await api.updateProfile({ theme_preference: nextMode ? 'dark' : 'light' });
      setProfile(updated);
    }
  };

  const handleLogDrink = async (amount_ml: number, container: ContainerType, temp: WaterTemperature) => {
    setLoadingAction(true);
    try {
      await api.logDrink(amount_ml, container, temp);
      // Refresh today summary & achievements
      const [todayData, pData, achData, anaData] = await Promise.all([
        api.getTodayHydration(),
        api.getProfile(),
        api.getAchievements(),
        api.getAnalytics(analyticsPeriod),
      ]);
      setTodayHydration(todayData);
      setProfile(pData);
      setAchievements(achData);
      setAnalytics(anaData);
      setOfflineCount(api.getOfflineCount());
    } catch (e: any) {
      alert(`Could not log drink: ${e.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUndoDrink = async () => {
    setLoadingAction(true);
    try {
      await api.undoDrink();
      const [todayData, pData, anaData] = await Promise.all([
        api.getTodayHydration(),
        api.getProfile(),
        api.getAnalytics(analyticsPeriod),
      ]);
      setTodayHydration(todayData);
      setProfile(pData);
      setAnalytics(anaData);
    } catch (e: any) {
      alert(`Could not undo drink: ${e.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleDeleteDrink = async (id: string) => {
    setLoadingAction(true);
    try {
      await api.deleteDrink(id);
      const [todayData, pData, anaData] = await Promise.all([
        api.getTodayHydration(),
        api.getProfile(),
        api.getAnalytics(analyticsPeriod),
      ]);
      setTodayHydration(todayData);
      setProfile(pData);
      setAnalytics(anaData);
    } catch (e: any) {
      alert(`Error deleting record: ${e.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleUpdateDrink = async (id: string, newAmount: number) => {
    setLoadingAction(true);
    try {
      await api.updateDrink(id, { amount_ml: newAmount });
      const [todayData, pData, anaData] = await Promise.all([
        api.getTodayHydration(),
        api.getProfile(),
        api.getAnalytics(analyticsPeriod),
      ]);
      setTodayHydration(todayData);
      setProfile(pData);
      setAnalytics(anaData);
    } catch (e: any) {
      alert(`Error updating record: ${e.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBottleStyleChange = async (style: BottleStyle) => {
    if (profile) {
      const updated = await api.updateProfile({ bottle_style: style });
      setProfile(updated);
    }
  };

  const handleRefreshWeather = async (cityName: string) => {
    const wData = await api.getWeather(cityName);
    setWeather(wData);
  };

  const handleSendMessageAI = async (message: string, history: AIChatMessage[]) => {
    const res = await api.askAI(message, history);
    return res.reply;
  };

  const handleCreateChallenge = async (title: string, desc: string, target_ml: number, duration: number) => {
    setLoadingAction(true);
    try {
      await api.createChallenge(title, desc, target_ml, duration);
      const chData = await api.getChallenges();
      setChallenges(chData);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleJoinChallenge = async (code: string) => {
    setLoadingAction(true);
    try {
      await api.joinChallenge(code);
      const chData = await api.getChallenges();
      setChallenges(chData);
    } catch (e: any) {
      alert(`Could not join challenge: ${e.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleSubscribePush = async () => {
    if (!('Notification' in window)) {
      alert('Browser notifications not supported in this environment.');
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      await api.subscribePush('https://fcm.googleapis.com/fcm/send/fake-device-endpoint', {
        p256dh: 'BN7vO-sample-p256dh-key',
        auth: 'auth-secret-aqua',
      });
      alert('Notification permission granted and registered!');
    } else {
      alert('Notification permission was denied or dismissed.');
    }
  };

  const handleTestPush = async () => {
    if (Notification.permission === 'granted') {
      new Notification('🌊 AQUA 3D Alert', {
        body: 'Time to drink 200 ml of fresh water to keep your focus sharp!',
        icon: '/favicon.svg',
      });
    }
    await api.testPush();
    const logs = await api.getDeliveryLogs(20);
    setDeliveryLogs(logs);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Bar */}
      <Header
        profile={profile}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        offlineCount={offlineCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Quick Status Pill Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="glass-panel p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
                  <Droplets className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Today's Intake</span>
                  <span className="text-base font-bold text-white">
                    {todayHydration?.total_consumed_ml.toLocaleString() || 0}
                    <span className="text-xs text-cyan-400 font-normal ml-1">ml</span>
                  </span>
                </div>
              </div>

              <div className="glass-panel p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Daily Target</span>
                  <span className="text-base font-bold text-white">
                    {todayHydration?.daily_target_ml.toLocaleString() || 2500}
                    <span className="text-xs text-sky-400 font-normal ml-1">ml</span>
                  </span>
                </div>
              </div>

              <div className="glass-panel p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0">
                  <Flame className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Current Streak</span>
                  <span className="text-base font-bold text-amber-400">
                    {profile?.current_streak || 0}
                    <span className="text-xs text-amber-300/80 font-normal ml-1">days</span>
                  </span>
                </div>
              </div>

              <div className="glass-panel p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Target Achieved</span>
                  <span className="text-base font-bold text-emerald-400">
                    {todayHydration?.completion_percentage || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Center Stage: Interactive 3D Bottle & Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Quick Add Vessels & Weather Widget */}
              <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
                <QuickAddBar onLogDrink={handleLogDrink} loading={loadingAction} />
                <WeatherWidget
                  weather={weather}
                  loading={false}
                  onRefreshCity={handleRefreshWeather}
                />
              </div>

              {/* Center Column: 3D Water Bottle Centerpiece */}
              <div className="lg:col-span-4 glass-panel p-2 flex flex-col items-center justify-center order-1 lg:order-2 shadow-2xl relative">
                {/* Visual Ambient Light Radial */}
                <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none rounded-2xl" />

                <ThreeBottle
                  currentMl={todayHydration?.total_consumed_ml || 0}
                  targetMl={todayHydration?.daily_target_ml || 2500}
                  bottleCapacity={profile?.bottle_capacity || 1000}
                  bottleStyle={profile?.bottle_style || 'futuristic_glass'}
                  lowPowerMode={profile?.low_power_3d || false}
                  onStyleChange={handleBottleStyleChange}
                />
              </div>

              {/* Right Column: Drink Timeline History Drawer & AI Shortcut */}
              <div className="lg:col-span-4 space-y-6 order-3">
                <IntakeHistoryDrawer
                  logs={todayHydration?.logs || []}
                  onUndo={handleUndoDrink}
                  onDelete={handleDeleteDrink}
                  onUpdate={handleUpdateDrink}
                  loading={loadingAction}
                />

                {/* AI Quick Insight Teaser */}
                <div
                  onClick={() => setIsAIOpen(true)}
                  className="glass-panel p-4 cursor-pointer group border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center text-slate-950">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors block">
                        Ask AI Assistant
                      </span>
                      <span className="text-[11px] text-slate-400">Pacing suggestions & weekly analysis</span>
                    </div>
                  </div>
                  <span className="text-xs text-cyan-400 font-semibold group-hover:translate-x-1 transition-transform">
                    Chat →
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ANALYTICS & EXPORT */}
        {activeTab === 'analytics' && (
          <AnalyticsView
            analytics={analytics}
            period={analyticsPeriod}
            onPeriodChange={(p) => setAnalyticsPeriod(p)}
            loading={false}
          />
        )}

        {/* TAB 3: GAMIFICATION & ACHIEVEMENTS */}
        {activeTab === 'gamification' && (
          <GamificationView
            achievements={achievements}
            profile={profile}
            onToggleGamification={async (enabled) => {
              const updated = await api.updateProfile({ gamification_enabled: enabled });
              setProfile(updated);
            }}
          />
        )}

        {/* TAB 4: SOCIAL CHALLENGES */}
        {activeTab === 'challenges' && (
          <SocialChallengesView
            challenges={challenges}
            onCreateChallenge={handleCreateChallenge}
            onJoinChallenge={handleJoinChallenge}
            loading={loadingAction}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-cyan-500/15 bg-slate-950/80 backdrop-blur-md py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">AQUA 3D</span>
            <span>• Next-Generation Hydration Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setIsOnboardingOpen(true)} className="hover:text-cyan-400 transition-colors">
              Onboarding Setup
            </button>
            <button onClick={() => setIsSettingsOpen(true)} className="hover:text-cyan-400 transition-colors">
              Notifications & Email
            </button>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noreferrer"
              className="hover:text-cyan-400 transition-colors"
            >
              API Docs
            </a>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AIAssistantModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        onSendMessage={handleSendMessageAI}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        goal={goal}
        reminders={reminders}
        emailPrefs={emailPrefs}
        deliveryLogs={deliveryLogs}
        onUpdateProfile={async (updates) => {
          const res = await api.updateProfile(updates);
          setProfile(res);
        }}
        onUpdateGoal={async (target_ml) => {
          await api.setGoal(target_ml);
          const tData = await api.getTodayHydration();
          setTodayHydration(tData);
        }}
        onUpdateReminders={async (updates) => {
          const res = await api.updateReminders(updates);
          setReminders(res);
        }}
        onUpdateEmailPrefs={async (updates) => {
          const res = await api.updateEmailPreferences(updates);
          setEmailPrefs(res);
        }}
        onSendTestEmail={async (type, recipient) => {
          const res = await api.sendTestEmail(type, recipient);
          const logs = await api.getDeliveryLogs(20);
          setDeliveryLogs(logs);
          return res;
        }}
        onSubscribePush={handleSubscribePush}
        onTestPush={handleTestPush}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={async (data) => {
          await api.updateProfile({
            display_name: data.displayName,
            bottle_capacity: data.bottleCapacity,
            bottle_style: data.bottleStyle,
            unit_preference: data.unit,
          });
          await api.setGoal(data.dailyTarget);
          setIsOnboardingOpen(false);
          loadData();
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setProfile(user);
          loadData();
        }}
      />
    </div>
  );
}
