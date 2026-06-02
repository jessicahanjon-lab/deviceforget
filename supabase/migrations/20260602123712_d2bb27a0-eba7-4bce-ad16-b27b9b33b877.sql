-- Create moderation_logs table to track status changes over time
CREATE TABLE public.moderation_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id UUID NOT NULL REFERENCES public.user_media(id) ON DELETE CASCADE,
  from_status public.moderation_status NULL,
  to_status public.moderation_status NOT NULL,
  changed_by UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Grants: owners read their own logs via RLS; service_role has full access
GRANT SELECT ON public.moderation_logs TO authenticated;
GRANT ALL ON public.moderation_logs TO service_role;

-- Enable RLS
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: owners can view logs for their own media
CREATE POLICY "Owners can view moderation logs for their media"
ON public.moderation_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_media um
    WHERE um.id = moderation_logs.media_id
    AND um.owner_id = auth.uid()
  )
);

-- Trigger function to log moderation changes
CREATE OR REPLACE FUNCTION public.log_moderation_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.moderation IS DISTINCT FROM NEW.moderation THEN
    INSERT INTO public.moderation_logs (media_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.moderation, NEW.moderation, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger to user_media
CREATE TRIGGER trg_user_media_moderation_log
AFTER UPDATE OF moderation ON public.user_media
FOR EACH ROW
EXECUTE FUNCTION public.log_moderation_change();
