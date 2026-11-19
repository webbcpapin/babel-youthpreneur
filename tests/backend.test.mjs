import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import vm from 'node:vm'
import test from 'node:test'

const source = readFileSync(new URL('../apps-script/monitoring-backend.gs', import.meta.url), 'utf8')

function backend() {
  const tables = {
    AppUsers: [{ id: 'u1', email: 'student@example.test', name: 'Student', role: 'mahasiswa', team_id: 't1', status: 'active' }],
    Teams: [{ id: 't1', campus_id: 'c1', umkm_id: 'm1', program_year: 2026, reports: 99, outputs: 99 }, { id: 't2', campus_id: 'c2', umkm_id: 'm2', program_year: 2026 }, { id: 'byp26-t1', campus_id: 'c1', umkm_id: 'm1', program_year: 2026 }],
    Sessions: [{ id: 's1', user_id: 'u1', token_hash: 'hash-token', expires_at: new Date(Date.now() + 3600000), revoked_at: '' }],
    WeeklyReports: [], WeeklyReportHistory: [], Outputs: [], Campuses: [], UMKM: [], TeamMembers: [], ChallengeScores: [], AuditLogs: [],
  }
  let bootstrapCalls = 0
  let locked = false
  const cache = new Map()
  const context = vm.createContext({
    console,
    PropertiesService: { getScriptProperties: () => ({ getProperty: () => '' }) },
    SpreadsheetApp: { openById: () => ({ getSheetByName: (name) => ({ name }) }) },
    LockService: { getScriptLock: () => ({ tryLock: () => { if (locked) return false; locked = true; return true }, releaseLock: () => { locked = false } }) },
    Utilities: { getUuid: randomUUID },
    CacheService: { getScriptCache: () => ({ get: (key) => cache.get(key), put: (key, value) => cache.set(key, value) }) },
    ContentService: { MimeType: { JSON: 'application/json' }, createTextOutput: (text) => ({ text, setMimeType() { return JSON.parse(this.text) } }) },
  })
  vm.runInContext(source, context)
  context.ensureSheet_ = () => {}
  context.isPastFinalDeadline_ = () => false
  context.readObjects_ = (sheet) => tables[sheet?.name] ?? []
  context.appendObject_ = (name, row) => { (tables[name] ??= []).push({ ...row }) }
  context.updateObjectById_ = (name, id, patch) => {
    const row = (tables[name] ?? []).find((item) => item.id === id)
    if (!row) return false
    Object.assign(row, patch)
    return true
  }
  context.hashToken_ = (token) => token === 'token' ? 'hash-token' : createHash('sha256').update(token).digest('hex')
  context.bootstrap_ = () => { bootstrapCalls++; throw new Error('Unexpected bootstrap') }
  context.verifyGoogleIdToken_ = () => ({ ok: true, email: 'student@example.test' })
  return { context, tables, bootstrapCalls: () => bootstrapCalls }
}

const weeklyItems = (week = 1, complete = false) => {
  const ids = { 1: ['profile', 'swot', 'channel_audit', 'target', 'concept'], 2: ['channel_update', 'photo_video', 'content', 'catalog_draft', 'idea_draft', 'ai_review'], 3: ['three_contents', 'marketing_evaluation', 'catalog_final', 'idea_final', 'ai_final', 'handover', 'challenge_ready'] }
  return ids[week].map((id, index) => ({ id, status: complete || index === 0 ? 'done' : 'todo', evidenceUrl: complete || index === 0 ? `https://example.test/${id}` : '', note: '' }))
}
const report = { session_token: 'token', team_id: 'byp26-t1', week: 1, mode: 'submit', items_json: JSON.stringify(weeklyItems()), request_id: 'request-1' }
const asStudent = (b) => { b.tables.AppUsers[0].team_id = 'byp26-t1'; return b }

