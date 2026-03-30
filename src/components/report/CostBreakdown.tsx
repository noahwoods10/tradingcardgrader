import { type GradingResult } from "@/lib/openai";

export default function CostBreakdown({ result }: { result: GradingResult }) {
  if (!result.grading_fee_estimate && !result.total_cost_estimate) return null;

  return (
    <div className="slab-card">
      <p className="slab-label mb-3">Cost breakdown</p>
      <div className="space-y-2 text-sm">
        {result.grading_fee_estimate && (
          <Row label="Grading fee" value={`~${result.grading_fee_estimate}`} />
        )}
        {result.shipping_estimate && (
          <Row label="Shipping (round trip)" value={`~${result.shipping_estimate}`} />
        )}
        {(result.grading_fee_estimate || result.shipping_estimate) && result.total_cost_estimate && (
          <div className="border-t border-border pt-2" />
        )}
        {result.total_cost_estimate && (
          <Row label="Total all-in cost" value={`~${result.total_cost_estimate}`} bold />
        )}
        {result.break_even_grade && (
          <Row label="Break-even grade" value={result.break_even_grade} highlight />
        )}
      </div>
    </div>
  );
}

function Row({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-medium text-foreground" : highlight ? "score-blue text-sm" : "text-muted-foreground"}>
        {value}
      </span>
    </div>
  );
}
