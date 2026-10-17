import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import vm from 'node:vm'
import test from 'node:test'

const source = readFileSync(new URL('../apps-script/monitoring-backend.gs', import.meta.url), 'utf8')

function backend() {
  const tables = {
    AppUsers: [{ id: 'u1', email: 'student@example.test', name: 'Student', role: 'mahasiswa', team_id: 't1', status: 'active' }],
    Teams: [{ id: 't1', campus_id: 'c1', umkm_id: 'm1', reports: 99, outputs: 99 }, { id: 't2', campus_id: 'c2', umkm_id: 'm2' }],
    Sessions: [{ id: 's1', user_id: 'u1', token_hash: 'hash-token', expires_at: new Date(Date.now() + 3600000), revoked_at: '' }],
    WeeklyReports: [], Outputs: [], Campuses: [], UMKM: [], TeamMembers: [], ChallengeScores: [], AuditLogs: [],
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
  context.readObjects_ = (sheet) => tables[sheet?.name] ?? []
  context.appendObject_ = (name, row) => { (tables[name] ??= []).push({ ...row }) }
  context.hashToken_ = (token) => token === 'token' ? 'hash-token' : createHash('sha256').update(token).digest('hex')
  context.bootstrap_ = () => { bootstrapCalls++; throw new Error('Unexpected bootstrap') }
  context.verifyGoogleIdToken_ = () => ({ ok: true, email: 'student@example.test' })
  return { context, tables, bootstrapCalls: () => bootstrapCalls }
}

const report = { session_token: 'token', team_id: 't1', week: 1, activity: 'Visit', progress: 'Profile completed', request_id: 'request-1' }

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

test('out-of-scope writes are rejected and actor email comes from session', () => {
  const b = backend()
  assert.equal(b.context.submitWeeklyReport_({ ...report, team_id: 't2' }).ok, false)
  const response = b.context.submitWeeklyReport_({ ...report, email: 'forged@example.test' })
  assert.equal(response.row.submitted_by, 'student@example.test')
  assert.equal(b.tables.WeeklyReports.length, 1)
})

test('admins also cannot submit to a nonexistent team', () => {
  const b = backend()
  b.tables.AppUsers[0].role = 'admin'
  assert.equal(b.context.submitWeeklyReport_({ ...report, team_id: 'missing' }).ok, false)
})

test('weekly report retries use the same server record and preserve review state', () => {
  const b = backend()
  const first = b.context.submitWeeklyReport_(report)
  b.tables.WeeklyReports[0].validation = 'validated'
  const retry = b.context.submitWeeklyReport_(report)
  assert.equal(retry.row.id, first.row.id)
  assert.equal(retry.row.validation, 'validated')
  assert.equal(retry.replayed, true)
  assert.equal(b.tables.WeeklyReports.length, 1)
})

test('reuse of a request id with different data is rejected', () => {
  const b = backend()
  b.context.submitWeeklyReport_(report)
  assert.equal(b.context.submitWeeklyReport_({ ...report, activity: 'Different activity' }).ok, false)
  assert.equal(b.tables.WeeklyReports.length, 1)
})

test('bad report fields do not write records', () => {
  for (const patch of [{ week: 0 }, { week: 1.5 }, { week: 53 }, { activity: ' ' }, { progress: '' }]) {
    const b = backend()
    assert.equal(b.context.submitWeeklyReport_({ ...report, ...patch }).ok, false)
    assert.equal(b.tables.WeeklyReports.length, 0)
  }
})

test('output retries are idempotent too', () => {
  const b = backend()
  const payload = { session_token: 'token', team_id: 't1', type: 'Catalog', title: 'Catalog', request_id: 'output-1' }
  const first = b.context.submitOutput_(payload)
  assert.equal(b.context.submitOutput_(payload).row.id, first.row.id)
  assert.equal(b.tables.Outputs.length, 1)
})

test('refresh reads stored report counts and evidence rather than stale team counters', () => {
  const b = backend()
  b.context.submitWeeklyReport_({ ...report, drive_link: 'https://example.test/evidence', obstacles: 'Packaging', next_plan: 'Review' })
  const data = b.context.getData_({ session_token: 'token' })
  assert.equal(data.teams.length, 1)
  assert.equal(data.teams[0].reports, 1)
  assert.equal(data.teams[0].outputs, 0)
  assert.equal(data.reports[0].driveLink, 'https://example.test/evidence')
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
    assert.equal(data.teams.length, role === 'kampus_viewer' ? 1 : 2)
    assert.equal(b.context.submitWeeklyReport_(report).ok, false)
    assert.equal(b.context.submitOutput_({ ...report, type: 'Catalog', title: 'Test' }).ok, false)
    assert.equal(b.context.submitScore_({ session_token: 'token', team_id: 't1', category: 'test', score: 90 }).ok, false)
    assert.equal(b.tables.WeeklyReports.length, 0)
    assert.equal(b.tables.Outputs.length, 0)
    assert.equal(b.tables.ChallengeScores.length, 0)
  }
})
