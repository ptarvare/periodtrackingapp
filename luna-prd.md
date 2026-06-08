# Luna — Product Requirements Document

**Version:** 3.1  
**Last Updated:** 2026-06-08  
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

### P3.2 — Report Tab ✅ (v1 built, v2 rebuilding)
**v1 (current):** Basic phase card, patterns summary (days logged / top mood / top energy), log history feed.

**v2 (building now):** Full report redesign based on competitive research. Luna's differentiator is being phase-based (not cycle-based) and productivity-framed.

**Sections:**

**1. Phase Report Card**
- Current phase + day X of phase
- Days logged this phase / total phase days
- Top mood + top energy logged
- Productivity framing — 3 operating modes for this phase:
  - 🔥 High output days: what to schedule
  - ⚡ Moderate days: what works well
  - 🌙 Rest days: what to avoid or reduce
- Share button → opens shareable Wrapped-style card

**2. Energy Heatmap** (unique to Luna — no other period app has this)
- GitHub-style contribution grid
- Rows = past cycles (up to last 6)
- Columns = day of cycle (1 → cycle length)
- Cell colour = energy logged:
  - Not logged → `gray-100`
  - Very Low → rose-200
  - Low → pink-300
  - Medium → pink-500
  - High → purple-600
- Phase boundary markers above columns (Menstrual / Follicular / Ovulatory / Luteal)
- Shows your personal peak days at a glance across multiple cycles

**3. Patterns Summary**
- Days logged, top mood, top energy — shown once 3+ logs exist

**4. Log History Feed**
- Last 30 entries — date, moods, energy, symptoms, note snippet

**5. Shareable Phase Wrapped Card** (Spotify Wrapped style)
- Full gradient card: phase colour
- Phase emoji + "Your [Phase] Phase — Wrapped"
- Key stats: days logged, top mood, top energy
- One insight line
- Luna 🌙 branding + URL
- Download as image button (html2canvas)
- Mobile: long-press to save natively

**Unlock flow:** Any logs → show history feed. 3+ logs → unlock patterns + phase card. 2+ period dates → unlock heatmap.

### P3.3 — Nav Restructure: 4 Tabs ✅
- Bottom nav: 🏠 Home · 📋 Log · 📊 Report · 👤 Profile
- Desktop nav updated to match

---

---

---

---

# Phase 4 — Goal-Based Personalization (Next)

**Goal:** Make every user feel like Luna was built for them specifically. The same app, the same structure — but what you see is entirely shaped by what you're trying to achieve.

---

## The 4 Goals

| Emoji | Goal Name | One-line description |
|---|---|---|
| 🌟 | Stay on top of my game | Plan your life, work, and energy around your cycle |
| 🌱 | Start a family | Track your fertile window and optimize for conception |
| 💪 | Train smarter | Know when to push, when to recover, and how to fuel your body |
| 🌿 | Know my body | Understand your cycle, manage symptoms, and feel more in control |

---

## Onboarding Improvements ✅ (Jun 8 2026)

### Step Order Redesign (Onboarding D)
- **New order:** Step 1 = Basic info → Step 2 = Goals → Step 3 = Cycle dates
- Goals come before dates: fun and personal (emotional buy-in before the friction-heavy step)
- Step 3 heading references the user's selected goal: *"To personalise your train smarter plan, we need to know where you are in your cycle."*

### Relative Date Picker (Onboarding A)
- Step 3 (cycle dates) now uses one-tap chip picker instead of a calendar input
- Chips: Today / Yesterday / 2 days ago / 3 days ago / 5 days ago / 1 week ago / 2 weeks ago / 3 weeks ago / 4 weeks ago / 5 weeks ago / 6 weeks ago / Pick a date →
- Slots 2 and 3 show a smart suggestion first: *"✓ About May 11 — does that sound right?"* (calculated from previous slot − avg cycle length) — typically 1 tap
- Fine-tune ‹ › buttons to adjust ±1 day after picking any chip
- Calendar fallback ("Pick a date →") still available

### One Date Unlocks Dashboard (Onboarding B)
- 1 date is enough to proceed — Next/Submit button enabled after slot 1 is filled
- Slots 2 and 3 are optional and labelled accordingly
- Data quality banner is always green and encouraging (never amber/warning):
  - 1 date: *"You're all set — add 2 more dates to improve accuracy."*
  - 2 dates: *"Almost there — one more date makes predictions even better."*
  - 3 dates: *"3 periods added — predictions will be accurate."*
- avgCycleLength auto-calculated and shown as a stat when 2+ dates entered; manual input hidden

### Goal Selection (onboarding step, now Step 2)
- User selects any number of goals (multi-select chip UI, all 4 allowed)
- If skipped: defaults to **"Know my body"**
- Saved to Firestore: `profile.goals: string[]`

