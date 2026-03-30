import { useState } from "react";
import UploadView from "@/components/UploadView";
import LoadingView from "@/components/LoadingView";
import ReportView from "@/components/ReportView";
import { analyzeCard, type GradingResult } from "@/lib/gemini";

type View = "upload" | "loading" | "report" | "error";

export default function Index() {
  const [view, setView] = useState<View>("upload");
  const [result, setResult] = useState<GradingResult | null>(null);
  const [error, setError] = useState<string>("");

  const handleAnalyze = async (files: File[]) => {
    setView("loading");
    try {
      const data = await analyzeCard(files);
      setResult(data);
      setView("report");
    } catch (err: any) {
      if (err.message === "MISSING_API_KEY") {
        setError("This is usually caused by a missing or invalid API key, or a network issue.\n\nCheck that your VITE_GEMINI_API_KEY is set correctly.");
      } else if (err.message === "PARSE_ERROR") {
        setError("The analysis returned an unreadable format.\nThis sometimes happens — please try again.");
      } else if (err.message === "TIMEOUT") {
        setError("The analysis took too long to complete.\nPlease try again — this can happen with large images or high traffic.");
      } else if (err.message === "RATE_LIMITED") {
        setError("API rate limit reached. Please wait a minute and try again.\n\nThis happens when too many requests are sent in a short time.");
      } else {
        setError("This is usually caused by a missing or invalid API key, or a network issue.\n\nCheck that your VITE_GEMINI_API_KEY is set correctly.");
      }
      setView("error");
    }
  };

  const reset = () => {
    setView("upload");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 py-4">
        <div className="max-w-[760px] mx-auto px-4 flex items-center justify-between">
          <span className="text-sm font-medium text-foreground tracking-tight">Trading Card Grader <span className="text-muted-foreground text-[10px] ml-1">TCG</span></span>
          {view === "upload" && (
            <a href="#how" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              How it works ↓
            </a>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-[760px] mx-auto px-4 w-full py-8 md:py-16">
        {view === "upload" && <UploadView onAnalyze={handleAnalyze} />}
        {view === "loading" && <LoadingView />}
        {view === "report" && result && <ReportView result={result} onReset={reset} />}
        {view === "error" && (
          <div className="animate-fade-in flex flex-col items-center justify-center min-h-[50vh] text-center">
            <p className="text-foreground font-medium text-lg mb-4">
              {error.includes("unreadable") ? "Unexpected response from AI" : "Analysis failed"}
            </p>
            <p className="text-sm text-muted-foreground whitespace-pre-line max-w-md">{error}</p>
            <button
              onClick={reset}
              className="mt-6 h-10 px-6 rounded-lg border border-border text-foreground text-sm hover:border-muted-foreground transition-colors"
            >
              Try again
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="max-w-[760px] mx-auto px-4 text-center">
          <p className="text-sm font-medium text-foreground mb-2">Trading Card Grader <span className="text-muted-foreground text-[10px] ml-1">TCG</span></p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Not affiliated with PSA. Grade predictions are estimates only — not guarantees.<br />
            Market prices are based on recent sales data and will vary.<br />
            PSA grading standards referenced from psacard.com
          </p>
          <p className="text-[10px] text-muted-foreground mt-3">Powered by Google Gemini</p>
        </div>
      </footer>
    </div>
  );
}
