const MONITORING_SPREADSHEET_ID = '1PqRraw7Qt5nfpWECAemnTRH4edrKDZfti0gBImmgDbI';
const MONITORING_ROOT_FOLDER_NAME = 'Babel Youthpreneur Monitoring';
const KURASI_SHEET_NAME = 'Kurasi UMKM 2026';
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

const SHEETS = {
  appUsers: 'AppUsers',
  campuses: 'Campuses',
  umkms: 'UMKM',
  teams: 'Teams',
  teamMembers: 'TeamMembers',
  courses: 'Courses',
  learningModules: 'LearningModules',
  attendanceSessions: 'AttendanceSessions',
  attendanceRecords: 'AttendanceRecords',
  weeklyReports: 'WeeklyReports',
  outputs: 'Outputs',
  challengeScores: 'ChallengeScores',
  registrations: 'Registrations',
  notifications: 'Notifications',
  auditLogs: 'AuditLogs',
};

const SCHEMAS = {
  [SHEETS.appUsers]: ['id', 'email', 'name', 'role', 'campus_id', 'team_id', 'umkm_id', 'status', 'created_at'],
  [SHEETS.campuses]: ['id', 'name', 'pic', 'created_at'],
  [SHEETS.umkms]: ['id', 'business_name', 'owner_name', 'category', 'location', 'priority_need', 'created_at'],
  [SHEETS.teams]: ['id', 'name', 'campus_id', 'umkm_id', 'progress', 'status', 'reports', 'outputs', 'attendance', 'created_at'],
  [SHEETS.teamMembers]: ['id', 'team_id', 'name', 'campus_id', 'email', 'created_at'],
  [SHEETS.courses]: ['id', 'title', 'description', 'start_date', 'end_date', 'created_at'],
  [SHEETS.learningModules]: ['id', 'course_id', 'title', 'date', 'status', 'progress', 'materials', 'assignment', 'quiz_average', 'created_at'],
  [SHEETS.attendanceSessions]: ['id', 'module_id', 'title', 'token', 'starts_at', 'ends_at', 'location', 'radius_meters', 'created_at'],
  [SHEETS.attendanceRecords]: ['id', 'session_id', 'team_id', 'name', 'email', 'latitude', 'longitude', 'photo_drive_url', 'status', 'submitted_at'],
  [SHEETS.weeklyReports]: ['id', 'team_id', 'week', 'activity', 'progress', 'obstacles', 'next_plan', 'drive_link', 'publication_link', 'validation', 'submitted_by', 'submitted_at'],
  [SHEETS.outputs]: ['id', 'team_id', 'type', 'title', 'status', 'link_status', 'drive_link', 'publication_link', 'umkm_feedback', 'submitted_by', 'submitted_at'],
  [SHEETS.challengeScores]: ['id', 'team_id', 'category', 'score', 'note', 'judge_email', 'submitted_at'],
  [SHEETS.registrations]: ['id', 'email', 'name', 'requested_role', 'institution', 'whatsapp', 'note', 'status', 'admin_note', 'submitted_at'],
  [SHEETS.notifications]: ['id', 'user_email', 'title', 'message', 'is_read', 'created_at'],
  [SHEETS.auditLogs]: ['id', 'actor_email', 'action', 'entity_type', 'entity_id', 'metadata', 'created_at'],
};

function doGet(e) {
  return handleRequest_(e, 'GET');
}

function doPost(e) {
  return handleRequest_(e, 'POST');
}

function bootstrap() {
  return bootstrap_();
}

function setupMonitoring() {
  return bootstrap_();
}

function testBackend() {
  return {
    ok: true,
    service: 'Babel Youthpreneur Monitoring Google Backend',
    time: now_(),
  };
}

