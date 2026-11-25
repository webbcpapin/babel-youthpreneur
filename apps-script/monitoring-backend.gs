const MONITORING_SPREADSHEET_ID = '1PqRraw7Qt5nfpWECAemnTRH4edrKDZfti0gBImmgDbI';
const MONITORING_ROOT_FOLDER_NAME = 'Babel Youthpreneur Monitoring';
const KURASI_SHEET_NAME = 'Kurasi UMKM 2026';
const GOOGLE_OAUTH_CLIENT_ID = PropertiesService.getScriptProperties().getProperty('GOOGLE_OAUTH_CLIENT_ID') || '';
const SESSION_DURATION_SECONDS = 60 * 60 * 8;

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
  weeklyReportHistory: 'WeeklyReportHistory',
  outputs: 'Outputs',
  challengeScores: 'ChallengeScores',
  registrations: 'Registrations',
  sessions: 'Sessions',
  notifications: 'Notifications',
  auditLogs: 'AuditLogs',
};

const SCHEMAS = {
  [SHEETS.appUsers]: ['id', 'email', 'name', 'role', 'campus_id', 'team_id', 'umkm_id', 'status', 'created_at'],
  [SHEETS.campuses]: ['id', 'name', 'pic', 'created_at'],
  [SHEETS.umkms]: ['id', 'business_name', 'owner_name', 'category', 'location', 'priority_need', 'created_at'],
  [SHEETS.teams]: ['id', 'name', 'campus_id', 'umkm_id', 'progress', 'status', 'reports', 'outputs', 'attendance', 'created_at', 'program_year', 'nickname'],
  [SHEETS.teamMembers]: ['id', 'team_id', 'name', 'campus_id', 'email', 'created_at'],
  [SHEETS.courses]: ['id', 'title', 'description', 'start_date', 'end_date', 'created_at'],
  [SHEETS.learningModules]: ['id', 'course_id', 'title', 'date', 'status', 'progress', 'materials', 'assignment', 'quiz_average', 'created_at', 'material_url'],
  [SHEETS.attendanceSessions]: ['id', 'module_id', 'title', 'token', 'starts_at', 'ends_at', 'location', 'radius_meters', 'created_at', 'latitude', 'longitude'],
  [SHEETS.attendanceRecords]: ['id', 'session_id', 'team_id', 'name', 'email', 'latitude', 'longitude', 'photo_drive_url', 'status', 'submitted_at', 'accuracy_meters'],
  [SHEETS.weeklyReports]: ['id', 'team_id', 'week', 'activity', 'progress', 'obstacles', 'next_plan', 'drive_link', 'publication_link', 'validation', 'submitted_by', 'submitted_at', 'request_id', 'program_year', 'report_status', 'items_json', 'final_outputs_json', 'umkm_approval_url', 'umkm_approved', 'umkm_note', 'review_note', 'reviewed_by', 'reviewed_at', 'updated_at', 'revision', 'request_hash', 'planned_visit_at'],
  [SHEETS.weeklyReportHistory]: ['id', 'report_id', 'team_id', 'week', 'action', 'actor_email', 'status', 'snapshot_json', 'created_at', 'request_id', 'request_hash'],
  [SHEETS.outputs]: ['id', 'team_id', 'type', 'title', 'status', 'link_status', 'drive_link', 'publication_link', 'umkm_feedback', 'submitted_by', 'submitted_at', 'request_id', 'source_report_id'],
  [SHEETS.challengeScores]: ['id', 'team_id', 'category', 'score', 'note', 'judge_email', 'submitted_at'],
  [SHEETS.registrations]: ['id', 'email', 'name', 'requested_role', 'institution', 'whatsapp', 'note', 'data_consent', 'status', 'admin_note', 'submitted_at', 'requested_team_id', 'requested_umkm_id', 'requested_campus_id'],
  [SHEETS.sessions]: ['id', 'user_id', 'token_hash', 'expires_at', 'revoked_at', 'created_at'],
  [SHEETS.notifications]: ['id', 'user_email', 'title', 'message', 'is_read', 'created_at'],
  [SHEETS.auditLogs]: ['id', 'actor_email', 'action', 'entity_type', 'entity_id', 'metadata', 'created_at'],
};

const WEEKLY_PLAN_2026 = {
  1: ['profile', 'swot', 'channel_audit', 'target', 'concept'],
  2: ['channel_update', 'photo_video', 'content', 'catalog_draft', 'idea_draft', 'ai_review'],
  3: ['three_contents', 'marketing_evaluation', 'catalog_final', 'idea_final', 'ai_final', 'handover', 'challenge_ready'],
};
const FINAL_OUTPUT_TYPES = {
  marketing: 'Digital Marketing Strategy',
  catalog: 'Best Catalog Product',
  business: 'Best Innovative Business Idea',
};
const FINAL_DEADLINE_2026 = Date.parse('2026-12-09T23:59:59+07:00');

function isPastFinalDeadline_() { return Date.now() > FINAL_DEADLINE_2026; }

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

function setupWeeklyReports2026() {
  const ss = getSpreadsheet_();
  [SHEETS.weeklyReports, SHEETS.weeklyReportHistory, SHEETS.outputs].forEach((name) => ensureSheet_(ss, name, SCHEMAS[name]));
  return { ok: true, message: 'Kolom laporan 2026 dan riwayat revisi siap; data lama tetap ada.' };
}

function setupRegistrationAssignments2026() {
  const ss = getSpreadsheet_();
  ensureSheet_(ss, SHEETS.registrations, SCHEMAS[SHEETS.registrations]);
  ensureSheet_(ss, SHEETS.appUsers, SCHEMAS[SHEETS.appUsers]);
  return { ok: true, message: 'Kolom pilihan penugasan pendaftar siap; data lama tetap ada.' };
}

function setup2026Roster() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Migrasi sedang dijalankan. Coba lagi.');
  try {
    const ss = getSpreadsheet_();
    [SHEETS.campuses, SHEETS.umkms, SHEETS.teams, SHEETS.teamMembers].forEach((name) => ensureSheet_(ss, name, SCHEMAS[name]));
    const roster = get2026Roster_();
    const existing = {};
    [SHEETS.campuses, SHEETS.umkms, SHEETS.teams, SHEETS.teamMembers].forEach((name) => {
      existing[name] = new Set(readObjects_(ss.getSheetByName(name)).map((row) => String(row.id)));
    });
    const created = { campuses: 0, umkms: 0, teams: 0, members: 0 };
    const now = now_();
    roster.forEach((team) => {
      if (!existing[SHEETS.campuses].has(team.campusId)) {
        appendObject_(SHEETS.campuses, { id: team.campusId, name: team.campus, pic: team.lecturer, created_at: now });
        existing[SHEETS.campuses].add(team.campusId);
        created.campuses++;
      } else {
        updateObjectById_(SHEETS.campuses, team.campusId, { name: team.campus, pic: team.lecturer });
      }
      if (!existing[SHEETS.umkms].has(team.umkmId)) {
        appendObject_(SHEETS.umkms, { id: team.umkmId, business_name: team.umkm, owner_name: '', category: team.category, location: '', priority_need: '', created_at: now });
        existing[SHEETS.umkms].add(team.umkmId);
        created.umkms++;
      } else {
        updateObjectById_(SHEETS.umkms, team.umkmId, { business_name: team.umkm, category: team.category });
      }
      if (!existing[SHEETS.teams].has(team.id)) {
        appendObject_(SHEETS.teams, { id: team.id, name: team.name, nickname: team.nickname, campus_id: team.campusId, umkm_id: team.umkmId, progress: 0, status: 'aman', reports: 0, outputs: 0, attendance: 0, created_at: now, program_year: 2026 });
        existing[SHEETS.teams].add(team.id);
        created.teams++;
      } else {
        updateObjectById_(SHEETS.teams, team.id, { name: team.name, nickname: team.nickname, campus_id: team.campusId, umkm_id: team.umkmId, program_year: 2026 });
      }
      team.members.forEach((name, index) => {
        const id = team.id + '-member-' + (index + 1);
        if (existing[SHEETS.teamMembers].has(id)) {
          updateObjectById_(SHEETS.teamMembers, id, { name: name, campus_id: team.campusId });
          return;
        }
        appendObject_(SHEETS.teamMembers, { id: id, team_id: team.id, name: name, campus_id: team.campusId, email: '', created_at: now });
        existing[SHEETS.teamMembers].add(id);
        created.members++;
      });
    });
    upsert2026Modules_(ss, now);
    return { ok: true, created: created, message: 'Roster dan modul 2026 siap. Data lama tidak dihapus.' };
  } finally {
    lock.releaseLock();
  }
}

