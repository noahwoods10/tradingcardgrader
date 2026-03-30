-- Create grade_analyses table
CREATE TABLE public.grade_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  card_name text,
  set_name text,
  card_number text,
  year text,
  rarity text,
  grade_label text,
  overall_score float,
  verdict text,
  psa_10_probability int,
  psa_9_probability int,
  raw_value_estimate text,
  psa10_value_estimate text,
  weighted_expected_value text,
  confidence text,
  full_result_json jsonb,
  image_urls text[]
);

-- Enable RLS
ALTER TABLE public.grade_analyses ENABLE ROW LEVEL SECURITY;

-- Users can only read their own analyses
CREATE POLICY "Users can read own analyses"
  ON public.grade_analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses"
  ON public.grade_analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create storage bucket for card images
INSERT INTO storage.buckets (id, name, public)
VALUES ('card-images', 'card-images', true);

-- Storage policies: users can upload to their own folder
CREATE POLICY "Users can upload card images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'card-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Users can read their own card images
CREATE POLICY "Users can read own card images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'card-images' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Public read access for card images (for displaying in UI)
CREATE POLICY "Public read card images"
  ON storage.objects FOR SELECT
  TO anon
  USING (bucket_id = 'card-images');