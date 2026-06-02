"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { calculateCycleStatus } from "@/lib/predictionEngine";
import { Phase } from "@/lib/predictionEngine";
import PleaseSignIn from "@/components/PleaseSignIn";
import Nav from "@/components/Nav";

const TODAY = new Date().toISOString().split("T")[0];

const PHASE_MOODS: Record<Phase, string[]> = {
  Menstrual:  ["Crampy", "Fatigued", "Emotional", "Low energy", "Calm", "Bloated"],
  Follicular: ["Motivated", "Clear-headed", "Happy", "Restless", "Tired", "Energetic"],
  Ovulatory:  ["Confident", "Social", "Energetic", "Focused", "Overwhelmed", "Creative"],
  Luteal:     ["Irritable", "Anxious", "Bloated", "Foggy", "Weepy", "Calm"],
};

const ENERGY = ["Very Low", "Low", "Medium", "High"] as const;

const SYMPTOMS = ["Cramps", "Bloating", "Headache", "Fatigue", "Acne", "Breast Tenderness", "Back Pain", "Nausea"];

const WARM_RESPONSES: Record<Phase, string[]> = {
  Menstrual: [
    "Your body is doing a lot right now. Rest is not giving up — it's giving back.",
    "Being gentle with yourself today is the most productive thing you can do.",
    "You showed up and logged. That's the whole job today.",
    "Iron loss is real this week. Eat something warm and nourishing — your body will thank you.",
    "This phase asks for quiet. If you need to slow down, that's not weakness. That's wisdom.",
  ],
  Follicular: [
    "That energy you're feeling is real. Lean into it — this is your window.",
    "You're in your rise phase. Small consistent efforts now compound into something big.",
    "Showing up when you feel this good makes it easier to show up when you don't.",
    "Your brain is sharp right now. Use it on the thing that matters most.",
    "This is the phase to start things. Whatever you've been putting off — now is the time.",
  ],
  Ovulatory: [
    "You're at your peak. Use it intentionally — this window is short.",
    "Say yes to the hard conversation, the big ask, the thing you've been avoiding. Today is the day.",
    "Peak you is showing up right now. Don't waste it on small things.",
    "Your confidence is backed by biology today. Trust it.",
    "Three to five days of this. Plan your best work around it.",
  ],
  Luteal: [
    "What you're feeling is valid. Your body is working harder than you know right now.",
    "This phase asks for more from you — give yourself more too.",
    "Rest is not a reward for productivity. It's part of it. Especially now.",
    "Your appetite, your tiredness, your feelings — all real, all hormonal. Be kind to yourself.",
    "You don't have to perform right now. Just be where you are.",
  ],
};

