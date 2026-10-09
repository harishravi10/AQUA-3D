import {
  UserProfile, HydrationGoal, WaterLog, TodayHydration,
  ReminderSettings, EmailPreferences, DeliveryLog, WeatherData,
  AIChatMessage, AnalyticsSummary, AchievementItem, Challenge
} from '../types';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';
const AUTH_TOKEN_KEY = 'aqua3d_auth_token';
const USER_ID_KEY = 'aqua3d_user_id';
const OFFLINE_QUEUE_KEY = 'aqua3d_offline_queue';

interface QueuedDrink {
  amount_ml: number;
  container_type: string;
  temperature: string;
  logged_at: string;
  client_id: string;
}

function getStoredQueue(): QueuedDrink[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedDrink[]) {
  try {
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (e) {
    console.error('Failed to save offline queue', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const userId = localStorage.getItem(USER_ID_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'x-user-id': userId } : {}),
    ...(options.headers as any || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed: ${response.statusText}`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.detail || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // --- Authentication ---
  async register(
    email: string,
    password: string,
    display_name: string,
    daily_target_ml = 2500,
    bottle_style = 'futuristic_glass'
  ): Promise<{ access_token: string; user: UserProfile }> {
    const res = await request<{ access_token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name, daily_target_ml, bottle_style }),
    });
    localStorage.setItem(AUTH_TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_ID_KEY, res.user.id);
    return res;
  },

  async login(email: string, password: string): Promise<{ access_token: string; user: UserProfile }> {
    const res = await request<{ access_token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(AUTH_TOKEN_KEY, res.access_token);
    localStorage.setItem(USER_ID_KEY, res.user.id);
    return res;
  },

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
  },

  switchAccount(userId: string): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.setItem(USER_ID_KEY, userId);
  },

  getStoredUserId(): string | null {
    return localStorage.getItem(USER_ID_KEY);
  },

  async getDemoAccounts(): Promise<Array<{ display_name: string; email: string; user_id: string; tag: string }>> {
    return request<Array<{ display_name: string; email: string; user_id: string; tag: string }>>('/auth/demo-accounts');
  },
  // --- Profile & Goals ---
  async getProfile(): Promise<UserProfile> {
    return request<UserProfile>('/profile');
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return request<UserProfile>('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getGoal(): Promise<HydrationGoal> {
    return request<HydrationGoal>('/goal');
  },

  async setGoal(daily_target_ml: number, activity_multiplier = 1.0): Promise<HydrationGoal> {
    return request<HydrationGoal>('/goal', {
      method: 'POST',
      body: JSON.stringify({ daily_target_ml, activity_multiplier }),
    });
  },

  // --- Water Intake ---
  async getTodayHydration(): Promise<TodayHydration> {
    return request<TodayHydration>('/intake/today');
  },

  async logDrink(amount_ml: number, container_type = 'glass', temperature = 'cool'): Promise<WaterLog> {
    const logged_at = new Date().toISOString();
    
    // If navigator is offline, enqueue
    if (!navigator.onLine) {
      const queue = getStoredQueue();
      const queuedItem: QueuedDrink = {
        amount_ml,
        container_type,
        temperature,
        logged_at,
        client_id: `offline-${Date.now()}`
      };
      queue.push(queuedItem);
      saveQueue(queue);
      
      return {
        id: queuedItem.client_id,
        user_id: 'local-offline',
        amount_ml,
        container_type: container_type as any,
        temperature: temperature as any,
        logged_at,
        created_at: logged_at
      };
    }

    return request<WaterLog>('/intake/log', {
      method: 'POST',
      body: JSON.stringify({ amount_ml, container_type, temperature, logged_at }),
    });
  },

  async updateDrink(logId: string, updates: Partial<WaterLog>): Promise<WaterLog> {
    return request<WaterLog>(`/intake/${logId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteDrink(logId: string): Promise<{ message: string; id: string }> {
    return request<{ message: string; id: string }>(`/intake/${logId}`, {
      method: 'DELETE',
    });
  },

  async undoDrink(): Promise<{ message: string; undone_log: WaterLog }> {
    return request<{ message: string; undone_log: WaterLog }>('/intake/undo', {
      method: 'POST',
    });
  },

  async getDrinkHistory(startDate?: string, endDate?: string): Promise<WaterLog[]> {
    const params = new URLSearchParams();
    if (startDate) params.set('start_date', startDate);
    if (endDate) params.set('end_date', endDate);
    return request<WaterLog[]>(`/intake/history?${params.toString()}`);
  },

  // --- Reminders & Notifications ---
  async getReminders(): Promise<ReminderSettings> {
    return request<ReminderSettings>('/reminders');
  },

  async updateReminders(updates: Partial<ReminderSettings>): Promise<ReminderSettings> {
    return request<ReminderSettings>('/reminders', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async evaluateReminders(): Promise<any> {
    return request<any>('/reminders/evaluate', {
      method: 'POST',
    });
  },

  async getEmailPreferences(): Promise<EmailPreferences> {
    return request<EmailPreferences>('/email/preferences');
  },

  async updateEmailPreferences(updates: Partial<EmailPreferences>): Promise<EmailPreferences> {
    return request<EmailPreferences>('/email/preferences', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async sendTestEmail(emailType = 'reminder', recipientEmail?: string): Promise<any> {
    return request<any>('/email/test', {
      method: 'POST',
      body: JSON.stringify({ email_type: emailType, recipient_email: recipientEmail }),
    });
  },

  async getDeliveryLogs(limit = 20): Promise<DeliveryLog[]> {
    return request<DeliveryLog[]>(`/delivery/logs?limit=${limit}`);
  },

  async subscribePush(endpoint: string, keys: { p256dh: string; auth: string }): Promise<any> {
    return request<any>('/push/subscribe', {
      method: 'POST',
      body: JSON.stringify({ endpoint, keys, device_info: navigator.userAgent }),
    });
  },

  async testPush(): Promise<any> {
    return request<any>('/push/test', {
      method: 'POST',
    });
  },

  // --- Weather ---
  async getWeather(city = 'New York', lat?: number, lon?: number): Promise<WeatherData> {
    const params = new URLSearchParams({ city });
    if (lat !== undefined && lon !== undefined) {
      params.set('lat', lat.toString());
      params.set('lon', lon.toString());
    }
    return request<WeatherData>(`/weather?${params.toString()}`);
  },

  // --- AI Assistant ---
  async askAI(message: string, history: AIChatMessage[] = []): Promise<{ reply: string; context_used: any; disclaimer: string }> {
    return request<{ reply: string; context_used: any; disclaimer: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
  },

  // --- Analytics & Export ---
  async getAnalytics(period = '7d'): Promise<AnalyticsSummary> {
    return request<AnalyticsSummary>(`/analytics?period=${period}`);
  },

  getCSVExportUrl(): string {
    return `${API_BASE}/analytics/export/csv`;
  },

  // --- Gamification & Social ---
  async getAchievements(): Promise<AchievementItem[]> {
    return request<AchievementItem[]>('/achievements');
  },

  async getChallenges(): Promise<Challenge[]> {
    return request<Challenge[]>('/challenges');
  },

  async createChallenge(title: string, description: string, target_daily_ml: number, duration_days: number): Promise<Challenge> {
    return request<Challenge>('/challenges', {
      method: 'POST',
      body: JSON.stringify({ title, description, target_daily_ml, duration_days }),
    });
  },

  async joinChallenge(invite_code: string): Promise<any> {
    return request<any>('/challenges/join', {
      method: 'POST',
      body: JSON.stringify({ invite_code }),
    });
  },

  // --- Offline Queue Sync ---
  getOfflineCount(): number {
    return getStoredQueue().length;
  },

  async syncOfflineQueue(): Promise<number> {
    if (!navigator.onLine) return 0;
    const queue = getStoredQueue();
    if (queue.length === 0) return 0;

    let syncedCount = 0;
    const remaining: QueuedDrink[] = [];

    for (const item of queue) {
      try {
        await request('/intake/log', {
          method: 'POST',
          body: JSON.stringify({
            amount_ml: item.amount_ml,
            container_type: item.container_type,
            temperature: item.temperature,
            logged_at: item.logged_at
          }),
        });
        syncedCount++;
      } catch (e) {
        remaining.push(item);
      }
    }

    saveQueue(remaining);
    return syncedCount;
  }
};
