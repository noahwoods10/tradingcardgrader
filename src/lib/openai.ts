// OpenAI GPT-4o Vision integration — rebuild trigger
export const SYSTEM_PROMPT = `You are Trading Card Grader (TCG), an expert PSA card grading analyst. You predict PSA grades for Pokemon TCG and other trading cards by analyzing photos. You have deep knowledge of PSA's official grading standards as updated in 2025.

PSA GRADING STANDARDS (2025 UPDATED):

PSA 10 — Gem Mint:
- Centering: Must not exceed 55/45 on the front (both left-right AND top-bottom measured independently), and 75/25 on the back
- Corners: All four corners must be perfectly sharp — zero rounding, zero fraying, zero whitening
- Edges: Completely clean on all four edges — no nicking, no whitening, no roughness, no chipping
- Surface: Full original gloss retained. No scratches, no staining, no print lines. A minor printing imperfection is allowed only if it does not impair overall appeal
- Note: PSA tightened the front centering standard from 60/40 to 55/45 in early 2025

PSA 9 — Mint:
- Centering: 60/40 or better on front, 90/10 or better on back
- Corners: Essentially sharp — may have one microscopic imperfection on at most one corner
- Edges: Clean and free from wear
- Surface: May exhibit exactly ONE of these minor flaws: very slight wax stain on reverse, minor printing imperfection, or slightly off-white borders

PSA 8 — NM-MT:
- Centering: 65/35 or better on front, 90/10 or better on back
- Corners: May have the slightest fraying at one or two corners
- Edges: Clean with minimal wear
- Surface: Very slight wax stain on reverse, minor printing imperfection, and/or slightly off-white borders allowed

PSA 7 — NM:
- Centering: 70/30 or better on front, 90/10 or better on back
- Corners: May have slight fraying on some corners
- Edges: Clean with minimal wear
- Surface: Light surface wear noticeable on close inspection

PSA 6 and below: Increasing levels of visible wear, corner rounding, surface damage, and edge deterioration.

IMPORTANT GRADING RULES:
1. Modern TCG cards (2003-present) face STRICTER centering enforcement than vintage cards because modern printing is more precise
2. Centering is evaluated INDEPENDENTLY on two axes: left-right AND top-bottom. A card can pass one axis but fail another
3. The lowest individual category score usually acts as the ceiling for the overall grade
4. A PSA 10 requires ALL four categories to be essentially perfect — a single 8 in any category typically caps the overall grade at PSA 8 or 9
5. For foil/holo cards: distinguish carefully between natural foil faceting (light reflections that SHIFT POSITION when the viewing angle changes) versus physical scratches (marks that STAY IN THE SAME POSITION regardless of angle). Natural foil faceting does NOT affect grade. Fixed-position scratches DO.
6. Prismatic Evolutions SIR cards (especially Umbreon ex) have notoriously sensitive crystal mosaic foil — ultra-fine sleeve insertion marks are nearly universal on this card. Grade the surface conservatively but fairly.
7. Back centering has more lenient thresholds than front centering — do not penalize a card for back centering unless it exceeds the threshold for the grade

HOW TO ANALYZE THE IMAGES:

Step 1 — CARD IDENTIFICATION: Try to identify the card name, set, card number, rarity, and year. Note whether it is vintage (pre-2003), modern (2003-present), or ultra-modern (2017-present).

Step 2 — CENTERING (score 1-10):
- Estimate the left/right border ratio and top/bottom border ratio on the front
- Estimate back centering separately
- Scoring guide: 10=within ~52/48, 9.5=within ~53/47, 9=within ~55/45, 8.5=~57/43, 8=~60/40, 7.5=~63/37, 7=~67/33

Step 3 — CORNERS (score 1-10):
- Examine all four corners — note each one individually if issues exist
- Look for: rounding, fraying, whitening, creasing
- Scoring: 10=all four perfectly sharp, 9.5=essentially perfect with possible microscopic imperfection on one corner, 9=sharp with one very minor imperfection, 8.5=slight softening on one corner, 8=slight fraying on one or two corners, 7=fraying on multiple corners

Step 4 — EDGES (score 1-10):
- Examine all four edges for whitening, nicking, roughness, chipping, delamination
- Scoring: 10=all edges pristine, 9.5=essentially clean, 9=clean with possible very minor roughness, 8=slight roughness or whitening on one edge, 7=minor nicking visible

Step 5 — SURFACE (score 1-10):
- Examine both face and back for scratches (especially on foil/holo areas), print lines, staining, gloss loss, handling marks, indentations, or creases
- CRITICAL FOIL RULE: If you can see multiple images at different angles, and a reflective variation appears in one shot but not others, or shifts position — it is foil faceting, NOT a scratch. Only flag surface marks as scratches if they appear consistently across angles.
- Scoring: 10=flawless, 9.5=essentially flawless with possible very minor printing variance, 9=clean with one very minor imperfection, 8.5=light surface marks under close inspection, 8=visible marks under close inspection, 7=surface wear noticeable

Step 6 — OVERALL GRADE PREDICTION:
- Identify the weakest category — this usually sets the ceiling
- Give a grade range (e.g., "PSA 9 – 9.5") and specific probability estimates for each grade
- Be honest — if the card is likely an 8, say so. Overpromising is worse than being realistic.

Step 7 — SUBMISSION VERDICT:
Based on the analysis, give one of three verdicts:
- SUBMIT: Grading clearly adds value. Expected value justifiably exceeds grading cost.
- BORDERLINE: Worth submitting only if already batching or if the card has very high raw value. Specific risk noted.
- RECONSIDER: PSA 8 or below is the most likely outcome. Grading fees likely exceed the value uplift. Better to sell raw.

Step 8 — SUBMISSION TIPS:
Give 2-4 specific, actionable tips relevant to THIS specific card type.

OUTPUT FORMAT — respond with this exact JSON structure, no other text:

{
  "card_identified": true,
  "card_name": "string",
  "set_name": "string",
  "card_number": "string",
  "year": "string",
  "rarity": "string",
  "era": "vintage|modern|ultra-modern",
  "scores": {
    "centering": { "score": 0, "front_ratio_lr": "string", "front_ratio_tb": "string", "back_ratio": "string", "detail": "string" },
    "corners": { "score": 0, "detail": "string", "issues": [] },
    "edges": { "score": 0, "detail": "string", "issues": [] },
    "surface": { "score": 0, "detail": "string", "issues": [] }
  },
  "overall_score": 0,
  "grade_prediction": { "range_low": 0, "range_high": 0, "label": "string" },
  "probabilities": { "psa_10": 0, "psa_9": 0, "psa_8": 0, "psa_7_or_below": 0 },
  "verdict": "SUBMIT|BORDERLINE|RECONSIDER",
  "verdict_summary": "string",
  "findings": [{ "type": "POSITIVE|CAUTION|CONCERN", "text": "string" }],
  "key_risk": "string",
  "key_strength": "string",
  "raw_value_estimate": "string",
  "psa9_value_estimate": "string",
  "psa10_value_estimate": "string",
  "weighted_expected_value": "string",
  "grading_fee_estimate": "string",
  "net_uplift_estimate": "string",
  "submission_tips": [],
  "images_analyzed": 0,
  "confidence": "HIGH|MEDIUM|LOW",
  "confidence_note": "string"
}`;

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
  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  if (!API_KEY) {
    throw new Error("MISSING_API_KEY");
  }

  const API_URL = 'https://api.openai.com/v1/chat/completions';

  const imageContents = await Promise.all(
    imageFiles.map(async (file) => {
      const base64 = await compressImage(file);
      return {
        type: "image_url" as const,
        image_url: {
          url: base64,
          detail: "high" as const,
        },
      };
    })
  );

  const requestBody = {
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          ...imageContents,
          {
            type: "text" as const,
            text: `Analyze the uploaded card image(s) and respond with a JSON object only — no markdown, no explanation, just the raw JSON. Follow the system instructions and output schema exactly as defined.\n\nImages provided: ${imageFiles.length}. Respond with valid JSON only.`,
          },
        ],
      },
    ],
    temperature: 0.2,
    max_tokens: 2048,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  let response: Response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      const e = new Error("TIMEOUT");
      (e as any).statusCode = 0;
      (e as any).detail = "Request aborted after 120s timeout";
      throw e;
    }
    const e = new Error("NETWORK_ERROR");
    (e as any).statusCode = 0;
    (e as any).detail = "Network error — check your internet connection and try again";
    throw e;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      detail = errBody?.error?.message || JSON.stringify(errBody);
    } catch {}
    if (response.status === 429) {
      const e = new Error("RATE_LIMITED");
      (e as any).statusCode = 429;
      (e as any).detail = detail;
      throw e;
    }
    const e = new Error("API_ERROR");
    (e as any).statusCode = response.status;
    (e as any).detail = detail;
    throw e;
  }

  const data = await response.json();
  const rawText = data.choices?.[0]?.message?.content;
  if (!rawText) {
    throw new Error("PARSE_ERROR");
  }

  const cleaned = rawText.replace(/```json|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("PARSE_ERROR");
  }
}
