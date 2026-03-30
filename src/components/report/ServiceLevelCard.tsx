import { type GradingResult } from "@/lib/openai";

export default function ServiceLevelCard({ result }: { result: GradingResult }) {
  if (!result.recommended_service_level) return null;

  return (
    <div className="slab-card">
      <p className="slab-label mb-2">Recommended PSA service</p>
      <p className="text-sm font-medium text-foreground">{result.recommended_service_level}</p>
      {result.service_level_reason && (
        <p className="text-xs text-muted-foreground mt-1">{result.service_level_reason}</p>
      )}
    </div>
  );
}
