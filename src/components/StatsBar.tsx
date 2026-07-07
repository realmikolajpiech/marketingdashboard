import { Creator, PaymentLog } from "../types";
import { calcCPM, formatCompact, formatCurrency } from "../utils";

interface StatsBarProps {
  creators: Creator[];
  payments: PaymentLog[];
}

export default function StatsBar({ creators, payments }: StatsBarProps) {
  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalViews = creators.reduce((sum, c) => sum + c.totalViewsGenerated, 0);
  const cpm = calcCPM(totalSpent, totalViews);
  const activeCount = creators.filter((c) => c.status === "Active").length;

  const stats = [
    { label: "Total spent", value: formatCurrency(totalSpent) },
    { label: "Est. views", value: formatCompact(totalViews) },
    { label: "Avg. CPM", value: cpm > 0 ? `$${cpm.toFixed(2)}` : "—", highlight: cpm > 0 && cpm <= 5 },
    { label: "Creators", value: String(creators.length), sub: activeCount > 0 ? `${activeCount} active` : undefined },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl px-4 py-3.5 ring-1 ring-stone-200/80"
        >
          <p className="text-xs text-stone-500 font-medium">{stat.label}</p>
          <p
            className={`mt-0.5 text-xl font-semibold tracking-tight tabular-nums font-mono ${
              stat.highlight ? "text-teal-700" : "text-stone-900"
            }`}
          >
            {stat.value}
          </p>
          {stat.sub && (
            <p className="text-[11px] text-stone-400 mt-0.5">{stat.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