test('2026 roster contains 10 pairings and 30 distinct students; migration is idempotent', () => {
  const b = backend()
  const roster = b.context.get2026Roster_()
  assert.equal(roster.length, 10)
  assert.equal(new Set(roster.flatMap((team) => team.members)).size, 30)
  assert.equal(new Set(roster.map((team) => team.id)).size, 10)
  assert.equal(new Set(roster.map((team) => team.name)).size, 10)
  assert.ok(roster.every((team) => team.name === `${team.umkm} - ${team.nickname}`))
  assert.deepEqual(Array.from(roster.map((team) => team.umkm)), [
    'Batik Kampung Dul', 'Batik Deshanda', 'Batik Asdarya', 'Fiya Batik Tulis',
    "D'Bhori", 'Batik Kemuning', 'My Botanical Eco Print Bangka',
    'Shinta Cual', 'Asti Rajutan dan Batik', 'SBA Cual Bangka',
  ])
  assert.deepEqual(Array.from(roster.map((team) => team.nickname)), [
    'LOKALINK', 'TRUNTUM', 'Hanrevel', 'SASFIA', 'Go Green',
    'Benang Merah', 'FloraTrace', 'DigiScoral Squad', 'Wastra Serumpun', 'The Sandau',
  ])
  b.context.ensureSheet_ = () => {}
  assert.equal(b.context.setup2026Roster().created.teams, 10)
  b.tables.TeamMembers.find((member) => member.id === 'byp26-pertiba-1-member-2').name = 'Old spelling'
  assert.equal(b.context.setup2026Roster().created.teams, 0)
  assert.equal(b.tables.TeamMembers.length, 30)
  assert.equal(b.tables.Teams.length, 13)
  assert.equal(b.tables.TeamMembers.find((member) => member.id === 'byp26-pertiba-1-member-2').name, 'Regina Awaliyah')
  assert.equal(b.tables.LearningModules.length, 4)
  assert.equal(b.tables.LearningModules.find((module) => module.id === 'byp26-module-enti').material_url, 'https://drive.google.com/file/d/1nkNRyivvyoNjxoBNMV4ZMJSXeQNkrP5P/view')
  assert.equal(b.tables.LearningModules.find((module) => module.id === 'byp26-module-finalia').material_url, 'https://drive.google.com/file/d/169Ilzxt5MkvCcxBH4u6gyCD4u-zjHRAR/view')
  assert.equal(b.tables.LearningModules.find((module) => module.id === 'byp26-module-cento').material_url, 'https://drive.google.com/file/d/1HMbC_Qr79ucCt3TOKKgNgBkyfc36GkiN/view')
  assert.equal(b.tables.LearningModules.find((module) => module.id === 'byp26-module-lereng').material_url, 'https://drive.google.com/file/d/1Uh-iON790Rm0YYgs4k8hNuRqgcpcpO8p/view')
  b.tables.LearningModules.find((module) => module.id === 'byp26-module-enti').material_url = 'https://drive.google.com/file/d/replacement/view'
  b.context.setup2026Roster()
  assert.equal(b.tables.LearningModules.find((module) => module.id === 'byp26-module-enti').material_url, 'https://drive.google.com/file/d/replacement/view')
})

