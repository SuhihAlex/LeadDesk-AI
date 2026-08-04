create extension if not exists pgcrypto;

create type public.workspace_role as enum (
  'owner',
  'member'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_full_name_length
    check (char_length(full_name) <= 120),

  constraint profiles_avatar_url_length
    check (avatar_url is null or char_length(avatar_url) <= 2048)
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  public_form_token text not null unique
    default encode(extensions.gen_random_bytes(24), 'hex'),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workspaces_name_length
    check (char_length(name) between 1 and 120),

  constraint workspaces_slug_format
    check (
      slug = lower(slug)
      and slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
      and char_length(slug) between 3 and 80
    ),

  constraint workspaces_logo_url_length
    check (logo_url is null or char_length(logo_url) <= 2048),

  constraint workspaces_public_form_token_length
    check (char_length(public_form_token) >= 32)
);

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,
  user_id uuid not null
    references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'member',
  joined_at timestamptz not null default now(),

  constraint workspace_members_workspace_user_unique
    unique (workspace_id, user_id)
);

create index workspace_members_user_id_idx
  on public.workspace_members(user_id);

create index workspace_members_workspace_id_idx
  on public.workspace_members(workspace_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create trigger workspaces_set_updated_at
before update on public.workspaces
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    full_name,
    avatar_url
  )
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1),
      ''
    ),
    nullif(trim(new.raw_user_meta_data ->> 'avatar_url'), '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_workspace_member(
  target_workspace_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
  );
$$;

create or replace function public.is_workspace_owner(
  target_workspace_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

create or replace function public.shares_workspace_with(
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members as current_membership
    inner join public.workspace_members as target_membership
      on target_membership.workspace_id = current_membership.workspace_id
    where current_membership.user_id = (select auth.uid())
      and target_membership.user_id = target_user_id
  );
$$;

create or replace function public.can_bootstrap_workspace_owner(
  target_workspace_id uuid,
  target_user_id uuid,
  target_role public.workspace_role
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspaces
    where id = target_workspace_id
      and created_by = (select auth.uid())
      and target_user_id = (select auth.uid())
      and target_role = 'owner'
      and not exists (
        select 1
        from public.workspace_members
        where workspace_id = target_workspace_id
      )
  );
$$;

revoke all on function public.is_workspace_member(uuid) from public;
revoke all on function public.is_workspace_owner(uuid) from public;
revoke all on function public.shares_workspace_with(uuid) from public;
revoke all on function public.can_bootstrap_workspace_owner(
  uuid,
  uuid,
  public.workspace_role
) from public;

grant execute on function public.is_workspace_member(uuid)
  to authenticated;

grant execute on function public.is_workspace_owner(uuid)
  to authenticated;

grant execute on function public.shares_workspace_with(uuid)
  to authenticated;

grant execute on function public.can_bootstrap_workspace_owner(
  uuid,
  uuid,
  public.workspace_role
) to authenticated;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;

create policy "profiles_select_workspace_members"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.shares_workspace_with(id)
);

create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
)
with check (
  id = (select auth.uid())
);

create policy "workspaces_select_members"
on public.workspaces
for select
to authenticated
using (
  public.is_workspace_member(id)
);

create policy "workspaces_insert_creator"
on public.workspaces
for insert
to authenticated
with check (
  created_by = (select auth.uid())
);

create policy "workspaces_update_owners"
on public.workspaces
for update
to authenticated
using (
  public.is_workspace_owner(id)
)
with check (
  public.is_workspace_owner(id)
);

create policy "workspace_members_select_members"
on public.workspace_members
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

create policy "workspace_members_insert_owner_or_bootstrap"
on public.workspace_members
for insert
to authenticated
with check (
  public.is_workspace_owner(workspace_id)
  or public.can_bootstrap_workspace_owner(
    workspace_id,
    user_id,
    role
  )
);

create policy "workspace_members_update_owners"
on public.workspace_members
for update
to authenticated
using (
  public.is_workspace_owner(workspace_id)
)
with check (
  public.is_workspace_owner(workspace_id)
);

create policy "workspace_members_delete_owners"
on public.workspace_members
for delete
to authenticated
using (
  public.is_workspace_owner(workspace_id)
);

revoke all on table public.profiles from anon;
revoke all on table public.workspaces from anon;
revoke all on table public.workspace_members from anon;

grant select, update
on table public.profiles
to authenticated;

grant select, insert, update
on table public.workspaces
to authenticated;

grant select, insert, update, delete
on table public.workspace_members
to authenticated;

