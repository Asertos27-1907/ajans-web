-- Run once in Supabase SQL Editor.
-- Creates call_records + call_history with RLS, GRANT, indexes, and updated_at trigger.
-- Idempotent: safe to re-run.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Helpers: is_active_admin / set_updated_at
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
      AND active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_active_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_active_admin() TO authenticated, service_role;

-- Keep is_owner() available if not already defined (non-recursive).
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'owner'
      AND active = true
  );
$$;

REVOKE ALL ON FUNCTION public.is_owner() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_owner() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Table: call_records
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.call_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text,
  phone text NOT NULL,
  phone_normalized text NOT NULL,
  city text,
  district text,
  source text,
  status text NOT NULL DEFAULT 'not_called'
    CHECK (status IN (
      'not_called',
      'unreachable',
      'call_again',
      'interested',
      'meeting_done',
      'face_to_face_planned',
      'positive',
      'negative',
      'archived'
    )),
  note text,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  personnel_name text,
  last_called_at timestamptz,
  next_action_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Backfill phone_normalized if table existed without it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'call_records'
      AND column_name = 'phone_normalized'
  ) THEN
    ALTER TABLE public.call_records
      ADD COLUMN phone_normalized text;
    UPDATE public.call_records
      SET phone_normalized = regexp_replace(coalesce(phone, ''), '\D', '', 'g')
      WHERE phone_normalized IS NULL;
    ALTER TABLE public.call_records
      ALTER COLUMN phone_normalized SET NOT NULL;
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS call_records_phone_normalized_uidx
  ON public.call_records (phone_normalized);

CREATE INDEX IF NOT EXISTS call_records_phone_idx
  ON public.call_records (phone);

CREATE INDEX IF NOT EXISTS call_records_status_idx
  ON public.call_records (status);

CREATE INDEX IF NOT EXISTS call_records_next_action_at_idx
  ON public.call_records (next_action_at);

CREATE INDEX IF NOT EXISTS call_records_assigned_to_idx
  ON public.call_records (assigned_to);

CREATE INDEX IF NOT EXISTS call_records_personnel_name_idx
  ON public.call_records (personnel_name);

CREATE INDEX IF NOT EXISTS call_records_created_at_idx
  ON public.call_records (created_at DESC);

DROP TRIGGER IF EXISTS call_records_set_updated_at ON public.call_records;
CREATE TRIGGER call_records_set_updated_at
  BEFORE UPDATE ON public.call_records
  FOR EACH ROW
  EXECUTE PROCEDURE public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Table: call_history
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.call_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_record_id uuid NOT NULL REFERENCES public.call_records(id) ON DELETE CASCADE,
  admin_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL
    CHECK (status IN (
      'not_called',
      'unreachable',
      'call_again',
      'interested',
      'meeting_done',
      'face_to_face_planned',
      'positive',
      'negative',
      'archived'
    )),
  note text,
  called_at timestamptz NOT NULL DEFAULT now(),
  next_action_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS call_history_call_record_id_idx
  ON public.call_history (call_record_id);

CREATE INDEX IF NOT EXISTS call_history_called_at_idx
  ON public.call_history (called_at DESC);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

ALTER TABLE public.call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS call_records_select_admin ON public.call_records;
CREATE POLICY call_records_select_admin
  ON public.call_records
  FOR SELECT
  TO authenticated
  USING (public.is_active_admin() OR public.is_owner());

DROP POLICY IF EXISTS call_records_insert_admin ON public.call_records;
CREATE POLICY call_records_insert_admin
  ON public.call_records
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_active_admin() OR public.is_owner());

DROP POLICY IF EXISTS call_records_update_admin ON public.call_records;
CREATE POLICY call_records_update_admin
  ON public.call_records
  FOR UPDATE
  TO authenticated
  USING (public.is_active_admin() OR public.is_owner())
  WITH CHECK (public.is_active_admin() OR public.is_owner());

DROP POLICY IF EXISTS call_records_delete_admin ON public.call_records;
CREATE POLICY call_records_delete_admin
  ON public.call_records
  FOR DELETE
  TO authenticated
  USING (public.is_active_admin() OR public.is_owner());

DROP POLICY IF EXISTS call_history_select_admin ON public.call_history;
CREATE POLICY call_history_select_admin
  ON public.call_history
  FOR SELECT
  TO authenticated
  USING (public.is_active_admin() OR public.is_owner());

DROP POLICY IF EXISTS call_history_insert_admin ON public.call_history;
CREATE POLICY call_history_insert_admin
  ON public.call_history
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_active_admin() OR public.is_owner());

DROP POLICY IF EXISTS call_history_update_admin ON public.call_history;
CREATE POLICY call_history_update_admin
  ON public.call_history
  FOR UPDATE
  TO authenticated
  USING (public.is_active_admin() OR public.is_owner())
  WITH CHECK (public.is_active_admin() OR public.is_owner());

DROP POLICY IF EXISTS call_history_delete_admin ON public.call_history;
CREATE POLICY call_history_delete_admin
  ON public.call_history
  FOR DELETE
  TO authenticated
  USING (public.is_active_admin() OR public.is_owner());

-- ---------------------------------------------------------------------------
-- GRANT (RLS alone is not enough — avoids 42501)
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.call_records TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.call_records TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.call_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.call_history TO service_role;
