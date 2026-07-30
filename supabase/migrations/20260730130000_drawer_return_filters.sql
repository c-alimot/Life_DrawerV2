-- Phase 4B: server-scoped manual Drawer exploration filters and summaries.

create index if not exists entry_tags_user_entry_tag_idx
  on public.entry_tags (user_id, entry_id, tag_id);

drop function if exists public.get_drawer_return_overview(uuid);

create function public.get_drawer_return_overview(p_drawer_id uuid)
returns table (
  entry_count integer,
  first_entry_at timestamptz,
  latest_entry_at timestamptz,
  saved_for_later_count integer,
  connected_reflection_count integer,
  revisited_count integer
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
          select 1 from public.entries as child
          where child.parent_entry_id = entry.id
            and child.user_id = auth.uid()
        )
    )::integer as connected_reflection_count,
    count(entry.id) filter (where entry.revisit_count > 0)::integer as revisited_count
  from public.entry_drawers as entry_drawer
  join public.entries as entry
    on entry.id = entry_drawer.entry_id
   and entry.user_id = auth.uid()
  where entry_drawer.drawer_id = p_drawer_id
    and entry_drawer.user_id = auth.uid();
$$;

create or replace function public.get_drawer_filtered_entry_ids(
  p_drawer_id uuid,
  p_filter text default 'all',
  p_sort text default 'newest',
  p_tag_id uuid default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (entry_id uuid, total_count bigint)
language sql
security invoker
set search_path = public
as $$
  select entry.id, count(*) over() as total_count
  from public.entries as entry
  join public.entry_drawers as entry_drawer
    on entry_drawer.entry_id = entry.id
   and entry_drawer.user_id = auth.uid()
  where entry_drawer.drawer_id = p_drawer_id
    and entry.user_id = auth.uid()
    and (
      p_tag_id is null
      or exists (
        select 1 from public.entry_tags as entry_tag
        where entry_tag.entry_id = entry.id
          and entry_tag.tag_id = p_tag_id
          and entry_tag.user_id = auth.uid()
      )
    )
    and (
      p_filter = 'all'
      or (p_filter = 'saved_for_later' and entry.saved_for_later)
      or (
        p_filter = 'connected_reflections'
        and (
          entry.parent_entry_id is not null
          or exists (
            select 1 from public.entries as child
            where child.parent_entry_id = entry.id
              and child.user_id = auth.uid()
          )
        )
      )
      or (p_filter = 'revisited' and entry.revisit_count > 0)
      or (
        p_filter = 'not_revisited'
        and entry.revisit_count = 0
        and entry.created_at <= now() - interval '30 days'
      )
    )
  order by
    case when p_sort = 'oldest' then entry.created_at end asc,
    case when p_sort = 'newest' then entry.created_at end desc,
    case when p_sort = 'least_recently_viewed' then coalesce(entry.last_viewed_at, 'epoch'::timestamptz) end asc,
    case when p_sort = 'most_recently_revisited' then entry.last_viewed_at end desc,
    entry.created_at desc
  limit greatest(1, least(p_limit, 50))
  offset greatest(p_offset, 0);
$$;

create or replace function public.get_drawer_common_tags(
  p_drawer_id uuid,
  p_limit integer default 5
)
returns table (tag_id uuid, tag_name text, tag_color text, entry_count integer)
language sql
security invoker
set search_path = public
as $$
  select
    tag.id as tag_id,
    tag.name as tag_name,
    tag.color as tag_color,
    count(distinct entry_drawer.entry_id)::integer as entry_count
  from public.entry_drawers as entry_drawer
  join public.entry_tags as entry_tag
    on entry_tag.entry_id = entry_drawer.entry_id
   and entry_tag.user_id = auth.uid()
  join public.tags as tag
    on tag.id = entry_tag.tag_id
   and tag.user_id = auth.uid()
  where entry_drawer.drawer_id = p_drawer_id
    and entry_drawer.user_id = auth.uid()
  group by tag.id, tag.name, tag.color
  order by entry_count desc, tag.name asc
  limit greatest(1, least(p_limit, 50));
$$;

revoke all on function public.get_drawer_filtered_entry_ids(uuid, text, text, uuid, integer, integer) from public;
revoke all on function public.get_drawer_common_tags(uuid, integer) from public;
grant execute on function public.get_drawer_filtered_entry_ids(uuid, text, text, uuid, integer, integer) to authenticated;
grant execute on function public.get_drawer_common_tags(uuid, integer) to authenticated;
