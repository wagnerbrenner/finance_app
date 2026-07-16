-- Degustação: primeiro mês completo de Pro (em vez de 15 dias)

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

-- Contas existentes: fim do trial = 1 mês após a criação da conta
UPDATE public.profiles
SET trial_ends_at = created_at + interval '1 month',
    updated_at = now()
WHERE account_tier = 'standard'
  AND deleted_at IS NULL;