test('admin approval assigns a registered student to a 2026 team once', () => {
  const b = backend()
  b.tables.Registrations = [{ id: 'reg-1', email: 'new@example.test', name: 'New Student', requested_role: 'mahasiswa', status: 'pending_admin_review' }]
  b.tables.AppUsers.push({ id: 'u2', email: 'new@example.test', name: 'New Student', role: '', status: 'pending' })
  b.tables.Teams.push({ id: 'byp26-ubb-1', campus_id: 'byp26-campus-ubb', program_year: 2026 })
  b.context.requireProfile_ = () => ({ email: 'admin@example.test', role: 'admin' })
  const request = { registration_id: 'reg-1', role: 'mahasiswa', team_id: 'byp26-ubb-1' }
  assert.equal(b.context.getApprovalQueue_({}).registrations.length, 1)
  assert.equal(b.context.approveAccount_(request).ok, true)
  assert.equal(b.tables.AppUsers[1].role, 'mahasiswa')
  assert.equal(b.tables.AppUsers[1].team_id, 'byp26-ubb-1')
  assert.equal(b.tables.AppUsers[1].campus_id, 'byp26-campus-ubb')
  assert.equal(b.tables.Registrations[0].status, 'approved')
  assert.equal(b.context.getApprovalQueue_({}).registrations.length, 0)
  assert.throws(() => b.context.approveAccount_(request), { code: 'NOT_PENDING' })
  b.context.requireProfile_ = () => ({ email: 'new@example.test', role: 'mahasiswa' })
  assert.throws(() => b.context.getApprovalQueue_({}), { code: 'FORBIDDEN' })
})

test('only admin can publish a Drive URL for a known 2026 module', () => {
  const b = backend()
  b.tables.LearningModules = [{ id: 'byp26-module-enti', title: 'Digital Marketing', material_url: '' }]
  b.context.requireProfile_ = () => ({ email: 'student@example.test', role: 'mahasiswa' })
  const payload = { module_id: 'byp26-module-enti', material_url: 'https://drive.google.com/file/d/example/view' }
  assert.throws(() => b.context.saveModule_(payload), { code: 'FORBIDDEN' })
  b.context.requireProfile_ = () => ({ email: 'admin@example.test', role: 'admin' })
  assert.throws(() => b.context.saveModule_({ ...payload, material_url: 'javascript:alert(1)' }), { code: 'INVALID_URL' })
  assert.equal(b.context.saveModule_(payload).ok, true)
  assert.equal(b.tables.LearningModules[0].material_url, payload.material_url)
})

test('attendance requires approved team, valid session, GPS and photo; duplicates are rejected', () => {
  const b = backend()
  const now = Date.now()
  b.tables.AttendanceSessions = [{ id: 'byp26-att-1', token: 'BY26-valid', starts_at: new Date(now - 60000).toISOString(), ends_at: new Date(now + 60000).toISOString(), latitude: -2.1, longitude: 106.1, radius_meters: 250 }]
  b.tables.AttendanceRecords = []
  b.context.requireProfile_ = () => ({ email: 'student@example.test', name: 'Student', role: 'mahasiswa', teamId: 'byp26-ubb-1' })
  b.context.savePhotoIfPresent_ = () => 'https://drive.google.com/photo'
  const payload = { token: 'BY26-valid', latitude: -2.1, longitude: 106.1, accuracy_meters: 15, photo_base64: 'data:image/jpeg;base64,YWJj' }
  assert.throws(() => b.context.submitAttendance_({ ...payload, token: 'wrong' }), { code: 'SESSION_CLOSED' })
  assert.throws(() => b.context.submitAttendance_({ ...payload, latitude: -3 }), { code: 'OUTSIDE_AREA' })
  assert.throws(() => b.context.submitAttendance_({ ...payload, photo_base64: '' }), { code: 'PHOTO_REQUIRED' })
  assert.equal(b.context.submitAttendance_(payload).ok, true)
  assert.equal(b.tables.AttendanceRecords[0].team_id, 'byp26-ubb-1')
  assert.throws(() => b.context.submitAttendance_(payload), { code: 'DUPLICATE' })
})

test('private reads reject missing sessions before writes or bootstrap', () => {
  const b = backend()
  const response = b.context.handleRequest_({ parameter: { action: 'getData' }, postData: { contents: '{}' } }, 'POST')
  assert.equal(response.code, 'SESSION_REQUIRED')
  assert.equal(b.bootstrapCalls(), 0)
  assert.equal(b.tables.AuditLogs.length, 0)
})

