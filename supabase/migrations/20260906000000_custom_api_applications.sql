-- Admins can register extra API applications (name + write-only secret)
-- alongside the built-in figma / anthropic / openai rows.

alter table public.service_credentials
  add column if not exists label       text not null default '',
  add column if not exists description text not null default '',
  add column if not exists docs_url    text not null default '';

update public.service_credentials set label = 'Figma'            where service = 'figma'     and label = '';
update public.service_credentials set label = 'Anthropic Claude' where service = 'anthropic' and label = '';
update public.service_credentials set label = 'OpenAI'           where service = 'openai'    and label = '';

-- New metadata columns are not covered by the original column-level GRANT.
grant select (label, description, docs_url)
  on public.service_credentials to authenticated;
grant insert (service, secret, last4, label, description, docs_url)
  on public.service_credentials to authenticated;
grant update (label, description, docs_url)
  on public.service_credentials to authenticated;
grant delete on public.service_credentials to authenticated;

create policy "admins insert credentials" on public.service_credentials
  for insert to authenticated
  with check (public.is_admin());

create policy "admins delete credentials" on public.service_credentials
  for delete to authenticated
  using (
    public.is_admin()
    and service not in ('figma', 'anthropic', 'openai')
  );

drop trigger if exists service_credentials_touch on public.service_credentials;
create trigger service_credentials_touch
  before insert or update on public.service_credentials
  for each row execute function public.touch_updated_at();

create or replace function public.protect_builtin_credentials()
returns trigger
language plpgsql
as $$
begin
  if old.service in ('figma', 'anthropic', 'openai') then
    raise exception 'Cannot delete built-in service credential: %', old.service;
  end if;
  return old;
end;
$$;

create trigger service_credentials_protect_builtin
  before delete on public.service_credentials
  for each row execute function public.protect_builtin_credentials();
