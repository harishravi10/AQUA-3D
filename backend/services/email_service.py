import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from backend.config import settings
from backend.database import store

try:
    import resend
    if settings.RESEND_API_KEY:
        resend.api_key = settings.RESEND_API_KEY
except ImportError:
    resend = None

def get_branded_html(subject: str, heading: str, body_content: str, current_ml: int, target_ml: int, cta_url: str = "http://localhost:5173") -> str:
    percentage = min(100, int((current_ml / target_ml * 100))) if target_ml > 0 else 0
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070d18; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #070d18; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; background: linear-gradient(180deg, #0d1e38 0%, #091322 100%); border: 1px solid #1e3a5f; border-radius: 18px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; text-align: center; border-bottom: 1px solid #162c46;">
              <div style="display: inline-block; padding: 8px 18px; border-radius: 30px; background: rgba(6, 182, 212, 0.12); border: 1px solid #06b6d4; color: #38bdf8; font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">
                🌊 AQUA 3D
              </div>
              <h1 style="margin: 18px 0 6px 0; font-size: 26px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                {heading}
              </h1>
              <p style="margin: 0; font-size: 14px; color: #94a3b8;">
                Next-Generation Hydration Intelligence
              </p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 28px 36px;">
              <p style="font-size: 16px; line-height: 1.6; color: #cbd5e1; margin-top: 0;">
                {body_content}
              </p>
              
              <!-- Hydration Meter Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 24px 0; background: rgba(13, 30, 56, 0.7); border: 1px solid #1e3a5f; border-radius: 14px; padding: 20px;">
                <tr>
                  <td>
                    <table width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="font-size: 13px; font-weight: 600; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
                          Today's Hydration Progress
                        </td>
                        <td align="right" style="font-size: 14px; font-weight: 700; color: #ffffff;">
                          {current_ml} / {target_ml} ml ({percentage}%)
                        </td>
                      </tr>
                    </table>
                    <!-- Progress Bar Track -->
                    <div style="margin-top: 12px; background: #162b46; border-radius: 8px; height: 10px; width: 100%; overflow: hidden;">
                      <div style="background: linear-gradient(90deg, #06b6d4 0%, #38bdf8 100%); height: 10px; width: {percentage}%; border-radius: 8px;"></div>
                    </div>
                  </td>
                </tr>
              </table>
              
              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 32px 0 16px 0;">
                <a href="{cta_url}" style="display: inline-block; background: linear-gradient(135deg, #06b6d4 0%, #0284c7 100%); color: #ffffff; text-decoration: none; padding: 14px 34px; border-radius: 12px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 18px rgba(6, 182, 212, 0.4);">
                  Open AQUA 3D Dashboard →
                </a>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #060e1a; border-top: 1px solid #162c46; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b;">
                Sent with care by your AQUA 3D Hydration Companion.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                To update your alert frequency or quiet hours, visit <a href="{cta_url}#settings" style="color: #06b6d4; text-decoration: underline;">Reminder Settings</a>.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

async def send_notification_email(
    user_id: str,
    recipient_email: str,
    email_type: str = "reminder",
    custom_subject: Optional[str] = None,
    custom_message: Optional[str] = None
) -> Dict[str, Any]:
    # Retrieve today's progress
    today_summary = store.get_today_summary(user_id)
    profile = store.get_profile(user_id)
    current_ml = today_summary["total_consumed_ml"]
    target_ml = today_summary["daily_target_ml"]
    name = profile.get("display_name", "Friend")

    subjects = {
        "reminder": f"💧 Quick hydration check-in, {name}!",
        "daily_summary": f"📊 Your AQUA 3D Hydration Summary for Today",
        "goal_reached": f"🎉 Goal Achieved! You conquered your hydration target!",
        "weekly_report": f"🌊 Your 7-Day Hydration Mastery Report"
    }
    
    headings = {
        "reminder": "Time for a Pure Refreshment",
        "daily_summary": "Daily Hydration Breakdown",
        "goal_reached": "Milestone Unlocked: 100% Target!",
        "weekly_report": "Weekly Habit Overview"
    }
    
    messages = {
        "reminder": f"Hello {name}, your body thrives on steady hydration. Take a mindful pause and enjoy a fresh glass of water to keep your mental clarity and stamina at peak performance.",
        "daily_summary": f"Great effort today, {name}! You have logged {current_ml} ml towards your {target_ml} ml target. Review your fluid curve in your 3D bottle dashboard.",
        "goal_reached": f"Outstanding achievement, {name}! You have officially reached your target of {target_ml} ml today. Celebrate this win for your physical and cognitive wellness!",
        "weekly_report": f"Here is your weekly progress snapshot, {name}. Your current streak stands at {profile.get('current_streak', 0)} days. Keep the momentum surging forward."
    }

    subject = custom_subject or subjects.get(email_type, "AQUA 3D Hydration Notification")
    heading = headings.get(email_type, "Hydration Companion Update")
    body_text = custom_message or messages.get(email_type, "Keep up your great hydration habits!")
    html_content = get_branded_html(subject, heading, body_text, current_ml, target_ml)

    # If Resend API key is configured and valid, deliver live
    if settings.RESEND_API_KEY and resend:
        try:
            params: resend.Emails.SendParams = {
                "from": settings.EMAIL_FROM,
                "to": [recipient_email],
                "subject": subject,
                "html": html_content,
                "text": f"{subject}\n\n{body_text}\n\nCurrent: {current_ml} ml / {target_ml} ml.\nOpen AQUA 3D: http://localhost:5173"
            }
            res = resend.Emails.send(params)
            msg_id = getattr(res, "id", str(res)) if res else str(uuid.uuid4())
            store.log_delivery(user_id, channel="email", notification_type=email_type, status="delivered", details=f"Resend id: {msg_id} to {recipient_email}")
            return {"status": "delivered", "provider": "resend", "id": msg_id, "recipient": recipient_email, "subject": subject}
        except Exception as e:
            err_msg = str(e)
            print(f"[EmailService] Resend delivery error: {err_msg}")
            store.log_delivery(user_id, channel="email", notification_type=email_type, status="failed", details=f"Error: {err_msg}")
            # Graceful simulation fallback with clear info
            return {
                "status": "simulated",
                "provider": "resend_fallback",
                "recipient": recipient_email,
                "subject": subject,
                "error": err_msg,
                "note": "Resend API key provided had error (e.g. unverified domain or test key restriction). Message captured cleanly in local delivery logs."
            }

    # Simulation mode (No API key needed for full local development and testing)
    store.log_delivery(
        user_id,
        channel="email",
        notification_type=email_type,
        status="simulated",
        details=f"Test simulated delivery to {recipient_email}. Subject: '{subject}'"
    )
    return {
        "status": "simulated",
        "provider": "local_mock",
        "recipient": recipient_email,
        "subject": subject,
        "preview_heading": heading,
        "note": "Email logged cleanly to local delivery audit log. Add RESEND_API_KEY in .env to send live emails to your inbox."
    }
