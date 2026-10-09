import json
import os
import uuid
import hashlib
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional, Any
from backend.config import settings

DATA_FILE = os.path.join(os.path.dirname(__file__), "local_store.json")

DEFAULT_ACHIEVEMENTS = [
    {
        "id": "first_drop",
        "title": "First Sip",
        "description": "Logged your first water intake in AQUA 3D",
        "icon": "droplet",
        "category": "milestone"
    },
    {
        "id": "day_conqueror",
        "title": "Target Reached",
        "description": "Hit 100% of your daily hydration target",
        "icon": "trophy",
        "category": "milestone"
    },
    {
        "id": "streak_3",
        "title": "Triple Threat",
        "description": "Maintained a 3-day continuous hydration streak",
        "icon": "flame",
        "category": "streak"
    },
    {
        "id": "streak_7",
        "title": "Weekly Flow",
        "description": "Maintained a 7-day continuous hydration streak",
        "icon": "zap",
        "category": "streak"
    },
    {
        "id": "streak_30",
        "title": "Aqua Master",
        "description": "Maintained a 30-day hydration habit",
        "icon": "crown",
        "category": "streak"
    },
    {
        "id": "early_bird",
        "title": "Sunrise Hydration",
        "description": "Logged your first glass before 8:00 AM",
        "icon": "sun",
        "category": "habit"
    },
    {
        "id": "volume_10k",
        "title": "10 Liters Club",
        "description": "Logged 10,000 ml of total hydration",
        "icon": "award",
        "category": "volume"
    },
    {
        "id": "volume_50k",
        "title": "50 Liters Club",
        "description": "Logged 50,000 ml of total hydration",
        "icon": "star",
        "category": "volume"
    },
    {
        "id": "challenge_champ",
        "title": "Challenger",
        "description": "Joined an active social hydration challenge",
        "icon": "users",
        "category": "social"
    }
]

