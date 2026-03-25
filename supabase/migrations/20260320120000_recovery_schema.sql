-- Life Drawer recovery migration
-- Aligns the schema used by the active Expo app with the current app contract.

create extension if not exists "pgcrypto";

alter table public.profiles
  add column if not exists avatar_url text;

alter table public.drawers
  add column if not exists color text,
  add column if not exists icon text;

alter table public.tags
  add column if not exists color text;

alter table public.entries
  add column if not exists mood text,
  add column if not exists images jsonb not null default '[]'::jsonb,
  add column if not exists audio_url text,
  add column if not exists location jsonb,
  add column if not exists occurred_at timestamptz,
  add column if not exists life_phase_id uuid references public.life_phases(id) on delete set null;

update public.drawers
set color = '#7C9E7F'
where color is null;

update public.tags
set color = '#7C9E7F'
where color is null;

insert into storage.buckets (id, name, public)
select 'entry-media', 'entry-media', true
where not exists (
  select 1 from storage.buckets where id = 'entry-media'
);

create policy "entry_media_select_own_or_public"
  on storage.objects for select
  using (bucket_id = 'entry-media');

create policy "entry_media_insert_own"
  on storage.objects for insert
  with check (
    bucket_id = 'entry-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "entry_media_update_own"
  on storage.objects for update
  using (
    bucket_id = 'entry-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'entry-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "entry_media_delete_own"
  on storage.objects for delete
  using (
    bucket_id = 'entry-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
