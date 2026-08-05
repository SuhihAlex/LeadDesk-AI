create or replace function public.claim_lead_reply_delivery(
  target_lead_id uuid,
  target_draft_id uuid,
  target_provider text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  target_recipient_email text;
  target_subject text;
  target_body text;
  target_draft_status public.reply_draft_status;

  existing_delivery_id uuid;
  existing_delivery_status public.email_delivery_status;

  claimed_delivery_id uuid;
begin
  select
    leads.workspace_id,
    leads.email,
    lead_reply_drafts.subject,
    lead_reply_drafts.body,
    lead_reply_drafts.status
  into
    target_workspace_id,
    target_recipient_email,
    target_subject,
    target_body,
    target_draft_status
  from public.leads
  join public.lead_reply_drafts
    on lead_reply_drafts.lead_id = leads.id
  where leads.id = target_lead_id
    and lead_reply_drafts.id = target_draft_id
    and public.is_workspace_member(
      leads.workspace_id
    )
    and lead_reply_drafts.workspace_id =
      leads.workspace_id;

  if target_workspace_id is null then
    raise exception 'Lead or reply draft not found or access denied'
      using errcode = 'P0002';
  end if;

  if target_draft_status = 'sent' then
    raise exception 'Reply draft has already been sent'
      using errcode = '22023';
  end if;

  select
    lead_email_deliveries.id,
    lead_email_deliveries.status
  into
    existing_delivery_id,
    existing_delivery_status
  from public.lead_email_deliveries
  where lead_email_deliveries.draft_id =
    target_draft_id
  for update;

  if existing_delivery_id is not null then
    if existing_delivery_status = 'processing' then
      raise exception 'Email delivery is already processing'
        using errcode = '55000';
    end if;

    if existing_delivery_status = 'sent' then
      raise exception 'Email delivery has already been sent'
        using errcode = '22023';
    end if;

    update public.lead_email_deliveries
    set
      recipient_email =
        lower(trim(target_recipient_email)),
      subject = trim(target_subject),
      body = trim(target_body),
      provider = trim(target_provider),
      provider_message_id = null,
      status = 'processing',
      error_message = null,
      sent_by = (select auth.uid()),
      started_at = now(),
      sent_at = null,
      failed_at = null
    where id = existing_delivery_id
      and workspace_id = target_workspace_id
    returning id into claimed_delivery_id;

    return claimed_delivery_id;
  end if;

  insert into public.lead_email_deliveries (
    workspace_id,
    lead_id,
    draft_id,
    recipient_email,
    subject,
    body,
    provider,
    sent_by
  )
  values (
    target_workspace_id,
    target_lead_id,
    target_draft_id,
    lower(trim(target_recipient_email)),
    trim(target_subject),
    trim(target_body),
    trim(target_provider),
    (select auth.uid())
  )
  returning id into claimed_delivery_id;

  return claimed_delivery_id;
end;
$$;

revoke all
on function public.claim_lead_reply_delivery(
  uuid,
  uuid,
  text
)
from public;

grant execute
on function public.claim_lead_reply_delivery(
  uuid,
  uuid,
  text
)
to authenticated;