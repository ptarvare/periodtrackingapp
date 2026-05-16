"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, parseISO } from "date-fns";
import PleaseSignIn from "@/components/PleaseSignIn";
import Nav from "@/components/Nav";

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [periodDates, setPeriodDates] = useState<string[]>([]);
    const [dateInput, setDateInput] = useState("");
    const [periodDuration, setPeriodDuration] = useState(5);
    const [avgCycleLength, setAvgCycleLength] = useState("28");

    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const snap = await getDoc(doc(db, "users", user.uid));
                if (snap.exists()) {
                    const p = snap.data().profile ?? {};
                    setName(p.name ?? user.displayName ?? "");
                    setAge(p.age ?? "");
                    setWeight(p.weight ?? "");
                    setHeight(p.height ?? "");
                    setPeriodDates(p.periodDates ?? []);
                    setPeriodDuration(parseInt(p.periodDuration) || 5);
                    setAvgCycleLength(p.avgCycleLength ?? "28");
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        })();
    }, [user]);

    const addDate = () => {
        if (!dateInput || periodDates.includes(dateInput)) return;
        setPeriodDates((prev) => [...prev, dateInput].sort());
        setDateInput("");
    };

    const removeDate = (d: string) => setPeriodDates((prev) => prev.filter((x) => x !== d));

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            await setDoc(doc(db, "users", user.uid), {
                profile: {
                    name, age, weight, height,
                    email: user.email,
                    periodDates,
                    periodDuration: String(periodDuration),
                    avgCycleLength,
                    conditions: [],
                    goals: [],
                },
                onboardingCompleted: true,
                createdAt: new Date().toISOString(),
            });
            setSaved(true);
            setTimeout(() => {
                router.push("/dashboard");
            }, 800);
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <PleaseSignIn>
            <div className="min-h-screen bg-[#FDF2F8] pb-24 sm:pb-12">
                <Nav />
                {loading ? (
                    <div className="max-w-lg mx-auto px-4 pt-10 space-y-4 animate-pulse">
                        <div className="h-8 w-40 bg-gray-200 rounded-xl" />
                        <div className="h-64 bg-gray-200 rounded-2xl" />
                    </div>
                ) : (
                    <main className="max-w-lg mx-auto px-4 pt-6 space-y-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                            <p className="text-sm text-gray-500 mt-1">Update your details or fix your period dates.</p>
                        </div>

                        {/* Basic info */}
                        <Section title="Basic Info">
                            <Field label="Name">
                                <input value={name} onChange={(e) => setName(e.target.value)}
                                    className={inputCls} placeholder="Your name" />
                            </Field>
                            <Field label="Age">
                                <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
                                    className={inputCls} placeholder="e.g. 26" />
                            </Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Weight (kg)">
                                    <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                                        className={inputCls} placeholder="e.g. 60" />
                                </Field>
                                <Field label="Height (cm)">
                                    <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                                        className={inputCls} placeholder="e.g. 165" />
                                </Field>
                            </div>
                        </Section>

                        {/* Period dates */}
                        <Section title="Period Start Dates">
                            <p className="text-xs text-gray-500 -mt-1 mb-3">
                                Add or remove the first day of each of your past periods. More dates = more accurate predictions.
                            </p>

                            <div className="flex gap-2">
                                <input type="date" value={dateInput}
                                    onChange={(e) => setDateInput(e.target.value)}
                                    max={new Date().toISOString().split("T")[0]}
                                    className={`${inputCls} flex-1`} />
                                <button onClick={addDate} disabled={!dateInput}
                                    className="px-5 py-3 rounded-xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-40 transition-colors">
                                    Add
                                </button>
                            </div>

                            {periodDates.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-3">No dates added yet.</p>
                            )}

                            <div className="space-y-2 mt-3">
                                {[...periodDates].reverse().map((d) => (
                                    <div key={d} className="flex items-center justify-between px-4 py-2.5 bg-pink-50 border border-pink-100 rounded-xl">
                                        <div className="flex items-center gap-2">
                                            <span className="text-pink-400">🩸</span>
                                            <span className="text-sm font-medium text-gray-700">{format(parseISO(d), "MMMM d, yyyy")}</span>
                                        </div>
                                        <button onClick={() => removeDate(d)}
                                            className="text-gray-300 hover:text-red-400 text-xl leading-none transition-colors">×</button>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* Cycle details */}
                        <Section title="Cycle Details">
                            <Field label="How many days does your period usually last?">
                                <div className="flex gap-2 flex-wrap">
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
                                        <button key={d} onClick={() => setPeriodDuration(d)}
                                            className={`w-11 h-11 rounded-xl text-sm font-semibold border transition-all ${
                                                periodDuration === d
                                                    ? "bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-200"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                                            }`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </Field>
                            <Field label="Average cycle length (days)">
                                <div className="relative">
                                    <input type="number" value={avgCycleLength}
                                        onChange={(e) => setAvgCycleLength(e.target.value)}
                                        className={inputCls} placeholder="28" />
                                    <span className="absolute right-4 top-3.5 text-gray-400 text-sm">days</span>
                                </div>
                            </Field>
                        </Section>

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            disabled={saving || saved}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-200 hover:opacity-95 disabled:opacity-70 transition-all"
                        >
                            {saved ? "Saved! Redirecting…" : saving ? "Saving…" : "Save Changes"}
                        </button>

                        <p className="text-center text-xs text-gray-400 pb-4">
                            Changes are saved to your account and predictions update immediately.
                        </p>
                    </main>
                )}
            </div>
        </PleaseSignIn>
    );
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm bg-white";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h2>
            {children}
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            {children}
        </div>
    );
}
