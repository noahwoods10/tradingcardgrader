import { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, Sun, ZoomIn } from "lucide-react";
import SlabCarousel from "./SlabCarousel";

interface UploadViewProps {
  onAnalyze: (files: File[]) => void;
}

const tips = [
  { icon: Camera, title: "Front & back", desc: "For centering and edge assessment" },
  { icon: Sun, title: "Raking light", desc: "Angle a flashlight flat across the card to reveal surface scratches" },
  { icon: ZoomIn, title: "Corner close-ups", desc: "Zoom in on all 4 corners for wear detection" },
];

const howItWorks = [
  "Upload photos — front, back, raking light shots, corner close-ups",
  "AI analyzes — centering, corners, edges, and surface scored independently using PSA 2025 standards",
  "Get your report — grade prediction with probability breakdown, ROI estimate, and specific tips",
  "Submit with confidence — know what to expect before you pay grading fees",
];

export default function UploadView({ onAnalyze }: UploadViewProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [howOpen, setHowOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles).filter((f) =>
      ["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    setFiles((prev) => [...prev, ...arr].slice(0, 20));
  }, []);

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="animate-fade-in relative">
      {/* Slab carousel background */}
      <SlabCarousel />

      {/* Content */}
      <div className="relative z-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-[32px] md:text-[48px] font-medium tracking-tight leading-tight mb-4 gradient-hero-text">
            Know before you send.
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Upload your card photos and get an AI-powered PSA grade prediction in seconds.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={`relative border border-dashed rounded-2xl min-h-[220px] flex flex-col items-center justify-center cursor-pointer transition-all duration-150 bg-background/60 backdrop-blur-sm ${
            dragOver
              ? "border-blue bg-blue/[0.06]"
              : "border-border-hover hover:border-muted-foreground hover:bg-foreground/[0.02]"
          }`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        >
          <Upload className="w-6 h-6 text-muted-foreground mb-3" />
          <p className="text-foreground font-medium text-sm">Drag photos here to start</p>
          <p className="text-muted-foreground text-sm">or click to browse files</p>
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground mt-4">
            JPG · PNG · WEBP · up to 20 images
          </p>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={(e) => e.target.files && addFiles(e.target.files)}
          />
        </div>

        {/* Thumbnails */}
        {files.length > 0 && (
          <div className="mt-4">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {files.map((file, i) => (
                <div key={i} className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-border group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{files.length} image{files.length !== 1 ? "s" : ""} ready</p>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center mt-8">
          <button
            disabled={files.length === 0}
            onClick={() => onAnalyze(files)}
            className="h-12 px-8 rounded-lg btn-gradient font-medium text-sm disabled:cursor-not-allowed"
          >
            Analyze my card →
          </button>
        </div>

        {/* Tips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-12">
          {tips.map((tip) => (
            <div key={tip.title} className="slab-card flex gap-3 items-start">
              <tip.icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-12">
          <button
            onClick={() => setHowOpen(!howOpen)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            How it works {howOpen ? "↑" : "→"}
          </button>
          {howOpen && (
            <ol className="mt-4 space-y-3">
              {howItWorks.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="text-muted-foreground font-medium shrink-0">{i + 1}.</span>
                  <span className="text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
