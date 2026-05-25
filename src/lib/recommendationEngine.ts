import { CycleStatus, Phase } from "./predictionEngine";

export interface DailyRecommendation {
  diet: string[];
  dietAvoid: string[];
  workout: string[];
  workoutAvoid: string[];
  supplements: string[];
  lifestyle: string[];
  expertTip: string;
  pcosTip?: string;
}

export function getRecommendations(
  status: CycleStatus,
  profile: any
): DailyRecommendation {
  const { currentPhase } = status;
  const goals: string[] = profile?.goals ?? [];
  const conditions: string[] = profile?.conditions ?? [];
  const hasPCOS = conditions.includes("PCOS") || conditions.includes("PCOD");
  const wantsMusclGain = goals.includes("Muscle Gain");
  const wantsFatLoss = goals.includes("Fat Loss");

  const recs = baseRecs(currentPhase);

  applyPCOS(recs, currentPhase, hasPCOS);
  applyGoals(recs, currentPhase, wantsMusclGain, wantsFatLoss);

  return recs;
}

// ─── Phase base tables ────────────────────────────────────────────────────────

function baseRecs(phase: Phase): DailyRecommendation {
  switch (phase) {
    case "Menstrual":
      return {
        diet: [
          "Iron-rich foods: red meat, liver, dark leafy greens, lentils — pair with Vitamin C for better absorption",
          "Omega-3 fatty acids: fatty fish, walnuts, flaxseeds — reduce inflammation and cramping",
          "Magnesium-rich foods: dark chocolate, pumpkin seeds, bananas — ease cramps and support muscle relaxation",
          "Warm, easy-to-digest meals like soups and stews",
        ],
        dietAvoid: [
          "Junk food, oily food, and high-sugar foods — these worsen inflammation and make cramps worse",
        ],
        workout: [
          "Light walking (20–30 min), yoga, or gentle stretching",
          "Low-intensity strength training if energy allows — go slow, no new movements",
          "Foam rolling and mobility work",
        ],
        workoutAvoid: [
          "HIIT and heavy lifting — don't add extra physical or mental stress this week",
          "Don't try anything new — familiar, low-intensity movement only",
        ],
        supplements: [
          "Magnesium glycinate (300–400 mg) — cramp relief and muscle relaxation",
          "Iron (if deficient) — take with Vitamin C for absorption",
          "Omega-3 (EPA+DHA) — anti-inflammatory",
        ],
        lifestyle: [
          "Prioritise rest and gentle movement — this is your body's recovery week",
          "Sleep quality impacts hormone balance more than any supplement",
          "Rest doesn't mean doing nothing — light movement or a calming habit you love works best",
        ],
        expertTip:
          "Your period is not a test of willpower. If you're not hitting your PR, don't feel guilty — your body demands extra care right now. Respect what it's telling you.",
      };

    case "Follicular":
      return {
        diet: [
          "Lean proteins: chicken, fish, tofu, eggs — support muscle growth and recovery",
          "Complex carbs: oats, quinoa, sweet potatoes — fuel your increased energy and training",
          "Fermented foods: kimchi, sauerkraut, yogurt — support gut health and estrogen metabolism",
          "Seeds: flaxseeds to support estrogen metabolism",
        ],
        dietAvoid: [
          "Refined sugar in excess — spikes insulin when you're metabolically flexible",
        ],
        workout: [
          "Progressive overload: heavy compound lifts — squats, deadlifts, bench press",
          "Higher training volume — your body adapts and recovers faster this phase",
          "Skill work and new movements — coordination and learning peak here",
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
          "Take advantage of this energy surge — plan your hardest training sessions now",
          "Great time for social plans, new projects, and big work challenges",
          "Start new habits here — motivation and consistency are highest this phase",
        ],
        expertTip:
          "Higher estrogen can suppress appetite, but your body needs fuel to build strength. Don't accidentally under-fuel your best training phase — eat to match your effort.",
      };

    case "Ovulatory":
      return {
        diet: [
          "Antioxidant-rich foods: berries, colourful vegetables — reduce oxidative stress",
          "Healthy fats: avocado, nuts, olive oil — support hormone production",
          "High-fibre foods: cruciferous vegetables, whole grains — help clear excess estrogen",
          "Hydrate well — 2.5–3L water daily",
        ],
        dietAvoid: [
          "Excess alcohol — interferes with estrogen metabolism",
          "Heavily processed foods",
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
          "This window is just 3–4 days — time your training peaks strategically",
          "Schedule important meetings and difficult conversations — communication peaks here",
          "Plan anything requiring courage or peak performance — mental and physical output are highest",
        ],
        expertTip:
          "This phase is only 3–4 days. Women often miss the ideal window for testing maxes because they don't track it. Know when it's coming and plan your peak sessions around it.",
      };

    case "Luteal":
      return {
        diet: [
          "Magnesium-rich foods: leafy greens, pumpkin seeds, dark chocolate — ease PMS and support mood",
          "Complex carbs with fibre: sweet potatoes, brown rice, legumes — stabilise blood sugar and serotonin",
          "B-vitamin foods: eggs, leafy greens, salmon — support energy and hormone metabolism",
          "Your body needs ~100–300 extra calories at rest this phase — eat nutrient-dense food",
        ],
        dietAvoid: [
          "Excess caffeine — worsens anxiety and disrupts sleep",
          "High-sodium foods — increases bloating",
          "Refined sugars — blood sugar swings worsen mood and PMS",
        ],
        workout: [
          "Moderate strength training, steady-state cardio, Pilates, or power yoga",
          "Focus on technique and time under tension — not new PRs",
          "In the final week before your period, pull back volume noticeably",
        ],
        workoutAvoid: [
          "Excessive HIIT or max-effort lifting, especially in the final week — recovery takes longer now",
          "Overtraining leads to burnout and poor recovery this phase",
        ],
        supplements: [
          "Magnesium glycinate (300–400 mg) — reduces PMS, bloating, and supports sleep",
          "Vitamin B6 (50–100 mg) — mood and PMS relief",
          "Chasteberry (Vitex) — may ease PMS symptoms",
        ],
        lifestyle: [
          "Eat more — not junk, but nutrient-dense food. Restricting backfires badly this phase",
          "Build in extra self-care; your body is doing more metabolic work than you realise",
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

  recs.diet.push("Balance every meal with protein, fibre, and healthy fat to stabilise blood sugar");
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
    recs.diet.push("Target 1.6–2g protein per kg bodyweight today");
    if (phase === "Follicular" || phase === "Ovulatory") {
      recs.workout.push("Focus on progressive overload — add weight or reps");
      recs.supplements.push("Creatine monohydrate (5g/day) — muscle output and recovery");
    }
  }

  if (wantsFatLoss) {
    if (phase === "Follicular" || phase === "Ovulatory") {
      recs.workout.push("Optional: 15-min fasted walk in the morning");
    }
    recs.diet.push("Eat protein first at each meal to manage hunger");
  }
}
