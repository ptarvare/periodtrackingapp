# Luna — Cycle Wellness App

> Know your body. Plan your life around it — not against it.

**Luna** is a menstrual cycle tracking and wellness app that gives women personalised food, exercise, supplement, and lifestyle recommendations based on where they are in their cycle. Every phase of your cycle affects your energy, mood, and performance differently — Luna helps you use that to your advantage.

🔗 **Live App:** [luna-app-beta.vercel.app](https://luna-app-beta.vercel.app)

---

## What it does

Luna predicts your current cycle phase (Menstrual / Follicular / Ovulatory / Luteal) and delivers content personalised to:

- **Your phase** — what your body needs right now
- **Your goal** — conceiving, training smarter, staying productive, or understanding your cycle
- **Your name** — daily focus cards addressed to you

### Core features

| Feature | Description |
|---|---|
| Phase prediction | Calculates current phase from logged period dates |
| Daily recommendations | Food (by meal), exercise, supplements, lifestyle — all phase-specific |
| Today's focus card | Goal-aware daily insight, personalised by name, rotates daily |
| Expert tips | Curated by Priya Tarvare (Certified PT & Nutrition Practitioner) — goal-specific |
| Cycle log | Daily mood + energy check-in with phase-specific prompts |
| Report tab | Energy heatmap across 6 cycles, productivity framing, shareable Wrapped card |
| Period confirmation | Never assumes — waits for you to confirm before switching phases |
| Goals personalisation | 4 goals: Start a family · Train smarter · Stay on top · Know my body |
| PWA | Installable on home screen, works offline |

---

## Tech stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS 4
- **Auth:** Firebase Authentication (Google Sign-In)
- **Database:** Firebase Firestore
- **AI:** Anthropic Claude API (claude-sonnet-4-6)
- **Analytics:** PostHog
- **Hosting:** Vercel

---

## Project structure

```
src/
├── app/
│   ├── dashboard/        # Main dashboard — phase card, focus, recs
│   ├── log/              # Daily mood + energy log
│   ├── report/           # Energy heatmap + Wrapped share card
│   ├── profile/          # User profile + cycle history
│   ├── onboarding/       # 3-step onboarding (info → goals → dates)
│   └── api/chat/         # Claude API route
├── lib/
│   ├── predictionEngine.ts     # Phase + next period prediction
│   ├── recommendationEngine.ts # Phase × goal content engine
│   └── todaysFocus.ts          # Daily focus card content
└── components/
    └── DailyRecs.tsx     # Tabbed recommendations component
```

---

## Running locally

```bash
git clone https://github.com/ptarvare/periodtrackingapp.git
cd periodtrackingapp
npm install
```

Create a `.env.local` file with your own Firebase and Anthropic credentials. Then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## About

Built by **Pooja Tarvare** — product thinker who codes.

Expert content by **Priya Tarvare**, Certified Personal Trainer & Nutrition Practitioner.

---

## License

Copyright © 2026 Pooja Tarvare. All rights reserved.

This repository is publicly visible for portfolio and review purposes only. The code, design, content, and concepts may **not** be copied, modified, distributed, or used commercially without explicit written permission from the author.

See [LICENSE](LICENSE) for full terms.
