-- Income source preferences on finance_settings

ALTER TABLE public.finance_settings
  ADD COLUMN IF NOT EXISTS has_freelance boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_uber boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS income_onboarding_done boolean NOT NULL DEFAULT false;
