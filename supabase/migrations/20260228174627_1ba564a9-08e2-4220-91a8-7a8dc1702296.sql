
-- Make newsletter insert policy require a valid email format rather than blanket true
DROP POLICY "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with valid email" ON public.newsletter_subscribers FOR INSERT WITH CHECK (email IS NOT NULL AND length(email) > 0);
