create or replace function current_app_user_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth, storage
as $$
  select id
  from app_users
  where status = 'active'
    and (
      auth_user_id = auth.uid()
      or email = auth.jwt() ->> 'email'
    )
  limit 1
$$;

create or replace function current_app_user_role()
returns user_role
language sql
stable
security definer
set search_path = public, auth, storage
as $$
  select role
  from app_users
  where id = current_app_user_id()
  limit 1
$$;

create or replace function current_app_user_campus()
returns uuid
language sql
stable
security definer
set search_path = public, auth, storage
as $$
  select campus_id
  from app_users
  where id = current_app_user_id()
  limit 1
$$;

create or replace function current_app_user_team()
returns uuid
language sql
stable
security definer
set search_path = public, auth, storage
as $$
  select team_id
  from app_users
  where id = current_app_user_id()
  limit 1
$$;

create or replace function current_app_user_umkm()
returns uuid
language sql
stable
security definer
set search_path = public, auth, storage
as $$
  select umkm_id
  from app_users
  where id = current_app_user_id()
  limit 1
$$;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, auth, storage
as $$
  select coalesce(current_app_user_role() = 'admin'::user_role, false)
$$;

create or replace function is_service_role()
returns boolean
language sql
stable
security definer
set search_path = public, auth, storage
as $$
  select coalesce(auth.role() = 'service_role', false)
    or current_user in ('postgres', 'supabase_admin', 'service_role')
$$;

