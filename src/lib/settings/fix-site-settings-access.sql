-- Run once in Supabase SQL Editor (manual).
-- Fixes permission denied (42501) on public.site_settings for service_role.
-- Without these grants, getMergedSiteSettings() falls back to mock data and
-- dashboard saves fail — public site never reflects Site Ayarları changes.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.site_settings TO service_role;

-- Optional: authenticated dashboard reads (server uses service_role).
GRANT SELECT ON TABLE public.site_settings TO authenticated;
