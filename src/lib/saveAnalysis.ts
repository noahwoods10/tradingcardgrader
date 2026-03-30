import { supabase } from "@/integrations/supabase/client";
import type { GradingResult } from "@/lib/openai";

export async function saveAnalysis(
  userId: string,
  result: GradingResult,
  imageFiles: File[]
): Promise<void> {
  // Upload images
  const imageUrls: string[] = [];
  for (const file of imageFiles) {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage
      .from("card-images")
      .upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("card-images").getPublicUrl(path);
      imageUrls.push(data.publicUrl);
    }
  }

  // Insert analysis
  const { error } = await supabase.from("grade_analyses").insert({
    user_id: userId,
    card_name: result.card_name,
    set_name: result.set_name,
    card_number: result.card_number,
    year: result.year,
    rarity: result.rarity,
    grade_label: result.grade_prediction.label,
    overall_score: result.overall_score,
    verdict: result.verdict,
    psa_10_probability: result.probabilities.psa_10,
    psa_9_probability: result.probabilities.psa_9,
    raw_value_estimate: result.raw_value_estimate,
    psa10_value_estimate: result.psa10_value_estimate,
    weighted_expected_value: result.weighted_expected_value,
    confidence: result.confidence,
    full_result_json: result as any,
    image_urls: imageUrls,
  });

  if (error) throw error;
}
