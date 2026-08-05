create or replace function public.start_lead_qualification(
  target_lead_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  current_ai_status public.ai_processing_status;
begin
  select
    leads.workspace_id,
    leads.ai_status
  into
    target_workspace_id,
    current_ai_status
  from public.leads
  where leads.id = target_lead_id
    and public.is_workspace_member(leads.workspace_id);

  if target_workspace_id is null then
    raise exception 'Lead not found or access denied'
      using errcode = 'P0002';
  end if;

  if current_ai_status = 'processing' then
    return false;
  end if;

  update public.leads
  set
    ai_status = 'processing',
    ai_last_error = null
  where id = target_lead_id
    and workspace_id = target_workspace_id;

  insert into public.lead_activities (
    workspace_id,
    lead_id,
    activity_type,
    actor_id,
    title,
    details
  )
  values (
    target_workspace_id,
    target_lead_id,
    'ai_qualification_started',
    (select auth.uid()),
    'AI qualification started',
    '{}'::jsonb
  );

  return true;
end;
$$;

revoke all
on function public.start_lead_qualification(uuid)
from public;

grant execute
on function public.start_lead_qualification(uuid)
to authenticated;


create or replace function public.complete_lead_qualification(
  target_lead_id uuid,
  qualification_summary text,
  qualification_score integer,
  qualification_completeness_score integer,
  qualification_priority public.lead_priority,
  qualification_service_fit public.ai_service_fit,
  qualification_urgency public.ai_urgency,
  extracted_project_type text,
  extracted_services jsonb,
  extracted_budget text,
  extracted_timeline text,
  extracted_company_context text,
  extracted_main_goal text,
  qualification_missing_information jsonb,
  qualification_risks jsonb,
  qualification_score_breakdown jsonb,
  qualification_model text,
  qualification_prompt_version text,
  qualification_raw_response jsonb,
  draft_subject text,
  draft_body text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  qualification_id uuid;
begin
  select leads.workspace_id
  into target_workspace_id
  from public.leads
  where leads.id = target_lead_id
    and public.is_workspace_member(leads.workspace_id);

  if target_workspace_id is null then
    raise exception 'Lead not found or access denied'
      using errcode = 'P0002';
  end if;

  if qualification_score < 0
    or qualification_score > 100
  then
    raise exception 'Qualification score is invalid'
      using errcode = '22023';
  end if;

  if qualification_completeness_score < 0
    or qualification_completeness_score > 100
  then
    raise exception 'Completeness score is invalid'
      using errcode = '22023';
  end if;

  insert into public.lead_qualifications (
    workspace_id,
    lead_id,
    summary,
    score,
    completeness_score,
    priority,
    service_fit,
    urgency,
    extracted_project_type,
    extracted_services,
    extracted_budget,
    extracted_timeline,
    extracted_company_context,
    extracted_main_goal,
    missing_information,
    risks,
    score_breakdown,
    model,
    prompt_version,
    raw_response
  )
  values (
    target_workspace_id,
    target_lead_id,
    trim(qualification_summary),
    qualification_score,
    qualification_completeness_score,
    qualification_priority,
    qualification_service_fit,
    qualification_urgency,
    nullif(trim(extracted_project_type), ''),
    extracted_services,
    nullif(trim(extracted_budget), ''),
    nullif(trim(extracted_timeline), ''),
    nullif(trim(extracted_company_context), ''),
    nullif(trim(extracted_main_goal), ''),
    qualification_missing_information,
    qualification_risks,
    qualification_score_breakdown,
    trim(qualification_model),
    trim(qualification_prompt_version),
    qualification_raw_response
  )
  on conflict (lead_id)
  do update set
    summary = excluded.summary,
    score = excluded.score,
    completeness_score = excluded.completeness_score,
    priority = excluded.priority,
    service_fit = excluded.service_fit,
    urgency = excluded.urgency,
    extracted_project_type =
      excluded.extracted_project_type,
    extracted_services =
      excluded.extracted_services,
    extracted_budget =
      excluded.extracted_budget,
    extracted_timeline =
      excluded.extracted_timeline,
    extracted_company_context =
      excluded.extracted_company_context,
    extracted_main_goal =
      excluded.extracted_main_goal,
    missing_information =
      excluded.missing_information,
    risks = excluded.risks,
    score_breakdown =
      excluded.score_breakdown,
    model = excluded.model,
    prompt_version =
      excluded.prompt_version,
    raw_response =
      excluded.raw_response
  returning id
  into qualification_id;

  insert into public.lead_reply_drafts (
    workspace_id,
    lead_id,
    subject,
    body,
    status,
    generated_by_model,
    last_edited_by
  )
  values (
    target_workspace_id,
    target_lead_id,
    trim(draft_subject),
    trim(draft_body),
    'ai_generated',
    trim(qualification_model),
    null
  );

  update public.leads
  set
    ai_status = 'completed',
    ai_last_error = null,
    ai_score = qualification_score,
    ai_summary = trim(qualification_summary),
    ai_completeness_score =
      qualification_completeness_score,
    ai_processed_at = now(),
    priority = qualification_priority
  where id = target_lead_id
    and workspace_id = target_workspace_id;

  insert into public.lead_activities (
    workspace_id,
    lead_id,
    activity_type,
    actor_id,
    title,
    details
  )
  values (
    target_workspace_id,
    target_lead_id,
    'ai_qualification_completed',
    (select auth.uid()),
    'AI qualification completed',
    jsonb_build_object(
      'qualificationId',
      qualification_id,
      'score',
      qualification_score,
      'priority',
      qualification_priority,
      'model',
      qualification_model,
      'promptVersion',
      qualification_prompt_version
    )
  );

  return qualification_id;
end;
$$;

revoke all
on function public.complete_lead_qualification(
  uuid,
  text,
  integer,
  integer,
  public.lead_priority,
  public.ai_service_fit,
  public.ai_urgency,
  text,
  jsonb,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  jsonb,
  text,
  text,
  jsonb,
  text,
  text
)
from public;

grant execute
on function public.complete_lead_qualification(
  uuid,
  text,
  integer,
  integer,
  public.lead_priority,
  public.ai_service_fit,
  public.ai_urgency,
  text,
  jsonb,
  text,
  text,
  text,
  text,
  jsonb,
  jsonb,
  jsonb,
  text,
  text,
  jsonb,
  text,
  text
)
to authenticated;


create or replace function public.fail_lead_qualification(
  target_lead_id uuid,
  failure_message text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  normalized_message text;
begin
  normalized_message :=
    left(trim(failure_message), 1000);

  select leads.workspace_id
  into target_workspace_id
  from public.leads
  where leads.id = target_lead_id
    and public.is_workspace_member(leads.workspace_id);

  if target_workspace_id is null then
    raise exception 'Lead not found or access denied'
      using errcode = 'P0002';
  end if;

  update public.leads
  set
    ai_status = 'failed',
    ai_last_error = normalized_message
  where id = target_lead_id
    and workspace_id = target_workspace_id;

  insert into public.lead_activities (
    workspace_id,
    lead_id,
    activity_type,
    actor_id,
    title,
    details
  )
  values (
    target_workspace_id,
    target_lead_id,
    'ai_qualification_failed',
    (select auth.uid()),
    'AI qualification failed',
    jsonb_build_object(
      'message',
      normalized_message
    )
  );

  return true;
end;
$$;

revoke all
on function public.fail_lead_qualification(
  uuid,
  text
)
from public;

grant execute
on function public.fail_lead_qualification(
  uuid,
  text
)
to authenticated;