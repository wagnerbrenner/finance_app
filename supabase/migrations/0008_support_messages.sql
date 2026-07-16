-- Support / SAC messages (FAQ escalate + inbox email)

CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  email text,
  name text,
  message text NOT NULL,
  matched_intent text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_messages_created_idx
  ON public.support_messages (created_at DESC);

CREATE INDEX IF NOT EXISTS support_messages_status_idx
  ON public.support_messages (status)
  WHERE status = 'open';

ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Service role / server uses DATABASE_URL (bypasses RLS). No public policies for anon writes.
