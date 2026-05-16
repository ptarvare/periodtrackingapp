import { CycleStatus } from "@/lib/predictionEngine";
import { format } from "date-fns";

const PHASE_CONFIG = {
  Menstrual: {
    color: "bg-red-50 text-red-700 border-red-200",
    bar: "bg-red-400",
    badge: "bg-red-100 text-red-600",
    emoji: "🩸",
    tagline: "Rest and restore",
  },
  Follicular: {
    color: "bg-pink-50 text-pink-700 border-pink-200",
    bar: "bg-pink-400",
    badge: "bg-pink-100 text-pink-600",
    emoji: "🌱",
    tagline: "Energy is building",
  },
  Ovulatory: {
    color: "bg-purple-50 text-purple-700 border-purple-200",
    bar: "bg-purple-400",
    badge: "bg-purple-100 text-purple-600",
    emoji: "🔥",
    tagline: "Peak power — use it",
  },
  Luteal: {
    color: "bg-amber-50 text-amber-700 border-amber-200",
    bar: "bg-amber-400",
    badge: "bg-amber-100 text-amber-600",
    emoji: "🌙",
    tagline: "Wind down and reflect",
  },
};

export default function PhaseCard({ status }: { status: CycleStatus }) {
  const { currentPhase, dayOfCycle, cycleLength, daysUntilNextPeriod, isPeriodDue, confidenceScore, ovulationDate } =
    status;
  const cfg = PHASE_CONFIG[currentPhase];
  const progress = Math.min(100, Math.round((dayOfCycle / cycleLength) * 100));

  return (
    <div className={`p-6 rounded-3xl border ${cfg.color} transition-all`}>
      {/* Top row */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest opacity-60">
            Current Phase
          </span>
          <h2 className="text-3xl font-bold mt-1 flex items-center gap-2">
            {cfg.emoji} {currentPhase}
          </h2>
          <p className="text-sm opacity-75 mt-1">{cfg.tagline}</p>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold uppercase tracking-widest opacity-60">
            Cycle Day
          </span>
          <div className="text-4xl font-bold mt-1">{dayOfCycle}</div>
          <div className="text-xs opacity-60 mt-0.5">of {cycleLength}</div>
        </div>
      </div>

      {/* Cycle progress bar */}
      <div className="mt-5">
        <div className="w-full bg-black/8 h-2 rounded-full overflow-hidden">
          <div
            className={`${cfg.bar} h-2 rounded-full transition-all duration-700`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-xs opacity-50 mt-1">
          <span>Day 1</span>
          <span>Day {cycleLength}</span>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-5 pt-5 border-t border-black/8 grid grid-cols-3 gap-4">
        <Stat
          label="Next Period"
          value={isPeriodDue ? "Due today!" : `${daysUntilNextPeriod}d`}
        />
        <Stat
          label="Ovulation Est."
          value={format(ovulationDate, "MMM d")}
        />
        <Stat
          label="Confidence"
          value={`${confidenceScore}%`}
          muted={confidenceScore < 60}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${muted ? "opacity-50" : ""}`}>
        {value}
      </div>
      <div className="text-xs opacity-55 mt-0.5">{label}</div>
    </div>
  );
}