function setup2026Finishing() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw new Error('Pembaruan sedang dijalankan. Coba lagi.');
  try {
    const ss = getSpreadsheet_();
    const sheet = ensureSheet_(ss, SHEETS.teams, SCHEMAS[SHEETS.teams]);
    const rows = readObjects_(sheet);
    const rowById = new Map(rows.map((row, index) => [String(row.id), index + 2]));
    const nameColumn = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].indexOf('name') + 1;
    let updatedTeams = 0;
    get2026Roster_().forEach((team) => {
      const rowNumber = rowById.get(team.id);
      if (!rowNumber) return;
      if (String(rows[rowNumber - 2].name) !== team.name) {
        sheet.getRange(rowNumber, nameColumn).setValue(team.name);
        updatedTeams++;
      }
    });
    const updatedModules = upsert2026Modules_(ss, now_());
    return { ok: true, updatedTeams: updatedTeams, updatedModules: updatedModules, message: 'Nama tim dan materi 2026 siap.' };
  } finally {
    lock.releaseLock();
  }
}

function upsert2026Modules_(ss, now) {
  ensureSheet_(ss, SHEETS.learningModules, SCHEMAS[SHEETS.learningModules]);
  const existingModules = new Map(readObjects_(ss.getSheetByName(SHEETS.learningModules)).map((row) => [String(row.id), row]));
  const modules = [
    ['byp26-module-finalia', 'Entrepreneurship - Yang Finalia', 'Tanahwari By Yang Finalia.pdf', 'https://drive.google.com/file/d/169Ilzxt5MkvCcxBH4u6gyCD4u-zjHRAR/view'],
    ['byp26-module-enti', 'Digital Marketing Medsos dan Monetisasi - Enti Hidayati', 'Digital Marketing dan Monetisasi_Enti Hidayati.pdf', 'https://drive.google.com/file/d/1nkNRyivvyoNjxoBNMV4ZMJSXeQNkrP5P/view'],
    ['byp26-module-cento', 'Media Sosial dan Katalog Produk - Cento Sadewa', 'cento & MNJD.pdf', 'https://drive.google.com/file/d/1HMbC_Qr79ucCt3TOKKgNgBkyfc36GkiN/view'],
    ['byp26-module-lereng', 'Artificial Intelligence untuk UMKM - Lereng Cahyo Handoko', 'AI Powered UMKM.pdf', 'https://drive.google.com/file/d/1Uh-iON790Rm0YYgs4k8hNuRqgcpcpO8p/view'],
  ];
  let updated = 0;
  modules.forEach((module) => {
    if (existingModules.has(module[0])) {
      if (!existingModules.get(module[0]).material_url) updateObjectById_(SHEETS.learningModules, module[0], { material_url: module[3] });
    } else {
      appendObject_(SHEETS.learningModules, { id: module[0], course_id: 'byp26-course', title: module[1], date: '2026-11-18', status: 'Materi tersedia', progress: 0, materials: module[2], assignment: '', quiz_average: 0, material_url: module[3], created_at: now });
    }
    updated++;
  });
  return updated;
}

function get2026Roster_() {
  const campuses = [
    ['unmuh', 'Universitas Muhammadiyah Bangka Belitung', 'Isti Widiharjanti, S.E.I., M.M'],
    ['iain', 'IAIN Syaikh Abdurrahman Siddik Bangka Belitung', 'Rifyal Zuhdi Gultom, S.E., M.SEI.'],
    ['pertiba', 'Universitas Pertiba', 'Nelly Astuti, S.E., M.M.'],
    ['unaba', 'Universitas Anak Bangsa', 'Yunita Maharani, S.E., M.Si'],
    ['ubb', 'Universitas Bangka Belitung', 'Tiara Fitari, M.B.A'],
  ];
  const rows = [
    [0, 1, 'LOKALINK', 'Batik Kampung Dul', 'Batik', ['M. Rangga Putra Kelana', 'Maya Fransiska', 'Iqmal Prakoso']],
    [0, 2, 'TRUNTUM', 'Batik Deshanda', 'Batik', ['Lafadz Umama Al Istiqna', 'Misasi', 'Ridho Winanda']],
    [1, 1, 'Hanrevel', 'Batik Asdarya', 'Batik', ['Ruhana', 'Novela Citra', 'Renata Putri']],
    [1, 2, 'SASFIA', 'Fiya Batik Tulis', 'Batik', ['Yuliana', 'Sandaria', 'Nasrullah']],
    [2, 1, 'Go Green', "D'Bhori", '', ['Fitrianty Anggriana', 'Regina Awaliyah', 'Mira Apriani']],
    [2, 2, 'Benang Merah', 'Batik Kemuning', 'Batik', ['Mohammad Dimas Frayoga', 'Novela Safitri', 'Riski Alamsyah']],
    [3, 1, 'FloraTrace', 'My Botanical Eco Print Bangka', 'Ecoprint', ['Dara', 'Riko', 'Dewangga Prasetio']],
    [3, 2, 'DigiScoral Squad', 'Shinta Cual', 'Cual', ['Adelliya Lestari', 'Gustria', 'Ayi Mareza']],
    [4, 1, 'Wastra Serumpun', 'Asti Rajutan dan Batik', 'Batik', ['Ninda', 'Moresha Jatman', 'Evelyn Gracia']],
    [4, 2, 'The Sandau', 'SBA Cual Bangka', 'Cual', ['Muhammad Dafit', 'Meliya', 'Iren Ajeng']],
  ];
  return rows.map((row) => ({
    id: 'byp26-' + campuses[row[0]][0] + '-' + row[1],
    name: row[3] + ' - ' + row[2],
    nickname: row[2],
    campusId: 'byp26-campus-' + campuses[row[0]][0],
    campus: campuses[row[0]][1],
    lecturer: campuses[row[0]][2],
    umkmId: 'byp26-umkm-' + campuses[row[0]][0] + '-' + row[1],
    umkm: row[3],
    category: row[4],
    members: row[5],
  }));
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
    if (action === 'getRegistrationOptions' && method === 'GET') return json_(getRegistrationOptions_());
    if (action !== 'test' && method !== 'POST') return json_({ ok: false, code: 'METHOD_NOT_ALLOWED', error: 'Gunakan POST untuk tindakan ini.' });
    if (action === 'submitKurasi') return json_(submitKurasi_(payload));
    if (action === 'bootstrap') return json_({ ok: false, error: 'Bootstrap hanya boleh dijalankan dari editor Apps Script oleh administrator.' });
    if (action === 'getData') return json_(getData_(payload));
    if (action === 'getApprovalQueue') return json_(getApprovalQueue_(payload));
    if (action === 'approveAccount') return json_(approveAccount_(payload));
    if (action === 'saveModule') return json_(saveModule_(payload));
    if (action === 'createAttendanceSession') return json_(createAttendanceSession_(payload));
    if (action === 'loginWithGoogle') return json_(loginWithGoogle_(payload));
    if (action === 'getSession') return json_(getSession_(payload));
    if (action === 'logout') return json_(logout_(payload));
    if (action === 'registerAccount') return json_(registerAccount_(payload));
    if (action === 'submitWeeklyReport') return json_(submitWeeklyReport_(payload));
    if (action === 'reviewWeeklyReport') return json_(reviewWeeklyReport_(payload));
    if (action === 'submitOutput') return json_(submitOutput_(payload));
    if (action === 'submitScore') return json_(submitScore_(payload));
    if (action === 'submitAttendance') return json_(submitAttendance_(payload));
    if (action === 'exportCsv') return json_(exportCsv_(payload));

    return json_({ ok: false, error: 'Unknown action: ' + action });
  } catch (error) {
    return json_({ ok: false, code: error && error.code ? error.code : undefined, error: String(error && error.message ? error.message : error) });
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
  // A manual roster migration is required; bootstrap never inserts sample participants.
  audit_('system', 'bootstrap', 'spreadsheet', MONITORING_SPREADSHEET_ID, {});
  return {
    ok: true,
    message: drive.ok ? 'Monitoring sheets and Drive folder are ready.' : 'Monitoring sheets are ready. Drive authorization is still needed for uploads and exports.',
    spreadsheet_id: MONITORING_SPREADSHEET_ID,
    drive: drive,
  };
}

