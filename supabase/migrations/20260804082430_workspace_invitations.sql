create type public.workspace_invitation_status as enum (
  'pending',
  'accepted',
  'revoked',
  'expired'
);

create table public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  email text not null,

  role public.workspace_role not null default 'member',

  token text not null unique
    default encode(extensions.gen_random_bytes(24), 'hex'),

  invited_by uuid not null
    references public.profiles(id) on delete restrict,

  accepted_by uuid
    references public.profiles(id) on delete set null,

  status public.workspace_invitation_status not null default 'pending',

  expires_at timestamptz not null default (now() + interval '7 days'),

  accepted_at timestamptz,
  revoked_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workspace_invitations_email_length
    check (
      char_length(email) between 3 and 254
    ),

  constraint workspace_invitations_email_normalized
    check (
      email = lower(trim(email))
    ),

  constraint workspace_invitations_token_length
    check (
      char_length(token) >= 32
    ),

  constraint workspace_invitations_member_role_only
    check (
      role = 'member'
    ),

  constraint workspace_invitations_expiration_after_creation
    check (
      expires_at > created_at
    ),

  constraint workspace_invitations_accepted_state
    check (
      (
        status = 'accepted'
        and accepted_by is not null
        and accepted_at is not null
      )
      or
      (
        status <> 'accepted'
        and accepted_by is null
        and accepted_at is null
      )
    ),

  constraint workspace_invitations_revoked_state
    check (
      (
        status = 'revoked'
        and revoked_at is not null
      )
      or
      (
        status <> 'revoked'
        and revoked_at is null
      )
    )
);

create index workspace_invitations_workspace_id_idx
  on public.workspace_invitations(workspace_id);

create index workspace_invitations_email_idx
  on public.workspace_invitations(email);

create index workspace_invitations_token_idx
  on public.workspace_invitations(token);

create index workspace_invitations_expires_at_idx
  on public.workspace_invitations(expires_at)
  where status = 'pending';

create unique index workspace_invitations_pending_email_unique
  on public.workspace_invitations(
    workspace_id,
    lower(email)
  )
  where status = 'pending';

create trigger workspace_invitations_set_updated_at
before update on public.workspace_invitations
for each row
execute function public.set_updated_at();

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
    update public.workspace_invitations
    set status = 'expired'
    where id = invitation_record.id;

    raise exception 'Invitation has expired'
      using errcode = '22023';
  end if;

  if lower(invitation_record.email) <> current_user_email then
    raise exception 'Invitation email does not match authenticated user'
      using errcode = '42501';
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
  do update set
    role = excluded.role;

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

comment on function public.accept_workspace_invitation(text) is
  'Accepts a pending workspace invitation when its email matches the authenticated user.';

alter table public.workspace_invitations
enable row level security;

create policy "workspace_invitations_select_owners"
on public.workspace_invitations
for select
to authenticated
using (
  public.is_workspace_owner(workspace_id)
);

create policy "workspace_invitations_insert_owners"
on public.workspace_invitations
for insert
to authenticated
with check (
  public.is_workspace_owner(workspace_id)
  and invited_by = (select auth.uid())
  and role = 'member'
);

create policy "workspace_invitations_update_owners"
on public.workspace_invitations
for update
to authenticated
using (
  public.is_workspace_owner(workspace_id)
)
with check (
  public.is_workspace_owner(workspace_id)
);

create policy "workspace_invitations_delete_owners"
on public.workspace_invitations
for delete
to authenticated
using (
  public.is_workspace_owner(workspace_id)
);

revoke all
on table public.workspace_invitations
from anon;

grant select, insert, update, delete
on table public.workspace_invitations
to authenticated;
