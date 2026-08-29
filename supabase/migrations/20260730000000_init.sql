-- ─── DS Docs — initial schema ────────────────────────────────────────────────
-- Backs three things that previously lived in localStorage:
--   1. profiles            — who can read / edit / administer  (was DEFAULT_USERS)
--   2. doc_state           — the edit-mode CMS payload         (was ds-docs-*)
--   3. service_credentials — Figma / Anthropic / OpenAI keys   (was ds-docs-*-key)
--
-- service_credentials.secret is never readable by the browser: SELECT is granted
-- per-column and deliberately excludes it. Only the Edge Functions, which use the
-- service-role key, can read the secret.

-- ─── Roles ───────────────────────────────────────────────────────────────────

create type public.user_role as enum ('admin', 'editor', 'viewer');

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  name       text not null default '',
  role       public.user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- SECURITY DEFINER so that policies on `profiles` can call it without recursing
-- into their own RLS check.
create or replace function public.auth_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select public.auth_role() = 'admin'
$$;

create or replace function public.can_edit()
returns boolean
language sql
stable
as $$
  select public.auth_role() in ('admin', 'editor')
$$;

create policy "read own profile or any as admin" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "admins insert profiles" on public.profiles
  for insert to authenticated
  with check (public.is_admin());

create policy "admins update profiles" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins may not delete themselves — avoids locking the last admin out.
create policy "admins delete other profiles" on public.profiles
  for delete to authenticated
  using (public.is_admin() and id <> auth.uid());

-- Mirror every auth.users signup into profiles. The very first account becomes
-- the admin so there is a way to bootstrap; everyone after starts as a viewer.
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
    case when (select count(*) from public.profiles) = 0 then 'admin' else 'viewer' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── Edit-mode content ───────────────────────────────────────────────────────
-- One row, mirroring the five ds-docs-* localStorage keys. Kept as a single row
-- so that saveEdits() stays one atomic write and discardEdits() one read.

create table public.doc_state (
  id           text primary key default 'global',
  edits        jsonb not null default '{}'::jsonb,
  hidden_toc   jsonb not null default '[]'::jsonb,
  hidden_nav   jsonb not null default '[]'::jsonb,
  added_nav    jsonb not null default '[]'::jsonb,
  figma_blocks jsonb not null default '[]'::jsonb,
  updated_at   timestamptz not null default now(),
  updated_by   uuid references auth.users (id) on delete set null
);

insert into public.doc_state (id) values ('global');

alter table public.doc_state enable row level security;

-- Docs are public: anonymous readers need the saved copy to render the site.
create policy "anyone reads doc state" on public.doc_state
  for select to anon, authenticated
  using (true);

create policy "editors write doc state" on public.doc_state
  for update to authenticated
  using (public.can_edit())
  with check (public.can_edit());

-- The single row is seeded above; clients only ever UPDATE it.
revoke insert, delete on public.doc_state from anon, authenticated;

-- ─── Third-party service credentials ─────────────────────────────────────────

create table public.service_credentials (
  service    text primary key,
  secret     text not null default '',
  last4      text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  configured boolean generated always as (secret <> '') stored
);

insert into public.service_credentials (service) values ('figma'), ('anthropic'), ('openai');

alter table public.service_credentials enable row level security;

-- Drop the blanket grants Supabase applies to new public tables, then hand back
-- only the non-secret columns. `secret` is now unreadable over PostgREST no
-- matter what the RLS policies say.
revoke all on public.service_credentials from anon, authenticated;
grant select (service, last4, updated_at, updated_by, configured)
  on public.service_credentials to authenticated;
grant update (secret, last4) on public.service_credentials to authenticated;

create policy "admins read credential status" on public.service_credentials
  for select to authenticated
  using (public.is_admin());

create policy "admins write credentials" on public.service_credentials
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ─── Housekeeping ────────────────────────────────────────────────────────────

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger doc_state_touch
  before update on public.doc_state
  for each row execute function public.touch_updated_at();

create trigger service_credentials_touch
  before update on public.service_credentials
  for each row execute function public.touch_updated_at();
