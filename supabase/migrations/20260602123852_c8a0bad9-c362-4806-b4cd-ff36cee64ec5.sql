-- Create a non-public schema for internal trigger functions
CREATE SCHEMA IF NOT EXISTS internal;

-- Drop the old trigger and function
DROP TRIGGER IF EXISTS trg_user_media_moderation_log ON public.user_media;
DROP FUNCTION IF EXISTS public.log_moderation_change();

-- Recreate the function in the internal schema (not exposed to PostgREST)
CREATE OR REPLACE FUNCTION internal.log_moderation_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.moderation IS DISTINCT FROM NEW.moderation THEN
    INSERT INTO public.moderation_logs (media_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.moderation, NEW.moderation, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger pointing to the internal schema function
CREATE TRIGGER trg_user_media_moderation_log
AFTER UPDATE OF moderation ON public.user_media
FOR EACH ROW
EXECUTE FUNCTION internal.log_moderation_change();
