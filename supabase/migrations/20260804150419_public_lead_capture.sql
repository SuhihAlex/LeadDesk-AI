create or replace function public.create_public_lead(
  form_token text,
  lead_full_name text,
  lead_email text,
  lead_company text,
  lead_project_type public.lead_project_type,
  lead_budget_range public.lead_budget_range,
  lead_desired_timeline public.lead_timeline,
  lead_description text,
  lead_website_url text,
  lead_consent_given boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  created_lead_id uuid;
  normalized_full_name text;
  normalized_email text;
  normalized_company text;
  normalized_description text;
  normalized_website_url text;
begin
  if form_token is null
    or char_length(trim(form_token)) < 32
  then
    raise exception 'Invalid public form token'
      using errcode = '22023';
  end if;

  select id
  into target_workspace_id
  from public.workspaces
  where public_form_token = trim(form_token);

  if target_workspace_id is null then
    raise exception 'Public form does not exist'
      using errcode = 'P0002';
  end if;

  normalized_full_name := trim(lead_full_name);
  normalized_email := lower(trim(lead_email));
  normalized_company := nullif(trim(lead_company), '');
  normalized_description := trim(lead_description);
  normalized_website_url := nullif(trim(lead_website_url), '');

  if normalized_full_name is null
    or char_length(normalized_full_name) not between 2 and 120
  then
    raise exception 'Invalid full name'
      using errcode = '22023';
  end if;

  if normalized_email is null
    or char_length(normalized_email) not between 3 and 254
    or normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  then
    raise exception 'Invalid email address'
      using errcode = '22023';
  end if;

  if normalized_company is not null
    and char_length(normalized_company) > 160
  then
    raise exception 'Company name is too long'
      using errcode = '22023';
  end if;

  if normalized_description is null
    or char_length(normalized_description) not between 20 and 10000
  then
    raise exception 'Invalid project description'
      using errcode = '22023';
  end if;

  if normalized_website_url is not null
    and char_length(normalized_website_url) > 2048
  then
    raise exception 'Website URL is too long'
      using errcode = '22023';
  end if;

  if lead_consent_given is not true then
    raise exception 'Consent is required'
      using errcode = '22023';
  end if;

  insert into public.leads (
    workspace_id,
    full_name,
    email,
    company,
    project_type,
    budget_range,
    desired_timeline,
    description,
    website_url,
    source,
    stage,
    priority,
    is_unread,
    consent_given,
    consent_given_at,
    created_by
  )
  values (
    target_workspace_id,
    normalized_full_name,
    normalized_email,
    normalized_company,
    lead_project_type,
    lead_budget_range,
    lead_desired_timeline,
    normalized_description,
    normalized_website_url,
    'website_form',
    'new',
    'medium',
    true,
    true,
    now(),
    null
  )
  returning id into created_lead_id;

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
    created_lead_id,
    'lead_created',
    null,
    'Lead submitted through the public form',
    jsonb_build_object(
      'source', 'website_form',
      'email', normalized_email
    )
  );

  return created_lead_id;
end;
$$;

revoke all
on function public.create_public_lead(
  text,
  text,
  text,
  text,
  public.lead_project_type,
  public.lead_budget_range,
  public.lead_timeline,
  text,
  text,
  boolean
)
from public;

grant execute
on function public.create_public_lead(
  text,
  text,
  text,
  text,
  public.lead_project_type,
  public.lead_budget_range,
  public.lead_timeline,
  text,
  text,
  boolean
)
to anon, authenticated;

comment on function public.create_public_lead(
  text,
  text,
  text,
  text,
  public.lead_project_type,
  public.lead_budget_range,
  public.lead_timeline,
  text,
  text,
  boolean
) is
  'Creates a public website-form lead and its initial activity atomically using a workspace public form token.';
