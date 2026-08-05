create or replace function public.update_lead_reply_draft(
  target_lead_id uuid,
  target_draft_id uuid,
  draft_subject text,
  draft_body text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  current_draft_status public.reply_draft_status;
  normalized_subject text;
  normalized_body text;
begin
  normalized_subject := trim(draft_subject);
  normalized_body := trim(draft_body);

  if char_length(normalized_subject) < 1
    or char_length(normalized_subject) > 240
  then
    raise exception 'Draft subject must contain between 1 and 240 characters'
      using errcode = '22023';
  end if;

  if char_length(normalized_body) < 1
    or char_length(normalized_body) > 10000
  then
    raise exception 'Draft body must contain between 1 and 10000 characters'
      using errcode = '22023';
  end if;

  select
    lead_reply_drafts.workspace_id,
    lead_reply_drafts.status
  into
    target_workspace_id,
    current_draft_status
  from public.lead_reply_drafts
  where lead_reply_drafts.id = target_draft_id
    and lead_reply_drafts.lead_id = target_lead_id
    and public.is_workspace_member(
      lead_reply_drafts.workspace_id
    );

  if target_workspace_id is null then
    raise exception 'Reply draft not found or access denied'
      using errcode = 'P0002';
  end if;

  if current_draft_status = 'sent' then
    raise exception 'Sent reply drafts cannot be edited'
      using errcode = '22023';
  end if;

  update public.lead_reply_drafts
  set
    subject = normalized_subject,
    body = normalized_body,
    status = 'edited',
    last_edited_by = (select auth.uid())
  where id = target_draft_id
    and lead_id = target_lead_id
    and workspace_id = target_workspace_id;

  return true;
end;
$$;

revoke all
on function public.update_lead_reply_draft(
  uuid,
  uuid,
  text,
  text
)
from public;

grant execute
on function public.update_lead_reply_draft(
  uuid,
  uuid,
  text,
  text
)
to authenticated;