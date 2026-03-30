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
              {
                type: 'text',
                text: `You are an expert Pokemon and TCG card identifier with encyclopedic knowledge of every Pokemon card ever printed. Examine these card images very carefully and identify the card with precision. Look for: the card name printed on the card, the set symbol in the bottom right corner, the card number printed at the bottom, the year in the copyright text at the very bottom of the card, and the rarity symbol. Cross-reference all of these to give the most accurate identification possible. For Pokemon cards specifically: Umbreon ex 161/131 is from Prismatic Evolutions 2025. Charizard ex 199/165 is from Pokemon 151 2023. Use your full knowledge of the Pokemon TCG to identify the set correctly even if the set symbol is partially obscured.${images.length > 1 ? ' Multiple images are provided — focus on the one that most clearly shows the card front for identification.' : ''} Respond with JSON only: { "card_name": "string", "set_name": "string", "card_number": "string", "year": "string", "rarity": "string", "confidence": "HIGH" | "MEDIUM" | "LOW", "confidence_note": "string" }`,
              },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 500,
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
