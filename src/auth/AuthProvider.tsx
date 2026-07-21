import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { APP_ROLES, type AppRole, type AuthProfile, type AuthSession } from '@/auth/auth-types'
import { AuthContext, type AuthContextValue } from '@/auth/auth-context'
import { postAction } from '@/services/monitoring-api'

const SESSION_STORAGE_KEY = 'byp.session.v1'

type BackendProfile = Omit<AuthProfile, 'role'> & { role: string }

function isAppRole(role: string): role is AppRole {
  return (APP_ROLES as readonly string[]).includes(role)
}

function readStoredSession(): AuthSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const value = JSON.parse(raw) as AuthSession
    if (!value.token || !value.expiresAt || new Date(value.expiresAt).getTime() <= Date.now()) return null
    return value
  } catch {
    return null
  }
}

function clearStoredSession() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY)
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
  const [isLoading, setIsLoading] = useState(true)

  const hydrate = useCallback(async (stored: AuthSession) => {
    const result = await postAction('getSession', { session_token: stored.token })
    const nextSession = result.session as AuthSession | undefined
    const nextProfile = result.profile as BackendProfile | undefined
    if (!nextSession?.token || !nextSession.expiresAt || !nextProfile) throw new Error('Sesi tidak valid.')
    const validProfile = toProfile(nextProfile)
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
    setProfile(validProfile)
  }, [])

  useEffect(() => {
    const stored = readStoredSession()
    if (!stored) {
      setIsLoading(false)
      return
    }

    hydrate(stored)
      .catch(() => clearStoredSession())
      .finally(() => setIsLoading(false))
  }, [hydrate])

  const loginWithGoogleCredential = useCallback(async (idToken: string) => {
    const result = await postAction('loginWithGoogle', { id_token: idToken })
    const nextSession = result.session as AuthSession | undefined
    const nextProfile = result.profile as BackendProfile | undefined
    if (!nextSession?.token || !nextSession.expiresAt || !nextProfile) throw new Error('Sesi login tidak diterima dari backend.')
    const validProfile = toProfile(nextProfile)
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
    setProfile(validProfile)
  }, [])

  const logout = useCallback(async () => {
    const current = session ?? readStoredSession()
    try {
      if (current?.token) await postAction('logout', { session_token: current.token })
    } finally {
      clearStoredSession()
      setSession(null)
      setProfile(null)
    }
  }, [session])

  const value = useMemo<AuthContextValue>(() => ({ profile, session, isLoading, loginWithGoogleCredential, logout }), [profile, session, isLoading, loginWithGoogleCredential, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
