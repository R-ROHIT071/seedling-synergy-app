
-- Fix the overly permissive INSERT policy
DROP POLICY "Service can insert notifications" ON public.notifications;

-- Only authenticated users can insert notifications (for their own or system triggers)
CREATE POLICY "Authenticated can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);
