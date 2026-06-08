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
  goalTip?: string;
}

// ─── Goal-specific full recommendations ──────────────────────────────────────

const goalRecs: Record<string, Record<Phase, Omit<DailyRecommendation, "expertTip" | "pcosTip" | "goalTip">>> = {

  train_smarter: {
    Menstrual: {
      meals: {
        breakfast: "Oats with pumpkin seeds and raisins — iron and magnesium to replace what your period takes out",
        lunch: "Dal with spinach and yogurt — plant iron, protein, and probiotics to keep digestion steady",
        dinner: "Chicken or sardines with sweet potato — protein to maintain muscle, complex carbs for recovery overnight",
      },
      dietNotes: ["Keep protein intake up even when appetite drops — muscle doesn't know it's your period"],
      dietAvoid: [
        "Cold foods and raw salads — harder to digest; warm cooked meals sit better this week",
        "Excess caffeine — worsens cramps and disrupts the sleep your muscles need to recover",
      ],
      workout: [
        "Light walking 20–30 min or gentle yoga — enough to reduce cramps, not enough to drain you",
        "Low-intensity strength work if energy allows — familiar movements, no new PRs",
        "Foam rolling and hip mobility — your connective tissue needs more time to warm up this week",
      ],
      workoutAvoid: [
        "HIIT and heavy loading — inflammatory load is already high, adding more slows recovery",
        "Anything that leaves you wrecked — your job this week is to stay ready, not push through",
      ],
      supplements: [
        "Magnesium glycinate 300–400mg — reduces cramps and helps with sleep quality",
        "Iron (if you lose heavily) — take with vitamin C to triple absorption",
        "Omega-3 EPA+DHA — directly reduces prostaglandins driving cramp and inflammation",
      ],
      lifestyle: [
        "This week is a planned deload, not a setback. Every serious athlete has recovery weeks built in.",
        "Sleep is where muscle repairs — protect it more than you protect your training sessions",
        "Note how your body feels each day. This data helps you train smarter next cycle.",
      ],
    },

    Follicular: {
      meals: {
        breakfast: "Eggs with whole grain toast and avocado — protein and healthy fats to fuel your build phase",
        lunch: "Grilled chicken with quinoa and roasted vegetables — balanced macros for training adaptation",
        dinner: "Salmon with brown rice and broccoli — omega-3s reduce exercise inflammation overnight",
      },
      dietNotes: [
        "Target 1.6–2g protein per kg bodyweight — your body is primed to build right now, give it the material",
        "Appetite may be lower than your training demands — eat to your output, not your hunger",
      ],
      dietAvoid: [
        "Under-eating — the biggest mistake athletes make in follicular. Fuel matches your effort.",
      ],
      workout: [
        "Progressive overload on compound lifts — squats, deadlifts, bench, rows. Add weight or reps.",
        "Skill work and new movements — coordination and motor learning peak now, use it",
        "HIIT or sprints if energy is high — your body recovers faster from hard sessions this phase",
        "Track your lifts. The gains you lock in here carry you through the rest of the cycle.",
      ],
      workoutAvoid: [
        "Skipping sessions to rest when you feel good — this window closes. Don't waste it.",
      ],
      supplements: [
        "Creatine monohydrate 5g daily — most evidence-backed supplement for female athletes. Start here.",
        "B-complex — supports energy metabolism and estrogen processing",
        "Vitamin D3 2000 IU — boosts mood, immunity, and muscle function",
      ],
      lifestyle: [
        "Block your hardest training sessions for this week — your body adapts faster and recovers quicker",
        "New habits started in follicular have a higher chance of sticking. If you want to add something to your routine, now is the time.",
        "You'll feel strong. That's real, not a feeling. Use it.",
      ],
    },

    Ovulatory: {
      meals: {
        breakfast: "Oat porridge with banana and a scoop of protein — carb-loaded and ready for peak output",
        lunch: "Rice with grilled fish and colourful vegetables — glycogen replenishment for back-to-back sessions",
        dinner: "Chicken or tofu stir-fry with noodles — fast fuel that's ready for tomorrow's session",
      },
      dietNotes: [
        "Higher-carb fuelling works best now — glycogen storage and use are most efficient at ovulation",
        "Eat before training, not just after — your body runs hot and needs pre-session fuel",
      ],
      dietAvoid: [
        "Skipping meals before training — your output suffers and recovery slows",
        "Excess alcohol — interferes with the peak hormonal environment you've been building toward",
      ],
      workout: [
        "This is your PR window. Test 1RMs, run time trials, hit your benchmarks. The data will be accurate.",
        "High-intensity intervals, explosive work, competitive sessions — your nervous system is at its peak",
        "Warm up properly even though you feel invincible — ACL risk is highest now due to ligament laxity",
        "Log everything. Your ovulatory performance is your true baseline.",
      ],
      workoutAvoid: [
        "Skipping proper warm-up — estrogen increases ligament laxity. The injury risk is real.",
      ],
      supplements: [
        "Creatine 5g — keep consistent, muscle output and power are highest now",
        "Electrolytes — you sweat more and train harder; replace what you lose",
        "Vitamin C 500–1000mg — antioxidant support for the higher training load",
      ],
      lifestyle: [
        "You have 3–4 days of peak performance. Plan your most demanding sessions here, not randomly.",
        "Recovery from hard sessions is faster now than any other phase — you can push on consecutive days",
        "Note your PRs and benchmarks. These numbers show you what you're capable of.",
      ],
    },

    Luteal: {
      meals: {
        breakfast: "Banana oat pancakes with almond butter — magnesium and protein to reduce PMS, blood sugar stays steady",
        lunch: "Salmon with brown rice and leafy greens — B6 for mood, omega-3 for inflammation management",
        dinner: "Sweet potato and chickpea curry — complex carbs satisfy cravings without the crash; dark chocolate is fine",
      },
      dietNotes: [
        "Your body burns 100–300 extra calories at rest this phase. Eating more isn't weakness — it's physiology.",
        "Pair every carb with protein and fat. Blood sugar swings make PMS significantly worse.",
      ],
      dietAvoid: [
        "Refined sugar — creates a craving loop, amplifies PMS, disrupts sleep",
        "Excess caffeine — already elevated anxiety from progesterone doesn't need help",
        "High-sodium foods — worsens bloating when progesterone is already causing water retention",
      ],
      workout: [
        "Moderate strength training at 70–80% of your normal weight — you're maintaining, not building",
        "Focus on technique and time under tension, not load",
        "Steady-state cardio, Pilates, or power yoga — enough to feel good, not enough to wreck recovery",
        "Final week before your period: pull back volume by 30–40%. This is the planned deload.",
      ],
      workoutAvoid: [
        "Heavy HIIT — cortisol competes with progesterone and makes PMS measurably worse",
        "Chasing last week's numbers — that was ovulatory you. Luteal you has different parameters.",
      ],
      supplements: [
        "Magnesium glycinate 300–400mg — reduces PMS, bloating, and improves sleep quality",
        "Vitamin B6 50–100mg — supports serotonin and dopamine production when they drop",
        "Omega-3 EPA+DHA — anti-inflammatory through the phase where inflammation peaks",
      ],
      lifestyle: [
        "This is your deload week. Pull back 20–30%, protect sleep, eat well. You'll come back stronger.",
        "Consistent training across the luteal phase matters more than intensity. Show up at 70%.",
        "Track how you feel day by day. Knowing your personal pattern is worth more than generic advice.",
      ],
    },
  },

  start_a_family: {
    Menstrual: {
      meals: {
        breakfast: "Spinach omelette with whole grain toast — folate and iron to replenish what your period takes",
        lunch: "Lentil soup with turmeric and a glass of orange juice — plant iron absorbs 3x better with vitamin C",
        dinner: "Sardines or salmon with sweet potato — omega-3s rebuild the uterine environment for next cycle",
      },
      dietNotes: [
        "Iron replenishment this week directly influences egg quality next cycle. Don't skip it.",
        "Folate is needed before you even know you're pregnant — keep it consistent every day",
      ],
      dietAvoid: [
        "Alcohol — your liver is already processing hormonal changes; don't add to its load",
        "Highly processed foods — replace them with nutrients your reproductive system is actively using",
      ],
      workout: [
        "Gentle walking 20–30 min — supports pelvic circulation without stressing your body",
        "Restorative yoga — child's pose, supine twist, legs up the wall all relieve pelvic tension",
        "Light stretching — no new challenges this week",
      ],
      workoutAvoid: [
        "High-intensity exercise — inflammatory load is already elevated; protect your recovery",
      ],
      supplements: [
        "Prenatal multivitamin with 400–800mcg folate — start now and don't stop",
        "Omega-3 DHA 500mg — anti-inflammatory and supports uterine lining development",
        "Iron (if your period is heavy) — with vitamin C every time for absorption",
      ],
      lifestyle: [
        "The follicle developing for next month's ovulation is being selected right now. Rest and nourishment this week have a longer reach than most people realise.",
        "Track your flow — duration, colour, and heaviness are fertility signals worth noting",
        "Sleep is when hormone signalling resets. Protect it more than anything else this week.",
      ],
    },

    Follicular: {
      meals: {
        breakfast: "Eggs with avocado on whole grain toast — choline for egg quality, healthy fats for hormone production",
        lunch: "Chickpea salad with leafy greens and lemon — folate, iron, and the zinc your developing follicle needs",
        dinner: "Salmon or mackerel with quinoa — omega-3s create the anti-inflammatory environment eggs develop best in",
      },
      dietNotes: [
        "Antioxidants protect developing eggs from oxidative stress — berries, leafy greens, and colourful vegetables every day",
        "Healthy fats (avocado, olive oil, nuts) are the raw material for estrogen production. Don't restrict them.",
      ],
      dietAvoid: [
        "Trans fats and heavily processed oils — directly linked to reduced ovarian function",
        "Excess sugar — disrupts the insulin environment that hormonal signalling depends on",
      ],
      workout: [
        "30–45 min moderate exercise 4–5 days a week — consistent movement supports ovulation regularity",
        "Strength training 2–3x — builds the hormonal and metabolic foundation for a healthy pregnancy",
        "Daily walking — simple, consistent, and well-studied for fertility outcomes",
      ],
      workoutAvoid: [
        "Excessive training volume — over-exercise disrupts LH and can delay or prevent ovulation",
      ],
      supplements: [
        "CoQ10 200–400mg — supports mitochondrial function in developing eggs; egg quality improvement starts here",
        "Folic acid 400–800mcg — non-negotiable if you're trying to conceive",
        "Vitamin D3 2000 IU — deficiency is directly linked to reduced fertility outcomes",
      ],
      lifestyle: [
        "Cervical mucus is starting to change from dry to creamy to clear and stretchy. Learning to read it is more accurate than any app.",
        "Stress suppresses the hormones that trigger ovulation. Managing it isn't optional — it's fertility strategy.",
        "This is a good phase for tracking LH strips alongside mucus changes — two signals are more reliable than one.",
      ],
    },

    Ovulatory: {
      meals: {
        breakfast: "Berry smoothie with flaxseeds, spinach, and protein — antioxidants to protect egg quality at release",
        lunch: "Avocado salad with eggs and whole grains — healthy fats and protein support the hormonal peak",
        dinner: "Grilled fish with steamed vegetables and rice — light, antioxidant-rich, and easy to digest",
      },
      dietNotes: [
        "Staying well-hydrated directly supports cervical mucus quality — the channel that guides sperm to the egg",
        "Light, clean meals this phase — your body has important work to do and digestion shouldn't compete",
      ],
      dietAvoid: [
        "Antihistamines and decongestants if avoidable — some dry cervical mucus and reduce fertility",
        "Heavy meals before bed — quality sleep is critical for the hormonal peak driving ovulation",
      ],
      workout: [
        "Gentle walking and light movement — support circulation without stressing your body",
        "Yoga or stretching — keeps you active without the cortisol spike from high-intensity work",
        "No need to rest completely — light movement helps, extreme exertion doesn't",
      ],
      workoutAvoid: [
        "High-intensity training during your fertile window — elevated cortisol can disrupt the LH surge",
        "Anything that leaves you exhausted — your body has one job right now",
      ],
      supplements: [
        "Prenatal multivitamin — keep it consistent through this window",
        "CoQ10 200mg — cellular energy support at the moment of egg release",
        "Vitamin C 500mg — antioxidant protection for the egg",
      ],
      lifestyle: [
        "Your fertile window opens 2–3 days before ovulation and closes at egg release. The days before ovulation day are often more important than ovulation day itself.",
        "Peak fertile cervical mucus — clear, slippery, stretchy like egg white — is the most reliable sign you're at the window.",
        "If you experience one-sided cramping (Mittelschmerz), note which side — it typically alternates and confirms ovulation is happening.",
      ],
    },

    Luteal: {
      meals: {
        breakfast: "Oats with banana and pumpkin seeds — B6 and magnesium for progesterone support and stress management",
        lunch: "Chicken with roasted sweet potato and leafy greens — B vitamins to support the luteal phase hormonally",
        dinner: "Lentil dal with rice — warming, easy to digest, folate-rich in case implantation has just occurred",
      },
      dietNotes: [
        "If you're in the two-week wait, eat as though you might be pregnant — because you might be",
        "Progesterone support comes from B6, magnesium, and zinc. These matter more than any supplement this week.",
      ],
      dietAvoid: [
        "Alcohol — even before a confirmed pregnancy, the earliest days of cell division are the most sensitive",
        "Excess caffeine — worsens anxiety that already peaks in late luteal",
      ],
      workout: [
        "Gentle walks 20–30 min daily — maintains circulation and reduces stress without taxing the body",
        "Restorative yoga and stretching — progesterone is naturally relaxing; work with it",
        "Light swimming if it feels good — low impact, calming, and good for circulation",
      ],
      workoutAvoid: [
        "High-intensity training during the two-week wait — cortisol spikes impair progesterone function",
        "Anything that spikes stress hormones — your body is trying to maintain a very specific hormonal environment",
      ],
      supplements: [
        "Vitamin B6 50–100mg — supports progesterone production and reduces luteal phase PMS",
        "Magnesium glycinate 300mg — reduces anxiety and supports sleep during the two-week wait",
        "Vitex (chasteberry) 400mg if recommended by your doctor — has clinical evidence for luteal support",
      ],
      lifestyle: [
        "Stress is your biggest enemy right now. Cortisol directly competes with progesterone — the hormone your body needs most this week.",
        "Two-week-wait anxiety is normal. Build in things that genuinely calm you — not distract you, actually calm you.",
        "Light spotting 6–10 days after ovulation can be implantation bleeding — lighter, shorter, and pinkish rather than red.",
      ],
    },
  },

  stay_on_top: {
    Menstrual: {
      meals: {
        breakfast: "Warm oats with walnuts and honey — easy to digest, omega-3s for brain function at a lower-energy baseline",
        lunch: "Dal with rice or whole grain roti — grounding, blood-sugar stable, low mental load to prepare",
        dinner: "Chicken soup or a simple warm curry with vegetables — comforting and nourishing without decision fatigue",
      },
      dietNotes: [
        "Warm, cooked foods are easier on digestion this week — your gut is more sensitive during menstruation",
      ],
      dietAvoid: [
        "Refined sugar — blood sugar crashes compound the cognitive fatigue that already peaks this week",
        "Heavy meals before important work — digestion competes with focus when energy is already lower",
      ],
      workout: [
        "A 20–30 min walk — enough to clear your head and release endorphins without depleting you",
        "Gentle yoga — lowers cortisol, improves pelvic circulation, and genuinely reduces cramps",
        "No performance goals this week. Movement is medicine, not training.",
      ],
      workoutAvoid: [
        "High-intensity training — your stress tolerance is lower and the return on hard effort is minimal",
      ],
      supplements: [
        "Magnesium glycinate 300–400mg — reduces cramps, improves sleep, and directly supports cognitive function",
        "Omega-3 EPA+DHA — brain function and inflammation management",
        "Iron (if your period is heavy) — low iron is a hidden cause of cognitive fog in women",
      ],
      lifestyle: [
        "This week is strategic rest. The energy you protect now comes back doubled in follicular — plan for it.",
        "Batch your low-stakes decisions and admin work here. Reserve cognitive bandwidth for what only you can do.",
        "Your emotional attunement is actually heightened this week — you read people and situations more accurately. Different tool, same player.",
      ],
    },

    Follicular: {
      meals: {
        breakfast: "Eggs with avocado and whole grain toast — choline for focus, healthy fats for sustained morning energy",
        lunch: "Grilled chicken or tofu with quinoa and greens — high protein stabilises blood sugar, keeps you sharp all afternoon",
        dinner: "Salmon with roasted vegetables and brown rice — omega-3 for brain function, complex carbs to fuel tomorrow",
      },
      dietNotes: [
        "Consistent meals at regular times stabilise blood sugar — the single biggest factor in sustained afternoon focus",
        "Fermented foods support estrogen metabolism through the gut — a healthy microbiome helps process hormones efficiently",
      ],
      dietAvoid: [
        "Skipping meals when you're in flow — appetite dips in follicular, but your brain still needs fuel",
      ],
      workout: [
        "Match the energy — this is the phase for challenging workouts, new personal bests, and pushing your limits",
        "Exercise in the morning if possible — it amplifies the cognitive benefits of high estrogen for the rest of the day",
        "Consistency this phase sets the baseline you carry through the rest of the cycle",
      ],
      workoutAvoid: [
        "Overtraining out of enthusiasm — ride the energy, don't burn through your reserves all at once",
      ],
      supplements: [
        "B-complex — supports energy metabolism, estrogen processing, and cognitive function",
        "Vitamin D3 2000 IU — mood, focus, and immune support",
        "Omega-3 — brain function and anti-inflammatory; especially useful before intense work periods",
      ],
      lifestyle: [
        "Block your most important work for this week. Presentations, negotiations, hard conversations, new projects — schedule them here.",
        "Your verbal fluency and persuasiveness are genuinely higher now. This is the week to pitch, negotiate, and communicate what matters.",
        "New habits started in follicular have the highest success rate. If there's something you've been meaning to start, begin it today.",
      ],
    },

    Ovulatory: {
      meals: {
        breakfast: "Berry smoothie with chia seeds, spinach, and protein — antioxidants and quick fuel for a full-output day",
        lunch: "Avocado and chicken salad with whole grain — clean energy, no afternoon crash",
        dinner: "Grilled fish with steamed broccoli and rice — light, nutrient-dense, won't disrupt sleep",
      },
      dietNotes: [
        "Light, clean meals keep your energy consistent — heavy food slows you down when you should be running fast",
      ],
      dietAvoid: [
        "Excess alcohol — impairs the hormonal peak you've been building toward all cycle",
        "Heavy lunches — afternoon sluggishness is especially frustrating when your brain is at its best",
      ],
      workout: [
        "Whatever moves you most — this is peak physical and mental output, do what you love at full intensity",
        "High-energy team sports, competitive sessions, or your most challenging training — all belong here",
        "Pair hard physical output with your hardest mental challenges — they reinforce each other this week",
      ],
      workoutAvoid: [
        "Under-recovering between sessions — you can push hard on consecutive days, but sleep is non-negotiable",
      ],
      supplements: [
        "Vitamin C 500–1000mg — antioxidant support for the high output week",
        "Omega-3 — keep consistent; recovery speed is fastest now",
        "B-complex — sustained energy through the peak performance window",
      ],
      lifestyle: [
        "You have 3–4 days of peak output. Don't let them pass on admin. Put your most important move here.",
        "Schedule the meeting you've been avoiding, make the decision you've been postponing, launch the thing you've been waiting on.",
        "Your emotional intelligence peaks at ovulation — high-stakes interpersonal situations, team dynamics, difficult conversations are all best handled now.",
      ],
    },

    Luteal: {
      meals: {
        breakfast: "Whole grain toast with eggs and avocado — protein and fat prevent the mid-morning crash that tanks afternoon focus",
        lunch: "Brown rice with salmon and greens — B6 for mood stability, complex carbs prevent the serotonin dips driving irritability",
        dinner: "Sweet potato and lentil curry — grounding, blood-sugar steady, satisfying without the bloat",
      },
      dietNotes: [
        "Blood sugar stability is your biggest cognitive lever this phase. Every carb paired with protein and fat.",
        "Dark chocolate (70%+) is magnesium and genuinely satisfies cravings — this is not a guilty pleasure, it's a luteal strategy",
      ],
      dietAvoid: [
        "Refined sugar — the crash that follows amplifies irritability and tanks focus",
        "Excess caffeine — adds to the anxiety load that already peaks in late luteal",
      ],
      workout: [
        "Moderate movement — enough to maintain energy and mood, not enough to exhaust your recovery capacity",
        "Strength training at 70% — you're maintaining gains, not setting records",
        "Walking is underrated this phase — 30 min daily is enough to sustain mood and energy",
      ],
      workoutAvoid: [
        "Heavy HIIT — cortisol spike worsens PMS and adds to the stress load your system is already managing",
      ],
      supplements: [
        "Magnesium glycinate 300–400mg — reduces PMS, bloating, and supports the sleep quality that drives next-day performance",
        "Vitamin B6 50–100mg — serotonin and dopamine production when they're most likely to dip",
        "Omega-3 — anti-inflammatory support through the phase where your body runs harder",
      ],
      lifestyle: [
        "Switch from creating to completing. Finishing open tasks is your highest-leverage move this week — your brain is built for it.",
        "The inner critic is louder this phase. Decisions made through that filter tend to be too conservative. Note the feeling before acting on it.",
        "Review and plan for next cycle during luteal — you have analytical clarity, honest perspective, and less social urgency clouding your judgment.",
      ],
    },
  },

  know_my_body: {
    Menstrual: {
      meals: {
        breakfast: "Iron-rich oats with raisins and flaxseeds — your body is losing iron and needs it replaced",
        lunch: "Lentil dal with spinach and a squeeze of lime — plant iron absorbs significantly better with vitamin C",
        dinner: "Salmon or chicken with sweet potato — omega-3s reduce the prostaglandins driving your cramps",
      },
      dietNotes: [
        "Warm, cooked foods are easier to digest than raw or cold meals this week",
        "Your body is doing real work — eating more than usual is normal and appropriate",
      ],
      dietAvoid: [
        "Junk and fried food — worsens inflammation, makes cramps worse",
        "Cold drinks and raw salads — harder on your digestion when your gut is already more sensitive",
      ],
      workout: [
        "Light walking 20–30 min — reduces cramps better than complete rest by improving circulation",
        "Gentle yoga, especially hip-opening poses — relieves tension in the lower back and pelvis",
        "Foam rolling and mobility work — your body appreciates movement, just not hard movement",
      ],
      workoutAvoid: [
        "High-intensity training and heavy lifting — your body is already working hard",
      ],
      supplements: [
        "Magnesium glycinate 300mg — reduces cramps and helps you sleep better during your period",
        "Iron (if you bleed heavily) — pair with vitamin C every time",
        "Omega-3 EPA+DHA — reduces the inflammation that drives cramp severity",
      ],
      lifestyle: [
        "Your period is your body's monthly report. Changes in flow, colour, or pain level are worth noting — not ignoring.",
        "Rest is not weakness this week. It's the right response to what your body is doing.",
        "Heat on your lower belly directly relaxes the uterine muscle. It works because of physiology, not placebo.",
      ],
    },

    Follicular: {
      meals: {
        breakfast: "Eggs with whole grain toast and avocado — protein, healthy fats, and sustained energy through the morning",
        lunch: "Chicken or tofu with quinoa and roasted vegetables — balanced and filling without the afternoon crash",
        dinner: "Salmon with brown rice and greens — building blocks for the hormonal rise happening right now",
      },
      dietNotes: [
        "Fermented foods — yogurt, kimchi, kefir — support the gut bacteria that help process estrogen efficiently",
      ],
      dietAvoid: [
        "Refined sugar in excess — disrupts the hormonal balance you're building toward ovulation",
      ],
      workout: [
        "This is your highest-energy phase — use it. Strength training, cardio, anything you've been meaning to try",
        "Coordination and learning are sharpest now — good time to learn a new sport, movement, or skill",
        "Your body recovers faster from hard sessions — you can do more and bounce back quicker",
      ],
      workoutAvoid: [
        "Under-eating while training hard — appetite dips in follicular but energy demands are high",
      ],
      supplements: [
        "B-complex — energy metabolism and estrogen processing",
        "Vitamin D3 2000 IU — mood, immunity, and bone health",
        "Zinc — supports the hormonal processes happening right now",
      ],
      lifestyle: [
        "The rising energy you feel in follicular is estrogen-driven — it's chemistry, not mood. Use it for the things that feel too hard at other times of the month.",
        "Your skin is clearer and more resilient this week. Better time to try new products than in luteal.",
        "New habits formed now have a higher success rate. Your motivation and dopamine response are both higher.",
      ],
    },

    Ovulatory: {
      meals: {
        breakfast: "Berry smoothie with chia seeds, spinach, and protein — antioxidant support for peak hormonal activity",
        lunch: "Avocado salad with eggs and whole grains — healthy fats and fibre to support estrogen clearance",
        dinner: "Grilled fish with steamed broccoli and rice — light, nutrient-dense, and easy on digestion",
      },
      dietNotes: [
        "Cruciferous vegetables — broccoli, cauliflower, kale — support your liver in processing peak estrogen levels",
        "Stay well-hydrated. Cervical mucus changes this week and hydration directly affects it.",
      ],
      dietAvoid: [
        "Excess alcohol — puts extra load on the liver when it's already processing peak estrogen",
      ],
      workout: [
        "Your physical peak arrives with ovulation — it's real, not imagined. Push if you feel like pushing.",
        "Pain tolerance peaks now. Good time for anything you've been avoiding because it felt too hard.",
        "Social energy peaks too — this is the phase for group classes, team sports, and things you do with people",
      ],
      workoutAvoid: [
        "Skipping warm-up when you feel invincible — estrogen increases ligament flexibility and with it, injury risk",
      ],
      supplements: [
        "Vitamin C 500mg — antioxidant support during peak hormonal activity",
        "Vitamin E — protective for egg quality and general hormonal health",
        "CoQ10 — cellular energy when you're running at your highest",
      ],
      lifestyle: [
        "This window lasts 3–4 days and comes every single cycle. Most people miss it because they don't track it.",
        "Communication peaks at ovulation — verbal fluency, persuasiveness, and reading others all improve. Use it.",
        "Decision-making is different here — more confident, less second-guessing. Notice that when it happens.",
      ],
    },

    Luteal: {
      meals: {
        breakfast: "Banana oat pancakes with pumpkin seeds — magnesium to reduce PMS and blood sugar stays steady",
        lunch: "Salmon with brown rice and leafy greens — B vitamins for mood, omega-3 to keep inflammation down",
        dinner: "Sweet potato and lentil curry with dark chocolate after — comforting, anti-craving, and actually satisfying",
      },
      dietNotes: [
        "Your metabolism is running harder — your body burns more calories at rest. Eating more this week is appropriate.",
        "Complex carbs are your friend, not your enemy. Your brain is using them to make serotonin.",
      ],
      dietAvoid: [
        "Refined sugar — the crash that follows makes PMS significantly worse",
        "Excess salt — worsens the bloating progesterone is already causing",
        "Excess caffeine — adds to anxiety that already peaks in late luteal",
      ],
      workout: [
        "Moderate strength training, walking, yoga, or Pilates — movement that feels good, not movement that depletes you",
        "Focus on how you feel, not the numbers. This phase has different parameters.",
        "Final week before your period: scale back. This isn't giving up — it's smart programming.",
      ],
      workoutAvoid: [
        "Pushing through exhaustion to hit the same numbers as last week — those numbers were ovulatory you",
      ],
      supplements: [
        "Magnesium glycinate 300–400mg — evidence-backed for reducing PMS severity across the board",
        "Vitamin B6 50–100mg — supports serotonin and dopamine when progesterone drops them",
        "Chasteberry (Vitex) 400mg — may ease PMS symptoms over multiple cycles",
      ],
      lifestyle: [
        "The lower energy and inward pull of the luteal phase is progesterone — not laziness, not depression.",
        "Journalling, planning, and reviewing work well now. Your brain is detail-oriented and analytical.",
        "Track your mood and energy each day. After 3 cycles you'll see your personal pattern clearly — and that pattern is more useful than any generic advice.",
      ],
    },
  },
};