function handleRequest_(e, method) {
  try {
    const action = getAction_(e);
    const payload = parsePayload_(e);

    if (!action && method === 'POST') return json_(submitKurasi_(payload));
    if (!action && method === 'GET') return json_({ ok: true, service: 'Babel Youthpreneur Google Backend', modules: ['kurasi', 'monitoring'], time: now_() });

    if (action === 'test') return json_({ ok: true, service: 'Babel Youthpreneur Monitoring Google Backend', time: now_() });
    if (action === 'submitKurasi') return json_(submitKurasi_(payload));
    if (action === 'bootstrap') return json_(bootstrap_());
    if (action === 'getData') return json_(getData_(payload));
    if (action === 'loginByEmail') return json_(loginByEmail_(payload));
    if (action === 'registerAccount') return json_(registerAccount_(payload));
    if (action === 'submitWeeklyReport') return json_(submitWeeklyReport_(payload));
    if (action === 'submitOutput') return json_(submitOutput_(payload));
    if (action === 'submitScore') return json_(submitScore_(payload));
    if (action === 'submitAttendance') return json_(submitAttendance_(payload));
    if (action === 'exportCsv') return json_(exportCsv_(payload));

    return json_({ ok: false, error: 'Unknown action: ' + action });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function submitKurasi_(payload) {
  const submittedAt = new Date();
  const row = {
    submitted_at: submittedAt.toISOString(),
    ...payload,
  };

  appendDynamicObject_(KURASI_SHEET_NAME, row);
  audit_(payload.email || payload.nama_lengkap || 'kurasi-form', 'submitKurasi', 'kurasi_umkm', row.submitted_at, row);

  return {
    ok: true,
    submitted_at: row.submitted_at,
  };
}

function bootstrap_() {
  const ss = getSpreadsheet_();
  Object.keys(SCHEMAS).forEach((sheetName) => ensureSheet_(ss, sheetName, SCHEMAS[sheetName]));
  const drive = ensureRootFolderSafe_();
  seedIfEmpty_(ss);
  audit_('system', 'bootstrap', 'spreadsheet', MONITORING_SPREADSHEET_ID, {});
  return {
    ok: true,
    message: drive.ok ? 'Monitoring sheets and Drive folder are ready.' : 'Monitoring sheets are ready. Drive authorization is still needed for uploads and exports.',
    spreadsheet_id: MONITORING_SPREADSHEET_ID,
    drive: drive,
  };
}

function getData_(payload) {
  bootstrap_();
  const ss = getSpreadsheet_();
  if (requiresSupabaseAuth_()) {
    const verifiedEmail = verifySupabaseEmail_(payload);
    if (!verifiedEmail) return { ok: false, error: 'Data monitoring hanya tersedia setelah login Google OAuth.' };
    payload.email = verifiedEmail;
  }
  const loginResult = payload.email ? loginByEmail_(payload) : null;
  if (payload.email && (!loginResult || !loginResult.ok)) return loginResult;
  const profile = loginResult ? loginResult.profile : null;
  const campuses = readObjects_(ss.getSheetByName(SHEETS.campuses));
  const umkms = readObjects_(ss.getSheetByName(SHEETS.umkms));
  const teams = profile ? scopeTeamsForProfile_(profile, readObjects_(ss.getSheetByName(SHEETS.teams))) : [];
  const teamIds = teams.map((team) => team.id);
  const members = readObjects_(ss.getSheetByName(SHEETS.teamMembers));

  return {
    ok: true,
    mode: 'google',
    profile: profile,
    teams: teams.map((team) => {
      const campus = campuses.find((item) => item.id === team.campus_id) || {};
      const umkm = umkms.find((item) => item.id === team.umkm_id) || {};
      return {
        id: team.id,
        name: team.name,
        campusId: team.campus_id || '',
        campus: campus.name || '',
        umkmId: team.umkm_id || '',
        umkm: umkm.business_name || '',
        members: members.filter((member) => member.team_id === team.id).map((member) => member.name),
        umkmCategory: umkm.category || '',
        umkmOwner: umkm.owner_name || '',
        umkmLocation: umkm.location || '',
        progress: Number(team.progress || 0),
        status: team.status || 'aman',
        reports: Number(team.reports || 0),
        outputs: Number(team.outputs || 0),
        attendance: Number(team.attendance || 0),
      };
    }),
    reports: readObjects_(ss.getSheetByName(SHEETS.weeklyReports)).filter((row) => teamIds.includes(row.team_id)).map((row) => ({
      id: row.id,
      teamId: row.team_id,
      week: Number(row.week || 0),
      activity: row.activity || '',
      progress: row.progress || '',
      validation: row.validation || 'pending',
    })),
    outputs: readObjects_(ss.getSheetByName(SHEETS.outputs)).filter((row) => teamIds.includes(row.team_id)).map((row) => ({
      id: row.id,
      teamId: row.team_id,
      type: row.type || '',
      title: row.title || '',
      status: row.status || 'draft',
      linkStatus: row.link_status || 'perlu dicek',
      umkmFeedback: row.umkm_feedback || '',
    })),
    scores: readObjects_(ss.getSheetByName(SHEETS.challengeScores)).filter((row) => teamIds.includes(row.team_id)).map((row) => ({
      teamId: row.team_id,
      category: row.category || '',
      score: Number(row.score || 0),
      note: row.note || '',
    })),
  };
}

function loginByEmail_(payload) {
  bootstrap_();
  const verifiedEmail = verifySupabaseEmail_(payload);
  const submittedEmail = String(payload.email || '').trim().toLowerCase();
  const email = String(verifiedEmail || submittedEmail).toLowerCase();
  if (!email) return { ok: false, error: 'Email is required.' };
  if (requiresSupabaseAuth_() && !verifiedEmail) {
    return { ok: false, error: 'Login wajib melalui Google OAuth yang valid.' };
  }
  if (verifiedEmail && submittedEmail && verifiedEmail !== submittedEmail) {
    return { ok: false, error: 'Email login tidak sesuai dengan akun Google yang terverifikasi.' };
  }

  const users = readObjects_(getSpreadsheet_().getSheetByName(SHEETS.appUsers));
  const user = users.find((item) => String(item.email || '').toLowerCase() === email);
  if (!user) return { ok: false, error: 'Email belum terdaftar. Silakan register terlebih dahulu.' };
  if (String(user.status || '').toLowerCase() !== 'active') {
    return { ok: false, pending: true, error: 'Akun sudah terdaftar dan menunggu konfirmasi admin.' };
  }
  if (!['super_admin', 'admin_panitia', 'admin', 'dosen', 'mahasiswa', 'ketua_tim', 'umkm', 'kampus_viewer', 'pimpinan_viewer', 'juri'].includes(String(user.role || '').toLowerCase())) {
    return { ok: false, pending: true, error: 'Akun belum memiliki role. Admin perlu menetapkan role terlebih dahulu.' };
  }

  return {
    ok: true,
    profile: {
      role: user.role,
      name: user.name,
      title: roleTitle_(user.role),
      email: user.email,
      teamId: user.team_id,
      campusId: user.campus_id,
      umkmId: user.umkm_id,
    },
  };
}

function requiresSupabaseAuth_() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function verifySupabaseEmail_(payload) {
  if (!payload.access_token) return '';
  if (!requiresSupabaseAuth_()) return '';

  try {
    const response = UrlFetchApp.fetch(SUPABASE_URL.replace(/\/$/, '') + '/auth/v1/user', {
      method: 'get',
      muteHttpExceptions: true,
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: 'Bearer ' + payload.access_token,
      },
    });
    if (response.getResponseCode() !== 200) return '';
    const user = JSON.parse(response.getContentText() || '{}');
    return String(user.email || '').trim().toLowerCase();
  } catch (error) {
    return '';
  }
}

function registerAccount_(payload) {
  bootstrap_();
  const email = String(payload.email || '').trim().toLowerCase();
  const name = String(payload.name || '').trim();
  const requestedRole = String(payload.requested_role || '').trim().toLowerCase();
  const institution = String(payload.institution || '').trim();
  const whatsapp = String(payload.whatsapp || '').trim();
  const note = String(payload.note || '').trim();

  if (!email || email.indexOf('@') === -1) return { ok: false, error: 'Email Google wajib diisi dengan format yang benar.' };
  if (!name) return { ok: false, error: 'Nama lengkap wajib diisi.' };

  const ss = getSpreadsheet_();
  const users = readObjects_(ss.getSheetByName(SHEETS.appUsers));
  const existingUser = users.find((item) => String(item.email || '').toLowerCase() === email);
  if (existingUser && String(existingUser.status || '').toLowerCase() === 'active') {
    return { ok: true, status: 'active', message: 'Akun sudah aktif. Silakan masuk menggunakan email tersebut.' };
  }

  const row = {
    id: makeId_('reg'),
    email: email,
    name: name,
    requested_role: requestedRole,
    institution: institution,
    whatsapp: whatsapp,
    note: note,
    status: 'pending_admin_review',
    admin_note: '',
    submitted_at: now_(),
  };
  appendObject_(SHEETS.registrations, row);

  if (!existingUser) {
    appendObject_(SHEETS.appUsers, {
      id: makeId_('user'),
      email: email,
      name: name,
      role: '',
      campus_id: '',
      team_id: '',
      umkm_id: '',
      status: 'pending',
      created_at: now_(),
    });
  }

  audit_(email, 'registerAccount', 'registration', row.id, row);
  return {
    ok: true,
    status: 'pending_admin_review',
    message: 'Registrasi diterima. Admin akan mengonfirmasi akun dan menetapkan role.',
    row: row,
  };
}

function scopeTeamsForProfile_(profile, teams) {
  if (!profile) return [];
  if (canSeeAllTeams_(profile.role)) return teams;
  if (isStudentRole_(profile.role)) return teams.filter((team) => team.id === profile.teamId);
  if (profile.role === 'umkm') return teams.filter((team) => team.umkm_id === profile.umkmId);
  if (profile.role === 'dosen' || profile.role === 'kampus_viewer') return teams.filter((team) => team.campus_id === profile.campusId);
  return [];
}

function canSeeAllTeams_(role) {
  return ['super_admin', 'admin_panitia', 'admin', 'juri', 'pimpinan_viewer'].includes(String(role || ''));
}

function isAdminRole_(role) {
  return ['super_admin', 'admin_panitia', 'admin'].includes(String(role || ''));
}

function isStudentRole_(role) {
  return ['mahasiswa', 'ketua_tim'].includes(String(role || ''));
}

function requireProfile_(payload) {
  const login = loginByEmail_(payload || {});
  if (!login.ok) throw new Error(login.error || 'Login diperlukan.');
  return login.profile;
}

function canAccessTeam_(profile, teamId) {
  if (canSeeAllTeams_(profile.role)) return true;
  const teams = readObjects_(getSpreadsheet_().getSheetByName(SHEETS.teams));
  return scopeTeamsForProfile_(profile, teams).some((team) => team.id === teamId);
}

function submitWeeklyReport_(payload) {
  bootstrap_();
  const profile = requireProfile_(payload);
  if (!isAdminRole_(profile.role) && !isStudentRole_(profile.role)) return { ok: false, error: 'Role tidak boleh mengirim laporan mingguan.' };
  if (!canAccessTeam_(profile, payload.team_id)) return { ok: false, error: 'Tim tidak sesuai dengan akses pengguna.' };
  const row = {
    id: makeId_('wr'),
    team_id: payload.team_id,
    week: payload.week,
    activity: payload.activity,
    progress: payload.progress,
    obstacles: payload.obstacles || '',
    next_plan: payload.next_plan || '',
    drive_link: payload.drive_link || '',
    publication_link: payload.publication_link || '',
    validation: 'pending',
    submitted_by: payload.email || '',
    submitted_at: now_(),
  };
  appendObject_(SHEETS.weeklyReports, row);
  audit_(payload.email, 'submitWeeklyReport', 'weekly_report', row.id, row);
  return { ok: true, row: row };
}

function submitOutput_(payload) {
  bootstrap_();
  const profile = requireProfile_(payload);
  if (!isAdminRole_(profile.role) && !isStudentRole_(profile.role)) return { ok: false, error: 'Role tidak boleh mengirim output.' };
  if (!canAccessTeam_(profile, payload.team_id)) return { ok: false, error: 'Tim tidak sesuai dengan akses pengguna.' };
  const row = {
    id: makeId_('out'),
    team_id: payload.team_id,
    type: payload.type,
    title: payload.title,
    status: 'submitted',
    link_status: validateLink_(payload.drive_link || payload.publication_link),
    drive_link: payload.drive_link || '',
    publication_link: payload.publication_link || '',
    umkm_feedback: 'Menunggu review',
    submitted_by: payload.email || '',
    submitted_at: now_(),
  };
  appendObject_(SHEETS.outputs, row);
  audit_(payload.email, 'submitOutput', 'output', row.id, row);
  return { ok: true, row: row };
}

function submitScore_(payload) {
  bootstrap_();
  const profile = requireProfile_(payload);
  if (!isAdminRole_(profile.role) && profile.role !== 'juri') return { ok: false, error: 'Role tidak boleh mengisi skor challenge.' };
  if (!canAccessTeam_(profile, payload.team_id)) return { ok: false, error: 'Tim tidak sesuai dengan akses pengguna.' };
  const score = Math.max(1, Math.min(100, Number(payload.score || 0)));
  const row = {
    id: makeId_('score'),
    team_id: payload.team_id,
    category: payload.category,
    score: score,
    note: payload.note || '',
    judge_email: payload.email || '',
    submitted_at: now_(),
  };
  appendObject_(SHEETS.challengeScores, row);
  audit_(payload.email, 'submitScore', 'challenge_score', row.id, row);
  return { ok: true, row: row };
}

function submitAttendance_(payload) {
  bootstrap_();
  const profile = requireProfile_(payload);
  if (!isAdminRole_(profile.role) && !isStudentRole_(profile.role)) return { ok: false, error: 'Role tidak boleh mengisi presensi.' };
  if (payload.team_id && !canAccessTeam_(profile, payload.team_id)) return { ok: false, error: 'Tim tidak sesuai dengan akses pengguna.' };
  const tokenResult = validateAttendanceToken_(payload.token);
  const row = {
    id: makeId_('att'),
    session_id: tokenResult.session_id || '',
    team_id: payload.team_id || '',
    name: payload.name || '',
    email: payload.email || '',
    latitude: payload.latitude || '',
    longitude: payload.longitude || '',
    photo_drive_url: savePhotoIfPresent_(payload),
    status: tokenResult.ok ? 'valid' : 'pending_review',
    submitted_at: now_(),
  };
  appendObject_(SHEETS.attendanceRecords, row);
  audit_(payload.email, 'submitAttendance', 'attendance', row.id, row);
  return { ok: true, row: row, token: tokenResult };
}

function exportCsv_(payload) {
  bootstrap_();
  const profile = requireProfile_(payload);
  if (!isAdminRole_(profile.role) && !['dosen', 'kampus_viewer', 'pimpinan_viewer', 'juri'].includes(profile.role)) return { ok: false, error: 'Role tidak boleh export laporan.' };
  const sheetName = payload.sheet || SHEETS.teams;
  if (!SCHEMAS[sheetName]) return { ok: false, error: 'Sheet export tidak dikenal.' };
  if (!isAdminRole_(profile.role) && ![SHEETS.teams, SHEETS.weeklyReports, SHEETS.outputs, SHEETS.challengeScores].includes(sheetName)) {
    return { ok: false, error: 'Sheet ini hanya boleh diexport admin.' };
  }
  let rows = readObjects_(getSpreadsheet_().getSheetByName(sheetName));
  if (!canSeeAllTeams_(profile.role)) {
    const teamIds = scopeTeamsForProfile_(profile, readObjects_(getSpreadsheet_().getSheetByName(SHEETS.teams))).map((team) => team.id);
    rows = rows.filter((row) => sheetName === SHEETS.teams ? teamIds.includes(row.id) : teamIds.includes(row.team_id));
  }
  const headers = SCHEMAS[sheetName];
  const csv = [headers.join(',')]
    .concat(rows.map((row) => headers.map((header) => csvCell_(row[header] || '')).join(',')))
    .join('\n');
  const drive = ensureRootFolderSafe_();
  if (!drive.ok) return { ok: false, error: drive.error };
  const folder = drive.folder;
  const file = folder.createFile(sheetName + '-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '.csv', csv, MimeType.CSV);
  return { ok: true, url: file.getUrl(), name: file.getName(), rows: rows.length };
}

function seedIfEmpty_(ss) {
  if (readObjects_(ss.getSheetByName(SHEETS.teams)).length) return;

  const now = now_();
  const campuses = [
    ['campus-ubb', 'Universitas Bangka Belitung'],
    ['campus-unaba', 'Universitas Anak Bangsa'],
    ['campus-pertiba', 'Universitas Pertiba'],
    ['campus-unmuh', 'Universitas Muhammadiyah Bangka Belitung'],
    ['campus-iain', 'IAIN SAS Bangka Belitung'],
  ];
  campuses.forEach((item) => appendObject_(SHEETS.campuses, { id: item[0], name: item[1], pic: '', created_at: now }));

  const umkms = [
    ['umkm-madu', 'Madu RR Arisi', 'Arisi', 'Madu dan olahan pangan', 'Bangka Belitung'],
    ['umkm-jj', 'JJ Catering', 'Ramon', 'Olahan makanan', 'Kota Pangkalpinang'],
    ['umkm-dnd', 'DND Cake & Cookies by Desi', 'Desi Yulita', 'Olahan makanan', 'Kelurahan Tuatunu Indah, Kota Pangkalpinang'],
    ['umkm-deshanda', 'Deshanda Craft', 'Eva Deswanti', 'Kerajinan', 'Kota Pangkalpinang'],
    ['umkm-kamiz', "Kamiz Choc's", 'Hamdan', 'Olahan cokelat', 'Kota Pangkalpinang'],
    ['umkm-charcoal', 'PT Charcoal Babelindo', 'Lukman', 'Daun ketapang dan leaf litter', 'Kota Pangkalpinang'],
    ['umkm-nina', 'Keripik Cumi Nina', 'Nafa', 'Olahan makanan', 'Kabupaten Bangka'],
    ['umkm-rajalele', 'Rumah Makan Raja Lele', 'Pipit', 'Olahan makanan', 'Jl Bina Marga, Kota Pangkalpinang'],
    ['umkm-shesca', '3 Shesca Decoupage', 'Shesca', 'Kerajinan', 'Bangka Belitung'],
    ['umkm-deviz', 'Deviz Indo Bangka', 'Yuyun', 'Olahan makanan', 'Kota Pangkalpinang'],
  ];
  umkms.forEach((item) => appendObject_(SHEETS.umkms, { id: item[0], business_name: item[1], owner_name: item[2], category: item[3], location: item[4], priority_need: 'Digital branding dan pemasaran', created_at: now }));

  const teamRows = getSeedTeams_();
  teamRows.forEach((team) => {
    appendObject_(SHEETS.teams, {
      id: team.id,
      name: team.name,
      campus_id: team.campus_id,
      umkm_id: team.umkm_id,
      progress: team.progress,
      status: team.status,
      reports: team.reports,
      outputs: team.outputs,
      attendance: team.attendance,
      created_at: now,
    });
    team.members.forEach((member, index) => appendObject_(SHEETS.teamMembers, {
      id: makeId_('member'),
      team_id: team.id,
      name: member,
      campus_id: team.campus_id,
      email: '',
      created_at: now,
    }));
  });

  appendObject_(SHEETS.courses, { id: 'course-2026', title: 'Course Pelatihan Babel Youthpreneur', description: 'Learning path pendampingan UMKM', start_date: '2026-07-07', end_date: '2026-07-28', created_at: now });
  [
    ['mod-1', 'Orientasi Program dan Etika Pendampingan UMKM', '2026-07-07', 'Selesai', 100, 'Modul teks, Slide, Quiz', 'Peta kebutuhan UMKM', 86],
    ['mod-2', 'Digital Branding dan Copywriting', '2026-07-14', 'Berjalan', 64, 'Video, Template caption, Quiz', 'Draft brand voice', 78],
    ['mod-3', 'Foto Produk dan Video Pendek', '2026-07-21', 'Belum mulai', 12, 'Video praktik, Checklist alat, Tugas', '3 foto produk dan 1 video', 0],
    ['mod-4', 'Katalog Digital dan Landing Page', '2026-07-28', 'Belum mulai', 0, 'Slide, Contoh landing page, Rubrik', 'Link katalog siap uji', 0],
  ].forEach((item) => appendObject_(SHEETS.learningModules, { id: item[0], course_id: 'course-2026', title: item[1], date: item[2], status: item[3], progress: item[4], materials: item[5], assignment: item[6], quiz_average: item[7], created_at: now }));

  appendObject_(SHEETS.weeklyReports, { id: 'wr-seed-1', team_id: 'g3', week: 1, activity: 'Profil DND Cake & Cookies selesai.', progress: 'Kebutuhan branding dan kanal publikasi dipetakan.', obstacles: '', next_plan: '', drive_link: '', publication_link: '', validation: 'validated', submitted_by: 'seed', submitted_at: now });
  appendObject_(SHEETS.outputs, { id: 'out-seed-1', team_id: 'g3', type: 'Kalender konten', title: 'Kalender Konten DND Cake', status: 'approved', link_status: 'valid format', drive_link: '', publication_link: '', umkm_feedback: 'Sudah bisa dipakai', submitted_by: 'seed', submitted_at: now });
  appendObject_(SHEETS.challengeScores, { id: 'score-seed-1', team_id: 'g5', category: 'Best Product Campaign', score: 88, note: 'Kuat pada visual dan pesan produk.', judge_email: 'seed', submitted_at: now });

  appendObject_(SHEETS.appUsers, { id: 'user-admin', email: 'admin@example.com', name: 'Admin Program', role: 'admin', campus_id: '', team_id: '', umkm_id: '', status: 'active', created_at: now });
}

function getSeedTeams_() {
  return [
    { id: 'g1', name: 'Kelompok 1', campus_id: 'campus-ubb', umkm_id: 'umkm-madu', members: ['Muhammad Faiq Elfaruq', 'Umar Dzaki Elfatih', 'Maulana Malik Ibrahim'], progress: 78, status: 'aman', reports: 4, outputs: 4, attendance: 92 },
    { id: 'g2', name: 'Kelompok 2', campus_id: 'campus-unaba', umkm_id: 'umkm-jj', members: ['Amaliya Putri Nurisma', 'Valerin Dia Nova', 'Nurul Apni'], progress: 72, status: 'aman', reports: 4, outputs: 3, attendance: 88 },
    { id: 'g3', name: 'Kelompok 3', campus_id: 'campus-pertiba', umkm_id: 'umkm-dnd', members: ['Liviana', 'Olyvia Ayu Poernama', 'Rasya Agustin'], progress: 83, status: 'aman', reports: 4, outputs: 5, attendance: 94 },
    { id: 'g4', name: 'Kelompok 4', campus_id: 'campus-pertiba', umkm_id: 'umkm-deshanda', members: ['Aprilian Anggara', 'Iqbal Abdillah', 'Abizar'], progress: 64, status: 'perlu_perhatian', reports: 3, outputs: 2, attendance: 76 },
    { id: 'g5', name: 'Kelompok 5', campus_id: 'campus-ubb', umkm_id: 'umkm-kamiz', members: ['Angelia Okta Ferani', 'Kevin Setiawan', 'Salma Azzahra'], progress: 86, status: 'aman', reports: 4, outputs: 5, attendance: 90 },
    { id: 'g6', name: 'Kelompok 6', campus_id: 'campus-unmuh', umkm_id: 'umkm-nina', members: ['Meizha Hadzami', 'Zalva Rosemayini Putri Rais', 'Maharani Fatiya Azzahra'], progress: 68, status: 'aman', reports: 3, outputs: 3, attendance: 84 },
    { id: 'g7', name: 'Kelompok 7', campus_id: 'campus-iain', umkm_id: 'umkm-rajalele', members: ['Sandri', 'Aulia Rohimah', 'Sundari'], progress: 73, status: 'aman', reports: 4, outputs: 3, attendance: 86 },
    { id: 'g8', name: 'Kelompok 8', campus_id: 'campus-iain', umkm_id: 'umkm-shesca', members: ['Jordi', 'Miftahul', 'Novita Aprianti'], progress: 52, status: 'perlu_perhatian', reports: 2, outputs: 2, attendance: 72 },
    { id: 'g9', name: 'Kelompok 9', campus_id: 'campus-unmuh', umkm_id: 'umkm-charcoal', members: ['Muhammad Muda Wali', 'Haruku Maulana', 'Iqmal Prakoso'], progress: 59, status: 'perlu_perhatian', reports: 2, outputs: 2, attendance: 74 },
    { id: 'g10', name: 'Kelompok 10', campus_id: 'campus-unaba', umkm_id: 'umkm-deviz', members: ['Iis Kholifah', 'Danil Eko Saputra', 'Gustia'], progress: 28, status: 'kritis', reports: 1, outputs: 1, attendance: 58 },
  ];
}

function validateAttendanceToken_(token) {
  if (!token) return { ok: false, message: 'Token kosong.' };
  const parts = String(token).split(':');
  if (parts.length < 3 || parts[0] !== 'BY') return { ok: false, message: 'Format token tidak valid.' };
  const issuedAt = Number(parts[2]);
  const expired = Date.now() - issuedAt > 30 * 1000;
  return { ok: !expired, session_id: parts[1], expired: expired };
}

function savePhotoIfPresent_(payload) {
  if (!payload.photo_base64) return '';
  const folder = ensureSubFolder_('Presensi');
  if (!folder) return '';
  const bytes = Utilities.base64Decode(String(payload.photo_base64).replace(/^data:image\/\w+;base64,/, ''));
  const blob = Utilities.newBlob(bytes, payload.photo_mime || 'image/jpeg', 'presensi-' + makeId_('photo') + '.jpg');
  return folder.createFile(blob).getUrl();
}

function getAction_(e) {
  return String((e && e.parameter && e.parameter.action) || '').trim();
}

function parsePayload_(e) {
  if (e && e.postData && e.postData.contents) return JSON.parse(e.postData.contents || '{}');
  return (e && e.parameter) || {};
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(MONITORING_SPREADSHEET_ID);
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    try {
      sheet = ss.insertSheet(name);
    } catch (error) {
      sheet = ss.getSheetByName(name);
      if (!sheet) throw error;
    }
  }
  const lastColumn = Math.max(sheet.getLastColumn(), headers.length);
  const existing = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].filter(Boolean);
  const nextHeaders = existing.length ? existing.concat(headers.filter((item) => existing.indexOf(item) === -1)) : headers;
  sheet.getRange(1, 1, 1, nextHeaders.length).setValues([nextHeaders]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, nextHeaders.length).setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');
  return sheet;
}

