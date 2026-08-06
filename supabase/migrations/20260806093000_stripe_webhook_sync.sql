create table public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  workspace_id uuid
    references public.workspaces(id)
    on delete set null,
  processed_at timestamptz not null
    default now()
);

alter table public.stripe_webhook_events
enable row level security;

revoke all
on table public.stripe_webhook_events
from public;

revoke all
on table public.stripe_webhook_events
from anon;

revoke all
on table public.stripe_webhook_events
from authenticated;

revoke all
on table public.stripe_webhook_events
from service_role;

grant select, insert, update, delete
on table public.stripe_webhook_events
to service_role;

create unique index subscriptions_stripe_customer_id_unique
on public.subscriptions (stripe_customer_id)
where stripe_customer_id is not null;

create unique index subscriptions_stripe_subscription_id_unique
on public.subscriptions (stripe_subscription_id)
where stripe_subscription_id is not null;

create or replace function public.process_stripe_subscription_event(
  p_event_id text,
  p_event_type text,
  p_workspace_id uuid,
  p_customer_id text,
  p_subscription_id text,
  p_price_id text,
  p_subscription_plan public.workspace_plan,
  p_workspace_plan public.workspace_plan,
  p_status public.subscription_status,
  p_current_period_end timestamptz
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_event_id text;
begin
  insert into public.stripe_webhook_events (
    event_id,
    event_type,
    workspace_id
  )
  values (
    p_event_id,
    p_event_type,
    p_workspace_id
  )
  on conflict (event_id)
  do nothing
  returning event_id
  into inserted_event_id;

  if inserted_event_id is null then
    return false;
  end if;

  update public.subscriptions
  set
    stripe_customer_id = p_customer_id,
    stripe_subscription_id = p_subscription_id,
    stripe_price_id = p_price_id,
    plan = p_subscription_plan,
    status = p_status,
    current_period_end = p_current_period_end
  where workspace_id = p_workspace_id;

  if not found then
    raise exception
      'Subscription row was not found for workspace %',
      p_workspace_id;
  end if;

  update public.workspaces
  set plan = p_workspace_plan
  where id = p_workspace_id;

  if not found then
    raise exception
      'Workspace was not found: %',
      p_workspace_id;
  end if;

  return true;
end;
$$;

revoke all
on function public.process_stripe_subscription_event(
  text,
  text,
  uuid,
  text,
  text,
  text,
  public.workspace_plan,
  public.workspace_plan,
  public.subscription_status,
  timestamptz
)
from public;

revoke all
on function public.process_stripe_subscription_event(
  text,
  text,
  uuid,
  text,
  text,
  text,
  public.workspace_plan,
  public.workspace_plan,
  public.subscription_status,
  timestamptz
)
from anon;

revoke all
on function public.process_stripe_subscription_event(
  text,
  text,
  uuid,
  text,
  text,
  text,
  public.workspace_plan,
  public.workspace_plan,
  public.subscription_status,
  timestamptz
)
from authenticated;

grant execute
on function public.process_stripe_subscription_event(
  text,
  text,
  uuid,
  text,
  text,
  text,
  public.workspace_plan,
  public.workspace_plan,
  public.subscription_status,
  timestamptz
)
to service_role;

comment on table public.stripe_webhook_events is
  'Stores processed Stripe event IDs for durable webhook idempotency.';

comment on function public.process_stripe_subscription_event(
  text,
  text,
  uuid,
  text,
  text,
  text,
  public.workspace_plan,
  public.workspace_plan,
  public.subscription_status,
  timestamptz
) is
  'Atomically claims a Stripe event and synchronizes subscription and workspace billing state.';
