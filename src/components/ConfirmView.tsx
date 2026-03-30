import { useState } from "react";

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

const STEPS = ["Upload", "Confirm", "Analysis"];

interface ConfirmViewProps {
  files: File[];
  onBack: () => void;
  onConfirm: (details: CardDetails) => void;
}

export default function ConfirmView({ files, onBack, onConfirm }: ConfirmViewProps) {
  const [details, setDetails] = useState<CardDetails>({
    cardName: "",
    setName: "",
    cardNumber: "",
    year: "",
    rarity: "",
    gradingCompany: "PSA",
    declaredValue: "",
  });

  const set = (key: keyof CardDetails, value: string) =>
    setDetails((prev) => ({ ...prev, [key]: value }));

  const thumbnails = files.map((f) => URL.createObjectURL(f));

  const inputClass =
    "w-full rounded-lg border border-border bg-[#161616] px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-purple/50 transition-colors";

  return (
    <div className="animate-fade-in w-full max-w-[560px] mx-auto">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full transition-colors ${
                i === 1
                  ? "bg-purple/20 text-purple"
                  : i < 1
                  ? "text-muted-foreground"
                  : "text-muted-foreground/50"
              }`}
              style={i === 1 ? { color: "#a78bfa" } : undefined}
            >
              {step}
            </span>
            {i < STEPS.length - 1 && (
              <span className="text-muted-foreground/30 text-xs">→</span>
            )}
          </div>
        ))}
      </div>

      {/* Heading */}
      <h2 className="text-lg font-medium text-foreground text-center mb-1">
        Confirm your card details
      </h2>
      <p className="text-sm text-muted-foreground text-center mb-6">
        We'll use these details to improve your analysis accuracy. Correct anything that looks wrong.
      </p>

      {/* Thumbnail strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 justify-center">
        {thumbnails.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Card ${i + 1}`}
            className="h-24 w-auto rounded-lg border border-border object-cover flex-shrink-0"
          />
        ))}
      </div>

      {/* Form */}
      <div className="space-y-4">
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
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
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
          Start Analysis →
        </button>
      </div>
    </div>
  );
}
