create or replace function public.mark_lead_viewed(
  target_lead_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
begin
  update public.leads
  set is_unread = false
  where id = target_lead_id
    and is_unread = true
    and public.is_workspace_member(workspace_id)
  returning workspace_id
  into target_workspace_id;

  if target_workspace_id is null then
    return false;
  end if;

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
    'lead_viewed',
    (select auth.uid()),
    'Lead viewed',
    jsonb_build_object(
      'isUnread', false
    )
  );

  return true;
end;
$$;

revoke all
on function public.mark_lead_viewed(uuid)
from public;

grant execute
on function public.mark_lead_viewed(uuid)
to authenticated;