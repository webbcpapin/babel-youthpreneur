import { Routes, Route } from 'react-router'
import HomePage from './pages/HomePage'
import EvaluasiPage from './pages/EvaluasiPage'
import RencanaPage from './pages/RencanaPage'
import DokumentasiPage from './pages/DokumentasiPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/evaluasi" element={<EvaluasiPage />} />
      <Route path="/rencana-2026" element={<RencanaPage />} />
      <Route path="/dokumentasi" element={<DokumentasiPage />} />
    </Routes>
  )
}
