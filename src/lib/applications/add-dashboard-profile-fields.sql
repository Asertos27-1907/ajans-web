-- Run once in Supabase SQL Editor (manual).
-- Adds dashboard-only profile fields for short public applications.
-- Does NOT delete data, drop columns, or recreate the table.
-- All new columns are nullable for backward compatibility.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS age integer;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS hair_color text;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS eye_color text;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS projects text;

-- Independent age (not derived from birth_date). Optional check constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'applications_age_range_check'
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_age_range_check
      CHECK (age IS NULL OR (age >= 0 AND age <= 120));
  END IF;
END $$;
