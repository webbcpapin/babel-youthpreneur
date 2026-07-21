export const APP_ROLES = [
  'super_admin',
  'admin_panitia',
  'admin',
  'dosen',
  'mahasiswa',
  'ketua_tim',
  'umkm',
  'kampus_viewer',
  'pimpinan_viewer',
  'juri',
] as const

export type AppRole = typeof APP_ROLES[number]

export type AuthProfile = {
  email: string
  name: string
  role: AppRole
  title: string
  campusId?: string
  teamId?: string
  umkmId?: string
}

export type AuthSession = {
  token: string
  expiresAt: string
}

export const ADMIN_ROLES: readonly AppRole[] = ['super_admin', 'admin_panitia', 'admin']
export const STUDENT_ROLES: readonly AppRole[] = ['mahasiswa', 'ketua_tim']
export const INSTRUCTOR_ROLES: readonly AppRole[] = ['dosen']
