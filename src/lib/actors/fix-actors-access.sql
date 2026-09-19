-- Run once in Supabase SQL Editor.
-- Fixes application -> actor conversion: permission denied (42501) for service_role.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.actors TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.actor_photos TO service_role;

-- Dashboard authenticated reads (optional; server admin client uses service_role).
GRANT SELECT ON TABLE public.actors TO authenticated;
GRANT SELECT ON TABLE public.actor_photos TO authenticated;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'actors_id_seq'
  ) THEN
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.actors_id_seq TO service_role';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'actor_photos_id_seq'
  ) THEN
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.actor_photos_id_seq TO service_role';
  END IF;
END
$$;

-- Storage bucket for actor photos (private + signed URLs).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'actor-photos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'actor-photos',
      'actor-photos',
      false,
      10485760,
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    );
  END IF;
END
$$;

DROP POLICY IF EXISTS "actor_photos_service_role_all" ON storage.objects;
CREATE POLICY "actor_photos_service_role_all"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'actor-photos')
  WITH CHECK (bucket_id = 'actor-photos');

-- Ensure service_role can also read application-photos during copy.
DROP POLICY IF EXISTS "application_photos_service_role_all" ON storage.objects;
CREATE POLICY "application_photos_service_role_all"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'application-photos')
  WITH CHECK (bucket_id = 'application-photos');
