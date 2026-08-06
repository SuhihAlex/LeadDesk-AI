create or replace function public.remove_workspace_member(
  target_membership_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  current_workspace_id uuid;
  target_user_id uuid;
  target_role public.workspace_role;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'AUTHENTICATION_REQUIRED'
      using errcode = '42501';
  end if;

  select
    owner_membership.workspace_id
  into current_workspace_id
  from public.workspace_members as owner_membership
  where owner_membership.user_id = current_user_id
    and owner_membership.role = 'owner'
  limit 1;

  if current_workspace_id is null then
    raise exception
      'WORKSPACE_OWNER_REQUIRED'
      using errcode = '42501';
  end if;

  select
    membership.user_id,
    membership.role
  into
    target_user_id,
    target_role
  from public.workspace_members as membership
  where membership.id = target_membership_id
    and membership.workspace_id = current_workspace_id
  for update;

  if target_user_id is null then
    raise exception
      'WORKSPACE_MEMBER_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  if target_user_id = current_user_id then
    raise exception
      'OWNER_CANNOT_REMOVE_SELF'
      using errcode = 'P0001';
  end if;

  if target_role = 'owner' then
    raise exception
      'OWNER_CANNOT_BE_REMOVED'
      using errcode = 'P0001';
  end if;

  update public.leads
  set
    assigned_to = null,
    updated_at = now()
  where workspace_id = current_workspace_id
    and assigned_to = target_user_id;

  update public.tasks
  set
    assigned_to = null,
    updated_at = now()
  where workspace_id = current_workspace_id
    and assigned_to = target_user_id;

  delete from public.workspace_members
  where id = target_membership_id
    and workspace_id = current_workspace_id;

  return found;
end;
$$;

revoke all
on function public.remove_workspace_member(uuid)
from public;

revoke all
on function public.remove_workspace_member(uuid)
from anon;

grant execute
on function public.remove_workspace_member(uuid)
to authenticated;


create or replace function public.transfer_workspace_ownership(
  target_membership_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  current_workspace_id uuid;
  current_membership_id uuid;
  target_user_id uuid;
  target_role public.workspace_role;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception
      'AUTHENTICATION_REQUIRED'
      using errcode = '42501';
  end if;

  select
    membership.id,
    membership.workspace_id
  into
    current_membership_id,
    current_workspace_id
  from public.workspace_members as membership
  where membership.user_id = current_user_id
    and membership.role = 'owner'
  limit 1
  for update;

  if current_workspace_id is null then
    raise exception
      'WORKSPACE_OWNER_REQUIRED'
      using errcode = '42501';
  end if;

  select
    membership.user_id,
    membership.role
  into
    target_user_id,
    target_role
  from public.workspace_members as membership
  where membership.id = target_membership_id
    and membership.workspace_id = current_workspace_id
  for update;

  if target_user_id is null then
    raise exception
      'WORKSPACE_MEMBER_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  if target_user_id = current_user_id then
    raise exception
      'TARGET_ALREADY_OWNER'
      using errcode = 'P0001';
  end if;

  if target_role <> 'member' then
    raise exception
      'TARGET_MUST_BE_MEMBER'
      using errcode = 'P0001';
  end if;

  update public.workspace_members
  set role = 'member'
  where id = current_membership_id;

  update public.workspace_members
  set role = 'owner'
  where id = target_membership_id;

  return true;
end;
$$;

revoke all
on function public.transfer_workspace_ownership(uuid)
from public;

revoke all
on function public.transfer_workspace_ownership(uuid)
from anon;

grant execute
on function public.transfer_workspace_ownership(uuid)
to authenticated;

comment on function public.remove_workspace_member(uuid) is
  'Allows the workspace Owner to remove a Member and clear their lead and task assignments.';

comment on function public.transfer_workspace_ownership(uuid) is
  'Atomically transfers the single Owner role to an existing workspace Member.';