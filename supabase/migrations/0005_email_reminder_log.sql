-- Email reminder dedupe for due-date notifications
CREATE TABLE IF NOT EXISTS public.email_reminder_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_key text NOT NULL,
  severity text NOT NULL,
  due_date date NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS email_reminder_log_user_key_sev_due_uidx
  ON public.email_reminder_log (user_id, notification_key, severity, due_date);

CREATE INDEX IF NOT EXISTS email_reminder_log_user_sent_idx
  ON public.email_reminder_log (user_id, sent_at desc);

ALTER TABLE public.email_reminder_log ENABLE ROW LEVEL SECURITY;
