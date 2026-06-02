# Luna — Product Requirements Document

**Version:** 3.0  
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

Everything in Luna is **phase-based and personalized**. The whole experience should feel like their own app, not a generic wellness tool.

**Retention flywheel:** Daily logging → phase-end reports → personalized insights that change every day → users feel understood → they come back.

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
| Hosting | Vercel (luna-app-beta.vercel.app) |

**Firebase project:** luna-35b4b

---

## 5. User Flow

```
Landing page
   ↓
Google Sign-In
   ↓
Onboarding (2 steps: personal details → last period date + cycle length)
   ↓
Dashboard (phase card + daily insight + food recs + log check-in)
   ↓
Daily: Log mood/symptoms → warm response
   ↓
Phase ends: Phase-end report appears in Report tab
```

---

## 6. Navigation

| Tab | Route | Description |
|---|---|---|
| 🏠 Home | `/dashboard` | Phase overview, daily insight, food recs, expert card |
| 📋 Log | `/log` | Daily mood logging with phase-specific chips |
| 📊 Report | `/report` | Daily log history + phase-end report cards |
| 👤 Profile | `/profile` | View profile + Edit |

---

---

# Phase 1 — MVP (Shipped)

**Goal:** Get the core loop working and share with close friends. Phase-based food and exercise guidance, basic cycle prediction, mobile-ready.

## Features Shipped in Phase 1

### P1.1 — Phase Prediction Engine ✅
- Calculates current phase from last period date + cycle length
- 4 phases: Menstrual, Follicular, Ovulatory, Luteal
- Confidence score based on number of logged period dates
- PCOS/PCOD flag adjusts confidence

### P1.2 — Phase-Based Recommendations ✅
- Food, Exercise, Supplements, Lifestyle tabs per phase
- Expert tips from Priya Tarvare (Certified PT + Nutrition Practitioner)
- PCOS and goal modifiers (muscle gain, fat loss)

### P1.3 — Onboarding ✅
- Step 1: Name, age, height, weight, goals, conditions
- Step 2: Last period date, cycle length, period duration

### P1.4 — Google Sign-In + Auth ✅
- Google popup sign-in with Safari fallback
- Redirect authenticated users directly to dashboard
- Persistent session

### P1.5 — Mobile-First Design ✅
- Pink/purple gradient theme
- Bottom nav bar, phase card gradients, tabbed recs

### P1.6 — PWA Support ✅
- Installable on iPhone and Android from browser

### P1.7 — PostHog Analytics ✅
- Tracks: sign-ins, onboarding completion, dashboard views, tab clicks

### P1.8 — Edit Profile ✅
- Edit personal details, cycle length, period dates

---

---

# Phase 2 — Depth + Personalization (Current)

**Goal:** Make the app feel deeply personal. Every day should show something new. The food, insights, and period tracking should feel like Luna knows you.

## Features in Phase 2

### P2.1 — Period Confirmation — Never Assume ✅
- Phase stays **Luteal** until user logs their period
- Slim warm nudge shown **only for daysLate = 0 or 1**:
  - *"Your period is predicted to start today — has it?"*
  - *"Your period may have started — have you logged it?"*
- Tapping "Log it" opens log modal with period toggle pre-checked
- For **2+ days late**: no nudge — just Luteal quietly, neutral prediction card message
- Dismissing hides the nudge for that session

### P2.2 — Food Recs: Breakfast / Lunch / Dinner ✅
- Three meal cards per phase: Breakfast, Lunch, Dinner
- Format: nutritional goal + example foods in brackets
- Phase-based only (same meals for all days within a phase)
- Goal/condition-specific notes appear below meal cards
- Avoid section at bottom of food tab

### P2.3 — 80 Unique Rotating Insights ✅
- 20 science-backed insights per phase (80 total)
- Rotates by day-of-cycle — new insight every day
- Repeats only after ~30 days
- Covers: food, exercise, hormones, sleep, productivity, emotional health

