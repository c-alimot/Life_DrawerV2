-- Phase 1A: Return data foundation
-- Adds non-destructive Return metadata while preserving current app behavior.

alter table public.profiles
  add column if not exists return_features_enabled boolean not null default true,
  add column if not exists show_return_content_on_home boolean not null default true,
  add column if not exists show_on_this_day boolean not null default true,
  add column if not exists insights_return_content_enabled boolean not null default true,
  add column if not exists return_notification_frequency text not null default 'only_in_app';

alter table public.drawers
  add column if not exists resurfacing_enabled boolean not null default true;

alter table public.entries
  add column if not exists parent_entry_id uuid,
  add column if not exists reflection_type text,
  add column if not exists last_viewed_at timestamptz,
  add column if not exists revisit_count integer not null default 0,
  add column if not exists saved_for_later boolean not null default false,
  add column if not exists resurfacing_enabled boolean not null default true;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_return_notification_frequency_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_return_notification_frequency_check
      check (return_notification_frequency in ('never', 'occasionally', 'weekly', 'only_in_app'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'entries_reflection_type_check'
      and conrelid = 'public.entries'::regclass
  ) then
    alter table public.entries
      add constraint entries_reflection_type_check
      check (reflection_type is null or reflection_type in ('update', 'response', 'continuation'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'entries_revisit_count_nonnegative'
      and conrelid = 'public.entries'::regclass
  ) then
    alter table public.entries
      add constraint entries_revisit_count_nonnegative
      check (revisit_count >= 0);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'entries_parent_entry_not_self'
      and conrelid = 'public.entries'::regclass
  ) then
    alter table public.entries
      add constraint entries_parent_entry_not_self
      check (parent_entry_id is null or parent_entry_id <> id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'entries_id_user_unique'
      and conrelid = 'public.entries'::regclass
  ) then
    alter table public.entries
      add constraint entries_id_user_unique unique (id, user_id);
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'entries_parent_entry_user_fk'
      and conrelid = 'public.entries'::regclass
  ) then
    alter table public.entries
      add constraint entries_parent_entry_user_fk
      foreign key (parent_entry_id, user_id)
      references public.entries (id, user_id)
      on delete set null (parent_entry_id);
  end if;
end;
$$;

create index if not exists entries_parent_entry_id_idx
  on public.entries (parent_entry_id)
  where parent_entry_id is not null;

create index if not exists entries_return_saved_for_later_idx
  on public.entries (user_id, saved_for_later, created_at desc)
  where saved_for_later;

create index if not exists entries_return_last_viewed_at_idx
  on public.entries (user_id, last_viewed_at)
  where resurfacing_enabled;

create index if not exists entries_return_resurfacing_idx
  on public.entries (user_id, resurfacing_enabled, created_at desc);

create index if not exists drawers_return_resurfacing_idx
  on public.drawers (user_id, resurfacing_enabled);
