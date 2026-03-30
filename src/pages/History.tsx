import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { type GradingResult } from "@/lib/openai";
import ReportView from "@/components/ReportView";
import { useNavigate } from "react-router-dom";

interface AnalysisRow {
  id: string;
  created_at: string;
  card_name: string | null;
  set_name: string | null;
  grade_label: string | null;
  overall_score: number | null;
  verdict: string | null;
  image_urls: string[] | null;
  full_result_json: any;
}

function verdictColor(v: string | null) {
  if (v === "SUBMIT") return "green";
  if (v === "BORDERLINE") return "amber";
  return "red";
}

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GradingResult | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
    supabase
      .from("grade_analyses")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setAnalyses((data as AnalysisRow[]) || []);
        setLoading(false);
      });
  }, [user, navigate]);

  if (selected) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 py-4">
          <div className="max-w-[760px] mx-auto px-4">
            <button onClick={() => setSelected(null)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← Back to history
            </button>
          </div>
        </header>
        <main className="flex-1 max-w-[760px] mx-auto px-4 w-full py-8">
          <ReportView result={selected} onReset={() => setSelected(null)} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 py-4">
        <div className="max-w-[760px] mx-auto px-4 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back
          </button>
          <span className="text-sm font-medium text-foreground">Grading History</span>
          <div className="w-12" />
        </div>
      </header>

      <main className="flex-1 max-w-[760px] mx-auto px-4 w-full py-8">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center mt-12">Loading...</p>
        ) : analyses.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <p className="text-foreground font-medium text-lg mb-2">No analyses yet</p>
            <p className="text-sm text-muted-foreground mb-6">Grade your first card to get started</p>
            <button
              onClick={() => navigate("/")}
              className="h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
            >
              Analyze a card →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {analyses.map((a) => {
              const vc = verdictColor(a.verdict);
              return (
                <button
                  key={a.id}
                  onClick={() => a.full_result_json && setSelected(a.full_result_json as GradingResult)}
                  className="slab-card text-left hover:border-muted-foreground/50 transition-colors"
                >
                  <div className="flex gap-3">
                    {a.image_urls && a.image_urls[0] && (
                      <img
                        src={a.image_urls[0]}
                        alt=""
                        className="w-16 h-20 object-cover rounded-lg border border-border shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{a.card_name || "Unknown card"}</p>
                      <p className="text-xs text-muted-foreground truncate">{a.set_name}</p>
                      <p className={`text-sm font-medium score-${verdictColor(a.verdict)} mt-1`}>
                        {a.grade_label}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full score-badge-${vc}`}>
                          {a.verdict}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {a.overall_score}/10
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
