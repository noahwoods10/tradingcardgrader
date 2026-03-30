import { type GradingResult } from "@/lib/openai";

const recommendationConfig: Record<string, { label: string; color: string; icon: string }> = {
  GRADE_AND_HOLD: { label: "Grade & Hold", color: "green", icon: "📈" },
  GRADE_AND_SELL: { label: "Grade & Sell", color: "blue", icon: "💰" },
  SELL_RAW: { label: "Sell Raw", color: "amber", icon: "⚡" },
  HOLD_RAW: { label: "Hold Raw", color: "red", icon: "⏸" },
};

export default function HoldVsSellCard({ result }: { result: GradingResult }) {
  if (!result.hold_vs_sell_recommendation) return null;

  const config = recommendationConfig[result.hold_vs_sell_recommendation] || recommendationConfig.SELL_RAW;

  return (
    <div className={`slab-card verdict-glow-${config.color}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.icon}</span>
        <span className={`text-sm font-medium score-${config.color}`}>{config.label}</span>
      </div>
      {result.hold_vs_sell_reason && (
        <p className="text-sm text-muted-foreground">{result.hold_vs_sell_reason}</p>
      )}
    </div>
  );
}
