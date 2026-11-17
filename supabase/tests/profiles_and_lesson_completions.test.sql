-- pgTAP suite for migration 20261117152227_profiles_and_lesson_completions.
-- Run: npx supabase test db   (local stack only — the suite runs inside a
-- transaction that is rolled back at the end; no hosted data is touched).
--
-- This environment does not ship the `supabase_test_helpers` extension, so
-- fixtures insert auth.users rows directly (trigger fires normally) and
-- authenticated calls are simulated with the same GUCs PostgREST sets:
-- `role` + `request.jwt.claim.sub`, which is what auth.uid() reads.

begin;

select plan(28);

create or replace function pg_temp.as_user(uid uuid)
returns void language sql as $$
  select set_config('role', 'authenticated', true),
         set_config('request.jwt.claim.sub', uid::text, true),
         set_config(
           'request.jwt.claims',
           jsonb_build_object('sub', uid::text, 'role', 'authenticated')::text,
           true
         )
$$;

create or replace function pg_temp.new_user(uid uuid, email text, meta jsonb)
returns void language sql as $$
  insert into auth.users (
    id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_user_meta_data, created_at, updated_at
  ) values (
    uid, 'authenticated', 'authenticated', email, 'not-a-real-password',
    now(), meta, now(), now()
  )
$$;

-- ---------------------------------------------------------------------------
-- Fixtures + trigger behavior (still running as the test role)
-- ---------------------------------------------------------------------------
select pg_temp.new_user('11111111-1111-1111-1111-111111111111', 'alice@example.com', '{}'::jsonb);
select pg_temp.new_user('22222222-2222-2222-2222-222222222222', 'bob@example.com', '{"display_name":"  Bob Silva  "}'::jsonb);
select pg_temp.new_user('33333333-3333-3333-3333-333333333333', 'carol@example.com', '{"display_name":"   "}'::jsonb);
select pg_temp.new_user('44444444-4444-4444-4444-444444444444', 'dave@example.com', jsonb_build_object('display_name', repeat('x', 120)));

select is(
  (select count(*)::int from public.profiles
    where id in ('11111111-1111-1111-1111-111111111111',
                 '22222222-2222-2222-2222-222222222222',
                 '33333333-3333-3333-3333-333333333333',
                 '44444444-4444-4444-4444-444444444444')),
  4,
  'trigger creates a profile row for every new auth user'
);

select is(
  (select display_name from public.profiles
    where id = '22222222-2222-2222-2222-222222222222'),
  'Bob Silva',
  'display_name from metadata is trimmed'
);

select is(
  (select display_name from public.profiles
    where id = '33333333-3333-3333-3333-333333333333'),
  'carol',
  'blank/whitespace-only display_name falls back to the email prefix'
);

select is(
  (select display_name from public.profiles
    where id = '11111111-1111-1111-1111-111111111111'),
  'alice',
  'missing display_name falls back to the email prefix'
);

select is(
  (select char_length(display_name)::int from public.profiles
    where id = '44444444-4444-4444-4444-444444444444'),
  80,
  'oversized display_name is truncated to the column limit'
);

-- ---------------------------------------------------------------------------
-- Authenticated owner flows (as alice)
-- ---------------------------------------------------------------------------
select pg_temp.as_user('11111111-1111-1111-1111-111111111111');

select is(
  (select count(*)::int from public.profiles),
  1,
  'alice sees only her own profile (cross-user SELECT isolation)'
);

select lives_ok(
  $$ insert into public.lesson_completions (user_id, lesson_key)
     values ('11111111-1111-1111-1111-111111111111', 'alfabeto/modulo-1/licao-1') $$,
  'owner can insert her own completion'
);

select ok(
  (select completed_at > now() - interval '1 minute'
     from public.lesson_completions
    where user_id = '11111111-1111-1111-1111-111111111111'),
  'completed_at is generated server-side'
);

select is(
  (select count(*)::int from public.lesson_completions
    where user_id = '11111111-1111-1111-1111-111111111111'),
  1,
  'owner can read her own completions'
);

select throws_ok(
  $$ insert into public.lesson_completions (user_id, lesson_key)
     values ('11111111-1111-1111-1111-111111111111', 'alfabeto/modulo-1/licao-1') $$,
  '23505', null,
  'duplicate completion hits the composite PK'
);

select lives_ok(
  $$ insert into public.lesson_completions (user_id, lesson_key)
     values ('11111111-1111-1111-1111-111111111111', 'alfabeto/modulo-1/licao-1')
     on conflict (user_id, lesson_key) do nothing $$,
  'upsert on the composite PK is the idempotent client strategy'
);

