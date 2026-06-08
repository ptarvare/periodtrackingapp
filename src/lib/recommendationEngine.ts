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

// Goal-specific expert tip pools — Priya speaks directly to the user's goal
const goalExpertTipPool: Partial<Record<string, Partial<Record<Phase, string[]>>>> = {
  start_a_family: {
    Menstrual: [
      "Your period is a fertility diagnostic. Heavy, very light, or irregular periods each tell a different story about your hormonal health. Consistent tracking over 3 cycles gives you and your doctor the clearest picture of what's actually happening.",
      "Iron loss during menstruation directly impacts egg quality and reproductive health. Pairing iron sources with vitamin C — spinach with lemon, red meat with peppers — triples absorption. If you're trying to conceive, this isn't optional.",
      "Omega-3s reduce the prostaglandins causing your cramps, but they also support the anti-inflammatory environment needed for implantation. Fish oil or algae-based DHA is one of the highest-ROI supplements for conception — start now if you haven't.",
      "Your uterine lining is shedding and rebuilding this week. The quality of this rebuild is influenced by what you eat now — iron, folate, and B12 are the critical nutrients for healthy endometrial tissue development.",
      "Period pain that is worsening or affecting your daily life is not normal — it may indicate endometriosis, which affects fertility in roughly 30–50% of cases. If this describes you, earlier investigation leads to better outcomes.",
      "The follicle that will ovulate this cycle is being selected right now. What you eat and how much you sleep during your period influences its development. Rest and nourishment this week have a longer reach than most people realise.",
      "Alcohol during menstruation increases the liver's estrogen clearance burden. For women trying to conceive, this is the lowest-return week for drinking — your body has more important work to do.",
    ],
    Follicular: [
      "The follicle that will release your egg this month is developing right now. CoQ10 at 200–400mg supports mitochondrial function in developing follicles — egg quality improvement starts here, not at ovulation.",
      "Estrogen rising in the follicular phase stimulates cervical mucus production. Noticing how your discharge changes — from dry to creamy to clear and stretchy — is free, accurate ovulation tracking that no app can replicate.",
      "Folic acid prevents neural tube defects in the earliest weeks of pregnancy, often before a woman knows she's pregnant. 400–800mcg daily is the current recommendation. If you're trying to conceive and not taking this yet, start today.",
      "Stress suppresses GnRH, the hormone that drives LH and FSH — the signals that trigger ovulation. Chronic high cortisol can delay or prevent ovulation entirely. Managing stress is not optional wellness advice — it is fertility advice.",
      "Vitamin D deficiency is linked to PCOS, endometriosis, and reduced success rates across fertility treatments. If you haven't tested your levels recently, it's one of the most worthwhile tests to run. Most people in indoor jobs are deficient year-round.",
      "Your fertile window is 5–6 days wide, closing at ovulation. Tracking LH strips, basal body temperature, and cervical mucus together gives the most accurate prediction — no single method catches every cycle correctly.",
      "Antioxidants — vitamin C, vitamin E, CoQ10, selenium — protect egg quality from oxidative stress. The 3 months before conception matter as much as the conception window itself. What you're eating now is influencing the egg that will ovulate.",
    ],
    Ovulatory: [
      "Your egg is viable for 12–24 hours after ovulation, but sperm can survive up to 5 days in fertile cervical mucus. The 2–3 days before ovulation are often more important than ovulation day itself — don't focus on a single day.",
      "Ovulation strips detect the LH surge 24–36 hours before egg release. A positive test means the window is opening — sex that day and the day after gives the highest probability, but the day before is equally important.",
      "Cervical mucus at peak fertility — clear, slippery, and stretchy like egg white — creates channels that guide sperm toward the egg. Staying well-hydrated supports this. Some antihistamines and decongestants dry cervical mucus and reduce fertility.",
      "Mittelschmerz — the one-sided cramping at ovulation — is a reliable fertility sign for women who experience it. It's caused by follicle rupture or fluid irritating the peritoneum. Note which side it's on — it typically alternates each cycle.",
      "After ovulation, the ruptured follicle becomes the corpus luteum, which produces progesterone. The quality of this structure — influenced by your follicular phase nutrition and sleep — determines whether you produce enough progesterone to support early pregnancy.",
      "Both partners' lifestyle in the 90 days before conception affects embryo quality. Sperm take approximately 72 days to mature and are influenced by diet, sleep, and stress the entire time. Conception is a 3-month preparation, not a single-day event.",
    ],
    Luteal: [
      "If conception occurred, the embryo is travelling toward the uterus right now. Implantation typically happens 6–10 days after ovulation. Progesterone is critical for this process — low luteal-phase progesterone is a common reason for early pregnancy loss.",
      "Vitamin B6 supports progesterone production and reduces PMS symptoms. Women trying to conceive with short luteal phases or low progesterone often benefit from B6 at 50–100mg alongside chasteberry (vitex) — both have clinical evidence for luteal support.",
      "Alcohol in the luteal phase — even before a confirmed pregnancy — carries risk if you're actively trying to conceive. Implantation and earliest cell division are the most sensitive periods to environmental factors.",
      "Two-week-wait anxiety is real, but cortisol actively impairs progesterone function. High stress increases early pregnancy loss risk — not as a vague possibility, but through a specific hormonal mechanism. Protect this window deliberately.",
      "Light spotting 6–10 days after ovulation can be implantation bleeding — lighter, shorter, and pinkish rather than red. It doesn't occur in all pregnancies, but if you're trying to conceive, it's worth noting rather than assuming your period has started.",
      "The corpus luteum sustains early pregnancy until the placenta takes over at around 8–10 weeks. Its quality is determined by the follicular phase that built it. A well-nourished, low-stress follicular phase builds a more robust corpus luteum.",
    ],
  },

  train_smarter: {
    Menstrual: [
      "Prostaglandins spike at period start and drive inflammation that slows muscle repair and reduces coordination. This isn't bad training — it's the wrong training. Mobility and light movement now set up better performance in the follicular phase than pushing through at reduced output.",
      "Iron loss during heavy periods directly reduces oxygen-carrying capacity in the following weeks. Female athletes with heavy periods are often in a mild iron-deficiency state by cycle end without knowing it. Consistent iron-rich eating during menstruation is sport-specific recovery nutrition.",
      "Pain tolerance is at its lowest during menstruation due to low estrogen and elevated prostaglandins. Perceived exertion will be higher for the same absolute effort. Train by feel this week, not by numbers — and expect those numbers to return strongly in the follicular phase.",
      "Muscle protein synthesis is still active during menstruation — you haven't lost the ability to build muscle. But anabolic signals are weaker and inflammation is higher. Maintenance volume at lower intensity is the smart choice, not a complete rest week.",
      "Running economy and VO2 max are measurably lower during menstruation. Endurance athletes notice this as a drop in pace at the same RPE. It is not fitness loss. It's cycle-related physiology that will fully reverse by day 7–8.",
      "Your core temperature is lower during menstruation. Connective tissue takes longer to warm up and is less pliable until you've been moving for 10+ minutes. Add 5 minutes to your warm-up this week and reduce soft tissue injury risk during a phase where the reward for hard training is low.",
    ],
    Follicular: [
      "Muscle protein synthesis peaks in the follicular phase when estrogen is high. The same training stimulus produces more adaptation than at any other phase. This is when you earn the gains you'll maintain through the rest of the cycle — don't squander this window.",
      "Estrogen acts as a muscle protector by reducing exercise-induced muscle damage and accelerating repair. DOMS hits harder in the luteal phase than follicular after identical sessions. You can push harder now with less downside.",
      "New motor patterns are learned faster when estrogen is elevated. If there's a lift you've been trying to improve — your snatch, squat depth, clean technique — schedule the skill work now. Neural adaptation happens more efficiently in this window.",
      "Joint laxity increases with rising estrogen, which enhances range of motion and is great for squatting deeper and working through full range. It also increases injury risk without proper stability work. Activate your stabilisers before loading heavy.",
      "Appetite suppression from rising estrogen is a performance trap. You're training harder and recovering faster, but potentially eating less than your body needs. If your strength is plateauing, the answer is almost always fuel — not more training.",
      "Creatine monohydrate is the most evidence-backed supplement for female athletes: it increases power output, speeds recovery, and has emerging evidence for cognitive and bone health. 5g daily, taken consistently — the follicular phase is the best time to start.",
      "Your pain threshold rises significantly in the follicular phase. This is the window for lactate threshold training, heavy compound work, and anything requiring tolerance of discomfort. Your nervous system can handle effort that would be counterproductive in the luteal phase.",
    ],
    Ovulatory: [
      "VO2 max is measurably higher around ovulation — not just perceived, but actual aerobic capacity. This is the window for time trials, races, or any test you need accurate performance data from. Plan your benchmarks here.",
      "Testosterone peaks alongside estrogen just before ovulation. This combination drives power, explosiveness, and rate of force development more than either hormone alone. Your 1RM attempts, sprint tests, and maximal efforts all belong in this window.",
      "Recovery speed from hard training is fastest at ovulation. Estrogen modulates post-exercise inflammation and repair signals are strongest. You can train hard on consecutive days without the accumulated fatigue you'd experience in the luteal phase.",
      "Female ACL injury rates are 2–8x higher than male rates, with the highest risk clustering around ovulation. High estrogen increases ligament laxity. Prioritise landing mechanics, single-leg stability, and hip activation before your heaviest sessions — the risk is real and well-documented.",
      "Strength training at ovulation builds muscle most efficiently due to peak testosterone and growth hormone. The same programme done across all phases gets better results if the most demanding sessions fall here. Periodising to your cycle isn't a trend — it's applied physiology.",
      "Glycogen storage and utilisation are most efficient around ovulation. Higher-carbohydrate fuelling before and after training works best now. Save lower-carb protocols for the luteal phase, when fat oxidation naturally increases.",
    ],
    Luteal: [
      "Your core temperature is 0.2–0.5°C higher in the luteal phase due to progesterone. This impairs thermoregulation, increases perceived exertion, and makes endurance work feel harder at the same pace. Training by RPE is more accurate than chasing pace or HR targets this phase.",
      "Progesterone stimulates breathing rate, so you'll feel more breathless at the same effort. VO2 max declines slightly and endurance performance drops. This is not a fitness setback — it reverses completely by day 3–4 of your next cycle.",
      "Heavy HIIT spikes cortisol, which competes with progesterone for receptor binding. Women who maintain high-intensity training through the entire cycle tend to have measurably worse luteal symptoms — more PMS, worse sleep, higher anxiety. Reducing HIIT specifically is the most effective training adjustment.",
      "Muscle protein breakdown exceeds anabolism in the luteal phase. Maintenance, not growth, is the realistic goal. This is why volume reduction makes sense: you are managing recovery capacity, not losing fitness.",
      "Carbohydrate cravings in the luteal phase reflect your body's increased reliance on glucose as training fuel. Complex carbs before training and protein immediately after matter more this phase than any other. Don't skip pre-workout food because you're trying to eat less.",
      "Deep sleep decreases in the luteal phase as progesterone peaks and then drops sharply. Poor recovery from sleep has a direct, measurable impact on strength output, reaction time, and training motivation. Prioritising sleep over an extra training session is the right call this week.",
      "If you consistently feel terrible in late luteal — fatigue, low motivation, poor performance — this is a signal, not a mental block. Planned deload weeks aligned with the late luteal phase are the most impactful periodisation upgrade female athletes almost never make.",
    ],
  },

  stay_on_top: {
    Menstrual: [
      "Rest during menstruation is strategic, not passive. Women who protect their energy this week consistently outperform in the follicular phase when cognitive output genuinely peaks. Treat this as a deliberate investment in next week's performance.",
      "Your working memory may feel slower during menstruation — not because your brain is performing worse, but because pain and fatigue are consuming cognitive bandwidth. Removing unnecessary decisions and administrative load this week preserves capacity for what actually matters.",
      "The clarity you may feel about problems during your period — what's not working, what needs to change — is real. Lower estrogen reduces social smoothing and people-pleasing, making honest internal assessment easier. Use this window for genuine review, not performance.",
      "Chronobiology research shows that women's cortisol response to stress is higher during menstruation. Your stress tolerance is lower right now — not your capability. High-stakes decisions under pressure are best deferred to follicular if you have that option.",
      "If you're a manager or in a leadership role, emotional attunement is actually heightened during your period — you read people and situations more accurately. Low energy doesn't mean low effectiveness. Different tools are available; know which ones to use.",
      "Sleep quality during menstruation has a larger-than-normal impact on next-day cognitive performance. Protect it — earlier bedtime, cooler room, no screens. The cognitive cost of poor sleep compounds at this lower-energy baseline.",
    ],
    Follicular: [
      "Dopamine sensitivity peaks in the follicular phase. Tasks that feel difficult or tedious at other times feel more manageable now — not because they've changed, but because your reward circuitry is more responsive. This is the week to tackle what you've been avoiding.",
      "Verbal fluency genuinely increases with rising estrogen — it's not just confidence. Research documents more words per minute, better word retrieval, and higher persuasiveness in spoken communication. Schedule your presentations, negotiations, and important conversations here.",
      "Divergent thinking — the ability to generate multiple solutions and make novel connections — peaks in the follicular phase. If you have a problem that needs fresh perspective, brainstorm it now. The luteal phase will be better for filtering and deciding from among those ideas.",
      "Working memory capacity is higher when estrogen is elevated. You can hold more in active processing without writing it down. Use this for strategy development, learning, and the mental heavy lifting of your work.",
      "Starting new projects, habits, and relationships in the follicular phase leverages your natural dopaminergic peak. Habit formation requires repeated motivation in the early stages — motivation is highest here. Don't launch what matters in the luteal phase.",
      "The follicular phase is your best window for difficult negotiations, salary conversations, or any situation requiring assertiveness. High estrogen increases social confidence, reduces social anxiety, and enhances your ability to read and influence a room.",
      "Your brain's error-detection and self-monitoring performance — the anterior cingulate cortex — is sharpest in the follicular phase. Proofreading, auditing, quality-checking, and reviewing important work for mistakes is done most accurately in this window.",
    ],
    Ovulatory: [
      "Your peak performance window is 3–5 days and arrives every single cycle. Women who know it and plan around it operate at a measurably higher level than those who don't. Block your calendar now — protect this window for your most important work.",
      "Communication efficiency peaks at ovulation. Research documents cleaner delivery, more persuasive framing, and more effective reading of the room. Your best presentations, board meetings, and key conversations belong here.",
      "Testosterone and estrogen are simultaneously high at ovulation — a combination that only occurs in this window. It drives the confidence-assertiveness-verbal-fluency combination that makes this the highest-output period of your cycle. Treat it accordingly.",
      "Decision-making changes at ovulation — you're more likely to take calculated risks and commit to a direction. If you've been waiting for the right moment to make a call you keep postponing, this is that window.",
      "Emotional intelligence — reading facial expressions, detecting emotional tone, interpreting group dynamics — peaks at ovulation. High-stakes interpersonal situations, team dynamics issues, and anything requiring social acuity is best handled now.",
    ],
    Luteal: [
      "The luteal phase rewards convergent thinking — evaluating, deciding, editing, and completing — rather than generating new ideas. Redirect energy toward finishing what's open. Completion is your most productive output this phase.",
      "The inner critic amplifies in the luteal phase. Progesterone heightens threat detection and negative self-assessment. Your brain is not being objective — it is being cautious. Decisions made through this filter tend to be overly conservative. Recognise the pattern before acting on it.",
      "Detail-oriented work is genuinely superior in the luteal phase. Proofreading, auditing, reviewing work for errors, and analytical deep-dives benefit from the tighter focus and reduced distractibility of a progesterone-dominant brain state.",
      "Your stress threshold decreases in the late luteal phase — the same workload feels heavier. This is hormonal, not motivational. Reducing meeting load, delegating, and protecting uninterrupted focus time matters more this week than any other.",
      "Planning for the next cycle is best done in the luteal phase. You have analytical clarity, reduced social urgency, and honest perspective on what worked. Use this time to review and restructure — not to perform.",
      "If you consistently make decisions you later regret — taking on too much, committing under pressure — check where those decisions fall in your cycle. Luteal-phase decision fatigue is real, systematically underestimated, and entirely manageable once you see the pattern.",
    ],
  },
};