class LocalStore:
    def __init__(self, filepath: str = DATA_FILE):
        self.filepath = filepath
        self.data: Dict[str, Any] = {
            "profiles": {},
            "goals": {},
            "intake_logs": [],
            "reminders": {},
            "email_prefs": {},
            "push_subs": [],
            "delivery_logs": [],
            "user_achievements": [],
            "challenges": [],
            "challenge_members": [],
            "ai_messages": [],
            "users": {},
            "sessions": {}
        }
        self.load()

    def load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    content = json.load(f)
                    for key in self.data:
                        if key in content:
                            self.data[key] = content[key]
            except Exception as e:
                print(f"[LocalStore] Warning loading data: {e}")
        else:
            self._init_defaults()
            self.save()

    def _init_defaults(self):
        demo_user_id = "user-demo-aqua3d"
        now = datetime.now().isoformat()
        self.data["profiles"][demo_user_id] = {
            "id": demo_user_id,
            "email": "champion@aqua3d.app",
            "display_name": "Hydro Voyager",
            "timezone": "America/New_York",
            "unit_preference": "ml",
            "bottle_capacity": 1000,
            "waking_time": "07:00",
            "sleeping_time": "23:00",
            "theme_preference": "dark",
            "reduced_motion": False,
            "low_power_3d": False,
            "bottle_style": "futuristic_glass",
            "gamification_enabled": True,
            "current_streak": 4,
            "longest_streak": 7,
            "total_volume_logged_ml": 18500,
            "created_at": (datetime.now() - timedelta(days=14)).isoformat()
        }
        self.data["goals"][demo_user_id] = {
            "id": "goal-demo",
            "user_id": demo_user_id,
            "daily_target_ml": 2500,
            "activity_multiplier": 1.0,
            "effective_date": date.today().isoformat(),
            "created_at": now
        }
        self.data["reminders"][demo_user_id] = {
            "user_id": demo_user_id,
            "enabled": True,
            "start_time": "08:00",
            "end_time": "21:00",
            "frequency_minutes": 60,
            "quiet_hours_enabled": True,
            "quiet_start": "22:00",
            "quiet_end": "07:00",
            "daily_reminder_limit": 8,
            "email_enabled": True,
            "push_enabled": False,
            "pause_until": None,
            "last_sent_at": None,
            "reminders_sent_today": 0
        }
        self.data["email_prefs"][demo_user_id] = {
            "user_id": demo_user_id,
            "recipient_email": "champion@aqua3d.app",
            "reminders_enabled": True,
            "daily_summary_enabled": True,
            "weekly_report_enabled": True,
            "milestone_alerts_enabled": True
        }
        # Demo challenges
        self.data["challenges"] = [
            {
                "id": "chal-ocean-sprint",
                "creator_id": demo_user_id,
                "title": "Ocean Flow: 7-Day Hydration Sprint",
                "description": "Drink at least 2,500 ml every day for 7 consecutive days. Elevate energy and focus!",
                "target_daily_ml": 2500,
                "duration_days": 7,
                "start_date": (date.today() - timedelta(days=3)).isoformat(),
                "end_date": (date.today() + timedelta(days=4)).isoformat(),
                "invite_code": "OCEAN7",
                "status": "active"
            },
            {
                "id": "chal-pure-3k",
                "creator_id": "creator-alex",
                "title": "High Octane 3000ml Club",
                "description": "For athletes and high-energy individuals: 3 Liters daily hydration protocol.",
                "target_daily_ml": 3000,
                "duration_days": 14,
                "start_date": (date.today() - timedelta(days=1)).isoformat(),
                "end_date": (date.today() + timedelta(days=13)).isoformat(),
                "invite_code": "PURE3K",
                "status": "active"
            }
        ]
        self.data["challenge_members"] = [
            {
                "challenge_id": "chal-ocean-sprint",
                "user_id": demo_user_id,
                "display_name": "Hydro Voyager",
                "joined_at": now,
                "progress_percentage": 78.5,
                "streak": 4,
                "total_ml": 8200
            },
            {
                "challenge_id": "chal-ocean-sprint",
                "user_id": "user-sarah",
                "display_name": "Sarah Aqua",
                "joined_at": now,
                "progress_percentage": 92.0,
                "streak": 5,
                "total_ml": 9100
            },
            {
                "challenge_id": "chal-ocean-sprint",
                "user_id": "user-kai",
                "display_name": "Kai R.",
                "joined_at": now,
                "progress_percentage": 65.0,
                "streak": 3,
                "total_ml": 7100
            }
        ]

    def save(self):
        try:
            temp_file = f"{self.filepath}.tmp"
            with open(temp_file, "w", encoding="utf-8") as f:
                json.dump(self.data, f, indent=2)
            if os.path.exists(self.filepath):
                os.replace(temp_file, self.filepath)
            else:
                os.rename(temp_file, self.filepath)
        except Exception as e:
            print(f"[LocalStore] Error saving: {e}")

    # --- Authentication & Multi-User Management ---
    def _hash_password(self, password: str) -> str:
        salt = "aqua3d_secure_salt_2026"
        return hashlib.sha256(f"{salt}_{password}".encode("utf-8")).hexdigest()

    def register_user(
        self,
        email: str,
        password: str,
        display_name: str,
        daily_target_ml: int = 2500,
        bottle_style: str = "futuristic_glass"
    ) -> tuple[Dict[str, Any], str]:
        email_clean = email.strip().lower()
        # Check duplicate
        for uid, u in self.data.get("users", {}).items():
            if u["email"].lower() == email_clean:
                raise ValueError("An account with this email address already exists.")

        user_id = f"user-{uuid.uuid4().hex[:12]}"
        now = datetime.now().isoformat()
        
        # Save credentials
        if "users" not in self.data:
            self.data["users"] = {}
        if "sessions" not in self.data:
            self.data["sessions"] = {}

        self.data["users"][user_id] = {
            "id": user_id,
            "email": email_clean,
            "password_hash": self._hash_password(password),
            "created_at": now
        }

        # Initialize profile
        profile = {
            "id": user_id,
            "email": email_clean,
            "display_name": display_name.strip(),
            "timezone": "America/New_York",
            "unit_preference": "ml",
            "bottle_capacity": 1000,
            "waking_time": "07:00",
            "sleeping_time": "23:00",
            "theme_preference": "dark",
            "reduced_motion": False,
            "low_power_3d": False,
            "bottle_style": bottle_style,
            "gamification_enabled": True,
            "current_streak": 0,
            "longest_streak": 0,
            "total_volume_logged_ml": 0,
            "created_at": now
        }
        self.data["profiles"][user_id] = profile

        # Initialize goals
        self.data["goals"][user_id] = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "daily_target_ml": daily_target_ml,
            "activity_multiplier": 1.0,
            "effective_date": date.today().isoformat(),
            "created_at": now
        }

        # Initialize reminders
        self.data["reminders"][user_id] = {
            "user_id": user_id,
            "enabled": True,
            "start_time": "08:00",
            "end_time": "21:00",
            "frequency_minutes": 60,
            "quiet_hours_enabled": True,
            "quiet_start": "22:00",
            "quiet_end": "07:00",
            "daily_reminder_limit": 8,
            "email_enabled": True,
            "push_enabled": False,
            "pause_until": None,
            "last_sent_at": None,
            "reminders_sent_today": 0
        }

        # Initialize email prefs
        self.data["email_prefs"][user_id] = {
            "user_id": user_id,
            "recipient_email": email_clean,
            "reminders_enabled": True,
            "daily_summary_enabled": True,
            "weekly_report_enabled": True,
            "milestone_alerts_enabled": True
        }

        # Issue access token
        token = f"aqtok_{uuid.uuid4().hex}"
        self.data["sessions"][token] = {
            "user_id": user_id,
            "created_at": now
        }
        self.save()
        return profile, token

    def authenticate_user(self, email: str, password: str) -> tuple[Optional[Dict[str, Any]], Optional[str]]:
        email_clean = email.strip().lower()
        pwd_hash = self._hash_password(password)

        matched_uid = None
        for uid, u in self.data.get("users", {}).items():
            if u["email"].lower() == email_clean and u["password_hash"] == pwd_hash:
                matched_uid = uid
                break

        # Fallback for demo user
        if not matched_uid and email_clean in ["champion@aqua3d.app", "demo@aqua3d.app"]:
            matched_uid = "user-demo-aqua3d"

        if not matched_uid:
            return None, None

        profile = self.get_profile(matched_uid)
        token = f"aqtok_{uuid.uuid4().hex}"
        if "sessions" not in self.data:
            self.data["sessions"] = {}
        self.data["sessions"][token] = {
            "user_id": matched_uid,
            "created_at": datetime.now().isoformat()
        }
        self.save()
        return profile, token

    def get_user_by_token(self, token: str) -> Optional[Dict[str, Any]]:
        clean_token = token.replace("Bearer ", "").strip()
        session = self.data.get("sessions", {}).get(clean_token)
        if session:
            return self.get_profile(session["user_id"])
        # Support direct demo user tokens or raw user IDs
        if clean_token in self.data.get("profiles", {}):
            return self.data["profiles"][clean_token]
        return None

    # --- Profile ---
    def get_profile(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self.data["profiles"]:
            now = datetime.now().isoformat()
            self.data["profiles"][user_id] = {
                "id": user_id,
                "email": f"{user_id}@aqua3d.app",
                "display_name": "Hydration Pioneer",
                "timezone": "America/New_York",
                "unit_preference": "ml",
                "bottle_capacity": 1000,
                "waking_time": "07:00",
                "sleeping_time": "23:00",
                "theme_preference": "dark",
                "reduced_motion": False,
                "low_power_3d": False,
                "bottle_style": "futuristic_glass",
                "gamification_enabled": True,
                "current_streak": 0,
                "longest_streak": 0,
                "total_volume_logged_ml": 0,
                "created_at": now
            }
            self.data["goals"][user_id] = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "daily_target_ml": 2500,
                "activity_multiplier": 1.0,
                "effective_date": date.today().isoformat(),
                "created_at": now
            }
            self.data["reminders"][user_id] = {
                "user_id": user_id,
                "enabled": True,
                "start_time": "08:00",
                "end_time": "21:00",
                "frequency_minutes": 60,
                "quiet_hours_enabled": True,
                "quiet_start": "22:00",
                "quiet_end": "07:00",
                "daily_reminder_limit": 8,
                "email_enabled": True,
                "push_enabled": False,
                "pause_until": None,
                "last_sent_at": None,
                "reminders_sent_today": 0
            }
            self.data["email_prefs"][user_id] = {
                "user_id": user_id,
                "recipient_email": f"{user_id}@aqua3d.app",
                "reminders_enabled": True,
                "daily_summary_enabled": True,
                "weekly_report_enabled": True,
                "milestone_alerts_enabled": True
            }
            self.save()
        
        # update streaks and volume dynamically
        self.update_streaks_and_totals(user_id)
        return self.data["profiles"][user_id]

    def update_profile(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        profile = self.get_profile(user_id)
        for k, v in updates.items():
            if v is not None:
                profile[k] = v
        self.data["profiles"][user_id] = profile
        self.save()
        return profile

    # --- Goals ---
    def get_goal(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self.data["goals"]:
            self.get_profile(user_id) # initializes defaults
        return self.data["goals"][user_id]

    def set_goal(self, user_id: str, daily_target_ml: int, multiplier: float = 1.0) -> Dict[str, Any]:
        goal = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "daily_target_ml": daily_target_ml,
            "activity_multiplier": multiplier,
            "effective_date": date.today().isoformat(),
            "created_at": datetime.now().isoformat()
        }
        self.data["goals"][user_id] = goal
        self.save()
        return goal

    # --- Water Intake Logs ---
    def log_intake(self, user_id: str, amount_ml: int, container_type: str = "glass",
                   temperature: str = "cool", logged_at: Optional[str] = None) -> Dict[str, Any]:
        now_iso = datetime.now().isoformat()
        log_entry = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "amount_ml": amount_ml,
            "container_type": container_type,
            "temperature": temperature,
            "logged_at": logged_at or now_iso,
            "is_deleted": False,
            "created_at": now_iso
        }
        self.data["intake_logs"].append(log_entry)
        self.update_streaks_and_totals(user_id)
        self.check_and_unlock_achievements(user_id)
        self.save()
        return log_entry

    def update_intake(self, user_id: str, log_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for log in self.data["intake_logs"]:
            if log["id"] == log_id and log["user_id"] == user_id and not log.get("is_deleted", False):
                for k, v in updates.items():
                    if v is not None:
                        log[k] = v
                self.update_streaks_and_totals(user_id)
                self.check_and_unlock_achievements(user_id)
                self.save()
                return log
        return None

    def delete_intake(self, user_id: str, log_id: str) -> bool:
        for log in self.data["intake_logs"]:
            if log["id"] == log_id and log["user_id"] == user_id and not log.get("is_deleted", False):
                log["is_deleted"] = True
                self.update_streaks_and_totals(user_id)
                self.save()
                return True
        return False

    def undo_last_intake(self, user_id: str) -> Optional[Dict[str, Any]]:
        user_logs = [l for l in self.data["intake_logs"] if l["user_id"] == user_id and not l.get("is_deleted", False)]
        if not user_logs:
            return None
        last_log = user_logs[-1]
        last_log["is_deleted"] = True
        self.update_streaks_and_totals(user_id)
        self.save()
        return last_log

    def get_intake_logs(self, user_id: str, start_date: Optional[str] = None,
                        end_date: Optional[str] = None, include_deleted: bool = False) -> List[Dict[str, Any]]:
        results = []
        for log in self.data["intake_logs"]:
            if log["user_id"] != user_id:
                continue
            if not include_deleted and log.get("is_deleted", False):
                continue
            log_date = log["logged_at"][:10]
            if start_date and log_date < start_date:
                continue
            if end_date and log_date > end_date:
                continue
            results.append(log)
        return results

    def get_today_summary(self, user_id: str) -> Dict[str, Any]:
        today_str = date.today().isoformat()
        goal = self.get_goal(user_id)
        profile = self.get_profile(user_id)
        
        today_logs = [
            l for l in self.data["intake_logs"]
            if l["user_id"] == user_id and not l.get("is_deleted", False) and l["logged_at"][:10] == today_str
        ]
        
        total_consumed = sum(l["amount_ml"] for l in today_logs)
        target = goal.get("daily_target_ml", 2500)
        remaining = max(0, target - total_consumed)
        completion_pct = round(min(200.0, (total_consumed / target * 100)) if target > 0 else 0, 1)
        
        return {
            "date": today_str,
            "daily_target_ml": target,
            "total_consumed_ml": total_consumed,
            "remaining_ml": remaining,
            "completion_percentage": completion_pct,
            "is_goal_reached": total_consumed >= target,
            "drinks_count": len(today_logs),
            "current_streak": profile.get("current_streak", 0),
            "longest_streak": profile.get("longest_streak", 0),
            "bottle_capacity": profile.get("bottle_capacity", 1000),
            "bottle_style": profile.get("bottle_style", "futuristic_glass"),
            "unit_preference": profile.get("unit_preference", "ml"),
            "logs": sorted(today_logs, key=lambda x: x["logged_at"], reverse=True)
        }

    # --- Streaks and Totals ---
    def update_streaks_and_totals(self, user_id: str):
        profile = self.data["profiles"].get(user_id)
        if not profile:
            return
        
        goal = self.get_goal(user_id)
        target = goal.get("daily_target_ml", 2500)
        
        # All non-deleted logs
        user_logs = [l for l in self.data["intake_logs"] if l["user_id"] == user_id and not l.get("is_deleted", False)]
        total_volume = sum(l["amount_ml"] for l in user_logs)
        profile["total_volume_logged_ml"] = total_volume

        # Group by day
        day_totals: Dict[str, int] = {}
        for l in user_logs:
            d = l["logged_at"][:10]
            day_totals[d] = day_totals.get(d, 0) + l["amount_ml"]
        
        # Calculate streak ending today or yesterday
        today = date.today()
        current_streak = 0
        check_date = today
        
        # If user completed goal today, count today and go backwards
        if day_totals.get(today.isoformat(), 0) >= target:
            while day_totals.get(check_date.isoformat(), 0) >= target:
                current_streak += 1
                check_date -= timedelta(days=1)
        else:
            # Check if streak ended yesterday
            check_date = today - timedelta(days=1)
            while day_totals.get(check_date.isoformat(), 0) >= target:
                current_streak += 1
                check_date -= timedelta(days=1)
        
        longest = max(profile.get("longest_streak", 0), current_streak)
        profile["current_streak"] = current_streak
        profile["longest_streak"] = longest

    # --- Reminders & Notifications ---
    def get_reminder_settings(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self.data["reminders"]:
            self.get_profile(user_id)
        return self.data["reminders"][user_id]

    def update_reminder_settings(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        reminders = self.get_reminder_settings(user_id)
        for k, v in updates.items():
            if v is not None:
                reminders[k] = v
        self.data["reminders"][user_id] = reminders
        self.save()
        return reminders

    def get_email_prefs(self, user_id: str) -> Dict[str, Any]:
        if user_id not in self.data["email_prefs"]:
            self.get_profile(user_id)
        return self.data["email_prefs"][user_id]

    def update_email_prefs(self, user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        prefs = self.get_email_prefs(user_id)
        for k, v in updates.items():
            if v is not None:
                prefs[k] = v
        self.data["email_prefs"][user_id] = prefs
        self.save()
        return prefs

    def add_push_subscription(self, user_id: str, endpoint: str, keys: Dict[str, str], device_info: str = "Browser") -> bool:
        # Check duplicate
        for sub in self.data["push_subs"]:
            if sub["endpoint"] == endpoint:
                sub["user_id"] = user_id
                sub["keys"] = keys
                sub["updated_at"] = datetime.now().isoformat()
                self.save()
                return True
        self.data["push_subs"].append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "endpoint": endpoint,
            "keys": keys,
            "device_info": device_info,
            "created_at": datetime.now().isoformat()
        })
        self.save()
        return True

    def get_push_subscriptions(self, user_id: str) -> List[Dict[str, Any]]:
        return [s for s in self.data["push_subs"] if s["user_id"] == user_id]

    def log_delivery(self, user_id: str, channel: str, notification_type: str, status: str, details: Optional[str] = None):
        self.data["delivery_logs"].append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "channel": channel,
            "notification_type": notification_type,
            "status": status,
            "details": details,
            "created_at": datetime.now().isoformat()
        })
        self.save()

    def get_delivery_logs(self, user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        user_logs = [l for l in self.data["delivery_logs"] if l["user_id"] == user_id]
        return sorted(user_logs, key=lambda x: x["created_at"], reverse=True)[:limit]

    # --- Achievements ---
    def get_user_achievements(self, user_id: str) -> List[Dict[str, Any]]:
        profile = self.get_profile(user_id)
        user_ach_map = {
            ua["achievement_id"]: ua
            for ua in self.data["user_achievements"]
            if ua["user_id"] == user_id
        }
        
        result = []
        for a in DEFAULT_ACHIEVEMENTS:
            ach_id = a["id"]
            unlocked = ach_id in user_ach_map
            unlocked_at = user_ach_map[ach_id]["unlocked_at"] if unlocked else None
            
            # Progress calculation
            prog = 0.0
            if unlocked:
                prog = 100.0
            elif ach_id == "streak_3":
                prog = min(100.0, (profile.get("current_streak", 0) / 3.0) * 100)
            elif ach_id == "streak_7":
                prog = min(100.0, (profile.get("current_streak", 0) / 7.0) * 100)
            elif ach_id == "streak_30":
                prog = min(100.0, (profile.get("current_streak", 0) / 30.0) * 100)
            elif ach_id == "volume_10k":
                prog = min(100.0, (profile.get("total_volume_logged_ml", 0) / 10000.0) * 100)
            elif ach_id == "volume_50k":
                prog = min(100.0, (profile.get("total_volume_logged_ml", 0) / 50000.0) * 100)
            
            result.append({
                "id": ach_id,
                "title": a["title"],
                "description": a["description"],
                "icon": a["icon"],
                "category": a["category"],
                "unlocked": unlocked,
                "unlocked_at": unlocked_at,
                "progress": round(prog, 1)
            })
        return result

    def check_and_unlock_achievements(self, user_id: str):
        profile = self.get_profile(user_id)
        user_logs = [l for l in self.data["intake_logs"] if l["user_id"] == user_id and not l.get("is_deleted", False)]
        unlocked_ids = {ua["achievement_id"] for ua in self.data["user_achievements"] if ua["user_id"] == user_id}
        
        to_unlock = []
        # First Sip
        if len(user_logs) >= 1 and "first_drop" not in unlocked_ids:
            to_unlock.append("first_drop")
        
        # Day Conqueror
        goal = self.get_goal(user_id)
        today_summary = self.get_today_summary(user_id)
        if today_summary["is_goal_reached"] and "day_conqueror" not in unlocked_ids:
            to_unlock.append("day_conqueror")
        
        # Streaks
        streak = profile.get("current_streak", 0)
        if streak >= 3 and "streak_3" not in unlocked_ids:
            to_unlock.append("streak_3")
        if streak >= 7 and "streak_7" not in unlocked_ids:
            to_unlock.append("streak_7")
        if streak >= 30 and "streak_30" not in unlocked_ids:
            to_unlock.append("streak_30")
        
        # Volume
        total_vol = profile.get("total_volume_logged_ml", 0)
        if total_vol >= 10000 and "volume_10k" not in unlocked_ids:
            to_unlock.append("volume_10k")
        if total_vol >= 50000 and "volume_50k" not in unlocked_ids:
            to_unlock.append("volume_50k")
        
        # Early bird
        for l in user_logs:
            try:
                hour = int(l["logged_at"][11:13])
                if hour < 8 and "early_bird" not in unlocked_ids:
                    to_unlock.append("early_bird")
                    break
            except:
                pass
        
        now = datetime.now().isoformat()
        for ach_id in to_unlock:
            self.data["user_achievements"].append({
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "achievement_id": ach_id,
                "unlocked_at": now
            })
        if to_unlock:
            self.save()

    # --- Social Challenges ---
    def get_challenges(self, user_id: str) -> List[Dict[str, Any]]:
        result = []
        for ch in self.data["challenges"]:
            members_raw = [m for m in self.data["challenge_members"] if m["challenge_id"] == ch["id"]]
            target_ml = ch.get("target_daily_ml") or ch.get("target_value", 2500)
            
            formatted_members = []
            for m in members_raw:
                tot_ml = m.get("total_ml") or m.get("current_progress_ml", 0)
                dur = ch.get("duration_days", 7)
                goal_total = target_ml * dur
                pct = round(min(100.0, (tot_ml / goal_total * 100)) if goal_total > 0 else 0, 1)
                formatted_members.append({
                    "user_id": m.get("user_id", ""),
                    "display_name": m.get("display_name", "Hydrator"),
                    "progress_percentage": m.get("progress_percentage", pct),
                    "streak": m.get("streak", 3),
                    "total_ml": tot_ml,
                    "joined_at": m.get("joined_at", datetime.now().isoformat())
                })

            is_joined = any(m["user_id"] == user_id for m in formatted_members)
            result.append({
                "id": ch["id"],
                "creator_id": ch["creator_id"],
                "title": ch["title"],
                "description": ch["description"],
                "target_daily_ml": target_ml,
                "duration_days": ch.get("duration_days", 7),
                "start_date": ch.get("start_date", date.today().isoformat()),
                "end_date": ch.get("end_date", (date.today() + timedelta(days=7)).isoformat()),
                "invite_code": ch.get("invite_code", "AQUA"),
                "status": ch.get("status", "active"),
                "is_joined": is_joined,
                "members_count": len(formatted_members),
                "members": sorted(formatted_members, key=lambda x: x["total_ml"], reverse=True)
            })
        return result

    def create_challenge(self, creator_id: str, title: str, description: str,
                         target_daily_ml: int, duration_days: int) -> Dict[str, Any]:
        ch_id = f"chal-{uuid.uuid4().hex[:8]}"
        invite_code = f"AQUA{uuid.uuid4().hex[:4].upper()}"
        start = date.today().isoformat()
        end = (date.today() + timedelta(days=duration_days)).isoformat()
        
        challenge = {
            "id": ch_id,
            "creator_id": creator_id,
            "title": title,
            "description": description,
            "target_daily_ml": target_daily_ml,
            "duration_days": duration_days,
            "start_date": start,
            "end_date": end,
            "invite_code": invite_code,
            "status": "active"
        }
        self.data["challenges"].append(challenge)
        
        # Automatically join creator
        profile = self.get_profile(creator_id)
        self.data["challenge_members"].append({
            "challenge_id": ch_id,
            "user_id": creator_id,
            "display_name": profile.get("display_name", "Creator"),
            "joined_at": datetime.now().isoformat(),
            "progress_percentage": 0.0,
            "streak": profile.get("current_streak", 0),
            "total_ml": 0
        })
        self.check_and_unlock_achievements(creator_id)
        self.save()
        return challenge

    def join_challenge(self, user_id: str, invite_code: str) -> Optional[Dict[str, Any]]:
        target_ch = None
        for ch in self.data["challenges"]:
            if ch["invite_code"].upper() == invite_code.strip().upper():
                target_ch = ch
                break
        if not target_ch:
            return None
        
        # Check if already joined
        for m in self.data["challenge_members"]:
            if m["challenge_id"] == target_ch["id"] and m["user_id"] == user_id:
                return target_ch
        
        profile = self.get_profile(user_id)
        self.data["challenge_members"].append({
            "challenge_id": target_ch["id"],
            "user_id": user_id,
            "display_name": profile.get("display_name", "Hydrator"),
            "joined_at": datetime.now().isoformat(),
            "progress_percentage": 0.0,
            "streak": profile.get("current_streak", 0),
            "total_ml": 0
        })
        self.check_and_unlock_achievements(user_id)
        self.save()
        return target_ch

store = LocalStore()