// ─── Expert tip pools ─────────────────────────────────────────────────────────

const expertTipPool: Record<Phase, string[]> = {
  Menstrual: [
    "Your period is not a test of willpower. If you're not hitting your usual output, your body is doing heavy work right now. Respect what it's telling you.",
    "Prostaglandins cause cramps and also trigger inflammation throughout the body — joint aches, gut sensitivity, and fatigue are all connected, not random.",
    "Magnesium drops before your period and low magnesium worsens cramps, poor sleep, and anxiety. Dark chocolate, pumpkin seeds, and bananas aren't cravings — they're your body asking for what it needs.",
    "Light movement reduces cramps better than rest alone. A 20-minute walk increases circulation and releases endorphins. You don't need to do nothing — you need to do less.",
    "Your core temperature is lower during menstruation. Warm meals, warm drinks, and heat on your lower belly feel instinctively right because they genuinely work.",
    "Sleep disruption peaks during your period as progesterone drops its natural sedative effect. If you're waking at night or sleeping poorly, this is the reason — not stress, not your phone.",
    "Omega-3 fatty acids directly reduce prostaglandin production. More omega-3s during menstruation means less cramping at the source, not just masking the symptom.",
  ],
  Follicular: [
    "Estrogen rises steadily through the follicular phase — serotonin, dopamine, and pain tolerance all follow. The optimism and energy you feel are chemistry, not mood. Use them.",
    "This is the best phase to start a new training programme. Your body is primed to learn movement patterns — coordination and skill acquisition peak now.",
    "Muscle protein synthesis responds best to training when estrogen is high. If you're trying to build strength, this is your best window. Your body adapts faster.",
    "New habits formed in the follicular phase have a higher chance of sticking. Dopamine sensitivity is elevated — rewards feel more rewarding and motivation arrives more easily.",
    "Your verbal fluency, working memory, and problem-solving ability all rise with estrogen. Schedule your most demanding mental work here.",
    "Fermented foods support estrogen metabolism through the gut. The bacteria in your microbiome actively process estrogen — a healthy gut helps reduce excess that causes symptoms later.",
    "Your resting heart rate tends to be lower in the follicular phase — your cardiovascular system is more efficient. If you track HRV or resting HR, expect better numbers now.",
  ],
  Ovulatory: [
    "Testosterone peaks just before ovulation alongside peak estrogen. This is the only time in your cycle when both are simultaneously high — the confidence, drive, and social ease you feel right now are real.",
    "Your VO2 max is measurably higher around ovulation. Aerobic capacity and endurance are genuinely improved — not just perceived. Plan your hardest sessions for this window.",
    "Verbal fluency peaks at ovulation. Research shows women are more persuasive and communicate more effectively in this window. Your best presentations and negotiations belong here.",
    "Recovery from hard training is faster at ovulation than any other phase. You can push hard on consecutive days without the accumulated fatigue that follows in luteal.",
    "Your sense of smell and ability to read people peak at ovulation. You're more attuned to social signals this week — it's biological, not imagination.",
    "Strength training at ovulation builds muscle most efficiently due to peak testosterone and growth hormone. Same effort, better result.",
  ],
  Luteal: [
    "Progesterone is the dominant hormone of the luteal phase — calming, sedative, and temperature-raising. The drowsiness and desire for quiet aren't laziness. Progesterone has a measurable sedative effect.",
    "Your basal metabolic rate increases by 100–300 calories per day in the luteal phase. Eating more isn't giving in — it's meeting a genuine metabolic demand.",
    "PMS worsens significantly when blood sugar is unstable. Every refined sugar and carb eaten alone in the luteal phase creates a crash that amplifies irritability, fatigue, and cravings.",
    "Magnesium depletion worsens PMS. Women with PMS tend to have lower magnesium. 300–400mg of magnesium glycinate in the 10 days before your period can measurably reduce severity.",
    "The luteal phase is actually productive for deep, focused work — just different work. Detail-oriented tasks, editing, analysis, and finishing things suit progesterone-dominant brain states.",
    "Heavy HIIT spikes cortisol, which competes with progesterone in the luteal phase. Reducing HIIT specifically is the most effective single training adjustment for reducing PMS severity.",
    "Tracking your mood, energy, and symptoms in the luteal phase for 3 cycles reveals your personal PMS pattern. That data is more useful than any generic advice.",
  ],
};

