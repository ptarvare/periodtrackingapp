"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateCycleStatus, CycleStatus } from "@/lib/predictionEngine";
import { getRecommendations, DailyRecommendation } from "@/lib/recommendationEngine";
import { format, differenceInDays, parseISO, isBefore, addDays } from "date-fns";
import PleaseSignIn from "@/components/PleaseSignIn";
import { track } from "@/lib/analytics";
import PhaseCard from "@/components/PhaseCard";
import DailyRecs from "@/components/DailyRecs";
import LogModal from "@/components/LogModal";
import Nav from "@/components/Nav";
import { getTodaysFocus } from "@/lib/todaysFocus";
import Link from "next/link";

const TODAY = new Date().toISOString().split("T")[0];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [status, setStatus] = useState<CycleStatus | null>(null);
  const [recs, setRecs] = useState<DailyRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [logOpen, setLogOpen] = useState(false);
  const [logWithPeriod, setLogWithPeriod] = useState(false);
  const [todayLogged, setTodayLogged] = useState(false);
  const [periodDismissed, setPeriodDismissed] = useState(false);
  const [goalEditOpen, setGoalEditOpen] = useState(false);
  const [goalNudgeDismissed, setGoalNudgeDismissed] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [snap, logSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDoc(doc(db, "users", user.uid, "logs", TODAY)),
      ]);

      if (!snap.exists() || !snap.data().onboardingCompleted || !snap.data().profile?.periodDates?.length) {
        router.push("/onboarding");
        return;
      }

      const p = snap.data().profile;
      setProfile(p);
      setTodayLogged(logSnap.exists());

      const cycleStatus = calculateCycleStatus(p);
      setStatus(cycleStatus);
      setRecs(getRecommendations(cycleStatus, p));
      track("dashboard_viewed", { phase: cycleStatus.currentPhase, day_of_cycle: cycleStatus.dayOfCycle, days_until_period: cycleStatus.daysUntilNextPeriod });
    } catch (e) {
      console.error("Dashboard fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const firstName = profile?.name?.split(" ")[0] ?? user?.displayName?.split(" ")[0] ?? "there";

  return (
    <PleaseSignIn>
      <div className="min-h-screen bg-[#FDF2F8] pb-24 sm:pb-12">
        <Nav />

        {loading ? (
          <Skeleton />
        ) : (
          <main className="max-w-2xl mx-auto px-4 pt-6 space-y-4">
            {/* Greeting */}
            <div className="px-1">
              <h2 className="text-xl font-bold text-gray-900">Hi {firstName} 👋</h2>
              <p className="text-sm text-gray-500 mt-0.5">Here&apos;s your cycle overview for today.</p>
            </div>

            {/* Today's focus card */}
            {status && (
              <TodaysFocusCard
                phase={status.currentPhase}
                goals={profile?.goals ?? ["know_my_body"]}
                dayOfCycle={status.dayOfCycle}
                firstName={firstName}
              />
            )}

            {/* Goal chips — or new-feature nudge for existing users with no goals */}
            {profile && (profile.goals?.length > 0 ? (
              <GoalChips goals={profile.goals} onEdit={() => setGoalEditOpen(true)} />
            ) : !goalNudgeDismissed && (
              <GoalNudge
                onSetGoals={() => setGoalEditOpen(true)}
                onDismiss={() => setGoalNudgeDismissed(true)}
              />
            ))}

            {/* ── Next period hero card ── */}
            {status && <NextPeriodCard status={status} />}

            {/* ── Subtle period nudge — only when predicted today or 1 day late ── */}
            {status?.periodConfirmationNeeded && status.daysLate <= 1 && !periodDismissed && (
              <PeriodNudge
                daysLate={status.daysLate}
                onLog={() => { setLogWithPeriod(true); setLogOpen(true); }}
                onDismiss={() => setPeriodDismissed(true)}
              />
            )}

            {/* ── Daily log check-in ── */}
            <button
              onClick={() => setLogOpen(true)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all ${
                todayLogged
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-pink-100 hover:border-pink-300 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{todayLogged ? "✅" : "📋"}</span>
                <div className="text-left">
                  <p className={`text-sm font-semibold ${todayLogged ? "text-green-800" : "text-gray-900"}`}>
                    {todayLogged ? "Logged today" : "How are you feeling today?"}
                  </p>
                  <p className={`text-xs mt-0.5 ${todayLogged ? "text-green-600" : "text-gray-400"}`}>
                    {todayLogged ? "Tap to update your log" : "Track mood, energy & symptoms — takes 30 seconds"}
                  </p>
                </div>
              </div>
              <span className="text-gray-300 text-lg">→</span>
            </button>

            {/* ── Fertile window card — only for Start a family goal ── */}
            {status && profile?.goals?.includes("start_a_family") && (
              <FertileWindowCard status={status} />
            )}

            {/* ── Current phase card ── */}
            {status && <PhaseCard status={status} />}

            {/* Low data nudge */}
            {status && status.dataPoints < 3 && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <span className="text-blue-400 text-lg shrink-0 mt-0.5">📅</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900">Add more dates for better predictions</p>
                  <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                    You&apos;ve added {status.dataPoints} {status.dataPoints === 1 ? "month" : "months"} of data. 3 months gives the most accurate predictions.
                  </p>
                  <Link
                    href="/profile?edit=1"
                    className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    Add dates in Profile →
                  </Link>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recs && <DailyRecs recs={recs} />}

            {/* Cycle history */}
            {profile?.periodDates?.length > 0 && (
              <CycleHistoryCard dates={profile.periodDates} avgCycleLength={profile.avgCycleLength} />
            )}

            {/* Expert card */}
            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Expert</p>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-lg font-bold shrink-0">
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900">Priya Tarvare</p>
                  <p className="text-xs text-pink-600 font-medium mt-0.5">Certified Personal Trainer & Integrative Nutrition Practitioner</p>
                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    Strength coach and gut health practitioner with 6+ years of experience. She combines evidence-based training with nutritional strategies that support your hormones and microbiome.
                  </p>
                  <a
                    href="https://www.instagram.com/fit_coach__priya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    <span>📸</span> @fit_coach__priya
                  </a>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 px-4 pb-4 leading-relaxed">
              Luna is a wellness tool, not a medical device. Always consult a healthcare professional for medical concerns.
            </p>
          </main>
        )}
      </div>

      <LogModal
        isOpen={logOpen}
        defaultPeriodStarted={logWithPeriod}
        onClose={() => { setLogOpen(false); setLogWithPeriod(false); }}
        onSave={() => { setLogOpen(false); setLogWithPeriod(false); loadData(); }}
      />

      {user && goalEditOpen && (
        <GoalEditModal
          currentGoals={profile?.goals ?? ["know_my_body"]}
          onClose={() => setGoalEditOpen(false)}
          onSave={async (goals) => {
            await updateDoc(doc(db, "users", user.uid), { "profile.goals": goals });
            setGoalEditOpen(false);
            loadData();
          }}
        />
      )}
    </PleaseSignIn>
  );
}

// ── Fertile window card ───────────────────────────────────────────────────────

function FertileWindowCard({ status }: { status: CycleStatus }) {
  const { ovulationDate, currentPhase } = status;
  const today = new Date();
  const fertileStart = addDays(ovulationDate, -4);
  const fertileEnd = ovulationDate;
  const isInWindow = !isBefore(today, fertileStart) && !isBefore(fertileEnd, today);
  const daysToFertile = Math.ceil((fertileStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOvulationDay = currentPhase === "Ovulatory" && Math.abs(differenceInDays(today, ovulationDate)) <= 1;

  let heading: string;
  let body: string;
  let accent: string;

  if (isOvulationDay) {
    heading = "🌱 Ovulation day";
    body = "Today is your most fertile day. Your fertile window closes in the next 24 hours.";
    accent = "from-green-400 to-emerald-500";
  } else if (isInWindow || currentPhase === "Ovulatory") {
    heading = "🌱 You're in your fertile window";
    body = `Fertile window: ${format(fertileStart, "MMM d")} – ${format(fertileEnd, "MMM d")}. Ovulation around ${format(ovulationDate, "MMM d")}.`;
    accent = "from-green-400 to-emerald-500";
  } else if (daysToFertile > 0 && daysToFertile <= 7) {
    heading = "🌱 Fertile window approaching";
    body = `Your fertile window opens in ${daysToFertile} day${daysToFertile === 1 ? "" : "s"} — around ${format(fertileStart, "MMM d")}.`;
    accent = "from-teal-400 to-green-400";
  } else {
    heading = "🌱 Next fertile window";
    body = `Fertile window: ${format(fertileStart, "MMM d")} – ${format(fertileEnd, "MMM d")}. Ovulation around ${format(ovulationDate, "MMM d")}.`;
    accent = "from-pink-300 to-purple-400";
  }

  return (
    <div className={`bg-gradient-to-r ${accent} rounded-3xl p-5 text-white shadow-lg`}>
      <p className="text-sm font-bold mb-1">{heading}</p>
      <p className="text-xs text-white/80 leading-relaxed">{body}</p>
    </div>
  );
}

// ── Goal nudge — shown once per session for users with no goals set ───────────

function GoalNudge({ onSetGoals, onDismiss }: { onSetGoals: () => void; onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-2xl p-4">
      <span className="text-xl shrink-0">✨</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">New on Luna — set your goals</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          Tell us what you&apos;re working towards and we&apos;ll personalise everything for you.
        </p>
        <button
          onClick={onSetGoals}
          className="mt-2.5 px-4 py-1.5 rounded-lg bg-pink-500 text-white text-xs font-semibold hover:bg-pink-600 transition-colors"
        >
          Set my goals →
        </button>
      </div>
      <button onClick={onDismiss} className="shrink-0 text-gray-300 hover:text-gray-400 text-xl leading-none transition-colors mt-0.5">
        ×
      </button>
    </div>
  );
}

// ── Goal chips + edit modal ───────────────────────────────────────────────────

const GOALS = [
  { id: "stay_on_top", emoji: "🌟", name: "Stay on top of my game" },
  { id: "start_a_family", emoji: "🌱", name: "Start a family" },
  { id: "train_smarter", emoji: "💪", name: "Train smarter" },
  { id: "know_my_body", emoji: "🌿", name: "Know my body" },
];

function GoalChips({ goals, onEdit }: { goals: string[]; onEdit: () => void }) {
  const active = GOALS.filter((g) => goals.includes(g.id));
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {active.map((g) => (
        <span key={g.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-pink-50 border border-pink-200 text-xs font-semibold text-pink-700">
          {g.emoji} {g.name}
        </span>
      ))}
      <button
        onClick={onEdit}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 text-xs font-medium text-gray-500 hover:bg-gray-200 transition-colors"
      >
        ✏️ Edit goals
      </button>
    </div>
  );
}

function GoalEditModal({ currentGoals, onClose, onSave }: {
  currentGoals: string[];
  onClose: () => void;
  onSave: (goals: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>(currentGoals);
  const [showWarning, setShowWarning] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const changed = JSON.stringify([...selected].sort()) !== JSON.stringify([...currentGoals].sort());
    if (changed) { setShowWarning(true); return; }
    onClose();
  };

  const confirmSave = async () => {
    setSaving(true);
    await onSave(selected.length > 0 ? selected : ["know_my_body"]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-5">

        {!showWarning ? (
          <>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Update your goals</h2>
              <p className="text-sm text-gray-500 mt-1">Pick up to 3. Luna adjusts your content to match.</p>
            </div>
            <div className="space-y-2.5">
              {GOALS.map((goal) => {
                const isSelected = selected.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => toggle(goal.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200 bg-white hover:border-pink-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{goal.emoji}</span>
                      <span className={`font-semibold text-sm flex-1 ${isSelected ? "text-pink-700" : "text-gray-800"}`}>
                        {goal.name}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? "border-pink-500 bg-pink-500" : "border-gray-300"
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200">
                Save
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center space-y-3 py-2">
              <span className="text-4xl">⚠️</span>
              <h2 className="text-lg font-bold text-gray-900">Heads up</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Changing your goals affects your report accuracy over time. Switching frequently makes it harder to spot patterns.
              </p>
              <p className="text-sm text-gray-500">Are you sure you want to update?</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowWarning(false)} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Go back
              </button>
              <button onClick={confirmSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-pink-500 text-white text-sm font-semibold hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200 disabled:opacity-50">
                {saving ? "Saving..." : "Yes, update"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Cycle history card ────────────────────────────────────────────────────────

function CycleHistoryCard({ dates, avgCycleLength }: { dates: string[]; avgCycleLength: string }) {
  const sortedAsc = [...dates].sort();
  const recent = [...sortedAsc].reverse().slice(0, 5);

  let avgDays = parseInt(avgCycleLength) || 28;
  if (sortedAsc.length >= 2) {
    const diffs: number[] = [];
    for (let i = 1; i < sortedAsc.length; i++) {
      diffs.push(differenceInDays(parseISO(sortedAsc[i]), parseISO(sortedAsc[i - 1])));
    }
    avgDays = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
  }

  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-gray-900">Cycle History</h3>
        <span className="text-xs bg-pink-50 text-pink-600 px-3 py-1 rounded-full font-semibold">
          Avg {avgDays} days
        </span>
      </div>
      <div className="space-y-2.5">
        {recent.map((d, i) => (
          <div key={d} className="flex items-center gap-3">
            <span className="text-base">🩸</span>
            <span className="text-sm text-gray-700">{format(parseISO(d), "MMMM d, yyyy")}</span>
            {i === 0 && (
              <span className="ml-auto text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">
                Latest
              </span>
            )}
          </div>
        ))}
      </div>
      {dates.length < 3 && (
        <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-50">
          Log 3+ months of data to unlock your period report card.
        </p>
      )}
    </div>
  );
}

// ── Period nudge — slim, warm, only for daysLate 0 or 1 ─────────────────────

function PeriodNudge({ daysLate, onLog, onDismiss }: {
  daysLate: number;
  onLog: () => void;
  onDismiss: () => void;
}) {
  const text = daysLate === 0
    ? "Your period is predicted to start today — has it?"
    : "Your period may have started — have you logged it?";

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-rose-50 border border-rose-100 rounded-2xl">
      <span className="text-base shrink-0">🩸</span>
      <p className="text-sm text-rose-800 flex-1 leading-snug">{text}</p>
      <button
        onClick={onLog}
        className="shrink-0 px-3 py-1.5 bg-rose-500 text-white text-xs font-semibold rounded-lg hover:bg-rose-600 transition-colors"
      >
        Log it
      </button>
      <button onClick={onDismiss} className="shrink-0 text-rose-300 hover:text-rose-400 text-lg leading-none transition-colors">
        ×
      </button>
    </div>
  );
}

// ── Next period hero card ─────────────────────────────────────────────────────

function NextPeriodCard({ status }: { status: CycleStatus }) {
  const { nextPeriodDate, daysUntilNextPeriod, periodConfirmationNeeded, daysLate, cycleLength, dayOfCycle } = status;
  const progress = Math.min(100, Math.round((dayOfCycle / cycleLength) * 100));

  let label: string;
  if (periodConfirmationNeeded && daysLate <= 1) {
    label = daysLate === 0 ? "Period may start today" : "Period may have started — log it when ready";
  } else if (periodConfirmationNeeded) {
    label = "Log your period when it starts to keep predictions accurate";
  } else {
    label = daysUntilNextPeriod === 1
      ? "Your period starts tomorrow"
      : `Your period starts in ${daysUntilNextPeriod} days`;
  }

  return (
    <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-pink-200">
      <div className="flex items-start justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-pink-100">
          Next Period Prediction
        </p>
        <Link
          href="/profile?edit=1"
          className="text-xs font-semibold text-white/70 hover:text-white transition-colors"
        >
          Edit dates
        </Link>
      </div>
      <h3 className="text-3xl font-bold mb-0.5">
        {format(nextPeriodDate, "MMMM d, yyyy")}
      </h3>
      <p className="text-pink-100 text-sm mb-5">{label}</p>

      <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
        <div
          className="bg-white h-2 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-pink-100 mt-1.5">
        <span>Day {dayOfCycle} of {cycleLength}</span>
        <span>{100 - progress}% through cycle</span>
      </div>
    </div>
  );
}

// ── Today's focus card ────────────────────────────────────────────────────────

function TodaysFocusCard({
  phase,
  goals,
  dayOfCycle,
  firstName,
}: {
  phase: import("@/lib/predictionEngine").Phase;
  goals: string[];
  dayOfCycle: number;
  firstName: string;
}) {
  const { emoji, text } = getTodaysFocus(phase, goals, dayOfCycle);
  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm px-5 py-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Today&apos;s Focus</p>
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0 mt-0.5">{emoji}</span>
        <p className="text-sm text-gray-800 leading-relaxed">
          <span className="font-semibold">{firstName}, </span>{text}
        </p>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-6 space-y-4 animate-pulse">
      <div className="space-y-1 px-1">
        <div className="h-6 w-36 bg-gray-200 rounded-lg" />
        <div className="h-4 w-52 bg-gray-100 rounded-lg" />
      </div>
      <div className="h-36 bg-gray-200 rounded-3xl" />
      <div className="h-14 bg-gray-200 rounded-2xl" />
      <div className="h-48 bg-gray-200 rounded-3xl" />
      <div className="h-80 bg-gray-200 rounded-2xl" />
    </div>
  );
}