export default function LogPage() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("Luteal");
  const [dayOfCycle, setDayOfCycle] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingLog, setExistingLog] = useState<any>(null);
  const [warmResponse, setWarmResponse] = useState("");

  // Log state
  const [moods, setMoods] = useState<string[]>([]);
  const [energy, setEnergy] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [periodStarted, setPeriodStarted] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [snap, logSnap] = await Promise.all([
        getDoc(doc(db, "users", user.uid)),
        getDoc(doc(db, "users", user.uid, "logs", TODAY)),
      ]);

      if (snap.exists()) {
        const p = snap.data().profile;
        const status = calculateCycleStatus(p);
        setPhase(status.currentPhase);
        setDayOfCycle(status.dayOfCycle);
      }

      if (logSnap.exists()) {
        const data = logSnap.data();
        setExistingLog(data);
        setMoods(data.moods ?? (data.mood ? [data.mood] : []));
        setEnergy(data.energy ?? "");
        setSymptoms(data.symptoms ?? []);
        setNote(data.note ?? "");
        setPeriodStarted(data.periodStarted ?? false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleMood = (m: string) =>
    setMoods((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]);

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(
        doc(db, "users", user.uid, "logs", TODAY),
        { date: TODAY, moods, energy, symptoms, note, periodStarted, timestamp: new Date().toISOString() },
        { merge: true }
      );

      if (periodStarted) {
        await updateDoc(doc(db, "users", user.uid), {
          "profile.lastPeriodStart": TODAY,
          "profile.periodDates": arrayUnion(TODAY),
        });
      }

      const pool = WARM_RESPONSES[phase];
      setWarmResponse(pool[dayOfCycle % pool.length]);
      setSaved(true);
      setExistingLog({ moods, energy, symptoms, note, periodStarted });
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const phaseConfig = {
    Menstrual:  { emoji: "🩸", color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-100",   chip: "bg-rose-100 text-rose-700 border-rose-200" },
    Follicular: { emoji: "🌸", color: "text-pink-600",   bg: "bg-pink-50",   border: "border-pink-100",   chip: "bg-pink-100 text-pink-700 border-pink-200" },
    Ovulatory:  { emoji: "✨", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100", chip: "bg-purple-100 text-purple-700 border-purple-200" },
    Luteal:     { emoji: "🌙", color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-100",  chip: "bg-amber-100 text-amber-700 border-amber-200" },
  };
  const cfg = phaseConfig[phase];

  return (
    <PleaseSignIn>
      <div className="min-h-screen bg-[#FDF2F8] pb-24 sm:pb-12">
        <Nav />

        {loading ? (
          <div className="max-w-lg mx-auto px-4 pt-10 space-y-4 animate-pulse">
            <div className="h-20 bg-gray-200 rounded-3xl" />
            <div className="h-48 bg-gray-200 rounded-3xl" />
          </div>
        ) : (
          <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">

            {/* Phase header */}
            <div className={`${cfg.bg} border ${cfg.border} rounded-3xl px-5 py-4 flex items-center gap-3`}>
              <span className="text-3xl">{cfg.emoji}</span>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">You are in</p>
                <p className={`text-lg font-bold ${cfg.color}`}>{phase} Phase</p>
              </div>
              {existingLog && (
                <span className="ml-auto text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                  Logged today ✓
                </span>
              )}
            </div>

            {/* Warm response after save */}
            {saved && warmResponse && (
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-100 rounded-2xl p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">
                  P
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{warmResponse}&rdquo;</p>
              </div>
            )}

            {/* Mood */}
            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5 space-y-3">
              <div>
                <p className="text-sm font-bold text-gray-900">How are you feeling?</p>
                <p className="text-xs text-gray-400 mt-0.5">Select all that apply</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {PHASE_MOODS[phase].map((m) => (
                  <button
                    key={m}
                    onClick={() => toggleMood(m)}
                    className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                      moods.includes(m)
                        ? cfg.chip
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy */}
            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5 space-y-3">
              <p className="text-sm font-bold text-gray-900">Energy level</p>
              <div className="grid grid-cols-4 gap-2">
                {ENERGY.map((e) => (
                  <button
                    key={e}
                    onClick={() => setEnergy(energy === e ? "" : e)}
                    className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      energy === e
                        ? "bg-pink-500 text-white border-pink-500"
                        : "bg-white text-gray-500 border-gray-200 hover:border-pink-300"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms */}
            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5 space-y-3">
              <p className="text-sm font-bold text-gray-900">Any symptoms?</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOMS.map((s) => (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-all ${
                      symptoms.includes(s)
                        ? "bg-purple-100 text-purple-700 border-purple-200"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5 space-y-3">
              <p className="text-sm font-bold text-gray-900">Add a note <span className="text-gray-400 font-normal">(optional)</span></p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Anything else on your mind today..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm resize-none"
              />
            </div>

            {/* Period toggle */}
            <div
              onClick={() => setPeriodStarted((p) => !p)}
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl border cursor-pointer transition-all select-none ${
                periodStarted ? "bg-rose-50 border-rose-200" : "bg-white border-pink-100 hover:border-pink-200"
              }`}
            >
              <div className={`w-10 h-6 rounded-full transition-colors relative ${periodStarted ? "bg-rose-400" : "bg-gray-200"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${periodStarted ? "translate-x-5" : "translate-x-1"}`} />
              </div>
              <div>
                <p className={`text-sm font-semibold ${periodStarted ? "text-rose-800" : "text-gray-700"}`}>
                  Period started today
                </p>
                <p className="text-xs text-gray-400">Updates your cycle prediction</p>
              </div>
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-pink-200 hover:opacity-95 disabled:opacity-60 transition-all"
            >
              {saving ? "Saving…" : saved ? "Update Log" : "Save Today's Log"}
            </button>

            <div className="pb-4" />
          </main>
        )}
      </div>
    </PleaseSignIn>
  );
}
