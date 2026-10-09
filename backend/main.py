import csv
import io
import uuid
from datetime import datetime, date, timedelta
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Query, Body, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse

from backend.config import settings
from backend.database import store, DEFAULT_ACHIEVEMENTS
from backend.models import (
    ProfileResponse, ProfileUpdate,
    HydrationGoalCreate, HydrationGoalResponse,
    WaterLogCreate, WaterLogUpdate, WaterLogResponse, TodayHydrationResponse,
    ReminderSettingsUpdate, ReminderSettingsResponse,
    EmailPreferencesUpdate, EmailPreferencesResponse, SendTestEmailRequest,
    PushSubscriptionCreate, DeliveryLogResponse,
    WeatherResponse,
    AIChatRequest, AIChatResponse,
    AnalyticsSummary, DailyIntakeDataPoint,
    AchievementItem,
    ChallengeCreate, ChallengeResponse, ChallengeJoinRequest,
    AuthRegisterRequest, AuthLoginRequest, AuthResponse
)
import asyncio
from contextlib import asynccontextmanager
from backend.services.weather_service import fetch_weather_data
from backend.services.email_service import send_notification_email
from backend.services.push_service import send_web_push
from backend.services.ai_service import ask_ai_assistant
from backend.scheduler import background_scheduler_loop

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background scheduler task on startup
    task = asyncio.create_task(background_scheduler_loop(interval_seconds=60))
    yield
    task.cancel()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for AQUA 3D Next-Generation Hydration Companion",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Authentication Dependency: extracts user id from Authorization header or x-user-id
def get_current_user_id(
    authorization: Optional[str] = Header(None),
    x_user_id: Optional[str] = Header(None)
) -> str:
    # 1. Bearer Token
    if authorization and authorization.strip():
        user = store.get_user_by_token(authorization)
        if user:
            return user["id"]
    # 2. Direct x-user-id header
    if x_user_id and x_user_id.strip():
        return x_user_id.strip()
    # 3. Default demo fallback for zero-friction public sandbox
    return "user-demo-aqua3d"

@app.get("/")
def root():
    return {
        "app": "AQUA 3D Hydration Platform",
        "status": "online",
        "version": settings.APP_VERSION,
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# --- Authentication Endpoints ---
@app.post("/api/auth/register", response_model=AuthResponse)
def register(payload: AuthRegisterRequest):
    try:
        profile, token = store.register_user(
            email=payload.email,
            password=payload.password,
            display_name=payload.display_name,
            daily_target_ml=payload.daily_target_ml or 2500,
            bottle_style=payload.bottle_style or "futuristic_glass"
        )
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": profile
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login", response_model=AuthResponse)
def login(payload: AuthLoginRequest):
    profile, token = store.authenticate_user(payload.email, payload.password)
    if not profile or not token:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": profile
    }

@app.get("/api/auth/me", response_model=ProfileResponse)
def get_me(user_id: str = Depends(get_current_user_id)):
    return store.get_profile(user_id)

@app.get("/api/auth/demo-accounts")
def get_demo_accounts():
    return [
        {
            "display_name": "Hydro Voyager (Demo)",
            "email": "champion@aqua3d.app",
            "user_id": "user-demo-aqua3d",
            "tag": "Active Streak"
        },
        {
            "display_name": "Elena Rostova",
            "email": "elena@aqua3d.app",
            "user_id": "user-alex",
            "tag": "Challenge Member"
        },
        {
            "display_name": "Marcus Vance",
            "email": "marcus@aqua3d.app",
            "user_id": "user-marcus",
            "tag": "Challenge Member"
        }
    ]

# --- Profile Endpoints ---
@app.get("/api/profile", response_model=ProfileResponse)
def get_profile(user_id: str = Depends(get_current_user_id)):
    return store.get_profile(user_id)

@app.put("/api/profile", response_model=ProfileResponse)
def update_profile(updates: ProfileUpdate, user_id: str = Depends(get_current_user_id)):
    return store.update_profile(user_id, updates.model_dump(exclude_unset=True))

# --- Hydration Goals ---
@app.get("/api/goal", response_model=HydrationGoalResponse)
def get_goal(user_id: str = Depends(get_current_user_id)):
    return store.get_goal(user_id)

@app.post("/api/goal", response_model=HydrationGoalResponse)
def set_goal(goal_data: HydrationGoalCreate, user_id: str = Depends(get_current_user_id)):
    return store.set_goal(user_id, goal_data.daily_target_ml, goal_data.activity_multiplier)

# --- Water Intake Logging ---
@app.get("/api/intake/today", response_model=TodayHydrationResponse)
def get_today_hydration(user_id: str = Depends(get_current_user_id)):
    return store.get_today_summary(user_id)

@app.post("/api/intake/log", response_model=WaterLogResponse)
def log_water_intake(log_data: WaterLogCreate, user_id: str = Depends(get_current_user_id)):
    return store.log_intake(
        user_id=user_id,
        amount_ml=log_data.amount_ml,
        container_type=log_data.container_type,
        temperature=log_data.temperature,
        logged_at=log_data.logged_at
    )

