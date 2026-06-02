import { CycleStatus, Phase } from "./predictionEngine";

export interface MealPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface DailyRecommendation {
  meals: MealPlan;
  dietNotes: string[];
  dietAvoid: string[];
  workout: string[];
  workoutAvoid: string[];
  supplements: string[];
  lifestyle: string[];
  expertTip: string;
  pcosTip?: string;
}

const expertTipPool: Record<Phase, string[]> = {
  Menstrual: [
    "Your period is not a test of willpower. If you're not hitting your PR, don't feel guilty — your body demands extra care right now. Respect what it's telling you.",
    "Rest doesn't mean doing nothing. Light movement, a warm bath, or a calming habit you love are all valid. Listen to what your body actually needs today.",
    "Iron loss during your period is real. Pair iron-rich meals with Vitamin C — like lemon juice over spinach — to absorb up to 3x more.",
  ],
  Follicular: [
    "Higher estrogen can suppress appetite, but your body needs fuel to build strength. Don't accidentally under-fuel your best training phase — eat to match your effort.",
    "This is your strongest recovery phase. If you pushed hard in a session, your body adapts faster now — use that to build fitness you'll maintain through luteal.",
    "New habits stick better when started in the follicular phase. Your dopamine sensitivity is higher — use that momentum to build something that lasts.",
  ],
  Ovulatory: [
    "This phase is only 3–4 days. Women often miss the ideal window for testing maxes by not tracking it. Know when it's coming and plan your peak sessions around it.",
    "Your pain tolerance is highest during ovulation — great for a hard workout, but also easiest to overtrain. Warm up properly and listen to your joints.",
    "Peak estrogen means peak verbal fluency and confidence. Schedule the difficult conversation, the pitch, or the performance — your brain is wired for it right now.",
  ],
  Luteal: [
    "Your increased appetite in the luteal phase is metabolic, not a lack of willpower. Your body burns more calories at rest — feed it properly and PMS symptoms improve dramatically.",
    "Cutting calories during PMS week backfires every time. Give your body nutrient-dense food and your mood, sleep, and training will all improve.",
    "Progesterone raises your core temperature slightly this phase. You may feel warmer during workouts and need more recovery time — that's biology, not weakness.",
  ],
};

export function getRecommendations(
  status: CycleStatus,
  profile: any
): DailyRecommendation {
  const { currentPhase, dayOfCycle } = status;
  const goals: string[] = profile?.goals ?? [];
  const conditions: string[] = profile?.conditions ?? [];
  const hasPCOS = conditions.includes("PCOS") || conditions.includes("PCOD");
  const wantsMusclGain = goals.includes("Muscle Gain");
  const wantsFatLoss = goals.includes("Fat Loss");

  const recs = baseRecs(currentPhase);
  const pool = expertTipPool[currentPhase];
  recs.expertTip = pool[dayOfCycle % pool.length];

  applyPCOS(recs, currentPhase, hasPCOS);
  applyGoals(recs, currentPhase, wantsMusclGain, wantsFatLoss);

  return recs;
}

// ─── Phase base tables ────────────────────────────────────────────────────────

