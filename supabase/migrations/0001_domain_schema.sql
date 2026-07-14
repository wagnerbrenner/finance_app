-- Finance OS Phase 1–10 domain schema
-- Apply after 0000_phase0_profiles.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Shared updated_at trigger already exists as handle_updated_at()

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- ========== ACCOUNTS ==========
CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'checking', -- checking | savings | cash | investment | other
  institution text,
  initial_balance numeric(14,2) NOT NULL DEFAULT 0,
  color text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON public.accounts(user_id) WHERE deleted_at IS NULL;

-- ========== CATEGORIES ==========
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'expense', -- income | expense
  icon text,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories(user_id) WHERE deleted_at IS NULL;

-- ========== CREDIT CARDS ==========
CREATE TABLE IF NOT EXISTS public.credit_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  limit_amount numeric(14,2) NOT NULL DEFAULT 0,
  closing_day int NOT NULL DEFAULT 1,
  due_day int NOT NULL DEFAULT 10,
  account_id uuid REFERENCES public.accounts(id),
  color text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS credit_cards_user_id_idx ON public.credit_cards(user_id) WHERE deleted_at IS NULL;

-- ========== TRANSACTIONS ==========
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.accounts(id),
  category_id uuid REFERENCES public.categories(id),
  credit_card_id uuid REFERENCES public.credit_cards(id),
  type text NOT NULL, -- income | expense | transfer
  amount numeric(14,2) NOT NULL,
  description text NOT NULL DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'cleared', -- pending | cleared | scheduled
  is_transfer boolean NOT NULL DEFAULT false,
  transfer_account_id uuid REFERENCES public.accounts(id),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS transactions_date_idx ON public.transactions(user_id, date) WHERE deleted_at IS NULL;

-- ========== RECURRENCES ==========
CREATE TABLE IF NOT EXISTS public.recurrences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.accounts(id),
  category_id uuid REFERENCES public.categories(id),
  credit_card_id uuid REFERENCES public.credit_cards(id),
  type text NOT NULL, -- income | expense
  amount numeric(14,2) NOT NULL,
  description text NOT NULL DEFAULT '',
  frequency text NOT NULL DEFAULT 'monthly', -- weekly | monthly | yearly
  day_of_month int DEFAULT 1,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS recurrences_user_id_idx ON public.recurrences(user_id) WHERE deleted_at IS NULL;

-- ========== INSTALLMENTS ==========
CREATE TABLE IF NOT EXISTS public.installments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  credit_card_id uuid REFERENCES public.credit_cards(id),
  account_id uuid REFERENCES public.accounts(id),
  category_id uuid REFERENCES public.categories(id),
  description text NOT NULL,
  total_amount numeric(14,2) NOT NULL,
  installment_amount numeric(14,2) NOT NULL,
  total_installments int NOT NULL,
  paid_installments int NOT NULL DEFAULT 0,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS installments_user_id_idx ON public.installments(user_id) WHERE deleted_at IS NULL;

-- ========== CARD INVOICES ==========
CREATE TABLE IF NOT EXISTS public.card_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  credit_card_id uuid NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  reference_month date NOT NULL, -- first day of month
  amount numeric(14,2) NOT NULL DEFAULT 0,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'open', -- open | paid | overdue
  paid_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS card_invoices_user_id_idx ON public.card_invoices(user_id) WHERE deleted_at IS NULL;

-- ========== DEBTS ==========
CREATE TABLE IF NOT EXISTS public.debts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  creditor text,
  original_amount numeric(14,2) NOT NULL,
  balance numeric(14,2) NOT NULL,
  interest_rate numeric(8,4) NOT NULL DEFAULT 0, -- monthly %
  total_installments int,
  current_installment int DEFAULT 0,
  installment_amount numeric(14,2),
  start_date date,
  type text NOT NULL DEFAULT 'other', -- loan | financing | credit_card | other
  priority text NOT NULL DEFAULT 'medium', -- low | medium | high
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS debts_user_id_idx ON public.debts(user_id) WHERE deleted_at IS NULL;

-- ========== GOALS ==========
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'other', -- emergency | house | car | business | investment | other
  target_amount numeric(14,2) NOT NULL,
  current_amount numeric(14,2) NOT NULL DEFAULT 0,
  monthly_contribution numeric(14,2) NOT NULL DEFAULT 0,
  deadline date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON public.goals(user_id) WHERE deleted_at IS NULL;