@app.put("/api/intake/{log_id}", response_model=WaterLogResponse)
def update_water_log(log_id: str, updates: WaterLogUpdate, user_id: str = Depends(get_current_user_id)):
    updated = store.update_intake(user_id, log_id, updates.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Intake record not found or unauthorized")
    return updated

@app.delete("/api/intake/{log_id}")
def delete_water_log(log_id: str, user_id: str = Depends(get_current_user_id)):
    success = store.delete_intake(user_id, log_id)
    if not success:
        raise HTTPException(status_code=404, detail="Intake record not found")
    return {"message": "Intake record successfully deleted", "id": log_id}

@app.post("/api/intake/undo")
def undo_last_water_log(user_id: str = Depends(get_current_user_id)):
    undone = store.undo_last_intake(user_id)
    if not undone:
        raise HTTPException(status_code=400, detail="No active logged drinks to undo")
    return {"message": "Successfully removed last drink", "undone_log": undone}

@app.get("/api/intake/history", response_model=List[WaterLogResponse])
def get_intake_history(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    user_id: str = Depends(get_current_user_id)
):
    return store.get_intake_logs(user_id, start_date=start_date, end_date=end_date)

# --- Reminders & Notifications ---
@app.get("/api/reminders", response_model=ReminderSettingsResponse)
def get_reminder_settings(user_id: str = Depends(get_current_user_id)):
    return store.get_reminder_settings(user_id)

@app.put("/api/reminders", response_model=ReminderSettingsResponse)
def update_reminder_settings(updates: ReminderSettingsUpdate, user_id: str = Depends(get_current_user_id)):
    return store.update_reminder_settings(user_id, updates.model_dump(exclude_unset=True))

@app.post("/api/reminders/evaluate")
async def check_and_evaluate_reminders(user_id: str = Depends(get_current_user_id)):
    reminders = store.get_reminder_settings(user_id)
    profile = store.get_profile(user_id)
    today_sum = store.get_today_summary(user_id)
    
    if not reminders.get("enabled", True):
        return {"action": "skipped", "reason": "Reminders disabled by user"}

    if today_sum["is_goal_reached"]:
        return {"action": "skipped", "reason": "Daily hydration goal already achieved"}

    # Trigger test notification
    email_res = None
    if reminders.get("email_enabled", True):
        email_res = await send_notification_email(
            user_id=user_id,
            recipient_email=profile.get("email", "champion@aqua3d.app"),
            email_type="reminder"
        )
    
    push_res = None
    if reminders.get("push_enabled", False):
        push_res = await send_web_push(
            user_id=user_id,
            title="💧 Hydration Reminder",
            body="Time to refresh! Log a glass in AQUA 3D to keep your momentum going."
        )

    return {
        "action": "evaluated",
        "reminders_sent": True,
        "email_delivery": email_res,
        "push_delivery": push_res
    }

# --- Email & Delivery Logs ---
@app.get("/api/email/preferences", response_model=EmailPreferencesResponse)
def get_email_preferences(user_id: str = Depends(get_current_user_id)):
    return store.get_email_prefs(user_id)

@app.put("/api/email/preferences", response_model=EmailPreferencesResponse)
def update_email_preferences(updates: EmailPreferencesUpdate, user_id: str = Depends(get_current_user_id)):
    return store.update_email_prefs(user_id, updates.model_dump(exclude_unset=True))

@app.post("/api/email/test")
async def test_send_email(req: SendTestEmailRequest, user_id: str = Depends(get_current_user_id)):
    profile = store.get_profile(user_id)
    target_email = req.recipient_email or profile.get("email", "champion@aqua3d.app")
    return await send_notification_email(user_id, target_email, email_type=req.email_type)

@app.get("/api/delivery/logs", response_model=List[DeliveryLogResponse])
def get_delivery_logs(limit: int = 20, user_id: str = Depends(get_current_user_id)):
    return store.get_delivery_logs(user_id, limit=limit)

# --- Browser Push ---
@app.post("/api/push/subscribe")
def register_push_subscription(sub: PushSubscriptionCreate, user_id: str = Depends(get_current_user_id)):
    store.add_push_subscription(
        user_id=user_id,
        endpoint=sub.endpoint,
        keys=sub.keys.model_dump(),
        device_info=sub.device_info or "Browser"
    )
    return {"status": "subscribed", "message": "Browser push subscription registered"}

@app.post("/api/push/test")
async def test_push_notification(user_id: str = Depends(get_current_user_id)):
    return await send_web_push(
        user_id=user_id,
        title="🌊 AQUA 3D Alert",
        body="Smart Hydration Test: Drink 200 ml of fresh water to keep your focus sharp!"
    )

# --- Weather ---
@app.get("/api/weather", response_model=WeatherResponse)
async def get_weather(
    city: str = Query("New York"),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None)
):
    return await fetch_weather_data(city=city, lat=lat, lon=lon)

# --- AI Assistant ---
@app.post("/api/ai/chat", response_model=AIChatResponse)
async def chat_with_assistant(req: AIChatRequest, user_id: str = Depends(get_current_user_id)):
    hist = [h.model_dump() for h in (req.history or [])]
    result = await ask_ai_assistant(user_id, req.message, history=hist)
    return {
        "reply": result["reply"],
        "context_used": result["context_used"],
        "disclaimer": "AQUA 3D AI provides habit suggestions and hydration tracking analysis. It is not medical advice."
    }

