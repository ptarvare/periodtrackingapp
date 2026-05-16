import { DailyRecommendation } from "@/lib/recommendationEngine";

export default function DailyRecs({
  recs,
}: {
  recs: DailyRecommendation;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <h3 className="text-base font-semibold text-gray-800">
          Today&apos;s Recommendations
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Personalised for your current phase and goals
        </p>
      </div>

      <div className="divide-y divide-gray-50">
        <Section icon="🥗" title="Nutrition" items={recs.diet} />
        <Section icon="💪" title="Movement" items={recs.workout} />
        <Section icon="💊" title="Supplements" items={recs.supplements} disclaimer />
        <Section icon="🧘" title="Lifestyle" items={recs.lifestyle} />
      </div>

      {recs.pcosTip && (
        <div className="mx-6 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
            💡 PCOS Focus
          </p>
          <p className="text-sm text-blue-800">{recs.pcosTip}</p>
        </div>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  items,
  disclaimer,
}: {
  icon: string;
  title: string;
  items: string[];
  disclaimer?: boolean;
}) {
  if (!items.length) return null;

  return (
    <div className="px-6 py-4">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        {icon} {title}
      </h4>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-pink-400 mt-0.5 shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {disclaimer && (
        <p className="text-xs text-gray-400 mt-3 italic">
          * Not medical advice. Consult your doctor before starting supplements.
        </p>
      )}
    </div>
  );
}
