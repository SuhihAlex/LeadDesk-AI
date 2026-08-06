create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id)
    on delete cascade,

  lead_id uuid
    references public.leads(id)
    on delete set null,

  created_at timestamptz not null
    default now()
);

create index ai_usage_events_workspace_created_at_idx
on public.ai_usage_events (
  workspace_id,
  created_at
);

alter table public.ai_usage_events
enable row level security;

revoke all
on table public.ai_usage_events
from public;

revoke all
on table public.ai_usage_events
from anon;

revoke all
on table public.ai_usage_events
from authenticated;

revoke all
on table public.ai_usage_events
from service_role;

grant select, insert, update, delete
on table public.ai_usage_events
to service_role;

create or replace function public.enforce_free_lead_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_plan public.workspace_plan;
  current_usage bigint;
begin
  select plan
  into workspace_plan
  from public.workspaces
  where id = new.workspace_id
  for update;

  if workspace_plan is null then
    raise exception
      'WORKSPACE_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  if workspace_plan <> 'free' then
    return new;
  end if;

  select count(*)
  into current_usage
  from public.leads
  where workspace_id = new.workspace_id
    and created_at >= date_trunc(
      'month',
      current_timestamp
    )
    and created_at < (
      date_trunc(
        'month',
        current_timestamp
      ) + interval '1 month'
    );

  if current_usage >= 50 then
    raise exception
      'FREE_PLAN_LEAD_LIMIT_REACHED'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger leads_enforce_free_plan_limit
before insert on public.leads
for each row
execute function public.enforce_free_lead_limit();

revoke all
on function public.enforce_free_lead_limit()
from public;

create or replace function public.enforce_free_email_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_plan public.workspace_plan;
  current_usage bigint;
begin
  select plan
  into workspace_plan
  from public.workspaces
  where id = new.workspace_id
  for update;

  if workspace_plan is null then
    raise exception
      'WORKSPACE_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  if workspace_plan <> 'free' then
    return new;
  end if;

  select count(*)
  into current_usage
  from public.lead_email_deliveries
  where workspace_id = new.workspace_id
    and created_at >= date_trunc(
      'month',
      current_timestamp
    )
    and created_at < (
      date_trunc(
        'month',
        current_timestamp
      ) + interval '1 month'
    );

  if current_usage >= 20 then
    raise exception
      'FREE_PLAN_EMAIL_LIMIT_REACHED'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger lead_email_deliveries_enforce_free_plan_limit
before insert on public.lead_email_deliveries
for each row
execute function public.enforce_free_email_limit();

revoke all
on function public.enforce_free_email_limit()
from public;

create or replace function public.enforce_free_member_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_plan public.workspace_plan;
  current_members bigint;
begin
  select plan
  into workspace_plan
  from public.workspaces
  where id = new.workspace_id
  for update;

  if workspace_plan is null then
    raise exception
      'WORKSPACE_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  if workspace_plan <> 'free' then
    return new;
  end if;

  select count(*)
  into current_members
  from public.workspace_members
  where workspace_id = new.workspace_id;

  if current_members >= 1 then
    raise exception
      'FREE_PLAN_MEMBER_LIMIT_REACHED'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger workspace_members_enforce_free_plan_limit
before insert on public.workspace_members
for each row
execute function public.enforce_free_member_limit();

revoke all
on function public.enforce_free_member_limit()
from public;

create or replace function public.claim_ai_generation_usage(
  target_workspace_id uuid,
  target_lead_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_plan public.workspace_plan;
  current_usage bigint;
begin
  if not exists (
    select 1
    from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  ) then
    raise exception
      'WORKSPACE_ACCESS_DENIED'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.leads
    where id = target_lead_id
      and workspace_id = target_workspace_id
  ) then
    raise exception
      'LEAD_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  select plan
  into workspace_plan
  from public.workspaces
  where id = target_workspace_id
  for update;

  if workspace_plan is null then
    raise exception
      'WORKSPACE_NOT_FOUND'
      using errcode = 'P0001';
  end if;

  if workspace_plan = 'free' then
    select count(*)
    into current_usage
    from public.ai_usage_events
    where workspace_id = target_workspace_id
      and created_at >= date_trunc(
        'month',
        current_timestamp
      )
      and created_at < (
        date_trunc(
          'month',
          current_timestamp
        ) + interval '1 month'
      );

    if current_usage >= 20 then
      raise exception
        'FREE_PLAN_AI_LIMIT_REACHED'
        using errcode = 'P0001';
    end if;
  end if;

  insert into public.ai_usage_events (
    workspace_id,
    lead_id
  )
  values (
    target_workspace_id,
    target_lead_id
  );

  return true;
end;
$$;

revoke all
on function public.claim_ai_generation_usage(
  uuid,
  uuid
)
from public;

revoke all
on function public.claim_ai_generation_usage(
  uuid,
  uuid
)
from anon;

grant execute
on function public.claim_ai_generation_usage(
  uuid,
  uuid
)
to authenticated;

create or replace function public.get_workspace_monthly_usage(
  target_workspace_id uuid
)
returns table (
  lead_count bigint,
  ai_generation_count bigint,
  email_count bigint,
  member_count bigint
)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if not public.is_workspace_owner(
    target_workspace_id
  ) then
    raise exception
      'WORKSPACE_OWNER_REQUIRED'
      using errcode = '42501';
  end if;

  return query
  select
    (
      select count(*)
      from public.leads
      where workspace_id = target_workspace_id
        and created_at >= date_trunc(
          'month',
          current_timestamp
        )
        and created_at < (
          date_trunc(
            'month',
            current_timestamp
          ) + interval '1 month'
        )
    ),
    (
      select count(*)
      from public.ai_usage_events
      where workspace_id = target_workspace_id
        and created_at >= date_trunc(
          'month',
          current_timestamp
        )
        and created_at < (
          date_trunc(
            'month',
            current_timestamp
          ) + interval '1 month'
        )
    ),
    (
      select count(*)
      from public.lead_email_deliveries
      where workspace_id = target_workspace_id
        and created_at >= date_trunc(
          'month',
          current_timestamp
        )
        and created_at < (
          date_trunc(
            'month',
            current_timestamp
          ) + interval '1 month'
        )
    ),
    (
      select count(*)
      from public.workspace_members
      where workspace_id = target_workspace_id
    );
end;
$$;

revoke all
on function public.get_workspace_monthly_usage(uuid)
from public;

revoke all
on function public.get_workspace_monthly_usage(uuid)
from anon;

grant execute
on function public.get_workspace_monthly_usage(uuid)
to authenticated;

comment on table public.ai_usage_events is
  'Append-only records of AI qualification generations used for monthly billing limits.';

comment on function public.claim_ai_generation_usage(
  uuid,
  uuid
) is
  'Atomically checks and consumes one AI generation for a workspace.';

comment on function public.get_workspace_monthly_usage(uuid) is
  'Returns current monthly billing usage for a workspace Owner.';
