import { createContext } from 'react'
import type { AuthProfile, AuthSession } from '@/auth/auth-types'

export type AuthContextValue = {
  profile: AuthProfile | null
  session: AuthSession | null
  isLoading: boolean
  loginWithGoogleCredential: (idToken: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
