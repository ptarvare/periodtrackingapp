# Luna — Product Requirements Document

**Version:** 2.0  
**Last Updated:** 2026-06-02  
**Author:** Pooja Tarvare  

---

## 1. Vision

Luna is a menstrual cycle wellness app that helps users understand their body's rhythm — so they can plan their life around it, not fight it.

The goal is not just tracking. It is making users feel **productive in every phase** — understanding which days they perform better, which days to rest, and making informed decisions about their tasks, food, and energy accordingly.

> *"Your body has a rhythm. Luna helps you understand it — so you can plan your life around it, not fight it."*

---

## 2. Target Users

**Primary:** Women who want to sync their lifestyle with their cycle — productivity, food, and fitness.  
**Secondary:** Women with PCOS/PCOD looking for phase-specific guidance.

---

## 3. Core Principle

Everything in Luna is **phase-based and personalized**. The app predicts which phase the user is in and delivers all recommendations — food, exercise, mood, insights — based on that phase. The whole experience should feel like their own app, not a generic wellness tool.

**Retention strategy:** Daily logging → phase-end reports → personalized insights that change every day → users feel understood and keep coming back.

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| Styling | Tailwind CSS 4 |
| Auth | Firebase Auth (Google Sign-In) |
| Database | Firebase Firestore |
| AI | Anthropic SDK (claude-sonnet-4-6) |
| Analytics | PostHog |
| Hosting | Vercel |

**Firebase project:** luna-35b4b

---

## 5. User Flow

```
Landing page
   ↓
Google Sign-In
   ↓
Onboarding (2 steps: age/height/weight/goals → last period date/cycle length)
   ↓
Dashboard (current phase + daily insight + food recs + log check-in)
   ↓
Daily: Log mood/symptoms → PO summary response
   ↓
Phase ends: Phase-end report appears in Report tab
```

---

## 6. Navigation

**Bottom nav (mobile) / Top nav (desktop):**

| Tab | Route | Description |
|---|---|---|
| 🏠 Home | `/dashboard` | Phase overview, daily insight, food recs, expert card |
| 📋 Log | `/log` (or modal) | Daily mood logging with phase-specific chips |
| 📊 Report | `/report` | Daily log history + phase-end report cards |
| 👤 Profile | `/profile` | Edit profile details |

---

## 7. Features

### 7.1 Phase Prediction Engine ✅ (built)
- Calculates current phase from last period date + cycle length
- 4 phases: Menstrual, Follicular, Ovulatory, Luteal
- Confidence score based on data points
- PCOS/PCOD flag adjusts confidence

### 7.2 Period Confirmation (not assumption) 🔲 (building next)
**The problem:** When the predicted period date arrives, the app was assuming the period started and showing "Menstrual phase." This is wrong — the period may be late.

**The fix:**
- When the predicted period date arrives or passes and the user has not logged it: show **"Period may start today"** / **"Your period is X days late"**
- Show a confirmation card with two actions: **"Yes, it started"** / **"Not yet"**
- "Yes, it started" → opens log modal with period toggle pre-checked, updates cycle
- "Not yet" → dismisses for the session, shows again next day
- Phase stays as **Luteal** (last confirmed phase) until user confirms

**States:**
| Situation | What to show |
|---|---|
| Period predicted today, not confirmed | "Period may start today" |
| 1 day late | "Your period is 1 day late" |
| 2+ days late | "Your period is X days late — this is normal" |
| Period confirmed (logged) | "Menstrual phase, Day X" |

