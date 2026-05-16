"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateCycleStatus, CycleStatus } from "@/lib/predictionEngine";
import { getRecommendations, DailyRecommendation } from "@/lib/recommendationEngine";
import { format, differenceInDays } from "date-fns";
import PleaseSignIn from "@/components/PleaseSignIn";
import PhaseCard from "@/components/PhaseCard";
import DailyRecs from "@/components/DailyRecs";
import Nav from "@/components/Nav";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [status, setStatus] = useState<CycleStatus | null>(null);
  const [recs, setRecs] = useState<DailyRecommendation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (!snap.exists() || !snap.data().onboardingCompleted || !snap.data().profile?.periodDates?.length) {
          router.push("/onboarding");
          return;
        }

        const p = snap.data().profile;
        setProfile(p);

        const cycleStatus = calculateCycleStatus(p);
        setStatus(cycleStatus);
        setRecs(getRecommendations(cycleStatus, p));
      } catch (e) {
        console.error("Dashboard fetch error", e);
      } finally {
        setLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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

            <p className="text-center text-xs text-gray-400 px-4 pb-4 leading-relaxed">
              Luna is a wellness tool, not a medical device. Always consult a healthcare professional for medical concerns.
            </p>
          </main>
        )}
      </div>
    </PleaseSignIn>
  );
}

// ── Next period hero card ─────────────────────────────────────────────────────

function NextPeriodCard({ status }: { status: CycleStatus }) {
  const { nextPeriodDate, daysUntilNextPeriod, isPeriodDue, cycleLength, dayOfCycle } = status;
  const progress = Math.min(100, Math.round((dayOfCycle / cycleLength) * 100));

  const label = isPeriodDue
    ? "Your period is due today"
    : daysUntilNextPeriod === 1
    ? "Your period starts tomorrow"
    : `Your period starts in ${daysUntilNextPeriod} days`;

  return (
    <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl shadow-pink-200">
      <p className="text-xs font-semibold uppercase tracking-widest text-pink-100 mb-1">
        Next Period Prediction
      </p>
      <h3 className="text-3xl font-bold mb-0.5">
        {format(nextPeriodDate, "MMMM d, yyyy")}
      </h3>
      <p className="text-pink-100 text-sm mb-5">{label}</p>

      {/* Cycle progress */}
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
      <div className="h-48 bg-gray-200 rounded-3xl" />
      <div className="h-80 bg-gray-200 rounded-2xl" />
    </div>
  );
}
