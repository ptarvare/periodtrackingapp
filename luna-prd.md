# Luna — Product Requirements Document

**Version:** 2.1  
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
| Hosting | Vercel (luna-app-beta.vercel.app) |

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
Daily: Log mood/symptoms → PO-style warm response
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
| 👤 Profile | `/profile` | View profile + Edit |

---

## 7. Features

### 7.1 Phase Prediction Engine ✅
- Calculates current phase from last period date + cycle length
- 4 phases: Menstrual, Follicular, Ovulatory, Luteal
- Confidence score based on data points
- PCOS/PCOD flag adjusts confidence

### 7.2 Period Confirmation — Never Assume ✅
**The problem:** When the predicted period date arrives, the app was assuming the period started and showing "Menstrual phase." This is wrong — the period may be late.

**The fix:**
- Phase always stays **Luteal** until the user confirms their period started
- A slim, warm nudge banner appears **only when period is predicted for today or 1 day late**
- Nudge says: *"Your period is predicted to start today — has it?"* with a small "Log it" button and × to dismiss
- Tapping "Log it" opens the log modal with the period toggle pre-checked
- For **2+ days late**: no nudge shown — just Luteal quietly with a neutral message on the prediction card. User logs when ready
- Dismissing hides the nudge for that session — shows again next app open

**States:**
| Situation | What to show |
|---|---|
| Period predicted today (daysLate = 0) | Slim nudge: "Your period is predicted to start today — has it?" |
| 1 day late (daysLate = 1) | Slim nudge: "Your period may have started — have you logged it?" |
| 2+ days late | No nudge. Show Luteal + neutral prediction card message |
| Period confirmed (logged) | Menstrual phase, Day X |

### 7.3 Daily Insights — Rotating Pool ✅
- **80 unique insights total — 20 per phase**
- Rotate by day-of-cycle so the insight changes every day
- Repeats only after ~30 days — user won't remember, creates daily open habit
- Science-backed, specific, actionable — covers food, exercise, hormones, sleep, productivity, emotional health
- **Goal:** New insight every day = a reason to open the app

### 7.4 Food Recommendations — Breakfast / Lunch / Dinner ✅
- Structured as three meal cards: Breakfast, Lunch, Dinner
- Format: nutritional goal + example foods in brackets
- Example: "Iron + complex carbs (oats with raisins and flaxseeds, squeeze of lemon)"
- Phase-based only — same meals for all days within a phase
- Goal/condition-specific notes shown below the meal cards
- Avoid section shown at the bottom of the food tab

### 7.5 Daily Log — Mood + Symptoms + Energy ✅ (upgrade planned)
**Current state:** Modal with energy level, mood chips (generic), symptoms, period toggle. Saves to `users/{uid}/logs/{date}`.

**Planned upgrade:**
- Phase-specific mood chips (options tailored to what that phase actually feels like):
  - Menstrual: Crampy, Fatigued, Emotional, Low energy, Calm
  - Follicular: Motivated, Clear-headed, Restless, Happy, Tired
  - Ovulatory: Confident, Social, Energetic, Focused, Overwhelmed
  - Luteal: Irritable, Anxious, Bloated, Foggy, Weepy
- Optional free-text note below the chips
- After saving: warm 1–2 line PO-style response (static, handcrafted — not AI-generated per save)

### 7.6 Report Tab 🔲 (building next)
**A building personal profile — not a popup.**

- Dedicated tab in bottom nav
- Shows "Your [phase] report is ready" when phase changes
- **Daily view:** Running log — mood, energy, symptoms per day
- **Phase-end report card:** Generated when phase changes
  - Days logged, most common mood, energy patterns
  - Tone: empowering and productivity-focused
  - Example: *"Your Follicular phase — you felt energised 5 of 7 days. This is your high-performance window. Schedule your big decisions here next cycle."*
  - Example: *"Your Menstrual phase showed fatigue on days 1–3. Plan lighter tasks those days next cycle."*
- Over time becomes the user's **personal performance map**

### 7.7 Landing Page ✅
- Hero: *"Your body has a rhythm. Plan your life around it."*
- Sub-copy: *"Luna helps you understand your cycle so you can stay on top of your game — every single day."*
- Badge: *"Built for your rhythm"*
- Feature cards: Know your phase / Eat for your cycle / Discover your patterns
- Chat feature card removed (deferred)

### 7.8 Profile Page ✅
- Default view: avatar card (photo + name + email), Your Details section, Period History section
- **Edit button** lives in the section headers ("Your Details" and "Period History") — not in the avatar card
- Edit mode: inline form for all fields, Cancel + Save buttons
- Period dates: add/remove from full list in edit mode

### 7.9 PWA Support ✅
Installable on iPhone and Android.

### 7.10 PostHog Analytics ✅
Tracks: sign-ins, onboarding completion, dashboard views, tab clicks.

### 7.11 Expert Card ✅
- **Priya Tarvare** — Certified Personal Trainer & Integrative Nutrition Practitioner
- Instagram: [@fit_coach__priya](https://www.instagram.com/fit_coach__priya) (double underscore)
- Phase-specific tips from Priya rotate daily in the recommendations

---

## 8. Build Order

| # | Feature | Status |
|---|---|---|
| 0 | Commit existing work (log check-in, cycle history, rotating tips) | ✅ Done |
| 0.5 | Period confirmation — slim nudge, Luteal until confirmed | ✅ Done |
| 1 | Landing page — mission-driven copy | ✅ Done |
| 2 | Food recs: Breakfast / Lunch / Dinner | ✅ Done |
| 3 | 80 unique insights (20 per phase), daily rotation | ✅ Done |
| 3.5 | Profile redesign: view mode + Edit in section headers | ✅ Done |
| 4 | Log tab: phase-specific mood chips + PO warm response | 🔲 Next |
| 5 | Report tab: daily history + phase-end report cards | 🔲 |
| 6 | Nav restructure: 4 tabs (Home, Log, Report, Profile) | 🔲 |

---

## 9. Out of Scope (for now)

- PO companion app (separate product — PRD in `po-prd.md`)
- Push notifications
- AI-generated insights per save (using static curated pool instead)
- Music / media playback
- Paid tier

---

## 10. Key Decisions Made

| Decision | Why |
|---|---|
| Period = confirmation, not assumption | App never assumes period started; always shows Luteal until logged |
| Nudge only for daysLate 0–1 | Showing "X days late" for 2+ days feels alarming — just show Luteal quietly |
| No Yes/No binary on the nudge | Forced choice feels clinical; a soft "Log it" tap is more personal |
| Phase-specific mood chips | Options match what each phase actually feels like — not a generic list |
| PO warm responses: static, not AI | Lower cost, still warm; avoids API call on every log save |
| Report tab, not a popup | Phase-end report lives in a dedicated tab — user goes there when ready |
| Insights repeat after ~30 days | Pool of 20 per phase; user won't remember, creates daily open habit |
| Food by meal (not flat list) | Breakfast / Lunch / Dinner with examples — practical, not abstract |
| Edit in section headers, not avatar | Cleaner profile view; Edit is contextual to what you're editing |
| PRD updated before every build | Alignment in PRD first, then code — no surprises |
| GitHub committed after every feature | Nothing left hanging |