const GOAL_TIP_PRIORITY = ["start_a_family", "train_smarter", "stay_on_top"] as const;

export function getRecommendations(
  status: CycleStatus,
  profile: any
): DailyRecommendation {
  const { currentPhase, dayOfCycle } = status;
  const goals: string[] = profile?.goals ?? ["know_my_body"];
  const conditions: string[] = profile?.conditions ?? [];
  const hasPCOS = conditions.includes("PCOS") || conditions.includes("PCOD");

  const recs = baseRecs(currentPhase);

  // Select expert tip pool: goal-specific if available, else general phase pool
  const activeGoal = GOAL_TIP_PRIORITY.find((g) => goals.includes(g));
  const pool =
    (activeGoal && goalExpertTipPool[activeGoal]?.[currentPhase]) ??
    expertTipPool[currentPhase];
  recs.expertTip = pool[(dayOfCycle - 1) % pool.length];

  applyPCOS(recs, currentPhase, hasPCOS);
  applyGoals(recs, currentPhase, goals);

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
  goals: string[]
): void {
  const tips: string[] = [];

  if (goals.includes("start_a_family")) {
    recs.dietNotes.push("Focus on folate-rich foods — leafy greens, legumes, fortified grains — essential for conception and early fetal development");
    recs.supplements.push(
      "Prenatal multivitamin with folate (400–800 mcg) — start before conception*",
      "CoQ10 (200–600 mg) — supports egg quality*"
    );
    if (phase === "Ovulatory") {
      recs.lifestyle.push("Your fertile window is now — this is the most important phase if you're trying to conceive");
      tips.push("🌱 You're in your fertile window. If you're trying to conceive, now is the time. Focus on rest, gentle movement, and nourishing foods.");
    } else if (phase === "Follicular") {
      tips.push("🌱 Your body is building up to ovulation — the most fertile time in your cycle. Keep up the folate-rich foods and stay well-rested.");
    } else if (phase === "Luteal") {
      tips.push("🌱 If conception occurred, implantation happens in this phase. Keep stress low, eat well, and avoid alcohol.");
    } else {
      tips.push("🌱 Your body is resetting this phase. Focus on iron-rich foods to replenish, and folate to prepare for your next fertile window.");
    }
    recs.workoutAvoid.push("Avoid overtraining — excessive exercise can disrupt ovulation");
  }

  if (goals.includes("train_smarter")) {
    if (phase === "Follicular" || phase === "Ovulatory") {
      recs.workout.push("Progressive overload is most effective now — add weight or reps to your key lifts");
      recs.supplements.push("Creatine monohydrate (5g/day) — muscle output and recovery*");
      tips.push("💪 You're in your performance window. Push harder — your body recovers faster and adapts better right now.");
    } else if (phase === "Luteal") {
      tips.push("💪 Pull back on volume this phase — focus on technique and time under tension. Recovery matters more than new PRs right now.");
    } else {
      tips.push("💪 This is your recovery week. Light movement and mobility work will serve you better than hard training.");
    }
    recs.dietNotes.push("Target 1.6–2g protein per kg bodyweight to support training adaptation");
  }

  if (goals.includes("stay_on_top")) {
    if (phase === "Follicular" || phase === "Ovulatory") {
      recs.lifestyle.push("Schedule your hardest cognitive work — presentations, negotiations, creative projects — in this window");
      tips.push("🌟 Your brain is firing on all cylinders. Block time for deep work, big decisions, and anything that needs your best thinking.");
    } else if (phase === "Luteal") {
      recs.lifestyle.push("Shift to detail-oriented work — editing, analysis, admin, and finishing tasks suit this phase better");
      tips.push("🌟 Your energy is more inward this phase. Use it for deep focus, finishing things, and planning — not starting big new projects.");
    } else {
      recs.lifestyle.push("Protect your schedule — rest and recovery now means better performance next week");
      tips.push("🌟 Rest is your productivity tool this week. The women who plan their recovery end up outperforming those who push through.");
    }
    recs.dietNotes.push("Prioritise complex carbs and healthy fats for sustained mental energy — avoid blood sugar crashes");
  }

  if (tips.length > 0) {
    recs.goalTip = tips[0];
  }
}