function getData_(payload) {
  const profile = requireProfile_(payload);
  const ss = getSpreadsheet_();
  const campuses = readObjects_(ss.getSheetByName(SHEETS.campuses));
  const umkms = readObjects_(ss.getSheetByName(SHEETS.umkms));
  const teams = scopeTeamsForProfile_(profile, readObjects_(ss.getSheetByName(SHEETS.teams)).filter((team) => String(team.program_year) === '2026' || String(team.id).startsWith('byp26-')));
  const teamIds = teams.map((team) => team.id);
  const members = readObjects_(ss.getSheetByName(SHEETS.teamMembers));
  const mentors = buildMentors_(ss, profile, teams);
  const reports = readObjects_(ss.getSheetByName(SHEETS.weeklyReports)).filter((row) => teamIds.includes(row.team_id));
  const outputs = readObjects_(ss.getSheetByName(SHEETS.outputs)).filter((row) => teamIds.includes(row.team_id));

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
        nickname: team.nickname || '',
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
        reports: reports.filter((row) => row.team_id === team.id).length,
        outputs: outputs.filter((row) => row.team_id === team.id).length,
        attendance: Number(team.attendance || 0),
      };
    }),
    reports: reports.map(reportForClient_),
    outputs: outputs.map((row) => ({
      id: row.id,
      teamId: row.team_id,
      type: row.type || '',
      title: row.title || '',
      driveLink: row.drive_link || '',
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
    mentors: mentors,
    attendanceSessions: isAdminRole_(profile.role) ? readObjects_(ss.getSheetByName(SHEETS.attendanceSessions)).filter((row) => String(row.id).startsWith('byp26-')).map((row) => ({ id: row.id, title: row.title, token: row.token, startsAt: row.starts_at, endsAt: row.ends_at, location: row.location })) : [],
    attendanceRecords: readObjects_(ss.getSheetByName(SHEETS.attendanceRecords)).filter((row) => teamIds.includes(row.team_id) && (isAdminRole_(profile.role) || String(row.email).toLowerCase() === profile.email || profile.role === 'dosen')).map((row) => ({ id: row.id, sessionId: row.session_id, teamId: row.team_id, name: row.name, status: row.status, submittedAt: row.submitted_at, photoUrl: row.photo_drive_url })),
    learningModules: readObjects_(ss.getSheetByName(SHEETS.learningModules)).filter((row) => String(row.id).startsWith('byp26-module-')).map((row) => ({ id: row.id, title: row.title, date: row.date, materialName: row.materials, materialUrl: row.material_url || '' })),
  };
}

function getRegistrationOptions_() {
  const ss = getSpreadsheet_();
  const campuses = readObjects_(ss.getSheetByName(SHEETS.campuses)).filter((row) => String(row.id).startsWith('byp26-'));
  const umkms = readObjects_(ss.getSheetByName(SHEETS.umkms)).filter((row) => String(row.id).startsWith('byp26-'));
  const teams = readObjects_(ss.getSheetByName(SHEETS.teams)).filter((row) => String(row.id).startsWith('byp26-'));
  return {
    ok: true,
    campuses: campuses.map((row) => ({ id: row.id, name: row.name })),
    umkms: umkms.filter((row) => teams.some((team) => team.umkm_id === row.id)).map((row) => ({ id: row.id, name: row.business_name })),
    teams: teams.map((row) => ({ id: row.id, name: row.name, campusId: row.campus_id, umkmId: row.umkm_id })),
  };
}

function loginWithGoogle_(payload) {
  const identity = verifyGoogleIdToken_(payload.id_token);
  if (!identity.ok) return identity;

  const users = readObjects_(getSpreadsheet_().getSheetByName(SHEETS.appUsers));
  const user = users.find((item) => String(item.email || '').trim().toLowerCase() === identity.email);
  const userError = validateActiveUser_(user);
  if (userError) return userError;

  const session = createSession_(user);
  const profile = profileFromUser_(user);
  audit_(profile.email, 'loginWithGoogle', 'session', session.id, { user_id: user.id });
  return { ok: true, profile: profile, session: { token: session.token, expiresAt: session.expires_at } };
}

function getSession_(payload) {
  const context = getSessionContext_(payload);
  return {
    ok: true,
    profile: context.profile,
    session: { token: context.token, expiresAt: new Date(context.session.expires_at).toISOString() },
  };
}

function logout_(payload) {
  const token = String((payload || {}).session_token || '');
  if (!token) return { ok: true };
  const session = findSession_(token);
  if (session) updateObjectById_(SHEETS.sessions, session.id, { revoked_at: now_() });
  return { ok: true };
}

function verifyGoogleIdToken_(idToken) {
  if (!GOOGLE_OAUTH_CLIENT_ID) return { ok: false, error: 'Google OAuth belum dikonfigurasi di Apps Script.' };
  if (!idToken || String(idToken).split('.').length !== 3) return { ok: false, error: 'Bukti identitas Google tidak valid.' };
  try {
    const url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(String(idToken));
    const response = UrlFetchApp.fetch(url, { method: 'get', muteHttpExceptions: true });
    if (response.getResponseCode() !== 200) return { ok: false, error: 'Token Google tidak dapat diverifikasi.' };
    const token = JSON.parse(response.getContentText() || '{}');
    const issuer = String(token.iss || '');
    const isExpired = Number(token.exp || 0) * 1000 <= Date.now();
    if (String(token.aud || '') !== GOOGLE_OAUTH_CLIENT_ID || !['accounts.google.com', 'https://accounts.google.com'].includes(issuer) || String(token.email_verified) !== 'true' || isExpired) {
      return { ok: false, error: 'Token Google tidak sesuai untuk aplikasi ini.' };
    }
    const email = String(token.email || '').trim().toLowerCase();
    if (!email) return { ok: false, error: 'Email Google tidak ditemukan.' };
    return { ok: true, email: email };
  } catch (error) {
    return { ok: false, error: 'Verifikasi identitas Google gagal.' };
  }
}

function validateActiveUser_(user) {
  if (!user) return { ok: false, error: 'Email belum terdaftar. Silakan register terlebih dahulu.' };
  if (String(user.status || '').toLowerCase() !== 'active') return { ok: false, pending: true, error: 'Akun menunggu konfirmasi admin.' };
  if (!isKnownRole_(user.role)) return { ok: false, pending: true, error: 'Akun belum memiliki role. Admin perlu menetapkan role terlebih dahulu.' };
  return null;
}

function isKnownRole_(role) {
  return ['super_admin', 'admin_panitia', 'admin', 'dosen', 'mahasiswa', 'ketua_tim', 'umkm', 'kampus_viewer', 'pimpinan_viewer', 'juri'].includes(String(role || '').toLowerCase());
}

function profileFromUser_(user) {
  return {
    role: String(user.role || '').toLowerCase(),
    name: user.name || '',
    title: roleTitle_(String(user.role || '').toLowerCase()),
    email: String(user.email || '').toLowerCase(),
    teamId: user.team_id || '',
    campusId: user.campus_id || '',
    umkmId: user.umkm_id || '',
  };
}

function createSession_(user) {
  const token = Utilities.getUuid() + Utilities.getUuid() + new Date().getTime();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_SECONDS * 1000).toISOString();
  const row = {
    id: makeId_('session'),
    user_id: user.id,
    token_hash: hashToken_(token),
    expires_at: expiresAt,
    revoked_at: '',
    created_at: now.toISOString(),
  };
  appendObject_(SHEETS.sessions, row);
  return { id: row.id, token: token, expires_at: expiresAt };
}

