# 🌊 AQUA 3D — Next-Generation Hydration Companion

A futuristic, full-stack 3D wellness application that transforms hydration tracking into an engaging, cinematic daily ritual. Built with **React 19**, **Three.js**, **FastAPI**, and **Supabase / LocalStore**.

---

## 🚀 Key Highlights & Architecture

* **Interactive 3D Water Bottle:** Realistic procedural 3D glass vessel rendered with Three.js WebGL, dynamic vertex liquid waves, rising micro-bubbles, 360° mouse/touch rotation, multiple vessel styles (*Futuristic Glass, Hydro Flask, Smart Tumbler, Crystal Decanter*), milestone celebration animations, and lightweight CSS/SVG fallback.
* **Intelligent Water Logging:** One-tap quick adds (100ml, 150ml, 250ml, 500ml, custom), vessel selector (*Glass, Bottle, Mug, Flask, Straw*), temperature preferences, instant undo, edit/delete controls, and duplicate prevention.
* **Smart Reminders & Scheduler:** Quiet hours, active waking hours, custom intervals, daily limits, and background schedule evaluation.
* **Branded Email Notifications:** HTML email templates with AQUA 3D branding, current progress bars, and direct dashboard links using Resend with local audit logs.
* **Browser & PWA Web Push:** Service worker, Web App Manifest, VAPID push support, offline shell caching, and offline intake queuing with auto-sync.
* **Weather-Aware Hydration Intelligence:** Live Open-Meteo API integration with temperature, humidity, and contextual climate hydration advice.
* **AI Hydration Assistant:** Context-aware companion grounded in the user's real intake logs, habits, and streaks, with dual support for external LLMs (OpenAI/Gemini) and an analytical local expert engine.
* **Analytics & Exports:** 7-day and 30-day intake trend curves, hourly pacing patterns, 30-day habit heatmap, CSV spreadsheet download, and printable PDF summary reports.
* **Gamification & Social Challenges:** "Droppy" animated droplet mascot, achievements catalog with progress bars, and social challenges with live leaderboards and invite codes.
* **Database & Security:** Complete Supabase PostgreSQL schema with Row Level Security (RLS) policies and atomic file-backed local persistence (`backend/local_store.json`) for seamless zero-config local testing.

---

## 📁 Project Structure

```
water/
├── backend/
│   ├── services/
│   │   ├── ai_service.py       # Context-aware AI assistant
│   │   ├── email_service.py    # Branded Resend email sender
│   │   ├── push_service.py     # Web Push notification dispatcher
│   │   └── weather_service.py  # Open-Meteo climate intelligence
│   ├── config.py               # Environment configuration
│   ├── database.py             # Atomic LocalStore & data access
│   ├── models.py               # Pydantic v2 validation models
│   ├── scheduler.py            # Background reminder evaluator
│   ├── main.py                 # FastAPI REST API router & lifespan
│   ├── test_backend.py         # Automated test suite (9 test suites)
│   ├── local_store.json        # Atomic persistence database
│   └── requirements.txt        # Python package dependencies
├── frontend/
│   ├── public/
│   │   ├── favicon.svg         # Neon glowing droplet icon
│   │   ├── manifest.webmanifest# PWA manifest
│   │   └── sw.js               # Service worker for offline & push
│   ├── src/
│   │   ├── components/
│   │   │   ├── AIAssistantModal.tsx      # Conversational assistant
│   │   │   ├── AnalyticsView.tsx         # Recharts trends & exports
│   │   │   ├── GamificationView.tsx      # Droppy mascot & badges
│   │   │   ├── Header.tsx                # Brand bar & streak pill
│   │   │   ├── IntakeHistoryDrawer.tsx   # Drink logs & undo
│   │   │   ├── OnboardingModal.tsx       # First-time user wizard
│   │   │   ├── QuickAddBar.tsx           # One-tap logging & vessels
│   │   │   ├── SettingsModal.tsx         # Goals, email & push alerts
│   │   │   ├── SocialChallengesView.tsx  # Challenge leaderboards
│   │   │   ├── ThreeBottle.tsx           # Three.js 3D water bottle
│   │   │   └── WeatherWidget.tsx         # Weather & hydration advice
│   │   ├── services/
│   │   │   └── api.ts                    # API client with offline queue
│   │   ├── types/
│   │   │   └── index.ts                  # TypeScript definitions
│   │   ├── App.tsx                       # Main application coordinator
│   │   ├── index.css                     # Cyber-Aqua design system
│   │   └── main.tsx                      # React root entry
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.app.json
├── supabase/
│   └── schema.sql              # Supabase PostgreSQL schema & RLS
├── netlify.toml                # Netlify frontend deployment
├── vercel.json                 # Vercel backend deployment
└── README.md
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
* **Python 3.10+** (tested on Python 3.14)
* **Node.js 18+** (tested on Node v24)
* **npm**

### 2. Backend Setup
1. Open a terminal and navigate to the project directory:
   ```powershell
   cd c:\Users\Harish\Desktop\water
   ```
2. Install Python dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```
3. Run the automated backend tests:
   ```powershell
   python -m unittest backend.test_backend
   ```
   *(Expected output: `Ran 9 tests ... OK`)*