function baseRecs(phase: Phase): DailyRecommendation {
  switch (phase) {
    case "Menstrual":
      return {
        meals: {
          breakfast: "Iron + complex carbs (oats with raisins and flaxseeds, squeeze of lemon — vitamin C triples iron absorption)",
          lunch: "Anti-inflammatory protein + greens (lentil soup with turmeric, dark leafy salad, whole grain bread)",
          dinner: "Omega-3 rich + warming (salmon or sardines with sweet potato mash, ginger tea before bed)",
        },
        dietNotes: [],
        dietAvoid: [
          "Junk food, oily food, high-sugar foods — worsen inflammation and make cramps worse",
          "Cold foods and raw salads — harder to digest; stick to warm, cooked meals",
        ],
        workout: [
          "Light walking (20–30 min), yoga, or gentle stretching",
          "Low-intensity strength training if energy allows — familiar movements only",
          "Foam rolling and mobility work",
        ],
        workoutAvoid: [
          "HIIT and heavy lifting — don't add extra stress this week",
          "Anything new — this is not the phase to test limits",
        ],
        supplements: [
          "Magnesium glycinate (300–400 mg) — cramp relief and muscle relaxation",
          "Iron (if deficient) — take with Vitamin C for best absorption",
          "Omega-3 (EPA+DHA) — anti-inflammatory",
        ],
        lifestyle: [
          "Prioritise rest — this is your body's recovery week, not a failure week",
          "Sleep quality impacts hormone balance more than any supplement",
          "Rest doesn't mean doing nothing — a warm bath or a calming habit you love counts",
        ],
        expertTip:
          "Your period is not a test of willpower. If you're not hitting your PR, don't feel guilty — your body demands extra care right now. Respect what it's telling you.",
      };

    case "Follicular":
      return {
        meals: {
          breakfast: "Lean protein + complex carbs (eggs with whole grain toast, or oats with Greek yogurt and mixed berries)",
          lunch: "Fermented foods + protein (kimchi fried rice with chicken, or tofu salad with sauerkraut and sesame dressing)",
          dinner: "Muscle-building protein + complex carbs (grilled chicken or fish with quinoa and roasted vegetables)",
        },
        dietNotes: [],
        dietAvoid: [
          "Refined sugar in excess — spikes insulin when your metabolism is at its most flexible",
        ],
        workout: [
          "Progressive overload — heavy compound lifts: squats, deadlifts, bench press",
          "Higher training volume — body adapts and recovers faster this phase",
          "Skill work and new movements — coordination and learning peak now",
          "HIIT or sprints if energy is high",
        ],
        workoutAvoid: [
          "Under-eating while training hard — appetite may be lower but energy demands are high",
        ],
        supplements: [
          "B-complex — supports energy and estrogen metabolism",
          "Vitamin D3 (2000 IU) — boosts mood and immunity",
          "Zinc — supports follicle development",
        ],
        lifestyle: [
          "Take advantage of this energy surge — plan your hardest sessions now",
          "Great time for social plans, new projects, and big work challenges",
          "Start new habits here — motivation and consistency are highest this phase",
        ],
        expertTip:
          "Higher estrogen can suppress appetite, but your body needs fuel to build strength. Don't accidentally under-fuel your best training phase — eat to match your effort.",
      };

    case "Ovulatory":
      return {
        meals: {
          breakfast: "Antioxidant-rich + fibre (berry smoothie bowl with chia seeds, or eggs with colourful peppers and spinach)",
          lunch: "Fibre-rich + healthy fats (cruciferous vegetable stir-fry with avocado, or lentil salad with olive oil and lemon)",
          dinner: "Balanced + light (grilled fish with steamed broccoli and brown rice, or chickpea curry with mixed vegetables)",
        },
        dietNotes: [],
        dietAvoid: [
          "Excess alcohol — interferes with estrogen clearance",
          "Heavily processed foods — crowd out the nutrients your body needs most now",
        ],
        workout: [
          "Go for PRs and max lifts — this is your peak performance window",
          "High-intensity intervals, competitive sports, anything requiring power",
          "Heavy compound lifts: deadlifts, squats, bench",
          "Warm up properly — feeling invincible doesn't mean you're immune to injury",
        ],
        workoutAvoid: [
          "Overtraining — listen to joint signals even when energy feels limitless",
        ],
        supplements: [
          "Vitamin C (500–1000 mg) — antioxidant support",
          "Vitamin E — supports egg quality",
          "CoQ10 — cellular energy and antioxidant",
        ],
        lifestyle: [
          "This window is just 3–4 days — time your training and big decisions strategically",
          "Schedule important meetings and difficult conversations — communication peaks now",
          "Plan anything requiring courage or peak performance — mental and physical output are highest",
        ],
        expertTip:
          "This phase is only 3–4 days. Women often miss the ideal window for testing maxes because they don't track it. Know when it's coming and plan your peak sessions around it.",
      };

    case "Luteal":
      return {
        meals: {
          breakfast: "Magnesium + complex carbs (banana oat pancakes with pumpkin seeds, or whole grain toast with almond butter and banana)",
          lunch: "B-vitamin rich + blood sugar stabilising (salmon with brown rice and leafy greens, or egg salad on whole grain with spinach)",
          dinner: "Comforting + anti-PMS (sweet potato and lentil curry, or chicken with roasted vegetables and quinoa — dark chocolate for dessert)",
        },
        dietNotes: [],
        dietAvoid: [
          "Excess caffeine — worsens anxiety and disrupts sleep this phase",
          "High-sodium foods — increases bloating",
          "Refined sugars — blood sugar swings worsen mood and PMS symptoms",
        ],
        workout: [
          "Moderate strength training, steady-state cardio, Pilates, or power yoga",
          "Focus on technique and time under tension — not new PRs",
          "In the final week before your period, pull back volume noticeably",
        ],
        workoutAvoid: [
          "Excessive HIIT or max-effort lifting, especially the final week — recovery takes longer now",
          "Overtraining leads to burnout and worsened PMS",
        ],
        supplements: [
          "Magnesium glycinate (300–400 mg) — reduces PMS, bloating, and supports sleep",
          "Vitamin B6 (50–100 mg) — mood and PMS relief",
          "Chasteberry (Vitex) — may ease PMS symptoms",
        ],
        lifestyle: [
          "Eat more — not junk, but nutrient-dense food. Restricting backfires every time this phase",
          "Build in extra self-care — your body is doing more metabolic work than you realise",
          "Journalling and reflection suit this quieter, inward phase",
        ],
        expertTip:
          "Your increased appetite in the luteal phase is metabolic, not a lack of willpower. Your body burns more calories at rest — feed it properly and PMS symptoms improve dramatically.",
      };
  }
}

