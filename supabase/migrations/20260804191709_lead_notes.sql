create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),

  workspace_id uuid not null
    references public.workspaces(id) on delete cascade,

  lead_id uuid not null
    references public.leads(id) on delete cascade,

  author_id uuid not null
    references public.profiles(id) on delete restrict,

  content text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint lead_notes_content_length
    check (
      char_length(trim(content)) between 1 and 5000
    )
);

create index lead_notes_lead_created_at_idx
  on public.lead_notes(lead_id, created_at desc);

create index lead_notes_workspace_created_at_idx
  on public.lead_notes(workspace_id, created_at desc);

create trigger lead_notes_set_updated_at
before update on public.lead_notes
for each row
execute function public.set_updated_at();

create or replace function public.validate_lead_note_workspace()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  parent_workspace_id uuid;
begin
  select leads.workspace_id
  into parent_workspace_id
  from public.leads
  where leads.id = new.lead_id;

  if parent_workspace_id is null then
    raise exception 'Lead does not exist'
      using errcode = '23503';
  end if;

  if parent_workspace_id <> new.workspace_id then
    raise exception 'Note workspace does not match lead workspace'
      using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.workspace_members
    where workspace_members.workspace_id = new.workspace_id
      and workspace_members.user_id = new.author_id
  ) then
    raise exception 'Note author is not a workspace member'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create trigger lead_notes_validate_workspace
before insert or update of workspace_id, lead_id, author_id
on public.lead_notes
for each row
execute function public.validate_lead_note_workspace();

alter table public.lead_notes
enable row level security;

create policy "lead_notes_select_workspace_members"
on public.lead_notes
for select
to authenticated
using (
  public.is_workspace_member(workspace_id)
);

create policy "lead_notes_insert_workspace_members"
on public.lead_notes
for insert
to authenticated
with check (
  public.is_workspace_member(workspace_id)
  and author_id = (select auth.uid())
);

create policy "lead_notes_update_authors"
on public.lead_notes
for update
to authenticated
using (
  public.is_workspace_member(workspace_id)
  and author_id = (select auth.uid())
)
with check (
  public.is_workspace_member(workspace_id)
  and author_id = (select auth.uid())
);

create policy "lead_notes_delete_authors"
on public.lead_notes
for delete
to authenticated
using (
  public.is_workspace_member(workspace_id)
  and author_id = (select auth.uid())
);

revoke all
on table public.lead_notes
from anon;

grant select, insert, update, delete
on table public.lead_notes
to authenticated;

create or replace function public.create_lead_note(
  target_lead_id uuid,
  note_content text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  target_workspace_id uuid;
  created_note_id uuid;
  normalized_content text;
begin
  normalized_content := trim(note_content);

  if char_length(normalized_content) < 1
    or char_length(normalized_content) > 5000
  then
    raise exception 'Note content length is invalid'
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

  insert into public.lead_notes (
    workspace_id,
    lead_id,
    author_id,
    content
  )
  values (
    target_workspace_id,
    target_lead_id,
    (select auth.uid()),
    normalized_content
  )
  returning id
  into created_note_id;

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
    'note_added',
    (select auth.uid()),
    'Note added',
    jsonb_build_object(
      'noteId',
      created_note_id
    )
  );

  return created_note_id;
end;
$$;

revoke all
on function public.create_lead_note(uuid, text)
from public;

grant execute
on function public.create_lead_note(uuid, text)
to authenticated;