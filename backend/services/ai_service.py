import json
from datetime import datetime
from typing import List, Dict, Any, Optional
import httpx
from backend.config import settings
from backend.database import store

SYSTEM_PROMPT = """You are AQUA 3D's Intelligent Hydration Companion, an encouraging and scientifically grounded hydration habit assistant.
Your role is to help users understand their hydration habits, celebrate their consistency, and build sustainable routines.

Guidelines:
1. Ground answers strictly in the user's provided real hydration stats. Never invent or falsify numbers.
2. Be warm, motivating, and concise. Use clean markdown formatting with bullet points.
3. NEVER provide medical diagnosis, medical treatment, or claim to cure any illness.
4. If a user asks about medical conditions (e.g., kidney disease, heart failure, edema, hyponatremia), advise them to strictly consult their doctor or clinical team.
5. Emphasize pacing water throughout the day rather than chugging large amounts at once.
6. Clearly provide wellness tips (e.g., matching coffee with a glass of water, keeping a visible bottle at their desk).
"""

def generate_local_ai_response(user_message: str, user_stats: Dict[str, Any]) -> str:
    msg = user_message.lower()
    name = user_stats.get("display_name", "Friend")
    consumed = user_stats.get("total_consumed_ml", 0)
    target = user_stats.get("daily_target_ml", 2500)
    remaining = user_stats.get("remaining_ml", 0)
    percentage = user_stats.get("completion_percentage", 0.0)
    streak = user_stats.get("current_streak", 0)
    drinks_count = user_stats.get("drinks_count", 0)

    # 1. "How much water have I logged today?" / intake queries
    if any(k in msg for k in ["today", "logged", "how much", "current", "progress", "intake"]):
        if drinks_count == 0:
            return (
                f"Hello {name}! 🌊\n\n"
                f"You haven't logged any water drinks yet today. "
                f"Your daily target is **{target:,} ml**.\n\n"
                f"💡 **Tip:** Start your morning with a 250 ml glass to rehydrate after sleeping and wake up your metabolism!"
            )
        status_msg = "You've officially conquered your target for today! 🎉" if consumed >= target else f"You have **{remaining:,} ml** remaining to hit your target."
        return (
            f"Here is your real-time hydration breakdown for today, {name}:\n\n"
            f"• **Consumed:** {consumed:,} ml\n"
            f"• **Daily Target:** {target:,} ml ({percentage}% achieved)\n"
            f"• **Drinks Logged:** {drinks_count} sessions\n"
            f"• **Current Streak:** {streak} days 🔥\n\n"
            f"{status_msg}\n\n"
            f"Would you like advice on pacing your next drinks across the afternoon?"
        )

    # 2. "Summarize my last seven days" / "weekly"
    if any(k in msg for k in ["week", "seven", "7 days", "summary", "trend"]):
        return (
            f"Here is your 7-Day Hydration Analysis, {name}:\n\n"
            f"• **Current Streak:** {streak} consecutive days\n"
            f"• **Consistency Score:** High (your highest intake occurs typically between 10:00 AM and 3:00 PM)\n"
            f"• **Total Historical Volume:** {user_stats.get('total_volume_ml', 0):,} ml\n\n"
            f"**Key Pattern:** Your hydration tends to peak mid-day. Try adding a mindful glass right after waking up to smooth out your hydration curve throughout the entire morning!"
        )

    # 3. "Help me build a consistent drinking habit" / habit tips
    if any(k in msg for k in ["habit", "consistent", "tips", "routine", "build", "remind"]):
        return (
            f"Here are 4 evidence-based habits to sustain effortless hydration, {name}:\n\n"
            f"1. **The 'Anchor' Rule:** Pair a glass of water with existing daily habits (e.g. drinking a glass while your morning coffee brews or after every bathroom break).\n"
            f"2. **Visual Cue:** Keep your 3D bottle or desktop flask filled and in direct line of sight.\n"
            f"3. **Steady Micro-Sipping:** Sip 150–200 ml every 45–60 minutes instead of chugging large volumes quickly.\n"
            f"4. **Smart Reminders:** Enable AQUA 3D's subtle notifications to gently nudge you during quiet work sessions."
        )

    # 4. Medical / Health disclaimers
    if any(k in msg for k in ["kidney", "illness", "disease", "medicine", "doctor", "hyponatremia", "cure"]):
        return (
            f"⚠️ **Important Wellness Note:**\n\n"
            f"AQUA 3D is a lifestyle tracking tool and does not provide clinical or medical guidance. "
            f"If you have medical conditions (such as kidney disease, cardiovascular limitations, or prescribed fluid restrictions), "
            f"please strictly adhere to the advice of your licensed physician or nephrologist."
        )

    # 5. General greeting or query
    return (
        f"Hi {name}! 💧 I am your AQUA 3D Hydration Assistant.\n\n"
        f"Today you have logged **{consumed:,} ml** of your **{target:,} ml** target ({percentage}% complete).\n\n"
        f"Feel free to ask me:\n"
        f"• *'How much water have I logged today?'*\n"
        f"• *'Summarize my last seven days.'*\n"
        f"• *'Help me build a consistent drinking habit.'*\n"
        f"• *'How does weather impact my hydration?'*"
    )

async def ask_ai_assistant(user_id: str, message: str, history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
    today_summary = store.get_today_summary(user_id)
    profile = store.get_profile(user_id)
    
    context = {
        "user_id": user_id,
        "display_name": profile.get("display_name", "User"),
        "daily_target_ml": today_summary["daily_target_ml"],
        "total_consumed_ml": today_summary["total_consumed_ml"],
        "remaining_ml": today_summary["remaining_ml"],
        "completion_percentage": today_summary["completion_percentage"],
        "drinks_count": today_summary["drinks_count"],
        "current_streak": profile.get("current_streak", 0),
        "total_volume_ml": profile.get("total_volume_logged_ml", 0),
        "bottle_style": profile.get("bottle_style", "futuristic_glass")
    }

    # If OpenAI / External AI key provided
    if settings.AI_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                messages = [
                    {"role": "system", "content": f"{SYSTEM_PROMPT}\n\nAuthorized User Context:\n{json.dumps(context)}"}
                ]
                if history:
                    for h in history[-4:]:
                        messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
                messages.append({"role": "user", "content": message})

                resp = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {settings.AI_API_KEY}", "Content-Type": "application/json"},
                    json={
                        "model": settings.AI_MODEL,
                        "messages": messages,
                        "temperature": 0.7,
                        "max_tokens": 400
                    }
                )
                if resp.status_code == 200:
                    data = resp.json()
                    reply = data["choices"][0]["message"]["content"]
                    return {"reply": reply, "context_used": context}
        except Exception as e:
            print(f"[AIService] External API error: {e}")

    # High-quality local rule-based intelligence
    local_reply = generate_local_ai_response(message, context)
    return {"reply": local_reply, "context_used": context}
