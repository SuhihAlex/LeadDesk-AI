create type public.task_status as enum (
  'todo',
  'in_progress',
  'completed'
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  lead_id uuid
    references public.leads(id) on delete cascade,

  title text not null,
  description text,

  status public.task_status not null default 'todo',

  due_at timestamptz,

  assigned_to uuid
    references public.profiles(id) on delete set null,

  created_by uuid not null
    references public.profiles(id) on delete restrict,

  completed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint tasks_title_length
    check (
      char_length(trim(title)) between 1 and 240
    ),

  constraint tasks_description_length
    check (
      description is null
      or char_length(trim(description)) between 1 and 5000
    ),

  constraint tasks_completion_consistency
    check (
      (
        status = 'completed'
        and completed_at is not null
      )
      or
      (
        status <> 'completed'
        and completed_at is null
      )
    )
);

create index tasks_workspace_created_at_idx
  on public.tasks(workspace_id, created_at desc);

create index tasks_workspace_status_idx
  on public.tasks(workspace_id, status);

create index tasks_workspace_assigned_to_idx
  on public.tasks(workspace_id, assigned_to);

create index tasks_workspace_due_at_idx
  on public.tasks(workspace_id, due_at)
  where due_at is not null;

create index tasks_lead_created_at_idx
  on public.tasks(lead_id, created_at desc)
  where lead_id is not null;

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

create or replace function public.validate_task_workspace()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_workspace_id uuid;
begin
  if new.lead_id is not null then
    select leads.workspace_id
    into parent_workspace_id
    from public.leads
    where leads.id = new.lead_id;

    if parent_workspace_id is null then
      raise exception 'Lead does not exist'
        using errcode = '23503';
    end if;

    if parent_workspace_id <> new.workspace_id then
      raise exception 'Task workspace does not match lead workspace'
        using errcode = '23514';
    end if;
  end if;

  if not exists (
    select 1
    from public.workspace_members
    where workspace_members.workspace_id = new.workspace_id
      and workspace_members.user_id = new.created_by
  ) then
    raise exception 'Task creator is not a workspace member'
      using errcode = '23503';
  end if;

  if new.assigned_to is not null
    and not exists (
      select 1
      from public.workspace_members
      where workspace_members.workspace_id = new.workspace_id
        and workspace_members.user_id = new.assigned_to
    )
  then
    raise exception 'Task assignee is not a workspace member'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create trigger tasks_validate_workspace
before insert or update of
  workspace_id,
  lead_id,
  created_by,
  assigned_to
on public.tasks
for each row
execute function public.validate_task_workspace();

alter table public.tasks
enable row level security;

create policy "tasks_select_workspace_members"
on public.tasks
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

create policy "tasks_insert_workspace_members"
on public.tasks
for insert
to authenticated
with check (
  public.is_workspace_member(workspace_id)
  and created_by = (select auth.uid())
);

create policy "tasks_update_workspace_members"
on public.tasks
for update
to authenticated
using (
  public.is_workspace_member(workspace_id)
)
with check (
  public.is_workspace_member(workspace_id)
);

create policy "tasks_delete_workspace_members"
on public.tasks
for delete
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

revoke all
on table public.tasks
from anon;

grant select, insert, update, delete
on table public.tasks
to authenticated;

create or replace function public.create_lead_task(
  target_lead_id uuid,
  task_title text,
  task_description text default null,
  task_due_at timestamptz default null,
  target_assignee_id uuid default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  created_task_id uuid;
  normalized_title text;
  normalized_description text;
begin
  normalized_title := trim(task_title);
  normalized_description := nullif(trim(task_description), '');

  if char_length(normalized_title) < 1
    or char_length(normalized_title) > 240
  then
    raise exception 'Task title length is invalid'
      using errcode = '22023';
  end if;

  if normalized_description is not null
    and char_length(normalized_description) > 5000
  then
    raise exception 'Task description length is invalid'
      using errcode = '22023';
  end if;

  select leads.workspace_id
  into target_workspace_id
  from public.leads
  where leads.id = target_lead_id
    and public.is_workspace_member(leads.workspace_id);

  if target_workspace_id is null then
    raise exception 'Lead not found or access denied'
      using errcode = 'P0002';
  end if;

  if target_assignee_id is not null
    and not exists (
      select 1
      from public.workspace_members
      where workspace_members.workspace_id = target_workspace_id
        and workspace_members.user_id = target_assignee_id
    )
  then
    raise exception 'Task assignee is not a workspace member'
      using errcode = '23503';
  end if;

  insert into public.tasks (
    workspace_id,
    lead_id,
    title,
    description,
    status,
    due_at,
    assigned_to,
    created_by
  )
  values (
    target_workspace_id,
    target_lead_id,
    normalized_title,
    normalized_description,
    'todo',
    task_due_at,
    target_assignee_id,
    (select auth.uid())
  )
  returning id
  into created_task_id;

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
    'task_created',
    (select auth.uid()),
    'Task created',
    jsonb_build_object(
      'taskId',
      created_task_id,
      'taskTitle',
      normalized_title,
      'assigneeId',
      target_assignee_id,
      'dueAt',
      task_due_at
    )
  );

  return created_task_id;
end;
$$;

revoke all
on function public.create_lead_task(
  uuid,
  text,
  text,
  timestamptz,
  uuid
)
from public;

grant execute
on function public.create_lead_task(
  uuid,
  text,
  text,
  timestamptz,
  uuid
)
to authenticated;

create or replace function public.set_task_status(
  target_task_id uuid,
  target_status public.task_status
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  target_lead_id uuid;
  current_status public.task_status;
  target_task_title text;
begin
  select
    tasks.workspace_id,
    tasks.lead_id,
    tasks.status,
    tasks.title
  into
    target_workspace_id,
    target_lead_id,
    current_status,
    target_task_title
  from public.tasks
  where tasks.id = target_task_id
    and public.is_workspace_member(tasks.workspace_id);

  if target_workspace_id is null then
    raise exception 'Task not found or access denied'
      using errcode = 'P0002';
  end if;

  if current_status is not distinct from target_status then
    return false;
  end if;

  update public.tasks
  set
    status = target_status,
    completed_at = case
      when target_status = 'completed'
        then now()
      else null
    end
  where id = target_task_id
    and workspace_id = target_workspace_id;

  if target_lead_id is not null
    and target_status = 'completed'
  then
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
      'task_completed',
      (select auth.uid()),
      'Task completed',
      jsonb_build_object(
        'taskId',
        target_task_id,
        'taskTitle',
        target_task_title,
        'previousStatus',
        current_status,
        'status',
        target_status
      )
    );
  end if;

  return true;
end;
$$;

revoke all
on function public.set_task_status(
  uuid,
  public.task_status
)
from public;

grant execute
on function public.set_task_status(
  uuid,
  public.task_status
)
to authenticated;