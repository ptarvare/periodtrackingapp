import { CycleStatus } from "@/lib/predictionEngine";
import { format } from "date-fns";

const PHASE_CONFIG = {
  Menstrual: {
    gradient: "from-rose-400 to-pink-500",
    softBg: "bg-rose-50 border-rose-100",
    badge: "bg-rose-100 text-rose-600",
    emoji: "🩸",
    tagline: "Rest, restore & be gentle with yourself",
    tip: "Your body is working hard. Honour it.",
  },
  Follicular: {
    gradient: "from-pink-400 to-fuchsia-500",
    softBg: "bg-pink-50 border-pink-100",
    badge: "bg-pink-100 text-pink-600",
    emoji: "🌸",
    tagline: "Energy is rising — fresh starts ahead",
    tip: "Great time to start new things and feel yourself.",
  },
  Ovulatory: {
    gradient: "from-purple-500 to-violet-600",
    softBg: "bg-purple-50 border-purple-100",
    badge: "bg-purple-100 text-purple-600",
    emoji: "✨",
    tagline: "Peak power — you're magnetic right now",
    tip: "You're at your strongest. Make the most of it!",
  },
  Luteal: {
    gradient: "from-amber-400 to-orange-500",
    softBg: "bg-amber-50 border-amber-100",
    badge: "bg-amber-100 text-amber-700",
    emoji: "🌙",
    tagline: "Wind down, reflect & nourish deeply",
    tip: "Slow down. Self-care is your superpower now.",
  },
};

export default function PhaseCard({ status }: { status: CycleStatus }) {
  const { currentPhase, dayOfCycle, cycleLength, phaseDay, ovulationDate } = status;
  const cfg = PHASE_CONFIG[currentPhase];

  return (
    <div className={`rounded-3xl overflow-hidden shadow-lg`}>
      {/* Gradient header */}
      <div className={`bg-gradient-to-br ${cfg.gradient} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-1">
              Current Phase
            </p>
            <div className="flex items-center gap-3">
              <span className="text-5xl">{cfg.emoji}</span>
              <div>
                <h2 className="text-3xl font-bold leading-tight">{currentPhase}</h2>
                <p className="text-white/80 text-sm mt-0.5">{cfg.tagline}</p>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">Cycle Day</p>
            <p className="text-5xl font-bold leading-tight">{dayOfCycle}</p>
            <p className="text-white/60 text-xs">of {cycleLength}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-5 w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-white h-2.5 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.round((dayOfCycle / cycleLength) * 100))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-white/60 mt-1">
          <span>Day 1</span>
          <span>Day {cycleLength}</span>
        </div>
      </div>

      {/* Info strip */}
      <div className={`${cfg.softBg} border-t-0 border px-6 py-4 grid grid-cols-2 gap-4`}>
        <InfoItem emoji="📅" label="Phase Day" value={`Day ${phaseDay}`} />
        <InfoItem emoji="🥚" label="Ovulation Est." value={format(ovulationDate, "MMM d")} />
      </div>

      {/* Tip */}
      <div className="bg-white px-6 py-3.5 border border-t-0 border-pink-100 rounded-b-3xl">
        <p className="text-xs text-gray-500 italic text-center">{cfg.tip}</p>
      </div>
    </div>
  );
}

function InfoItem({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-xl">{emoji}</span>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}
