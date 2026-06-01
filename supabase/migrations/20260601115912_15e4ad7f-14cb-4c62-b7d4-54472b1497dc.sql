
-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ MEDIA KIND ENUM ============
CREATE TYPE public.media_kind AS ENUM ('wallpaper', 'theme');
CREATE TYPE public.media_visibility AS ENUM ('private', 'unlisted', 'public');
CREATE TYPE public.moderation_status AS ENUM ('pending', 'approved', 'rejected');

-- ============ USER MEDIA ============
CREATE TABLE public.user_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.media_kind NOT NULL DEFAULT 'wallpaper',
  title TEXT NOT NULL,
  description TEXT,
  storage_path TEXT NOT NULL,           -- path inside the 'media' bucket: {owner_id}/{uuid}.{ext}
  thumb_path TEXT,                       -- optimized thumbnail path
  mime_type TEXT NOT NULL,
  width INT,
  height INT,
  file_size_bytes BIGINT,
  dominant_colors TEXT[] DEFAULT '{}',
  aesthetic TEXT,
  mood TEXT,
  tags TEXT[] DEFAULT '{}',
  visibility public.media_visibility NOT NULL DEFAULT 'private',
  moderation public.moderation_status NOT NULL DEFAULT 'pending',
  download_count INT NOT NULL DEFAULT 0,
  like_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_media_owner ON public.user_media(owner_id);
CREATE INDEX idx_user_media_visibility ON public.user_media(visibility);
CREATE INDEX idx_user_media_kind ON public.user_media(kind);
CREATE INDEX idx_user_media_created_at ON public.user_media(created_at DESC);

GRANT SELECT ON public.user_media TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_media TO authenticated;
GRANT ALL ON public.user_media TO service_role;

ALTER TABLE public.user_media ENABLE ROW LEVEL SECURITY;

-- Owners see all of their own uploads
CREATE POLICY "Owners can view their media"
  ON public.user_media FOR SELECT
  USING (auth.uid() = owner_id);

-- Public approved media is visible to everyone
CREATE POLICY "Public approved media is viewable"
  ON public.user_media FOR SELECT
  USING (visibility = 'public' AND moderation = 'approved');

CREATE POLICY "Owners can insert their media"
  ON public.user_media FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their media"
  ON public.user_media FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their media"
  ON public.user_media FOR DELETE
  USING (auth.uid() = owner_id);

CREATE TRIGGER user_media_set_updated_at
BEFORE UPDATE ON public.user_media
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ STORAGE BUCKET (private) ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

-- Owners can read their own files (files live under {auth.uid}/...)
CREATE POLICY "Users read own media files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone (authenticated) can read files referenced by an approved public row
CREATE POLICY "Public approved media files are readable"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'media'
    AND EXISTS (
      SELECT 1 FROM public.user_media m
      WHERE (m.storage_path = storage.objects.name OR m.thumb_path = storage.objects.name)
        AND m.visibility = 'public'
        AND m.moderation = 'approved'
    )
  );

CREATE POLICY "Users upload to own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users update own files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users delete own files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