function readObjects_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getDataRange().getValues();
  const headers = values.shift().map(String);
  return values
    .filter((row) => row.some((cell) => cell !== ''))
    .map((row) => {
      const object = {};
      headers.forEach((header, index) => object[header] = row[index]);
      return object;
    });
}

function appendObject_(sheetName, rowObject) {
  const ss = getSpreadsheet_();
  const sheet = ensureSheet_(ss, sheetName, SCHEMAS[sheetName]);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].filter(Boolean);
  sheet.appendRow(headers.map((header) => rowObject[header] === undefined ? '' : rowObject[header]));
}

function appendDynamicObject_(sheetName, rowObject) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  const keys = Object.keys(rowObject);
  const lastColumn = Math.max(sheet.getLastColumn(), 1);
  const existingHeaders = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].filter(Boolean);
  const headers = existingHeaders.length ? existingHeaders : keys;
  const missingHeaders = keys.filter((key) => headers.indexOf(key) === -1);
  const nextHeaders = headers.concat(missingHeaders);

  if (!existingHeaders.length || missingHeaders.length) {
    sheet.getRange(1, 1, 1, nextHeaders.length).setValues([nextHeaders]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, nextHeaders.length).setFontWeight('bold').setBackground('#0f766e').setFontColor('#ffffff');
  }

  const row = nextHeaders.map((key) => {
    const value = rowObject[key];
    return Array.isArray(value) ? value.join(', ') : value || '';
  });

  sheet.appendRow(row);
}

