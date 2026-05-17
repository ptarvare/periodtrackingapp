# Luna — Product Requirements Document

**Version:** 1.2
**Last updated:** May 2026
**Status:** Live MVP — actively iterating

---

## Vision

Luna is an AI companionship app built for women.

The goal is to create a daily companion that women can rely on — not just to track their period, but to understand their body, ask questions they feel uncomfortable asking anywhere else, and get guidance on food, exercise, mood, and energy that is actually relevant to where they are in their cycle.

Most period apps are logbooks. Luna is a guide.

The long-term vision:
- A woman opens Luna every morning the way she checks the weather — to know what her body needs today.
- She can ask it anything: "Why am I so tired this week?", "Should I train hard today?", "Is this PMS or something else?"
- The app knows her cycle, her health profile, and her goals — and gives answers that feel personal, not generic.
- Expert-backed content from real nutritionists and trainers is baked into the recommendations.
- It is completely free. No paywalls. Built for every woman.

---

## Problem We Are Solving

Period tracking apps today:
- Only log and predict. They don't guide.
- Give the same advice to everyone regardless of cycle phase, age, or health conditions.
- Feel clinical, not supportive.
- Don't connect cycle science to daily decisions around food, training, and lifestyle.

Women are making daily decisions about their bodies with very little personalised support. Luna fills that gap.

---

## Target Users

- Women aged 18–40
- Women with irregular cycles or PCOS/PCOD
- Fitness-focused women wanting phase-based training guidance
- Women who want to understand their bodies better but don't know where to start

---

## What We Have Built (v1 — Live)

The first version of Luna is live at **luna-app-beta.vercel.app**.

### Authentication
- Google Sign-In via Firebase Auth
- Works on iPhone Safari and Chrome iOS
- Persistent login (users stay signed in)

### Onboarding (2-step flow)
- Step 1: Name, age, weight, height
- Step 2: Multiple period start dates (add/remove), period duration (1–8 days), average cycle length
- All data saved to Firebase Firestore

### Dashboard
- Next period prediction with countdown and cycle progress bar
- Current phase card (Menstrual, Follicular, Ovulatory, Luteal) with phase-specific gradient colours and emoji
- Data confidence nudge if fewer than 3 months of dates are entered
- Daily recommendations in 4 tabs: Food, Exercise, Supplements, Lifestyle

### Cycle Prediction Engine
- Accepts multiple period start dates
- Averages consecutive date gaps to calculate real cycle length
- Confidence score based on number of data points
- Identifies which day of the cycle the user is on today

### Phase-Based Recommendation Engine
- Rule-based engine (no AI required for this layer)
- Recommendations change based on current phase
- 4 phases covered: Menstrual, Follicular, Ovulatory, Luteal

### Edit Profile
- Users can update name, age, weight, height at any time
- Add or remove period start dates
- Update period duration and cycle length
- Changes update predictions immediately

### Design
- Mobile-first, optimised for iPhone
- Pink/purple gradient theme (#FDF2F8 background)
- Bottom tab navigation on mobile (Home, Profile)
- Top navigation bar on desktop

### Tech Stack
- Next.js 16 (App Router) + TypeScript
- Firebase Auth + Firestore
- Tailwind CSS 4
- Hosted on Vercel (free tier)
- GitHub: ptarvare/luna-app

---

## What We Added After Launch

| Update | Reason |
|---|---|
| Multiple period dates instead of single date | More accurate cycle length prediction |
| Edit Profile page | Users needed a way to fix incorrect dates |
| Mobile bottom tab nav | Improved mobile UX |
| Phase-specific gradient colours per card | Visual differentiation between phases |
| Popup-blocked detection with Safari instructions | Chrome iOS blocks Google Sign-In popups |
| Moved setPersistence out of sign-in handler | Fixed popup being blocked even on Safari |
| Removed Sign Out button | Cleaner UX — users don't need to sign out |

---

## Pipeline — What We Are Building Next

### Near-term (next 2–4 weeks)

**1. Expert Trainer Profile**
Add a real nutritionist/trainer's profile inside the app. Their expertise and recommendations are baked into the content. Not heavy on the home screen — a small entry card that opens into their full profile, philosophy, and phase-specific tips. Content written once, can be updated by editing a single file.

**2. AI Chat Companion**
The biggest feature. A chat interface where users can ask questions about their cycle, symptoms, food, exercise, or anything related to their health. The AI has full context: the user's current phase, profile, and cycle history. Answers feel personal, not generic. No medical diagnosis. Clear disclaimer. Already has route scaffolding at `/chat` and `/api/chat`.

### Medium-term (1–3 months)

**3. Daily Mood and Energy Logging**
Let users log how they feel each day (mood, energy, cramps, bloating). Over time, Luna learns their personal patterns — not just what the average woman experiences in each phase, but what *they* experience.

**4. PCOS/PCOD Mode**
Specific recommendation adjustments for women with PCOS: low-GI food guidance, blood sugar management, resistance training focus, relevant supplements (with disclaimers). Flagging of irregular cycles.

**5. Period Reminders**
Push notification or browser notification a few days before predicted period. Simple, practical, high-value.

**6. Symptom Tracking**
Log daily symptoms (cramps, headaches, bloating, mood swings, cravings). Used to improve AI responses and personalise recommendations over time.

### Long-term vision (3–12 months)

**7. Coach/Expert Dashboard**
A separate view for nutritionists or trainers to see aggregated (anonymised) insights or manage their profile content inside the app.

**8. Community Layer**
Women asking and answering questions together. Moderated. Phase-aware (e.g. "others in the luteal phase are also feeling this").

**9. Personalised Meal Plans**
Full meal plans generated per phase based on user preferences, dietary restrictions, and goals.

**10. Wearable Integration**
Pull cycle and health data from Apple Health or Fitbit for richer predictions.

---

## What Luna Is Not

- Not a medical device
- Not a diagnostic tool
- Not a replacement for a doctor
- Will never claim to diagnose PCOS, fertility issues, or any health condition

Every screen includes: *"Luna is a wellness tool, not a medical device."*

---

## Success Metrics (MVP)

| Metric | Target |
|---|---|
| Users who complete onboarding | > 80% |
| Users who return within 7 days | > 35% |
| Users who add 3+ period dates | > 60% |
| Users who engage with recommendations | > 60% |

---

## Data & Privacy

- All user data stored in Firebase Firestore
- Each user can only access their own data (Firestore security rules)
- No data sold to third parties
- Google Sign-In only — no passwords stored

---

## Current Risks

| Risk | Mitigation |
|---|---|
| Inaccurate prediction for irregular cycles | Show confidence score, ask for more data |
| AI chat giving harmful advice | System prompt restricts to wellness only, no diagnosis |
| Low user retention after first visit | Daily value (reminders, mood logging) being built next |
| Expert content becoming outdated | Build a simple update flow so content can be refreshed |