### 7.3 Daily Insights — Rotating Pool ✅ (partially built, needs expansion)
- 20 unique insights per phase (80 total)
- Rotate by day-of-cycle so insight changes daily
- Repeats only after ~30 days (user won't remember)
- Science-backed, specific, actionable — not generic
- **Goal:** New insight every day = reason to open the app

### 7.4 Food Recommendations — Breakfast / Lunch / Dinner 🔲 (building soon)
- Restructure food recs by meal: Breakfast / Lunch / Dinner
- Format: main category (example foods in brackets)
- Example: "Complex carbs + iron-rich (oats, lentils, spinach)"
- Phase-based only, not day-based

### 7.5 Daily Log — Mood + Symptoms + Energy ✅ (built, needs upgrade)
**Current state:** Modal with energy level, mood chips, symptoms, period toggle.

**Upgrade planned:**
- Phase-specific mood chips (different options per phase based on what that phase actually feels like)
  - Menstrual: Crampy, Fatigued, Emotional, Low energy, Calm
  - Follicular: Motivated, Clear-headed, Restless, Happy, Tired
  - Ovulatory: Confident, Social, Energetic, Focused, Overwhelmed
  - Luteal: Irritable, Anxious, Bloated, Foggy, Weepy
- Optional free-text note below mood chips
- After saving: show a warm 1–2 line PO-style response (static, handcrafted, not AI-generated)
- Log is saved to Firestore: `users/{uid}/logs/{date}`

### 7.6 Report Tab 🔲 (building soon)
**A building profile — not a pop-up.**

- Dedicated tab in nav
- Notification-style entry point: "Your [phase] report is ready"
- **Daily view:** Running log of mood entries, symptoms, energy
- **Phase-end report card:** Appears when phase changes
  - Shows: days logged, most common mood, energy patterns, how they did vs. recommendations
  - Tone: empowering and productivity-focused
  - Example: *"Your Follicular phase — you felt energised 5 of 7 days. This is your high-performance window. Schedule your big decisions here next cycle."*
  - Example: *"Your Menstrual phase showed fatigue on days 1–3. Plan lighter tasks those days next cycle."*
- Over time becomes the user's **personal performance map**

### 7.7 Landing Page Tagline Update 🔲 (building soon)
Update landing page sub-copy to reflect the core vision — personal, warm, and productivity-oriented.

### 7.8 PWA Support ✅ (built)
Installable on iPhone and Android.

### 7.9 PostHog Analytics ✅ (built)
Tracks: sign-ins, onboarding completion, dashboard views, tab clicks.

### 7.10 Expert Card ✅ (built)
Priya Tarvare — Certified Personal Trainer & Integrative Nutrition Practitioner.  
Phase-specific tips from Priya included in recommendations.

---

## 8. Build Order (current sprint)

| # | Feature | Status |
|---|---|---|
| 0 | Commit existing work (log check-in, cycle history, rotating tips) | ✅ Done |
| 0.5 | Period confirmation fix — "may start today" not assumed Menstrual | 🔲 Next |
| 1 | Landing page tagline update | ✅ Done |
| 2 | Food recs: Breakfast / Lunch / Dinner restructure | ✅ Done |
| 3 | 80 unique insights (20 per phase), deeper and more specific | ✅ Done |
| 3.5 | Profile page redesign: view mode + single Edit button | ✅ Done |
| 4 | Log tab: phase-specific mood chips + PO warm response | 🔲 |
| 5 | Report tab: daily history + phase-end report cards | 🔲 |
| 6 | Nav restructure: 4 tabs (Home, Log, Report, Profile) | 🔲 |

---

## 9. Out of Scope (for now)

- PO companion app (separate product, separate repo — PRD exists in `po-prd.md`)
- Push notifications
- AI-generated insights (using static curated pool instead)
- Music / media playback
- Paid tier

---

## 10. Key Decisions Made

- **Phase-specific mood chips:** Options change based on the user's current phase — not a generic list
- **PO warm responses after logging:** Static handcrafted responses, not live Claude API calls (lower cost, still warm)
- **Report tab, not a popup:** Phase-end report lives in a dedicated tab; user navigates to it when ready
- **Insights repeat after ~30 days:** Pool of 20 per phase — user won't remember, creates daily open habit
- **Food by meal (not just list):** Breakfast / Lunch / Dinner with examples in brackets
- **Period = confirmation, not assumption:** App never assumes period started — always asks
- **PRD updated before every build:** Alignment happens in PRD first, then code
- **GitHub committed after every feature:** Nothing left hanging
