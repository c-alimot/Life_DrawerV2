-- Phase 5B: explainable theme, comparison, revisit, and saved-Entry Insights.
-- These are factual, user-requested summaries and intentionally do not filter on
-- automatic resurfacing preferences. Automated Return remains governed separately.

create index if not exists entry_tags_insights_tag_entry_idx
  on public.entry_tags (user_id, tag_id, entry_id);

create index if not exists entries_insights_recently_viewed_idx
  on public.entries (user_id, last_viewed_at desc)
  where last_viewed_at is not null;

-- A recurring theme has at least three tagged Entries and either spans more than
-- one calendar month or appears in multiple Drawers. Ordering favours time span,
-- then Drawer presence, before applying a stable alphabetical tie-breaker.
create or replace function public.get_insights_recurring_themes(
  p_start_at timestamptz default null,
  p_limit integer default 4
)
returns table (
  tag_id uuid,
  tag_name text,
  tag_color text,
  entry_count integer,
  drawer_count integer,
  first_entry_at timestamptz,
  latest_entry_at timestamptz,
  connected_reflection_count integer,
  drawer_ids uuid[],
  drawer_names text[],
  year_counts text[]
)
language sql
security invoker
set search_path = public
as $$
  with tagged_entries as (
    select tag.id as tag_id, tag.name as tag_name, tag.color as tag_color, entry.id as entry_id,
      entry.created_at, entry.parent_entry_id
    from public.tags as tag
    join public.entry_tags as entry_tag
      on entry_tag.tag_id = tag.id
     and entry_tag.user_id = auth.uid()
    join public.entries as entry
      on entry.id = entry_tag.entry_id
     and entry.user_id = auth.uid()
    where tag.user_id = auth.uid()
      and (p_start_at is null or entry.created_at >= p_start_at)
  ), tag_summaries as (
    select
      tagged_entries.tag_id,
      min(tagged_entries.tag_name) as tag_name,
      min(tagged_entries.tag_color) as tag_color,
      count(*)::integer as entry_count,
      min(tagged_entries.created_at) as first_entry_at,
      max(tagged_entries.created_at) as latest_entry_at,
      count(distinct date_trunc('month', tagged_entries.created_at))::integer as month_count,
      count(*) filter (
        where tagged_entries.parent_entry_id is not null
          or exists (
            select 1 from public.entries as child
            where child.parent_entry_id = tagged_entries.entry_id
              and child.user_id = auth.uid()
          )
      )::integer as connected_reflection_count
    from tagged_entries
    group by tagged_entries.tag_id
  ), tag_drawers as (
    select linked.tag_id,
      array_agg(linked.drawer_id order by linked.drawer_name) as drawer_ids,
      array_agg(linked.drawer_name order by linked.drawer_name) as drawer_names,
      count(*)::integer as drawer_count
    from (
      select distinct tagged_entries.tag_id, drawer.id as drawer_id, drawer.name as drawer_name
      from tagged_entries
      join public.entry_drawers as entry_drawer
        on entry_drawer.entry_id = tagged_entries.entry_id
       and entry_drawer.user_id = auth.uid()
      join public.drawers as drawer
        on drawer.id = entry_drawer.drawer_id
       and drawer.user_id = auth.uid()
    ) as linked
    group by linked.tag_id
  ), tag_years as (
    select yearly.tag_id,
      array_agg(yearly.label || ':' || yearly.entry_count order by yearly.label) as year_counts
    from (
      select tagged_entries.tag_id,
        to_char(tagged_entries.created_at, 'YYYY') as label,
        count(*)::text as entry_count
      from tagged_entries
      group by tagged_entries.tag_id, to_char(tagged_entries.created_at, 'YYYY')
    ) as yearly
    group by yearly.tag_id
  )
  select
    tag_summaries.tag_id,
    tag_summaries.tag_name,
    tag_summaries.tag_color,
    tag_summaries.entry_count,
    coalesce(tag_drawers.drawer_count, 0),
    tag_summaries.first_entry_at,
    tag_summaries.latest_entry_at,
    tag_summaries.connected_reflection_count,
    coalesce(tag_drawers.drawer_ids, array[]::uuid[]),
    coalesce(tag_drawers.drawer_names, array[]::text[]),
    coalesce(tag_years.year_counts, array[]::text[])
  from tag_summaries
  left join tag_drawers on tag_drawers.tag_id = tag_summaries.tag_id
  left join tag_years on tag_years.tag_id = tag_summaries.tag_id
  where tag_summaries.entry_count >= 3
    and (tag_summaries.month_count > 1 or coalesce(tag_drawers.drawer_count, 0) > 1)
  order by
    tag_summaries.month_count desc,
    coalesce(tag_drawers.drawer_count, 0) desc,
    tag_summaries.first_entry_at asc,
    tag_summaries.tag_name asc
  limit greatest(1, least(p_limit, 8));
$$;

