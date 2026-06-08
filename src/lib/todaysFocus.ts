import { Phase } from "./predictionEngine";

// Goal priority when multiple goals are selected — most specific/time-sensitive first
const GOAL_PRIORITY = ["start_a_family", "train_smarter", "stay_on_top", "know_my_body"] as const;

type GoalId = typeof GOAL_PRIORITY[number];

// 3 rotating messages per phase × goal combination
// Selected by (dayOfCycle - 1) % 3 so they cycle predictably
const FOCUS_CONTENT: Record<Phase, Record<GoalId, string[]>> = {
  Menstrual: {
    stay_on_top: [
      "Your body is doing heavy lifting today. Protect your energy — reschedule anything that can wait until later in the week.",
      "Rest isn't lost time. The most effective leaders know when to recover. Today is that day — plan, don't push.",
      "Lower energy is data, not failure. Use this slower pace to review what's working and map your next sprint.",
    ],
    start_a_family: [
      "Your body is shedding and renewing. Focus on iron-rich foods today — spinach, lentils, red meat — to replenish what you're losing.",
      "Rest supports healthy cycles. Less stress this week has a measurable effect on next month's hormonal balance.",
      "Today is a natural reset point. Warmth, rest, and nourishing food are the most supportive things you can do right now.",
    ],
    train_smarter: [
      "Low-intensity only today — a short walk or gentle yoga is the right call. Your body is already doing significant work.",
      "Skip the heavy session. Active recovery — stretching, mobility, foam rolling — is the most productive training choice right now.",
      "Rest is written into your programme. Your next training block will be stronger because of what you do (and don't do) today.",
    ],
    know_my_body: [
      "Notice your flow, cramps, mood, and energy today. The patterns across 3+ months will tell you more than any single day.",
      "How you feel during your period is valuable data. Log your symptoms so you can start spotting what's consistent — and what's changing.",
      "Your body is at its most transparent right now. Whatever you're experiencing, it's worth noting — it all becomes useful later.",
    ],
  },
  Follicular: {
    stay_on_top: [
      "Estrogen is rising and with it, your verbal fluency and cognitive sharpness. Schedule your most demanding work, pitch, or hard conversation this week.",
      "Your energy is building. Front-load the week with high-priority tasks — this window closes around day 13.",
      "This is your planning phase. Map goals, set priorities, and create structure now — you'll execute better when you have something to execute against.",
    ],
    start_a_family: [
      "Your fertile window is 7–10 days away. This is a good time to track cervical mucus daily and note any changes in consistency.",
      "Estrogen is supporting follicle development. Stay stress-low, sleep well, and prioritise folate-rich foods — leafy greens, eggs, legumes.",
      "Good week to reduce alcohol, increase water, and focus on antioxidant-rich foods. The choices you make now support the egg quality ahead.",
    ],
    train_smarter: [
      "Your best training window is opening. Increase intensity progressively — muscle protein synthesis and recovery speed are both elevated now.",
      "Strength and skill acquisition peak this phase. Try something new — a new lift, a new class, a new route. Your coordination is at its best.",
      "Estrogen helps your body use fat as fuel more efficiently. Longer training sessions and sustained cardio feel better and burn better right now.",
    ],
    know_my_body: [
      "Notice how different you feel compared to last week. That mental clarity and rising energy — that's estrogen restoring your baseline.",
      "Your mood, sleep quality, and pain threshold are all improving this week. Note what 'feeling good' looks like for you — it's your reference point.",
      "A good week to start a new habit. Dopamine sensitivity peaks in the follicular phase, making new behaviours easier to establish and stick to.",
    ],
  },
  Ovulatory: {
    stay_on_top: [
      "Peak performance day. Your communication skills, confidence, and cognitive output are at their highest. Use this for your most important decision or conversation.",
      "You're at your sharpest right now. Schedule the pitch, the negotiation, the creative session — this window is short and worth using fully.",
      "Charisma and clarity both peak around ovulation. This is the day to lead, persuade, or present something that matters.",
    ],
    start_a_family: [
      "This is your most fertile window. If you're trying to conceive, today and the next 2 days are your highest-probability opportunity.",
      "Ovulation is imminent or happening now. Prioritise connection, low stress, and good sleep — your body is doing the most important work.",
      "Your fertile window is open. Track temperature and mucus today. Timing, consistency, and low cortisol are the three things you can control.",
    ],
    train_smarter: [
      "Strength and power peak around ovulation. This is the right day for a personal record attempt or your most intense session of the cycle.",
      "Your pain tolerance and muscle output are at their highest point. Match the training to the moment — go harder than usual today.",
      "High energy, high output, fast recovery. This is your performance peak. Treat it like one and train accordingly.",
    ],
    know_my_body: [
      "Notice how social, confident, and articulate you feel right now. This is your ovulatory energy — it's biological, not random, and it won't last long.",
      "You're at your most energetically open. This is a good day to connect with people, have important conversations, or put yourself out there.",
      "The contrast between today and your period phase is the cycle in action. Recognising it is the first step to working with it instead of against it.",
    ],
  },
  Luteal: {
    stay_on_top: [
      "Shift to execution mode. Finish existing tasks, close open loops, and avoid committing to new projects — your energy is better spent completing than starting.",
      "Your inner critic tends to get louder in the luteal phase. Acknowledge it, but don't let it drive decisions. Stick to what you already planned.",
      "Structure serves you well right now. A clear, short to-do list and fewer meetings will get more done than ambition and improvisation.",
    ],
    start_a_family: [
      "Post-ovulation phase. Rest well, eat warm nourishing food, and keep stress low — these support the best possible environment right now.",
      "Progesterone is dominant. It may cause bloating, fatigue, breast tenderness, or mood shifts. These are normal signs your body is doing what it should.",
      "If implantation is happening, your body is doing quiet, invisible work. Give it what it needs — rest, good food, and reduced cortisol.",
    ],
    train_smarter: [
      "Endurance over intensity today. A longer, steadier run or moderate session will feel better and be more productive than trying to lift heavy.",
      "Your body temperature runs slightly higher in the luteal phase due to progesterone — this affects endurance and recovery. Hydration and sleep matter more than usual.",
      "Progesterone shifts your body toward carbohydrate dependence during exercise. Fuel well before training and don't expect the same output as your ovulatory phase.",
    ],
    know_my_body: [
      "If you're feeling low, irritable, or foggy today — that's progesterone affecting GABA and serotonin, not reality. It passes. Notice it without judging it.",
      "Pay attention to your cravings. They're often your body's way of signalling a need — magnesium (chocolate, nuts), serotonin (carbs), or iron (red meat cravings).",
      "The luteal phase pulls energy inward. This is a useful time to journal, reflect on your cycle patterns, and note what's been working and what hasn't.",
    ],
  },
};

export function getTodaysFocus(
  phase: Phase,
  goals: string[],
  dayOfCycle: number
): { emoji: string; text: string } {
  // Pick the highest-priority goal the user has selected
  const activeGoal =
    GOAL_PRIORITY.find((g) => goals.includes(g)) ?? "know_my_body";

  const pool = FOCUS_CONTENT[phase][activeGoal];
  const text = pool[(dayOfCycle - 1) % pool.length];

  const EMOJIS: Record<GoalId, string> = {
    stay_on_top: "🌟",
    start_a_family: "🌱",
    train_smarter: "💪",
    know_my_body: "🌿",
  };

  return { emoji: EMOJIS[activeGoal], text };
}
