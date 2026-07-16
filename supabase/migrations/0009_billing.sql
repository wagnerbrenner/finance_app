-- Billing: trial, account tier, subscriptions (Mercado Pago)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS account_tier text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS trial_ends_at timestamptz;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_account_tier_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_account_tier_check
  CHECK (account_tier IN ('standard', 'test'));

-- Early adopters / existing accounts: first month of Pro from signup/create
UPDATE public.profiles
SET trial_ends_at = created_at + interval '1 month'
WHERE trial_ends_at IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, account_tier, trial_ends_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    NEW.raw_user_meta_data ->> 'avatar_url',
    'standard',
    (NEW.created_at AT TIME ZONE 'UTC') + interval '1 month'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'mercadopago',
  external_id text,
  plan text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_plan_check CHECK (plan IN ('monthly', 'annual')),
  CONSTRAINT subscriptions_status_check CHECK (
    status IN ('pending', 'trialing', 'active', 'past_due', 'canceled', 'expired')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_provider_external_uidx
  ON public.subscriptions (provider, external_id)
  WHERE external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions (user_id);

CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions (id) ON DELETE CASCADE,
  external_payment_id text,
  amount numeric(14, 2) NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL,
  paid_at timestamptz,
  period_label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscription_payments_status_check CHECK (
    status IN ('approved', 'rejected', 'refunded', 'pending')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS subscription_payments_external_uidx
  ON public.subscription_payments (external_payment_id)
  WHERE external_payment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscription_payments_subscription_id_idx
  ON public.subscription_payments (subscription_id);

CREATE TABLE IF NOT EXISTS public.subscription_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL DEFAULT 'mercadopago',
  event_id text,
  topic text,
  payload jsonb NOT NULL,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS subscription_events_provider_event_uidx
  ON public.subscription_events (provider, event_id)
  WHERE event_id IS NOT NULL;
