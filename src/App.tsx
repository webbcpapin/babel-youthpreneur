import { Navigate, Route, Routes } from 'react-router'
import { ADMIN_ROLES, INSTRUCTOR_ROLES, STUDENT_ROLES } from './auth/auth-types'
import LoginPage from './auth/LoginPage'
import { ProtectedRoute, RoleBasedRoute } from './auth/RouteGuards'
import MonitoringPage from './monitoring/MonitoringPage'
import DokumentasiPage from './pages/DokumentasiPage'
import EvaluasiPage from './pages/EvaluasiPage'
import HomePage from './pages/HomePage'
import RencanaPage from './pages/RencanaPage'
import RegisterMahasiswaPage from './pages/RegisterMahasiswaPage'
import RegisterUmkmPage from './pages/RegisterUmkmPage'

function UnauthorizedPage() {
  return <main className="auth-state-screen"><section className="panel"><p className="eyebrow">Akses dibatasi</p><h1>Anda tidak memiliki izin untuk membuka halaman ini.</h1><a className="monitoring-button auth-link-button" href="#/monitoring">Kembali ke dashboard</a></section></main>
}

function NotFoundPage() {
  return <main className="auth-state-screen"><section className="panel"><p className="eyebrow">404</p><h1>Halaman tidak ditemukan.</h1><a className="monitoring-button auth-link-button" href="#/">Kembali ke beranda</a></section></main>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/mahasiswa" element={<RegisterMahasiswaPage />} />
      <Route path="/register/umkm" element={<RegisterUmkmPage />} />
      <Route path="/evaluasi" element={<EvaluasiPage />} />
      <Route path="/rencana-2026" element={<RencanaPage />} />
      <Route path="/dokumentasi" element={<DokumentasiPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/monitoring" element={<MonitoringPage />} />
        <Route element={<RoleBasedRoute allowedRoles={STUDENT_ROLES} />}>
          <Route path="/student/dashboard" element={<Navigate to="/monitoring" replace />} />
        </Route>
        <Route element={<RoleBasedRoute allowedRoles={INSTRUCTOR_ROLES} />}>
          <Route path="/instructor/dashboard" element={<Navigate to="/monitoring" replace />} />
        </Route>
        <Route element={<RoleBasedRoute allowedRoles={ADMIN_ROLES} />}>
          <Route path="/admin/dashboard" element={<Navigate to="/monitoring" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
