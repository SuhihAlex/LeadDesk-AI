-- LeadDesk AI portfolio demo seed
-- Re-runnable: replaces only leads with @demo.leaddesk.ai emails.
-- Target workspace: KINETIC Studio.

begin;

do $$
declare
  target_workspace_id uuid;
  target_owner_id uuid;
begin
  select id
  into target_workspace_id
  from public.workspaces
  where name = 'KINETIC Studio'
  order by created_at
  limit 1;

  if target_workspace_id is null then
    raise exception 'Workspace KINETIC Studio was not found';
  end if;

  select user_id
  into target_owner_id
  from public.workspace_members
  where workspace_id = target_workspace_id
    and role = 'owner'
  order by joined_at
  limit 1;

  if target_owner_id is null then
    raise exception 'Workspace Owner was not found';
  end if;

  delete from public.leads
  where workspace_id = target_workspace_id
    and email like '%@demo.leaddesk.ai';

  create temporary table demo_input (
    position integer primary key,
    full_name text,
    company text,
    project_type public.lead_project_type,
    budget_range public.lead_budget_range,
    desired_timeline public.lead_timeline,
    source public.lead_source,
    stage public.lead_stage,
    priority public.lead_priority,
    estimated_value numeric(12,2),
    ai_score smallint,
    completeness_score smallint,
    service_fit public.ai_service_fit,
    urgency public.ai_urgency,
    ai_status public.ai_processing_status,
    created_days_ago integer
  ) on commit drop;

  insert into demo_input
  select
    n,
    (array[
      'Olivia Carter','Liam Bennett','Emma Wilson','Noah Martin','Sophia Turner',
      'Ethan Brooks','Mia Collins','Lucas Reed','Ava Richardson','James Foster',
      'Isabella Moore','Benjamin Hughes','Charlotte Evans','Henry Cooper','Amelia Ward',
      'Alexander Price','Harper Scott','Daniel Kim','Grace Phillips','Samuel Ross',
      'Ella Peterson','Jack Murphy','Lily Anderson','Leo Thompson','Zoe Mitchell',
      'Oscar Edwards','Ruby Baker','William Clark','Victoria Lewis','Thomas Walker'
    ])[n],
    (array[
      'Northstar Health','Atlas Commerce','BrightPath Finance','Urban Dental Group','Nimbus Analytics',
      'GreenGrid Energy','PixelFoundry','Harbor Logistics','VeloWorks','Cobalt Legal',
      'Lumen Learning','Oak & Stone','Beacon HR','Summit Property','CalmSpace',
      'Forge Manufacturing','Monarch Events','Orbit Security','FieldNote','Kite Creative',
      'CareLink','Redwood Foods','Mosaic Architecture','RoutePilot','Willow Therapy',
      'IronPeak Fitness','Sage Accounting','Bluebird Travel','Kindred Foundation','Apex Robotics'
    ])[n],
    (array[
      'web_application','ecommerce','saas_mvp','redesign','saas_mvp',
      'marketing_website','web_application','redesign','ecommerce','marketing_website',
      'saas_mvp','ecommerce','web_application','marketing_website','saas_mvp',
      'redesign','web_application','marketing_website','saas_mvp','redesign',
      'web_application','ecommerce','marketing_website','saas_mvp','marketing_website',
      'ecommerce','web_application','redesign','marketing_website','web_application'
    ]::public.lead_project_type[])[n],
    (array[
      '15000_30000','over_30000','15000_30000','7000_15000','over_30000',
      '7000_15000','15000_30000','7000_15000','15000_30000','7000_15000',
      '15000_30000','7000_15000','15000_30000','3000_7000','15000_30000',
      '7000_15000','7000_15000','7000_15000','under_3000','3000_7000',
      '15000_30000','7000_15000','7000_15000','over_30000','3000_7000',
      '3000_7000','7000_15000','7000_15000','3000_7000','15000_30000'
    ]::public.lead_budget_range[])[n],
    (array[
      'one_to_two_months','three_to_six_months','one_to_two_months','one_month','three_to_six_months',
      'one_to_two_months','one_to_two_months','one_month','one_to_two_months','one_to_two_months',
      'three_to_six_months','one_to_two_months','three_to_six_months','one_month','one_to_two_months',
      'three_to_six_months','asap','one_to_two_months','one_month','flexible',
      'one_to_two_months','three_to_six_months','flexible','three_to_six_months','one_month',
      'asap','one_to_two_months','one_to_two_months','flexible','asap'
    ]::public.lead_timeline[])[n],
    (array[
      'website_form','referral','email','website_form','referral',
      'manual','email','website_form','referral','manual',
      'website_form','referral','email','manual','website_form',
      'referral','email','manual','website_form','referral',
      'email','website_form','referral','manual','website_form',
      'website_form','referral','email','manual','referral'
    ]::public.lead_source[])[n],
    (array[
      'proposal','qualified','contacted','proposal','won',
      'qualified','contacted','new','proposal','qualified',
      'contacted','won','proposal','new','qualified',
      'contacted','new','proposal','lost','won',
      'qualified','contacted','proposal','new','qualified',
      'lost','contacted','new','new','lost'
    ]::public.lead_stage[])[n],
    case
      when n in (1,2,5,17,24,30) then 'urgent'::public.lead_priority
      when n in (3,4,6,7,8,9,10,11,13,15,18,21,23,27) then 'high'::public.lead_priority
      when n in (19,26) then 'low'::public.lead_priority
      else 'medium'::public.lead_priority
    end,
    (array[
      24000,42000,28000,12500,48000,9800,21000,11000,26000,13500,
      30000,15000,22500,6500,19500,14000,14500,15500,2500,7000,
      27000,13000,12000,52000,6200,5000,16500,10500,5800,29000
    ]::numeric[])[n],
    case when n = 29 then null when n = 30 then null
      else (array[
        94,91,88,86,96,82,80,79,84,81,
        87,85,83,72,78,74,76,82,31,73,
        89,77,80,92,70,28,84,75,68,71
      ]::smallint[])[n] end,
    case when n in (29,30) then null else greatest(38, least(94, 60 + (n * 7 % 35)))::smallint end,
    case
      when n in (19,26) then 'poor'::public.ai_service_fit
      when n in (14,16,20,22,25,28,29,30) then 'good'::public.ai_service_fit
      else 'excellent'::public.ai_service_fit
    end,
    case
      when n in (1,3,17,19,24,26,30) then 'high'::public.ai_urgency
      when n in (10,16,20,22,23) then 'low'::public.ai_urgency
      else 'medium'::public.ai_urgency
    end,
    case
      when n = 29 then 'pending'::public.ai_processing_status
      when n = 30 then 'failed'::public.ai_processing_status
      else 'completed'::public.ai_processing_status
    end,
    (n * 3) % 37
  from generate_series(1,30) n;

  insert into public.leads (
    workspace_id, full_name, email, company,
    project_type, budget_range, desired_timeline,
    description, website_url, source, stage, priority,
    assigned_to, is_unread, estimated_value,
    ai_score, ai_summary, ai_completeness_score,
    ai_processed_at, ai_status, ai_last_error,
    ai_input_updated_at, consent_given, consent_given_at,
    created_by, created_at, updated_at
  )
  select
    target_workspace_id,
    d.full_name,
    lower(replace(d.full_name, ' ', '.')) || '@demo.leaddesk.ai',
    d.company,
    d.project_type,
    d.budget_range,
    d.desired_timeline,
    d.company || ' needs a focused ' ||
      replace(d.project_type::text, '_', ' ') ||
      ' solution with clear business goals, responsive UX, secure access, and a practical first-release scope.',
    'https://' || lower(replace(replace(d.company, ' ', '-'), '&', 'and')) || '.example',
    d.source,
    d.stage,
    d.priority,
    case when d.position % 5 = 0 then null else target_owner_id end,
    d.position in (8,17,24,29,30),
    d.estimated_value,
    d.ai_score,
    case when d.ai_status = 'completed'
      then d.company || ' is a ' ||
        case when d.ai_score >= 85 then 'high-value, excellent-fit'
             when d.ai_score >= 70 then 'good-fit'
             else 'lower-fit' end ||
        ' opportunity with a clear need for ' ||
        replace(d.project_type::text, '_', ' ') || '.'
      else null end,
    d.completeness_score,
    case when d.ai_status = 'completed'
      then now() - make_interval(days => greatest(d.created_days_ago - 1,0))
      else null end,
    d.ai_status,
    case when d.ai_status = 'failed'
      then 'AI provider request timed out. Retry qualification.'
      else null end,
    now() - make_interval(days => d.created_days_ago),
    true,
    now() - make_interval(days => d.created_days_ago),
    target_owner_id,
    now() - make_interval(days => d.created_days_ago),
    now() - make_interval(days => greatest(d.created_days_ago - 1,0))
  from demo_input d;

  create temporary table demo_leads on commit drop as
  select
    d.*,
    l.id as lead_id,
    l.email as lead_email
  from demo_input d
  join public.leads l
    on l.workspace_id = target_workspace_id
   and l.email = lower(replace(d.full_name, ' ', '.')) || '@demo.leaddesk.ai';

  insert into public.lead_qualifications (
    workspace_id, lead_id, summary, score, completeness_score,
    priority, service_fit, urgency,
    extracted_project_type, extracted_services,
    extracted_budget, extracted_timeline,
    extracted_company_context, extracted_main_goal,
    missing_information, risks, score_breakdown,
    model, prompt_version, raw_response,
    created_at, updated_at
  )
  select
    target_workspace_id,
    d.lead_id,
    d.company || ' is a ' ||
      case when d.ai_score >= 85 then 'high-value opportunity with excellent service fit.'
           when d.ai_score >= 70 then 'good-fit opportunity suitable for structured discovery.'
           else 'lower-fit request that requires scope reduction.' end,
    d.ai_score,
    d.completeness_score,
    d.priority,
    d.service_fit,
    d.urgency,
    replace(d.project_type::text, '_', ' '),
    jsonb_build_array(
      replace(d.project_type::text, '_', ' '),
      'UX/UI design',
      'frontend development'
    ),
    replace(d.budget_range::text, '_', ' '),
    replace(d.desired_timeline::text, '_', ' '),
    d.company || ' is evaluating a digital product initiative.',
    'Launch a reliable product that improves the customer or operational workflow.',
    case when d.position % 3 = 0
      then '["Required integrations are not fully confirmed."]'::jsonb
      else '[]'::jsonb end,
    case when d.desired_timeline = 'asap'
      then '["The requested timeline requires strict scope control."]'::jsonb
      when d.budget_range = 'under_3000'
      then '["Budget is not aligned with the requested scope."]'::jsonb
      else '[]'::jsonb end,
    jsonb_build_object(
      'budget', greatest(4, least(25, round(d.ai_score * 0.24)::integer)),
      'timeline', greatest(2, least(15, round(d.ai_score * 0.14)::integer)),
      'completeness', greatest(1, least(20, round(d.completeness_score * 0.20)::integer)),
      'serviceFit', case d.service_fit
        when 'excellent' then 20 when 'good' then 16
        when 'partial' then 9 else 2 end,
      'urgency', case d.urgency
        when 'high' then 10 when 'medium' then 7 else 4 end,
      'descriptionQuality', greatest(2, least(10, round(d.completeness_score * 0.10)::integer)),
      'explanation', jsonb_build_array(
        'Budget and scope were evaluated against the selected project type.',
        'Completeness reflects the clarity of goals, budget, timeline, and context.',
        'Service fit reflects alignment with the studio capabilities.'
      )
    ),
    'portfolio-demo-model',
    'lead-qualification-v1',
    jsonb_build_object('seeded', true),
    now() - make_interval(days => greatest(d.created_days_ago - 1,0)),
    now() - make_interval(days => greatest(d.created_days_ago - 1,0))
  from demo_leads d
  where d.ai_status = 'completed';

  insert into public.lead_reply_drafts (
    workspace_id, lead_id, subject, body, status,
    generated_by_model, last_edited_by, created_at, updated_at
  )
  select
    target_workspace_id,
    d.lead_id,
    'Next steps for ' || d.company,
    'Hi ' || split_part(d.full_name, ' ', 1) || E',\n\n' ||
    'Thank you for sharing the details about ' || d.company || E'. ' ||
    'We understand the main goal and would like to confirm the required integrations, primary decision-maker, and most important launch outcome.\n\n' ||
    E'Once confirmed, we can recommend a focused discovery call and outline the best delivery path.\n\nBest,\nKINETIC Studio',
    case when d.position <= 6 then 'sent'::public.reply_draft_status
         when d.position % 4 = 0 then 'edited'::public.reply_draft_status
         else 'ai_generated'::public.reply_draft_status end,
    'portfolio-demo-model',
    case when d.position <= 6 or d.position % 4 = 0 then target_owner_id else null end,
    now() - make_interval(days => greatest(d.created_days_ago - 1,0)),
    now() - make_interval(days => greatest(d.created_days_ago - 1,0))
  from demo_leads d
  where d.ai_status = 'completed';

  insert into public.lead_notes (
    workspace_id, lead_id, author_id, content, created_at, updated_at
  )
  select
    target_workspace_id,
    d.lead_id,
    target_owner_id,
    case
      when d.stage = 'won' then 'Confirmed the project direction and recorded the kickoff next step.'
      when d.stage = 'lost' then 'Closed after reviewing budget, timeline, and MVP feasibility.'
      when d.stage = 'proposal' then 'Proposal preparation is underway. Validate integrations before sending.'
      else 'Reviewed the request and captured the key discovery questions.'
    end,
    now() - interval '2 days',
    now() - interval '2 days'
  from demo_leads d
  where d.position % 2 = 0;

  insert into public.lead_activities (
    workspace_id, lead_id, activity_type, actor_id, title, details, created_at
  )
  select
    target_workspace_id, d.lead_id, 'lead_created', null,
    'Lead created',
    jsonb_build_object('source', d.source, 'seeded', true),
    now() - make_interval(days => d.created_days_ago)
  from demo_leads d;

  insert into public.lead_activities (
    workspace_id, lead_id, activity_type, actor_id, title, details, created_at
  )
  select
    target_workspace_id, d.lead_id, 'ai_qualification_completed', null,
    'AI qualification completed',
    jsonb_build_object('score', d.ai_score, 'priority', d.priority, 'seeded', true),
    now() - make_interval(days => greatest(d.created_days_ago - 1,0))
  from demo_leads d
  where d.ai_status = 'completed';

  insert into public.lead_activities (
    workspace_id, lead_id, activity_type, actor_id, title, details, created_at
  )
  select
    target_workspace_id, d.lead_id, 'stage_changed', target_owner_id,
    'Stage changed',
    jsonb_build_object('from', 'new', 'to', d.stage, 'seeded', true),
    now() - make_interval(days => greatest(d.created_days_ago - 2,0))
  from demo_leads d
  where d.stage <> 'new';

  insert into public.tasks (
    workspace_id, lead_id, title, description, status,
    due_at, assigned_to, created_by, completed_at,
    created_at, updated_at
  )
  select
    target_workspace_id,
    d.lead_id,
    (array[
      'Prepare discovery agenda','Audit migration requirements','Send follow-up questions',
      'Finalize proposal scope','Prepare kickoff plan','Review sitemap',
      'Map approval workflow','Schedule discovery call','Validate inventory API',
      'Review content inventory','Define reporting MVP','Document product options',
      'Prepare portal estimate','Request content delivery plan','Retry AI qualification'
    ])[d.position],
    'Portfolio demo task linked to ' || d.company || '.',
    case
      when d.position in (5,10,12) then 'completed'::public.task_status
      when d.position in (1,4,7,11) then 'in_progress'::public.task_status
      else 'todo'::public.task_status
    end,
    now() + make_interval(days => (d.position % 7) - 2),
    target_owner_id,
    target_owner_id,
    case when d.position in (5,10,12) then now() - interval '1 day' else null end,
    now() - interval '3 days',
    now() - interval '1 day'
  from demo_leads d
  where d.position <= 15;

  insert into public.lead_email_deliveries (
    workspace_id, lead_id, draft_id, recipient_email,
    subject, body, provider, provider_message_id,
    status, sent_by, started_at, sent_at, created_at, updated_at
  )
  select
    target_workspace_id,
    d.lead_id,
    draft.id,
    d.lead_email,
    draft.subject,
    draft.body,
    'mock',
    'demo-message-' || d.position,
    'sent',
    target_owner_id,
    now() - interval '1 day',
    now() - interval '1 day',
    now() - interval '1 day',
    now() - interval '1 day'
  from demo_leads d
  join public.lead_reply_drafts draft
    on draft.lead_id = d.lead_id
   and draft.workspace_id = target_workspace_id
  where d.position <= 6;

  insert into public.lead_activities (
    workspace_id, lead_id, activity_type, actor_id, title, details, created_at
  )
  select
    target_workspace_id, d.lead_id, 'email_sent', target_owner_id,
    'Email sent',
    jsonb_build_object('provider', 'mock', 'seeded', true),
    now() - interval '1 day'
  from demo_leads d
  where d.position <= 6;

  raise notice 'LeadDesk AI demo seed completed';