// ─── PCOS modifier ────────────────────────────────────────────────────────────

function applyPCOS(
  recs: DailyRecommendation,
  phase: Phase,
  hasPCOS: boolean
): void {
  if (!hasPCOS) return;

  recs.dietNotes.push("Balance every meal with protein, fibre, and healthy fat to stabilise blood sugar");
  recs.supplements.push(
    "Inositol (Myo-inositol 2g + D-chiro 50mg) — insulin sensitivity*",
    "Omega-3 (EPA+DHA 2g) — inflammation and androgen balance*"
  );

  if (phase === "Luteal" || phase === "Menstrual") {
    recs.workout = recs.workout.filter((w) => !w.toLowerCase().includes("hiit"));
    recs.workout.push("Resistance training with moderate weights", "Daily 20-min walk");
  }

  recs.pcosTip =
    "High insulin drives androgen production in PCOS — food pairing (protein + fibre + fat at every meal) is your most powerful lever. Prioritise strength training 3–4x/week over excessive cardio, which spikes cortisol and worsens insulin resistance.";
}

// ─── Goal modifier ────────────────────────────────────────────────────────────

function applyGoals(
  recs: DailyRecommendation,
  phase: Phase,
  wantsMuscle: boolean,
  wantsFatLoss: boolean
): void {
  if (wantsMuscle) {
    recs.dietNotes.push("Target 1.6–2g protein per kg bodyweight today");
    if (phase === "Follicular" || phase === "Ovulatory") {
      recs.workout.push("Focus on progressive overload — add weight or reps");
      recs.supplements.push("Creatine monohydrate (5g/day) — muscle output and recovery");
    }
  }

  if (wantsFatLoss) {
    if (phase === "Follicular" || phase === "Ovulatory") {
      recs.workout.push("Optional: 15-min fasted walk in the morning");
    }
    recs.dietNotes.push("Eat protein first at each meal to manage hunger");
  }
}