create or replace function can_access_team(target_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, storage
as $$
  select case
    when is_admin() then true
    when current_app_user_role() = 'juri'::user_role then true
    when current_app_user_role() in ('mahasiswa'::user_role, 'umkm'::user_role)
      then target_team_id = current_app_user_team()
    when current_app_user_role() = 'dosen'::user_role
      then exists (
        select 1
        from teams
        where teams.id = target_team_id
          and teams.campus_id = current_app_user_campus()
      )
    else false
  end
$$;

create or replace function can_access_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, auth, storage
as $$
  select case
    when is_admin() then true
    when target_user_id = current_app_user_id() then true
    when current_app_user_role() = 'dosen'::user_role
      then exists (
        select 1
        from app_users target_user
        where target_user.id = target_user_id
          and target_user.campus_id = current_app_user_campus()
      )
    when current_app_user_role() in ('mahasiswa'::user_role, 'umkm'::user_role)
      then exists (
        select 1
        from app_users target_user
        where target_user.id = target_user_id
          and target_user.team_id = current_app_user_team()
      )
    else false
  end
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = public, auth, storage
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function prevent_sensitive_app_user_updates()
returns trigger
language plpgsql
security definer
set search_path = public, auth, storage
as $$
begin
  if is_service_role() or is_admin() then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.auth_user_id is distinct from old.auth_user_id
    or new.email is distinct from old.email
    or new.role is distinct from old.role
    or new.campus_id is distinct from old.campus_id
    or new.umkm_id is distinct from old.umkm_id
    or new.team_id is distinct from old.team_id
    or new.status is distinct from old.status
  then
    raise exception 'SECURITY_VIOLATION: role, email, campus, team, UMKM, and status may only be changed by admin/server';
  end if;

  return new;
end;
$$;

create or replace function audit_table_change()
returns trigger
language plpgsql
security definer
set search_path = public, auth, storage
as $$
declare
  row_id uuid;
  actor_id uuid;
begin
  actor_id := current_app_user_id();
  row_id := coalesce(new.id, old.id);

  insert into audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (
    actor_id,
    coalesce(tg_argv[0], tg_op),
    tg_table_name,
    row_id,
    jsonb_build_object(
      'operation', tg_op,
      'old', case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
      'new', case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function haversine_distance_meters(
  lat1 numeric,
  lon1 numeric,
  lat2 numeric,
  lon2 numeric
)
returns numeric
language sql
immutable
as $$
  select 6371000 * 2 * asin(
    sqrt(
      power(sin(radians(($3 - $1) / 2)), 2)
      + cos(radians($1)) * cos(radians($3)) * power(sin(radians(($4 - $2) / 2)), 2)
    )
  )
$$;

drop trigger if exists enforce_app_user_security on app_users;
create trigger enforce_app_user_security
before update on app_users
for each row execute function prevent_sensitive_app_user_updates();

drop trigger if exists app_users_updated_at on app_users;
create trigger app_users_updated_at before update on app_users for each row execute function set_updated_at();

drop trigger if exists campuses_updated_at on campuses;
create trigger campuses_updated_at before update on campuses for each row execute function set_updated_at();

drop trigger if exists umkms_updated_at on umkms;
create trigger umkms_updated_at before update on umkms for each row execute function set_updated_at();

drop trigger if exists teams_updated_at on teams;
create trigger teams_updated_at before update on teams for each row execute function set_updated_at();

drop trigger if exists courses_updated_at on courses;
create trigger courses_updated_at before update on courses for each row execute function set_updated_at();

drop trigger if exists sessions_updated_at on sessions;
create trigger sessions_updated_at before update on sessions for each row execute function set_updated_at();

drop trigger if exists attendance_sessions_updated_at on attendance_sessions;
create trigger attendance_sessions_updated_at before update on attendance_sessions for each row execute function set_updated_at();

drop trigger if exists attendance_updated_at on attendance;
create trigger attendance_updated_at before update on attendance for each row execute function set_updated_at();

drop trigger if exists weekly_reports_updated_at on weekly_reports;
create trigger weekly_reports_updated_at before update on weekly_reports for each row execute function set_updated_at();

drop trigger if exists weekly_report_comments_updated_at on weekly_report_comments;
create trigger weekly_report_comments_updated_at before update on weekly_report_comments for each row execute function set_updated_at();

drop trigger if exists outputs_updated_at on outputs;
create trigger outputs_updated_at before update on outputs for each row execute function set_updated_at();

drop trigger if exists challenge_categories_updated_at on challenge_categories;
create trigger challenge_categories_updated_at before update on challenge_categories for each row execute function set_updated_at();

drop trigger if exists scores_updated_at on scores;
create trigger scores_updated_at before update on scores for each row execute function set_updated_at();

drop trigger if exists report_jobs_updated_at on report_jobs;
create trigger report_jobs_updated_at before update on report_jobs for each row execute function set_updated_at();

drop trigger if exists notifications_updated_at on notifications;
create trigger notifications_updated_at before update on notifications for each row execute function set_updated_at();

drop trigger if exists app_settings_updated_at on app_settings;
create trigger app_settings_updated_at before update on app_settings for each row execute function set_updated_at();

drop trigger if exists audit_attendance_session on attendance_sessions;
create trigger audit_attendance_session after insert or update on attendance_sessions for each row execute function audit_table_change('attendance_session_change');

drop trigger if exists audit_attendance_token on attendance_tokens;
create trigger audit_attendance_token after insert on attendance_tokens for each row execute function audit_table_change('attendance_token_created');

drop trigger if exists audit_attendance on attendance;
create trigger audit_attendance after insert or update on attendance for each row execute function audit_table_change('attendance_change');

drop trigger if exists audit_weekly_report on weekly_reports;
create trigger audit_weekly_report after insert or update on weekly_reports for each row execute function audit_table_change('weekly_report_change');

drop trigger if exists audit_output on outputs;
create trigger audit_output after insert or update on outputs for each row execute function audit_table_change('output_change');

drop trigger if exists audit_score on scores;
create trigger audit_score after insert or update on scores for each row execute function audit_table_change('score_change');

drop trigger if exists audit_role_change on app_users;
create trigger audit_role_change after update of role, campus_id, team_id, umkm_id, status on app_users for each row execute function audit_table_change('user_access_change');

drop trigger if exists audit_pairing_change on teams;
create trigger audit_pairing_change after update of campus_id, umkm_id, lecturer_id on teams for each row execute function audit_table_change('team_pairing_change');
