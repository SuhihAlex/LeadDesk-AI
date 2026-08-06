insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'workspace-logos',
  'workspace-logos',
  true,
  2097152,
  array[
    'image/png',
    'image/jpeg',
    'image/webp'
  ]
)
on conflict (id)
do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


create policy "workspace_logos_public_read"
on storage.objects
for select
to public
using (
  bucket_id = 'workspace-logos'
);


create policy "workspace_logos_owner_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'workspace-logos'
  and (storage.foldername(name))[1] in (
    select workspace_members.workspace_id::text
    from public.workspace_members
    where workspace_members.user_id = auth.uid()
      and workspace_members.role = 'owner'
  )
);


create policy "workspace_logos_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'workspace-logos'
  and (storage.foldername(name))[1] in (
    select workspace_members.workspace_id::text
    from public.workspace_members
    where workspace_members.user_id = auth.uid()
      and workspace_members.role = 'owner'
  )
)
with check (
  bucket_id = 'workspace-logos'
  and (storage.foldername(name))[1] in (
    select workspace_members.workspace_id::text
    from public.workspace_members
    where workspace_members.user_id = auth.uid()
      and workspace_members.role = 'owner'
  )
);


create policy "workspace_logos_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'workspace-logos'
  and (storage.foldername(name))[1] in (
    select workspace_members.workspace_id::text
    from public.workspace_members
    where workspace_members.user_id = auth.uid()
      and workspace_members.role = 'owner'
  )
);