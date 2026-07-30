-- Phase 4A: efficient Drawer overview and Return exploration data.

create index if not exists entry_drawers_drawer_return_idx
  on public.entry_drawers (user_id, drawer_id, entry_id);

create or replace function public.get_drawer_return_overview(p_drawer_id uuid)
returns table (
  entry_count integer,
  first_entry_at timestamptz,
  latest_entry_at timestamptz,
  saved_for_later_count integer,
  connected_reflection_count integer
)
language sql
security invoker
set search_path = public
as $$
  select
    count(entry.id)::integer as entry_count,
    min(entry.created_at) as first_entry_at,
    max(entry.created_at) as latest_entry_at,
    count(entry.id) filter (where entry.saved_for_later)::integer as saved_for_later_count,
    count(entry.id) filter (
      where entry.parent_entry_id is not null
        or exists (
          select 1
          from public.entries as child
          where child.parent_entry_id = entry.id
            and child.user_id = auth.uid()
        )
    )::integer as connected_reflection_count
  from public.entry_drawers as entry_drawer
  join public.entries as entry
    on entry.id = entry_drawer.entry_id
   and entry.user_id = auth.uid()
  where entry_drawer.drawer_id = p_drawer_id
    and entry_drawer.user_id = auth.uid();
$$;

revoke all on function public.get_drawer_return_overview(uuid) from public;
grant execute on function public.get_drawer_return_overview(uuid) to authenticated;
