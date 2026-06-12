import { supabase, supabaseConfigured } from './supabase';
import { mockData } from './mockData';
import type { AppUser, Attendance, DashboardData, OutputItem, Score, SessionRow, Team, WeeklyReport } from './types';

const tableMap = {
  users: 'app_users',
  campuses: 'campuses',
  umkms: 'umkms',
  teams: 'teams',
  courses: 'courses',
  sessions: 'sessions',
  attendance: 'attendance',
  weeklyReports: 'weekly_reports',
  outputs: 'outputs',
  scores: 'scores',
};

export async function getCurrentProfile(email?: string | null): Promise<AppUser | null> {
  if (!email) return null;
  if (!supabaseConfigured || !supabase) {
    return mockData.users.find((u) => u.email === email) ?? mockData.users[0];
  }
  const { data, error } = await supabase
    .from(tableMap.users)
    .select('*')
    .eq('email', email)
    .eq('status', 'active')
    .maybeSingle();
  if (error) throw error;
  return data as AppUser | null;
}

export async function getDashboardData(profile: AppUser): Promise<DashboardData> {
  if (!supabaseConfigured || !supabase) return filterByRole(mockData, profile);

  const [users, campuses, umkms, teams, courses, sessions, attendance, weeklyReports, outputs, scores] = await Promise.all([
    supabase.from(tableMap.users).select('*'),
    supabase.from(tableMap.campuses).select('*'),
    supabase.from(tableMap.umkms).select('*'),
    supabase.from(tableMap.teams).select('*'),
    supabase.from(tableMap.courses).select('*'),
    supabase.from(tableMap.sessions).select('*'),
    supabase.from(tableMap.attendance).select('*'),
    supabase.from(tableMap.weeklyReports).select('*').order('week_number'),
    supabase.from(tableMap.outputs).select('*'),
    supabase.from(tableMap.scores).select('*'),
  ]);

  const errors = [users, campuses, umkms, teams, courses, sessions, attendance, weeklyReports, outputs, scores]
    .map((res) => res.error)
    .filter(Boolean);
  if (errors.length) throw errors[0];

  return filterByRole(
    {
      users: users.data as AppUser[],
      campuses: campuses.data as DashboardData['campuses'],
      umkms: umkms.data as DashboardData['umkms'],
      teams: teams.data as Team[],
      courses: courses.data as DashboardData['courses'],
      sessions: sessions.data as SessionRow[],
      attendance: attendance.data as Attendance[],
      weeklyReports: weeklyReports.data as WeeklyReport[],
      outputs: outputs.data as OutputItem[],
      scores: scores.data as Score[],
    },
    profile
  );
}

function filterByRole(data: DashboardData, profile: AppUser): DashboardData {
  if (profile.role === 'admin' || profile.role === 'juri') return data;

  if (profile.role === 'dosen') {
    const teams = data.teams.filter((t) => t.campus_id === profile.campus_id);
    const teamIds = new Set(teams.map((t) => t.id));
    const umkmIds = new Set(teams.map((t) => t.umkm_id));
    return {
      ...data,
      campuses: data.campuses.filter((c) => c.id === profile.campus_id),
      teams,
      umkms: data.umkms.filter((u) => umkmIds.has(u.id)),
      users: data.users.filter((u) => u.campus_id === profile.campus_id || u.id === profile.id || u.role === 'umkm'),
      attendance: data.attendance.filter((a) => data.users.some((u) => u.id === a.user_id && u.campus_id === profile.campus_id)),
      weeklyReports: data.weeklyReports.filter((r) => teamIds.has(r.team_id)),
      outputs: data.outputs.filter((o) => teamIds.has(o.team_id)),
      scores: data.scores.filter((s) => teamIds.has(s.team_id)),
    };
  }

  if (profile.role === 'mahasiswa' || profile.role === 'umkm') {
    const teamId = profile.team_id;
    const teams = data.teams.filter((t) => t.id === teamId);
    const umkmIds = new Set(teams.map((t) => t.umkm_id));
    return {
      ...data,
      teams,
      campuses: data.campuses.filter((c) => c.id === teams[0]?.campus_id),
      umkms: data.umkms.filter((u) => umkmIds.has(u.id)),
      users: data.users.filter((u) => u.team_id === teamId || u.id === profile.id || u.id === teams[0]?.lecturer_id),
      attendance: data.attendance.filter((a) => profile.role === 'mahasiswa' ? a.user_id === profile.id : data.users.some((u) => u.team_id === teamId && u.id === a.user_id)),
      weeklyReports: data.weeklyReports.filter((r) => r.team_id === teamId),
      outputs: data.outputs.filter((o) => o.team_id === teamId),
      scores: data.scores.filter((s) => s.team_id === teamId),
    };
  }

  return data;
}

export async function createWeeklyReport(payload: Omit<WeeklyReport, 'id' | 'created_at'>): Promise<void> {
  if (!supabaseConfigured || !supabase) return;
  const { error } = await supabase.from(tableMap.weeklyReports).insert(payload);
  if (error) throw error;
}

export async function createOutput(payload: Omit<OutputItem, 'id'>): Promise<void> {
  if (!supabaseConfigured || !supabase) return;
  const { error } = await supabase.from(tableMap.outputs).insert(payload);
  if (error) throw error;
}

export async function createScore(payload: Omit<Score, 'id'>): Promise<void> {
  if (!supabaseConfigured || !supabase) return;
  const { error } = await supabase.from(tableMap.scores).insert(payload);
  if (error) throw error;
}

export async function createAttendance(payload: Omit<Attendance, 'id'>): Promise<void> {
  if (!supabaseConfigured || !supabase) return;
  const { error } = await supabase.from(tableMap.attendance).insert(payload);
  if (error) throw error;
}
