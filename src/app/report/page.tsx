"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateCycleStatus, CycleStatus } from "@/lib/predictionEngine";
import { format, parseISO } from "date-fns";
import PleaseSignIn from "@/components/PleaseSignIn";
import Nav from "@/components/Nav";

interface DayLog {
  date: string;
  moods: string[];
  mood?: string;
  energy: string;
  symptoms: string[];
  note?: string;
  periodStarted?: boolean;
}

const ENERGY_COLOR: Record<string, string> = {
  "Very Low": "text-red-500",
  "Low":      "text-orange-500",
  "Medium":   "text-yellow-600",
  "High":     "text-green-600",
};

const PHASE_REPORT: Record<string, { title: string; productivity: string; next: string }> = {
  Menstrual: {
    title: "Your Menstrual Phase",
    productivity: "This is your rest and reset window. Days with low energy here are not setbacks — they're your body doing maintenance. Protect your sleep and warmth this phase.",
    next: "Follicular phase is coming — energy will rise. Get ready to start things.",
  },
  Follicular: {
    title: "Your Follicular Phase",
    productivity: "This is your high-performance window for new ideas, hard workouts, and big decisions. Whatever you started here has the best chance of sticking.",
    next: "Ovulatory phase is next — your peak performance days. Plan your most important work.",
  },
  Ovulatory: {
    title: "Your Ovulatory Phase",
    productivity: "These were your peak days — highest verbal fluency, pain tolerance, and physical output. Ovulation is short. Knowing when it happens is your competitive edge.",
    next: "Luteal phase begins — shift to deep work and self-care. Reduce intensity.",
  },
  Luteal: {
    title: "Your Luteal Phase",
    productivity: "Luteal is your detail phase — great for finishing things, editing, and analytical work. Harder for big social output. Honour the slower pace instead of fighting it.",
    next: "Your period is coming — plan lighter tasks and prioritise rest in the final days.",
  },
};

export default function ReportPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<DayLog[]>([]);
  const [status, setStatus] = useState<CycleStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [snap, logsSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDocs(query(
          collection(db, "users", user.uid, "logs"),
          orderBy("date", "desc"),
          limit(30)
        )),
      ]);

      if (snap.exists()) {
        const p = snap.data().profile;
        setStatus(calculateCycleStatus(p));
      }

      const logList: DayLog[] = [];
      logsSnap.forEach((d) => logList.push(d.data() as DayLog));
      setLogs(logList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  // Stats from logs
  const moodCounts: Record<string, number> = {};
  const energyCounts: Record<string, number> = {};
  logs.forEach((l) => {
    const moodList = l.moods?.length ? l.moods : (l.mood ? [l.mood] : []);
    moodList.forEach((m) => { moodCounts[m] = (moodCounts[m] ?? 0) + 1; });
    if (l.energy) energyCounts[l.energy] = (energyCounts[l.energy] ?? 0) + 1;
  });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topEnergy = Object.entries(energyCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const currentPhaseReport = status ? PHASE_REPORT[status.currentPhase] : null;
  const phaseDay = status?.phaseDay ?? 0;

  return (
    <PleaseSignIn>
      <div className="min-h-screen bg-[#FDF2F8] pb-24 sm:pb-12">
        <Nav />

        {loading ? (
          <div className="max-w-lg mx-auto px-4 pt-10 space-y-4 animate-pulse">
            <div className="h-32 bg-gray-200 rounded-3xl" />
            <div className="h-48 bg-gray-200 rounded-3xl" />
          </div>
        ) : (
          <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">

            <div className="px-1">
              <h1 className="text-xl font-bold text-gray-900">Your Report</h1>
              <p className="text-sm text-gray-400 mt-0.5">Built from your daily logs</p>
            </div>

            {/* Phase report card */}
            {status && currentPhaseReport && logs.length >= 3 && (
              <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-pink-200">
                <p className="text-xs font-semibold uppercase tracking-widest text-pink-100 mb-1">
                  Day {phaseDay} of {status.currentPhase}
                </p>
                <h2 className="text-xl font-bold mb-3">{currentPhaseReport.title}</h2>
                <p className="text-sm text-white/90 leading-relaxed mb-4">
                  {currentPhaseReport.productivity}
                </p>
                <div className="bg-white/15 rounded-2xl px-4 py-3">
                  <p className="text-xs font-semibold text-pink-100 uppercase tracking-wide mb-1">Coming up</p>
                  <p className="text-sm text-white/90">{currentPhaseReport.next}</p>
                </div>
              </div>
            )}

            {/* Summary stats */}
            {logs.length >= 3 ? (
              <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Patterns</h2>
                <div className="grid grid-cols-3 gap-3">
                  <StatCard label="Days logged" value={String(logs.length)} emoji="📅" />
                  <StatCard label="Top mood" value={topMood ?? "—"} emoji="💭" />
                  <StatCard label="Top energy" value={topEnergy ?? "—"} emoji="⚡" color={topEnergy ? ENERGY_COLOR[topEnergy] : undefined} />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 text-center">
                <p className="text-3xl mb-3">📊</p>
                <p className="text-sm font-semibold text-gray-800">Log 3 days to unlock your report</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  Your patterns, top moods, and phase report card will appear once you have enough data.
                </p>
                <p className="text-xs font-semibold text-pink-500 mt-3">
                  {logs.length} of 3 days logged
                </p>
              </div>
            )}

            {/* Log history */}
            {logs.length > 0 && (
              <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Log History</h2>
                <div className="space-y-3">
                  {logs.map((log) => {
                    const moodList = log.moods?.length ? log.moods : (log.mood ? [log.mood] : []);
                    const isToday = log.date === new Date().toISOString().split("T")[0];
                    return (
                      <div key={log.date} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                        <div className="shrink-0 text-center w-10">
                          <p className="text-xs font-bold text-gray-500">
                            {format(parseISO(log.date), "MMM")}
                          </p>
                          <p className="text-lg font-bold text-gray-900 leading-tight">
                            {format(parseISO(log.date), "d")}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {isToday && (
                              <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-semibold">Today</span>
                            )}
                            {log.periodStarted && (
                              <span className="text-xs">🩸</span>
                            )}
                            {moodList.length > 0 && (
                              <span className="text-xs text-gray-600">{moodList.join(", ")}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {log.energy && (
                              <span className={`text-xs font-semibold ${ENERGY_COLOR[log.energy] ?? "text-gray-500"}`}>
                                ⚡ {log.energy}
                              </span>
                            )}
                            {log.symptoms?.length > 0 && (
                              <span className="text-xs text-gray-400">{log.symptoms.join(", ")}</span>
                            )}
                          </div>
                          {log.note && (
                            <p className="text-xs text-gray-400 mt-1 italic truncate">&ldquo;{log.note}&rdquo;</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {logs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-sm font-semibold text-gray-700">No logs yet</p>
                <p className="text-xs text-gray-400 mt-1">Head to the Log tab to start tracking your days.</p>
              </div>
            )}

            <div className="pb-4" />
          </main>
        )}
      </div>
    </PleaseSignIn>
  );
}

function StatCard({ label, value, emoji, color }: { label: string; value: string; emoji: string; color?: string }) {
  return (
    <div className="bg-pink-50 rounded-2xl p-3 text-center">
      <p className="text-xl mb-1">{emoji}</p>
      <p className={`text-sm font-bold ${color ?? "text-gray-900"} leading-tight`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}