# --- Analytics ---
@app.get("/api/analytics", response_model=AnalyticsSummary)
def get_analytics(period: str = Query("7d"), user_id: str = Depends(get_current_user_id)):
    days_back = 7 if period == "7d" else 30 if period == "30d" else 90
    today = date.today()
    start_date = (today - timedelta(days=days_back - 1)).isoformat()
    end_date = today.isoformat()
    
    logs = store.get_intake_logs(user_id, start_date=start_date, end_date=end_date)
    goal = store.get_goal(user_id)
    target_ml = goal.get("daily_target_ml", 2500)
    profile = store.get_profile(user_id)
    
    # Aggregate day by day
    day_map: Dict[str, List[int]] = {}
    hourly_map: Dict[str, int] = {f"{h:02d}:00": 0 for h in range(6, 24)}
    
    for l in logs:
        d_str = l["logged_at"][:10]
        if d_str not in day_map:
            day_map[d_str] = []
        day_map[d_str].append(l["amount_ml"])
        
        # Hourly distribution
        try:
            hour = int(l["logged_at"][11:13])
            key = f"{hour:02d}:00"
            if key in hourly_map:
                hourly_map[key] += l["amount_ml"]
        except:
            pass

    daily_points: List[DailyIntakeDataPoint] = []
    total_consumed = 0
    best_day_val = 0
    best_day_date = None
    completed_days_count = 0

    for i in range(days_back):
        curr_d = today - timedelta(days=days_back - 1 - i)
        d_str = curr_d.isoformat()
        day_logs = day_map.get(d_str, [])
        consumed = sum(day_logs)
        total_consumed += consumed
        
        if consumed >= target_ml:
            completed_days_count += 1
        if consumed > best_day_val:
            best_day_val = consumed
            best_day_date = d_str

        daily_points.append(DailyIntakeDataPoint(
            date=d_str,
            day_name=curr_d.strftime("%a"),
            consumed_ml=consumed,
            target_ml=target_ml,
            completion_rate=round(min(200.0, (consumed / target_ml * 100)) if target_ml > 0 else 0, 1),
            drinks_count=len(day_logs)
        ))

    daily_avg = total_consumed // days_back if days_back > 0 else 0
    goal_rate = round((completed_days_count / days_back) * 100, 1) if days_back > 0 else 0.0

    return AnalyticsSummary(
        period=period,
        total_consumed_ml=total_consumed,
        daily_average_ml=daily_avg,
        goal_completion_rate=goal_rate,
        best_day={"date": best_day_date or today.isoformat(), "amount_ml": best_day_val},
        current_streak=profile.get("current_streak", 0),
        longest_streak=profile.get("longest_streak", 0),
        total_drinks_logged=len(logs),
        hourly_distribution=hourly_map,
        daily_history=daily_points
    )

@app.get("/api/analytics/export/csv")
def export_csv(user_id: str = Depends(get_current_user_id)):
    logs = store.get_intake_logs(user_id)
    profile = store.get_profile(user_id)
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Log ID", "User Display Name", "Timestamp", "Amount (ml)", "Container Type", "Temperature"])
    
    for l in sorted(logs, key=lambda x: x["logged_at"], reverse=True):
        writer.writerow([
            l["id"],
            profile.get("display_name", "User"),
            l["logged_at"],
            l["amount_ml"],
            l["container_type"],
            l["temperature"]
        ])
    
    csv_content = output.getvalue()
    return PlainTextResponse(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=aqua3d_hydration_export_{date.today().isoformat()}.csv"}
    )

# --- Gamification & Achievements ---
@app.get("/api/achievements", response_model=List[AchievementItem])
def get_achievements(user_id: str = Depends(get_current_user_id)):
    return store.get_user_achievements(user_id)

# --- Social Challenges ---
@app.get("/api/challenges", response_model=List[ChallengeResponse])
def get_challenges(user_id: str = Depends(get_current_user_id)):
    return store.get_challenges(user_id)

@app.post("/api/challenges", response_model=ChallengeResponse)
def create_challenge(payload: ChallengeCreate, user_id: str = Depends(get_current_user_id)):
    ch = store.create_challenge(
        creator_id=user_id,
        title=payload.title,
        description=payload.description,
        target_daily_ml=payload.target_daily_ml,
        duration_days=payload.duration_days
    )
    # Return formatted response
    challenges = store.get_challenges(user_id)
    for c in challenges:
        if c["id"] == ch["id"]:
            return c
    raise HTTPException(status_code=500, detail="Challenge creation failed")

@app.post("/api/challenges/join")
def join_challenge(payload: ChallengeJoinRequest, user_id: str = Depends(get_current_user_id)):
    joined = store.join_challenge(user_id, payload.invite_code)
    if not joined:
        raise HTTPException(status_code=404, detail="Challenge not found with this invitation code")
    return {"message": "Successfully joined challenge", "challenge": joined}
