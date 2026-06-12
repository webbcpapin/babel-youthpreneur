export type Role = 'admin' | 'dosen' | 'mahasiswa' | 'umkm' | 'juri';
export type TeamStatus = 'aman' | 'perlu_perhatian' | 'kritis';
export type OutputType = 'calendar' | 'content' | 'video' | 'landing_page' | 'report' | 'presentation' | 'drive_folder';
export type ChallengeCategory =
  | 'Best Digital Branding'
  | 'Best Social Media Growth'
  | 'Best Product Campaign'
  | 'Best Website/Landing Page'
  | 'Best Content Strategy';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  campus_id?: string | null;
  umkm_id?: string | null;
  team_id?: string | null;
  status?: string | null;
}

export interface Campus {
  id: string;
  name: string;
  pic?: string | null;
  contact?: string | null;
  address?: string | null;
}

export interface Umkm {
  id: string;
  business_name: string;
  owner_name?: string | null;
  whatsapp?: string | null;
  category?: string | null;
  address?: string | null;
  regency?: string | null;
  priority_need?: string | null;
  curation_status?: string | null;
}

export interface Team {
  id: string;
  name: string;
  campus_id: string;
  umkm_id?: string | null;
  lecturer_id?: string | null;
  status: TeamStatus;
  progress?: number | null;
}

export interface Course {
  id: string;
  title: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
}

export interface SessionRow {
  id: string;
  course_id: string;
  title: string;
  session_date: string;
  start_time: string;
  end_time: string;
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radius_meters?: number | null;
  qr_token: string;
  qr_active_from?: string | null;
  qr_active_until?: string | null;
}

export interface Attendance {
  id: string;
  session_id: string;
  user_id: string;
  scanned_at: string;
  latitude?: number | null;
  longitude?: number | null;
  photo_url?: string | null;
  validation_status: string;
  admin_note?: string | null;
}

export interface WeeklyReport {
  id: string;
  team_id: string;
  week_number: number;
  activity_date?: string | null;
  activities: string;
  progress: string;
  obstacles?: string | null;
  next_plan?: string | null;
  drive_link?: string | null;
  publication_link?: string | null;
  lecturer_note?: string | null;
  admin_note?: string | null;
  lecturer_validation_status?: string | null;
  created_at?: string | null;
}

export interface OutputItem {
  id: string;
  team_id: string;
  output_type: OutputType;
  title: string;
  google_drive_link?: string | null;
  publication_link?: string | null;
  status: string;
  umkm_feedback?: string | null;
  admin_note?: string | null;
}

export interface Score {
  id: string;
  team_id: string;
  category: ChallengeCategory;
  score: number;
  judge_id: string;
  note?: string | null;
}

export interface DashboardData {
  users: AppUser[];
  campuses: Campus[];
  umkms: Umkm[];
  teams: Team[];
  courses: Course[];
  sessions: SessionRow[];
  attendance: Attendance[];
  weeklyReports: WeeklyReport[];
  outputs: OutputItem[];
  scores: Score[];
}