4. Start the backend API server:
   ```powershell
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   * Interactive API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
   * API Health check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### 3. Frontend Setup
1. In a second terminal window, navigate to the frontend directory:
   ```powershell
   cd c:\Users\Harish\Desktop\water\frontend
   ```
2. Install dependencies (if not already installed):
   ```powershell
   npm install
   ```
3. Start the Vite development server:
   ```powershell
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://127.0.0.1:5173
   ```

---

## ⚙️ Service Integrations & Credentials

### 1. Supabase (PostgreSQL & RLS)
1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the entire contents of `supabase/schema.sql`.
4. Copy your project URL and keys to `.env`:
   ```env
   SUPABASE_URL=https://xyz.supabase.co
   SUPABASE_KEY=your-anon-public-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
*Note: If Supabase credentials are not provided, AQUA 3D automatically runs on the integrated atomic `backend/local_store.json` database.*

### 2. Email Notifications (Resend & Gmail)
1. Sign up at [resend.com](https://resend.com) and generate an API key.
2. In `.env`, configure:
   ```env
   RESEND_API_KEY=re_123456789_example
   EMAIL_FROM=AQUA 3D <onboarding@resend.dev>
   ```
3. In the AQUA 3D UI, open **Settings → Gmail / Email** and click **Send Test Email**.
*Note: Without an API key, the system runs in safe simulation mode and logs every notification event to the local audit history.*

### 3. Web Push Notifications
1. Generate VAPID keys:
   ```powershell
   npx web-push generate-vapid-keys
   ```
2. Paste the public and private keys into `.env`:
   ```env
   VAPID_PUBLIC_KEY=your-public-key
   VAPID_PRIVATE_KEY=your-private-key
   VAPID_CLAIM_EMAIL=admin@aqua3d.app
   ```
3. In the UI, click **Request Push Permission** in the settings modal.

### 4. Weather Intelligence (Open-Meteo)
* Operates free with zero API key configuration. Retrieves real-time temperature, humidity, and weather codes to calculate climate hydration recommendations.

### 5. AI Hydration Assistant
* Optional: Add `AI_API_KEY=sk-...` in `.env` to connect OpenAI/Gemini.
* Out-of-the-box: The application includes a rule-based expert engine that analyzes real user intake data, trends, streaks, and timestamps.

---

## ☁️ Deployment Guide

### Deploying Frontend to Netlify
1. Connect your repository to [Netlify](https://netlify.com).
2. Set Build Settings:
   * **Base directory:** `frontend`
   * **Build command:** `npm run build`
   * **Publish directory:** `frontend/dist`
3. Netlify automatically reads `netlify.toml` for client-side routing.

### Deploying Backend to Vercel
1. Install Vercel CLI or connect GitHub repository in the [Vercel Dashboard](https://vercel.com).
2. Set Environment Variables in Vercel settings matching `.env.example`.
3. Deploy with:
   ```powershell
   vercel --prod
   ```
   *Vercel reads `vercel.json` and runs the FastAPI backend on the serverless Python runtime.*

---

## ✅ Acceptance Criteria & Feature Checklist

* [x] **Phase 1 — Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, Three.js, Recharts, FastAPI, Pydantic.
* [x] **Phase 2 — Visual Design:** Cyber-Aqua palette, glassmorphism, glowing accents, dark/light modes.
* [x] **Phase 3 — 3D Water Bottle:** Three.js transparent bottle, liquid fill level scaling, vertex ripples, rising bubbles, 360° orbital rotation, milestone celebration, and CSS fallback.
* [x] **Phase 4 — Water Logging:** 100/150/250/500ml quick add, custom amount, vessel selector, temperature picker, full history, inline edit/delete, undo action.
* [x] **Phase 5 — Goals & Onboarding:** Setup wizard, configurable baseline target, bottle styles, waking hours.
* [x] **Phase 6 — Smart Reminders:** Schedule evaluator, quiet hours, intervals, daily limits.
* [x] **Phase 7 — Email Notifications:** Branded HTML email templates, Resend integration, test email trigger, delivery logs.
* [x] **Phase 8 — Browser Push:** Service worker, VAPID support, test alert dispatch.
* [x] **Phase 9 — PWA:** Web App Manifest, service worker caching, offline intake queue with reconnect sync.
* [x] **Phase 10 — AI Assistant:** Conversational chat modal, context-aware analysis, safety disclaimers.
* [x] **Phase 11 — Weather Widget:** Open-Meteo live climate fetching, temperature, hydration adjustment.
* [x] **Phase 12 — Analytics:** 7d/30d area charts, hourly distribution, habit heatmap, CSV & PDF export.
* [x] **Phase 13 — Gamification:** Droppy mascot, achievements catalog, progress bars, toggleable.
* [x] **Phase 14 — Social Challenges:** Challenge creation, invite codes, participant leaderboards.
* [x] **Phase 15 — Database:** Supabase schema with RLS policies, atomic file-backed local store.
* [x] **Phase 16 — UI Flow:** Dashboard, Analytics, Rewards, Challenges, Modals, Settings.
* [x] **Phase 17 — Testing:** 9 automated backend test suites passing 100%.
* [x] **Phase 18 — Deployment & Docs:** Complete README, `.env.example`, Netlify and Vercel configs.
