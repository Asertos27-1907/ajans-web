-- Run once in Supabase SQL Editor.
-- Adds free-text personnel_name for Aramalar module.
-- Does NOT drop assigned_to (legacy column kept intact).
-- Idempotent: safe to re-run.

ALTER TABLE public.call_records
  ADD COLUMN IF NOT EXISTS personnel_name text;

CREATE INDEX IF NOT EXISTS call_records_personnel_name_idx
  ON public.call_records (personnel_name);

-- Privileges already covered by table-level GRANT on call_records;
-- re-assert for safety after column add.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.call_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.call_records TO service_role;
