const MONITORING_SPREADSHEET_ID = 'PASTE_MONITORING_SPREADSHEET_ID_HERE';

const SHEETS = {
  users: ['id', 'name', 'email', 'role', 'campus_id', 'umkm_id', 'team_id', 'status'],
  campuses: ['id', 'name', 'pic', 'contact', 'address'],
  umkms: ['id', 'business_name', 'owner_name', 'whatsapp', 'category', 'address', 'regency', 'priority_need', 'curation_status'],
  teams: ['id', 'name', 'campus_id', 'umkm_id', 'lecturer_id', 'status', 'progress'],
  courses: ['id', 'title', 'description', 'start_date', 'end_date'],
  sessions: ['id', 'course_id', 'title', 'session_date', 'start_time', 'end_time', 'location_name', 'latitude', 'longitude', 'radius_meters', 'qr_token', 'qr_active_from', 'qr_active_until'],
  attendance: ['id', 'session_id', 'user_id', 'scanned_at', 'latitude', 'longitude', 'photo_url', 'validation_status', 'admin_note'],
  weekly_reports: ['id', 'team_id', 'week_number', 'activity_date', 'activities', 'progress', 'obstacles', 'next_plan', 'drive_link', 'publication_link', 'lecturer_note', 'admin_note', 'lecturer_validation_status', 'created_at'],
  outputs: ['id', 'team_id', 'output_type', 'title', 'google_drive_link', 'publication_link', 'link_status', 'status', 'umkm_feedback', 'admin_note'],
  scores: ['id', 'team_id', 'category', 'score', 'judge_id', 'note'],
  audit_logs: ['timestamp', 'email', 'action', 'entity', 'detail'],
};

function doPost(event) {
  try {
    const body = JSON.parse(event.postData.contents || '{}');
    bootstrapSheets_();

    if (body.action === 'bootstrap') return json_({ ok: true, data: { sheets: Object.keys(SHEETS) } });
    if (body.action === 'getProfile') return json_({ ok: true, data: getProfile_(body.email) });
    if (body.action === 'getDashboardData') return json_({ ok: true, data: getDashboardData_(body.profile) });
    if (body.action === 'createWeeklyReport') return json_({ ok: true, data: appendEntity_('weekly_reports', body.payload, body.profile, body.action) });
    if (body.action === 'createOutput') return json_({ ok: true, data: appendEntity_('outputs', body.payload, body.profile, body.action) });
    if (body.action === 'createScore') return json_({ ok: true, data: appendEntity_('scores', body.payload, body.profile, body.action) });
    if (body.action === 'createAttendance') return json_({ ok: true, data: appendEntity_('attendance', body.payload, body.profile, body.action) });
    if (body.action === 'updateWeeklyReportValidation') return json_({ ok: true, data: updateById_('weekly_reports', body.id, { lecturer_validation_status: body.status, lecturer_note: body.note || '' }, body.profile, body.action) });
    if (body.action === 'updateOutputFeedback') return json_({ ok: true, data: updateById_('outputs', body.id, { umkm_feedback: body.feedback || '', status: body.status || 'approved' }, body.profile, body.action) });

    throw new Error('Unknown action: ' + body.action);
  } catch (error) {
    return json_({ ok: false, message: String(error && error.message ? error.message : error) });
  }
}

function doGet() {
  bootstrapSheets_();
  return json_({ ok: true, data: { service: 'Babel Youthpreneur Monitoring Backend', sheets: Object.keys(SHEETS) } });
}

function getProfile_(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return null;
  return readSheet_('users').find(function(user) {
    return String(user.email || '').toLowerCase() === normalized && String(user.status || 'active') === 'active';
  }) || null;
}

function getDashboardData_(profile) {
  const data = {
    users: readSheet_('users'),
    campuses: readSheet_('campuses'),
    umkms: readSheet_('umkms'),
    teams: readSheet_('teams'),
    courses: readSheet_('courses'),
    sessions: readSheet_('sessions'),
    attendance: readSheet_('attendance'),
    weeklyReports: readSheet_('weekly_reports'),
    outputs: readSheet_('outputs'),
    scores: readSheet_('scores'),
  };
  return scopeByRole_(data, profile || {});
}

