-- Phase 1B: record intentional full-entry views atomically.

create or replace function public.record_entry_view(p_entry_id uuid)
returns table (
  last_viewed_at timestamptz,
  revisit_count integer
)
language sql
security invoker
set search_path = public
as $$
  update public.entries as entry
  set
    last_viewed_at = now(),
    revisit_count = entry.revisit_count + 1
  where entry.id = p_entry_id
    and entry.user_id = auth.uid()
  returning entry.last_viewed_at, entry.revisit_count;
$$;

revoke all on function public.record_entry_view(uuid) from public;
grant execute on function public.record_entry_view(uuid) to authenticated;
