"use client";

import { useState } from "react";
import { DailyRecommendation } from "@/lib/recommendationEngine";
import { track } from "@/lib/analytics";

const TABS = [
  { key: "diet",       label: "Food",       emoji: "🥗" },
  { key: "workout",    label: "Exercise",   emoji: "💪" },
  { key: "supplements",label: "Supplements",emoji: "💊" },
  { key: "lifestyle",  label: "Lifestyle",  emoji: "🌿" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function DailyRecs({ recs }: { recs: DailyRecommendation }) {
  const [active, setActive] = useState<TabKey>("diet");

  const handleTabClick = (key: TabKey) => {
    setActive(key);
    track("recommendation_tab_clicked", { tab: key });
  };

  const items = recs[active] ?? [];

  return (
    <div className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-base font-bold text-gray-900">Today&apos;s Guide</h3>
        <p className="text-xs text-gray-400 mt-0.5">Personalised for your current phase</p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-pink-50 px-4 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              active === tab.key
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-lg">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 py-4">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No suggestions for this tab.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-pink-100 text-pink-500 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {active === "supplements" && items.length > 0 && (
          <p className="text-xs text-gray-400 mt-4 italic">
            * Not medical advice. Consult your doctor before starting any supplement.
          </p>
        )}
      </div>

      {/* PCOS tip */}
      {recs.pcosTip && (
        <div className="mx-4 mb-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">💡 PCOS Tip</p>
          <p className="text-sm text-blue-800">{recs.pcosTip}</p>
        </div>
      )}
    </div>
  );
}