select is(
  (select count(*)::int from public.lesson_completions
    where user_id = '11111111-1111-1111-1111-111111111111'),
  1,
  'idempotent re-completion keeps exactly one row'
);

select throws_ok(
  $$ insert into public.lesson_completions (user_id, lesson_key)
     values ('22222222-2222-2222-2222-222222222222', 'alfabeto/modulo-1/licao-2') $$,
  '42501', null,
  'alice cannot insert a completion owned by bob (RLS with_check)'
);

select throws_ok(
  $$ insert into public.lesson_completions (user_id, lesson_key, completed_at)
     values ('11111111-1111-1111-1111-111111111111',
             'alfabeto/modulo-1/licao-3', '2000-01-01'::timestamptz) $$,
  '42501', null,
  'client cannot set completed_at (column-restricted INSERT grant)'
);

select throws_ok(
  $$ insert into public.lesson_completions (user_id, lesson_key)
     values ('11111111-1111-1111-1111-111111111111', 'only/two') $$,
  '23514', null,
  'lesson_key with two segments is rejected'
);

select throws_ok(
  $$ insert into public.lesson_completions (user_id, lesson_key)
     values ('11111111-1111-1111-1111-111111111111', 'a//b') $$,
  '23514', null,
  'lesson_key with an empty segment is rejected'
);

select throws_ok(
  $$ update public.lesson_completions
        set completed_at = now()
      where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null,
  'UPDATE on lesson_completions is denied (append-only)'
);

select throws_ok(
  $$ delete from public.lesson_completions
      where user_id = '11111111-1111-1111-1111-111111111111' $$,
  '42501', null,
  'DELETE on lesson_completions is denied (append-only)'
);

-- Cross-user UPDATE on profiles: RLS silently filters non-owned rows.
update public.profiles
   set display_name = 'hijacked'
 where id = '22222222-2222-2222-2222-222222222222';

select is(
  (select count(*)::int from public.lesson_completions
    where user_id = '22222222-2222-2222-2222-222222222222'),
  0,
  'alice sees none of bob''s completions'
);

-- ---------------------------------------------------------------------------
-- Cross-user read isolation (as bob)
-- ---------------------------------------------------------------------------
select pg_temp.as_user('22222222-2222-2222-2222-222222222222');

select is(
  (select count(*)::int from public.lesson_completions),
  0,
  'bob cannot read alice''s completions'
);

select is(
  (select count(*)::int from public.profiles),
  1,
  'bob sees only his own profile'
);

-- ---------------------------------------------------------------------------
-- Anonymous access denied at privilege level
-- ---------------------------------------------------------------------------
select set_config('role', 'anon', true);
select set_config('request.jwt.claim.sub', '', true);
select set_config('request.jwt.claims', '', true);

select throws_ok($$ select * from public.profiles $$, '42501', null,
  'anon cannot SELECT profiles');
select throws_ok($$ select * from public.lesson_completions $$, '42501', null,
  'anon cannot SELECT lesson_completions');
select throws_ok(
  $$ insert into public.lesson_completions (user_id, lesson_key)
     values ('11111111-1111-1111-1111-111111111111', 'a/b/c') $$,
  '42501', null,
  'anon cannot INSERT lesson_completions');

select set_config('role', 'postgres', true);

-- ---------------------------------------------------------------------------
-- Effective privileges (grants, not just policies)
-- ---------------------------------------------------------------------------
select is(
  (select count(*)::int from information_schema.role_table_grants
    where table_schema = 'public' and table_name = 'profiles'
      and grantee = 'anon'),
  0,
  'anon holds no table privileges on profiles'
);

select is(
  (select string_agg(privilege_type, ',' order by privilege_type)
     from information_schema.role_table_grants
    where table_schema = 'public' and table_name = 'lesson_completions'
      and grantee = 'authenticated'),
  'SELECT',
  'authenticated holds only table-level SELECT on lesson_completions'
);

select is(
  (select string_agg(col, ',' order by col) from (
     select column_name::text collate "C" as col
       from information_schema.column_privileges
      where table_schema = 'public' and table_name = 'lesson_completions'
        and grantee = 'authenticated' and privilege_type = 'INSERT') t),
  'lesson_key,user_id',
  'INSERT privilege on lesson_completions covers exactly user_id + lesson_key'
);

-- The earlier UPDATE as alice must not have touched bob's profile.
select is(
  (select display_name from public.profiles
    where id = '22222222-2222-2222-2222-222222222222'),
  'Bob Silva',
  'cross-user UPDATE on profiles changed nothing'
);

select * from finish();
rollback;
