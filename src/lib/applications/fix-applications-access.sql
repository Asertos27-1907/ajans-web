-- Run once in Supabase SQL Editor.
-- Fixes public application submit: permission denied (42501) for service_role.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.applications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.application_photos TO service_role;

-- Dashboard owners/admins may list via authenticated client in some paths;
-- keep authenticated read optional (service_role is used by server admin client).
GRANT SELECT ON TABLE public.applications TO authenticated;
GRANT SELECT ON TABLE public.application_photos TO authenticated;

-- Ensure sequences (if any) are usable by service_role.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'applications_id_seq'
  ) THEN
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.applications_id_seq TO service_role';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = 'application_photos_id_seq'
  ) THEN
    EXECUTE 'GRANT USAGE, SELECT ON SEQUENCE public.application_photos_id_seq TO service_role';
  END IF;
END
$$;

-- Storage: allow service_role full access on application-photos objects.
-- Bucket must exist and be private; signed URLs are created server-side.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'application-photos'
  ) THEN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'application-photos',
      'application-photos',
      false,
      10485760,
      ARRAY['image/jpeg', 'image/png', 'image/webp']
    );
  END IF;
END
$$;

DROP POLICY IF EXISTS "application_photos_service_role_all" ON storage.objects;
CREATE POLICY "application_photos_service_role_all"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'application-photos')
  WITH CHECK (bucket_id = 'application-photos');
