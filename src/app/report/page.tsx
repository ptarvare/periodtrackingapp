"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateCycleStatus, CycleStatus, Phase } from "@/lib/predictionEngine";
import { differenceInDays, parseISO, format } from "date-fns";
import PleaseSignIn from "@/components/PleaseSignIn";
import Nav from "@/components/Nav";

interface DayLog {
  date: string;
  moods?: string[];
  mood?: string;
  energy?: string;
  symptoms?: string[];
  note?: string;
  periodStarted?: boolean;
}

// ── Phase config ──────────────────────────────────────────────────────────────

const PHASE_CONFIG: Record<Phase, {
  emoji: string;
  gradient: string;
  lightBg: string;
  border: string;
  text: string;
  productivity: { high: string[]; moderate: string[]; rest: string[] };
  nextPhrase: string;
}> = {
  Menstrual: {
    emoji: "🩸",
    gradient: "from-rose-400 to-pink-500",
    lightBg: "bg-rose-50",
    border: "border-rose-100",
    text: "text-rose-600",
    productivity: {
      high:     ["Rest and restore", "Gentle journaling", "Reflection and planning"],
      moderate: ["Admin tasks and emails", "Light creative work", "Catch-up on reading"],
      rest:     ["Heavy workouts", "High-pressure meetings", "Major decisions"],
    },
    nextPhrase: "Energy rises soon — Follicular phase is coming. Start preparing for your high-output window.",
  },
  Follicular: {
    emoji: "🌸",
    gradient: "from-pink-400 to-fuchsia-500",
    lightBg: "bg-pink-50",
    border: "border-pink-100",
    text: "text-pink-600",
    productivity: {
      high:     ["New projects and ideas", "Hard training and PRs", "Big decisions and pitches"],
      moderate: ["Learning new skills", "Networking and social plans", "Strategy work"],
      rest:     ["Nothing is off-limits — this is your rise phase"],
    },
    nextPhrase: "Your peak is coming — Ovulatory phase. Plan your most important work for those days.",
  },
  Ovulatory: {
    emoji: "✨",
    gradient: "from-purple-500 to-violet-600",
    lightBg: "bg-purple-50",
    border: "border-purple-100",
    text: "text-purple-600",
    productivity: {
      high:     ["Presentations and negotiations", "Max training and competitions", "Important conversations"],
      moderate: ["Creative collaboration", "Brainstorming sessions", "Social events"],
      rest:     ["Overcommitting — energy feels limitless but recovery needs are high"],
    },
    nextPhrase: "Luteal phase is next — shift to deep focus work and begin reducing intensity.",
  },
  Luteal: {
    emoji: "🌙",
    gradient: "from-amber-400 to-orange-500",
    lightBg: "bg-amber-50",
    border: "border-amber-100",
    text: "text-amber-600",
    productivity: {
      high:     ["Detail work and editing", "Finishing existing projects", "Analysis and review"],
      moderate: ["Steady training at lower intensity", "Routine tasks", "Deep solo work"],
      rest:     ["Starting new projects", "Heavy HIIT", "High-pressure social events"],
    },
    nextPhrase: "Your period is coming — plan lighter tasks in the final days and prioritise rest.",
  },
};

// ── Energy colours ────────────────────────────────────────────────────────────

const ENERGY_CELL: Record<string, string> = {
  "Very Low": "bg-rose-200",
  "Low":      "bg-pink-300",
  "Medium":   "bg-pink-500",
  "High":     "bg-purple-600",
};

const ENERGY_TEXT: Record<string, string> = {
  "Very Low": "text-red-500",
  "Low":      "text-orange-500",
  "Medium":   "text-yellow-600",
  "High":     "text-green-600",
};

// ── Heatmap helpers ───────────────────────────────────────────────────────────

interface CycleRow {
  startDate: string;
  cycleLen: number;
  cells: Record<number, string>; // day → energy
}