test('valid Google identity creates a hashed session without bootstrap', () => {
  const b = backend()
  const response = b.context.loginWithGoogle_({ id_token: 'test-provider-token' })
  assert.equal(response.ok, true)
  assert.equal(response.profile.email, 'student@example.test')
  assert.notEqual(b.tables.Sessions.at(-1).token_hash, response.session.token)
  assert.equal(b.bootstrapCalls(), 0)
})

test('pending users cannot create sessions', () => {
  const b = backend()
  b.tables.AppUsers[0].status = 'pending'
  assert.equal(b.context.loginWithGoogle_({ id_token: 'test-provider-token' }).ok, false)
  assert.equal(b.tables.Sessions.length, 1)
})

test('expired, revoked and malformed session expiry are rejected', () => {
  for (const patch of [{ expires_at: new Date(0) }, { expires_at: 'invalid-date' }, { revoked_at: new Date().toISOString() }]) {
    const b = backend()
    Object.assign(b.tables.Sessions[0], patch)
    assert.throws(() => b.context.getSession_({ session_token: 'token' }), { code: 'SESSION_EXPIRED' })
  }
})

test('Sheets Date session is returned as an ISO string', () => {
  const b = backend()
  assert.equal(typeof b.context.getSession_({ session_token: 'token' }).session.expiresAt, 'string')
})

test('blank assignments give no access to unassigned teams', () => {
  const b = backend()
  const unassigned = [{ id: 't3', campus_id: '', umkm_id: '' }]
  for (const role of ['dosen', 'kampus_viewer', 'umkm', 'mahasiswa']) {
    assert.equal(b.context.scopeTeamsForProfile_({ role, campusId: '', umkmId: '', teamId: '' }, unassigned).length, 0)
  }
})

test('one active weekly row, replay, revision and evidence-based progress', () => {
  const b = asStudent(backend())
  const first = b.context.submitWeeklyReport_(report)
  assert.equal(first.row.teamId, 'byp26-t1')
  assert.equal(first.row.completion, 14)
  assert.equal(b.context.submitWeeklyReport_(report).replayed, true)
  assert.throws(() => b.context.submitWeeklyReport_({ ...report, obstacles: 'changed' }), { code: 'REQUEST_REUSED' })
  const changed = b.context.submitWeeklyReport_({ ...report, request_id: 'r2', obstacles: 'Packaging' })
  assert.equal(changed.row.id, first.row.id)
  assert.equal(changed.row.revision, 2)
  assert.equal(b.tables.WeeklyReports.length, 1)
  assert.equal(b.tables.WeeklyReportHistory.length, 2)
})

test('weekly writes require own 2026 team and valid checklist', () => {
  const b = asStudent(backend())
  assert.throws(() => b.context.submitWeeklyReport_({ ...report, team_id: 't2' }), { code: 'FORBIDDEN' })
  assert.throws(() => b.context.submitWeeklyReport_({ ...report, week: 4 }), { code: 'INVALID_WEEK' })
  assert.throws(() => b.context.submitWeeklyReport_({ ...report, items_json: '[]' }), { code: 'INVALID_ITEMS' })
  b.tables.AppUsers[0].role = 'admin'
  assert.throws(() => b.context.submitWeeklyReport_(report), { code: 'FORBIDDEN' })
  assert.equal(b.tables.WeeklyReports.length, 0)
})

test('dosen review is campus-scoped, admin verifies, verified report locks', () => {
  const b = asStudent(backend())
  const row = b.context.submitWeeklyReport_(report).row
  b.tables.AppUsers[0].role = 'dosen'; b.tables.AppUsers[0].campus_id = 'c2'
  const review = { session_token: 'token', report_id: row.id, decision: 'revision', note: 'Fix', request_id: 'v1' }
  assert.throws(() => b.context.reviewWeeklyReport_(review), { code: 'FORBIDDEN' })
  b.tables.AppUsers[0].campus_id = 'c1'
  assert.equal(b.context.reviewWeeklyReport_(review).row.status, 'revision')
  b.tables.AppUsers[0].role = 'mahasiswa'
  b.context.submitWeeklyReport_({ ...report, request_id: 'r2', items_json: JSON.stringify(weeklyItems(1, true)) })
  b.tables.AppUsers[0].role = 'admin'
  assert.equal(b.context.reviewWeeklyReport_({ ...review, decision: 'verified', request_id: 'v2' }).row.completion, 100)
  b.tables.AppUsers[0].role = 'mahasiswa'
  assert.throws(() => b.context.submitWeeklyReport_({ ...report, request_id: 'r3' }), { code: 'LOCKED' })
})