const goalExpertTipPool: Partial<Record<string, Partial<Record<Phase, string[]>>>> = {
  start_a_family: {
    Menstrual: [
      "Your period is a fertility diagnostic. Flow, colour, duration, and pain level all carry information. Tracking these over 3 cycles gives you and your doctor a clearer picture than a single appointment.",
      "Iron lost during menstruation directly impacts egg quality. Pairing iron sources with vitamin C — spinach with lemon, red meat with peppers — triples absorption. If you're trying to conceive, this matters.",
      "Omega-3s reduce cramps but also support the anti-inflammatory environment eggs develop in. Fish oil or algae-based DHA is one of the highest-value supplements for conception — start now.",
      "The follicle that will ovulate this cycle is being selected right now. What you eat and how much you sleep during your period has a longer reach than most people realise.",
      "Period pain that is worsening over time is not something to accept. It may indicate endometriosis, which affects fertility in 30–50% of cases. Earlier investigation leads to better outcomes.",
    ],
    Follicular: [
      "The follicle developing right now contains the egg that may be fertilised this cycle. CoQ10 at 200–400mg supports mitochondrial function in developing follicles — egg quality improvement starts here.",
      "Folic acid prevents neural tube defects in the earliest weeks of pregnancy, often before a woman knows she's pregnant. 400–800mcg daily is the recommendation. If you're not taking it, start today.",
      "Stress suppresses GnRH — the hormone that drives ovulation. Chronic high cortisol can delay or prevent ovulation entirely. Managing stress is not optional wellness advice, it's fertility strategy.",
      "Vitamin D deficiency is linked to PCOS, endometriosis, and reduced success across fertility treatments. If you haven't tested your levels, it's one of the most worthwhile things to check.",
      "Antioxidants — vitamin C, vitamin E, CoQ10 — protect egg quality from oxidative stress. The 3 months before conception matter as much as the conception window. What you're eating now influences the egg that will ovulate.",
    ],
    Ovulatory: [
      "Your egg is viable for 12–24 hours after ovulation, but sperm survive up to 5 days in fertile cervical mucus. The 2–3 days before ovulation are often more important than ovulation day itself.",
      "Cervical mucus at peak fertility — clear, slippery, stretchy like egg white — guides sperm toward the egg. Staying well-hydrated supports this. Some antihistamines dry cervical mucus and reduce fertility.",
      "After ovulation, the ruptured follicle becomes the corpus luteum, producing the progesterone needed to support early pregnancy. The quality of your follicular phase nutrition directly influences this structure.",
      "Both partners' lifestyle in the 90 days before conception affects embryo quality. Sperm take approximately 72 days to mature. Conception is a 3-month preparation, not a single-day event.",
    ],
    Luteal: [
      "If conception occurred, implantation typically happens 6–10 days after ovulation. Progesterone is critical for this process — low luteal-phase progesterone is a common reason for early pregnancy loss.",
      "Vitamin B6 supports progesterone production and reduces PMS symptoms. Women with short luteal phases or low progesterone often benefit from B6 at 50–100mg alongside vitex.",
      "Two-week-wait anxiety is real, but cortisol actively impairs progesterone function. High stress increases early pregnancy loss risk through a specific hormonal mechanism. Protect this window deliberately.",
      "Light spotting 6–10 days after ovulation can be implantation bleeding — lighter, shorter, and pinkish rather than red. If you're trying to conceive, it's worth noting rather than assuming your period started.",
    ],
  },

  train_smarter: {
    Menstrual: [
      "Prostaglandins spike at period start and slow muscle repair. Mobility and light movement now set up better performance in follicular than pushing through at reduced output.",
      "Iron loss during heavy periods directly reduces oxygen-carrying capacity in the following weeks. Consistent iron-rich eating during menstruation is sport-specific recovery nutrition.",
      "Pain tolerance is at its lowest during menstruation. Perceived exertion will be higher for the same effort. Train by feel this week, not by numbers — the numbers will return in follicular.",
      "Muscle protein synthesis is still active during menstruation but anabolic signals are weaker. Maintenance volume at lower intensity is smarter than a complete rest week.",
      "Running economy and VO2 max are measurably lower during your period. Endurance athletes notice a drop in pace at the same RPE. It's not fitness loss — it reverses completely by day 7–8.",
    ],
    Follicular: [
      "Muscle protein synthesis peaks when estrogen is high. The same training stimulus produces more adaptation than at any other phase. This is when you earn the gains you'll maintain through the cycle.",
      "Estrogen acts as a muscle protector — reducing exercise-induced damage and accelerating repair. DOMS hits harder in the luteal phase after identical sessions. Push harder now.",
      "New motor patterns are learned faster when estrogen is elevated. If there's a lift you've been trying to improve, schedule the skill work now. Neural adaptation happens more efficiently in this window.",
      "Creatine monohydrate is the most evidence-backed supplement for female athletes — it increases power output, speeds recovery, and has emerging evidence for cognitive and bone health. 5g daily.",
      "Your pain threshold rises significantly in follicular. This is the window for lactate threshold training, heavy compound work, and anything requiring tolerance of discomfort.",
    ],
    Ovulatory: [
      "VO2 max is measurably higher around ovulation — not just perceived. This is the window for time trials, races, and any test you need accurate performance data from.",
      "Testosterone peaks alongside estrogen just before ovulation. This combination drives power, explosiveness, and force development. 1RM attempts, sprint tests, and maximal efforts all belong here.",
      "Recovery speed from hard training is fastest at ovulation. You can train hard on consecutive days without the accumulated fatigue you'd experience in luteal.",
      "Female ACL injury rates are highest around ovulation — high estrogen increases ligament laxity. Prioritise landing mechanics, single-leg stability, and hip activation before your heaviest sessions.",
    ],
    Luteal: [
      "Your core temperature is 0.2–0.5°C higher in luteal. This impairs thermoregulation, increases perceived exertion, and makes endurance work feel harder at the same pace. Train by RPE, not pace or HR targets.",
      "Heavy HIIT spikes cortisol, which competes with progesterone for receptor binding. Women who maintain high-intensity training all cycle long tend to have measurably worse PMS. Reducing HIIT specifically is the most effective adjustment.",
      "Muscle protein breakdown exceeds anabolism in the luteal phase. Maintenance — not growth — is the realistic goal. Volume reduction is managing recovery capacity, not losing fitness.",
      "Deep sleep decreases in luteal as progesterone peaks then drops sharply. Poor sleep has a direct, measurable impact on strength output and training motivation. Prioritising sleep over an extra session is the right call.",
      "If you consistently feel terrible in late luteal — fatigue, low motivation, poor performance — this is a signal. Planned deloads aligned with the late luteal phase are the most impactful periodisation upgrade female athletes almost never make.",
    ],
  },

  stay_on_top: {
    Menstrual: [
      "Rest during menstruation is strategic, not passive. Women who protect their energy this week consistently outperform in follicular when cognitive output genuinely peaks.",
      "Your stress tolerance is lower this week — not your capability. High-stakes decisions under pressure are best deferred to follicular if you have that option.",
      "If you're in a leadership role, emotional attunement is actually heightened during your period — you read people and situations more accurately. Low energy doesn't mean low effectiveness.",
      "Sleep quality during menstruation has a larger-than-normal impact on next-day cognitive performance. The cost of poor sleep compounds at this lower-energy baseline.",
    ],
    Follicular: [
      "Dopamine sensitivity peaks in follicular. Tasks that feel difficult at other times feel more manageable now — not because they've changed, but because your reward circuitry is more responsive.",
      "Verbal fluency genuinely increases with rising estrogen. More words per minute, better word retrieval, higher persuasiveness in spoken communication. Schedule your presentations and negotiations here.",
      "Divergent thinking peaks in follicular — the ability to generate multiple solutions and make novel connections. If you have a problem that needs fresh perspective, brainstorm it now.",
      "Starting new projects, habits, and initiatives in follicular leverages your natural dopaminergic peak. Don't launch what matters most during luteal.",
      "Your brain's error-detection is sharpest in follicular. Proofreading, auditing, and reviewing important work for mistakes is done most accurately in this window.",
    ],
    Ovulatory: [
      "Your peak performance window is 3–4 days and comes every single cycle. Women who know it and plan around it operate at a measurably higher level.",
      "Testosterone and estrogen are simultaneously high at ovulation. The confidence-assertiveness-verbal fluency combination that only exists in this window is real. Treat it accordingly.",
      "Decision-making changes at ovulation — you're more likely to take calculated risks and commit to a direction. If you've been waiting for the right moment to make a call, this is it.",
      "Emotional intelligence peaks at ovulation — reading facial expressions, detecting emotional tone, interpreting group dynamics. High-stakes interpersonal situations belong here.",
    ],
    Luteal: [
      "The inner critic amplifies in the luteal phase. Your brain is not being objective — it's being cautious. Decisions made through this filter tend to be overly conservative. Recognise the pattern.",
      "Detail-oriented work is genuinely superior in luteal. Proofreading, auditing, analytical deep-dives all benefit from the tighter focus and reduced distractibility of a progesterone-dominant brain.",
      "Your stress threshold decreases in late luteal — the same workload feels heavier. Reducing meeting load, delegating, and protecting uninterrupted focus time matters more this week.",
      "Planning for the next cycle is best done in luteal. You have analytical clarity, reduced social urgency, and honest perspective on what worked. Review and restructure, don't perform.",
    ],
  },
};

