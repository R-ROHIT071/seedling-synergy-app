
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
