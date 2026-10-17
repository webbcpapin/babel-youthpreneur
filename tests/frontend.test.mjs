import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import vm from 'node:vm'
import test from 'node:test'
import ts from 'typescript'
import * as React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'

function loadTs(file, globals = {}, imports = {}) {
  const source = readFileSync(new URL(`../src/${file}`, import.meta.url), 'utf8')
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
  const context = vm.createContext({ exports: {}, console, Date, URL, AbortController, Event, CustomEvent, crypto: { randomUUID }, ...globals, require: (name) => {
    if (!(name in imports)) throw new Error(`Unexpected import: ${name}`)
    return imports[name]
  } })
  vm.runInContext(code, context)
  return context.exports
}

function storedSession(value) {
  const values = new Map(value ? [['byp.session.v1', JSON.stringify(value)]] : [])
  return { getItem: (key) => values.get(key) ?? null, setItem: (key, entry) => values.set(key, entry), removeItem: (key) => values.delete(key) }
}

test('browser session rejects malformed and expired values', () => {
  const auth = loadTs('auth/session-storage.ts', { sessionStorage: storedSession() })
  for (const value of [null, {}, { token: 't', expiresAt: 'nonsense' }, { token: 't', expiresAt: new Date(0).toISOString() }, { token: 42, expiresAt: '2099-01-01' }]) {
    assert.equal(auth.isValidSession(value), false)
  }
  assert.equal(auth.isValidSession({ token: 't', expiresAt: '2099-01-01' }), true)
})

test('browser session can save, restore and clear', () => {
  const auth = loadTs('auth/session-storage.ts', { sessionStorage: storedSession() })
  auth.storeSession({ token: 't', expiresAt: '2099-01-01' })
  assert.equal(auth.readStoredSession().token, 't')
  auth.clearStoredSession()
  assert.equal(auth.readStoredSession(), null)
})

function submissions(postAction, session = { token: 'session-token' }) {
  return loadTs('monitoring/submission.ts', {}, {
    '@/auth/session-storage': { readStoredSession: () => session },
    '@/services/monitoring-api': { postAction },
  })
}

test('unchanged retry keeps request id while edited content gets a new id', () => {
  const api = submissions(() => {})
  const first = api.prepareSubmission({ team_id: 't1', activity: 'A' }, null)
  assert.equal(api.prepareSubmission({ team_id: 't1', activity: 'A' }, first).id, first.id)
  assert.notEqual(api.prepareSubmission({ team_id: 't1', activity: 'B' }, first).id, first.id)
})

test('submission returns confirmed server id and sends session plus request id', async () => {
  let captured
  const api = submissions(async (action, payload) => { captured = { action, payload }; return { ok: true, row: { id: 'server-id', team_id: 't1' } } })
  assert.equal((await api.saveSubmission('submitWeeklyReport', { team_id: 't1' }, 'request-id')).id, 'server-id')
  assert.equal(captured.payload.session_token, 'session-token')
  assert.equal(captured.payload.request_id, 'request-id')
})

test('failed or incomplete saves do not return an invented success record', async () => {
  for (const result of [{ ok: true }, { ok: true, row: { id: '', team_id: 't1' } }, { ok: true, row: { id: 'x', team_id: 'other-team' } }]) {
    await assert.rejects(() => submissions(async () => result).saveSubmission('submitWeeklyReport', { team_id: 't1' }, 'r'))
  }
  await assert.rejects(() => submissions(async () => { throw new Error('Network down') }).saveSubmission('submitOutput', { team_id: 't1' }, 'r'), /Network down/)
})

test('submission without a valid session never calls backend', async () => {
  let calls = 0
  const api = submissions(async () => { calls++ }, null)
  await assert.rejects(() => api.saveSubmission('submitWeeklyReport', { team_id: 't1' }, 'r'), /Sesi login/)
  assert.equal(calls, 0)
})

function googleEnvironment() {
  let element
  const timers = new Map()
  const window = { setTimeout: (fn) => { const id = randomUUID(); timers.set(id, fn); return id }, clearTimeout: (id) => timers.delete(id) }
  const document = {
    getElementById: () => element ?? null,
    createElement: () => {
      const listeners = new Map()
      return { isConnected: false, addEventListener: (name, fn) => listeners.set(name, fn), removeEventListener: (name) => listeners.delete(name), fire: (name) => listeners.get(name)?.(), remove: () => { element = undefined } }
    },
    head: { appendChild: (node) => { element = node; node.isConnected = true } },
  }
  return { window, document, timers, element: () => element }
}

test('Google script loading is shared across concurrent renders', async () => {
  const env = googleEnvironment()
  const loader = loadTs('auth/google-identity.ts', env)
  const first = loader.loadGoogleIdentity()
  assert.equal(loader.loadGoogleIdentity(), first)
  env.window.google = { accounts: { id: {} } }
  env.element().fire('load')
  await first
  assert.equal(env.timers.size, 0)
})

