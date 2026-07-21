import { Navigate, Outlet, useLocation } from 'react-router'
import type { AppRole } from '@/auth/auth-types'
import { useAuth } from '@/auth/useAuth'

function AuthLoading() {
  return <main className="auth-state-screen"><section className="panel"><p className="eyebrow">Babel Youthpreneur</p><h1>Memeriksa sesi Anda...</h1></section></main>
}

export function ProtectedRoute() {
  const { profile, isLoading } = useAuth()
  const location = useLocation()
  if (isLoading) return <AuthLoading />
  if (!profile) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

export function RoleBasedRoute({ allowedRoles }: { allowedRoles: readonly AppRole[] }) {
  const { profile, isLoading } = useAuth()
  if (isLoading) return <AuthLoading />
  if (!profile) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(profile.role)) return <Navigate to="/unauthorized" replace />
  return <Outlet />
}
