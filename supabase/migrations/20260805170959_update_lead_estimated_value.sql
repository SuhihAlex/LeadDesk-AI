create or replace function public.update_lead_estimated_value(
  target_lead_id uuid,
  target_estimated_value numeric
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  previous_estimated_value numeric(12, 2);
  normalized_estimated_value numeric(12, 2);
begin
  if target_estimated_value is null then
    normalized_estimated_value := null;
  else
    normalized_estimated_value :=
      round(target_estimated_value, 2);
  end if;

  if normalized_estimated_value is not null
    and (
      normalized_estimated_value < 0
      or normalized_estimated_value > 9999999999.99
    )
  then
    raise exception 'Estimated value is outside the allowed range'
      using errcode = '22023';
  end if;

  select
    leads.workspace_id,
    leads.estimated_value
  into
    target_workspace_id,
    previous_estimated_value
  from public.leads
  where leads.id = target_lead_id
    and public.is_workspace_member(
      leads.workspace_id
    );

  if target_workspace_id is null then
    raise exception 'Lead not found or access denied'
      using errcode = 'P0002';
  end if;

  if previous_estimated_value
    is not distinct from
    normalized_estimated_value
  then
    return false;
  end if;

  update public.leads
  set
    estimated_value =
      normalized_estimated_value
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
    'lead_value_updated',
    (select auth.uid()),
    case
      when normalized_estimated_value is null
        then 'Estimated value cleared'
      else 'Estimated value updated'
    end,
    jsonb_build_object(
      'previousValue',
      previous_estimated_value,
      'value',
      normalized_estimated_value,
      'currency',
      'USD'
    )
  );

  return true;
end;
$$;

revoke all
on function public.update_lead_estimated_value(
  uuid,
  numeric
)
from public;

grant execute
on function public.update_lead_estimated_value(
  uuid,
  numeric
)
to authenticated;