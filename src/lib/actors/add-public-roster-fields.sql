-- Run once in Supabase SQL Editor (manual).
-- Public roster visibility, featured homepage, display order, and profile fields.
-- Does NOT delete data, drop columns, or recreate the table.
-- Safe to re-run (IF NOT EXISTS / guarded constraints).

ALTER TABLE public.actors
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false;

ALTER TABLE public.actors
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

ALTER TABLE public.actors
  ADD COLUMN IF NOT EXISTS display_order integer;

ALTER TABLE public.actors
  ADD COLUMN IF NOT EXISTS age integer;

ALTER TABLE public.actors
  ADD COLUMN IF NOT EXISTS hair_color text;

ALTER TABLE public.actors
  ADD COLUMN IF NOT EXISTS eye_color text;

ALTER TABLE public.actors
  ADD COLUMN IF NOT EXISTS projects text;

ALTER TABLE public.actors
  ADD COLUMN IF NOT EXISTS admin_note text;

-- Independent age (not derived from birth_date). Optional check constraint.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'actors_age_range_check'
  ) THEN
    ALTER TABLE public.actors
      ADD CONSTRAINT actors_age_range_check
      CHECK (age IS NULL OR (age >= 0 AND age <= 120));
  END IF;
END $$;

-- Optional index helpers for public roster queries.
CREATE INDEX IF NOT EXISTS actors_is_public_idx
  ON public.actors (is_public)
  WHERE is_public = true;

CREATE INDEX IF NOT EXISTS actors_public_roster_order_idx
  ON public.actors (display_order ASC NULLS LAST, created_at DESC)
  WHERE is_public = true;
