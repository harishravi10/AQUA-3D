-- ============================================================================
-- AQUA 3D: Complete Supabase PostgreSQL Schema & Row Level Security Policies
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    display_name TEXT NOT NULL DEFAULT 'Hydration Voyager',
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    unit_preference TEXT NOT NULL DEFAULT 'ml' CHECK (unit_preference IN ('ml', 'oz')),
    bottle_capacity INT NOT NULL DEFAULT 1000 CHECK (bottle_capacity >= 200 AND bottle_capacity <= 5000),
    bottle_style TEXT NOT NULL DEFAULT 'futuristic_glass' CHECK (bottle_style IN ('futuristic_glass', 'hydro_flask', 'smart_tumbler', 'crystal_decanter')),
    waking_time TIME NOT NULL DEFAULT '07:00:00',
    sleeping_time TIME NOT NULL DEFAULT '23:00:00',
    theme_preference TEXT NOT NULL DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light')),
    reduced_motion BOOLEAN NOT NULL DEFAULT FALSE,
    low_power_3d BOOLEAN NOT NULL DEFAULT FALSE,
    gamification_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    total_volume_logged_ml BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. HYDRATION GOALS TABLE
CREATE TABLE IF NOT EXISTS public.hydration_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    daily_target_ml INT NOT NULL DEFAULT 2500 CHECK (daily_target_ml >= 500 AND daily_target_ml <= 10000),
    activity_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00 CHECK (activity_multiplier >= 0.5 AND activity_multiplier <= 2.5),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. WATER INTAKE LOGS TABLE
CREATE TABLE IF NOT EXISTS public.water_intake_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_ml INT NOT NULL CHECK (amount_ml >= 10 AND amount_ml <= 3000),
    container_type TEXT NOT NULL DEFAULT 'glass' CHECK (container_type IN ('glass', 'bottle', 'mug', 'flask', 'straw', 'custom')),
    temperature TEXT NOT NULL DEFAULT 'cool' CHECK (temperature IN ('ice_cold', 'cool', 'room_temp', 'warm', 'hot')),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. REMINDER PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.reminder_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    start_time TIME NOT NULL DEFAULT '08:00:00',
    end_time TIME NOT NULL DEFAULT '21:00:00',
    frequency_minutes INT NOT NULL DEFAULT 60 CHECK (frequency_minutes >= 15 AND frequency_minutes <= 360),
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    quiet_start TIME NOT NULL DEFAULT '22:00:00',
    quiet_end TIME NOT NULL DEFAULT '07:00:00',
    daily_reminder_limit INT NOT NULL DEFAULT 10 CHECK (daily_reminder_limit >= 1 AND daily_reminder_limit <= 24),
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    pause_until TIMESTAMPTZ,
    last_sent_at TIMESTAMPTZ,
    reminders_sent_today INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. EMAIL PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS public.email_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    daily_summary_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    weekly_report_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    milestone_alerts_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. NOTIFICATION SUBSCRIPTIONS (PUSH) TABLE
CREATE TABLE IF NOT EXISTS public.notification_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    device_info TEXT DEFAULT 'Browser',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. NOTIFICATION DELIVERY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'push')),
    notification_type TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('delivered', 'simulated', 'failed', 'partial')),
    details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. ACHIEVEMENTS CATALOG
CREATE TABLE IF NOT EXISTS public.achievements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- 10. SOCIAL CHALLENGES TABLE
CREATE TABLE IF NOT EXISTS public.challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_daily_ml INT NOT NULL DEFAULT 2500,
    duration_days INT NOT NULL DEFAULT 7,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    invite_code TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'upcoming')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CHALLENGE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.challenge_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    streak INT NOT NULL DEFAULT 0,
    total_ml INT NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- 12. AI CONVERSATION HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date ON public.water_intake_logs(user_id, logged_at);
CREATE INDEX IF NOT EXISTS idx_challenges_invite ON public.challenges(invite_code);
CREATE INDEX IF NOT EXISTS idx_challenge_members_lookup ON public.challenge_members(challenge_id, user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_user ON public.notification_delivery_logs(user_id, created_at DESC);

-- SEED ACHIEVEMENTS
INSERT INTO public.achievements (id, title, description, icon, category) VALUES
('first_drop', 'First Sip', 'Logged your first water intake in AQUA 3D', 'droplet', 'milestone'),
('day_conqueror', 'Target Reached', 'Hit 100% of your daily hydration target', 'trophy', 'milestone'),
('streak_3', 'Triple Threat', 'Maintained a 3-day continuous hydration streak', 'flame', 'streak'),
('streak_7', 'Weekly Flow', 'Maintained a 7-day continuous hydration streak', 'zap', 'streak'),
('streak_30', 'Aqua Master', 'Maintained a 30-day hydration habit', 'crown', 'streak'),
('early_bird', 'Sunrise Hydration', 'Logged your first glass before 8:00 AM', 'sun', 'habit'),
('volume_10k', '10 Liters Club', 'Logged 10,000 ml of total hydration', 'award', 'volume'),
('volume_50k', '50 Liters Club', 'Logged 50,000 ml of total hydration', 'star', 'volume'),
('challenge_champ', 'Challenger', 'Joined an active social hydration challenge', 'users', 'social')
ON CONFLICT (id) DO NOTHING;

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hydration_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_intake_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_delivery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- Profiles: users read and update own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Hydration Goals: users manage own goals
CREATE POLICY "Users can view own goals" ON public.hydration_goals FOR ALL USING (auth.uid() = user_id);

-- Water Intake Logs: users manage own intake
CREATE POLICY "Users can manage own logs" ON public.water_intake_logs FOR ALL USING (auth.uid() = user_id);

-- Reminders & Email: private to user
CREATE POLICY "Users manage reminder preferences" ON public.reminder_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage email preferences" ON public.email_preferences FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage push subscriptions" ON public.notification_subscriptions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users read own delivery logs" ON public.notification_delivery_logs FOR SELECT USING (auth.uid() = user_id);

-- Achievements: public catalog, private unlocks
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements catalog is public" ON public.achievements FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "Users view own unlocked achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- Challenges: viewable by authenticated users; members manage membership
CREATE POLICY "Challenges viewable by authenticated users" ON public.challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users create challenges" ON public.challenges FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Members view challenge members" ON public.challenge_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users join challenges" ON public.challenge_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- AI Messages: private to user
CREATE POLICY "Users manage own AI messages" ON public.ai_messages FOR ALL USING (auth.uid() = user_id);
