// Client-side: calls the analyze-card edge function (server-side OpenAI integration)

export interface GradingResult {
  card_identified: boolean;
  card_name: string;
  set_name: string;
  card_number: string;
  year: string;
  rarity: string;
  era: string;
  scores: {
    centering: { score: number; front_ratio_lr: string; front_ratio_tb: string; back_ratio: string; detail: string };
    corners: { score: number; detail: string; issues: string[] };
    edges: { score: number; detail: string; issues: string[] };
    surface: { score: number; detail: string; issues: string[] };
  };
  overall_score: number;
  grade_prediction: { range_low: number; range_high: number; label: string };
  probabilities: { psa_10: number; psa_9: number; psa_8: number; psa_7_or_below: number };
  verdict: "SUBMIT" | "BORDERLINE" | "RECONSIDER";
  verdict_summary: string;
  findings: { type: "POSITIVE" | "CAUTION" | "CONCERN"; text: string }[];
  key_risk: string;
  key_strength: string;
  raw_value_estimate: string | null;
  psa9_value_estimate: string | null;
  psa10_value_estimate: string | null;
  weighted_expected_value: string | null;
  grading_fee_estimate: string | null;
  net_uplift_estimate: string | null;
  submission_tips: string[];
  images_analyzed: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidence_note: string;
}

async function compressImage(file: File, maxDim = 1500, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = maxDim / Math.max(width, height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('Canvas not supported')); return; }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')); };
    img.src = url;
  });
}

export async function analyzeCard(imageFiles: File[]): Promise<GradingResult> {
  const images = await Promise.all(imageFiles.map((file) => compressImage(file)));

  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const functionUrl = `https://${projectId}.supabase.co/functions/v1/analyze-card`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  let response: Response;
  try {
    response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ images }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const e = new Error("TIMEOUT");
      (e as any).detail = "Request aborted after 120s timeout";
      throw e;
    }
    const e = new Error("NETWORK_ERROR");
    (e as any).detail = "Network error — check your internet connection and try again";
    throw e;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    let code = "API_ERROR";
    try {
      const errBody = await response.json();
      detail = errBody?.error || detail;
      code = errBody?.code || code;
    } catch { /* ignore */ }

    if (code === "RATE_LIMITED" || response.status === 429) {
      const e = new Error("RATE_LIMITED");
      (e as any).detail = detail;
      throw e;
    }
    if (code === "PARSE_ERROR") {
      throw new Error("PARSE_ERROR");
    }
    const e = new Error("API_ERROR");
    (e as any).detail = detail;
    throw e;
  }

  return response.json();
}
