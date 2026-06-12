create extension if not exists pgcrypto;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  role text not null check (role in ('admin','dosen','mahasiswa','umkm','juri')),
  campus_id uuid null,
  umkm_id uuid null,
  team_id uuid null,
  status text default 'active',
  created_at timestamptz default now()
);

create table if not exists campuses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pic text,
  contact text,
  address text,
  created_at timestamptz default now()
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
  curation_status text default 'draft',
  created_at timestamptz default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  campus_id uuid references campuses(id) on delete set null,
  umkm_id uuid references umkms(id) on delete set null,
  lecturer_id uuid null,
  status text default 'aman' check (status in ('aman','perlu_perhatian','kritis')),
  progress int default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz default now()
);

alter table app_users add constraint app_users_campus_fk foreign key (campus_id) references campuses(id) on delete set null;
alter table app_users add constraint app_users_umkm_fk foreign key (umkm_id) references umkms(id) on delete set null;
alter table app_users add constraint app_users_team_fk foreign key (team_id) references teams(id) on delete set null;
alter table teams add constraint teams_lecturer_fk foreign key (lecturer_id) references app_users(id) on delete set null;

create table if not exists team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  user_id uuid references app_users(id) on delete cascade,
  member_role text default 'member',
  unique(team_id, user_id)
);

create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  start_date date,
  end_date date,
  created_at timestamptz default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  title text not null,
  session_date date not null,
  start_time time not null,
  end_time time not null,
  location_name text,
  qr_token text unique not null default encode(gen_random_bytes(16), 'hex'),
  qr_active_from timestamptz,
  qr_active_until timestamptz,
  created_at timestamptz default now()
);

create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  user_id uuid references app_users(id) on delete cascade,
  scanned_at timestamptz not null default now(),
  latitude numeric,
  longitude numeric,
  photo_url text,
  validation_status text default 'pending' check (validation_status in ('pending','valid','rejected')),
  admin_note text,
  created_at timestamptz default now(),
  unique(session_id, user_id)
);

create table if not exists weekly_reports (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  week_number int not null,
  activity_date date,
  activities text not null,
  progress text not null,
  obstacles text,
  next_plan text,
  drive_link text,
  publication_link text,
  lecturer_note text,
  admin_note text,
  lecturer_validation_status text default 'pending' check (lecturer_validation_status in ('pending','validated','revision')),
  created_at timestamptz default now(),
  unique(team_id, week_number)
);

create table if not exists outputs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  output_type text not null check (output_type in ('calendar','content','video','landing_page','report','presentation','drive_folder')),
  title text not null,
  google_drive_link text,
  publication_link text,
  status text default 'draft' check (status in ('draft','submitted','approved','revision')),
  umkm_feedback text,
  admin_note text,
  created_at timestamptz default now()
);

create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  category text not null,
  score int not null check (score >= 1 and score <= 100),
  judge_id uuid references app_users(id) on delete set null,
  note text,
  created_at timestamptz default now()
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references app_users(id) on delete cascade,
  title text not null,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table app_users enable row level security;
alter table campuses enable row level security;
alter table umkms enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table courses enable row level security;
alter table sessions enable row level security;
alter table attendance enable row level security;
alter table weekly_reports enable row level security;
alter table outputs enable row level security;
alter table scores enable row level security;
alter table notifications enable row level security;

create or replace function current_app_user_role()
returns text language sql stable as $$
  select role from app_users where email = auth.jwt() ->> 'email' and status = 'active' limit 1
$$;

create or replace function current_app_user_id()
returns uuid language sql stable as $$
  select id from app_users where email = auth.jwt() ->> 'email' and status = 'active' limit 1
$$;

create or replace function current_app_user_campus()
returns uuid language sql stable as $$
  select campus_id from app_users where email = auth.jwt() ->> 'email' and status = 'active' limit 1
$$;

create or replace function current_app_user_team()
returns uuid language sql stable as $$
  select team_id from app_users where email = auth.jwt() ->> 'email' and status = 'active' limit 1
$$;

create policy "registered users can read own profile" on app_users for select using (
  current_app_user_role() = 'admin' or email = auth.jwt() ->> 'email' or campus_id = current_app_user_campus() or team_id = current_app_user_team()
);
create policy "admin manages users" on app_users for all using (current_app_user_role() = 'admin') with check (current_app_user_role() = 'admin');

create policy "registered users read campuses" on campuses for select using (current_app_user_role() is not null);
create policy "admin manages campuses" on campuses for all using (current_app_user_role() = 'admin') with check (current_app_user_role() = 'admin');

create policy "registered users read umkm" on umkms for select using (current_app_user_role() is not null);
create policy "admin manages umkm" on umkms for all using (current_app_user_role() = 'admin') with check (current_app_user_role() = 'admin');

create policy "registered users read teams" on teams for select using (current_app_user_role() is not null);
create policy "admin manages teams" on teams for all using (current_app_user_role() = 'admin') with check (current_app_user_role() = 'admin');

create policy "registered users read course" on courses for select using (current_app_user_role() is not null);
create policy "admin manages course" on courses for all using (current_app_user_role() = 'admin') with check (current_app_user_role() = 'admin');

create policy "registered users read sessions" on sessions for select using (current_app_user_role() is not null);
create policy "admin manages sessions" on sessions for all using (current_app_user_role() = 'admin') with check (current_app_user_role() = 'admin');

create policy "attendance visible" on attendance for select using (current_app_user_role() is not null);
create policy "student creates own attendance" on attendance for insert with check (user_id = current_app_user_id() or current_app_user_role() = 'admin');
create policy "admin updates attendance" on attendance for update using (current_app_user_role() = 'admin') with check (current_app_user_role() = 'admin');

create policy "reports visible" on weekly_reports for select using (current_app_user_role() is not null);
create policy "student admin insert reports" on weekly_reports for insert with check (current_app_user_role() in ('admin','mahasiswa'));
create policy "admin lecturer update reports" on weekly_reports for update using (current_app_user_role() in ('admin','dosen')) with check (current_app_user_role() in ('admin','dosen'));

create policy "outputs visible" on outputs for select using (current_app_user_role() is not null);
create policy "student admin insert outputs" on outputs for insert with check (current_app_user_role() in ('admin','mahasiswa'));
create policy "admin umkm update outputs" on outputs for update using (current_app_user_role() in ('admin','umkm')) with check (current_app_user_role() in ('admin','umkm'));

create policy "scores visible" on scores for select using (current_app_user_role() is not null);
create policy "judge admin insert scores" on scores for insert with check (current_app_user_role() in ('admin','juri'));
create policy "judge admin update scores" on scores for update using (current_app_user_role() in ('admin','juri')) with check (current_app_user_role() in ('admin','juri'));