test('week three final outputs are distinct and UMKM approval is required', () => {
  const b = asStudent(backend())
  const final = { marketing: 'https://e.test/m.pdf', catalog: 'https://e.test/c.pdf', business: 'https://e.test/b.pdf', contentLinks: ['https://e.test/1','https://e.test/2','https://e.test/3'] }
  const row = b.context.submitWeeklyReport_({ ...report, week: 3, items_json: JSON.stringify(weeklyItems(3, true)), final_outputs_json: JSON.stringify(final), request_id: 'w3' }).row
  assert.equal(b.tables.Outputs.length, 3)
  assert.equal(new Set(b.tables.Outputs.map((item) => item.type)).size, 3)
  const review = { session_token: 'token', report_id: row.id, decision: 'verified', request_id: 'v1' }
  b.tables.AppUsers[0].role = 'admin'
  assert.throws(() => b.context.reviewWeeklyReport_(review), { code: 'INCOMPLETE' })
  b.tables.AppUsers[0].role = 'umkm'; b.tables.AppUsers[0].umkm_id = 'm1'
  assert.equal(b.context.reviewWeeklyReport_({ ...review, decision: 'umkm_approve', request_id: 'u1' }).row.umkmApproved, true)
  b.tables.AppUsers[0].role = 'admin'
  assert.equal(b.context.reviewWeeklyReport_({ ...review, request_id: 'v2' }).row.status, 'verified')
  assert.ok(b.tables.Outputs.every((item) => item.status === 'approved'))
})

test('UMKM cannot approve another pairing and approval resets after changed evidence', () => {
  const b = asStudent(backend())
  const row = b.context.submitWeeklyReport_(report).row
  const review = { session_token: 'token', report_id: row.id, decision: 'umkm_approve', request_id: 'approval-1' }
  b.tables.AppUsers[0].role = 'umkm'; b.tables.AppUsers[0].umkm_id = 'm2'
  assert.throws(() => b.context.reviewWeeklyReport_(review), { code: 'FORBIDDEN' })
  b.tables.AppUsers[0].umkm_id = 'm1'
  assert.equal(b.context.reviewWeeklyReport_(review).row.umkmApproved, true)
  b.tables.AppUsers[0].role = 'mahasiswa'
  const items = weeklyItems(); items[0].note = 'Updated after UMKM review'
  const edited = b.context.submitWeeklyReport_({ ...report, request_id: 'approval-2', items_json: JSON.stringify(items) })
  assert.equal(edited.row.umkmApproved, false)
})

test('deadline blocks late submission but permits draft', () => {
  const b = asStudent(backend())
  b.context.isPastFinalDeadline_ = () => true
  assert.throws(() => b.context.submitWeeklyReport_(report), { code: 'DEADLINE_PASSED' })
  assert.equal(b.context.submitWeeklyReport_({ ...report, mode: 'draft' }).row.status, 'draft')
})
test('output retries are idempotent too', () => {
  const b = backend()
  const payload = { session_token: 'token', team_id: 't1', type: 'Catalog', title: 'Catalog', request_id: 'output-1' }
  const first = b.context.submitOutput_(payload)
  assert.equal(b.context.submitOutput_(payload).row.id, first.row.id)
  assert.equal(b.tables.Outputs.length, 1)
})

