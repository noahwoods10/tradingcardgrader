import { useState, useEffect, useRef } from "react";
import type { IdentifyResult } from "@/lib/openai";

export interface CardDetails {
  cardName: string;
  setName: string;
  cardNumber: string;
  year: string;
  rarity: string;
  gradingCompany: string;
  declaredValue: string;
}

const RARITY_OPTIONS = [
  "Common", "Uncommon", "Rare", "Holo Rare", "Reverse Holo",
  "Ultra Rare", "Full Art", "Special Illustration Rare",
  "Hyper Rare", "Secret Rare", "Other",
];

const GRADING_OPTIONS = ["PSA", "BGS", "CGC", "SGC"];

const STEPS = ["Upload", "Identify", "Confirm", "Analysis"];

interface ConfirmViewProps {
  files: File[];
  identifyResult: IdentifyResult | null;
  identifying: boolean;
  onBack: () => void;
  onConfirm: (details: CardDetails) => void;
  onSkip: () => void;
}

function ConfidenceBadge({ level }: { level: "HIGH" | "MEDIUM" | "LOW" }) {
  const styles = {
    HIGH: "bg-green-500/20 text-green-400",
    MEDIUM: "bg-amber-500/20 text-amber-400",
    LOW: "bg-red-500/20 text-red-400",
  };
  const labels = { HIGH: "Identified", MEDIUM: "Unconfirmed", LOW: "Uncertain" };
  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${styles[level]}`}>
      {labels[level]}
    </span>
  );
}

export default function ConfirmView({
  files,
  identifyResult,
  identifying,
  onBack,
  onConfirm,
  onSkip,
}: ConfirmViewProps) {
  const currentStep = identifying ? 1 : 2;

  const [details, setDetails] = useState<CardDetails>({
    cardName: "",
    setName: "",
    cardNumber: "",
    year: "",
    rarity: "",
    gradingCompany: "PSA",
    declaredValue: "",
  });

  const [editing, setEditing] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // Pre-fill from AI identification
  useEffect(() => {
    if (identifyResult) {
      setDetails((prev) => ({
        ...prev,
        cardName: identifyResult.card_name || "",
        setName: identifyResult.set_name || "",
        cardNumber: identifyResult.card_number || "",
        year: identifyResult.year || "",
        rarity: identifyResult.rarity || "",
      }));
      // Auto-open form for LOW confidence
      if (identifyResult.confidence === "LOW") {
        setEditing(true);
      }
    }
  }, [identifyResult]);

  const set = (key: keyof CardDetails, value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }));

  const thumbnails = files.map((f) => URL.createObjectURL(f));

  const inputClass =
    "w-full rounded-lg border border-border bg-[#161616] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple/50 transition-colors";

  // Loading / identifying state
  if (identifying) {
    return (
      <div className="animate-fade-in w-full max-w-[560px] mx-auto">
        {/* Step indicator */}
        <StepIndicator current={1} />

        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <div className="w-8 h-8 border-2 border-purple/30 border-t-purple rounded-full animate-spin mb-4" style={{ borderTopColor: "#a78bfa" }} />
          <p className="text-foreground font-medium mb-1">Identifying your card...</p>
          <p className="text-xs text-muted-foreground mb-6">This usually takes 2–3 seconds</p>
          <button
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Skip — let AI figure it out
          </button>
        </div>
      </div>
    );
  }

  const confidence = identifyResult?.confidence || "LOW";

  return (
    <div className="animate-fade-in w-full max-w-[560px] mx-auto">
      {/* Step indicator */}
      <StepIndicator current={2} />

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 justify-center">
        {thumbnails.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Card ${i + 1}`}
            className="h-20 w-auto rounded-lg border border-border object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Identified card display */}
      {identifyResult && confidence !== "LOW" && (
        <div className="slab-card border-border mb-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-medium text-foreground truncate">
                {details.cardName || "Unknown Card"}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                {details.setName && (
                  <span className="text-xs text-muted-foreground">{details.setName}</span>
                )}
                {details.cardNumber && (
                  <span className="text-xs text-muted-foreground">#{details.cardNumber}</span>
                )}
                {details.year && (
                  <span className="text-xs text-muted-foreground">{details.year}</span>
                )}
                {details.rarity && (
                  <span className="text-xs text-muted-foreground">{details.rarity}</span>
                )}
              </div>
            </div>
            <ConfidenceBadge level={confidence} />
          </div>

          {confidence === "MEDIUM" && (
            <p className="text-xs text-amber-400/80 mt-2">
              We think this is correct — please verify before continuing.
            </p>
          )}
        </div>
      )}

      {/* LOW confidence message */}
      {confidence === "LOW" && (
        <div className="slab-card border-border mb-6 text-center">
          <p className="text-sm text-muted-foreground">
            We couldn't identify this card clearly. Please enter the details manually or continue without them.
          </p>
        </div>
      )}

      {/* Edit form (collapsible for HIGH/MEDIUM, always open for LOW) */}
      {(editing || confidence === "LOW") && (
        <div
          ref={formRef}
          className="animate-fade-in space-y-4 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Card Name</label>
              <input
                type="text"
                placeholder="e.g. Umbreon ex"
                value={details.cardName}
                onChange={(e) => set("cardName", e.target.value)}
                className={inputClass}
                style={{ fontSize: "16px" }}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Set Name</label>
              <input
                type="text"
                placeholder="e.g. Prismatic Evolutions"
                value={details.setName}
                onChange={(e) => set("setName", e.target.value)}
                className={inputClass}
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Card Number</label>
              <input
                type="text"
                placeholder="e.g. 161/131"
                value={details.cardNumber}
                onChange={(e) => set("cardNumber", e.target.value)}
                className={inputClass}
                style={{ fontSize: "16px" }}
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Year</label>
              <input
                type="text"
                placeholder="e.g. 2025"
                value={details.year}
                onChange={(e) => set("year", e.target.value)}
                className={inputClass}
                style={{ fontSize: "16px" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Rarity</label>
              <select
                value={details.rarity}
                onChange={(e) => set("rarity", e.target.value)}
                className={inputClass}
                style={{ fontSize: "16px" }}
              >
                <option value="">Select rarity…</option>
                {RARITY_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Grading Company</label>
              <select
                value={details.gradingCompany}
                onChange={(e) => set("gradingCompany", e.target.value)}
                className={inputClass}
                style={{ fontSize: "16px" }}
              >
                {GRADING_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-muted-foreground mb-1.5">Declared Value (USD)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              value={details.declaredValue}
              onChange={(e) => set("declaredValue", e.target.value)}
              className={inputClass}
              style={{ fontSize: "16px" }}
            />
          </div>

          {confidence !== "LOW" && (
            <button
              onClick={() => setEditing(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Done editing
            </button>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onBack}
          className="h-11 px-6 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all sm:flex-1"
        >
          Back
        </button>
        <button
          onClick={() => onConfirm(details)}
          className="h-11 px-6 rounded-lg btn-gradient text-sm font-medium text-white transition-all sm:flex-1"
        >
          {confidence === "HIGH" ? "Looks correct — Start Analysis →" : "Start Analysis →"}
        </button>
      </div>

      {/* Edit details link */}
      {!editing && confidence !== "LOW" && (
        <div className="text-center mt-3">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors underline"
          >
            Edit details
          </button>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
              i === current
                ? "bg-purple/20"
                : i < current
                ? "text-muted-foreground"
                : "text-muted-foreground/50"
            }`}
            style={i === current ? { color: "#a78bfa" } : undefined}
          >
            {step}
          </span>
          {i < STEPS.length - 1 && (
            <span className="text-muted-foreground/30 text-xs">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
