-- ON CONFLICT (bill_id, due_date) requires a non-partial unique index.
-- The previous index was partial (WHERE deleted_at IS NULL), which breaks Drizzle onConflictDoNothing.

DROP INDEX IF EXISTS public.recurring_bill_occurrences_bill_due_uidx;

CREATE UNIQUE INDEX IF NOT EXISTS recurring_bill_occurrences_bill_due_uidx
  ON public.recurring_bill_occurrences (bill_id, due_date);