test('refresh reads stored report counts and evidence rather than stale team counters', () => {
  const b = asStudent(backend())
  b.context.submitWeeklyReport_({ ...report, obstacles: 'Packaging', next_plan: 'Review' })
  const data = b.context.getData_({ session_token: 'token' })
  assert.equal(data.teams.length, 1)
  assert.equal(data.teams[0].reports, 1)
  assert.equal(data.teams[0].outputs, 0)
  assert.equal(data.reports[0].items[0].evidenceUrl, 'https://example.test/profile')
  assert.equal(data.reports[0].obstacles, 'Packaging')
  assert.equal(data.reports[0].nextPlan, 'Review')
})

test('GET cannot trigger mutations', () => {
  const b = backend()
  const response = b.context.handleRequest_({ parameter: { action: 'submitWeeklyReport', ...report } }, 'GET')
  assert.equal(response.code, 'METHOD_NOT_ALLOWED')
  assert.equal(b.tables.WeeklyReports.length, 0)
})

test('all public registration profiles are queued without assigning access', () => {
  for (const role of ['mahasiswa', 'umkm', 'kampus_viewer', 'juri', 'pimpinan_viewer']) {
    const b = backend()
    const response = b.context.handleRequest_({ parameter: { action: 'registerAccount' }, postData: { contents: JSON.stringify({
      email: 'new@example.test', name: 'New applicant', requested_role: role,
      institution: 'Institution', whatsapp: '0800000000', data_consent: true,
    }) } }, 'POST')
    assert.equal(response.ok, true, role)
    assert.equal(response.status, 'pending_admin_review')
    assert.equal(b.tables.Registrations[0].requested_role, role)
    const user = b.tables.AppUsers.find((item) => item.email === 'new@example.test')
    assert.equal(user.status, 'pending')
    assert.equal(user.role, '')
    assert.equal(user.campus_id, '')
    assert.equal(b.tables.Sessions.length, 1)
    assert.equal(b.bootstrapCalls(), 0)
  }
})

test('new registrations do not accept self-assigned super admin or missing consent', () => {
  for (const patch of [{ requested_role: 'super_admin' }, { requested_role: 'admin' }, { requested_role: 'unknown' }, { data_consent: false }]) {
    const b = backend()
    const response = b.context.registerAccount_({ email: 'new@example.test', name: 'Applicant', requested_role: 'juri', data_consent: true, ...patch })
    assert.equal(response.ok, false)
    assert.equal(b.tables.Registrations?.length ?? 0, 0)
    assert.equal(b.tables.AppUsers.length, 1)
  }
})

test('registration cannot change an existing active user role', () => {
  const b = backend()
  const response = b.context.registerAccount_({ email: 'student@example.test', name: 'Student', requested_role: 'juri', data_consent: true })
  assert.equal(response.status, 'active')
  assert.equal(b.tables.AppUsers[0].role, 'mahasiswa')
  assert.equal(b.tables.Registrations?.length ?? 0, 0)
})

test('approved university viewer stays campus-scoped and Kemenkeu viewer cannot write or score', () => {
  for (const role of ['kampus_viewer', 'pimpinan_viewer']) {
    const b = backend()
    Object.assign(b.tables.AppUsers[0], { role, campus_id: 'c1' })
    const data = b.context.getData_({ session_token: 'token' })
    assert.equal(data.teams.length, role === 'kampus_viewer' ? 2 : 3)
    assert.throws(() => b.context.submitWeeklyReport_(report), { code: 'FORBIDDEN' })
    assert.equal(b.context.submitOutput_({ ...report, type: 'Catalog', title: 'Test' }).ok, false)
    assert.equal(b.context.submitScore_({ session_token: 'token', team_id: 't1', category: 'test', score: 90 }).ok, false)
    assert.equal(b.tables.WeeklyReports.length, 0)
    assert.equal(b.tables.Outputs.length, 0)
    assert.equal(b.tables.ChallengeScores.length, 0)
  }
})
