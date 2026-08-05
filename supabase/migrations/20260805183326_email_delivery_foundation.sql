create type public.email_delivery_status as enum (
  'processing',
  'sent',
  'failed'
);

create table public.lead_email_deliveries (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  lead_id uuid not null
    references public.leads(id) on delete cascade,

  draft_id uuid not null
    references public.lead_reply_drafts(id) on delete cascade,

  recipient_email text not null,
  subject text not null,
  body text not null,

  provider text not null,
  provider_message_id text,

  status public.email_delivery_status
    not null default 'processing',

  error_message text,

  sent_by uuid
    references public.profiles(id) on delete set null,

  started_at timestamptz not null default now(),
  sent_at timestamptz,
  failed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lead_email_deliveries_draft_unique
    unique(draft_id),

  constraint lead_email_deliveries_recipient_normalized
    check (
      recipient_email = lower(trim(recipient_email))
      and char_length(recipient_email) between 3 and 254
    ),

  constraint lead_email_deliveries_subject_length
    check (
      char_length(trim(subject)) between 1 and 240
    ),

  constraint lead_email_deliveries_body_length
    check (
      char_length(trim(body)) between 1 and 10000
    ),

  constraint lead_email_deliveries_provider_length
    check (
      char_length(trim(provider)) between 1 and 80
    ),

  constraint lead_email_deliveries_sent_consistency
    check (
      (
        status = 'sent'
        and sent_at is not null
        and provider_message_id is not null
        and failed_at is null
        and error_message is null
      )
      or (
        status = 'failed'
        and failed_at is not null
        and sent_at is null
      )
      or (
        status = 'processing'
        and sent_at is null
        and failed_at is null
        and provider_message_id is null
      )
    )
);

create index lead_email_deliveries_workspace_created_at_idx
  on public.lead_email_deliveries(
    workspace_id,
    created_at desc
  );

create index lead_email_deliveries_lead_created_at_idx
  on public.lead_email_deliveries(
    lead_id,
    created_at desc
  );

create trigger lead_email_deliveries_set_updated_at
before update on public.lead_email_deliveries
for each row
execute function public.set_updated_at();

create or replace function public.validate_lead_email_delivery_workspace()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_lead_workspace_id uuid;
  parent_draft_workspace_id uuid;
  parent_draft_lead_id uuid;
begin
  select leads.workspace_id
  into parent_lead_workspace_id
  from public.leads
  where leads.id = new.lead_id;

  select
    lead_reply_drafts.workspace_id,
    lead_reply_drafts.lead_id
  into
    parent_draft_workspace_id,
    parent_draft_lead_id
  from public.lead_reply_drafts
  where lead_reply_drafts.id = new.draft_id;

  if parent_lead_workspace_id is null
    or parent_draft_workspace_id is null
  then
    raise exception 'Lead or reply draft does not exist'
      using errcode = '23503';
  end if;

  if parent_lead_workspace_id <> new.workspace_id
    or parent_draft_workspace_id <> new.workspace_id
    or parent_draft_lead_id <> new.lead_id
  then
    raise exception 'Email delivery workspace or lead mismatch'
      using errcode = '23514';
  end if;

  if new.sent_by is not null
    and not exists (
      select 1
      from public.workspace_members
      where workspace_members.workspace_id =
        new.workspace_id
        and workspace_members.user_id =
          new.sent_by
    )
  then
    raise exception 'Email sender is not a workspace member'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create trigger lead_email_deliveries_validate_workspace
before insert or update of
  workspace_id,
  lead_id,
  draft_id,
  sent_by
on public.lead_email_deliveries
for each row
execute function public.validate_lead_email_delivery_workspace();

alter table public.lead_email_deliveries
enable row level security;

create policy "lead_email_deliveries_select_workspace_members"
on public.lead_email_deliveries
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

create policy "lead_email_deliveries_insert_workspace_members"
on public.lead_email_deliveries
for insert
to authenticated
with check (
  public.is_workspace_member(workspace_id)
);

