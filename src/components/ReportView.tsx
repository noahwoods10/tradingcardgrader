import { useState } from "react";
import { type GradingResult } from "@/lib/gemini";
import PackagingModal from "./PackagingModal";

interface ReportViewProps {
  result: GradingResult;
  onReset: () => void;
}

function scoreColor(score: number) {
  if (score >= 9) return "green";
  if (score >= 7.5) return "amber";
  return "red";
}

function verdictColor(verdict: string) {
  if (verdict === "SUBMIT") return "green";
  if (verdict === "BORDERLINE") return "amber";
  return "red";
}

function findingDot(type: string) {
  if (type === "POSITIVE") return "bg-green";
  if (type === "CAUTION") return "bg-amber";
  return "bg-red";
}

function AnimatedBar({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="progress-track mt-2">
      <div
        className={`progress-fill bg-${color}`}
        style={{ width: `${(value / max) * 100}%`, transition: "width 0.6s ease-out" }}
      />
    </div>
  );
}

export default function ReportView({ result, onReset }: ReportViewProps) {
  const [showPSARef, setShowPSARef] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const gradeColor = scoreColor(result.overall_score);
  const vColor = verdictColor(result.verdict);

  const copyReport = () => {
    const text = `Trading Card Grader Report\n${result.card_name} — ${result.set_name}\nPredicted: ${result.grade_prediction.label}\nOverall: ${result.overall_score}/10\nCentering: ${result.scores.centering.score} | Corners: ${result.scores.corners.score} | Edges: ${result.scores.edges.score} | Surface: ${result.scores.surface.score}\nVerdict: ${result.verdict}\n${result.verdict_summary}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Low confidence banner */}
      {result.confidence === "LOW" && (
        <div className="slab-card border-amber/30 bg-amber/[0.05]">
          <p className="text-sm text-amber">⚠ Low confidence — {result.confidence_note}</p>
        </div>
      )}

      {/* Report Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium text-foreground">
            {result.card_identified ? result.card_name : "Card detected — details unconfirmed"}
          </h2>
          {result.card_identified && (
            <p className="text-sm text-muted-foreground mt-1">
              {result.set_name} · {result.card_number} · {result.year} · {result.rarity}
            </p>
          )}
        </div>
        {result.era && (
          <span className={`score-badge-${scoreColor(result.overall_score)} text-xs px-3 py-1 rounded-full shrink-0`}>
            {result.era}
          </span>
        )}
      </div>

      {/* Grade Prediction */}
      <div className="slab-card">
        <p className="slab-label mb-2">Predicted grade</p>
        <p className={`text-4xl font-medium score-${gradeColor} mb-4`}>{result.grade_prediction.label}</p>
        <div className="flex items-center gap-3 mb-4">
          <div className="progress-track flex-1">
            <div
              className={`progress-fill bg-${gradeColor}`}
              style={{ width: `${(result.overall_score / 10) * 100}%`, transition: "width 0.8s ease-out" }}
            />
          </div>
          <span className="text-sm text-muted-foreground">Overall {result.overall_score}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "PSA 10", value: result.probabilities.psa_10, color: "green" },
            { label: "PSA 9", value: result.probabilities.psa_9, color: "amber" },
            { label: "PSA 8", value: result.probabilities.psa_8, color: "red" },
            { label: "PSA 7–", value: result.probabilities.psa_7_or_below, color: "red" },
          ].map((p) => (
            <div key={p.label} className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{p.label}</p>
              <p className={`text-sm font-medium score-${p.color}`}>{p.value}%</p>
              <div className="progress-track mt-1">
                <div
                  className={`progress-fill bg-${p.color}`}
                  style={{ width: `${p.value}%`, transition: "width 0.6s ease-out" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(["centering", "corners", "edges", "surface"] as const).map((cat) => {
          const s = result.scores[cat];
          const c = scoreColor(s.score);
          return (
            <div key={cat} className="slab-card">
              <p className="slab-label mb-2">{cat}</p>
              <p className={`text-[22px] font-medium score-${c}`}>{s.score}<span className="text-xs text-muted-foreground"> / 10</span></p>
              <AnimatedBar value={s.score} color={c} />
              {cat === "centering" && "front_ratio_lr" in s && (
                <p className="text-xs text-muted-foreground mt-2">
                  Front {s.front_ratio_lr} · {s.front_ratio_tb}<br />Back {s.back_ratio}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{s.detail}</p>
              {"issues" in s && s.issues.length > 0 && (
                <div className="mt-2 space-y-1">
                  {s.issues.map((issue, i) => (
                    <p key={i} className="text-xs score-amber">• {issue}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PSA Reference */}
      <button
        onClick={() => setShowPSARef(!showPSARef)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        PSA 2025 grade standards {showPSARef ? "↑" : "→"}
      </button>
      {showPSARef && (
        <div className="slab-card text-xs text-muted-foreground space-y-2">
          <p><span className="text-foreground">PSA 10</span> — 55/45 front · 75/25 back · 4 sharp corners · no surface defects</p>
          <p><span className="text-foreground">PSA 9</span> — 60/40 front · 90/10 back · one minor flaw allowed</p>
          <p><span className="text-foreground">PSA 8</span> — 65/35 front · 90/10 back · slight fraying on 1-2 corners</p>
          <p><span className="text-foreground">PSA 7</span> — 70/30 front · 90/10 back · minor surface wear visible</p>
        </div>
      )}

      {/* Findings */}
      <div className="slab-card">
        <p className="slab-label mb-3">Findings</p>
        <div className="space-y-2">
          {result.findings.map((f, i) => (
            <div
              key={i}
              className="flex gap-2 items-start animate-fade-in"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${findingDot(f.type)} shrink-0 mt-1.5`} />
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
        {result.key_strength && (
          <p className="text-xs text-muted-foreground mt-4"><span className="score-green">Strength:</span> {result.key_strength}</p>
        )}
        {result.key_risk && (
          <p className="text-xs text-muted-foreground mt-1"><span className="score-amber">Risk:</span> {result.key_risk}</p>
        )}
      </div>

      {/* ROI */}
      {result.card_identified && result.raw_value_estimate && (
        <div className="slab-card">
          <p className="slab-label mb-3">Value estimate</p>
          <div className="space-y-2 text-sm">
            <Row label="Raw value (NM)" value={`~${result.raw_value_estimate}`} />
            <div className="border-t border-border" />
            <Row label="If PSA 9" value={`~${result.psa9_value_estimate}`} highlight />
            <Row label="If PSA 10" value={`~${result.psa10_value_estimate}`} highlight />
            <div className="border-t border-border" />
            <Row label="Weighted expected" value={`~${result.weighted_expected_value}`} />
            <Row label="Grading fee est." value={`~${result.grading_fee_estimate}`} />
            <Row label="Net expected uplift" value={`~${result.net_uplift_estimate}`} bold />
          </div>
          <div className="mt-3">
            <span className={`text-sm font-medium score-${vColor}`}>
              {result.verdict === "SUBMIT" ? "Worth submitting ✓" : result.verdict === "BORDERLINE" ? "Borderline" : "Reconsider"}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Prices are estimates based on recent market sales and will vary</p>
        </div>
      )}

      {/* Verdict Card */}
      <div className={`slab-card border-l-2 border-l-${vColor}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`score-${vColor} text-sm`}>
            {result.verdict === "SUBMIT" ? "✓" : result.verdict === "BORDERLINE" ? "⚠" : "✕"}
          </span>
          <span className={`text-sm font-medium score-${vColor}`}>
            {result.verdict === "SUBMIT" ? "Submit this card" : result.verdict === "BORDERLINE" ? "Borderline submission" : "Reconsider submitting"}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{result.verdict_summary}</p>
        <button
          onClick={() => setModalOpen(true)}
          className="mt-4 text-sm text-blue hover:underline"
        >
          View packaging tips
        </button>
      </div>

      {/* Submission Tips */}
      {result.submission_tips.length > 0 && (
        <div className="slab-card">
          <p className="slab-label mb-3">Card-specific tips</p>
          <ul className="space-y-2">
            {result.submission_tips.map((tip, i) => (
              <li key={i} className="text-sm text-muted-foreground flex gap-2">
                <span className="text-muted-foreground shrink-0">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence */}
      <p className="text-xs text-muted-foreground text-center">
        Confidence: {result.confidence} · {result.images_analyzed} image{result.images_analyzed !== 1 ? "s" : ""} analyzed
        {result.confidence_note && ` · ${result.confidence_note}`}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onReset}
          className="h-10 px-4 rounded-lg border border-border text-foreground text-sm hover:border-muted-foreground transition-colors"
        >
          ← Analyze another card
        </button>
        <button
          onClick={copyReport}
          className="h-10 px-4 rounded-lg border border-border text-foreground text-sm hover:border-muted-foreground transition-colors"
        >
          {copied ? "Copied ✓" : "Copy report"}
        </button>
      </div>

      <PackagingModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

function Row({ label, value, highlight, bold }: { label: string; value: string; highlight?: boolean; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`${bold ? "font-medium text-foreground" : highlight ? "text-foreground" : "text-muted-foreground"}`}>{value}</span>
    </div>
  );
}
