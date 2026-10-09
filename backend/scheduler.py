import asyncio
from datetime import datetime, date
from backend.database import store
from backend.services.email_service import send_notification_email
from backend.services.push_service import send_web_push

async def evaluate_user_reminders(user_id: str):
    reminders = store.get_reminder_settings(user_id)
    if not reminders.get("enabled", True):
        return

    # Check pause until
    pause_until = reminders.get("pause_until")
    if pause_until:
        try:
            if datetime.fromisoformat(pause_until) > datetime.now():
                return
        except:
            pass

    # Check goal reached
    today_sum = store.get_today_summary(user_id)
    if today_sum.get("is_goal_reached", False):
        return

    # Check daily limit
    sent_today = reminders.get("reminders_sent_today", 0)
    limit = reminders.get("daily_reminder_limit", 10)
    if sent_today >= limit:
        return

    now = datetime.now()
    now_time_str = now.strftime("%H:%M")

    # Check active waking hours window
    start_t = reminders.get("start_time", "08:00")
    end_t = reminders.get("end_time", "21:00")
    if not (start_t <= now_time_str <= end_t):
        return

    # Check quiet hours
    if reminders.get("quiet_hours_enabled", True):
        q_start = reminders.get("quiet_start", "22:00")
        q_end = reminders.get("quiet_end", "07:00")
        if q_start > q_end:
            # Crosses midnight (e.g., 22:00 to 07:00)
            if now_time_str >= q_start or now_time_str <= q_end:
                return
        else:
            if q_start <= now_time_str <= q_end:
                return

    # Check frequency interval
    last_sent = reminders.get("last_sent_at")
    freq_min = reminders.get("frequency_minutes", 60)
    if last_sent:
        try:
            last_dt = datetime.fromisoformat(last_sent)
            if (now - last_dt).total_seconds() < (freq_min * 60):
                return
        except:
            pass

    # Trigger Reminders
    profile = store.get_profile(user_id)
    recipient = profile.get("email", "champion@aqua3d.app")
    
    if reminders.get("email_enabled", True):
        await send_notification_email(user_id, recipient, email_type="reminder")

    if reminders.get("push_enabled", False):
        await send_web_push(
            user_id,
            title="💧 Hydration Reminder",
            body="Time for a crisp glass of water to keep your mind and body revitalized!"
        )

    # Update state
    reminders["last_sent_at"] = now.isoformat()
    reminders["reminders_sent_today"] = sent_today + 1
    store.save()

async def background_scheduler_loop(interval_seconds: int = 60):
    """Background polling loop for reminder evaluation"""
    while True:
        try:
            profiles = store.data.get("profiles", {})
            for uid in list(profiles.keys()):
                await evaluate_user_reminders(uid)
        except Exception as e:
            print(f"[Scheduler] Loop error: {e}")
        await asyncio.sleep(interval_seconds)
