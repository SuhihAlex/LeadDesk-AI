create type public.ai_processing_status as enum (
  'pending',
  'processing',
  'completed',
  'failed'
);

create type public.ai_service_fit as enum (
  'poor',
  'partial',
  'good',
  'excellent'
);

create type public.ai_urgency as enum (
  'low',
  'medium',
  'high'
);

create type public.reply_draft_status as enum (
  'ai_generated',
  'edited',
  'sent'
);

alter table public.leads
add column ai_status public.ai_processing_status
not null default 'pending';

alter table public.leads
add column ai_last_error text;

alter table public.leads
add column ai_input_updated_at timestamptz
not null default now();

create table public.lead_qualifications (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  lead_id uuid not null
    references public.leads(id) on delete cascade,

  summary text not null,

  score smallint not null,
  completeness_score smallint not null,

  priority public.lead_priority not null,
  service_fit public.ai_service_fit not null,
  urgency public.ai_urgency not null,

  extracted_project_type text,
  extracted_services jsonb not null default '[]'::jsonb,
  extracted_budget text,
  extracted_timeline text,
  extracted_company_context text,
  extracted_main_goal text,

  missing_information jsonb not null default '[]'::jsonb,
  risks jsonb not null default '[]'::jsonb,

  score_breakdown jsonb not null,

  model text not null,
  prompt_version text not null,

  raw_response jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lead_qualifications_lead_unique
    unique(lead_id),

  constraint lead_qualifications_score_range
    check (score between 0 and 100),

  constraint lead_qualifications_completeness_range
    check (completeness_score between 0 and 100),

  constraint lead_qualifications_services_array
    check (
      jsonb_typeof(extracted_services) = 'array'
    ),

  constraint lead_qualifications_missing_array
    check (
      jsonb_typeof(missing_information) = 'array'
    ),

  constraint lead_qualifications_risks_array
    check (
      jsonb_typeof(risks) = 'array'
    ),

  constraint lead_qualifications_score_breakdown_object
    check (
      jsonb_typeof(score_breakdown) = 'object'
    ),

  constraint lead_qualifications_raw_response_object
    check (
      raw_response is null
      or jsonb_typeof(raw_response) = 'object'
    )
);

create table public.lead_reply_drafts (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  lead_id uuid not null
    references public.leads(id) on delete cascade,

  subject text not null,
  body text not null,

  status public.reply_draft_status
    not null default 'ai_generated',

  generated_by_model text,

  last_edited_by uuid
    references public.profiles(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lead_reply_drafts_subject_length
    check (
      char_length(trim(subject)) between 1 and 240
    ),

  constraint lead_reply_drafts_body_length
    check (
      char_length(trim(body)) between 1 and 10000
    )
);

create index lead_qualifications_workspace_created_at_idx
  on public.lead_qualifications(
    workspace_id,
    created_at desc
  );

create index lead_reply_drafts_lead_created_at_idx
  on public.lead_reply_drafts(
    lead_id,
    created_at desc
  );

create index leads_workspace_ai_status_idx
  on public.leads(
    workspace_id,
    ai_status
  );

create trigger lead_qualifications_set_updated_at
before update on public.lead_qualifications
for each row
execute function public.set_updated_at();

create trigger lead_reply_drafts_set_updated_at
before update on public.lead_reply_drafts
for each row
execute function public.set_updated_at();

create or replace function public.validate_lead_qualification_workspace()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_workspace_id uuid;
begin
  select leads.workspace_id
  into parent_workspace_id
  from public.leads
  where leads.id = new.lead_id;

  if parent_workspace_id is null then
    raise exception 'Lead does not exist'
      using errcode = '23503';
  end if;

  if parent_workspace_id <> new.workspace_id then
    raise exception 'Qualification workspace does not match lead workspace'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

create trigger lead_qualifications_validate_workspace
before insert or update of workspace_id, lead_id
on public.lead_qualifications
for each row
execute function public.validate_lead_qualification_workspace();

create or replace function public.validate_lead_reply_draft_workspace()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_workspace_id uuid;
begin
  select leads.workspace_id
  into parent_workspace_id
  from public.leads
  where leads.id = new.lead_id;

  if parent_workspace_id is null then
    raise exception 'Lead does not exist'
      using errcode = '23503';
  end if;

  if parent_workspace_id <> new.workspace_id then
    raise exception 'Reply draft workspace does not match lead workspace'
      using errcode = '23514';
  end if;

  if new.last_edited_by is not null
    and not exists (
      select 1
      from public.workspace_members
      where workspace_members.workspace_id =
        new.workspace_id
        and workspace_members.user_id =
          new.last_edited_by
    )
  then
    raise exception 'Draft editor is not a workspace member'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create trigger lead_reply_drafts_validate_workspace
before insert or update of
  workspace_id,
  lead_id,
  last_edited_by
on public.lead_reply_drafts
for each row
execute function public.validate_lead_reply_draft_workspace();

alter table public.lead_qualifications
enable row level security;

alter table public.lead_reply_drafts
enable row level security;

create policy "lead_qualifications_select_workspace_members"
on public.lead_qualifications
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

create policy "lead_qualifications_insert_workspace_members"
on public.lead_qualifications
for insert
to authenticated
with check (
  public.is_workspace_member(workspace_id)
);

create policy "lead_qualifications_update_workspace_members"
on public.lead_qualifications
for update
to authenticated
using (
  public.is_workspace_member(workspace_id)
)
with check (
  public.is_workspace_member(workspace_id)
);

create policy "lead_reply_drafts_select_workspace_members"
on public.lead_reply_drafts
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

create policy "lead_reply_drafts_insert_workspace_members"
on public.lead_reply_drafts
for insert
to authenticated
with check (
  public.is_workspace_member(workspace_id)
);

create policy "lead_reply_drafts_update_workspace_members"
on public.lead_reply_drafts
for update
to authenticated
using (
  public.is_workspace_member(workspace_id)
)
with check (
  public.is_workspace_member(workspace_id)
);

revoke all
on table public.lead_qualifications
from anon;

revoke all
on table public.lead_reply_drafts
from anon;

grant select, insert, update
on table public.lead_qualifications
to authenticated;

grant select, insert, update
on table public.lead_reply_drafts
to authenticated;