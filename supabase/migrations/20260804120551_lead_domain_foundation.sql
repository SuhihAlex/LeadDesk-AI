create type public.lead_stage as enum (
  'new',
  'qualified',
  'contacted',
  'proposal',
  'won',
  'lost'
);

create type public.lead_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

create type public.lead_source as enum (
  'website_form',
  'referral',
  'email',
  'manual'
);

create type public.lead_project_type as enum (
  'marketing_website',
  'ecommerce',
  'saas_mvp',
  'web_application',
  'redesign',
  'other'
);

create type public.lead_budget_range as enum (
  'under_3000',
  '3000_7000',
  '7000_15000',
  '15000_30000',
  'over_30000',
  'not_sure'
);

create type public.lead_timeline as enum (
  'asap',
  'one_month',
  'one_to_two_months',
  'three_to_six_months',
  'flexible'
);

create type public.lead_activity_type as enum (
  'lead_created',
  'stage_changed',
  'assignment_changed',
  'note_added',
  'task_created',
  'email_sent',
  'ai_qualification_completed'
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  full_name text not null,
  email text not null,
  company text,

  project_type public.lead_project_type not null,
  budget_range public.lead_budget_range not null,
  desired_timeline public.lead_timeline not null,

  description text not null,
  website_url text,

  source public.lead_source not null default 'website_form',
  stage public.lead_stage not null default 'new',
  priority public.lead_priority not null default 'medium',

  assigned_to uuid
    references public.profiles(id) on delete set null,

  is_unread boolean not null default true,

  estimated_value numeric(12, 2),

  ai_score smallint,
  ai_summary text,
  ai_completeness_score smallint,
  ai_processed_at timestamptz,

  consent_given boolean not null default false,
  consent_given_at timestamptz,

  created_by uuid
    references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint leads_full_name_length
    check (char_length(trim(full_name)) between 2 and 120),

  constraint leads_email_normalized
    check (
      email = lower(trim(email))
      and char_length(email) between 3 and 254
    ),

  constraint leads_company_length
    check (
      company is null
      or char_length(trim(company)) between 1 and 160
    ),

  constraint leads_description_length
    check (
      char_length(trim(description)) between 20 and 10000
    ),

  constraint leads_website_url_length
    check (
      website_url is null
      or char_length(website_url) <= 2048
    ),

  constraint leads_estimated_value_non_negative
    check (
      estimated_value is null
      or estimated_value >= 0
    ),

  constraint leads_ai_score_range
    check (
      ai_score is null
      or ai_score between 0 and 100
    ),

  constraint leads_ai_completeness_score_range
    check (
      ai_completeness_score is null
      or ai_completeness_score between 0 and 100
    ),

  constraint leads_consent_timestamp
    check (
      (
        consent_given = true
        and consent_given_at is not null
      )
      or
      (
        consent_given = false
        and consent_given_at is null
      )
    )
);

create table public.lead_activities (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  lead_id uuid not null
    references public.leads(id) on delete cascade,

  activity_type public.lead_activity_type not null,

  actor_id uuid
    references public.profiles(id) on delete set null,

  title text not null,
  details jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),

  constraint lead_activities_title_length
    check (char_length(trim(title)) between 1 and 240),

  constraint lead_activities_details_object
    check (jsonb_typeof(details) = 'object')
);

create index leads_workspace_created_at_idx
  on public.leads(workspace_id, created_at desc);

create index leads_workspace_stage_idx
  on public.leads(workspace_id, stage);

create index leads_workspace_priority_idx
  on public.leads(workspace_id, priority);

create index leads_workspace_source_idx
  on public.leads(workspace_id, source);

create index leads_workspace_assigned_to_idx
  on public.leads(workspace_id, assigned_to);

create index leads_workspace_unread_idx
  on public.leads(workspace_id, is_unread)
  where is_unread = true;

create index leads_workspace_email_idx
  on public.leads(workspace_id, email);

create index lead_activities_lead_created_at_idx
  on public.lead_activities(lead_id, created_at desc);

create index lead_activities_workspace_created_at_idx
  on public.lead_activities(workspace_id, created_at desc);

create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

create or replace function public.validate_lead_workspace_assignment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.assigned_to is not null
    and not exists (
      select 1
      from public.workspace_members
      where workspace_id = new.workspace_id
        and user_id = new.assigned_to
    )
  then
    raise exception 'Assigned user is not a member of the lead workspace'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create trigger leads_validate_workspace_assignment
before insert or update of workspace_id, assigned_to
on public.leads
for each row
execute function public.validate_lead_workspace_assignment();

create or replace function public.validate_lead_activity_workspace()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_workspace_id uuid;
begin
  select workspace_id
  into parent_workspace_id
  from public.leads
  where id = new.lead_id;

  if parent_workspace_id is null then
    raise exception 'Lead does not exist'
      using errcode = '23503';
  end if;

  if parent_workspace_id <> new.workspace_id then
    raise exception 'Activity workspace does not match lead workspace'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger lead_activities_validate_workspace
before insert or update of workspace_id, lead_id
on public.lead_activities
for each row
execute function public.validate_lead_activity_workspace();

alter table public.leads
enable row level security;

alter table public.lead_activities
enable row level security;

create policy "leads_select_workspace_members"
on public.leads
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

create policy "leads_insert_workspace_members"
on public.leads
for insert
to authenticated
with check (
  public.is_workspace_member(workspace_id)
  and (
    created_by is null
    or created_by = (select auth.uid())
  )
);

create policy "leads_update_workspace_members"
on public.leads
for update
to authenticated
using (
  public.is_workspace_member(workspace_id)
)
with check (
  public.is_workspace_member(workspace_id)
);

create policy "leads_delete_workspace_owners"
on public.leads
for delete
to authenticated
using (
  public.is_workspace_owner(workspace_id)
);

create policy "lead_activities_select_workspace_members"
on public.lead_activities
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

create policy "lead_activities_insert_workspace_members"
on public.lead_activities
for insert
to authenticated
with check (
  public.is_workspace_member(workspace_id)
  and (
    actor_id is null
    or actor_id = (select auth.uid())
  )
);

revoke all on table public.leads from anon;
revoke all on table public.lead_activities from anon;

grant select, insert, update, delete
on table public.leads
to authenticated;

grant select, insert
on table public.lead_activities
to authenticated;
