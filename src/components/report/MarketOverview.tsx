import { type GradingResult } from "@/lib/openai";

function trendColor(trend: string | null) {
  if (trend === "RISING") return "green";
  if (trend === "FALLING") return "red";
  return "muted-foreground";
}

function trendIcon(trend: string | null) {
  if (trend === "RISING") return "↑";
  if (trend === "FALLING") return "↓";
  return "→";
}

export default function MarketOverview({ result }: { result: GradingResult }) {
  const hasData = result.market_trend || result.population_note || result.gem_rate_estimate;
  if (!hasData) return null;

  return (
    <div className="slab-card">
      <div className="flex flex-wrap gap-3">
        {result.market_trend && (
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-1 rounded-full score-badge-${trendColor(result.market_trend)}`}>
              {trendIcon(result.market_trend)} {result.market_trend}
            </span>
            {result.market_trend_note && (
              <span className="text-xs text-muted-foreground">{result.market_trend_note}</span>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        {result.population_note && (
          <div>
            <p className="slab-label mb-1">Population</p>
            <p className="text-xs text-muted-foreground">{result.population_note}</p>
          </div>
        )}
        {result.gem_rate_estimate && (
          <div>
            <p className="slab-label mb-1">Gem rate (PSA 10)</p>
            <p className="text-xs text-muted-foreground">{result.gem_rate_estimate}</p>
          </div>
        )}
      </div>
    </div>
  );
}
