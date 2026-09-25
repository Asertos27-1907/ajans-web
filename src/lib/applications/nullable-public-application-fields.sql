-- Run once in Supabase SQL Editor (manual).
-- Allows short public applications without birth_date / gender / profile fields.
-- Does NOT delete or alter existing data; only drops NOT NULL where present.

ALTER TABLE public.applications
  ALTER COLUMN birth_date DROP NOT NULL;

ALTER TABLE public.applications
  ALTER COLUMN gender DROP NOT NULL;

-- These are typically already nullable; statements are safe if already nullable.
ALTER TABLE public.applications
  ALTER COLUMN height_cm DROP NOT NULL;

ALTER TABLE public.applications
  ALTER COLUMN weight_kg DROP NOT NULL;

ALTER TABLE public.applications
  ALTER COLUMN experience DROP NOT NULL;
