create or replace function public.assign_lead(
  target_lead_id uuid,
  target_assignee_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  current_assignee_id uuid;
  target_assignee_name text;
begin
  select
    leads.workspace_id,
    leads.assigned_to
  into
    target_workspace_id,
    current_assignee_id
  from public.leads
  where leads.id = target_lead_id
    and public.is_workspace_member(leads.workspace_id);

  if target_workspace_id is null then
    raise exception 'Lead not found or access denied'
      using errcode = 'P0002';
  end if;

  if target_assignee_id is not null then
    select profiles.full_name
    into target_assignee_name
    from public.workspace_members
    inner join public.profiles
      on profiles.id = workspace_members.user_id
    where workspace_members.workspace_id = target_workspace_id
      and workspace_members.user_id = target_assignee_id;

    if target_assignee_name is null then
      raise exception 'Assignee is not a workspace member'
        using errcode = '23503';
    end if;
  end if;

  if current_assignee_id is not distinct from target_assignee_id then
    return false;
  end if;

  update public.leads
  set assigned_to = target_assignee_id
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
    'assignment_changed',
    (select auth.uid()),
    case
      when target_assignee_id is null
        then 'Lead unassigned'
      else 'Lead assigned'
    end,
    jsonb_build_object(
      'previousAssigneeId',
      current_assignee_id,
      'assigneeId',
      target_assignee_id,
      'assigneeName',
      target_assignee_name
    )
  );

  return true;
end;
$$;

revoke all
on function public.assign_lead(uuid, uuid)
from public;

grant execute
on function public.assign_lead(uuid, uuid)
to authenticated;