-- ========== INVESTMENTS ==========
CREATE TABLE IF NOT EXISTS public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'other', -- tesouro | cdb | lci | lca | etf | fii | stock | crypto | other
  ticker text,
  quantity numeric(18,8) NOT NULL DEFAULT 0,
  average_price numeric(14,4) NOT NULL DEFAULT 0,
  current_price numeric(14,4) NOT NULL DEFAULT 0,
  expected_yield numeric(8,4) NOT NULL DEFAULT 0, -- annual %
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS investments_user_id_idx ON public.investments(user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.investment_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  investment_id uuid NOT NULL REFERENCES public.investments(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL,
  quantity numeric(18,8),
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS investment_contributions_user_id_idx ON public.investment_contributions(user_id) WHERE deleted_at IS NULL;

-- ========== UBER ==========
CREATE TABLE IF NOT EXISTS public.uber_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  period_month date NOT NULL, -- first day of month
  gross_revenue numeric(14,2) NOT NULL DEFAULT 0,
  days_worked int NOT NULL DEFAULT 0,
  hours_worked numeric(8,2) NOT NULL DEFAULT 0,
  km_driven numeric(10,2) NOT NULL DEFAULT 0,
  fuel_cost numeric(14,2) NOT NULL DEFAULT 0,
  fuel_price numeric(14,4) NOT NULL DEFAULT 0,
  vehicle_consumption numeric(8,2) NOT NULL DEFAULT 0, -- km/l
  tolls numeric(14,2) NOT NULL DEFAULT 0,
  wash numeric(14,2) NOT NULL DEFAULT 0,
  maintenance numeric(14,2) NOT NULL DEFAULT 0,
  oil_change numeric(14,2) NOT NULL DEFAULT 0,
  tires numeric(14,2) NOT NULL DEFAULT 0,
  insurance numeric(14,2) NOT NULL DEFAULT 0,
  ipva numeric(14,2) NOT NULL DEFAULT 0,
  licensing numeric(14,2) NOT NULL DEFAULT 0,
  depreciation numeric(14,2) NOT NULL DEFAULT 0,
  vehicle_rent numeric(14,2) NOT NULL DEFAULT 0,
  other_costs numeric(14,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (user_id, period_month)
);
CREATE INDEX IF NOT EXISTS uber_periods_user_id_idx ON public.uber_periods(user_id) WHERE deleted_at IS NULL;

-- ========== SETTINGS (projection) ==========
CREATE TABLE IF NOT EXISTS public.finance_settings (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  inflation_rate numeric(8,4) NOT NULL DEFAULT 4.5, -- annual %
  investment_yield numeric(8,4) NOT NULL DEFAULT 12, -- annual %
  salary_increase_rate numeric(8,4) NOT NULL DEFAULT 5, -- annual %
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Triggers
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'accounts','categories','credit_cards','transactions','recurrences',
    'installments','card_invoices','debts','goals','investments',
    'investment_contributions','uber_periods','finance_settings'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_set_updated_at ON public.%I', t, t);
    EXECUTE format(
      'CREATE TRIGGER %I_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()',
      t, t
    );
  END LOOP;
END $$;

-- RLS helper
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'accounts','categories','credit_cards','transactions','recurrences',
    'installments','card_invoices','debts','goals','investments',
    'investment_contributions','uber_periods'
  ]
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    EXECUTE format('DROP POLICY IF EXISTS %I_select_own ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_select_own ON public.%I FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL)',
      t, t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_insert_own ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_insert_own ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)',
      t, t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I_update_own ON public.%I', t, t);
    EXECUTE format(
      'CREATE POLICY %I_update_own ON public.%I FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)',
      t, t
    );
  END LOOP;
END $$;

ALTER TABLE public.finance_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS finance_settings_select_own ON public.finance_settings;
CREATE POLICY finance_settings_select_own ON public.finance_settings
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS finance_settings_upsert_own ON public.finance_settings;
CREATE POLICY finance_settings_insert_own ON public.finance_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS finance_settings_update_own ON public.finance_settings;
CREATE POLICY finance_settings_update_own ON public.finance_settings
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed default categories function for new users (optional call from app)
CREATE OR REPLACE FUNCTION public.seed_default_categories(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.categories WHERE user_id = p_user_id AND deleted_at IS NULL) THEN
    RETURN;
  END IF;

  INSERT INTO public.categories (user_id, name, kind, color) VALUES
    (p_user_id, 'Salário', 'income', '#14b8a6'),
    (p_user_id, 'Freelance', 'income', '#22c55e'),
    (p_user_id, 'Uber / Apps', 'income', '#38bdf8'),
    (p_user_id, 'Moradia', 'expense', '#f97316'),
    (p_user_id, 'Alimentação', 'expense', '#ef4444'),
    (p_user_id, 'Transporte', 'expense', '#a78bfa'),
    (p_user_id, 'Saúde', 'expense', '#f43f5e'),
    (p_user_id, 'Lazer', 'expense', '#eab308'),
    (p_user_id, 'Assinaturas', 'expense', '#94a3b8'),
    (p_user_id, 'Educação', 'expense', '#60a5fa'),
    (p_user_id, 'Outros', 'expense', '#71717a');
END;
$$;