function findSession_(token) {
  const tokenHash = hashToken_(token);
  return readObjects_(getSpreadsheet_().getSheetByName(SHEETS.sessions)).find((item) => String(item.token_hash || '') === tokenHash);
}

function getSessionContext_(payload) {
  const token = String((payload || {}).session_token || '');
  if (!token) throw apiError_('SESSION_REQUIRED', 'Sesi login diperlukan.');
  const session = findSession_(token);
  const expiresAt = session ? new Date(session.expires_at).getTime() : NaN;
  if (!session || session.revoked_at || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) throw apiError_('SESSION_EXPIRED', 'Sesi sudah tidak berlaku. Silakan masuk kembali.');
  const users = readObjects_(getSpreadsheet_().getSheetByName(SHEETS.appUsers));
  const user = users.find((item) => String(item.id || '') === String(session.user_id || ''));
  const userError = validateActiveUser_(user);
  if (userError) throw apiError_('ACCOUNT_DISABLED', userError.error);
  return { token: token, session: session, profile: profileFromUser_(user) };
}

function registerAccount_(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const name = String(payload.name || '').trim();
  const requestedRole = String(payload.requested_role || '').trim().toLowerCase();
  const institution = String(payload.institution || '').trim();
  const whatsapp = String(payload.whatsapp || '').trim();
  const note = String(payload.note || '').trim();
  const requestedTeamId = String(payload.requested_team_id || '').trim();
  const requestedUmkmId = String(payload.requested_umkm_id || '').trim();
  const requestedCampusId = String(payload.requested_campus_id || '').trim();
  const dataConsent = payload.data_consent === true || String(payload.data_consent || '').toLowerCase() === 'true';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'Email Google wajib diisi dengan format yang benar.' };
  if (!name || name.length > 120) return { ok: false, error: 'Nama lengkap wajib diisi dan maksimal 120 karakter.' };
  if (!['mahasiswa', 'dosen', 'umkm', 'juri', 'admin_panitia', 'kampus_viewer', 'pimpinan_viewer'].includes(requestedRole)) return { ok: false, error: 'Role pendaftaran tidak valid.' };
  if (institution.length > 160 || whatsapp.length > 32 || note.length > 500) return { ok: false, error: 'Data pendaftaran melebihi batas yang diizinkan.' };
  if (!dataConsent) return { ok: false, error: 'Persetujuan pemrosesan data wajib diberikan.' };

  if (requestedTeamId || requestedUmkmId || requestedCampusId) {
    const options = getRegistrationOptions_();
    const validTeam = options.teams.some((team) => team.id === requestedTeamId);
    const validUmkm = options.umkms.some((umkm) => umkm.id === requestedUmkmId);
    const validCampus = options.campuses.some((campus) => campus.id === requestedCampusId);
    if ((requestedRole === 'mahasiswa' || requestedRole === 'ketua_tim') && (!validTeam || requestedUmkmId || requestedCampusId)) return { ok: false, error: 'Pilih tim 2026 yang valid.' };
    if (requestedRole === 'umkm' && (!validUmkm || requestedTeamId || requestedCampusId)) return { ok: false, error: 'Pilih UMKM 2026 yang valid.' };
    if ((requestedRole === 'dosen' || requestedRole === 'kampus_viewer') && (!validCampus || requestedTeamId || requestedUmkmId)) return { ok: false, error: 'Pilih kampus 2026 yang valid.' };
    if (!['mahasiswa', 'ketua_tim', 'umkm', 'dosen', 'kampus_viewer'].includes(requestedRole)) return { ok: false, error: 'Penugasan tidak sesuai role pendaftaran.' };
  }

  const cache = CacheService.getScriptCache();
  const rateLimitKey = 'registration-' + hashToken_(email);
  if (cache.get(rateLimitKey)) return { ok: false, error: 'Permintaan pendaftaran baru saja dikirim. Tunggu satu menit sebelum mencoba lagi.' };
  cache.put(rateLimitKey, '1', 60);

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
    requested_team_id: requestedTeamId,
    requested_umkm_id: requestedUmkmId,
    requested_campus_id: requestedCampusId,
    data_consent: 'true',
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

  audit_(email, 'registerAccount', 'registration', row.id, { email: email, requested_role: requestedRole, status: row.status });
  return {
    ok: true,
    status: 'pending_admin_review',
    message: 'Registrasi diterima. Admin akan mengonfirmasi akun dan menetapkan role.',
    row: row,
  };
}

function getApprovalQueue_(payload) {
  const actor = requireProfile_(payload);
  if (!isAdminRole_(actor.role)) throw apiError_('FORBIDDEN', 'Hanya admin yang dapat meninjau pendaftaran.');
  const ss = getSpreadsheet_();
  const users = readObjects_(ss.getSheetByName(SHEETS.appUsers));
  const pending = readObjects_(ss.getSheetByName(SHEETS.registrations))
    .filter((row) => String(row.status) === 'pending_admin_review')
    .filter((row) => !users.some((user) => String(user.email).toLowerCase() === String(row.email).toLowerCase() && String(user.status) === 'active'));
  const campuses = readObjects_(ss.getSheetByName(SHEETS.campuses)).filter((row) => String(row.id).startsWith('byp26-'));
  const teams = readObjects_(ss.getSheetByName(SHEETS.teams)).filter((row) => String(row.id).startsWith('byp26-'));
  const umkms = readObjects_(ss.getSheetByName(SHEETS.umkms)).filter((row) => String(row.id).startsWith('byp26-') && teams.some((team) => team.umkm_id === row.id));
  const members = readObjects_(ss.getSheetByName(SHEETS.teamMembers));
  const normalize = (value) => String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
  return {
    ok: true,
    registrations: pending.map((row) => {
      const requestedRole = String(row.requested_role);
      const match = requestedRole === 'dosen' ? campuses.find((campus) => normalize(campus.pic) === normalize(row.name))
        : requestedRole === 'kampus_viewer' ? campuses.find((campus) => normalize(campus.name) === normalize(row.institution))
        : requestedRole === 'umkm' ? umkms.find((umkm) => normalize(umkm.business_name) === normalize(row.institution))
        : members.find((member) => normalize(member.name) === normalize(row.name) && teams.some((team) => team.id === member.team_id));
      return { id: row.id, email: row.email, name: row.name, requestedRole: row.requested_role, institution: row.institution, whatsapp: row.whatsapp, note: row.note, submittedAt: row.submitted_at,
        requestedAssignmentId: row.requested_team_id || row.requested_umkm_id || row.requested_campus_id || '',
        suggestedAssignmentId: match ? (match.team_id || match.id) : '' };
    }),
    campuses: campuses.map((row) => ({ id: row.id, name: row.name })),
    teams: teams.map((row) => ({ id: row.id, name: row.name, campusId: row.campus_id })),
    umkms: umkms.map((row) => ({ id: row.id, name: row.business_name })),
  };
}

