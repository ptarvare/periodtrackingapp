"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, parseISO, addDays, differenceInDays } from "date-fns";
import PleaseSignIn from "@/components/PleaseSignIn";
import { track } from "@/lib/analytics";

const GOALS = [
    {
        id: "stay_on_top",
        emoji: "🌟",
        name: "Stay on top of my game",
        description: "Plan your life, work, and energy around your cycle",
    },
    {
        id: "start_a_family",
        emoji: "🌱",
        name: "Start a family",
        description: "Track your fertile window and optimize for conception",
    },
    {
        id: "train_smarter",
        emoji: "💪",
        name: "Train smarter",
        description: "Know when to push, when to recover, and how to fuel your body",
    },
    {
        id: "know_my_body",
        emoji: "🌿",
        name: "Know my body",
        description: "Understand your cycle, manage symptoms, and feel more in control",
    },
];

const DATE_CHIPS = [
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1 },
    { label: "1 week ago", days: 7 },
];

const SLOT_LABELS = [
    "When did your last period start?",
    "And the one before that?",
    "One more for best accuracy",
];

function daysAgoToDate(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().split("T")[0];
}

export default function OnboardingPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [name, setName] = useState(user?.displayName ?? "");
    const [age, setAge] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");

    const [slots, setSlots] = useState<[string | null, string | null, string | null]>([null, null, null]);
    const [showCalendarFor, setShowCalendarFor] = useState<number | null>(null);
    const [calendarInput, setCalendarInput] = useState("");

    const [periodDuration, setPeriodDuration] = useState(5);
    const [avgCycleLength, setAvgCycleLength] = useState("28");

    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const filledSlots = slots.filter((d): d is string => d !== null);
    const filledCount = filledSlots.length;

    // Auto-calculate avg cycle length when 2+ slots are filled
    const autoAvgCycleLength: number | null = (() => {
        const dates = [...slots].filter((d): d is string => d !== null).sort();
        if (dates.length < 2) return null;
        const diffs: number[] = [];
        for (let i = 1; i < dates.length; i++) {
            diffs.push(differenceInDays(parseISO(dates[i]), parseISO(dates[i - 1])));
        }
        return Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
    })();

    const setSlotDate = (idx: number, dateStr: string) => {
        setSlots((prev) => {
            const next = [...prev] as [string | null, string | null, string | null];
            next[idx] = dateStr;
            return next;
        });
        setShowCalendarFor(null);
        setCalendarInput("");
    };

    const clearSlot = (idx: number) => {
        setSlots((prev) => {
            const next = [...prev] as [string | null, string | null, string | null];
            next[idx] = null;
            // Clear subsequent slots
            for (let i = idx + 1; i < 3; i++) next[i] = null;
            return next;
        });
        setShowCalendarFor(null);
    };

    const adjustSlot = (idx: number, delta: number) => {
        setSlots((prev) => {
            const next = [...prev] as [string | null, string | null, string | null];
            if (!next[idx]) return prev;
            const adjusted = addDays(parseISO(next[idx]!), delta);
            if (adjusted > new Date()) return prev;
            next[idx] = adjusted.toISOString().split("T")[0];
            return next;
        });
    };

    // Smart suggestion for slots 1 and 2 based on previous slot + cycle length
    const suggestedDate = (slotIdx: number): string | null => {
        if (slotIdx === 0) return null;
        const prevDate = slots[slotIdx - 1];
        if (!prevDate) return null;
        const cycleLen = autoAvgCycleLength ?? parseInt(avgCycleLength) ?? 28;
        const suggested = addDays(parseISO(prevDate), -cycleLen);
        if (suggested >= new Date()) return null;
        return suggested.toISOString().split("T")[0];
    };

    const toggleGoal = (id: string) => {
        setSelectedGoals((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        if (!user || filledCount === 0) return;
        setLoading(true);
        const periodDates = slots.filter((d): d is string => d !== null).sort();
        const goalsToSave = selectedGoals.length > 0 ? selectedGoals : ["know_my_body"];
        const cycleLengthToSave = autoAvgCycleLength ? String(autoAvgCycleLength) : avgCycleLength;
        try {
            await setDoc(doc(db, "users", user.uid), {
                profile: {
                    name,
                    email: user.email,
                    age,
                    weight,
                    height,
                    periodDates,
                    periodDuration: String(periodDuration),
                    avgCycleLength: cycleLengthToSave,
                    conditions: [],
                    goals: goalsToSave,
                },
                onboardingCompleted: true,
                createdAt: new Date().toISOString(),
            });
            track("onboarding_completed", {
                period_dates_count: filledCount,
                avg_cycle_length: cycleLengthToSave,
                goals: goalsToSave,
            });
            router.push("/dashboard");
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const dataQuality =
        filledCount === 0 ? null
        : filledCount === 1 ? { label: "You're all set — add 2 more dates to improve accuracy." }
        : filledCount === 2 ? { label: "Almost there — one more date makes predictions even better." }
        : { label: `${filledCount} periods added — predictions will be accurate.` };

    return (
        <PleaseSignIn>
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8">

                    <div className="text-center mb-6">
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                            Luna
                        </span>
                    </div>

                    {/* Progress */}
                    <div className="flex gap-2 mb-8">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? "bg-pink-500" : "bg-gray-200"}`} />
                        ))}
                    </div>

                    {/* ── Step 1: Basic info ── */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Welcome to Luna 🌙</h1>
                                <p className="text-gray-500 mt-1.5 leading-relaxed text-sm">
                                    We want to personalise this whole experience for you. Tell us a little about yourself.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name</label>
                                <input
                                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                    placeholder="e.g. Pooja"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                                <input
                                    type="number" value={age} onChange={(e) => setAge(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                    placeholder="e.g. 26"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (kg)</label>
                                    <input
                                        type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                        placeholder="e.g. 60"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Height (cm)</label>
                                    <input
                                        type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                        placeholder="e.g. 165"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Step 2: Goals ── */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">What&apos;s your focus?</h1>
                                <p className="text-gray-500 mt-1.5 leading-relaxed text-sm">
                                    Pick your goals and Luna will personalise everything — food, exercise, and insights — around what matters to you.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {GOALS.map((goal) => {
                                    const selected = selectedGoals.includes(goal.id);
                                    return (
                                        <button
                                            key={goal.id}
                                            onClick={() => toggleGoal(goal.id)}
                                            className={`w-full text-left px-4 py-4 rounded-2xl border-2 transition-all duration-200 ${
                                                selected
                                                    ? "border-pink-500 bg-pink-50 shadow-sm shadow-pink-100"
                                                    : "border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50/40"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{goal.emoji}</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-semibold text-sm ${selected ? "text-pink-700" : "text-gray-800"}`}>
                                                        {goal.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                                                        {goal.description}
                                                    </p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                                                    selected ? "border-pink-500 bg-pink-500" : "border-gray-300"
                                                }`}>
                                                    {selected && (
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

                            {selectedGoals.length === 0 && (
                                <p className="text-xs text-gray-400 text-center">
                                    Not sure? Skip this — we&apos;ll default to &ldquo;Know my body&rdquo; and you can always update it later.
                                </p>
                            )}
                        </div>
                    )}

                    {/* ── Step 3: Cycle info with relative picker ── */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">One last thing</h1>
                                <p className="text-gray-500 mt-1.5 leading-relaxed text-sm">
                                    {selectedGoals.length > 0
                                        ? `To personalise your ${GOALS.find(g => g.id === selectedGoals[0])?.name.toLowerCase()} plan, we need to know where you are in your cycle.`
                                        : "Tell us when your last period started so we can predict your cycle and know which phase you're in."}
                                </p>
                            </div>

                            {/* Slot pickers */}
                            <div className="space-y-5">
                                {([0, 1, 2] as const).map((slotIdx) => {
                                    if (slotIdx > 0 && !slots[slotIdx - 1]) return null;
                                    const currentDate = slots[slotIdx];
                                    const suggested = suggestedDate(slotIdx);

                                    return (
                                        <div key={slotIdx} className="space-y-2.5 animate-in fade-in duration-300">
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-semibold text-gray-700">
                                                    {SLOT_LABELS[slotIdx]}
                                                </label>
                                                {slotIdx > 0 && !currentDate && (
                                                    <span className="text-xs text-gray-400">Optional</span>
                                                )}
                                            </div>

                                            {currentDate ? (
                                                /* Confirmed */
                                                <div className="flex items-center justify-between px-4 py-3 bg-pink-50 border border-pink-200 rounded-2xl">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-pink-400 text-sm">🩸</span>
                                                        <span className="text-sm font-semibold text-gray-800">
                                                            {format(parseISO(currentDate), "MMMM d, yyyy")}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => adjustSlot(slotIdx, -1)}
                                                            className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 text-base flex items-center justify-center hover:bg-pink-200 transition-colors"
                                                            title="One day earlier"
                                                        >‹</button>
                                                        <button
                                                            onClick={() => adjustSlot(slotIdx, 1)}
                                                            disabled={addDays(parseISO(currentDate), 1) > new Date()}
                                                            className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 text-base flex items-center justify-center hover:bg-pink-200 transition-colors disabled:opacity-30"
                                                            title="One day later"
                                                        >›</button>
                                                        <button
                                                            onClick={() => clearSlot(slotIdx)}
                                                            className="w-7 h-7 rounded-lg text-gray-300 hover:text-red-400 text-xl flex items-center justify-center transition-colors"
                                                        >×</button>
                                                    </div>
                                                </div>
                                            ) : showCalendarFor === slotIdx ? (
                                                /* Calendar fallback */
                                                <div className="flex gap-2">
                                                    <input
                                                        type="date"
                                                        value={calendarInput}
                                                        onChange={(e) => setCalendarInput(e.target.value)}
                                                        max={new Date().toISOString().split("T")[0]}
                                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none text-sm"
                                                    />
                                                    <button
                                                        onClick={() => { if (calendarInput) setSlotDate(slotIdx, calendarInput); }}
                                                        disabled={!calendarInput}
                                                        className="px-4 py-3 rounded-xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-40 transition-colors"
                                                    >Set</button>
                                                </div>
                                            ) : (
                                                /* Chip picker */
                                                <div className="space-y-2.5">
                                                    {/* Smart suggestion for slots 1 and 2 */}
                                                    {suggested && (
                                                        <button
                                                            onClick={() => setSlotDate(slotIdx, suggested)}
                                                            className="w-full px-4 py-2.5 rounded-xl border-2 border-pink-300 bg-pink-50 text-sm font-semibold text-pink-700 text-left hover:bg-pink-100 transition-colors"
                                                        >
                                                            ✓ About {format(parseISO(suggested), "MMMM d")} — does that sound right?
                                                        </button>
                                                    )}
                                                    <div className="flex flex-wrap gap-2">
                                                        {DATE_CHIPS.map((chip) => (
                                                            <button
                                                                key={chip.label}
                                                                onClick={() => setSlotDate(slotIdx, daysAgoToDate(chip.days))}
                                                                className="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:border-pink-400 hover:bg-pink-50 transition-all"
                                                            >
                                                                {chip.label}
                                                            </button>
                                                        ))}
                                                        <button
                                                            onClick={() => { setShowCalendarFor(slotIdx); setCalendarInput(""); }}
                                                            className="px-3 py-2 rounded-xl border border-dashed border-gray-300 bg-white text-sm text-gray-500 hover:border-gray-400 transition-all"
                                                        >
                                                            Pick a date →
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Data quality — always encouraging */}
                            {dataQuality && (
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm bg-green-50 border-green-200 text-green-700">
                                    <span>✓</span>
                                    <span>{dataQuality.label}</span>
                                </div>
                            )}

                            {/* Period duration */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    How many days does your period usually last?
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => setPeriodDuration(d)}
                                            className={`w-11 h-11 rounded-xl text-sm font-semibold border transition-all ${
                                                periodDuration === d
                                                    ? "bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                                            }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Average cycle length — hidden when auto-calculated */}
                            {autoAvgCycleLength ? (
                                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
                                    <span>📊</span>
                                    <span>Calculated cycle length: <strong>{autoAvgCycleLength} days</strong></span>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Average cycle length
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number" value={avgCycleLength}
                                            onChange={(e) => setAvgCycleLength(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                            placeholder="28"
                                        />
                                        <span className="absolute right-4 top-3.5 text-gray-400 text-sm">days</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1.5">
                                        From day 1 of one period to day 1 of the next. Most cycles are 21–35 days.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button onClick={() => setStep(step - 1)} disabled={loading} className="px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors">
                                Back
                            </button>
                        ) : <div />}

                        {step < 3 ? (
                            <button
                                onClick={() => setStep(step + 1)}
                                disabled={step === 3 && slots[0] === null}
                                className="px-8 py-3 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200 disabled:opacity-50"
                            >
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || slots[0] === null}
                                className="px-8 py-3 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200 disabled:opacity-50"
                            >
                                {loading ? "Setting up..." : "See my phase →"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </PleaseSignIn>
    );
}
