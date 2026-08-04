create or replace function public.accept_workspace_invitation(
  invitation_token text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
  current_user_email text;
  existing_workspace_id uuid;
  invitation_record public.workspace_invitations%rowtype;
begin
  current_user_id := (select auth.uid());

  if current_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  select lower(trim(email))
  into current_user_email
  from auth.users
  where id = current_user_id;

  if current_user_email is null then
    raise exception 'Authenticated user email is unavailable'
      using errcode = '22023';
  end if;

  select *
  into invitation_record
  from public.workspace_invitations
  where token = invitation_token
  for update;

  if not found then
    raise exception 'Invitation does not exist'
      using errcode = 'P0002';
  end if;

  if invitation_record.status <> 'pending' then
    raise exception 'Invitation is no longer pending'
      using errcode = '22023';
  end if;

  if invitation_record.expires_at <= now() then
    raise exception 'Invitation has expired'
      using errcode = '22023';
  end if;

  if lower(invitation_record.email) <> current_user_email then
    raise exception 'Invitation email does not match authenticated user'
      using errcode = '42501';
  end if;

  select workspace_id
  into existing_workspace_id
  from public.workspace_members
  where user_id = current_user_id
  order by joined_at asc
  limit 1;

  if existing_workspace_id is not null
    and existing_workspace_id <> invitation_record.workspace_id
  then
    raise exception 'User already belongs to another workspace'
      using errcode = '23505';
  end if;

  insert into public.workspace_members (
    workspace_id,
    user_id,
    role
  )
  values (
    invitation_record.workspace_id,
    current_user_id,
    'member'
  )
  on conflict (workspace_id, user_id)
  do nothing;

  update public.workspace_invitations
  set
    status = 'accepted',
    accepted_by = current_user_id,
    accepted_at = now()
  where id = invitation_record.id;

  return invitation_record.workspace_id;
end;
$$;

revoke all
on function public.accept_workspace_invitation(text)
from public;

grant execute
on function public.accept_workspace_invitation(text)
to authenticated;
