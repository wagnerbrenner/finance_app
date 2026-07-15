-- Optional link from a transaction (goal contribution) to a savings goal.
alter table public.transactions
  add column if not exists goal_id uuid references public.goals(id);

create index if not exists transactions_goal_id_idx on public.transactions (goal_id)
  where goal_id is not null and deleted_at is null;
