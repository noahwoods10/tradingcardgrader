import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
    const { images } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageContents = images.map((dataUrl: string) => ({
      type: "image_url",
      image_url: { url: dataUrl, detail: "high" },
    }));

    const identificationPrompt = `You are an expert Pokemon card identifier. Examine these card images with extreme care and identify every detail precisely. Follow these steps in order:

STEP 1 - Read the card number: Look at the very bottom of the card front for the card number (e.g. 164/181). This is the single most important identifier. Read it character by character. Do not guess.

STEP 2 - Identify the art style: Is this a standard holo, full art, alternate full art, special illustration rare, hyper rare, or secret rare? Full arts and alternate full arts have artwork that extends to the card edges with no white border around the artwork. Standard holos have a white border and a defined illustration box.

STEP 3 - Read the set symbol: Look at the bottom right of the card for the set symbol and identify the set.

STEP 4 - Read the copyright year: Look at the very bottom of the card for the copyright year (e.g. '2019').

STEP 5 - Cross reference: Use the card number, art style, set symbol, and year together to give the most precise identification. For example for Gengar & Mimikyu GX: 53/181 is the standard holo, 164/181 is the full art, 165/181 is the alternate full art. These are completely different cards with completely different values. For Pokemon cards specifically: Umbreon ex 161/131 is from Prismatic Evolutions 2025. Charizard ex 199/165 is from Pokemon 151 2023.

${images.length > 1 ? 'Multiple images are provided — focus on the one that most clearly shows the card front for identification.' : ''}

Respond with JSON only:
{
  "card_name": "string",
  "set_name": "string",
  "card_number": "string",
  "year": "string",
  "rarity": "string",
  "art_style": "Standard Holo" | "Full Art" | "Alternate Full Art" | "Special Illustration Rare" | "Hyper Rare" | "Secret Rare" | "Other",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "confidence_note": "string",
  "identification_reasoning": "string explaining step by step what you saw on the card — the card number you read, the art style you detected, the set symbol, and how you cross-referenced them"
}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              ...imageContents,
              { type: 'text', text: identificationPrompt },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 700,
      }),
    });

    if (!openaiResponse.ok) {
      let detail = `HTTP ${openaiResponse.status}`;
      try {
        const errBody = await openaiResponse.json();
        detail = errBody?.error?.message || JSON.stringify(errBody);
      } catch { /* ignore */ }
      return new Response(JSON.stringify({ error: detail, code: 'API_ERROR' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await openaiResponse.json();
    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) {
      return new Response(JSON.stringify({ error: 'No content', code: 'PARSE_ERROR' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const cleaned = rawText.replace(/```json|```/g, '').trim();
    let result;
    try {
      result = JSON.parse(cleaned);
    } catch {
      return new Response(JSON.stringify({ error: 'Failed to parse response', code: 'PARSE_ERROR' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
