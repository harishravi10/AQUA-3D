from datetime import datetime, date, time
from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# --- Authentication Models ---
class AuthRegisterRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)
    display_name: str = Field(..., min_length=1, max_length=100)
    daily_target_ml: Optional[int] = Field(default=2500, ge=500, le=8000)
    bottle_style: Optional[Literal["futuristic_glass", "hydro_flask", "smart_tumbler", "crystal_decanter"]] = "futuristic_glass"

class AuthLoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=150)
    password: str = Field(..., min_length=6, max_length=100)

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "ProfileResponse"

# --- User Profile ---
class ProfileBase(BaseModel):
    display_name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = "champion@aqua3d.app"
    timezone: str = "America/New_York"
    unit_preference: Literal["ml", "oz"] = "ml"
    bottle_capacity: int = Field(default=1000, ge=200, le=5000)
    bottle_style: Literal["futuristic_glass", "hydro_flask", "smart_tumbler", "crystal_decanter"] = "futuristic_glass"
    waking_time: str = "07:00"
    sleeping_time: str = "23:00"
    theme_preference: Literal["dark", "light"] = "dark"
    reduced_motion: bool = False
    low_power_3d: bool = False
    gamification_enabled: bool = True

class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    email: Optional[str] = None
    timezone: Optional[str] = None
    unit_preference: Optional[Literal["ml", "oz"]] = None
    bottle_capacity: Optional[int] = None
    bottle_style: Optional[Literal["futuristic_glass", "hydro_flask", "smart_tumbler", "crystal_decanter"]] = None
    waking_time: Optional[str] = None
    sleeping_time: Optional[str] = None
    theme_preference: Optional[Literal["dark", "light"]] = None
    reduced_motion: Optional[bool] = None
    low_power_3d: Optional[bool] = None
    gamification_enabled: Optional[bool] = None

class ProfileResponse(ProfileBase):
    id: str
    current_streak: int = 0
    longest_streak: int = 0
    total_volume_logged_ml: int = 0
    created_at: str

# --- Hydration Goals ---
class HydrationGoalCreate(BaseModel):
    daily_target_ml: int = Field(..., ge=500, le=10000, description="Daily water goal in ml")
    activity_multiplier: float = Field(default=1.0, ge=0.5, le=2.5)

class HydrationGoalResponse(HydrationGoalCreate):
    id: str
    user_id: str
    effective_date: str
    created_at: str

# --- Water Intake Logging ---
class WaterLogCreate(BaseModel):
    amount_ml: int = Field(..., ge=10, le=3000, description="Amount consumed in ml")
    container_type: Literal["glass", "bottle", "mug", "flask", "straw", "custom"] = "glass"
    temperature: Literal["ice_cold", "cool", "room_temp", "warm", "hot"] = "cool"
    logged_at: Optional[str] = None

class WaterLogUpdate(BaseModel):
    amount_ml: Optional[int] = Field(None, ge=10, le=3000)
    container_type: Optional[Literal["glass", "bottle", "mug", "flask", "straw", "custom"]] = None
    temperature: Optional[Literal["ice_cold", "cool", "room_temp", "warm", "hot"]] = None
    logged_at: Optional[str] = None

class WaterLogResponse(BaseModel):
    id: str
    user_id: str
    amount_ml: int
    container_type: str
    temperature: str
    logged_at: str
    is_deleted: bool = False
    created_at: str

class TodayHydrationResponse(BaseModel):
    date: str
    daily_target_ml: int
    total_consumed_ml: int
    remaining_ml: int
    completion_percentage: float
    is_goal_reached: bool
    drinks_count: int
    current_streak: int
    longest_streak: int
    bottle_capacity: int
    bottle_style: str
    unit_preference: str
    logs: List[WaterLogResponse]

# --- Reminders & Notifications ---
class ReminderSettingsUpdate(BaseModel):
    enabled: Optional[bool] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    frequency_minutes: Optional[int] = Field(None, ge=15, le=360)
    quiet_hours_enabled: Optional[bool] = None
    quiet_start: Optional[str] = None
    quiet_end: Optional[str] = None
    daily_reminder_limit: Optional[int] = Field(None, ge=1, le=24)
    email_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    pause_until: Optional[str] = None