const GOAL_TIP_PRIORITY = ["start_a_family", "train_smarter", "stay_on_top"] as const;

// ─── Main export ──────────────────────────────────────────────────────────────

export function getRecommendations(
  status: CycleStatus,
  profile: any
): DailyRecommendation {
  const { currentPhase, dayOfCycle } = status;
  const goals: string[] = profile?.goals ?? ["know_my_body"];
  const primaryGoal = goals[0] ?? "know_my_body";
  const conditions: string[] = profile?.conditions ?? [];
  const hasPCOS = conditions.includes("PCOS") || conditions.includes("PCOD");

  // Pull goal-specific recs, fall back to know_my_body base
  const base = goalRecs[primaryGoal]?.[currentPhase] ?? goalRecs["know_my_body"][currentPhase];

  const recs: DailyRecommendation = {
    ...base,
    dietNotes: [...base.dietNotes],
    dietAvoid: [...base.dietAvoid],
    workout: [...base.workout],
    workoutAvoid: [...base.workoutAvoid],
    supplements: [...base.supplements],
    lifestyle: [...base.lifestyle],
    expertTip: "",
  };

  // Expert tip: goal-specific pool if available, else general phase pool
  const activeGoal = GOAL_TIP_PRIORITY.find((g) => goals.includes(g));
  const tipPool =
    (activeGoal && goalExpertTipPool[activeGoal]?.[currentPhase]) ??
    expertTipPool[currentPhase];
  recs.expertTip = tipPool[(dayOfCycle - 1) % tipPool.length];

  // PCOS modifier
  applyPCOS(recs, currentPhase, hasPCOS);

  return recs;
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
    "High insulin drives androgen production in PCOS — food pairing (protein + fibre + fat at every meal) is your most powerful lever. Prioritise strength training 3–4x/week over excessive cardio.";
}
