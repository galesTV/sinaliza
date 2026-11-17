-- Read-only post-deploy verification for migration
-- 20261117152227_profiles_and_lesson_completions.
--
-- Safe to run in the hosted SQL Editor: SELECT-only, touches no data.
-- Every query should return the expected value noted beside it.

-- 1) RLS must be enabled on both tables. Expected: 2 rows, both relrowsecurity = t.
select relname, relrowsecurity, relforcerowsecurity
  from pg_class
 where relnamespace = 'public'::regnamespace
   and relname in ('profiles', 'lesson_completions');

-- 2) Policies: exactly 5 — profiles select/insert/update own,
-- completions select/insert own. No UPDATE/DELETE policy anywhere.
select tablename, policyname, cmd, roles
  from pg_policies
 where schemaname = 'public'
   and tablename in ('profiles', 'lesson_completions')
 order by tablename, policyname;

-- 3) Table privileges. Expected:
--    profiles:            authenticated -> INSERT, SELECT, UPDATE   (no DELETE)
--    lesson_completions:  authenticated -> SELECT only              (no INSERT at table level!)
--    anon:                no rows on either table
select table_name, grantee, privilege_type
  from information_schema.role_table_grants
 where table_schema = 'public'
   and table_name in ('profiles', 'lesson_completions')
   and grantee in ('anon', 'authenticated')
 order by table_name, grantee, privilege_type;

-- 4) Column-level INSERT privileges for authenticated. Expected: exactly
--    user_id + lesson_key. completed_at must NOT appear here (the table-level
--    SELECT grant still lets users read it, which is intended).
select table_name, grantee, column_name, privilege_type
  from information_schema.column_privileges
 where table_schema = 'public'
   and table_name = 'lesson_completions'
   and grantee = 'authenticated'
   and privilege_type = 'INSERT'
 order by column_name;

-- 5) Trigger wiring. Expected: 1 AFTER INSERT trigger on auth.users
--    calling private.handle_new_user.
select tg.tgname, tgrelid::regclass as on_table,
       p.proname as function, p.prosecdef as security_definer
  from pg_trigger tg
  join pg_proc p on p.oid = tg.tgfoid
 where tg.tgname = 'on_auth_user_created';

-- 6) Function lockdown. Expected: search_path = '' in proconfig,
--    no EXECUTE for anon/authenticated/public.
select p.proname, p.proconfig,
       (select count(*)::int
          from information_schema.routine_privileges rp
         where rp.specific_schema = 'private'
           and rp.routine_name = 'handle_new_user'
           and rp.grantee in ('anon', 'authenticated', 'public')) as exposed_grants
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'private' and p.proname = 'handle_new_user';

-- 7) Data API exposure: private must NOT be an exposed schema.
--    Expected: the row shows only 'public' (and 'graphql_public' if enabled).
select nspname
  from pg_namespace
 where nspname in ('public', 'private', 'graphql_public');
