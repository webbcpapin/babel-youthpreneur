import type { AuthSession } from './auth-types'

const SESSION_STORAGE_KEY = 'byp.session.v1'

export function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') return false
  const session = value as Partial<AuthSession>
  return typeof session.token === 'string' && session.token.length > 0
    && typeof session.expiresAt === 'string'
    && Number.isFinite(Date.parse(session.expiresAt))
    && Date.parse(session.expiresAt) > Date.now()
}

export function readStoredSession(): AuthSession | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || 'null')
    return isValidSession(value) ? value : null
  } catch {
    return null
  }
}

export function storeSession(session: AuthSession) {
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
}
