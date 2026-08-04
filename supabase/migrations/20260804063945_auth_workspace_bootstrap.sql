create or replace function public.ensure_current_user_workspace(
  requested_workspace_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  existing_workspace_id uuid;
  normalized_workspace_name text;
  generated_slug text;
  created_workspace_id uuid;
begin
  current_user_id := (select auth.uid());

  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  select workspace_id
  into existing_workspace_id
  from public.workspace_members
  where user_id = current_user_id
  order by joined_at asc
  limit 1;

  if existing_workspace_id is not null then
    return existing_workspace_id;
  end if;

  normalized_workspace_name := trim(requested_workspace_name);

  if normalized_workspace_name is null
    or char_length(normalized_workspace_name) < 1
    or char_length(normalized_workspace_name) > 120
  then
    raise exception 'Workspace name must contain between 1 and 120 characters'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = current_user_id
  ) then
    raise exception 'User profile does not exist'
      using errcode = '23503';
  end if;

  generated_slug := lower(
    regexp_replace(
      normalized_workspace_name,
      '[^a-zA-Z0-9]+',
      '-',
      'g'
    )
  );

  generated_slug := trim(both '-' from generated_slug);
  generated_slug := left(generated_slug, 60);

  if char_length(generated_slug) < 3 then
    generated_slug := 'workspace';
  end if;

  generated_slug :=
    generated_slug
    || '-'
    || substring(replace(gen_random_uuid()::text, '-', '') from 1 for 8);

  insert into public.workspaces (
    name,
    slug,
    created_by
  )
  values (
    normalized_workspace_name,
    generated_slug,
    current_user_id
  )
  returning id into created_workspace_id;

  insert into public.workspace_members (
    workspace_id,
    user_id,
    role
  )
  values (
    created_workspace_id,
    current_user_id,
    'owner'
  );

  return created_workspace_id;
end;
$$;

revoke all
on function public.ensure_current_user_workspace(text)
from public;

grant execute
on function public.ensure_current_user_workspace(text)
to authenticated;

comment on function public.ensure_current_user_workspace(text) is
  'Returns the authenticated user workspace or atomically creates the first workspace and owner membership.';
