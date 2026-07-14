-- Recurring variable bills + occurrence tracking
-- Also fix uber_periods uniqueness to include source

DROP INDEX IF EXISTS public.uber_periods_user_month_uidx;
CREATE UNIQUE INDEX IF NOT EXISTS uber_periods_user_source_month_uidx
  ON public.uber_periods (user_id, source, period_month)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.recurring_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  day_of_month int NOT NULL DEFAULT 1,
  estimated_amount numeric(14,2) NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.recurring_bill_occurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bill_id uuid NOT NULL REFERENCES public.recurring_bills(id) ON DELETE CASCADE,
  due_date date NOT NULL,
  expected_amount numeric(14,2) NOT NULL DEFAULT 0,
  actual_amount numeric(14,2),
  status text NOT NULL DEFAULT 'scheduled',
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  notified_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT recurring_bill_occurrences_status_check
    CHECK (status IN ('scheduled', 'due', 'paid', 'skipped'))
);

CREATE INDEX IF NOT EXISTS recurring_bills_user_id_idx
  ON public.recurring_bills (user_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS recurring_bill_occurrences_user_due_idx
  ON public.recurring_bill_occurrences (user_id, due_date)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS recurring_bill_occurrences_bill_idx
  ON public.recurring_bill_occurrences (bill_id)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS recurring_bill_occurrences_bill_due_uidx
  ON public.recurring_bill_occurrences (bill_id, due_date)
  WHERE deleted_at IS NULL;

DROP TRIGGER IF EXISTS recurring_bills_set_updated_at ON public.recurring_bills;
CREATE TRIGGER recurring_bills_set_updated_at
  BEFORE UPDATE ON public.recurring_bills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS recurring_bill_occurrences_set_updated_at ON public.recurring_bill_occurrences;
CREATE TRIGGER recurring_bill_occurrences_set_updated_at
  BEFORE UPDATE ON public.recurring_bill_occurrences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_bill_occurrences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recurring_bills_select_own ON public.recurring_bills;
CREATE POLICY recurring_bills_select_own ON public.recurring_bills
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS recurring_bills_insert_own ON public.recurring_bills;
CREATE POLICY recurring_bills_insert_own ON public.recurring_bills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS recurring_bills_update_own ON public.recurring_bills;
CREATE POLICY recurring_bills_update_own ON public.recurring_bills
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS recurring_bill_occurrences_select_own ON public.recurring_bill_occurrences;
CREATE POLICY recurring_bill_occurrences_select_own ON public.recurring_bill_occurrences
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

DROP POLICY IF EXISTS recurring_bill_occurrences_insert_own ON public.recurring_bill_occurrences;
CREATE POLICY recurring_bill_occurrences_insert_own ON public.recurring_bill_occurrences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS recurring_bill_occurrences_update_own ON public.recurring_bill_occurrences;
CREATE POLICY recurring_bill_occurrences_update_own ON public.recurring_bill_occurrences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
