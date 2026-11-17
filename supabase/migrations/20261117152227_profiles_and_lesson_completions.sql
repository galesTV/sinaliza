-- E.3: initial application schema — public.profiles + public.lesson_completions
-- Ownership model: every row belongs to exactly one auth.users entry; users may
-- only read/write their own rows (personal data, AGENTS.md §12). Anonymous
-- access is denied at both the privilege and the RLS level.

-- ---------------------------------------------------------------------------
-- private schema: internal helpers that must not be exposed over the Data API
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- public.profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check ((select auth.uid()) = id);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No DELETE policy and no DELETE grant: rows are removed only by the
-- auth.users cascade (account deletion), never through the Data API.

revoke all on public.profiles from anon, authenticated;
grant select, insert, update on public.profiles to authenticated;

create extension if not exists moddatetime with schema extensions;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function extensions.moddatetime('updated_at');

-- ---------------------------------------------------------------------------
-- public.lesson_completions (append-only for normal users)
-- ---------------------------------------------------------------------------
create table public.lesson_completions (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Same shape the app validates: "trilha/modulo/licao" (see lessonKey /
  -- parseLessonKey in apps/pwa/src/lib/progress.ts).
  lesson_key text not null
    check (char_length(lesson_key) <= 200 and lesson_key ~ '^[^/]+/[^/]+/[^/]+$'),
  -- Server-generated only: the column grant below excludes it from INSERT, so
  -- clients can never supply a timestamp (XP/streak math must not trust the
  -- client clock — owner adjustment 4).
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_key)  -- idempotent: re-completion is a PK conflict
);

alter table public.lesson_completions enable row level security;

create policy completions_select_own on public.lesson_completions
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy completions_insert_own on public.lesson_completions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- No UPDATE/DELETE policies and no UPDATE/DELETE grants: completions are
-- append-only for authenticated users (owner decision).

revoke all on public.lesson_completions from anon, authenticated;
grant select on public.lesson_completions to authenticated;
-- Column-restricted INSERT: completed_at is never writable by clients.
grant insert (user_id, lesson_key) on public.lesson_completions to authenticated;

-- ---------------------------------------------------------------------------
-- Profile creation trigger (auth.users AFTER INSERT)
-- ---------------------------------------------------------------------------
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  raw_name text;
begin
  -- Normalize user-provided metadata: trim, reject empty/blank, truncate to
  -- the column limit. raw_user_meta_data is caller-controlled — it is used
  -- here only as a display hint, never for authorization.
  raw_name := nullif(btrim(new.raw_user_meta_data ->> 'display_name'), '');
  if raw_name is null then
    raw_name := nullif(btrim(split_part(coalesce(new.email, ''), '@', 1)), '');
  end if;
  if raw_name is null then
    raw_name := 'Estudante';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, left(raw_name, 80))
  on conflict (id) do nothing;
  return new;
end;
$$;

-- The function is invoked only by the trigger machinery — nobody may call it
-- directly, especially not through the Data API.
revoke all on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();
