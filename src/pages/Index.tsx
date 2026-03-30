import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadView from "@/components/UploadView";
import ConfirmView from "@/components/ConfirmView";
import type { CardDetails } from "@/components/ConfirmView";
import LoadingView from "@/components/LoadingView";
import ReportView from "@/components/ReportView";
import AuthModal from "@/components/AuthModal";
import { analyzeCard, identifyCard, clearImageCache, type GradingResult, type IdentifyResult } from "@/lib/openai";
import { saveAnalysis } from "@/lib/saveAnalysis";
import { fetchCardPricing, type CardPricing } from "@/lib/pricing";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type View = "upload" | "confirm" | "loading" | "report" | "error";

export default function Index() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<View>("upload");
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [lastFiles, setLastFiles] = useState<File[]>([]);
  const [identifying, setIdentifying] = useState(false);
  const [identifyResult, setIdentifyResult] = useState<IdentifyResult | null>(null);
  const [pricing, setPricing] = useState<CardPricing | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const handleFilesSelected = async (files: File[]) => {
    setLastFiles(files);
    setView("confirm");
    setIdentifying(true);
    setIdentifyResult(null);
    setPricing(null);

    try {
      const idResult = await identifyCard(files);
      setIdentifyResult(idResult);

      // Fetch pricing in background after identification
      if (idResult.card_name) {
        setPricingLoading(true);
        fetchCardPricing(idResult.card_name, idResult.set_name || "", idResult.card_number || "")
          .then((p) => setPricing(p))
          .finally(() => setPricingLoading(false));
      }
    } catch {
      setIdentifyResult({ card_name: null, set_name: null, card_number: null, year: null, rarity: null, confidence: "LOW", confidence_note: "Identification failed" });
    } finally {
      setIdentifying(false);
    }
  };

  const handleSkipIdentification = () => {
    setIdentifying(false);
    setIdentifyResult({ card_name: null, set_name: null, card_number: null, year: null, rarity: null, confidence: "LOW", confidence_note: "Skipped by user" });
  };

  const handleConfirm = async (details: CardDetails) => {
    setView("loading");
    try {
      const data = await analyzeCard(lastFiles, details, pricing);
      setResult(data);
      setView("report");

      if (user) {
        try {
          await saveAnalysis(user.id, data, lastFiles);
          toast.success("Saved to history");
        } catch {
          toast.error("Failed to save analysis");
        }
      }
    } catch (err: any) {
      if (err.message === "MISSING_API_KEY") {
        setError("API key missing or invalid.");
      } else if (err.message === "PARSE_ERROR") {
        setError("The analysis returned an unreadable format. Please try again.");
      } else if (err.message === "TIMEOUT") {
        setError("The analysis took too long. Please try again.");
      } else if (err.message === "RATE_LIMITED") {
        setError("Rate limit reached. Please wait a minute and try again.");
      } else if (err.message === "NETWORK_ERROR") {
        setError("Network error — check your internet connection and try again.");
      } else {
        setError(err.detail || err.message || "Analysis failed. Please try again.");
      }
      setView("error");
    }
  };

  const reset = () => {
    setView("upload");
    setResult(null);
    setError("");
    setLastFiles([]);
    setIdentifyResult(null);
    setIdentifying(false);
    setPricing(null);
    setPricingLoading(false);
    clearImageCache();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 py-4 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-[760px] mx-auto px-4 flex items-center justify-between">
          <span className="text-sm font-medium logo-shimmer tracking-tight">
            Trading Card Grader{" "}
            <span className="text-[10px] ml-1 px-1.5 py-0.5 rounded-full bg-purple/20 text-purple inline-block" style={{ color: "#a78bfa" }}>
              TCG
            </span>
          </span>
          <div className="flex items-center gap-4">
            {user && (
              <button
                onClick={() => navigate("/history")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                History
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[760px] mx-auto px-4 w-full py-8 md:py-16">
        {view === "upload" && <UploadView onAnalyze={handleFilesSelected} />}
        {view === "confirm" && (
          <ConfirmView
            files={lastFiles}
            identifyResult={identifyResult}
            identifying={identifying}
            onBack={reset}
            onConfirm={handleConfirm}
            onSkip={handleSkipIdentification}
          />
        )}
        {view === "loading" && <LoadingView />}
        {view === "report" && result && (
          <div>
            <ReportView result={result} onReset={reset} />
            {!user && (
              <div className="mt-6 slab-card border-border text-center">
                <p className="text-sm text-muted-foreground">
                  <button onClick={() => setAuthOpen(true)} className="text-foreground hover:underline">Sign in</button>
                  {" "}to save this analysis to your history
                </p>
              </div>
            )}
          </div>
        )}
        {view === "error" && (
          <div className="animate-fade-in flex flex-col items-center justify-center min-h-[50vh] text-center">
            <p className="text-foreground font-medium text-lg mb-4">Analysis failed</p>
            <p className="text-sm text-muted-foreground whitespace-pre-line max-w-md">{error}</p>
            <div className="mt-6">
              <button
                onClick={reset}
                className="h-10 px-6 rounded-lg btn-gradient text-sm font-medium transition-all"
              >
                Start over
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-[760px] mx-auto px-4 text-center">
          <p className="text-sm font-medium logo-shimmer mb-2">
            Trading Card Grader
          </p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Not affiliated with PSA. Grade predictions are estimates only — not guarantees.<br />
            Market prices are based on recent sales data and will vary.<br />
            PSA grading standards referenced from psacard.com
          </p>
          <p className="text-[10px] text-muted-foreground mt-3">Powered by OpenAI</p>
        </div>
      </footer>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
