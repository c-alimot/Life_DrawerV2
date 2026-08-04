-- Life Drawer V3 Phase 1B: additive Entry Status foundation.
-- Legacy Mood values deliberately remain untouched and do not populate Status.

alter table public.entries
  add column if not exists current_status text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'entries_current_status_check'
      and conrelid = 'public.entries'::regclass
  ) then
    alter table public.entries
      add constraint entries_current_status_check
      check (
        current_status is null
        or current_status in (
          'in_the_moment',
          'still_unfolding',
          'something_changed',
          'settled',
          'looking_back'
        )
      );
  end if;
end;
$$;

create table if not exists public.entry_status_history (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null,
  user_id uuid not null,
  status text not null,
  note text,
  connected_reflection_entry_id uuid,
  source text not null default 'update',
  created_at timestamptz not null default now(),
  constraint entry_status_history_status_check check (
    status in (
      'in_the_moment',
      'still_unfolding',
      'something_changed',
      'settled',
      'looking_back'
    )
  ),
  constraint entry_status_history_source_check check (source in ('initial', 'update')),
  constraint entry_status_history_user_id_fkey
    foreign key (user_id)
    references public.profiles (id)
    on delete cascade,
  constraint entry_status_history_entry_user_fk
    foreign key (entry_id, user_id)
    references public.entries (id, user_id)
    on delete cascade,
  constraint entry_status_history_reflection_user_fk
    foreign key (connected_reflection_entry_id, user_id)
    references public.entries (id, user_id)
    on delete set null (connected_reflection_entry_id)
);

create index if not exists entries_current_status_idx
  on public.entries (user_id, current_status, created_at desc)
  where current_status is not null;

create index if not exists entry_status_history_entry_created_idx
  on public.entry_status_history (user_id, entry_id, created_at asc, id asc);

create index if not exists entry_status_history_user_created_idx
  on public.entry_status_history (user_id, created_at desc);

alter table public.entry_status_history enable row level security;

drop policy if exists "entry_status_history_select_own" on public.entry_status_history;
create policy "entry_status_history_select_own"
  on public.entry_status_history for select
  using (user_id = auth.uid());

create or replace function public.set_initial_entry_status(
  p_entry_id uuid,
  p_status text
)
returns table (
  event_id uuid,
  entry_id uuid,
  user_id uuid,
  status text,
  note text,
  connected_reflection_entry_id uuid,
  source text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_entry public.entries%rowtype;
  existing_event public.entry_status_history%rowtype;
  created_event public.entry_status_history%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if p_status not in ('in_the_moment', 'still_unfolding', 'something_changed', 'settled', 'looking_back') then
    raise exception 'Unsupported entry status';
  end if;

  select * into target_entry
  from public.entries
  where id = p_entry_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Entry not found';
  end if;

  select * into existing_event
  from public.entry_status_history
  where entry_id = p_entry_id and user_id = auth.uid()
  order by created_at desc, id desc
  limit 1;

  if found or target_entry.current_status is not null then
    if found
      and existing_event.source = 'initial'
      and existing_event.status = p_status
      and target_entry.current_status = p_status then
      return query
      select existing_event.id, existing_event.entry_id, existing_event.user_id,
        existing_event.status, existing_event.note,
        existing_event.connected_reflection_entry_id, existing_event.source,
        existing_event.created_at;
      return;
    end if;

    raise exception 'An initial Status already exists for this Entry';
  end if;

  insert into public.entry_status_history (entry_id, user_id, status, source)
  values (p_entry_id, auth.uid(), p_status, 'initial')
  returning * into created_event;

  update public.entries
  set current_status = p_status
  where id = p_entry_id and user_id = auth.uid();

  return query
  select created_event.id, created_event.entry_id, created_event.user_id,
    created_event.status, created_event.note,
    created_event.connected_reflection_entry_id, created_event.source,
    created_event.created_at;
end;
$$;

create or replace function public.update_entry_status(
  p_entry_id uuid,
  p_status text,
  p_note text default null,
  p_connected_reflection_entry_id uuid default null
)
returns table (
  event_id uuid,
  entry_id uuid,
  user_id uuid,
  status text,
  note text,
  connected_reflection_entry_id uuid,
  source text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_entry public.entries%rowtype;
  latest_event public.entry_status_history%rowtype;
  created_event public.entry_status_history%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if p_status not in ('in_the_moment', 'still_unfolding', 'something_changed', 'settled', 'looking_back') then
    raise exception 'Unsupported entry status';
  end if;

  select * into target_entry
  from public.entries
  where id = p_entry_id and user_id = auth.uid()
  for update;

  if not found then
    raise exception 'Entry not found';
  end if;

  if p_connected_reflection_entry_id is not null and not exists (
    select 1
    from public.entries as reflection
    where reflection.id = p_connected_reflection_entry_id
      and reflection.user_id = auth.uid()
      and reflection.parent_entry_id = p_entry_id
  ) then
    raise exception 'Connected reflection must be an Entry reflection owned by the same user';
  end if;

  select * into latest_event
  from public.entry_status_history
  where entry_id = p_entry_id and user_id = auth.uid()
  order by created_at desc, id desc
  limit 1;

  if found
    and latest_event.status = p_status
    and latest_event.note is not distinct from p_note
    and latest_event.connected_reflection_entry_id is not distinct from p_connected_reflection_entry_id then
    update public.entries
    set current_status = p_status
    where id = p_entry_id and user_id = auth.uid();

    return query
    select latest_event.id, latest_event.entry_id, latest_event.user_id,
      latest_event.status, latest_event.note,
      latest_event.connected_reflection_entry_id, latest_event.source,
      latest_event.created_at;
    return;
  end if;

  insert into public.entry_status_history (
    entry_id,
    user_id,
    status,
    note,
    connected_reflection_entry_id,
    source
  )
  values (
    p_entry_id,
    auth.uid(),
    p_status,
    nullif(btrim(p_note), ''),
    p_connected_reflection_entry_id,
    'update'
  )
  returning * into created_event;

  update public.entries
  set current_status = p_status
  where id = p_entry_id and user_id = auth.uid();

  return query
  select created_event.id, created_event.entry_id, created_event.user_id,
    created_event.status, created_event.note,
    created_event.connected_reflection_entry_id, created_event.source,
    created_event.created_at;
end;
$$;

revoke all on function public.set_initial_entry_status(uuid, text) from public;
revoke all on function public.update_entry_status(uuid, text, text, uuid) from public;
grant execute on function public.set_initial_entry_status(uuid, text) to authenticated;
grant execute on function public.update_entry_status(uuid, text, text, uuid) to authenticated;
