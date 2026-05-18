"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, parseISO } from "date-fns";
import PleaseSignIn from "@/components/PleaseSignIn";
import { track } from "@/lib/analytics";

export default function OnboardingPage() {
    const { user } = useAuth();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [name, setName] = useState(user?.displayName ?? "");
    const [age, setAge] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");

    const [periodDates, setPeriodDates] = useState<string[]>([]);
    const [dateInput, setDateInput] = useState("");
    const [periodDuration, setPeriodDuration] = useState(5);
    const [avgCycleLength, setAvgCycleLength] = useState("28");

    const [loading, setLoading] = useState(false);

    const addDate = () => {
        if (!dateInput || periodDates.includes(dateInput)) return;
        setPeriodDates((prev) => [...prev, dateInput].sort());
        setDateInput("");
    };

    const removeDate = (d: string) => setPeriodDates((prev) => prev.filter((x) => x !== d));

    const handleSubmit = async () => {
        if (!user || periodDates.length === 0) return;
        setLoading(true);
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
                    avgCycleLength,
                    conditions: [],
                    goals: [],
                },
                onboardingCompleted: true,
                createdAt: new Date().toISOString(),
            });
            track("onboarding_completed", { period_dates_count: periodDates.length, avg_cycle_length: avgCycleLength });
            router.push("/dashboard");
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const dataQuality =
        periodDates.length === 0 ? null
        : periodDates.length === 1 ? { label: "Add 2 more months for accurate predictions", ok: false }
        : periodDates.length === 2 ? { label: "Add 1 more month for best accuracy", ok: false }
        : { label: `${periodDates.length} months added — predictions will be accurate`, ok: true };

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
                        {[1, 2].map((s) => (
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

                    {/* ── Step 2: Cycle info ── */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Let&apos;s predict your cycle</h1>
                                <p className="text-gray-500 mt-1.5 leading-relaxed text-sm">
                                    Add your last 3 period start dates so we can figure out which phase you&apos;re in and predict when your next one is coming.
                                </p>
                            </div>

                            {/* Period start dates */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Period start dates
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="date" value={dateInput}
                                        onChange={(e) => setDateInput(e.target.value)}
                                        max={new Date().toISOString().split("T")[0]}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm"
                                    />
                                    <button
                                        onClick={addDate} disabled={!dateInput}
                                        className="px-5 py-3 rounded-xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-40 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>

                                {periodDates.length === 0 && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        Pick the first day of each past period and tap &ldquo;Add&rdquo;.
                                    </p>
                                )}

                                {periodDates.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {[...periodDates].reverse().map((d) => (
                                            <div key={d} className="flex items-center justify-between px-4 py-2.5 bg-pink-50 border border-pink-100 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-pink-400 text-sm">🩸</span>
                                                    <span className="text-sm font-medium text-gray-700">{format(parseISO(d), "MMMM d, yyyy")}</span>
                                                </div>
                                                <button onClick={() => removeDate(d)} className="text-gray-300 hover:text-red-400 text-xl leading-none transition-colors">×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {dataQuality && (
                                    <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm ${dataQuality.ok ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                                        <span>{dataQuality.ok ? "✓" : "○"}</span>
                                        <span>{dataQuality.label}</span>
                                    </div>
                                )}
                            </div>

                            {/* Period duration */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                <p className="text-xs text-gray-400 mt-1.5">Days selected: {periodDuration}</p>
                            </div>

                            {/* Average cycle length */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                                    {periodDates.length >= 2 && " We'll calculate this automatically from your dates."}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button onClick={() => setStep(1)} disabled={loading} className="px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors">
                                Back
                            </button>
                        ) : <div />}

                        {step < 2 ? (
                            <button onClick={() => setStep(2)} className="px-8 py-3 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200">
                                Next →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading || periodDates.length === 0}
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
