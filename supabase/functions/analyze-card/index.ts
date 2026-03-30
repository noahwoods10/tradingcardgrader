import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `You are Trading Card Grader (TCG), an expert PSA card grading analyst. You predict PSA grades for Pokemon TCG and other trading cards by analyzing photos. You have deep knowledge of PSA's official grading standards as updated in 2025.

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  if (!OPENAI_API_KEY) {
    return new Response(JSON.stringify({ error: 'OpenAI API key not configured on server' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const { images, cardDetails } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (images.length > 10) {
      return new Response(JSON.stringify({ error: 'Too many images (max 10)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageContents = images.map((dataUrl: string) => ({
      type: "image_url",
      image_url: { url: dataUrl, detail: "high" },
    }));

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              ...imageContents,
              {
                type: 'text',
                text: `Analyze the uploaded card image(s) and respond with a JSON object only — no markdown, no explanation, just the raw JSON. Follow the system instructions and output schema exactly as defined.\n\nImages provided: ${images.length}. Respond with valid JSON only.`,
              },
            ],
          },
        ],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });

    if (!openaiResponse.ok) {
      let detail = `HTTP ${openaiResponse.status}`;
      try {
        const errBody = await openaiResponse.json();
        detail = errBody?.error?.message || JSON.stringify(errBody);
      } catch { /* ignore */ }

      const status = openaiResponse.status === 429 ? 429 : 502;
      return new Response(JSON.stringify({ error: detail, code: openaiResponse.status === 429 ? 'RATE_LIMITED' : 'API_ERROR' }), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await openaiResponse.json();
    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) {
      return new Response(JSON.stringify({ error: 'No content in API response', code: 'PARSE_ERROR' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to parse API response as JSON', code: 'PARSE_ERROR' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error', code: 'SERVER_ERROR' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
