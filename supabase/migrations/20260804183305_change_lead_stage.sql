create or replace function public.change_lead_stage(
  target_lead_id uuid,
  target_stage public.lead_stage
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  current_stage public.lead_stage;
begin
  select
    leads.workspace_id,
    leads.stage
  into
    target_workspace_id,
    current_stage
  from public.leads
  where leads.id = target_lead_id
    and public.is_workspace_member(leads.workspace_id);

  if target_workspace_id is null then
    raise exception 'Lead not found or access denied'
      using errcode = 'P0002';
  end if;

  if current_stage is not distinct from target_stage then
    return false;
  end if;

  update public.leads
  set stage = target_stage
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
    'stage_changed',
    (select auth.uid()),
    'Lead stage changed',
    jsonb_build_object(
      'previousStage',
      current_stage,
      'stage',
      target_stage
    )
  );

  return true;
end;
$$;

revoke all
on function public.change_lead_stage(
  uuid,
  public.lead_stage
)
from public;

grant execute
on function public.change_lead_stage(
  uuid,
  public.lead_stage
)
to authenticated;