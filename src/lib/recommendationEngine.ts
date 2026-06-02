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
    "Prostaglandins (the hormones causing cramps) also trigger inflammation throughout your body. This is why your joints ache and your gut acts up during your period — it's all connected, not random.",
    "Your pain tolerance is at its lowest this phase. That's not weakness — that's biology. Don't use this week to test limits. Save the hard work for when your body is ready.",
    "Magnesium drops before your period, and low magnesium worsens cramps, poor sleep, and anxiety. Dark chocolate, pumpkin seeds, and bananas aren't cravings — they're your body requesting what it needs.",
    "Light movement reduces cramps better than rest alone. A 20-minute walk increases circulation, reduces prostaglandins, and releases endorphins. You don't need to do nothing — you need to do less.",
    "Your skin is at its most sensitive this week. Estrogen and progesterone at their lowest reduces skin barrier function. Stick to familiar products — don't introduce anything new right now.",
    "Your core temperature drops slightly during menstruation — this is why warm meals, warm drinks, and heat on your lower belly all feel instinctively right. Heat directly relaxes the uterine muscle. It works because of physiology.",
    "Sleep disruption peaks during menstruation. Lower progesterone removes its natural sedative effect. If you're waking at night or sleeping poorly, this is why — not stress, not your phone.",
    "Heavy periods (soaking a pad or tampon every 1-2 hours) are not normal. They often signal fibroids, adenomyosis, or clotting issues. If this is your regular experience, it's worth investigating — you don't have to accept it.",
    "Your immune system is slightly suppressed during menstruation due to hormonal shifts. If you keep getting sick after your period starts, this is why. Rest, zinc, and vitamin C matter more this week than usual.",
    "Omega-3 fatty acids from fatty fish, walnuts, or flaxseed directly reduce prostaglandin production. Eating more omega-3s during menstruation reduces cramps at the source — not just masking them.",
    "Your cognitive performance doesn't actually drop during your period, despite how it feels. Brain fog is often fatigue and pain distracting you — not a drop in ability. Know the difference.",
    "Crying more easily this week isn't emotional instability — progesterone's crash at period start directly lowers GABA, your brain's calming neurotransmitter. You're not overreacting. Your neurochemistry shifted.",
    "Salty food cravings during menstruation are driven by the drop in aldosterone, the hormone that regulates sodium balance. Your body is literally asking for electrolytes. Electrolyte water is a smarter response than chips.",
    "Specific yoga poses — child's pose, supine twist, cat-cow — directly release tension in the hip flexors and lower back that worsen during menstruation. 15 minutes can meaningfully reduce discomfort.",
    "Low serotonin is part of what makes you feel low during your period. Estrogen regulates serotonin — when estrogen drops, serotonin follows. Sunlight, movement, and tryptophan-rich food (turkey, oats, eggs) all help.",
    "Your appetite typically increases during menstruation as your body compensates for blood loss and tissue repair. Eating slightly more — especially protein and iron — is appropriate, not emotional eating.",
    "Consistently long periods (7+ days) can indicate hormonal imbalance. If yours have always been this length, note it. If it changed recently, it's worth a conversation with your doctor.",
    "Cold water can worsen cramps for some women by increasing vasoconstriction. Warm drinks — especially ginger or chamomile tea — ease cramping by relaxing smooth muscle and improving pelvic circulation.",
    "Your period is a monthly health report. Changes in flow, colour, clots, pain level, or duration are signals — not inconveniences. Tracking them over 3+ months gives your doctor the most useful information.",
  ],
  Follicular: [
    "Estrogen rises steadily through the follicular phase, and with it, serotonin, dopamine sensitivity, and pain tolerance all increase. The optimism and energy you feel are chemistry — not mood. Use them.",
    "This is the best phase to start a new training programme. Your body is primed to learn new movement patterns — coordination, balance, and skill acquisition are all at their highest right now.",
    "Muscle protein synthesis responds best to training when estrogen is high. If you're trying to build muscle, this is your best window. Hit the hard sessions now — your body will adapt faster.",
    "Appetite tends to be lower in the follicular phase despite high energy output. This is a trap — you feel good, train hard, and undereat without realising. If your strength is plateauing, check your intake first.",
    "Estrogen helps your body prefer fat as fuel during exercise this phase. Fat oxidation is efficient and endurance capacity is high — great for longer training sessions and sustained cardio.",
    "Your verbal fluency, working memory, and problem-solving ability all rise with estrogen. The follicular phase is when you're cognitively sharpest. Schedule your most demanding mental work here.",
    "Fermented foods support estrogen metabolism through the gut. The bacteria in your microbiome actively metabolise estrogen — a healthy gut helps process it efficiently, reducing excess that causes symptoms later.",
    "New habits formed in the follicular phase have a higher chance of sticking. Dopamine sensitivity is elevated, meaning rewards feel more rewarding and motivation arrives more easily. Use this window intentionally.",
    "Your skin is clearer and more resilient in the follicular phase. Estrogen supports collagen production and skin barrier function. This is the best time to try a new product — your skin can handle it.",
    "Sleep quality improves in the follicular phase as progesterone is still low. If you've been sleeping poorly during your period, notice how this week changes things. Your baseline is returning.",
    "If you've been putting off a difficult conversation or a creative project, the follicular phase is the time to act. Social and verbal confidence peak here — because estrogen supports the brain regions responsible.",
    "Your pain threshold is rising this phase. This is the time to get dental work done, start a new training challenge, or do anything that requires tolerating discomfort. Your body is more resilient right now.",
    "Estrogen promotes joint flexibility but also slightly reduces stability. This is an advantage in yoga — but means you need proper warm-ups for heavy lifting to protect against injury.",
    "Flaxseeds support healthy estrogen metabolism through lignan binding — 1-2 tablespoons in oats or a smoothie specifically helps in the follicular phase. This is well-studied, not pseudoscience.",
    "Your resting heart rate tends to be lower in the follicular phase, meaning your cardiovascular system is more efficient. If you track HRV or resting HR, expect better numbers — and train to match.",
    "The energy you feel in follicular isn't limitless — it's borrowed. Women who overtrain here and ignore luteal often end up exhausted by cycle end. Ride the energy, but don't burn through your reserves.",
    "Creativity is genuinely higher in the follicular phase — not just motivation. Divergent thinking (generating ideas, making unusual connections) peaks here. Right time for brainstorming, pitching, or starting creative work.",
    "Your gut motility normalises in the follicular phase after the slower luteal and menstrual phases. Bloating typically reduces and digestion feels easier. If it doesn't, it may indicate something worth addressing.",
    "Testosterone also rises slightly in the follicular phase, peaking just before ovulation. This combination of estrogen + testosterone is what gives you the confidence-drive-energy combination unique to this window.",
    "The follicular phase is the best time to get bloodwork done if you're investigating hormonal issues. Estrogen and testosterone at baseline (ideally day 3-5 of your cycle) give your doctor the most diagnostic information.",
  ],
  Ovulatory: [
    "Ovulation is triggered by a luteinising hormone (LH) surge that peaks 24-36 hours before the egg is released. Your fertile window actually opens before this surge — ovulation strips detect the peak, not the start.",
    "Testosterone peaks just before ovulation alongside peak estrogen. This is the only time in your cycle when both are simultaneously high — explaining the unique combination of confidence, drive, and social ease you feel now.",
    "Your VO2 max is measurably higher around ovulation. Aerobic capacity and endurance performance are genuinely improved — not just perceived. Plan your hardest runs, rides, or swims for this window.",
    "Pain tolerance peaks at ovulation due to high estrogen and the endorphin surge that accompanies the LH spike. Best time for waxing, tattooing, dental work, or any physical discomfort you've been avoiding.",
    "Verbal fluency peaks at ovulation — research shows women use more words, speak more confidently, and are perceived as more persuasive these days. Schedule your pitch, interview, presentation, or negotiation now.",
    "This phase lasts only 3-5 days. Most women who feel they never have good energy simply aren't tracking the window. If you can plan one big performance moment per cycle here, you'll notice the difference.",
    "Your facial features, voice pitch, and body language subtly shift around ovulation in ways documented across multiple studies. You're not imagining that you feel and look different — it's measurable.",
    "Your sense of smell is sharpest at ovulation. Your brain is biologically primed to detect pheromones and make social assessments. You may find you're more attuned to people's energy and subtle cues this week.",
    "Cervical mucus at ovulation becomes clear, stretchy, and similar to raw egg white. This is a reliable, free fertility sign. Learning to read it gives you information ovulation strips can't always provide.",
    "Estrogen at its peak actively suppresses appetite. If you're eating less this week, it's hormonal suppression — not willpower. Don't restrict further. Your body will demand compensation in the luteal phase.",
    "This is your best window for testing one-rep maxes, race efforts, or any performance benchmark. Your nervous system, pain tolerance, and cardiovascular capacity are all simultaneously at their peak.",
    "Recovery from hard training is faster at ovulation than at any other point in your cycle. Estrogen modulates inflammation and muscle repair signals are stronger. You can push hard and bounce back.",
    "Your immune system is temporarily elevated around ovulation — another evolutionary adaptation. If there's a week to get through something gruelling without getting sick, this is it.",
    "High estrogen increases joint flexibility but also laxity. ACL injuries are statistically more common in female athletes around ovulation. Warm up properly and pay attention to landing mechanics — the risk is real.",
    "Social energy peaks at ovulation. If you've been avoiding social obligations or networking, this is when they feel most natural and effortless. Use the energy — it won't feel this way in the luteal phase.",
    "Decision-making is different at ovulation — you're more likely to take calculated risks and less likely to overthink. If you've been stuck on a decision, this phase is a good time to commit.",
    "Your body temperature is at its lowest just before ovulation, then rises sharply after — a sign progesterone has kicked in. If you track basal body temperature, this shift confirms ovulation happened.",
    "Strength training at ovulation builds muscle more efficiently due to high testosterone and growth hormone. The same workout done now produces more adaptation than in the luteal phase. Same effort, better result.",
    "Your brain's dopamine pathways are most active around ovulation. Things that feel motivating and pleasurable now will feel harder in the luteal phase. Let this week build momentum you can carry forward.",
    "If you experience mid-cycle pain (Mittelschmerz), it's usually the follicle releasing or fluid irritating the peritoneum — typically one-sided, lasting minutes to hours. Sharp, severe, or prolonged mid-cycle pain warrants a doctor.",
  ],
  Luteal: [
    "Progesterone is the dominant hormone of the luteal phase — calming, sedative, and temperature-raising. The drowsiness, warmth, and desire for quiet you feel aren't laziness. Progesterone has a measurable sedative effect on your nervous system.",
    "Your basal metabolic rate increases by 100-300 calories per day in the luteal phase. Your body is burning more at rest. Eating more during this phase isn't giving in — it's meeting a genuine metabolic demand.",
    "PMS symptoms worsen significantly when blood sugar is unstable. Every time you eat refined sugar or carbs alone in your luteal phase, you create a crash that amplifies irritability, fatigue, and cravings. Always pair carbs with protein and fat.",
    "Magnesium depletion worsens PMS. Women with PMS tend to have lower magnesium levels. 300-400mg of magnesium glycinate in the 10 days before your period can measurably reduce severity — this is one of the most evidence-backed PMS interventions available.",
    "Your core temperature rises 0.2-0.5°C in the luteal phase due to progesterone. This directly impairs thermoregulation during exercise — you'll feel hotter, hit fatigue sooner, and need more recovery. It's not your fitness declining. It's physiology.",
    "The liver processes progesterone, and if it's already burdened (alcohol, processed food, excess estrogen), progesterone clearance slows. This is why heavy drinking in the luteal phase worsens PMS — it competes for liver processing.",
    "B6 (found in salmon, chicken, bananas, potatoes) supports serotonin and dopamine production in the luteal phase. The mood dip you feel is partly neurotransmitter-driven. B6 at 50-100mg has clinical evidence for reducing PMS-related mood symptoms.",
    "Your gut slows down in the luteal phase due to progesterone's relaxing effect on smooth muscle. Bloating and constipation are hormonal — not random. Soluble fibre, hydration, and magnesium help. Raw cold foods and large meals make it worse.",
    "Progesterone is naturally anxiolytic (anxiety-reducing) when metabolised correctly. But in women with high stress or cortisol, progesterone can be redirected toward cortisol production instead. High-stress luteal phases feel worse for exactly this reason.",
    "Your sleep architecture changes in the luteal phase — less deep sleep, more light sleep, which is why you wake more easily and feel less rested after 8 hours. Going to bed earlier compensates better than sleeping in.",
    "Heavy HIIT spikes cortisol, which competes with progesterone in the luteal phase. Women who do intense HIIT all cycle long often experience worse PMS, worse sleep, and worse mood in the luteal phase specifically. It's a cortisol-progesterone conflict.",
    "Food cravings in the luteal phase are serotonin-seeking behaviour. Your brain uses carbohydrates to produce serotonin, and when progesterone lowers serotonin levels, cravings follow. Complex carbs satisfy this without the blood sugar crash. Refined sugar creates a craving loop.",
    "Breast tenderness in the luteal phase is driven by progesterone's effect on breast tissue. Reducing caffeine and salt often reduces severity. Evening primrose oil has clinical evidence for reducing breast tenderness specifically.",
    "Your strength in the luteal phase is real — don't abandon resistance training. But volume and intensity should drop, especially in the final week. Moderate weight, controlled tempo, and fewer sets preserve muscle without overtaxing your recovery.",
    "If you notice heightened anxiety, intrusive thoughts, or emotional sensitivity every cycle in the luteal phase, you may be experiencing PMDD rather than PMS. PMDD is clinically recognised with effective treatments — you don't have to manage it alone.",
    "Your immune system is suppressed in the late luteal phase just before your period. This is why many women get sick right before their period — your body is deprioritising immunity as it prepares for menstruation. Zinc, vitamin C, and sleep matter most this week.",
    "Progesterone peaks around 7 days after ovulation and then drops sharply if pregnancy hasn't occurred. The drop triggers PMS. If your PMS hits like a wall rather than gradually, your progesterone may be dropping faster than typical.",
    "Exercise in the late luteal phase can feel harder at the same effort. Heart rate runs higher, oxygen cost increases, and perceived exertion is elevated. This is not deconditioning. Adjust expectations and train to feel — not to numbers.",
    "The luteal phase is actually a productive time for deep, focused work — just different work than follicular. Instead of generating new ideas, you excel at detail-oriented tasks, editing, analysis, and finishing things. Your brain is less distractible but more analytical.",
    "Tracking your mood, energy, and symptoms in the luteal phase for 3 cycles reveals your personal PMS pattern — which days are worst, which symptoms recur, and what helps. This data is more useful than any generic advice, because PMS patterns are highly individual.",
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
