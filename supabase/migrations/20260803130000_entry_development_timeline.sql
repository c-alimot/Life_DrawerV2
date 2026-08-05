create or replace function public.get_entry_reflection_chain(p_entry_id uuid)
returns table (
  entry_id uuid,
  user_id uuid,
  parent_entry_id uuid,
  reflection_type text,
  current_status text,
  created_at timestamptz,
  preview text
)
language sql
stable
security invoker
set search_path = public
as $$
  with recursive ancestors as (
    select entry.id, entry.parent_entry_id, array[entry.id] as path
    from public.entries as entry
    where entry.id = p_entry_id
      and entry.user_id = auth.uid()

    union all

    select parent.id, parent.parent_entry_id, ancestors.path || parent.id
    from public.entries as parent
    join ancestors on ancestors.parent_entry_id = parent.id
    where parent.user_id = auth.uid()
      and not parent.id = any(ancestors.path)
  ), root as (
    select id
    from ancestors
    order by cardinality(path) desc
    limit 1
  ), descendants as (
    select entry.id, entry.parent_entry_id, array[entry.id] as path
    from public.entries as entry
    join root on root.id = entry.id
    where entry.user_id = auth.uid()

    union all

    select child.id, child.parent_entry_id, descendants.path || child.id
    from public.entries as child
    join descendants on child.parent_entry_id = descendants.id
    where child.user_id = auth.uid()
      and not child.id = any(descendants.path)
  )
  select
    entry.id,
    entry.user_id,
    entry.parent_entry_id,
    entry.reflection_type,
    entry.current_status,
    entry.created_at,
    left(regexp_replace(trim(entry.content), '\s+', ' ', 'g'), 240)
  from public.entries as entry
  join descendants on descendants.id = entry.id
  where entry.user_id = auth.uid()
  order by entry.created_at asc, entry.id asc;
$$;

revoke all on function public.get_entry_reflection_chain(uuid) from public;
grant execute on function public.get_entry_reflection_chain(uuid) to authenticated;
