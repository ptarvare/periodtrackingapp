"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateCycleStatus, CycleStatus } from "@/lib/predictionEngine";
import { getRecommendations, DailyRecommendation } from "@/lib/recommendationEngine";
import { format, differenceInDays, parseISO } from "date-fns";
import PleaseSignIn from "@/components/PleaseSignIn";
import { track } from "@/lib/analytics";
import PhaseCard from "@/components/PhaseCard";
import DailyRecs from "@/components/DailyRecs";
import LogModal from "@/components/LogModal";
import Nav from "@/components/Nav";

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

            {/* ── Next period hero card ── */}
            {status && <NextPeriodCard status={status} />}

            {/* ── Period confirmation prompt ── */}
            {status?.periodConfirmationNeeded && !periodDismissed && (
              <PeriodConfirmationCard
                daysLate={status.daysLate}
                onConfirm={() => { setLogWithPeriod(true); setLogOpen(true); }}
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

            {/* ── Current phase card ── */}
            {status && <PhaseCard status={status} />}

            {/* Low data nudge */}
            {status && status.dataPoints < 3 && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <span className="text-blue-400 text-lg shrink-0 mt-0.5">📅</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900">Add more dates for better predictions</p>
                  <p className="text-xs text-blue-700 mt-0.5 leading-relaxed">
                    You&apos;ve added {status.dataPoints} {status.dataPoints === 1 ? "month" : "months"} of data. 3 months gives the most accurate predictions.
                  </p>
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
    </PleaseSignIn>
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

// ── Period confirmation card ──────────────────────────────────────────────────

function PeriodConfirmationCard({ daysLate, onConfirm, onDismiss }: {
  daysLate: number;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const message = daysLate === 0
    ? "Your period is predicted for today. Let us know so we can update your cycle."
    : daysLate === 1
    ? "Your period is 1 day late — this can be completely normal."
    : `Your period is ${daysLate} days late — this is normal and happens to everyone.`;

  return (
    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl shrink-0">🩸</span>
        <div>
          <p className="text-sm font-bold text-rose-900">Has your period started?</p>
          <p className="text-xs text-rose-600 mt-1 leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onConfirm}
          className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
        >
          Yes, it started
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 py-2.5 bg-white text-rose-700 border border-rose-200 rounded-xl text-sm font-semibold hover:bg-rose-50 transition-colors"
        >
          Not yet
        </button>
      </div>
    </div>
  );
}

// ── Next period hero card ─────────────────────────────────────────────────────

function NextPeriodCard({ status }: { status: CycleStatus }) {
  const { nextPeriodDate, daysUntilNextPeriod, periodConfirmationNeeded, daysLate, cycleLength, dayOfCycle } = status;
  const progress = Math.min(100, Math.round((dayOfCycle / cycleLength) * 100));

  let label: string;
  if (periodConfirmationNeeded) {
    label = daysLate === 0
      ? "Period may start today"
      : daysLate === 1
      ? "Period is 1 day late — this is normal"
      : `Period is ${daysLate} days late — this is normal`;
  } else {
    label = daysUntilNextPeriod === 1
      ? "Your period starts tomorrow"
      : `Your period starts in ${daysUntilNextPeriod} days`;
  }

  return (
    <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-pink-200">
      <p className="text-xs font-semibold uppercase tracking-widest text-pink-100 mb-1">
        Next Period Prediction
      </p>
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
