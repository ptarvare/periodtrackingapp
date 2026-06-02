"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format, parseISO } from "date-fns";
import PleaseSignIn from "@/components/PleaseSignIn";
import Nav from "@/components/Nav";

export default function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile fields
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
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const initials = name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.displayName?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

  const recentDates = [...periodDates].sort().reverse().slice(0, 5);

  return (
    <PleaseSignIn>
      <div className="min-h-screen bg-[#FDF2F8] pb-24 sm:pb-12">
        <Nav />

        {loading ? (
          <div className="max-w-lg mx-auto px-4 pt-10 space-y-4 animate-pulse">
            <div className="h-24 bg-gray-200 rounded-3xl" />
            <div className="h-48 bg-gray-200 rounded-3xl" />
          </div>
        ) : editing ? (
          <EditView
            name={name} setName={setName}
            age={age} setAge={setAge}
            weight={weight} setWeight={setWeight}
            height={height} setHeight={setHeight}
            periodDates={periodDates}
            dateInput={dateInput} setDateInput={setDateInput}
            addDate={addDate} removeDate={removeDate}
            periodDuration={periodDuration} setPeriodDuration={setPeriodDuration}
            avgCycleLength={avgCycleLength} setAvgCycleLength={setAvgCycleLength}
            saving={saving}
            onSave={handleSave}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <ViewProfile
            name={name}
            email={user?.email ?? ""}
            photoURL={user?.photoURL ?? null}
            initials={initials}
            age={age} weight={weight} height={height}
            periodDuration={periodDuration}
            avgCycleLength={avgCycleLength}
            recentDates={recentDates}
            totalDates={periodDates.length}
            onEdit={() => setEditing(true)}
          />
        )}
      </div>
    </PleaseSignIn>
  );
}

// ── View mode ─────────────────────────────────────────────────────────────────

function ViewProfile({
  name, email, photoURL, initials,
  age, weight, height, periodDuration, avgCycleLength,
  recentDates, totalDates,
  onEdit,
}: {
  name: string; email: string; photoURL: string | null; initials: string;
  age: string; weight: string; height: string;
  periodDuration: number; avgCycleLength: string;
  recentDates: string[]; totalDates: number;
  onEdit: () => void;
}) {
  return (
    <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      {/* Avatar + name */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 flex items-center gap-4">
        {photoURL ? (
          <img src={photoURL} alt="" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-pink-200" />
        ) : (
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 truncate">{name || "Your Name"}</h1>
          <p className="text-sm text-gray-400 mt-0.5 truncate">{email}</p>
        </div>
        <button
          onClick={onEdit}
          className="shrink-0 px-4 py-2 rounded-xl bg-pink-50 text-pink-600 text-sm font-semibold border border-pink-100 hover:bg-pink-100 transition-colors"
        >
          Edit
        </button>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Details</h2>
        <div className="space-y-3">
          {[
            { label: "Age",           value: age ? `${age} years` : "—",         emoji: "🎂" },
            { label: "Height",        value: height ? `${height} cm` : "—",       emoji: "📏" },
            { label: "Weight",        value: weight ? `${weight} kg` : "—",       emoji: "⚖️" },
            { label: "Cycle length",  value: `${avgCycleLength} days`,            emoji: "🔄" },
            { label: "Period length", value: `${periodDuration} days`,            emoji: "📅" },
          ].map(({ label, value, emoji }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{emoji}</span>
                <span className="text-sm text-gray-500">{label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Period history */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Period History</h2>
          {totalDates > 0 && (
            <span className="text-xs bg-pink-50 text-pink-600 px-2.5 py-1 rounded-full font-semibold">
              {totalDates} {totalDates === 1 ? "cycle" : "cycles"} tracked
            </span>
          )}
        </div>

        {recentDates.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-3">No period dates logged yet.</p>
        ) : (
          <div className="space-y-2.5">
            {recentDates.map((d, i) => (
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
            {totalDates > 5 && (
              <p className="text-xs text-gray-400 pt-2">+{totalDates - 5} more — tap Edit to manage all dates</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// ── Edit mode ─────────────────────────────────────────────────────────────────

function EditView({
  name, setName, age, setAge, weight, setWeight, height, setHeight,
  periodDates, dateInput, setDateInput, addDate, removeDate,
  periodDuration, setPeriodDuration, avgCycleLength, setAvgCycleLength,
  saving, onSave, onCancel,
}: any) {
  return (
    <main className="max-w-lg mx-auto px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between px-1">
        <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
        <button onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Cancel
        </button>
      </div>

      {/* Basic info */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5 space-y-4">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Details</h2>
        <EditField label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Your name" />
        </EditField>
        <EditField label="Age">
          <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className={inputCls} placeholder="e.g. 26" />
        </EditField>
        <div className="grid grid-cols-2 gap-3">
          <EditField label="Height (cm)">
            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className={inputCls} placeholder="e.g. 165" />
          </EditField>
          <EditField label="Weight (kg)">
            <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputCls} placeholder="e.g. 60" />
          </EditField>
        </div>
        <EditField label="Average cycle length (days)">
          <input type="number" value={avgCycleLength} onChange={(e) => setAvgCycleLength(e.target.value)} className={inputCls} placeholder="28" />
        </EditField>
        <EditField label="Period duration (days)">
          <div className="flex gap-2 flex-wrap">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((d) => (
              <button key={d} onClick={() => setPeriodDuration(d)}
                className={`w-11 h-11 rounded-xl text-sm font-semibold border transition-all ${
                  periodDuration === d
                    ? "bg-pink-500 text-white border-pink-500"
                    : "bg-white text-gray-600 border-gray-200 hover:border-pink-300"
                }`}>
                {d}
              </button>
            ))}
          </div>
        </EditField>
      </div>

      {/* Period dates */}
      <div className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5 space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Period Start Dates</h2>
        <p className="text-xs text-gray-400">Add the first day of each past period. More dates = more accurate predictions.</p>
        <div className="flex gap-2">
          <input type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)}
            max={new Date().toISOString().split("T")[0]} className={`${inputCls} flex-1`} />
          <button onClick={addDate} disabled={!dateInput}
            className="px-5 py-3 rounded-xl bg-pink-500 text-white text-sm font-medium hover:bg-pink-600 disabled:opacity-40 transition-colors">
            Add
          </button>
        </div>
        {[...periodDates].sort().reverse().map((d) => (
          <div key={d} className="flex items-center justify-between px-4 py-2.5 bg-pink-50 border border-pink-100 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-pink-400">🩸</span>
              <span className="text-sm font-medium text-gray-700">{format(parseISO(d), "MMMM d, yyyy")}</span>
            </div>
            <button onClick={() => removeDate(d)} className="text-gray-300 hover:text-red-400 text-xl leading-none transition-colors">×</button>
          </div>
        ))}
      </div>

      {/* Save */}
      <button onClick={onSave} disabled={saving}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-200 hover:opacity-95 disabled:opacity-70 transition-all">
        {saving ? "Saving…" : "Save Changes"}
      </button>

      <div className="pb-4" />
    </main>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-sm bg-white";

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