end
$$;

commit;

-- Verification
select
  count(*) as demo_leads,
  count(*) filter (where stage = 'new') as new_leads,
  count(*) filter (where stage = 'qualified') as qualified_leads,
  count(*) filter (where stage = 'contacted') as contacted_leads,
  count(*) filter (where stage = 'proposal') as proposal_leads,
  count(*) filter (where stage = 'won') as won_leads,
  count(*) filter (where stage = 'lost') as lost_leads
from public.leads
where email like '%@demo.leaddesk.ai';

select
  (select count(*) from public.lead_qualifications q join public.leads l on l.id=q.lead_id where l.email like '%@demo.leaddesk.ai') as qualifications,
  (select count(*) from public.lead_reply_drafts d join public.leads l on l.id=d.lead_id where l.email like '%@demo.leaddesk.ai') as reply_drafts,
  (select count(*) from public.tasks t join public.leads l on l.id=t.lead_id where l.email like '%@demo.leaddesk.ai') as tasks,
  (select count(*) from public.lead_notes n join public.leads l on l.id=n.lead_id where l.email like '%@demo.leaddesk.ai') as notes,
  (select count(*) from public.lead_email_deliveries e join public.leads l on l.id=e.lead_id where l.email like '%@demo.leaddesk.ai') as sent_emails;