class ReminderSettingsResponse(BaseModel):
    user_id: str
    enabled: bool = True
    start_time: str = "08:00"
    end_time: str = "21:00"
    frequency_minutes: int = 60
    quiet_hours_enabled: bool = True
    quiet_start: str = "22:00"
    quiet_end: str = "07:00"
    daily_reminder_limit: int = 10
    email_enabled: bool = True
    push_enabled: bool = False
    pause_until: Optional[str] = None
    last_sent_at: Optional[str] = None
    reminders_sent_today: int = 0

class EmailPreferencesUpdate(BaseModel):
    reminders_enabled: Optional[bool] = None
    daily_summary_enabled: Optional[bool] = None
    weekly_report_enabled: Optional[bool] = None
    milestone_alerts_enabled: Optional[bool] = None
    recipient_email: Optional[str] = None

class EmailPreferencesResponse(BaseModel):
    user_id: str
    recipient_email: str
    reminders_enabled: bool = True
    daily_summary_enabled: bool = True
    weekly_report_enabled: bool = True
    milestone_alerts_enabled: bool = True

class SendTestEmailRequest(BaseModel):
    recipient_email: Optional[str] = None
    email_type: Literal["reminder", "daily_summary", "goal_reached", "weekly_report"] = "reminder"

class PushSubscriptionKey(BaseModel):
    p256dh: str
    auth: str

class PushSubscriptionCreate(BaseModel):
    endpoint: str
    keys: PushSubscriptionKey
    device_info: Optional[str] = "Browser"

class DeliveryLogResponse(BaseModel):
    id: str
    user_id: str
    channel: str # 'email' or 'push'
    notification_type: str
    status: str # 'delivered', 'simulated', 'failed'
    details: Optional[str] = None
    created_at: str

# --- Weather ---
class WeatherQuery(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    city: Optional[str] = "New York"

class WeatherResponse(BaseModel):
    city: str
    temperature_c: float
    temperature_f: float
    humidity: int
    condition: str
    weather_code: int
    wind_speed_kmh: float
    hydration_advice: str
    recommended_intake_adjustment_ml: int
    last_updated: str

# --- AI Assistant ---
class AIChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: Optional[str] = None

class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: Optional[List[AIChatMessage]] = []

class AIChatResponse(BaseModel):
    reply: str
    context_used: Dict[str, Any]
    disclaimer: str = "AQUA 3D AI provides habit suggestions and hydration tracking analysis. It is not medical advice."

# --- Analytics ---
class DailyIntakeDataPoint(BaseModel):
    date: str
    day_name: str
    consumed_ml: int
    target_ml: int
    completion_rate: float
    drinks_count: int

class AnalyticsSummary(BaseModel):
    period: str # '7d', '30d', 'all'
    total_consumed_ml: int
    daily_average_ml: int
    goal_completion_rate: float
    best_day: Optional[Dict[str, Any]] = None
    current_streak: int
    longest_streak: int
    total_drinks_logged: int
    hourly_distribution: Dict[str, int]
    daily_history: List[DailyIntakeDataPoint]

# --- Gamification & Social ---
class AchievementItem(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    category: str
    unlocked: bool = False
    unlocked_at: Optional[str] = None
    progress: float = 0.0

class ChallengeCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., max_length=500)
    target_daily_ml: int = Field(default=2500, ge=1000, le=6000)
    duration_days: int = Field(default=7, ge=1, le=30)
    start_date: Optional[str] = None

class ChallengeMemberResponse(BaseModel):
    user_id: str
    display_name: str
    progress_percentage: float
    streak: int
    total_ml: int
    joined_at: str

class ChallengeResponse(BaseModel):
    id: str
    creator_id: str
    title: str
    description: str
    target_daily_ml: int
    duration_days: int
    start_date: str
    end_date: str
    invite_code: str
    status: Literal["active", "completed", "upcoming"]
    is_joined: bool = False
    members_count: int = 1
    members: List[ChallengeMemberResponse] = []

class ChallengeJoinRequest(BaseModel):
    invite_code: str
