export type BottleStyle = 'futuristic_glass' | 'hydro_flask' | 'smart_tumbler' | 'crystal_decanter';
export type ContainerType = 'glass' | 'bottle' | 'mug' | 'flask' | 'straw' | 'custom';
export type WaterTemperature = 'ice_cold' | 'cool' | 'room_temp' | 'warm' | 'hot';

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  timezone: string;
  unit_preference: 'ml' | 'oz';
  bottle_capacity: number;
  bottle_style: BottleStyle;
  waking_time: string;
  sleeping_time: string;
  theme_preference: 'dark' | 'light';
  reduced_motion: boolean;
  low_power_3d: boolean;
  gamification_enabled: boolean;
  current_streak: number;
  longest_streak: number;
  total_volume_logged_ml: number;
  created_at: string;
}

export interface HydrationGoal {
  id: string;
  user_id: string;
  daily_target_ml: number;
  activity_multiplier: number;
  effective_date: string;
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  amount_ml: number;
  container_type: ContainerType;
  temperature: WaterTemperature;
  logged_at: string;
  is_deleted?: boolean;
  created_at: string;
}

export interface TodayHydration {
  date: string;
  daily_target_ml: number;
  total_consumed_ml: number;
  remaining_ml: number;
  completion_percentage: number;
  is_goal_reached: boolean;
  drinks_count: number;
  current_streak: number;
  longest_streak: number;
  bottle_capacity: number;
  bottle_style: BottleStyle;
  unit_preference: 'ml' | 'oz';
  logs: WaterLog[];
}

export interface ReminderSettings {
  user_id: string;
  enabled: boolean;
  start_time: string;
  end_time: string;
  frequency_minutes: number;
  quiet_hours_enabled: boolean;
  quiet_start: string;
  quiet_end: string;
  daily_reminder_limit: number;
  email_enabled: boolean;
  push_enabled: boolean;
  pause_until?: string | null;
  last_sent_at?: string | null;
  reminders_sent_today: number;
}

export interface EmailPreferences {
  user_id: string;
  recipient_email: string;
  reminders_enabled: boolean;
  daily_summary_enabled: boolean;
  weekly_report_enabled: boolean;
  milestone_alerts_enabled: boolean;
}

export interface DeliveryLog {
  id: string;
  user_id: string;
  channel: 'email' | 'push';
  notification_type: string;
  status: 'delivered' | 'simulated' | 'failed' | 'partial';
  details?: string;
  created_at: string;
}

export interface WeatherData {
  city: string;
  temperature_c: number;
  temperature_f: number;
  humidity: number;
  condition: string;
  weather_code: number;
  wind_speed_kmh: number;
  hydration_advice: string;
  recommended_intake_adjustment_ml: number;
  last_updated: string;
}

export interface AIChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface DailyIntakeDataPoint {
  date: string;
  day_name: string;
  consumed_ml: number;
  target_ml: number;
  completion_rate: number;
  drinks_count: number;
}

export interface AnalyticsSummary {
  period: string;
  total_consumed_ml: number;
  daily_average_ml: number;
  goal_completion_rate: number;
  best_day: {
    date: string;
    amount_ml: number;
  };
  current_streak: number;
  longest_streak: number;
  total_drinks_logged: number;
  hourly_distribution: Record<string, number>;
  daily_history: DailyIntakeDataPoint[];
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlocked_at?: string | null;
  progress: number;
}

export interface ChallengeMember {
  user_id: string;
  display_name: string;
  progress_percentage: number;
  streak: number;
  total_ml: number;
  joined_at: string;
}

export interface Challenge {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  target_daily_ml: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  invite_code: string;
  status: 'active' | 'completed' | 'upcoming';
  is_joined: boolean;
  members_count: number;
  members: ChallengeMember[];
}
