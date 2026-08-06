create type public.workspace_plan as enum (
  'free',
  'pro',
  'agency'
);

create type public.subscription_status as enum (
  'inactive',
  'trialing',
  'active',
  'past_due',
  'canceled'
);

alter table public.workspaces
add column plan public.workspace_plan
not null
default 'free';

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_price_id text,

  plan public.workspace_plan not null
    default 'free',

  status public.subscription_status not null
    default 'inactive',

  current_period_end timestamptz,

  created_at timestamptz not null
    default now(),

  updated_at timestamptz not null
    default now(),

  constraint subscriptions_workspace_id_unique
    unique (workspace_id)
);

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

insert into public.subscriptions (
  workspace_id,
  plan,
  status
)
select
  id,
  plan,
  'inactive'
from public.workspaces
on conflict (workspace_id)
do nothing;

create or replace function public.create_default_workspace_subscription()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.subscriptions (
    workspace_id,
    plan,
    status
  )
  values (
    new.id,
    new.plan,
    'inactive'
  )
  on conflict (workspace_id)
  do nothing;

  return new;
end;
$$;

create trigger workspaces_create_default_subscription
after insert on public.workspaces
for each row
execute function public.create_default_workspace_subscription();

revoke all
on function public.create_default_workspace_subscription()
from public;

create or replace function public.guard_workspace_plan()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  request_role text;
begin
  request_role := coalesce(
    (select auth.role()),
    ''
  );

  if tg_op = 'INSERT' then
    if new.plan <> 'free'
      and request_role <> 'service_role'
    then
      raise exception
        'New workspaces must start on the Free plan'
        using errcode = '42501';
    end if;

    return new;
  end if;

  if new.plan is distinct from old.plan
    and request_role <> 'service_role'
  then
    raise exception
      'Workspace plan can only be changed by the billing service'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger workspaces_guard_plan_on_insert
before insert on public.workspaces
for each row
execute function public.guard_workspace_plan();

create trigger workspaces_guard_plan_on_update
before update of plan on public.workspaces
for each row
execute function public.guard_workspace_plan();

revoke all
on function public.guard_workspace_plan()
from public;

alter table public.subscriptions
enable row level security;

create policy "subscriptions_select_owners"
on public.subscriptions
for select
to authenticated
using (
  public.is_workspace_owner(workspace_id)
);

revoke all
on table public.subscriptions
from public;

revoke all
on table public.subscriptions
from anon;

revoke all
on table public.subscriptions
from authenticated;

revoke all
on table public.subscriptions
from service_role;

grant select, insert, update, delete
on table public.subscriptions
to service_role;

comment on table public.subscriptions is
  'Stores the Stripe test subscription state for one workspace.';

comment on function public.create_default_workspace_subscription() is
  'Creates the default Free inactive subscription for every new workspace.';

comment on function public.guard_workspace_plan() is
  'Prevents clients from selecting or changing a paid workspace plan directly.';