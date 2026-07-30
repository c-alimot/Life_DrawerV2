-- Phase 3B: lightweight, private Home Return history and cooldowns.

alter table public.entries
  add column if not exists last_resurfaced_at timestamptz,
  add column if not exists resurface_count integer not null default 0,
  add column if not exists return_dismissed_until timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'entries_resurface_count_nonnegative'
      and conrelid = 'public.entries'::regclass
  ) then
    alter table public.entries
      add constraint entries_resurface_count_nonnegative
      check (resurface_count >= 0);
  end if;
end;
$$;

create index if not exists entries_home_return_candidate_idx
  on public.entries (user_id, saved_for_later desc, created_at asc)
  where resurfacing_enabled;

create index if not exists entries_home_return_cooldown_idx
  on public.entries (user_id, last_resurfaced_at, return_dismissed_until)
  where resurfacing_enabled;

create or replace function public.record_home_return_display(p_entry_id uuid)
returns table (
  last_resurfaced_at timestamptz,
  resurface_count integer
)
language sql
security invoker
set search_path = public
as $$
  update public.entries as entry
  set
    last_resurfaced_at = now(),
    resurface_count = entry.resurface_count + 1
  where entry.id = p_entry_id
    and entry.user_id = auth.uid()
    and entry.resurfacing_enabled
  returning entry.last_resurfaced_at, entry.resurface_count;
$$;

revoke all on function public.record_home_return_display(uuid) from public;
grant execute on function public.record_home_return_display(uuid) to authenticated;