function approveAccount_(payload) {
  const actor = requireProfile_(payload);
  if (!isAdminRole_(actor.role)) throw apiError_('FORBIDDEN', 'Hanya admin yang dapat mengaktifkan akun.');
  const role = String(payload.role || '').trim().toLowerCase();
  if (!['dosen', 'mahasiswa', 'ketua_tim', 'umkm', 'kampus_viewer'].includes(role)) throw apiError_('INVALID_ROLE', 'Role persetujuan tidak valid.');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw apiError_('BUSY', 'Persetujuan sedang diproses. Coba lagi.');
  try {
    const ss = getSpreadsheet_();
    const registration = readObjects_(ss.getSheetByName(SHEETS.registrations)).find((row) => String(row.id) === String(payload.registration_id));
    if (!registration || String(registration.status) !== 'pending_admin_review') throw apiError_('NOT_PENDING', 'Pendaftaran tidak ditemukan atau sudah diproses.');
    const requestedRole = String(registration.requested_role || '');
    if ((role === 'mahasiswa' || role === 'ketua_tim') ? !['mahasiswa', 'ketua_tim'].includes(requestedRole) : role !== requestedRole) throw apiError_('ROLE_MISMATCH', 'Role persetujuan tidak sesuai pendaftaran.');
    const campusId = String(payload.campus_id || '');
    const teamId = String(payload.team_id || '');
    const umkmId = String(payload.umkm_id || '');
    const campuses = readObjects_(ss.getSheetByName(SHEETS.campuses));
    const teams = readObjects_(ss.getSheetByName(SHEETS.teams));
    if (['dosen', 'kampus_viewer'].includes(role) && !campuses.some((row) => String(row.id) === campusId && campusId.startsWith('byp26-'))) throw apiError_('INVALID_CAMPUS', 'Pilih kampus 2026 yang valid.');
    const team = teams.find((row) => String(row.id) === teamId && teamId.startsWith('byp26-'));
    if (['mahasiswa', 'ketua_tim'].includes(role) && !team) throw apiError_('INVALID_TEAM', 'Pilih tim 2026 yang valid.');
    if (role === 'umkm' && (!umkmId.startsWith('byp26-') || !teams.some((row) => String(row.umkm_id) === umkmId && String(row.id).startsWith('byp26-')))) throw apiError_('INVALID_UMKM', 'Pilih UMKM 2026 yang valid.');
    const users = readObjects_(ss.getSheetByName(SHEETS.appUsers));
    const user = users.find((row) => String(row.email || '').toLowerCase() === String(registration.email || '').toLowerCase());
    if (!user || String(user.status).toLowerCase() === 'active') throw apiError_('ACCOUNT_STATE', 'Akun sudah aktif atau belum terdaftar.');
    const studentRole = ['mahasiswa', 'ketua_tim'].includes(role);
    const assignment = { name: registration.name, role: role, campus_id: studentRole ? team.campus_id : ['dosen', 'kampus_viewer'].includes(role) ? campusId : '',
      team_id: studentRole ? teamId : '', umkm_id: role === 'umkm' ? umkmId : '', status: 'active' };
    if (!updateObjectById_(SHEETS.appUsers, user.id, assignment)) throw apiError_('UPDATE_FAILED', 'Akun tidak dapat diperbarui.');
    updateObjectById_(SHEETS.registrations, registration.id, { status: 'approved', admin_note: String(payload.admin_note || '').slice(0, 500) });
    audit_(actor.email, 'approveAccount', 'registration', registration.id, { email: registration.email, role: role, campus_id: assignment.campus_id, team_id: assignment.team_id, umkm_id: assignment.umkm_id });
    return { ok: true, email: registration.email, role: role };
  } finally {
    lock.releaseLock();
  }
}

