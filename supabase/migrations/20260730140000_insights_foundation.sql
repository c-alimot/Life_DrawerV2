-- Phase 5A: factual, user-scoped Insights summaries.

create index if not exists entries_insights_user_created_idx
  on public.entries (user_id, created_at);

create index if not exists entry_drawers_insights_user_drawer_idx
  on public.entry_drawers (user_id, drawer_id, entry_id);

create or replace function public.get_insights_collection_overview()
returns table (
  entry_count integer,
  drawer_count integer,
  first_entry_at timestamptz,
  latest_entry_at timestamptz,
  saved_for_later_count integer,
  connected_reflection_count integer,
  tag_count integer
)
language sql
security invoker
set search_path = public
as $$
  with entry_summary as (
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
    from public.entries as entry
    where entry.user_id = auth.uid()
  )
  select
    entry_summary.entry_count,
    (select count(*)::integer from public.drawers where user_id = auth.uid()),
    entry_summary.first_entry_at,
    entry_summary.latest_entry_at,
    entry_summary.saved_for_later_count,
    entry_summary.connected_reflection_count,
    (select count(*)::integer from public.tags where user_id = auth.uid())
  from entry_summary;
$$;

create or replace function public.get_insights_reflection_chains(p_limit integer default 3)
returns table (
  root_entry_id uuid,
  original_entry_at timestamptz,
  latest_reflection_at timestamptz,
  entry_count integer,
  title text,
  preview text,
  chain_count integer,
  connected_entry_count integer
)
language sql
security invoker
set search_path = public
as $$
  with recursive chain_entries as (
    select entry.id, entry.id as root_id, entry.created_at, entry.title, entry.content, array[entry.id] as path
    from public.entries as entry
    where entry.user_id = auth.uid()
      and entry.parent_entry_id is null
    union all
    select child.id, chain_entries.root_id, child.created_at, child.title, child.content, chain_entries.path || child.id
    from public.entries as child
    join chain_entries on child.parent_entry_id = chain_entries.id
    where child.user_id = auth.uid()
      and not child.id = any(chain_entries.path)
  ), chain_summary as (
    select
      root_id,
      min(created_at) as original_entry_at,
      max(created_at) as latest_reflection_at,
      count(*)::integer as entry_count,
      (array_agg(title order by created_at asc))[1] as title,
      (array_agg(content order by created_at asc))[1] as preview
    from chain_entries
    group by root_id
    having count(*) > 1
  ), totals as (
    select
      count(*)::integer as chain_count,
      coalesce(sum(entry_count), 0)::integer as connected_entry_count
    from chain_summary
  )
  select
    chain_summary.root_id,
    chain_summary.original_entry_at,
    chain_summary.latest_reflection_at,
    chain_summary.entry_count,
    chain_summary.title,
    left(chain_summary.preview, 280),
    totals.chain_count,
    totals.connected_entry_count
  from chain_summary
  cross join totals
  order by chain_summary.latest_reflection_at desc, chain_summary.root_id
  limit greatest(1, least(p_limit, 10));
$$;

create or replace function public.get_insights_drawer_summaries(p_limit integer default 4)
returns table (
  drawer_id uuid,
  drawer_name text,
  drawer_color text,
  drawer_icon text,
  entry_count integer,
  first_entry_at timestamptz,
  latest_entry_at timestamptz,
  saved_for_later_count integer,
  connected_reflection_count integer,
  common_tags text[]
)
language sql
security invoker
set search_path = public
as $$
  select
    drawer.id,
    drawer.name,
    drawer.color,
    drawer.icon,
    count(entry.id)::integer,
    min(entry.created_at),
    max(entry.created_at),
    count(entry.id) filter (where entry.saved_for_later)::integer,
    count(entry.id) filter (
      where entry.parent_entry_id is not null
        or exists (
          select 1
          from public.entries as child
          where child.parent_entry_id = entry.id
            and child.user_id = auth.uid()
        )
    )::integer,
    coalesce(common_tags.names, array[]::text[])
  from public.drawers as drawer
  left join public.entry_drawers as entry_drawer
    on entry_drawer.drawer_id = drawer.id
   and entry_drawer.user_id = auth.uid()
  left join public.entries as entry
    on entry.id = entry_drawer.entry_id
   and entry.user_id = auth.uid()
  left join lateral (
    select array_agg(tag_counts.name order by tag_counts.entry_count desc, tag_counts.name asc) as names
    from (
      select tag.name, count(distinct entry_tag.entry_id)::integer as entry_count
      from public.entry_tags as entry_tag
      join public.tags as tag
        on tag.id = entry_tag.tag_id
       and tag.user_id = auth.uid()
      join public.entry_drawers as tagged_entry_drawer
        on tagged_entry_drawer.entry_id = entry_tag.entry_id
       and tagged_entry_drawer.drawer_id = drawer.id
       and tagged_entry_drawer.user_id = auth.uid()
      where entry_tag.user_id = auth.uid()
      group by tag.id, tag.name
      order by entry_count desc, tag.name asc
      limit 2
    ) as tag_counts
  ) as common_tags on true
  where drawer.user_id = auth.uid()
  group by drawer.id, drawer.name, drawer.color, drawer.icon, drawer.created_at, common_tags.names
  order by drawer.created_at asc, drawer.id
  limit greatest(1, least(p_limit, 12));
$$;

revoke all on function public.get_insights_collection_overview() from public;
revoke all on function public.get_insights_reflection_chains(integer) from public;
revoke all on function public.get_insights_drawer_summaries(integer) from public;
grant execute on function public.get_insights_collection_overview() to authenticated;
grant execute on function public.get_insights_reflection_chains(integer) to authenticated;
grant execute on function public.get_insights_drawer_summaries(integer) to authenticated;
