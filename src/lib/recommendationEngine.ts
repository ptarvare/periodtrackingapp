import { CycleStatus, Phase } from "./predictionEngine";

export interface DailyRecommendation {
  diet: string[];
  workout: string[];
  supplements: string[];
  lifestyle: string[];
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
          "Iron-rich foods — spinach, lentils, red meat",
          "Warm, easy-to-digest meals like soups and stews",
          "Dark chocolate (70%+) for magnesium and mood",
          "Ginger tea to ease cramps",
        ],
        workout: [
          "Rest or light walking (20–30 min)",
          "Gentle yoga — child's pose, supine twists",
          "Stretching and foam rolling",
        ],
        supplements: [
          "Magnesium glycinate (300–400 mg) — cramp relief",
          "Iron (if deficient) — take with Vitamin C",
          "Omega-3 fatty acids — anti-inflammatory",
        ],
        lifestyle: [
          "Prioritize 8+ hours of sleep",
          "Use a heating pad for lower back cramps",
          "Reduce screen time and take it slow",
        ],
      };

    case "Follicular":
      return {
        diet: [
          "Fermented foods — yogurt, kimchi, kefir for gut health",
          "Lean protein — eggs, chicken, tofu",
          "Complex carbs — oats, sweet potato for rising energy",
          "Seeds — flaxseeds to support estrogen metabolism",
        ],
        workout: [
          "Strength training — great time for PRs",
          "HIIT or sprints if energy is high",
          "Try a new class or sport — coordination peaks here",
        ],
        supplements: [
          "B-complex — supports energy and estrogen metabolism",
          "Vitamin D3 (2000 IU) — boosts mood and immunity",
          "Zinc — supports follicle development",
        ],
        lifestyle: [
          "Best phase for social plans and new projects",
          "Start habits here — motivation is highest",
          "Great time for brainstorming and creativity",
        ],
      };

    case "Ovulatory":
      return {
        diet: [
          "Antioxidant-rich foods — berries, bell peppers, dark leafy greens",
          "Cruciferous vegetables — broccoli, cauliflower to clear excess estrogen",
          "Hydrate well — 2.5–3L water daily",
          "Light, fibre-rich meals",
        ],
        workout: [
          "High-intensity intervals — peak strength and endurance",
          "Heavy compound lifts — deadlifts, squats",
          "Group classes or team sports for social energy",
        ],
        supplements: [
          "Vitamin C (500–1000 mg) — antioxidant support",
          "Vitamin E — supports egg quality",
          "CoQ10 — cellular energy and antioxidant",
        ],
        lifestyle: [
          "High communication and confidence window — use it",
          "Good time for difficult conversations or negotiations",
          "Peak energy: plan demanding tasks today",
        ],
      };

    case "Luteal":
      return {
        diet: [
          "Complex carbs to stabilise blood sugar — quinoa, brown rice",
          "Fibre-rich foods — oats, legumes, leafy greens",
          "Reduce caffeine, alcohol, and excess salt",
          "Magnesium-rich foods — pumpkin seeds, dark chocolate, almonds",
        ],
        workout: [
          "Moderate cardio — walks, cycling, swimming",
          "Pilates or barre for strength without intensity",
          "Yoga — especially for PMS symptoms",
        ],
        supplements: [
          "Magnesium glycinate (300–400 mg) — reduces PMS and bloating",
          "Vitamin B6 (50–100 mg) — mood and PMS relief",
          "Chasteberry (Vitex) — may ease PMS symptoms",
        ],
        lifestyle: [
          "Reduce stress — cortisol worsens PMS",
          "Build in extra self-care time",
          "Journalling and reflection suit this quieter phase",
        ],
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

  recs.diet.push("Prioritise low-GI foods to manage insulin spikes");
  recs.supplements.push(
    "Inositol (Myo-inositol 2g + D-chiro 50mg) — insulin sensitivity*",
    "Omega-3 (EPA+DHA 2g) — inflammation and androgen balance*"
  );

  // Remove high-intensity suggestions in phases where cortisol is already elevated
  if (phase === "Luteal" || phase === "Menstrual") {
    recs.workout = recs.workout.filter((w) => !w.toLowerCase().includes("hiit"));
    recs.workout.push("Resistance training with moderate weights", "Daily 20-min walk");
  }

  recs.pcosTip =
    "Blood sugar consistency is your best friend today. Eat balanced meals every 3–4 hours and avoid skipping.";
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
