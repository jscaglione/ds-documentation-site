-- Signup was returning Auth 500 "Database error saving new user".
-- Postgres no longer implicitly casts the CASE's text literals to user_role.
-- Grant supabase_auth_admin table access so the auth.users trigger can insert
-- even if SECURITY DEFINER ownership checks change.

grant usage on schema public to supabase_auth_admin;
grant all on table public.profiles to supabase_auth_admin;
grant usage on type public.user_role to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    case
      when (select count(*) from public.profiles) = 0 then 'admin'::public.user_role
      else 'viewer'::public.user_role
    end
  );
  return new;
end;
$$;