create policy "lead_email_deliveries_update_workspace_members"
on public.lead_email_deliveries
for update
to authenticated
using (
  public.is_workspace_member(workspace_id)
)
with check (
  public.is_workspace_member(workspace_id)
);

revoke all
on table public.lead_email_deliveries
from anon;

grant select, insert, update
on table public.lead_email_deliveries
to authenticated;

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
  created_delivery_id uuid;
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

  if exists (
    select 1
    from public.lead_email_deliveries
    where draft_id = target_draft_id
  ) then
    raise exception 'Email delivery already exists for this reply draft'
      using errcode = '23505';
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
  returning id into created_delivery_id;

  return created_delivery_id;
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

create or replace function public.complete_lead_reply_delivery(
  target_delivery_id uuid,
  target_provider_message_id text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  target_lead_id uuid;
  target_draft_id uuid;
  target_recipient_email text;
  target_subject text;
  current_delivery_status public.email_delivery_status;
begin
  select
    lead_email_deliveries.workspace_id,
    lead_email_deliveries.lead_id,
    lead_email_deliveries.draft_id,
    lead_email_deliveries.recipient_email,
    lead_email_deliveries.subject,
    lead_email_deliveries.status
  into
    target_workspace_id,
    target_lead_id,
    target_draft_id,
    target_recipient_email,
    target_subject,
    current_delivery_status
  from public.lead_email_deliveries
  where lead_email_deliveries.id =
    target_delivery_id
    and public.is_workspace_member(
      lead_email_deliveries.workspace_id
    );

  if target_workspace_id is null then
    raise exception 'Email delivery not found or access denied'
      using errcode = 'P0002';
  end if;

  if current_delivery_status = 'sent' then
    return false;
  end if;

  if current_delivery_status <> 'processing' then
    raise exception 'Only processing email deliveries can be completed'
      using errcode = '22023';
  end if;

  if char_length(trim(target_provider_message_id)) < 1 then
    raise exception 'Provider message ID is required'
      using errcode = '22023';
  end if;

  update public.lead_email_deliveries
  set
    status = 'sent',
    provider_message_id =
      trim(target_provider_message_id),
    sent_at = now(),
    error_message = null,
    failed_at = null
  where id = target_delivery_id
    and workspace_id = target_workspace_id;

  update public.lead_reply_drafts
  set status = 'sent'
  where id = target_draft_id
    and lead_id = target_lead_id
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
    'email_sent',
    (select auth.uid()),
    'Email sent',
    jsonb_build_object(
      'deliveryId',
      target_delivery_id,
      'draftId',
      target_draft_id,
      'recipientEmail',
      target_recipient_email,
      'subject',
      target_subject,
      'providerMessageId',
      trim(target_provider_message_id)
    )
  );

  return true;
end;
$$;

revoke all
on function public.complete_lead_reply_delivery(
  uuid,
  text
)
from public;

grant execute
on function public.complete_lead_reply_delivery(
  uuid,
  text
)
to authenticated;

create or replace function public.fail_lead_reply_delivery(
  target_delivery_id uuid,
  target_error_message text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  current_delivery_status public.email_delivery_status;
begin
  select
    lead_email_deliveries.workspace_id,
    lead_email_deliveries.status
  into
    target_workspace_id,
    current_delivery_status
  from public.lead_email_deliveries
  where lead_email_deliveries.id =
    target_delivery_id
    and public.is_workspace_member(
      lead_email_deliveries.workspace_id
    );

  if target_workspace_id is null then
    raise exception 'Email delivery not found or access denied'
      using errcode = 'P0002';
  end if;

  if current_delivery_status <> 'processing' then
    return false;
  end if;

  update public.lead_email_deliveries
  set
    status = 'failed',
    error_message = left(
      coalesce(
        nullif(trim(target_error_message), ''),
        'Email provider failed'
      ),
      2000
    ),
    failed_at = now()
  where id = target_delivery_id
    and workspace_id = target_workspace_id;

  return true;
end;
$$;

revoke all
on function public.fail_lead_reply_delivery(
  uuid,
  text
)
from public;

grant execute
on function public.fail_lead_reply_delivery(
  uuid,
  text
)
to authenticated;