
-- Disease reports table for tracking crop health history
CREATE TABLE public.disease_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  crop_name text NOT NULL,
  image_url text,
  diagnosis text NOT NULL,
  confidence integer NOT NULL DEFAULT 0,
  treatment text,
  preventive_measures text,
  severity text NOT NULL DEFAULT 'unknown',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.disease_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON public.disease_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reports" ON public.disease_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON public.disease_reports FOR DELETE USING (auth.uid() = user_id);

-- Weather cache table
CREATE TABLE public.weather_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(location)
);

ALTER TABLE public.weather_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view weather" ON public.weather_cache FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert weather" ON public.weather_cache FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can update weather" ON public.weather_cache FOR UPDATE USING (auth.uid() IS NOT NULL);
