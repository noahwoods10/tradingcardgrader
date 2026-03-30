import { type GradingResult } from "@/lib/openai";

export default function ExpectedValueSummary({ result }: { result: GradingResult }) {
  if (!result.weighted_expected_value || !result.net_uplift_estimate) return null;

  // Calculate rough ROI if we have numbers
  let roiText: string | null = null;
  try {
    const expected = parseFloat(result.net_uplift_estimate.replace(/[^0-9.-]/g, ''));
    const cost = parseFloat((result.total_cost_estimate || "100").replace(/[^0-9.-]/g, ''));
    if (cost > 0 && !isNaN(expected)) {
      roiText = `~${Math.round((expected / cost) * 100)}%`;
    }
  } catch { /* ignore */ }

  return (
    <div className="slab-card">
      <p className="slab-label mb-3">Expected value</p>
      <div className="space-y-2 text-sm">
        <Row label="Weighted expected value" value={`~${result.weighted_expected_value}`} />
        {result.total_cost_estimate && (
          <Row label="Total cost estimate" value={`~${result.total_cost_estimate}`} />
        )}
        <div className="border-t border-border pt-2" />
        <Row label="Expected net gain" value={`~${result.net_uplift_estimate}`} bold />
        {roiText && <Row label="ROI" value={roiText} highlight />}
      </div>
    </div>
  );
}

function Row({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-medium score-green" : highlight ? "font-medium text-foreground" : "text-muted-foreground"}>
        {value}
      </span>
    </div>
  );
}
