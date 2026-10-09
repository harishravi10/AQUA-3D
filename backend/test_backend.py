import unittest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

class TestAqua3DBackend(unittest.TestCase):
    def test_health(self):
        resp = client.get("/api/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "healthy")

    def test_profile(self):
        resp = client.get("/api/profile")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("display_name", data)
        self.assertIn("current_streak", data)

    def test_today_intake(self):
        resp = client.get("/api/intake/today")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("total_consumed_ml", data)
        self.assertIn("daily_target_ml", data)
        self.assertIn("completion_percentage", data)

    def test_log_and_undo(self):
        # 1. Log 250ml
        resp = client.post("/api/intake/log", json={
            "amount_ml": 250,
            "container_type": "glass",
            "temperature": "cool"
        })
        self.assertEqual(resp.status_code, 200)
        log_id = resp.json()["id"]

        # 2. Verify in today's intake
        resp_today = client.get("/api/intake/today")
        logs = resp_today.json()["logs"]
        self.assertTrue(any(l["id"] == log_id for l in logs))

        # 3. Undo
        undo_resp = client.post("/api/intake/undo")
        self.assertEqual(undo_resp.status_code, 200)
        self.assertEqual(undo_resp.json()["undone_log"]["id"], log_id)

    def test_weather(self):
        resp = client.get("/api/weather?city=London")
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("temperature_c", data)
        self.assertIn("hydration_advice", data)

    def test_ai_chat(self):
        resp = client.post("/api/ai/chat", json={
            "message": "How much water have I logged today?"
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("reply", data)
        self.assertIn("context_used", data)

    def test_achievements(self):
        resp = client.get("/api/achievements")
        self.assertEqual(resp.status_code, 200)
        achievements = resp.json()
        self.assertGreater(len(achievements), 0)
        self.assertTrue(any(a["id"] == "first_drop" for a in achievements))

    def test_challenges(self):
        resp = client.get("/api/challenges")
        self.assertEqual(resp.status_code, 200)
        self.assertIsInstance(resp.json(), list)

    def test_csv_export(self):
        resp = client.get("/api/analytics/export/csv")
        self.assertEqual(resp.status_code, 200)
        self.assertIn("text/csv", resp.headers["content-type"])

    def test_registration_and_multi_user_isolation(self):
        import uuid
        uid1 = uuid.uuid4().hex[:6]
        uid2 = uuid.uuid4().hex[:6]
        email_a = f"alice_{uid1}@aqua3d.app"
        email_b = f"bob_{uid2}@aqua3d.app"

        # 1. Register User A
        reg_a = client.post("/api/auth/register", json={
            "email": email_a,
            "password": "SecretPassword123!",
            "display_name": "Alice Flow",
            "daily_target_ml": 2800
        })
        self.assertEqual(reg_a.status_code, 200)
        token_a = reg_a.json()["access_token"]
        headers_a = {"Authorization": f"Bearer {token_a}"}

        # User A logs 600ml
        log_a = client.post("/api/intake/log", headers=headers_a, json={
            "amount_ml": 600,
            "container_type": "bottle",
            "temperature": "cool"
        })
        self.assertEqual(log_a.status_code, 200)

        # 2. Register User B
        reg_b = client.post("/api/auth/register", json={
            "email": email_b,
            "password": "SecretPassword456!",
            "display_name": "Bob Quench",
            "daily_target_ml": 2200
        })
        self.assertEqual(reg_b.status_code, 200)
        token_b = reg_b.json()["access_token"]
        headers_b = {"Authorization": f"Bearer {token_b}"}

        # 3. Verify User B has 0ml intake (Strict Privacy & Isolation)
        today_b = client.get("/api/intake/today", headers=headers_b)
        self.assertEqual(today_b.status_code, 200)
        self.assertEqual(today_b.json()["total_consumed_ml"], 0)
        self.assertEqual(today_b.json()["daily_target_ml"], 2200)

        # 4. User A creates a Challenge
        chal_a = client.post("/api/challenges", headers=headers_a, json={
            "title": f"Sprint by Alice {uid1}",
            "description": "7-day team hydration challenge",
            "target_daily_ml": 2500,
            "duration_days": 7
        })
        self.assertEqual(chal_a.status_code, 200)
        invite_code = chal_a.json()["invite_code"]

        # 5. User B joins User A's challenge via invite code
        join_b = client.post("/api/challenges/join", headers=headers_b, json={
            "invite_code": invite_code
        })
        self.assertEqual(join_b.status_code, 200)

        # 6. Verify challenge leaderboard shows both members
        challenges_list = client.get("/api/challenges", headers=headers_b).json()
        target_chal = next(c for c in challenges_list if c["invite_code"] == invite_code)
        member_names = [m["display_name"] for m in target_chal["members"]]
        self.assertIn("Alice Flow", member_names)
        self.assertIn("Bob Quench", member_names)

if __name__ == "__main__":
    unittest.main()