test('Google script failure and timeout can be retried', async () => {
  for (const trigger of ['error', 'timeout']) {
    const env = googleEnvironment()
    const loader = loadTs('auth/google-identity.ts', env)
    const failed = loader.loadGoogleIdentity()
    if (trigger === 'error') env.element().fire('error')
    else [...env.timers.values()][0]()
    await assert.rejects(() => failed)
    const retry = loader.loadGoogleIdentity()
    env.window.google = { accounts: { id: {} } }
    env.element().fire('load')
    await retry
  }
})

test('API expires session on server rejection and bounds request time', async () => {
  const events = []
  let timeout
  const window = { dispatchEvent: (event) => events.push({ type: event.type, token: event.detail }), setTimeout: (fn) => { timeout = fn; return 1 }, clearTimeout: () => {} }
  let fetchImpl = async () => new Response(JSON.stringify({ ok: false, code: 'SESSION_EXPIRED', error: 'Expired' }), { headers: { 'content-type': 'application/json' } })
  const api = loadTs('services/monitoring-api.ts', { window, fetch: (...args) => fetchImpl(...args) }, {
    '@/lib/monitoring-config': { getAppsScriptUrl: () => 'https://example.test/api', hasGoogleBackend: () => true },
  })
  await assert.rejects(() => api.postAction('getData', { session_token: 'old-session' }), { code: 'SESSION_EXPIRED' })
  assert.deepEqual(events, [{ type: 'byp:session-invalid', token: 'old-session' }])
  fetchImpl = async (_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener('abort', () => reject(new Error('aborted'))))
  const request = api.postAction('getData')
  timeout()
  await assert.rejects(() => request, { code: 'TIMEOUT' })
})

test('five registration profiles use the intended roles and institution fields', () => {
  const { REGISTRATION_PROFILES: profiles } = loadTs('auth/registration-profiles.ts')
  assert.deepEqual(Object.keys(profiles), ['mahasiswa', 'umkm', 'universitas', 'juri', 'kemenkeu'])
  assert.equal(profiles.universitas.role, 'kampus_viewer')
  assert.equal(profiles.juri.role, 'juri')
  assert.equal(profiles.kemenkeu.role, 'pimpinan_viewer')
  assert.match(profiles.universitas.institutionLabel, /universitas/)
  assert.match(profiles.kemenkeu.institutionLabel, /Unit kerja/)
})

const registrationImports = {
  react: React,
  'react/jsx-runtime': jsxRuntime,
  'react-router': { Link: ({ to, children, ...props }) => React.createElement('a', { ...props, href: to }, children) },
  'lucide-react': { ShieldCheck: () => null },
  '@/services/monitoring-api': { postAction: () => { throw new Error('Rendering must not submit a registration') } },
  '@/monitoring/MonitoringPage.css': {},
}

test('each registration form renders role-specific content with required consent and login return', () => {
  const { REGISTRATION_PROFILES: profiles } = loadTs('auth/registration-profiles.ts')
  const Form = loadTs('auth/RegistrationForm.tsx', {}, registrationImports).default
  for (const profile of Object.values(profiles)) {
    const markup = renderToStaticMarkup(React.createElement(Form, { profile }))
    assert.ok(markup.includes(profile.title))
    assert.ok(markup.includes(profile.institutionLabel))
    assert.ok(markup.includes(profile.accessNote))
    assert.match(markup, /type="checkbox"[^>]*required=""|required=""[^>]*type="checkbox"/)
    assert.match(markup, /href="\/login"/)
    assert.ok(markup.includes(`Daftar ${profile.label}`))
  }
})

test('login offers all five registration routes without needing an authenticated session', () => {
  const profiles = loadTs('auth/registration-profiles.ts')
  const Login = loadTs('auth/LoginPage.tsx', {}, {
    ...registrationImports,
    'react-router': { ...registrationImports['react-router'], Navigate: () => null, useLocation: () => ({}), useNavigate: () => () => {} },
    '@/auth/useAuth': { useAuth: () => ({ profile: null, loginWithGoogleCredential: async () => {} }) },
    '@/auth/google-identity': { loadGoogleIdentity: async () => {} },
    '@/auth/registration-profiles': profiles,
    '@/lib/monitoring-config': { getGoogleOAuthClientId: () => '', hasGoogleBackend: () => false },
  }).default
  const markup = renderToStaticMarkup(React.createElement(Login))
  for (const [path, profile] of Object.entries(profiles.REGISTRATION_PROFILES)) {
    assert.ok(markup.includes(`href="/register/${path}"`))
    assert.ok(markup.includes(`Daftar ${profile.label}`))
  }
})
