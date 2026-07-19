-- Hosted projects created before the security rewrite may still have the
-- original profile trigger. Running both profile triggers makes Auth user
-- creation fail with a duplicate profiles.id insert.
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

