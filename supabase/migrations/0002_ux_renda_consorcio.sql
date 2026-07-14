-- UX evolution: renda extra source, debts due_date, consortia

ALTER TABLE public.uber_periods
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'uber';

ALTER TABLE public.debts
  ADD COLUMN IF NOT EXISTS due_date date;

CREATE TABLE IF NOT EXISTS public.consortia (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  administrator text,
  group_number text,
  letter_number text,
  credit_amount numeric(14,2) NOT NULL DEFAULT 0,
  installment_amount numeric(14,2) NOT NULL DEFAULT 0,
  total_installments int NOT NULL DEFAULT 0,
  paid_installments int NOT NULL DEFAULT 0,
  next_due_date date,
  contemplated boolean NOT NULL DEFAULT false,
  contemplated_at date,
  status text NOT NULL DEFAULT 'active',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX IF NOT EXISTS consortia_user_id_idx ON public.consortia(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS consortia_next_due_idx ON public.consortia(user_id, next_due_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS debts_due_date_idx ON public.debts(user_id, due_date) WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS consortia_set_updated_at ON public.consortia;
CREATE TRIGGER consortia_set_updated_at
  BEFORE UPDATE ON public.consortia
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.consortia ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS consortia_select_own ON public.consortia;
CREATE POLICY consortia_select_own ON public.consortia
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS consortia_insert_own ON public.consortia;
CREATE POLICY consortia_insert_own ON public.consortia
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS consortia_update_own ON public.consortia;
CREATE POLICY consortia_update_own ON public.consortia
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