function buildHeatmap(logs: DayLog[], periodDates: string[], defaultCycleLen: number): CycleRow[] {
  const sorted = [...periodDates].sort();
  const rows: CycleRow[] = [];

  sorted.forEach((start, i) => {
    const nextStart = sorted[i + 1];
    const startDate = parseISO(start);
    const cycleLen = nextStart
      ? Math.min(differenceInDays(parseISO(nextStart), startDate), 60)
      : defaultCycleLen;

    const cells: Record<number, string> = {};
    logs.forEach((log) => {
      const day = differenceInDays(parseISO(log.date), startDate) + 1;
      if (day >= 1 && day <= cycleLen + 5 && log.energy) {
        cells[day] = log.energy;
      }
    });

    if (Object.keys(cells).length > 0) {
      rows.push({ startDate: start, cycleLen, cells });
    }
  });

  return rows.slice(-6); // last 6 cycles
}

function phaseForDay(day: number, cycleLen: number, periodLen: number): Phase {
  const ovDay = cycleLen - 14;
  if (day <= periodLen) return "Menstrual";
  if (day < ovDay - 1) return "Follicular";
  if (day <= ovDay + 1) return "Ovulatory";
  return "Luteal";
}

const PHASE_COL: Record<Phase, string> = {
  Menstrual:  "bg-rose-300",
  Follicular: "bg-pink-400",
  Ovulatory:  "bg-purple-500",
  Luteal:     "bg-amber-400",
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [status, setStatus] = useState<CycleStatus | null>(null);
  const [periodDates, setPeriodDates] = useState<string[]>([]);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [loading, setLoading] = useState(true);
  const [showWrapped, setShowWrapped] = useState(false);
  const wrappedRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [snap, logsSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDocs(query(collection(db, "users", user.uid, "logs"), orderBy("date", "desc"), limit(30))),
      ]);

      if (snap.exists()) {
        const p = snap.data().profile;
        setStatus(calculateCycleStatus(p));
        setPeriodDates(p.periodDates ?? []);
        setPeriodDuration(parseInt(p.periodDuration) || 5);
      }

      const list: DayLog[] = [];
      logsSnap.forEach((d) => list.push(d.data() as DayLog));
      setLogs(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived stats ──────────────────────────────────────────────────────────

  const moodCounts: Record<string, number> = {};
  const energyCounts: Record<string, number> = {};
  logs.forEach((l) => {
    const ms = l.moods?.length ? l.moods : (l.mood ? [l.mood] : []);
    ms.forEach((m) => { moodCounts[m] = (moodCounts[m] ?? 0) + 1; });
    if (l.energy) energyCounts[l.energy] = (energyCounts[l.energy] ?? 0) + 1;
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const topEnergy = Object.entries(energyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  // Phase-specific logs (current phase days only)
  const phaseDay = status?.phaseDay ?? 1;
  const phaseLogs = logs.slice(0, phaseDay);
  const daysLoggedThisPhase = phaseLogs.length;

  const heatmapRows = status
    ? buildHeatmap(logs, periodDates, status.cycleLength)
    : [];

  const cfg = status ? PHASE_CONFIG[status.currentPhase] : null;

  // ── Download wrapped card ──────────────────────────────────────────────────

  const handleDownload = async () => {
    if (!wrappedRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(wrappedRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `luna-${status?.currentPhase.toLowerCase() ?? "phase"}-wrapped.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  return (
    <PleaseSignIn>
      <div className="min-h-screen bg-[#FDF2F8] pb-24 sm:pb-12">
        <Nav />

        {loading ? (
          <div className="max-w-lg mx-auto px-4 pt-10 space-y-4 animate-pulse">
            <div className="h-8 w-40 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-3xl" />
            <div className="h-40 bg-gray-200 rounded-3xl" />
          </div>
        ) : (
          <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">
            <div className="px-1">
              <h1 className="text-xl font-bold text-gray-900">Your Report</h1>
              <p className="text-sm text-gray-400 mt-0.5">Phase-based, built from your logs</p>
            </div>

            {/* ── Phase Report Card ── */}
            {status && cfg && (
              <div className={`bg-white rounded-3xl border ${cfg.border} shadow-sm overflow-hidden`}>
                {/* Header */}
                <div className={`bg-gradient-to-br ${cfg.gradient} p-6 text-white`}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
                      Day {status.phaseDay} of {status.currentPhase}
                    </p>
                    <button
                      onClick={() => setShowWrapped(true)}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-full text-xs font-semibold"
                    >
                      Share ✦
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-5xl">{cfg.emoji}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{status.currentPhase} Phase</h2>
                      <p className="text-white/80 text-sm mt-0.5">
                        {daysLoggedThisPhase} day{daysLoggedThisPhase !== 1 ? "s" : ""} logged this phase
                      </p>
                    </div>
                  </div>
                </div>

                {/* Productivity modes */}
                <div className={`${cfg.lightBg} px-5 py-4 space-y-3`}>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">How to operate this phase</p>

                  <ProductivityRow emoji="🔥" label="High output" items={cfg.productivity.high} color="text-gray-800" />
                  <ProductivityRow emoji="⚡" label="Moderate" items={cfg.productivity.moderate} color="text-gray-700" />
                  <ProductivityRow emoji="🌙" label="Pull back on" items={cfg.productivity.rest} color="text-gray-500" />
                </div>

                {/* What's next */}
                <div className="px-5 py-4 border-t border-gray-50">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Coming up</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{cfg.nextPhrase}</p>
                </div>
              </div>
            )}

            {/* ── Energy Heatmap ── */}
            {heatmapRows.length > 0 && status && (
              <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-bold text-gray-900">Energy Heatmap</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Your personal energy pattern across cycles</p>
                </div>

                {/* Phase bar */}
                <div className="flex mb-1 gap-0.5">
                  {Array.from({ length: Math.min(status.cycleLength, 35) }, (_, i) => {
                    const day = i + 1;
                    const phase = phaseForDay(day, status.cycleLength, periodDuration);
                    return (
                      <div
                        key={day}
                        title={`Day ${day} — ${phase}`}
                        className={`h-1.5 flex-1 rounded-sm ${PHASE_COL[phase]} opacity-60`}
                      />
                    );
                  })}
                </div>

                {/* Grid rows */}
                <div className="space-y-1">
                  {heatmapRows.map((row, ri) => (
                    <div key={row.startDate} className="flex gap-0.5 items-center">
                      <span className="text-xs text-gray-300 w-10 shrink-0 text-right pr-1">
                        {format(parseISO(row.startDate), "MMM")}
                      </span>
                      {Array.from({ length: Math.min(row.cycleLen, 35) }, (_, i) => {
                        const day = i + 1;
                        const energy = row.cells[day];
                        return (
                          <div
                            key={day}
                            title={energy ? `Day ${day}: ${energy}` : `Day ${day}: not logged`}
                            className={`h-4 flex-1 rounded-sm ${energy ? ENERGY_CELL[energy] : "bg-gray-100"}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  <span className="text-xs text-gray-400">Energy:</span>
                  {Object.entries(ENERGY_CELL).map(([label, cls]) => (
                    <div key={label} className="flex items-center gap-1">
                      <div className={`w-3 h-3 rounded-sm ${cls}`} />
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-100" />
                    <span className="text-xs text-gray-400">Not logged</span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Patterns summary ── */}
            {logs.length >= 3 && (
              <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Patterns</h3>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard emoji="📅" label="Days logged" value={String(logs.length)} />
                  <StatCard emoji="💭" label="Top mood" value={topMood} />
                  <StatCard emoji="⚡" label="Top energy" value={topEnergy} color={ENERGY_TEXT[topEnergy]} />
                </div>
              </div>
            )}

            {/* ── Log history ── */}
            {logs.length > 0 ? (
              <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Log History</h3>
                <div className="space-y-3">
                  {logs.map((log) => {
                    const ms = log.moods?.length ? log.moods : (log.mood ? [log.mood] : []);
                    const isToday = log.date === new Date().toISOString().split("T")[0];
                    return (
                      <div key={log.date} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                        <div className="shrink-0 w-10 text-center">
                          <p className="text-xs font-semibold text-gray-400">{format(parseISO(log.date), "MMM")}</p>
                          <p className="text-base font-bold text-gray-900 leading-tight">{format(parseISO(log.date), "d")}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isToday && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-semibold">Today</span>}
                            {log.periodStarted && <span className="text-xs">🩸</span>}
                            {ms.length > 0 && <span className="text-xs text-gray-700 font-medium">{ms.join(", ")}</span>}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {log.energy && (
                              <span className={`text-xs font-semibold ${ENERGY_TEXT[log.energy] ?? "text-gray-500"}`}>
                                ⚡ {log.energy}
                              </span>
                            )}
                            {(log.symptoms?.length ?? 0) > 0 && (
                              <span className="text-xs text-gray-400">{log.symptoms!.join(", ")}</span>
                            )}
                          </div>
                          {log.note && (
                            <p className="text-xs text-gray-400 mt-0.5 italic truncate">&ldquo;{log.note}&rdquo;</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-sm font-semibold text-gray-700">No logs yet</p>
                <p className="text-xs text-gray-400 mt-1">Go to the Log tab to start tracking your days.</p>
              </div>
            )}

            <div className="pb-4" />
          </main>
        )}
      </div>

      {/* ── Wrapped card modal ── */}
      {showWrapped && status && cfg && (
        <WrappedModal
          phase={status.currentPhase}
          phaseDay={status.phaseDay}
          cfg={cfg}
          daysLogged={daysLoggedThisPhase}
          topMood={topMood}
          topEnergy={topEnergy}
          wrappedRef={wrappedRef}
          onDownload={handleDownload}
          onClose={() => setShowWrapped(false)}
        />
      )}
    </PleaseSignIn>
  );
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function ProductivityRow({ emoji, label, items, color }: { emoji: string; label: string; items: string[]; color: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-base shrink-0 mt-0.5">{emoji}</span>
      <div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">{label}: </span>
        <span className={`text-xs ${color} leading-relaxed`}>{items.join(" · ")}</span>
      </div>
    </div>
  );
}

function StatCard({ emoji, label, value, color }: { emoji: string; label: string; value: string; color?: string }) {
  return (
    <div className="bg-pink-50 rounded-2xl p-3 text-center">
      <p className="text-xl mb-1">{emoji}</p>
      <p className={`text-sm font-bold leading-tight ${color ?? "text-gray-900"}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function WrappedModal({
  phase, phaseDay, cfg, daysLogged, topMood, topEnergy,
  wrappedRef, onDownload, onClose,
}: {
  phase: Phase;
  phaseDay: number;
  cfg: typeof PHASE_CONFIG[Phase];
  daysLogged: number;
  topMood: string;
  topEnergy: string;
  wrappedRef: React.RefObject<HTMLDivElement | null>;
  onDownload: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex flex-col items-center justify-center p-6 gap-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* The card that gets captured */}
      <div
        ref={wrappedRef}
        className={`w-full max-w-xs rounded-3xl bg-gradient-to-br ${cfg.gradient} p-8 text-white shadow-2xl`}
      >
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4">Luna 🌙</p>
          <p className="text-6xl mb-4">{cfg.emoji}</p>
          <p className="text-white/70 text-sm font-semibold uppercase tracking-widest mb-1">
            Day {phaseDay} of
          </p>
          <h2 className="text-3xl font-bold mb-6">{phase} Phase</h2>

          <div className="bg-white/15 rounded-2xl p-4 space-y-3 mb-6">
            <WrappedStat label="Days logged" value={`${daysLogged} day${daysLogged !== 1 ? "s" : ""}`} />
            <WrappedStat label="Top mood" value={topMood} />
            <WrappedStat label="Top energy" value={topEnergy} />
          </div>

          <p className="text-white/60 text-xs">luna-app-beta.vercel.app</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full max-w-xs">
        <button
          onClick={onDownload}
          className="flex-1 py-3 bg-white text-gray-900 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-colors"
        >
          Download ↓
        </button>
        <button
          onClick={onClose}
          className="flex-1 py-3 bg-white/20 text-white rounded-2xl text-sm font-bold hover:bg-white/30 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function WrappedStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-white/70 text-sm">{label}</span>
      <span className="text-white font-bold text-sm">{value}</span>
    </div>
  );
}
