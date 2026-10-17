import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { APP_ROLES, type AppRole, type AuthProfile, type AuthSession } from '@/auth/auth-types'
import { AuthContext, type AuthContextValue } from '@/auth/auth-context'
import { postAction, SESSION_INVALID_EVENT } from '@/services/monitoring-api'
import { clearStoredSession, isValidSession, readStoredSession, storeSession } from '@/auth/session-storage'

type BackendProfile = Omit<AuthProfile, 'role'> & { role: string }

function isAppRole(role: string): role is AppRole {
  return (APP_ROLES as readonly string[]).includes(role)
}

function toProfile(value: BackendProfile): AuthProfile {
  if (!isAppRole(value.role)) throw new Error('Role akun tidak dikenali. Hubungi admin program.')
  return {
    email: value.email,
    name: value.name,
    role: value.role,
    title: value.title,
    campusId: value.campusId,
    teamId: value.teamId,
    umkmId: value.umkmId,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [storedSession] = useState(readStoredSession)
  const [isLoading, setIsLoading] = useState(Boolean(storedSession))
  const revision = useRef(0)

  const clearSession = useCallback(() => {
    revision.current += 1
    clearStoredSession()
    setSession(null)
    setProfile(null)
  }, [])

  useEffect(() => {
    if (!storedSession) return
    const currentRevision = revision.current
    let cancelled = false

    postAction('getSession', { session_token: storedSession.token })
      .then((result) => {
        if (cancelled || currentRevision !== revision.current) return
        const nextSession = result.session as AuthSession | undefined
        const nextProfile = result.profile as BackendProfile | undefined
        if (!isValidSession(nextSession) || !nextProfile) throw new Error('Sesi tidak valid.')
        const validProfile = toProfile(nextProfile)
        storeSession(nextSession)
        setSession(nextSession)
        setProfile(validProfile)
      })
      .catch(() => { if (!cancelled && currentRevision === revision.current) clearSession() })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [clearSession, storedSession])

  useEffect(() => {
    const onInvalidSession = (event: Event) => {
      const rejectedToken = (event as CustomEvent<string>).detail
      if (rejectedToken && rejectedToken === readStoredSession()?.token) clearSession()
    }
    window.addEventListener(SESSION_INVALID_EVENT, onInvalidSession)
    return () => window.removeEventListener(SESSION_INVALID_EVENT, onInvalidSession)
  }, [clearSession])

  useEffect(() => {
    if (!session) return
    const remaining = Date.parse(session.expiresAt) - Date.now()
    const timeout = window.setTimeout(clearSession, Math.max(0, remaining))
    return () => window.clearTimeout(timeout)
  }, [session, clearSession])

  const loginWithGoogleCredential = useCallback(async (idToken: string) => {
    const currentRevision = ++revision.current
    const result = await postAction('loginWithGoogle', { id_token: idToken })
    const nextSession = result.session as AuthSession | undefined
    const nextProfile = result.profile as BackendProfile | undefined
    if (!isValidSession(nextSession) || !nextProfile) throw new Error('Sesi login tidak diterima dari backend.')
    const validProfile = toProfile(nextProfile)
    if (currentRevision !== revision.current) return
    storeSession(nextSession)
    setSession(nextSession)
    setProfile(validProfile)
  }, [])

  const logout = useCallback(async () => {
    const current = session ?? readStoredSession()
    clearSession()
    try {
      if (current?.token) await postAction('logout', { session_token: current.token })
    } catch {
      // The browser session is already cleared. The server session also has
      // a fixed expiry if revocation cannot be reached while offline.
    }
  }, [session, clearSession])

  const value = useMemo<AuthContextValue>(() => ({ profile, session, isLoading, loginWithGoogleCredential, logout }), [profile, session, isLoading, loginWithGoogleCredential, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
