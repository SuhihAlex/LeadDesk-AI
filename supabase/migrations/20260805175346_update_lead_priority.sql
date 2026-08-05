create or replace function public.update_lead_priority(
  target_lead_id uuid,
  target_priority public.lead_priority
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  previous_priority public.lead_priority;
begin
  select
    leads.workspace_id,
    leads.priority
  into
    target_workspace_id,
    previous_priority
  from public.leads
  where leads.id = target_lead_id
    and public.is_workspace_member(
      leads.workspace_id
    );

  if target_workspace_id is null then
    raise exception 'Lead not found or access denied'
      using errcode = 'P0002';
  end if;

  if previous_priority
    is not distinct from
    target_priority
  then
    return false;
  end if;

  update public.leads
  set priority = target_priority
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
    'lead_priority_updated',
    (select auth.uid()),
    'Lead priority updated',
    jsonb_build_object(
      'previousPriority',
      previous_priority,
      'priority',
      target_priority,
      'source',
      'manual'
    )
  );

  return true;
end;
$$;

revoke all
on function public.update_lead_priority(
  uuid,
  public.lead_priority
)
from public;

grant execute
on function public.update_lead_priority(
  uuid,
  public.lead_priority
)
to authenticated;