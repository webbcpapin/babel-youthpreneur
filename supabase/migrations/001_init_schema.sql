create extension if not exists pgcrypto;

do $$
begin
  create type user_role as enum ('admin', 'dosen', 'mahasiswa', 'umkm', 'juri');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type team_status as enum ('aman', 'perlu_perhatian', 'kritis');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type output_type as enum ('calendar', 'content', 'video', 'landing_page', 'report', 'presentation', 'drive_folder');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type attendance_status as enum (
    'valid',
    'pending_review',
    'pending_sync',
    'flagged_location',
    'expired_qr',
    'duplicate_attempt',
    'rejected'
  );
exception when duplicate_object then null;
end $$;

do $$
begin
  create type link_check_status as enum ('pending', 'accessible', 'restricted', 'invalid', 'unreachable');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type job_status as enum ('queued', 'running', 'completed', 'failed');
exception when duplicate_object then null;
end $$;

create table if not exists campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  pic text,
  contact text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists umkms (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  owner_name text,
  whatsapp text,
  category text,
  address text,
  regency text,
  priority_need text,
  curation_status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  role user_role not null default 'mahasiswa',
  campus_id uuid references campuses(id) on delete set null,
  umkm_id uuid references umkms(id) on delete set null,
  team_id uuid null,
  status text not null default 'active',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  campus_id uuid not null references campuses(id) on delete cascade,
  umkm_id uuid references umkms(id) on delete set null,
  lecturer_id uuid references app_users(id) on delete set null,
  status team_status not null default 'aman',
  progress int not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table app_users
  drop constraint if exists app_users_team_fk;

alter table app_users
  add constraint app_users_team_fk foreign key (team_id) references teams(id) on delete set null;

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  member_role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (team_id, user_id)
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  session_date date not null,
  start_time time not null,
  end_time time not null,
  location_name text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  radius_meters int not null default 150 check (radius_meters > 0),
  qr_token text unique,
  qr_active_from timestamptz,
  qr_active_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  location_name text not null,
  latitude numeric(10, 8) not null,
  longitude numeric(11, 8) not null,
  radius_meters int not null default 150 check (radius_meters > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  is_active boolean not null default true,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create unique index if not exists attendance_sessions_one_active_per_session
  on attendance_sessions (session_id)
  where is_active;

create table if not exists attendance_tokens (
  id uuid primary key default gen_random_uuid(),
  attendance_session_id uuid not null references attendance_sessions(id) on delete cascade,
  nonce text not null unique,
  token_hash text not null unique,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (expires_at > issued_at)
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  attendance_session_id uuid references attendance_sessions(id) on delete set null,
  user_id uuid not null references app_users(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  submitted_at timestamptz not null default now(),
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  distance_meters numeric(12, 2),
  photo_url text,
  photo_path text,
  photo_hash text,
  photo_size_bytes int,
  user_agent text,
  device_fingerprint text,
  ip_address inet,
  qr_nonce text,
  token_issued_at timestamptz,
  token_expires_at timestamptz,
  validation_status attendance_status not null default 'pending_review',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists attendance_unique_session_user
  on attendance (session_id, user_id);

create unique index if not exists attendance_unique_attendance_session_user
  on attendance (attendance_session_id, user_id)
  where attendance_session_id is not null;

create table if not exists weekly_reports (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  week_number int not null check (week_number between 1 and 16),
  activity_date date,
  activities text not null,
  progress text not null,
  obstacles text,
  next_plan text,
  drive_link text,
  publication_link text,
  lecturer_note text,
  admin_note text,
  lecturer_validation_status text not null default 'pending' check (lecturer_validation_status in ('pending', 'validated', 'revision')),
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, week_number)
);

create table if not exists weekly_report_comments (
  id uuid primary key default gen_random_uuid(),
  weekly_report_id uuid not null references weekly_reports(id) on delete cascade,
  author_id uuid not null references app_users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists outputs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  output_type output_type not null,
  title text not null,
  google_drive_link text,
  publication_link text,
  link_check_status link_check_status not null default 'pending',
  link_checked_at timestamptz,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'revision')),
  umkm_feedback text,
  admin_note text,
  created_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists output_link_checks (
  id uuid primary key default gen_random_uuid(),
  output_id uuid not null references outputs(id) on delete cascade,
  checked_url text not null,
  status link_check_status not null,
  http_status int,
  content_type text,
  metadata jsonb not null default '{}'::jsonb,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists challenge_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  max_score int not null default 100 check (max_score > 0),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references teams(id) on delete cascade,
  category text not null,
  score int not null check (score between 1 and 100),
  judge_id uuid references app_users(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (team_id, category, judge_id)
);

create table if not exists report_jobs (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid references app_users(id) on delete set null,
  report_type text not null check (report_type in ('excel', 'pdf')),
  status job_status not null default 'queued',
  storage_path text,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references app_users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists app_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_by uuid references app_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_users_email on app_users (email);
create index if not exists idx_app_users_role on app_users (role);
create index if not exists idx_app_users_campus on app_users (campus_id);
create index if not exists idx_app_users_team on app_users (team_id);
create index if not exists idx_teams_campus on teams (campus_id);
create index if not exists idx_teams_umkm on teams (umkm_id);
create index if not exists idx_team_members_team on team_members (team_id);
create index if not exists idx_sessions_course on sessions (course_id);
create index if not exists idx_attendance_session on attendance (session_id);
create index if not exists idx_attendance_user on attendance (user_id);
create index if not exists idx_weekly_reports_team on weekly_reports (team_id);
create index if not exists idx_outputs_team on outputs (team_id);
create index if not exists idx_scores_team on scores (team_id);
create index if not exists idx_notifications_user on notifications (user_id);
create index if not exists idx_audit_logs_entity on audit_logs (entity_type, entity_id);