function ensureRootFolder_() {
  const folders = DriveApp.getFoldersByName(MONITORING_ROOT_FOLDER_NAME);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(MONITORING_ROOT_FOLDER_NAME);
}

function ensureRootFolderSafe_() {
  try {
    return { ok: true, folder: ensureRootFolder_() };
  } catch (error) {
    return {
      ok: false,
      error: 'Drive belum diotorisasi. Jalankan bootstrap_ dari editor Apps Script lalu approve akses Drive. Detail: ' + String(error && error.message ? error.message : error),
    };
  }
}

function ensureSubFolder_(name) {
  const drive = ensureRootFolderSafe_();
  if (!drive.ok) return null;
  const root = drive.folder;
  const folders = root.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : root.createFolder(name);
}

function audit_(actorEmail, action, entityType, entityId, metadata) {
  appendObject_(SHEETS.auditLogs, {
    id: makeId_('audit'),
    actor_email: actorEmail || '',
    action: action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: JSON.stringify(metadata || {}),
    created_at: now_(),
  });
}

function validateLink_(value) {
  if (!value) return 'kosong';
  return /^https?:\/\/.+/i.test(String(value)) ? 'valid format' : 'format salah';
}

function roleTitle_(role) {
  return {
    super_admin: 'Super Admin',
    admin_panitia: 'Admin Panitia',
    admin: 'Admin Panitia',
    dosen: 'Dosen Pendamping',
    mahasiswa: 'Mahasiswa',
    ketua_tim: 'Ketua Tim',
    umkm: 'UMKM',
    kampus_viewer: 'Kampus/Viewer',
    pimpinan_viewer: 'Pimpinan/Viewer',
    juri: 'Juri',
  }[role] || role;
}

function makeId_(prefix) {
  return prefix + '-' + Utilities.getUuid();
}

function csvCell_(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

function now_() {
  return new Date().toISOString();
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