function saveModule_(payload) {
  const actor = requireProfile_(payload);
  if (!isAdminRole_(actor.role)) throw apiError_('FORBIDDEN', 'Hanya admin yang dapat mengelola modul.');
  const moduleId = String(payload.module_id || '');
  const url = String(payload.material_url || '').trim();
  if (!moduleId.startsWith('byp26-module-')) throw apiError_('INVALID_MODULE', 'Modul 2026 tidak valid.');
  if (url && !/^https:\/\/(drive\.google\.com|docs\.google\.com)\//i.test(url)) throw apiError_('INVALID_URL', 'Gunakan tautan HTTPS Google Drive atau Docs.');
  const ss = getSpreadsheet_();
  const module = readObjects_(ss.getSheetByName(SHEETS.learningModules)).find((row) => String(row.id) === moduleId);
  if (!module) throw apiError_('INVALID_MODULE', 'Modul tidak ditemukan.');
  if (!updateObjectById_(SHEETS.learningModules, moduleId, { material_url: url })) throw apiError_('UPDATE_FAILED', 'Tautan modul gagal disimpan.');
  audit_(actor.email, 'saveModule', 'learning_module', moduleId, { material_url: url });
  return { ok: true, id: moduleId, materialUrl: url };
}

function buildMentors_(ss, profile, scopedTeams) {
  if (!isAdminRole_(profile.role) && profile.role !== 'dosen') return [];

  const campuses = readObjects_(ss.getSheetByName(SHEETS.campuses));
  const campusNameById = {};
  campuses.forEach((campus) => { campusNameById[campus.id] = campus.name || ''; });

  const accountMentors = readObjects_(ss.getSheetByName(SHEETS.appUsers))
    .filter((user) => ['dosen', 'admin_panitia', 'admin', 'super_admin'].includes(String(user.role || '').toLowerCase()))
    .filter((user) => {
      if (isAdminRole_(profile.role)) return true;
      const role = String(user.role || '').toLowerCase();
      return role !== 'dosen' || String(user.email || '').toLowerCase() === profile.email || String(user.campus_id || '') === profile.campusId;
    })
    .map((user) => {
      const role = String(user.role || '').toLowerCase();
      const campusId = String(user.campus_id || '');
      return {
        id: user.id || makeId_('mentor'),
        name: user.name || 'Pendamping Program',
        email: String(user.email || '').toLowerCase(),
        role: role === 'dosen' ? 'dosen' : 'admin_panitia',
        campus: campusNameById[campusId] || (role === 'dosen' ? 'Kampus belum diatur' : 'Lintas kampus'),
        specialization: role === 'dosen' ? 'Pendamping akademik dan implementasi lapangan' : 'Monitoring, validasi, dan koordinasi lintas tim',
        assignedTeams: role === 'dosen' && campusId ? scopedTeams.filter((team) => String(team.campus_id || '') === campusId).length : scopedTeams.length,
        status: String(user.status || '').toLowerCase() === 'active' ? 'aktif' : 'perlu_penugasan',
      };
    });
  const listedLecturers = campuses
    .filter((campus) => String(campus.id || '').startsWith('byp26-campus-') && campus.pic)
    .filter((campus) => isAdminRole_(profile.role) || String(campus.id) === profile.campusId)
    .filter((campus) => !accountMentors.some((mentor) => mentor.role === 'dosen' && mentor.campus === campus.name && mentor.name === campus.pic))
    .map((campus) => ({
      id: 'lecturer-' + campus.id,
      name: campus.pic,
      email: '',
      role: 'dosen',
      campus: campus.name,
      specialization: 'Pendamping akademik dan implementasi lapangan',
      assignedTeams: scopedTeams.filter((team) => String(team.campus_id) === String(campus.id)).length,
      status: 'perlu_penugasan',
    }));
  return accountMentors.concat(listedLecturers);
}

function scopeTeamsForProfile_(profile, teams) {
  if (!profile) return [];
  if (canSeeAllTeams_(profile.role)) return teams;
  if (isStudentRole_(profile.role)) return profile.teamId ? teams.filter((team) => team.id === profile.teamId) : [];
  if (profile.role === 'umkm') return profile.umkmId ? teams.filter((team) => team.umkm_id === profile.umkmId) : [];
  if (profile.role === 'dosen' || profile.role === 'kampus_viewer') return profile.campusId ? teams.filter((team) => team.campus_id === profile.campusId) : [];
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
  return getSessionContext_(payload || {}).profile;
}

function canAccessTeam_(profile, teamId) {
  if (!teamId) return false;
  const teams = readObjects_(getSpreadsheet_().getSheetByName(SHEETS.teams));
  return scopeTeamsForProfile_(profile, teams).some((team) => team.id === teamId);
}

function submitWeeklyReport_(payload) {
  const profile = requireProfile_(payload);
  if (!isStudentRole_(profile.role)) throw apiError_('FORBIDDEN', 'Hanya mahasiswa dalam tim yang dapat mengisi laporan.');
  if (!profile.teamId || String(profile.teamId) !== String(payload.team_id) || !String(profile.teamId).startsWith('byp26-')) throw apiError_('FORBIDDEN', 'Laporan hanya boleh diisi untuk tim sendiri.');
  if (!canAccessTeam_(profile, profile.teamId)) throw apiError_('FORBIDDEN', 'Tim 2026 tidak ditemukan atau belum ditetapkan ke akun ini.');
  const week = Number(payload.week);
  if (!WEEKLY_PLAN_2026[week]) throw apiError_('INVALID_WEEK', 'Pilih periode laporan 1, 2, atau 3.');
  const mode = String(payload.mode || '');
  if (!['draft', 'submit'].includes(mode)) throw apiError_('INVALID_STATUS', 'Pilih simpan draft atau kirim laporan.');
  if (mode === 'submit' && isPastFinalDeadline_()) throw apiError_('DEADLINE_PASSED', 'Batas pengumpulan 9 Desember 2026 pukul 23.59 WIB sudah lewat.');
  const requestId = String(payload.request_id || '').trim();
  if (!requestId || requestId.length > 128) throw apiError_('REQUEST_ID_REQUIRED', 'ID pengiriman tidak valid.');
  const obstacles = String(payload.obstacles || '').trim();
  const nextPlan = String(payload.next_plan || '').trim();
  const plannedVisitAt = checkedVisitDateTime_(payload.planned_visit_at);
  if (obstacles.length > 1000 || nextPlan.length > 1000) throw apiError_('TEXT_TOO_LONG', 'Kendala dan tindak lanjut maksimal 1000 karakter.');
  const items = parseWeeklyItems_(payload.items_json, week);
  const finalOutputs = parseFinalOutputs_(payload.final_outputs_json, week);
  const umkmApprovalUrl = checkedUrl_(payload.umkm_approval_url);
  if (mode === 'submit' && !items.some((item) => item.evidenceUrl)) throw apiError_('EVIDENCE_REQUIRED', 'Tambahkan setidaknya satu tautan bukti sebelum mengirim laporan.');
  const normalized = { team_id: profile.teamId, week: week, mode: mode, items: items, finalOutputs: finalOutputs, obstacles: obstacles, nextPlan: nextPlan, umkmApprovalUrl: umkmApprovalUrl, plannedVisitAt: plannedVisitAt };
  const requestHash = hashToken_(JSON.stringify(normalized));
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw apiError_('BUSY', 'Laporan sedang disimpan. Coba lagi.');
  try {
    const ss = getSpreadsheet_();
    ensureSheet_(ss, SHEETS.weeklyReports, SCHEMAS[SHEETS.weeklyReports]);
    ensureSheet_(ss, SHEETS.weeklyReportHistory, SCHEMAS[SHEETS.weeklyReportHistory]);
    const existing = readObjects_(ss.getSheetByName(SHEETS.weeklyReports)).find((row) => String(row.team_id) === profile.teamId && Number(row.week) === week && (String(row.program_year) === '2026' || String(row.team_id).startsWith('byp26-')));
    const past = readObjects_(ss.getSheetByName(SHEETS.weeklyReportHistory)).find((row) => String(row.request_id) === requestId && String(row.actor_email) === profile.email);
    if (past) {
      if (String(past.request_hash) !== requestHash) throw apiError_('REQUEST_REUSED', 'ID pengiriman sudah dipakai untuk isi berbeda.');
      if (week === 3 && existing && String(existing.report_status) !== 'verified') upsertFinalOutputs_(existing, parseJson_(existing.final_outputs_json, finalOutputs));
      return { ok: true, row: reportForClient_(existing), replayed: true };
    }
    if (existing && String(existing.report_status) === 'verified') throw apiError_('LOCKED', 'Laporan terverifikasi tidak dapat diubah. Hubungi panitia.');
    const timestamp = now_();
    const previousItems = existing ? parseJson_(existing.items_json, []) : [];
    const stampedItems = items.map((item) => {
      const previous = previousItems.find((entry) => entry.id === item.id);
      const unchanged = previous && previous.status === item.status && previous.evidenceUrl === item.evidenceUrl && previous.note === item.note;
      return { ...item, updatedAt: unchanged ? previous.updatedAt : timestamp };
    });
    const row = {
      id: existing ? existing.id : makeId_('byp26-wr'), team_id: profile.teamId, week: week,
      activity: '', progress: '', obstacles: obstacles, next_plan: nextPlan, planned_visit_at: plannedVisitAt,
      drive_link: '', publication_link: '', validation: mode === 'draft' ? 'draft' : 'pending',
      submitted_by: profile.email, submitted_at: mode === 'submit' ? timestamp : existing ? existing.submitted_at || '' : '',
      request_id: requestId, program_year: 2026, report_status: mode === 'draft' ? 'draft' : 'submitted',
      items_json: JSON.stringify(stampedItems), final_outputs_json: JSON.stringify(finalOutputs),
      umkm_approval_url: umkmApprovalUrl, umkm_approved: existing && String(existing.final_outputs_json || '') === JSON.stringify(finalOutputs) && String(existing.items_json || '') === JSON.stringify(stampedItems) && String(existing.umkm_approval_url || '') === umkmApprovalUrl ? existing.umkm_approved || '' : '',
      umkm_note: existing ? existing.umkm_note || '' : '', review_note: existing ? existing.review_note || '' : '', reviewed_by: existing ? existing.reviewed_by || '' : '', reviewed_at: existing ? existing.reviewed_at || '' : '',
      updated_at: timestamp, revision: Number(existing && existing.revision || 0) + 1, request_hash: requestHash,
    };
    if (existing) updateObjectById_(SHEETS.weeklyReports, existing.id, row);
    else appendObject_(SHEETS.weeklyReports, row);
    appendWeeklyHistory_(row, profile.email, 'save', requestId, requestHash);
    if (week === 3) upsertFinalOutputs_(row, finalOutputs);
    audit_(profile.email, 'submitWeeklyReport', 'weekly_report', row.id, { team_id: row.team_id, week: week, status: row.report_status, revision: row.revision });
    return { ok: true, row: reportForClient_(row) };
  } finally { lock.releaseLock(); }
}

function reviewWeeklyReport_(payload) {
  const profile = requireProfile_(payload);
  const decision = String(payload.decision || '');
  if (!['revision', 'verified', 'umkm_approve', 'umkm_revision'].includes(decision)) throw apiError_('INVALID_REVIEW', 'Keputusan review tidak valid.');
  if (decision === 'verified' && !isAdminRole_(profile.role)) throw apiError_('FORBIDDEN', 'Hanya panitia dapat memverifikasi laporan.');
  if (decision === 'revision' && !isAdminRole_(profile.role) && profile.role !== 'dosen') throw apiError_('FORBIDDEN', 'Hanya dosen atau panitia dapat meminta revisi.');
  if (decision.startsWith('umkm_') && profile.role !== 'umkm') throw apiError_('FORBIDDEN', 'Hanya UMKM mitra dapat memberi persetujuan UMKM.');
  const note = String(payload.note || '').trim();
  if (note.length > 1000 || ((decision === 'revision' || decision === 'umkm_revision') && !note)) throw apiError_('INVALID_NOTE', 'Catatan revisi wajib diisi, maksimal 1000 karakter.');
  const requestId = String(payload.request_id || '').trim();
  if (!requestId || requestId.length > 128) throw apiError_('REQUEST_ID_REQUIRED', 'ID review tidak valid.');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw apiError_('BUSY', 'Review sedang diproses. Coba lagi.');
  try {
    const ss = getSpreadsheet_();
    ensureSheet_(ss, SHEETS.weeklyReports, SCHEMAS[SHEETS.weeklyReports]);
    ensureSheet_(ss, SHEETS.weeklyReportHistory, SCHEMAS[SHEETS.weeklyReportHistory]);
    const row = readObjects_(ss.getSheetByName(SHEETS.weeklyReports)).find((item) => String(item.id) === String(payload.report_id) && String(item.team_id).startsWith('byp26-'));
    if (!row || !canAccessTeam_(profile, row.team_id)) throw apiError_('FORBIDDEN', 'Laporan tidak sesuai akses Anda.');
    const hash = hashToken_(JSON.stringify({ reportId: row.id, decision: decision, note: note }));
    const past = readObjects_(ss.getSheetByName(SHEETS.weeklyReportHistory)).find((item) => String(item.request_id) === requestId && String(item.actor_email) === profile.email);
    if (past) {
      if (String(past.request_hash) !== hash) throw apiError_('REQUEST_REUSED', 'ID review sudah dipakai untuk keputusan berbeda.');
      if (decision === 'verified' && Number(row.week) === 3 && String(row.report_status) === 'verified') markFinalOutputsVerified_(row.id);
      return { ok: true, row: reportForClient_(row), replayed: true };
    }
    if (String(row.report_status) !== 'submitted') throw apiError_('REVIEW_NOT_READY', 'Hanya laporan yang sudah dikirim dapat direview.');
    if (decision === 'verified' && !canVerifyWeekly_(row)) throw apiError_('INCOMPLETE', 'Checklist, bukti, atau output final belum lengkap untuk verifikasi.');
    const timestamp = now_();
    const patch = { updated_at: timestamp, reviewed_at: timestamp, reviewed_by: profile.email, revision: Number(row.revision || 0) + 1 };
    if (decision === 'verified') { patch.report_status = 'verified'; patch.validation = 'validated'; patch.review_note = note; }
    if (decision === 'revision' || decision === 'umkm_revision') { patch.report_status = 'revision'; patch.validation = 'revision'; patch.review_note = note; }
    if (decision === 'umkm_approve') { patch.umkm_approved = 'yes'; patch.umkm_note = note; }
    updateObjectById_(SHEETS.weeklyReports, row.id, patch);
    const updated = { ...row, ...patch };
    appendWeeklyHistory_(updated, profile.email, decision, requestId, hash);
    if (decision === 'verified' && Number(row.week) === 3) markFinalOutputsVerified_(row.id);
    audit_(profile.email, 'reviewWeeklyReport', 'weekly_report', row.id, { decision: decision, team_id: row.team_id });
    return { ok: true, row: reportForClient_(updated) };
  } finally { lock.releaseLock(); }
}

function parseJson_(value, fallback) {
  try { return JSON.parse(String(value || '')); } catch (error) { return fallback; }
}

function checkedUrl_(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (url.length > 2048 || !/^https?:\/\/[^\s/?#]+(?:[/?#][^\s]*)?$/i.test(url)) throw apiError_('INVALID_URL', 'Tautan bukti harus URL http atau https yang valid.');
  return url;
}

function checkedVisitDateTime_(value) {
  const planned = String(value || '').trim();
  if (!planned) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(planned);
  if (!match) throw apiError_('INVALID_VISIT_DATE', 'Isi rencana kunjungan dengan tanggal dan jam yang valid (WIB).');
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const valid = new Date(Date.UTC(year, month - 1, day, hour, minute));
  if (valid.getUTCFullYear() !== year || valid.getUTCMonth() + 1 !== month || valid.getUTCDate() !== day || valid.getUTCHours() !== hour || valid.getUTCMinutes() !== minute) {
    throw apiError_('INVALID_VISIT_DATE', 'Tanggal atau jam kunjungan tidak valid.');
  }
  return planned;
}

function parseWeeklyItems_(value, week) {
  const input = parseJson_(value, null);
  const expected = WEEKLY_PLAN_2026[week];
  if (!Array.isArray(input) || input.length !== expected.length || new Set(input.map((item) => item && item.id)).size !== expected.length) throw apiError_('INVALID_ITEMS', 'Checklist periode tidak lengkap.');
  return expected.map((id) => {
    const item = input.find((entry) => entry && entry.id === id);
    if (!item || !['todo', 'doing', 'done'].includes(item.status)) throw apiError_('INVALID_ITEMS', 'Status checklist tidak valid.');
    const evidenceUrl = checkedUrl_(item.evidenceUrl);
    const note = String(item.note || '').trim();
    if (note.length > 500 || (item.status === 'done' && !evidenceUrl)) throw apiError_('INVALID_ITEMS', 'Item selesai memerlukan tautan bukti dan catatan maksimal 500 karakter.');
    return { id: id, status: item.status, evidenceUrl: evidenceUrl, note: note };
  });
}

function parseFinalOutputs_(value, week) {
  if (week !== 3) return { marketing: '', catalog: '', business: '', contentLinks: ['', '', ''] };
  const input = parseJson_(value, {});
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw apiError_('INVALID_OUTPUTS', 'Berkas final tidak valid.');
  const links = Array.isArray(input.contentLinks) ? input.contentLinks : [];
  if (links.length > 3) throw apiError_('INVALID_OUTPUTS', 'Maksimal tiga tautan konten publikasi.');
  return {
    marketing: checkedUrl_(input.marketing), catalog: checkedUrl_(input.catalog), business: checkedUrl_(input.business),
    contentLinks: [0, 1, 2].map((index) => checkedUrl_(links[index])),
  };
}

function evidencedCount_(items) {
  return items.filter((item) => item.status === 'done' && item.evidenceUrl).length;
}

function reportForClient_(row) {
  if (!row) return null;
  const week = Number(row.week || 0);
  const items = parseJson_(row.items_json, []);
  const finalOutputs = parseJson_(row.final_outputs_json, { marketing: '', catalog: '', business: '', contentLinks: ['', '', ''] });
  const status = row.report_status || ({ validated: 'verified', revision: 'revision', draft: 'draft' }[row.validation] || 'submitted');
  const expected = WEEKLY_PLAN_2026[week] || [];
  const complete = Array.isArray(items) ? evidencedCount_(items) : 0;
  const completion = expected.length ? Math.round(70 * complete / expected.length + (status === 'verified' ? 30 : 0)) : 0;
  return {
    id: row.id, teamId: row.team_id, week: week, activity: row.activity || '', progress: row.progress || '',
    obstacles: row.obstacles || '', nextPlan: row.next_plan || '', plannedVisitAt: row.planned_visit_at || '', driveLink: row.drive_link || '',
    publicationLink: row.publication_link || '', validation: row.validation || 'pending', status: status,
    items: Array.isArray(items) ? items : [], finalOutputs: finalOutputs, umkmApprovalUrl: row.umkm_approval_url || '',
    umkmApproved: String(row.umkm_approved || '') === 'yes', umkmNote: row.umkm_note || '', reviewNote: row.review_note || '',
    submittedBy: row.submitted_by || '', submittedAt: row.submitted_at || '', updatedAt: row.updated_at || row.submitted_at || '',
    reviewedBy: row.reviewed_by || '', reviewedAt: row.reviewed_at || '', revision: Number(row.revision || 0), completion: completion,
  };
}

function canVerifyWeekly_(row) {
  const week = Number(row.week);
  const items = parseJson_(row.items_json, []);
  if (!WEEKLY_PLAN_2026[week] || !Array.isArray(items) || items.length !== WEEKLY_PLAN_2026[week].length || evidencedCount_(items) !== items.length) return false;
  if (week !== 3) return true;
  const finalOutputs = parseJson_(row.final_outputs_json, {});
  try {
    return Object.keys(FINAL_OUTPUT_TYPES).every((key) => checkedUrl_(finalOutputs[key]))
      && Array.isArray(finalOutputs.contentLinks) && finalOutputs.contentLinks.length === 3 && finalOutputs.contentLinks.every((url) => checkedUrl_(url))
      && (String(row.umkm_approved || '') === 'yes' || !!checkedUrl_(row.umkm_approval_url));
  } catch (error) { return false; }
}

function appendWeeklyHistory_(row, actorEmail, action, requestId, requestHash) {
  appendObject_(SHEETS.weeklyReportHistory, {
    id: makeId_('wr-history'), report_id: row.id, team_id: row.team_id, week: row.week, action: action,
    actor_email: actorEmail, status: row.report_status, snapshot_json: JSON.stringify(reportForClient_(row)),
    created_at: now_(), request_id: requestId, request_hash: requestHash,
  });
}

function upsertFinalOutputs_(report, finalOutputs) {
  const ss = getSpreadsheet_();
  ensureSheet_(ss, SHEETS.outputs, SCHEMAS[SHEETS.outputs]);
  const outputs = readObjects_(ss.getSheetByName(SHEETS.outputs));
  Object.keys(FINAL_OUTPUT_TYPES).forEach((key) => {
    const id = 'byp26-final-' + report.team_id + '-' + key;
    const url = finalOutputs[key] || '';
    const existing = outputs.find((item) => String(item.id) === id);
    if (!url && !existing) return;
    const patch = { type: FINAL_OUTPUT_TYPES[key], title: FINAL_OUTPUT_TYPES[key], drive_link: url,
      link_status: url ? 'valid format' : 'kosong', status: url ? 'submitted' : 'draft', source_report_id: report.id,
      submitted_by: report.submitted_by, submitted_at: report.updated_at };
    if (existing) updateObjectById_(SHEETS.outputs, id, patch);
    else appendObject_(SHEETS.outputs, { id: id, team_id: report.team_id, ...patch, publication_link: '', umkm_feedback: 'Menunggu verifikasi laporan', request_id: report.request_id });
  });
}

function markFinalOutputsVerified_(reportId) {
  const outputs = readObjects_(getSpreadsheet_().getSheetByName(SHEETS.outputs));
  outputs.filter((item) => String(item.source_report_id) === String(reportId)).forEach((item) => {
    updateObjectById_(SHEETS.outputs, item.id, { status: 'approved', umkm_feedback: 'Terverifikasi bersama laporan Minggu 3' });
  });
}

function submitOutput_(payload) {
  const profile = requireProfile_(payload);
  if (!isAdminRole_(profile.role) && !isStudentRole_(profile.role)) return { ok: false, error: 'Role tidak boleh mengirim output.' };
  if (!canAccessTeam_(profile, payload.team_id)) return { ok: false, error: 'Tim tidak sesuai dengan akses pengguna.' };
  if (!String(payload.title || '').trim() || !String(payload.type || '').trim()) return { ok: false, error: 'Jenis dan judul output wajib diisi.' };
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
    submitted_by: profile.email,
    submitted_at: now_(),
    request_id: String(payload.request_id || '').slice(0, 128),
  };
  return persistSubmission_(SHEETS.outputs, row, profile, 'submitOutput', 'output');
}

function persistSubmission_(sheetName, row, profile, action, entityType) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { ok: false, error: 'Layanan sedang sibuk. Coba kirim lagi beberapa saat.' };
  try {
    if (row.request_id) {
      const existing = readObjects_(getSpreadsheet_().getSheetByName(sheetName)).find((item) => item.request_id === row.request_id && item.submitted_by === profile.email);
      if (existing) {
        const comparableKeys = Object.keys(row).filter((key) => !['id', 'submitted_at', 'validation', 'status', 'link_status', 'umkm_feedback'].includes(key));
        if (comparableKeys.some((key) => String(existing[key] || '') !== String(row[key] || ''))) {
          return { ok: false, error: 'Permintaan ini sudah dipakai untuk data berbeda. Muat ulang halaman sebelum mengirim perubahan.' };
        }
        return { ok: true, row: existing, replayed: true };
      }
    }
    appendObject_(sheetName, row);
    audit_(profile.email, action, entityType, row.id, row);
    return { ok: true, row: row };
  } finally {
    lock.releaseLock();
  }
}

function submitScore_(payload) {
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
    judge_email: profile.email,
    submitted_at: now_(),
  };
  appendObject_(SHEETS.challengeScores, row);
  audit_(profile.email, 'submitScore', 'challenge_score', row.id, row);
  return { ok: true, row: row };
}

