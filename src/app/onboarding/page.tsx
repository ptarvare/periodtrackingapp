"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, parseISO } from "date-fns";
import PleaseSignIn from "@/components/PleaseSignIn";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [age, setAge] = useState("");
    const [weight, setWeight] = useState("");
    const [periodDates, setPeriodDates] = useState<string[]>([]);
    const [dateInput, setDateInput] = useState("");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const router = useRouter();

    const addDate = () => {
        if (!dateInput) return;
        if (periodDates.includes(dateInput)) return;
        setPeriodDates((prev) => [...prev, dateInput].sort());
        setDateInput("");
    };

    const removeDate = (d: string) => {
        setPeriodDates((prev) => prev.filter((x) => x !== d));
    };

    const handleSubmit = async () => {
        if (!user || periodDates.length === 0) return;
        setLoading(true);
        try {
            await setDoc(doc(db, "users", user.uid), {
                profile: {
                    name: user.displayName,
                    email: user.email,
                    age,
                    weight,
                    periodDates,
                    periodDuration: "5",
                    conditions: [],
                    goals: [],
                },
                onboardingCompleted: true,
                createdAt: new Date().toISOString(),
            });
            router.push("/dashboard");
        } catch (error) {
            console.error("Error saving profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const dataQuality =
        periodDates.length === 0
            ? null
            : periodDates.length === 1
            ? { label: "Add 2 more for accurate predictions", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" }
            : periodDates.length === 2
            ? { label: "Add 1 more for best accuracy", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" }
            : { label: `${periodDates.length} months added — predictions will be accurate`, color: "text-green-700", bg: "bg-green-50 border-green-200" };

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
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-3">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Let&apos;s get to know you
                            </h1>
                            <span className="text-sm font-medium text-gray-400">{step} / 2</span>
                        </div>
                        <div className="flex gap-2 mb-3">
                            {[1, 2].map((s) => (
                                <div
                                    key={s}
                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                                        s <= step ? "bg-pink-500" : "bg-gray-200"
                                    }`}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-400">
                            {step === 1 ? "Basic info" : "Period history"}
                        </p>
                    </div>

                    {/* Step 1 */}
                    {step === 1 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                                <input
                                    type="number"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                    placeholder="e.g. 26"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all"
                                    placeholder="e.g. 60"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {step === 2 && (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h2 className="text-base font-semibold text-gray-800 mb-1">
                                    Add your period start dates
                                </h2>
                                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                                    Enter the first day of each of your recent periods. We need at least 3 months to predict your cycle accurately.
                                </p>

                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={dateInput}
                                        onChange={(e) => setDateInput(e.target.value)}
                                        max={new Date().toISOString().split("T")[0]}
                                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm"
                                    />
                                    <button
                                        onClick={addDate}
                                        disabled={!dateInput}
                                        className="px-5 py-3 rounded-xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-40 transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Added dates list */}
                            {periodDates.length > 0 && (
                                <div className="space-y-2">
                                    {[...periodDates].reverse().map((d) => (
                                        <div
                                            key={d}
                                            className="flex items-center justify-between px-4 py-2.5 bg-pink-50 border border-pink-100 rounded-xl"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="text-pink-400 text-sm">🩸</span>
                                                <span className="text-sm font-medium text-gray-700">
                                                    {format(parseISO(d), "MMMM d, yyyy")}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => removeDate(d)}
                                                className="text-gray-300 hover:text-red-400 text-lg leading-none transition-colors"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Data quality indicator */}
                            {dataQuality && (
                                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${dataQuality.bg}`}>
                                    <span>{periodDates.length >= 3 ? "✓" : "○"}</span>
                                    <span className={dataQuality.color}>{dataQuality.label}</span>
                                </div>
                            )}

                            {periodDates.length === 0 && (
                                <p className="text-xs text-gray-400 text-center">
                                    Pick a date above and tap &ldquo;Add&rdquo; to get started.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        {step > 1 ? (
                            <button
                                onClick={() => setStep(1)}
                                className="px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                                disabled={loading}
                            >
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 2 ? (
                            <button
                                onClick={() => setStep(2)}
                                className="px-8 py-3 rounded-xl bg-pink-500 text-white font-medium hover:bg-pink-600 transition-colors shadow-lg shadow-pink-200"
                            >
                                Next
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
