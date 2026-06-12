alter table app_users enable row level security;
alter table campuses enable row level security;
alter table umkms enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table courses enable row level security;
alter table sessions enable row level security;
alter table attendance_sessions enable row level security;
alter table attendance_tokens enable row level security;
alter table attendance enable row level security;
alter table weekly_reports enable row level security;
alter table weekly_report_comments enable row level security;
alter table outputs enable row level security;
alter table output_link_checks enable row level security;
alter table challenge_categories enable row level security;
alter table scores enable row level security;
alter table report_jobs enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
alter table app_settings enable row level security;

drop policy if exists app_users_admin_all on app_users;
create policy app_users_admin_all on app_users for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists app_users_self_select on app_users;
create policy app_users_self_select on app_users for select to authenticated
using (id = current_app_user_id());

drop policy if exists app_users_self_profile_update on app_users;
create policy app_users_self_profile_update on app_users for update to authenticated
using (id = current_app_user_id())
with check (id = current_app_user_id());

drop policy if exists app_users_dosen_campus_select on app_users;
create policy app_users_dosen_campus_select on app_users for select to authenticated
using (
  current_app_user_role() = 'dosen'::user_role
  and campus_id = current_app_user_campus()
);

drop policy if exists app_users_team_select on app_users;
create policy app_users_team_select on app_users for select to authenticated
using (
  current_app_user_role() in ('mahasiswa'::user_role, 'umkm'::user_role)
  and team_id = current_app_user_team()
);

drop policy if exists campuses_admin_all on campuses;
create policy campuses_admin_all on campuses for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists campuses_scoped_select on campuses;
create policy campuses_scoped_select on campuses for select to authenticated
using (
  is_admin()
  or current_app_user_role() = 'juri'::user_role
  or id = current_app_user_campus()
  or exists (
    select 1 from teams
    where teams.campus_id = campuses.id
      and teams.id = current_app_user_team()
  )
);

drop policy if exists umkms_admin_all on umkms;
create policy umkms_admin_all on umkms for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists umkms_scoped_select on umkms;
create policy umkms_scoped_select on umkms for select to authenticated
using (
  is_admin()
  or current_app_user_role() = 'juri'::user_role
  or id = current_app_user_umkm()
  or exists (
    select 1 from teams
    where teams.umkm_id = umkms.id
      and (
        teams.id = current_app_user_team()
        or (
          current_app_user_role() = 'dosen'::user_role
          and teams.campus_id = current_app_user_campus()
        )
      )
  )
);

drop policy if exists teams_admin_all on teams;
create policy teams_admin_all on teams for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists teams_scoped_select on teams;
create policy teams_scoped_select on teams for select to authenticated
using (
  is_admin()
  or current_app_user_role() = 'juri'::user_role
  or id = current_app_user_team()
  or (
    current_app_user_role() = 'dosen'::user_role
    and campus_id = current_app_user_campus()
  )
);

drop policy if exists team_members_admin_all on team_members;
create policy team_members_admin_all on team_members for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists team_members_scoped_select on team_members;
create policy team_members_scoped_select on team_members for select to authenticated
using (can_access_team(team_id));

drop policy if exists courses_admin_all on courses;
create policy courses_admin_all on courses for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists courses_authenticated_select on courses;
create policy courses_authenticated_select on courses for select to authenticated
using (current_app_user_role() is not null);

drop policy if exists sessions_admin_all on sessions;
create policy sessions_admin_all on sessions for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists sessions_authenticated_select on sessions;
create policy sessions_authenticated_select on sessions for select to authenticated
using (current_app_user_role() is not null);

drop policy if exists attendance_sessions_admin_all on attendance_sessions;
create policy attendance_sessions_admin_all on attendance_sessions for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists attendance_sessions_active_select on attendance_sessions;
create policy attendance_sessions_active_select on attendance_sessions for select to authenticated
using (
  is_admin()
  or (
    is_active
    and current_app_user_role() in ('mahasiswa'::user_role, 'dosen'::user_role)
  )
);

drop policy if exists attendance_tokens_admin_only on attendance_tokens;
create policy attendance_tokens_admin_only on attendance_tokens for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists attendance_admin_all on attendance;
create policy attendance_admin_all on attendance for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists attendance_student_own_select on attendance;
create policy attendance_student_own_select on attendance for select to authenticated
using (user_id = current_app_user_id());

drop policy if exists attendance_dosen_campus_select on attendance;
create policy attendance_dosen_campus_select on attendance for select to authenticated
using (
  current_app_user_role() = 'dosen'::user_role
  and exists (
    select 1
    from app_users attended_user
    where attended_user.id = attendance.user_id
      and attended_user.campus_id = current_app_user_campus()
  )
);

drop policy if exists attendance_umkm_team_select on attendance;
create policy attendance_umkm_team_select on attendance for select to authenticated
using (
  current_app_user_role() = 'umkm'::user_role
  and exists (
    select 1
    from app_users attended_user
    where attended_user.id = attendance.user_id
      and attended_user.team_id = current_app_user_team()
  )
);