---

## Goal Chips — Dashboard + Report

- Goals shown as small chips at the very top of Dashboard and Report pages
- Edit icon (pencil) next to chips → opens goal selector modal
- On edit: show popup warning — *"Changing your goals affects your report accuracy over time — be mindful of switching frequently"*
- User can update and save; new goals take effect immediately

---

## Today's Focus Card ✅ (Jun 8 2026)

A single-sentence card at the top of the dashboard (below greeting, above goal chips) that tells the user what to prioritise today.

- **Goal-aware:** content is selected based on the user's highest-priority goal (priority: start_a_family > train_smarter > stay_on_top > know_my_body)
- **Phase-aware:** 4 phases × 4 goals = 16 content buckets, each with 3 rotating messages
- **Rotates daily:** message selected by `(dayOfCycle - 1) % 3` — predictable and non-random
- **Name-personalised:** card opens with the user's first name in bold: *"Pooja, your energy is building..."*
- Content lives in `src/lib/todaysFocus.ts`

Examples:
- Follicular + stay_on_top: *"Estrogen is rising and with it, your verbal fluency. Schedule your most demanding work, pitch, or hard conversation this week."*
- Ovulatory + start_a_family: *"This is your most fertile window. Today and the next 2 days are your highest-probability opportunity."*
- Luteal + train_smarter: *"Endurance over intensity today. A longer, steadier run will feel better and be more productive than trying to lift heavy."*

---

## How Goals Filter Content

Everything is a filter — no new pages or new structure. Same tabs, same layout. What changes is the content inside each section.

| Section | Stay on top | Start a family | Train smarter | Know my body |
|---|---|---|---|---|
| Fertile window card on dashboard | ✗ | ✓ | ✗ | ✗ |
| Performance / energy framing | ✓ | ✗ | ✓ | ✗ |
| Training recs (exercise tab) | ✗ | ✗ | ✓ | ✗ |
| Symptom patterns in report | ✗ | ✗ | ✗ | ✓ |
| Fertility-focused food recs | ✗ | ✓ | ✗ | ✗ |
| Energy heatmap in report | ✓ | ✗ | ✓ | ✓ |
| Ovulation day highlighted | ✗ | ✓ | ✗ | ✗ |

---

## How Each Goal Changes the Content Tone

The core offering is always **food + exercise**. Goals change how that content is framed and what it emphasizes — not the structure of the app.

| Goal | Food recs | Exercise recs | Insights |
|---|---|---|---|
| 🌱 Start a family | Fertility nutrition — folate, iron, healthy fats, foods that support conception | What supports conception vs what to ease off; gentle movement during ovulation | Ovulation timing, hormonal support, fertile window science |
| 💪 Train smarter | Fueling and recovery by phase — protein timing, carb needs | When to lift heavy, when to deload, phase-based periodization | Strength peaks, recovery windows, performance patterns |
| 🌟 Stay on top of my game | Energy and focus foods — complex carbs, brain foods, avoiding crashes | When your brain peaks, when to schedule hard tasks vs creative work | Cognitive windows, energy patterns, best days for deep work |
| 🌿 Know my body | General wellness baseline — balanced, practical, no extremes | Moderate, phase-appropriate movement | Cycle education, pattern recognition, symptom science |

---

## Log Tab — No Change

The Log tab is **identical for all users regardless of goal.** No goal-specific log fields (no cervical mucus, no workout intensity). Users don't need that complexity. Personalization lives entirely in what Luna shows them — not what they're asked to track.

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
| Goals = content filter, not new pages | Same structure for everyone; goals change what content appears, not where |
| Log tab same for all goals | Cervical mucus / workout intensity fields removed — users don't know the terminology; personalization lives in content shown, not data collected |
| Goals shown as chips on Dashboard + Report | Goals determine what the page shows — chips make that visible and editable in context |
| Warning on goal edit | Changing goals too often degrades report accuracy — users should be mindful |
| Goals before dates in onboarding | Emotional buy-in (fun, personal) before friction (hard step); selected goal also contextualises why dates are needed |
| 1 date unlocks dashboard | 3 dates = pressure = drop-off; 1 date = enough to show phase; app nudges for more inside the experience |
| Relative chip picker, not calendar | Users know "about 2 weeks ago", not "May 20"; one tap beats calendar navigation on mobile |
| Smart suggestion for slots 2 and 3 | Pre-calculates expected previous period (slot1 date − cycle length); usually 1 tap for user |
| Today's focus rotates by dayOfCycle not random | Predictable rotation means consistent experience; doesn't feel broken if same message appears two days |
| Today's focus goal priority order | start_a_family is most time-sensitive (fertility windows); train_smarter next; stay_on_top; know_my_body default |
