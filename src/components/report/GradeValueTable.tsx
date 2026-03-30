import { type GradingResult } from "@/lib/openai";
import type { CardPricing } from "@/lib/pricing";

interface GradeRow {
  grade: string;
  value: string | null;
  multiplier: string | null;
  probability: number;
  color: string;
}

export default function GradeValueTable({ result, pricing }: { result: GradingResult; pricing?: CardPricing | null }) {
  const rawDisplay = pricing?.marketPrice
    ? `$${pricing.marketPrice.toFixed(2)}`
    : result.raw_value_estimate;
  const rawSubtext = pricing && pricing.lowPrice && pricing.highPrice
    ? `$${pricing.lowPrice.toFixed(2)} – $${pricing.highPrice.toFixed(2)}`
    : null;
  const rows: GradeRow[] = [
    {
      grade: "PSA 10",
      value: result.psa10_value_estimate,
      multiplier: result.grade_multipliers?.psa10_vs_raw || null,
      probability: result.probabilities.psa_10,
      color: "green",
    },
    {
      grade: "PSA 9",
      value: result.psa9_value_estimate,
      multiplier: result.grade_multipliers?.psa9_vs_raw || null,
      probability: result.probabilities.psa_9,
      color: "blue",
    },
    {
      grade: "PSA 8",
      value: result.psa8_value_estimate,
      multiplier: null,
      probability: result.psa8_probability ?? result.probabilities.psa_8,
      color: "amber",
    },
    {
      grade: "Raw NM",
      value: rawDisplay || result.raw_value_estimate,
      multiplier: null,
      probability: 0,
      color: "muted-foreground",
    },
  ];

  return (
    <div className="slab-card overflow-hidden p-0">
      <div className="px-6 pt-5 pb-3">
        <p className="slab-label">Grade values</p>
      </div>
      <div className="divide-y divide-border">
        {/* Header */}
        <div className="grid grid-cols-4 px-6 py-2 text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>Grade</span>
          <span className="text-right">Est. Value</span>
          <span className="text-right">vs Raw</span>
          <span className="text-right">Prob.</span>
        </div>
        {rows.map((row) => (
          <div
            key={row.grade}
            className="grid grid-cols-4 px-6 py-3 items-center"
            style={{ borderLeft: `2px solid hsl(var(--${row.color === "muted-foreground" ? "border" : row.color}))` }}
          >
            <span className={`text-sm font-medium score-${row.color}`}>{row.grade}</span>
            <div className="text-right">
              <span className="text-sm text-foreground">{row.value ? (row.value.startsWith("$") ? row.value : `~${row.value}`) : "—"}</span>
              {row.grade === "Raw NM" && rawSubtext && (
                <p className="text-[10px] text-muted-foreground">{rawSubtext}</p>
              )}
            </div>
            <span className="text-sm text-right text-muted-foreground">{row.multiplier || "—"}</span>
            <div className="flex items-center justify-end gap-2">
              {row.probability > 0 ? (
                <>
                  <div className="w-12 h-1.5 rounded-full bg-border overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-${row.color}`}
                      style={{ width: `${row.probability}%`, transition: "width 0.6s ease-out" }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{row.probability}%</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