function scopeByRole_(data, profile) {
  if (profile.role === 'admin' || profile.role === 'juri') return data;

  if (profile.role === 'dosen') {
    const teams = data.teams.filter(function(team) { return team.campus_id === profile.campus_id; });
    const teamIds = ids_(teams);
    const umkmIds = ids_(teams.map(function(team) { return { id: team.umkm_id }; }));
    return Object.assign({}, data, {
      campuses: data.campuses.filter(function(campus) { return campus.id === profile.campus_id; }),
      teams: teams,
      umkms: data.umkms.filter(function(umkm) { return umkmIds[umkm.id]; }),
      weeklyReports: data.weeklyReports.filter(function(report) { return teamIds[report.team_id]; }),
      outputs: data.outputs.filter(function(output) { return teamIds[output.team_id]; }),
      scores: data.scores.filter(function(score) { return teamIds[score.team_id]; }),
    });
  }

  if (profile.role === 'mahasiswa' || profile.role === 'umkm') {
    const teamId = profile.team_id;
    const teams = data.teams.filter(function(team) { return team.id === teamId; });
    return Object.assign({}, data, {
      teams: teams,
      campuses: data.campuses.filter(function(campus) { return campus.id === (teams[0] && teams[0].campus_id); }),
      umkms: data.umkms.filter(function(umkm) { return umkm.id === (teams[0] && teams[0].umkm_id); }),
      users: data.users.filter(function(user) { return user.team_id === teamId || user.id === profile.id; }),
      attendance: data.attendance.filter(function(item) { return data.users.some(function(user) { return user.team_id === teamId && user.id === item.user_id; }); }),
      weeklyReports: data.weeklyReports.filter(function(report) { return report.team_id === teamId; }),
      outputs: data.outputs.filter(function(output) { return output.team_id === teamId; }),
      scores: data.scores.filter(function(score) { return score.team_id === teamId; }),
    });
  }

  return data;
}

function appendEntity_(sheetName, payload, profile, action) {
  const headers = SHEETS[sheetName];
  const entity = Object.assign({}, payload, {
    id: payload.id || sheetName + '-' + Utilities.getUuid(),
  });
  if (sheetName === 'weekly_reports' && !entity.created_at) entity.created_at = new Date().toISOString();
  if (sheetName === 'outputs' && !entity.link_status) entity.link_status = entity.google_drive_link ? 'perlu_dicek' : 'kosong';
  getSheet_(sheetName).appendRow(headers.map(function(header) { return entity[header] == null ? '' : entity[header]; }));
  audit_(profile && profile.email, action, sheetName, entity.id);
  return entity;
}

function updateById_(sheetName, id, patch, profile, action) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf('id');
  for (var row = 1; row < values.length; row++) {
    if (values[row][idIndex] === id) {
      Object.keys(patch).forEach(function(key) {
        const index = headers.indexOf(key);
        if (index >= 0) sheet.getRange(row + 1, index + 1).setValue(patch[key]);
      });
      audit_(profile && profile.email, action, sheetName, id);
      return true;
    }
  }
  throw new Error('Data tidak ditemukan: ' + id);
}

function readSheet_(sheetName) {
  const values = getSheet_(sheetName).getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0];
  return values.slice(1).filter(function(row) { return row.some(String); }).map(function(row) {
    return headers.reduce(function(obj, header, index) {
      obj[header] = row[index];
      return obj;
    }, {});
  });
}

function bootstrapSheets_() {
  Object.keys(SHEETS).forEach(function(sheetName) {
    const sheet = getSheet_(sheetName);
    if (sheet.getLastRow() === 0) sheet.appendRow(SHEETS[sheetName]);
  });
}

function getSheet_(sheetName) {
  const spreadsheet = MONITORING_SPREADSHEET_ID === 'PASTE_MONITORING_SPREADSHEET_ID_HERE'
    ? SpreadsheetApp.getActiveSpreadsheet()
    : SpreadsheetApp.openById(MONITORING_SPREADSHEET_ID);
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function audit_(email, action, entity, detail) {
  getSheet_('audit_logs').appendRow([new Date(), email || '', action || '', entity || '', detail || '']);
}

function ids_(items) {
  return items.reduce(function(map, item) {
    if (item.id) map[item.id] = true;
    return map;
  }, {});
}

function json_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
