import { Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import EvaluasiPage from './pages/EvaluasiPage'
import RencanaPage from './pages/RencanaPage'
import DokumentasiPage from './pages/DokumentasiPage'
import MonitoringPage from './monitoring/MonitoringPage'

export default function App() {
  const hash = window.location.hash
  const isSupabaseOAuthCallback = hash.includes('access_token=') || hash.includes('error_code=')

  if (isSupabaseOAuthCallback) return <MonitoringPage />

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/evaluasi" element={<EvaluasiPage />} />
      <Route path="/rencana-2026" element={<RencanaPage />} />
      <Route path="/dokumentasi" element={<DokumentasiPage />} />
      <Route path="/monitoring" element={<MonitoringPage />} />
    </Routes>
  )
}