create or replace function public.get_insights_reflection_comparisons(
  p_start_at timestamptz default null,
  p_limit integer default 3
)
returns table (
  root_entry_id uuid,
  original_entry_at timestamptz,
  original_preview text,
  latest_entry_id uuid,
  latest_reflection_at timestamptz,
  latest_preview text,
  latest_reflection_type text,
  entry_count integer
)
language sql
security invoker
set search_path = public
as $$
  -- The comparison is original-versus-latest linked Entry. Longer-separated
  -- chains appear first, then recent chains; no emotional or quality ranking is used.
  with recursive chain_entries as (
    select entry.id, entry.id as root_id, entry.created_at, entry.content, entry.reflection_type, array[entry.id] as path
    from public.entries as entry
    where entry.user_id = auth.uid()
      and entry.parent_entry_id is null
    union all
    select child.id, chain_entries.root_id, child.created_at, child.content, child.reflection_type, chain_entries.path || child.id
    from public.entries as child
    join chain_entries on child.parent_entry_id = chain_entries.id
    where child.user_id = auth.uid()
      and not child.id = any(chain_entries.path)
  ), chain_summary as (
    select root_id, min(created_at) as original_entry_at, max(created_at) as latest_reflection_at, count(*)::integer as entry_count
    from chain_entries
    group by root_id
    having count(*) > 1
  ), original_entries as (
    select distinct on (root_id) root_id, id, created_at, content
    from chain_entries
    order by root_id, created_at asc, id asc
  ), latest_entries as (
    select distinct on (root_id) root_id, id, created_at, content, reflection_type
    from chain_entries
    order by root_id, created_at desc, id desc
  )
  select
    chain_summary.root_id,
    chain_summary.original_entry_at,
    left(original_entries.content, 280),
    latest_entries.id,
    latest_entries.created_at,
    left(latest_entries.content, 280),
    latest_entries.reflection_type,
    chain_summary.entry_count
  from chain_summary
  join original_entries on original_entries.root_id = chain_summary.root_id
  join latest_entries on latest_entries.root_id = chain_summary.root_id
  where (p_start_at is null or chain_summary.latest_reflection_at >= p_start_at)
  order by
    case when chain_summary.latest_reflection_at - chain_summary.original_entry_at >= interval '30 days' then 0 else 1 end,
    chain_summary.latest_reflection_at - chain_summary.original_entry_at desc,
    chain_summary.latest_reflection_at desc,
    chain_summary.root_id
  limit greatest(1, least(p_limit, 6));
$$;

create or replace function public.get_insights_recently_returned(
  p_start_at timestamptz default null,
  p_limit integer default 3
)
returns table (
  entry_id uuid,
  title text,
  preview text,
  created_at timestamptz,
  last_viewed_at timestamptz,
  drawer_name text,
  has_connected_reflection boolean
)
language sql
security invoker
set search_path = public
as $$
  select
    entry.id,
    entry.title,
    left(entry.content, 280),
    entry.created_at,
    entry.last_viewed_at,
    drawer.name,
    entry.parent_entry_id is not null or exists (
      select 1 from public.entries as child
      where child.parent_entry_id = entry.id
        and child.user_id = auth.uid()
    )
  from public.entries as entry
  left join lateral (
    select related_drawer.name
    from public.entry_drawers as entry_drawer
    join public.drawers as related_drawer
      on related_drawer.id = entry_drawer.drawer_id
     and related_drawer.user_id = auth.uid()
    where entry_drawer.entry_id = entry.id
      and entry_drawer.user_id = auth.uid()
    order by related_drawer.name asc
    limit 1
  ) as drawer on true
  where entry.user_id = auth.uid()
    and entry.last_viewed_at is not null
    and (p_start_at is null or entry.last_viewed_at >= p_start_at)
  order by entry.last_viewed_at desc, entry.id
  limit greatest(1, least(p_limit, 8));
$$;

create or replace function public.get_insights_saved_for_later_summary(
  p_start_at timestamptz default null
)
returns table (entry_count integer)
language sql
security invoker
set search_path = public
as $$
  select count(*)::integer
  from public.entries as entry
  where entry.user_id = auth.uid()
    and entry.saved_for_later
    and (p_start_at is null or entry.created_at >= p_start_at);
$$;

revoke all on function public.get_insights_recurring_themes(timestamptz, integer) from public;
revoke all on function public.get_insights_reflection_comparisons(timestamptz, integer) from public;
revoke all on function public.get_insights_recently_returned(timestamptz, integer) from public;
revoke all on function public.get_insights_saved_for_later_summary(timestamptz) from public;
grant execute on function public.get_insights_recurring_themes(timestamptz, integer) to authenticated;
grant execute on function public.get_insights_reflection_comparisons(timestamptz, integer) to authenticated;
grant execute on function public.get_insights_recently_returned(timestamptz, integer) to authenticated;
grant execute on function public.get_insights_saved_for_later_summary(timestamptz) to authenticated;