function submitAttendance_(payload) {
  const profile = requireProfile_(payload);
  if (!isStudentRole_(profile.role) || !profile.teamId) throw apiError_('FORBIDDEN', 'Hanya mahasiswa yang sudah ditetapkan tim dapat mengisi presensi.');
  const session = readObjects_(getSpreadsheet_().getSheetByName(SHEETS.attendanceSessions)).find((row) => String(row.token) === String(payload.token || '') && String(row.id).startsWith('byp26-'));
  const now = Date.now();
  if (!session || !Number.isFinite(Date.parse(session.starts_at)) || !Number.isFinite(Date.parse(session.ends_at)) || now < Date.parse(session.starts_at) || now > Date.parse(session.ends_at)) throw apiError_('SESSION_CLOSED', 'Kode presensi tidak valid atau sesi sudah ditutup.');
  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);
  const accuracy = Number(payload.accuracy_meters);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(accuracy) || accuracy <= 0 || accuracy > 100) throw apiError_('LOCATION_INVALID', 'GPS tidak cukup akurat. Aktifkan lokasi presisi dan coba lagi.');
  const distance = distanceMeters_(latitude, longitude, Number(session.latitude), Number(session.longitude));
  if (!Number.isFinite(distance) || distance > Number(session.radius_meters)) throw apiError_('OUTSIDE_AREA', 'Lokasi berada di luar area presensi.');
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(String(payload.photo_base64 || '')) || String(payload.photo_base64).length > 1500000) throw apiError_('PHOTO_REQUIRED', 'Ambil selfie JPEG sebelum mengirim presensi.');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) throw apiError_('BUSY', 'Presensi sedang diproses. Coba lagi.');
  try {
    const records = readObjects_(getSpreadsheet_().getSheetByName(SHEETS.attendanceRecords));
    if (records.some((row) => String(row.session_id) === String(session.id) && String(row.email).toLowerCase() === profile.email)) throw apiError_('DUPLICATE', 'Anda sudah presensi pada sesi ini.');
    const photoUrl = savePhotoIfPresent_(payload);
    if (!photoUrl) throw apiError_('PHOTO_FAILED', 'Foto belum dapat disimpan. Hubungi panitia.');
    const row = { id: makeId_('att'), session_id: session.id, team_id: profile.teamId, name: profile.name, email: profile.email, latitude: latitude, longitude: longitude, accuracy_meters: accuracy, photo_drive_url: photoUrl, status: 'valid', submitted_at: now_() };
    appendObject_(SHEETS.attendanceRecords, row);
    audit_(profile.email, 'submitAttendance', 'attendance', row.id, { session_id: session.id, team_id: profile.teamId, distance_meters: Math.round(distance) });
    return { ok: true, row: row };
  } finally { lock.releaseLock(); }
}

