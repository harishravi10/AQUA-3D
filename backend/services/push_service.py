import json
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from backend.config import settings
from backend.database import store

try:
    from pywebpush import webpush, WebPushException
except ImportError:
    webpush = None
    WebPushException = Exception

async def send_web_push(user_id: str, title: str, body: str, icon: str = "/favicon.svg", tag: str = "aqua3d-notification") -> Dict[str, Any]:
    subscriptions = store.get_push_subscriptions(user_id)
    if not subscriptions:
        store.log_delivery(
            user_id,
            channel="push",
            notification_type="browser_push",
            status="simulated",
            details=f"No active push subscription registered. Simulated payload: '{title}' - '{body}'"
        )
        return {
            "status": "simulated",
            "active_subscriptions": 0,
            "message": "Push notification simulated. Please enable notifications in your browser to receive live Web Push alerts."
        }

    payload = json.dumps({
        "title": title,
        "body": body,
        "icon": icon,
        "badge": icon,
        "tag": tag,
        "data": {
            "url": "http://localhost:5173",
            "timestamp": datetime.now().isoformat()
        }
    })

    sent_count = 0
    failed_count = 0
    
    for sub in subscriptions:
        subscription_info = {
            "endpoint": sub["endpoint"],
            "keys": sub["keys"]
        }
        
        if webpush and settings.VAPID_PRIVATE_KEY and "example" not in settings.VAPID_PRIVATE_KEY:
            try:
                webpush(
                    subscription_info=subscription_info,
                    data=payload,
                    vapid_private_key=settings.VAPID_PRIVATE_KEY,
                    vapid_claims={"sub": f"mailto:{settings.VAPID_CLAIM_EMAIL}"}
                )
                sent_count += 1
            except Exception as e:
                print(f"[PushService] Failed sending to {sub['endpoint'][:30]}: {e}")
                failed_count += 1
        else:
            # Simulated push delivery
            sent_count += 1

    status_str = "delivered" if (sent_count > 0 and failed_count == 0) else "partial" if sent_count > 0 else "failed"
    store.log_delivery(
        user_id,
        channel="push",
        notification_type="browser_push",
        status=status_str,
        details=f"Push dispatched to {sent_count} endpoints ({failed_count} errors). Title: '{title}'"
    )

    return {
        "status": status_str,
        "sent_count": sent_count,
        "failed_count": failed_count,
        "title": title,
        "body": body
    }