drop policy if exists weekly_reports_admin_all on weekly_reports;
create policy weekly_reports_admin_all on weekly_reports for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists weekly_reports_scoped_select on weekly_reports;
create policy weekly_reports_scoped_select on weekly_reports for select to authenticated
using (can_access_team(team_id));

drop policy if exists weekly_reports_student_insert on weekly_reports;
create policy weekly_reports_student_insert on weekly_reports for insert to authenticated
with check (
  current_app_user_role() = 'mahasiswa'::user_role
  and team_id = current_app_user_team()
);

drop policy if exists weekly_reports_dosen_update on weekly_reports;
create policy weekly_reports_dosen_update on weekly_reports for update to authenticated
using (
  current_app_user_role() = 'dosen'::user_role
  and can_access_team(team_id)
)
with check (
  current_app_user_role() = 'dosen'::user_role
  and can_access_team(team_id)
);

drop policy if exists weekly_report_comments_admin_all on weekly_report_comments;
create policy weekly_report_comments_admin_all on weekly_report_comments for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists weekly_report_comments_scoped_select on weekly_report_comments;
create policy weekly_report_comments_scoped_select on weekly_report_comments for select to authenticated
using (
  exists (
    select 1
    from weekly_reports wr
    where wr.id = weekly_report_comments.weekly_report_id
      and can_access_team(wr.team_id)
  )
);

drop policy if exists weekly_report_comments_scoped_insert on weekly_report_comments;
create policy weekly_report_comments_scoped_insert on weekly_report_comments for insert to authenticated
with check (
  author_id = current_app_user_id()
  and exists (
    select 1
    from weekly_reports wr
    where wr.id = weekly_report_comments.weekly_report_id
      and can_access_team(wr.team_id)
  )
);

drop policy if exists outputs_admin_all on outputs;
create policy outputs_admin_all on outputs for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists outputs_scoped_select on outputs;
create policy outputs_scoped_select on outputs for select to authenticated
using (
  can_access_team(team_id)
  or current_app_user_role() = 'juri'::user_role
);

drop policy if exists outputs_student_insert on outputs;
create policy outputs_student_insert on outputs for insert to authenticated
with check (
  current_app_user_role() = 'mahasiswa'::user_role
  and team_id = current_app_user_team()
);

drop policy if exists outputs_umkm_feedback_update on outputs;
create policy outputs_umkm_feedback_update on outputs for update to authenticated
using (
  current_app_user_role() = 'umkm'::user_role
  and team_id = current_app_user_team()
)
with check (
  current_app_user_role() = 'umkm'::user_role
  and team_id = current_app_user_team()
);

drop policy if exists output_link_checks_admin_all on output_link_checks;
create policy output_link_checks_admin_all on output_link_checks for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists output_link_checks_scoped_select on output_link_checks;
create policy output_link_checks_scoped_select on output_link_checks for select to authenticated
using (
  exists (
    select 1
    from outputs o
    where o.id = output_link_checks.output_id
      and (can_access_team(o.team_id) or current_app_user_role() = 'juri'::user_role)
  )
);

drop policy if exists challenge_categories_admin_all on challenge_categories;
create policy challenge_categories_admin_all on challenge_categories for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists challenge_categories_authenticated_select on challenge_categories;
create policy challenge_categories_authenticated_select on challenge_categories for select to authenticated
using (current_app_user_role() is not null and is_active);

drop policy if exists scores_admin_all on scores;
create policy scores_admin_all on scores for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists scores_juri_select on scores;
create policy scores_juri_select on scores for select to authenticated
using (
  current_app_user_role() = 'juri'::user_role
  or can_access_team(team_id)
);

drop policy if exists scores_juri_write on scores;
create policy scores_juri_write on scores for insert to authenticated
with check (
  current_app_user_role() = 'juri'::user_role
  and judge_id = current_app_user_id()
);

drop policy if exists scores_juri_update on scores;
create policy scores_juri_update on scores for update to authenticated
using (
  current_app_user_role() = 'juri'::user_role
  and judge_id = current_app_user_id()
)
with check (
  current_app_user_role() = 'juri'::user_role
  and judge_id = current_app_user_id()
);

drop policy if exists report_jobs_admin_only on report_jobs;
create policy report_jobs_admin_only on report_jobs for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists notifications_admin_all on notifications;
create policy notifications_admin_all on notifications for all to authenticated
using (is_admin())
with check (is_admin());

drop policy if exists notifications_own_select_update on notifications;
create policy notifications_own_select_update on notifications for select to authenticated
using (user_id = current_app_user_id());

drop policy if exists notifications_own_mark_read on notifications;
create policy notifications_own_mark_read on notifications for update to authenticated
using (user_id = current_app_user_id())
with check (user_id = current_app_user_id());

drop policy if exists audit_logs_admin_only on audit_logs;
create policy audit_logs_admin_only on audit_logs for select to authenticated
using (is_admin());

drop policy if exists app_settings_admin_only on app_settings;
create policy app_settings_admin_only on app_settings for all to authenticated
using (is_admin())
with check (is_admin());
