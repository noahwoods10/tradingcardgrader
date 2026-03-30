// Client-side: calls edge functions for card identification and analysis

export interface CardDetails {
  cardName: string;
  setName: string;
  cardNumber: string;
  year: string;
  rarity: string;
  gradingCompany: string;
  declaredValue: string;
}

export interface IdentifyResult {
  card_name: string | null;
  set_name: string | null;
  card_number: string | null;
  year: string | null;
  rarity: string | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  confidence_note: string;
}

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
  psa8_value_estimate: string | null;
  psa9_value_estimate: string | null;
  psa10_value_estimate: string | null;
  weighted_expected_value: string | null;
  grading_fee_estimate: string | null;
  net_uplift_estimate: string | null;
  recommended_service_level: string | null;
  service_level_reason: string | null;
  shipping_estimate: string | null;
  total_cost_estimate: string | null;
  break_even_grade: string | null;
  psa8_probability: number;
  grade_multipliers: { psa9_vs_raw: string; psa10_vs_raw: string; psa10_vs_psa9: string } | null;
  market_trend: "RISING" | "STABLE" | "FALLING" | null;
  market_trend_note: string | null;
  population_note: string | null;
  gem_rate_estimate: string | null;
  hold_vs_sell_recommendation: "GRADE_AND_HOLD" | "GRADE_AND_SELL" | "SELL_RAW" | "HOLD_RAW" | null;
  hold_vs_sell_reason: string | null;
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

// Cache compressed images to avoid recompressing between identify and analyze
let cachedImages: string[] | null = null;

export async function getCompressedImages(files: File[]): Promise<string[]> {
  if (!cachedImages) {
    cachedImages = await Promise.all(files.map((file) => compressImage(file)));
  }
  return cachedImages;
}

export function clearImageCache() {
  cachedImages = null;
}

function buildEdgeFunctionUrl(name: string): string {
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  return `https://${projectId}.supabase.co/functions/v1/${name}`;
}

function getAnonKey(): string {
  return import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
}

function handleFetchError(err: any): never {
  if (err.name === 'AbortError') {
    const e = new Error("TIMEOUT");
    (e as any).detail = "Request aborted after timeout";
    throw e;
  }
  const e = new Error("NETWORK_ERROR");
  (e as any).detail = "Network error — check your internet connection and try again";
  throw e;
}

async function handleResponseError(response: Response): Promise<never> {
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

export async function identifyCard(imageFiles: File[]): Promise<IdentifyResult> {
  const images = await getCompressedImages(imageFiles);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let response: Response;
  try {
    response = await fetch(buildEdgeFunctionUrl('identify-card'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAnonKey()}`,
      },
      body: JSON.stringify({ images }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    handleFetchError(err);
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    await handleResponseError(response);
  }

  return response.json();
}

export async function analyzeCard(imageFiles: File[], cardDetails?: CardDetails): Promise<GradingResult> {
  const images = await getCompressedImages(imageFiles);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  let response: Response;
  try {
    response = await fetch(buildEdgeFunctionUrl('analyze-card'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAnonKey()}`,
      },
      body: JSON.stringify({ images, cardDetails: cardDetails || null }),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    handleFetchError(err);
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    await handleResponseError(response);
  }

  return response.json();
}