### P2.4 — Daily Log Check-In ✅
- Dashboard button: "How are you feeling today?" / "Logged today ✅"
- Opens LogModal: energy, mood chips, symptoms, period toggle
- Saves to `users/{uid}/logs/{date}`
- When period logged: appends to `profile.periodDates` via arrayUnion

### P2.5 — Cycle History Card ✅
- Shows last 5 period start dates on dashboard
- Calculates and displays average cycle length from logged dates

### P2.6 — Landing Page Redesign ✅
- Hero: *"Your body has a rhythm. Plan your life around it."*
- Sub-copy focused on staying productive every day of the cycle
- Feature cards: Know your phase / Eat for your cycle / Discover your patterns
- Badge: *"Built for your rhythm"*

### P2.7 — Profile Page Redesign ✅
- Default view: avatar + name + email, Your Details rows, Period History list
- Edit button lives in section headers (not in the avatar card)
- Edit mode: inline form, Cancel + Save

### P2.8 — Expert Card Fix ✅
- Priya's Instagram corrected to [@fit_coach__priya](https://www.instagram.com/fit_coach__priya) (double underscore)

---

---

# Phase 3 — Daily Habit + Report Loop (Upcoming)

**Goal:** Close the retention loop. Give users a reason to open the app every day and feel rewarded for doing so. The log and report features make Luna feel like it's building a picture of *them* over time.

## Planned Features in Phase 3

### P3.1 — Log Tab: Phase-Specific Mood Chips ✅
- Dedicated `/log` page in bottom nav
- Mood chips change based on current phase:
  - Menstrual: Crampy, Fatigued, Emotional, Low energy, Calm, Bloated
  - Follicular: Motivated, Clear-headed, Happy, Restless, Tired, Energetic
  - Ovulatory: Confident, Social, Energetic, Focused, Overwhelmed, Creative
  - Luteal: Irritable, Anxious, Bloated, Foggy, Weepy, Calm
- Multi-select moods (not single select)
- Energy level, symptoms, optional free-text note, period toggle
- After saving: warm 1–2 line PO-style response (5 per phase, static, rotates by dayOfCycle)
- Shows "Logged today ✓" badge if already logged; becomes "Update Log" on re-save
- Saves to `users/{uid}/logs/{date}`

### P3.2 — Report Tab ✅
- Dedicated `/report` page in bottom nav
- **Phase report card:** Shows current phase, day X of phase, what this phase means for productivity, what's coming next — always visible once 3+ logs exist
- **Patterns summary:** Days logged, top mood, top energy level
- **Log history feed:** Last 30 entries — date, moods, energy, symptoms, note snippet
- Unlock message shown when < 3 logs: "Log 3 days to unlock your report"

### P3.3 — Nav Restructure: 4 Tabs ✅
- Bottom nav: 🏠 Home · 📋 Log · 📊 Report · 👤 Profile
- Desktop nav updated to match

---

---

## Key Decisions Log

| Decision | Why |
|---|---|
| Period = confirmation, not assumption | App never assumes period started; always shows Luteal until logged |
| Nudge only for daysLate 0–1 | "X days late" for 2+ days feels alarming — Luteal quietly is better |
| No Yes/No binary on the nudge | Forced choice feels clinical; soft "Log it" is more personal |
| Phase-specific mood chips | Options match what each phase actually feels like |
| PO warm responses: static, not AI | Lower cost per log save, still feels warm |
| Report tab, not a popup | Phase-end report lives in a dedicated tab — user goes when ready |
| Insights pool of 20 per phase | Repeats after ~30 days; user won't remember; creates daily habit |
| Food by meal (not flat list) | Breakfast / Lunch / Dinner is practical and actionable |
| Edit in section headers, not avatar | Cleaner profile view; Edit is contextual |
| PRD updated before every build | Alignment first, code second |
| GitHub committed after every feature | Nothing left hanging |
| Phase 1 / Phase 2 / Phase 3 structure | Shows progression clearly; each phase has a focused goal |
