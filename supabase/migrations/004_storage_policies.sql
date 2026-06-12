insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'attendance-photos',
  'attendance-photos',
  false,
  3145728,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists attendance_photos_admin_all on storage.objects;
create policy attendance_photos_admin_all on storage.objects for all to authenticated
using (
  bucket_id = 'attendance-photos'
  and is_admin()
)
with check (
  bucket_id = 'attendance-photos'
  and is_admin()
);

drop policy if exists attendance_photos_student_own_select on storage.objects;
create policy attendance_photos_student_own_select on storage.objects for select to authenticated
using (
  bucket_id = 'attendance-photos'
  and exists (
    select 1
    from attendance a
    where a.photo_path = storage.objects.name
      and a.user_id = current_app_user_id()
  )
);

drop policy if exists attendance_photos_dosen_campus_select on storage.objects;
create policy attendance_photos_dosen_campus_select on storage.objects for select to authenticated
using (
  bucket_id = 'attendance-photos'
  and current_app_user_role() = 'dosen'::user_role
  and exists (
    select 1
    from attendance a
    join app_users attended_user on attended_user.id = a.user_id
    where a.photo_path = storage.objects.name
      and attended_user.campus_id = current_app_user_campus()
  )
);

drop policy if exists attendance_photos_umkm_team_select on storage.objects;
create policy attendance_photos_umkm_team_select on storage.objects for select to authenticated
using (
  bucket_id = 'attendance-photos'
  and current_app_user_role() = 'umkm'::user_role
  and exists (
    select 1
    from attendance a
    join app_users attended_user on attended_user.id = a.user_id
    where a.photo_path = storage.objects.name
      and attended_user.team_id = current_app_user_team()
  )
);
