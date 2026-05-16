"use client";

import { useState } from "react";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

const SYMPTOMS = [
  "Cramps", "Bloating", "Headache", "Fatigue",
  "Acne", "Breast Tenderness", "Back Pain", "Nausea",
];

const MOODS = ["Happy", "Calm", "Energetic", "Anxious", "Irritable", "Sad", "Neutral"];

const ENERGY = [
  { label: "Very Low", color: "bg-red-100 text-red-700 border-red-200" },
  { label: "Low",      color: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "Medium",   color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  { label: "High",     color: "bg-green-100 text-green-700 border-green-200" },
];

interface LogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function LogModal({ isOpen, onClose, onSave }: LogModalProps) {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [periodStarted, setPeriodStarted] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const toggleSymptom = (s: string) =>
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((i) => i !== s) : [...prev, s]
    );

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(
        doc(db, "users", user.uid, "logs", date),
        { date, symptoms, mood, energy, periodStarted, timestamp: new Date().toISOString() },
        { merge: true }
      );

      if (periodStarted) {
        await updateDoc(doc(db, "users", user.uid), {
          "profile.lastPeriodStart": date,
        });
      }

      onSave();
      handleClose();
    } catch (e) {
      console.error("Log save error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSymptoms([]);
    setMood("");
    setEnergy("");
    setPeriodStarted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 sticky top-0 bg-white border-b border-gray-50 z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Log Today</h2>
            <p className="text-xs text-gray-400 mt-0.5">Track how you&apos;re feeling</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all"
            />
          </div>

          {/* Period toggle */}
          <div
            onClick={() => setPeriodStarted((p) => !p)}
            className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all select-none ${
              periodStarted
                ? "bg-red-50 border-red-300"
                : "bg-gray-50 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <div
              className={`w-10 h-6 rounded-full transition-colors relative ${
                periodStarted ? "bg-red-400" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  periodStarted ? "translate-x-5" : "translate-x-1"
                }`}
              />
            </div>
            <div>
              <p className={`text-sm font-semibold ${periodStarted ? "text-red-800" : "text-gray-700"}`}>
                Period started today
              </p>
              <p className="text-xs text-gray-400">This will update your cycle prediction</p>
            </div>
          </div>

          {/* Energy */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Energy Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ENERGY.map(({ label, color }) => (
                <button
                  key={label}
                  onClick={() => setEnergy(energy === label ? "" : label)}
                  className={`py-2 rounded-xl border text-xs font-medium transition-all ${
                    energy === label
                      ? color
                      : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(mood === m ? "" : m)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    mood === m
                      ? "bg-pink-100 text-pink-700 border border-pink-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Symptoms
            </label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOMS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    symptoms.includes(s)
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving…" : "Save Log"}
          </button>
        </div>
      </div>
    </div>
  );
}