function createAttendanceSession_(payload) {
  const actor = requireProfile_(payload);
  if (!isAdminRole_(actor.role)) throw apiError_('FORBIDDEN', 'Hanya admin dapat membuat sesi presensi.');
  const title = String(payload.title || '').trim();
  const latitude = Number(payload.latitude);
  const longitude = Number(payload.longitude);
  const accuracy = Number(payload.accuracy_meters);
  const duration = Number(payload.duration_minutes);
  if (!title || title.length > 120 || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !Number.isFinite(accuracy) || accuracy <= 0 || accuracy > 100 || !Number.isInteger(duration) || duration < 15 || duration > 480) throw apiError_('INVALID_SESSION', 'Isi judul, GPS presisi, dan durasi 15-480 menit.');
  const now = Date.now();
  const row = { id: makeId_('byp26-att'), module_id: '', title: title, token: 'BY26-' + Utilities.getUuid(), starts_at: new Date(now).toISOString(), ends_at: new Date(now + duration * 60000).toISOString(), location: 'Lokasi panitia saat sesi dibuat', latitude: latitude, longitude: longitude, radius_meters: 250, created_at: now_() };
  appendObject_(SHEETS.attendanceSessions, row);
  audit_(actor.email, 'createAttendanceSession', 'attendance_session', row.id, { title: title, expires_at: row.ends_at });
  return { ok: true, session: { id: row.id, title: row.title, token: row.token, startsAt: row.starts_at, endsAt: row.ends_at, location: row.location } };
}

function distanceMeters_(lat1, lon1, lat2, lon2) {
  const radians = (degrees) => degrees * Math.PI / 180;
  const a = Math.sin(radians(lat2 - lat1) / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(radians(lon2 - lon1) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function exportCsv_(payload) {
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

function updateObjectById_(sheetName, id, patch) {
  const sheet = getSpreadsheet_().getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return false;
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
  const idColumn = headers.indexOf('id');
  if (idColumn < 0) return false;
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  const rowIndex = values.findIndex((row) => String(row[idColumn] || '') === String(id));
  if (rowIndex < 0) return false;
  Object.keys(patch).forEach((key) => {
    const column = headers.indexOf(key);
    if (column >= 0) sheet.getRange(rowIndex + 2, column + 1).setValue(patch[key]);
  });
  return true;
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

function hashToken_(value) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value))
    .map((byte) => ('0' + ((byte + 256) % 256).toString(16)).slice(-2))
    .join('');
}

function csvCell_(value) {
  return '"' + String(value).replace(/"/g, '""') + '"';
}

function now_() {
  return new Date().toISOString();
}

function apiError_(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
