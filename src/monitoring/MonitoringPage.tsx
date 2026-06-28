import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type SetStateAction } from 'react'
import {
  Bell,
  BookOpen,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  Gauge,
  GraduationCap,
  LogOut,
  Medal,
  QrCode,
  Search,
  ShieldCheck,
  UploadCloud,
} from 'lucide-react'
import './MonitoringPage.css'

type Role = 'admin' | 'dosen' | 'mahasiswa' | 'umkm' | 'juri'
type View = 'dashboard' | 'learning' | 'attendance' | 'weekly' | 'outputs' | 'challenge' | 'reports'
type TeamStatus = 'aman' | 'perlu_perhatian' | 'kritis'
type OutputStatus = 'draft' | 'submitted' | 'revision' | 'approved'

type Profile = {
  role: Role
  name: string
  title: string
}

type Team = {
  id: string
  name: string
  campus: string
  umkm: string
  members: string[]
  umkmCategory: string
  umkmOwner: string
  umkmLocation: string
  progress: number
  status: TeamStatus
  reports: number
  outputs: number
  attendance: number
}

type LearningModule = {
  id: string
  title: string
  date: string
  status: 'Belum mulai' | 'Berjalan' | 'Selesai'
  progress: number
  materials: string[]
  assignment: string
  quizAverage: number
}

type WeeklyReport = {
  id: string
  teamId: string
  week: number
  activity: string
  progress: string
  validation: 'pending' | 'validated' | 'revision'
}

type OutputItem = {
  id: string
  teamId: string
  type: string
  title: string
  status: OutputStatus
  linkStatus: 'valid format' | 'perlu dicek' | 'kosong' | 'restricted' | 'perlu revisi'
  umkmFeedback: string
}

type Score = {
  teamId: string
  category: string
  score: number
  note: string
}

type MonitoringData = {
  teams: Team[]
  reports: WeeklyReport[]
  outputs: OutputItem[]
  scores: Score[]
}

type BackendStatus = {
  mode: 'local' | 'google'
  message: string
  sheetId?: string
}

type MonitoringConfig = {
  sheetId?: string
  appsScriptUrl?: string
}

declare global {
  interface Window {
    MONITORING_CONFIG?: MonitoringConfig
  }
}

const profiles: Record<Role, Profile> = {
  admin: { role: 'admin', name: 'Admin Program', title: 'Panitia' },
  dosen: { role: 'dosen', name: 'Dosen Pendamping', title: 'Dosen' },
  mahasiswa: { role: 'mahasiswa', name: 'Meizha Hadzami', title: 'Mahasiswa' },
  umkm: { role: 'umkm', name: 'Dnd Cake n Cookie', title: 'UMKM' },
  juri: { role: 'juri', name: 'Juri Program', title: 'Juri' },
}

const teams: Team[] = [
  {
    id: 'g1',
    name: 'Kelompok 1',
    campus: 'Universitas Bangka Belitung',
    umkm: 'Madu RR Arisi',
    members: ['Muhammad Faiq Elfaruq', 'Umar Dzaki Elfatih', 'Maulana Malik Ibrahim'],
    umkmCategory: 'Madu dan olahan pangan',
    umkmOwner: 'Arisi',
    umkmLocation: 'Bangka Belitung',
    progress: 78,
    status: 'aman',
    reports: 4,
    outputs: 4,
    attendance: 92,
  },
  {
    id: 'g2',
    name: 'Kelompok 2',
    campus: 'Universitas Anak Bangsa',
    umkm: 'JJ Catering',
    members: ['Amaliya Putri Nurisma', 'Valerin Dia Nova', 'Nurul Apni'],
    umkmCategory: 'Olahan makanan',
    umkmOwner: 'Ramon',
    umkmLocation: 'Kota Pangkalpinang',
    progress: 72,
    status: 'aman',
    reports: 4,
    outputs: 3,
    attendance: 88,
  },
  {
    id: 'g3',
    name: 'Kelompok 3',
    campus: 'Universitas Pertiba',
    umkm: 'DND Cake & Cookies by Desi',
    members: ['Liviana', 'Olyvia Ayu Poernama', 'Rasya Agustin'],
    umkmCategory: 'Olahan makanan',
    umkmOwner: 'Desi Yulita',
    umkmLocation: 'Kelurahan Tuatunu Indah, Kota Pangkalpinang',
    progress: 83,
    status: 'aman',
    reports: 4,
    outputs: 5,
    attendance: 94,
  },
  {
    id: 'g4',
    name: 'Kelompok 4',
    campus: 'Universitas Pertiba',
    umkm: 'Deshanda Craft',
    members: ['Aprilian Anggara', 'Iqbal Abdillah', 'Abizar'],
    umkmCategory: 'Kerajinan',
    umkmOwner: 'Eva Deswanti',
    umkmLocation: 'Kota Pangkalpinang',
    progress: 64,
    status: 'perlu_perhatian',
    reports: 3,
    outputs: 2,
    attendance: 76,
  },
  {
    id: 'g5',
    name: 'Kelompok 5',
    campus: 'Universitas Bangka Belitung',
    umkm: "Kamiz Choc's",
    members: ['Angelia Okta Ferani', 'Kevin Setiawan', 'Salma Azzahra'],
    umkmCategory: 'Olahan cokelat',
    umkmOwner: 'Hamdan',
    umkmLocation: 'Kota Pangkalpinang',
    progress: 86,
    status: 'aman',
    reports: 4,
    outputs: 5,
    attendance: 90,
  },
  {
    id: 'g6',
    name: 'Kelompok 6',
    campus: 'Universitas Muhammadiyah Bangka Belitung',
    umkm: 'Keripik Cumi Nina',
    members: ['Meizha Hadzami', 'Zalva Rosemayini Putri Rais', 'Maharani Fatiya Azzahra'],
    umkmCategory: 'Olahan makanan',
    umkmOwner: 'Nafa',
    umkmLocation: 'Kabupaten Bangka',
    progress: 68,
    status: 'aman',
    reports: 3,
    outputs: 3,
    attendance: 84,
  },
  {
    id: 'g7',
    name: 'Kelompok 7',
    campus: 'IAIN SAS Bangka Belitung',
    umkm: 'Rumah Makan Raja Lele',
    members: ['Sandri', 'Aulia Rohimah', 'Sundari'],
    umkmCategory: 'Olahan makanan',
    umkmOwner: 'Pipit',
    umkmLocation: 'Jl Bina Marga, Kota Pangkalpinang',
    progress: 73,
    status: 'aman',
    reports: 4,
    outputs: 3,
    attendance: 86,
  },
  {
    id: 'g8',
    name: 'Kelompok 8',
    campus: 'IAIN SAS Bangka Belitung',
    umkm: '3 Shesca Decoupage',
    members: ['Jordi', 'Miftahul', 'Novita Aprianti'],
    umkmCategory: 'Kerajinan',
    umkmOwner: 'Shesca',
    umkmLocation: 'Bangka Belitung',
    progress: 52,
    status: 'perlu_perhatian',
    reports: 2,
    outputs: 2,
    attendance: 72,
  },
  {
    id: 'g9',
    name: 'Kelompok 9',
    campus: 'Universitas Muhammadiyah Bangka Belitung',
    umkm: 'Central Charcoal Babelindo',
    members: ['Muhammad Muda Wali', 'Haruku Maulana', 'Iqmal Prakoso'],
    umkmCategory: 'Daun ketapang dan leaf litter',
    umkmOwner: 'Lukman',
    umkmLocation: 'Kota Pangkalpinang',
    progress: 59,
    status: 'perlu_perhatian',
    reports: 2,
    outputs: 2,
    attendance: 74,
  },
  {
    id: 'g10',
    name: 'Kelompok 10',
    campus: 'Universitas Anak Bangsa',
    umkm: 'Deviz Indo Bangka',
    members: ['Iis Kholifah', 'Danil Eko Saputra', 'Gustia'],
    umkmCategory: 'Olahan makanan',
    umkmOwner: 'Yuyun',
    umkmLocation: 'Kota Pangkalpinang',
    progress: 28,
    status: 'kritis',
    reports: 1,
    outputs: 1,
    attendance: 58,
  },
]

const learningModules: LearningModule[] = [
  {
    id: 'm1',
    title: 'Orientasi Program dan Etika Pendampingan UMKM',
    date: '7 Agustus 2026',
    status: 'Selesai',
    progress: 100,
    materials: ['Modul teks', 'Slide', 'Quiz'],
    assignment: 'Peta kebutuhan UMKM',
    quizAverage: 86,
  },
  {
    id: 'm2',
    title: 'Digital Branding dan Copywriting',
    date: '14 Agustus 2026',
    status: 'Berjalan',
    progress: 64,
    materials: ['Video', 'Template caption', 'Quiz'],
    assignment: 'Draft brand voice',
    quizAverage: 78,
  },
  {
    id: 'm3',
    title: 'Foto Produk dan Video Pendek',
    date: '21 Agustus 2026',
    status: 'Belum mulai',
    progress: 12,
    materials: ['Video praktik', 'Checklist alat', 'Tugas'],
    assignment: '3 foto produk dan 1 video',
    quizAverage: 0,
  },
  {
    id: 'm4',
    title: 'Katalog Digital dan Landing Page',
    date: '28 Agustus 2026',
    status: 'Belum mulai',
    progress: 0,
    materials: ['Slide', 'Contoh landing page', 'Rubrik'],
    assignment: 'Link katalog siap uji',
    quizAverage: 0,
  },
]

const reports: WeeklyReport[] = [
  { id: 'r1', teamId: 'g3', week: 1, activity: 'Profil DND Cake & Cookies selesai.', progress: 'Kebutuhan branding dan kanal publikasi dipetakan.', validation: 'validated' },
  { id: 'r2', teamId: 'g3', week: 2, activity: 'Produksi konten awal.', progress: 'Kalender konten minggu pertama selesai.', validation: 'validated' },
  { id: 'r3', teamId: 'g4', week: 3, activity: 'Koordinasi ulang dengan Deshanda Craft.', progress: 'Output terlambat karena bahan foto belum lengkap.', validation: 'revision' },
  { id: 'r4', teamId: 'g10', week: 3, activity: 'Belum ada kunjungan lanjutan ke Deviz Indo Bangka.', progress: 'Perlu intervensi dosen dan panitia.', validation: 'pending' },
  { id: 'r5', teamId: 'g6', week: 2, activity: 'Pemetaan produk Keripik Cumi Nina.', progress: 'Draft konten edukasi produk sudah dibuat.', validation: 'validated' },
  { id: 'r6', teamId: 'g9', week: 2, activity: 'Diskusi kebutuhan Central Charcoal Babelindo.', progress: 'Konten product knowledge masih perlu revisi.', validation: 'revision' },
]

const outputs: OutputItem[] = [
  { id: 'o1', teamId: 'g3', type: 'Kalender konten', title: 'Kalender Konten DND Cake', status: 'approved', linkStatus: 'valid format', umkmFeedback: 'Sudah bisa dipakai' },
  { id: 'o2', teamId: 'g3', type: 'Konten media sosial', title: 'Paket 9 Caption Cookies', status: 'submitted', linkStatus: 'perlu dicek', umkmFeedback: 'Menunggu review' },
  { id: 'o3', teamId: 'g2', type: 'Video pendek', title: 'Video Produk JJ Catering', status: 'revision', linkStatus: 'valid format', umkmFeedback: 'Perlu revisi' },
  { id: 'o4', teamId: 'g1', type: 'Landing page', title: 'Katalog Madu RR Arisi', status: 'submitted', linkStatus: 'valid format', umkmFeedback: 'Perlu dicek' },
  { id: 'o5', teamId: 'g5', type: 'Katalog digital', title: 'Katalog Kamiz Choc', status: 'approved', linkStatus: 'valid format', umkmFeedback: 'Sesuai kebutuhan' },
  { id: 'o6', teamId: 'g10', type: 'Konten media sosial', title: 'Konten Deviz Indo Bangka', status: 'draft', linkStatus: 'kosong', umkmFeedback: 'Belum bisa dipakai' },
  { id: 'o7', teamId: 'g7', type: 'Video pendek', title: 'Video Rumah Makan Raja Lele', status: 'submitted', linkStatus: 'perlu dicek', umkmFeedback: 'Menunggu review' },
]

const scores: Score[] = [
  { teamId: 'g5', category: 'Best Product Campaign', score: 88, note: 'Kuat pada visual dan pesan produk.' },
  { teamId: 'g3', category: 'Best Content Strategy', score: 84, note: 'Konsisten dan mudah diterapkan UMKM.' },
  { teamId: 'g6', category: 'Best Digital Branding', score: 80, note: 'Butuh penguatan dampak awal.' },
  { teamId: 'g2', category: 'Best Social Media Growth', score: 72, note: 'Output perlu dirapikan.' },
  { teamId: 'g10', category: 'Best Website or Landing Page', score: 61, note: 'Belum siap dinilai final.' },
]

const localData: MonitoringData = {
  teams,
  reports,
  outputs,
  scores,
}

const navItems: Array<{ key: View; label: string; icon: typeof Gauge }> = [
  { key: 'dashboard', label: 'Dashboard', icon: Gauge },
  { key: 'learning', label: 'Course', icon: BookOpen },
  { key: 'attendance', label: 'Presensi', icon: QrCode },
  { key: 'weekly', label: 'Laporan', icon: ClipboardCheck },
  { key: 'outputs', label: 'Output', icon: UploadCloud },
  { key: 'challenge', label: 'Challenge', icon: Medal },
  { key: 'reports', label: 'Export', icon: FileSpreadsheet },
]

function initials(value: string) {
  return value
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

function statusLabel(value: string) {
  return value.replace(/_/g, ' ')
}

function roleTitle(role: Role) {
  return profiles[role]?.title ?? 'Peserta'
}

function downloadCsv(filename: string, rows: Array<Record<string, string | number>>) {
  const headers = Object.keys(rows[0] ?? { status: 'Tidak ada data' })
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`
  const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header] ?? '')).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function getMonitoringConfig() {
  return window.MONITORING_CONFIG ?? {}
}

function hasGoogleBackend() {
  const config = getMonitoringConfig()
  return Boolean(config.appsScriptUrl && /^https:\/\/script\.google\.com\/macros\/s\/.+\/exec/.test(config.appsScriptUrl))
}

async function fetchGoogleData(email?: string): Promise<MonitoringData> {
  const config = getMonitoringConfig()
  if (!config.appsScriptUrl) throw new Error('URL Apps Script belum diisi.')
  const url = new URL(config.appsScriptUrl)
  url.searchParams.set('action', 'getData')
  if (email) url.searchParams.set('email', email)
  const response = await fetch(url.toString())
  if (!response.ok) throw new Error(`Google backend error ${response.status}`)
  const payload = await response.json()
  if (!payload.ok) throw new Error(payload.error || 'Google backend belum siap.')
  return {
    teams: payload.teams ?? localData.teams,
    reports: payload.reports ?? localData.reports,
    outputs: payload.outputs ?? localData.outputs,
    scores: payload.scores ?? localData.scores,
  }
}

async function postGoogleAction(action: string, payload: Record<string, string | number>) {
  const config = getMonitoringConfig()
  if (!config.appsScriptUrl) return null
  const url = new URL(config.appsScriptUrl)
  url.searchParams.set('action', action)
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
  const result = await response.json()
  if (!result.ok) throw new Error(result.error || 'Google backend belum menerima data.')
  return result
}

function getScopedTeams(profile: Profile, sourceTeams: Team[]) {
  if (profile.role === 'mahasiswa') return sourceTeams.filter((team) => team.id === 'g6')
  if (profile.role === 'umkm') return sourceTeams.filter((team) => team.id === 'g3')
  if (profile.role === 'dosen') return sourceTeams.filter((team) => team.campus === 'Universitas Bangka Belitung')
  return sourceTeams
}

function MonitoringPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [view, setView] = useState<View>('dashboard')
  const [query, setQuery] = useState('')
  const [data, setData] = useState<MonitoringData>(localData)
  const [backendStatus, setBackendStatus] = useState<BackendStatus>(() => ({
    mode: hasGoogleBackend() ? 'google' : 'local',
    message: hasGoogleBackend() ? 'Menghubungkan ke Google Sheet...' : 'Mode lokal aktif. Isi URL Apps Script untuk memakai Google Sheet/Drive.',
    sheetId: getMonitoringConfig().sheetId,
  }))

  useEffect(() => {
    let cancelled = false
    if (!hasGoogleBackend()) return

    fetchGoogleData()
      .then((nextData) => {
        if (cancelled) return
        setData(nextData)
        setBackendStatus({
          mode: 'google',
          message: 'Google Sheet dan Drive tersambung.',
          sheetId: getMonitoringConfig().sheetId,
        })
      })
      .catch((error) => {
        if (cancelled) return
        setBackendStatus({
          mode: 'local',
          message: error instanceof Error ? error.message : 'Gagal menghubungkan Google backend. Mode lokal tetap aktif.',
          sheetId: getMonitoringConfig().sheetId,
        })
      })

    return () => {
      cancelled = true
    }
  }, [])

  const scopedTeams = useMemo(() => {
    const base = profile ? getScopedTeams(profile, data.teams) : data.teams
    const cleanQuery = query.toLowerCase().trim()
    if (!cleanQuery) return base
    return base.filter((team) => `${team.name} ${team.campus} ${team.umkm} ${team.members.join(' ')}`.toLowerCase().includes(cleanQuery))
  }, [data.teams, profile, query])

  async function loginWithEmail(email: string) {
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) throw new Error('Email Google wajib diisi.')
    const result = await postGoogleAction('loginByEmail', { email: cleanEmail })
    if (!result?.profile) throw new Error(result?.error || 'Akun belum aktif.')
    const nextProfile = result.profile
    setProfile({
      role: nextProfile.role as Role,
      name: nextProfile.name || cleanEmail,
      title: nextProfile.title || roleTitle(nextProfile.role as Role),
    })
    if (hasGoogleBackend()) {
      setData(await fetchGoogleData(cleanEmail))
    }
  }

  if (!profile) {
    return <LoginScreen onSelect={(role) => setProfile(profiles[role])} onLogin={loginWithEmail} />
  }

  return (
    <div className="monitoring-shell">
      <div className="monitoring-app">
        <aside className="monitoring-sidebar">
          <div className="brand-row">
            <div className="brand-mark">BY</div>
            <div>
              <p className="sidebar-title">Babel Youthpreneur</p>
              <h2 className="sidebar-heading">Monitoring System</h2>
            </div>
          </div>

          <nav className="monitoring-nav" aria-label="Navigasi monitoring">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button className={view === item.key ? 'nav-button active' : 'nav-button'} key={item.key} onClick={() => setView(item.key)}>
                  <Icon size={18} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="profile-row">
            <div className="avatar">{initials(profile.name)}</div>
            <div>
              <strong>{profile.name}</strong>
              <small>{profile.title}</small>
            </div>
          </div>
          <button className="monitoring-button" onClick={() => setProfile(null)}>
            <LogOut size={16} /> Keluar
          </button>
        </aside>

        <main className="monitoring-main">
          <header className="monitoring-topbar">
            <div>
              <p className="workspace-label">Workspace {profile.title}</p>
              <h1 className="page-title">{pageTitle(view)}</h1>
            </div>
            <div className="top-actions">
              <label>
                <span className="sr-only">Cari data monitoring</span>
                <input className="search-box" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari tim, kampus, UMKM..." />
              </label>
              <button className="monitoring-button icon" title="Cari">
                <Search size={18} />
              </button>
              <button className="monitoring-button icon" title="Notifikasi">
                <Bell size={18} />
              </button>
            </div>
          </header>

          <BackendNotice status={backendStatus} />

          {view === 'dashboard' && <Dashboard profile={profile} teams={scopedTeams} reports={data.reports} outputs={data.outputs} />}
          {view === 'learning' && <LearningCenter profile={profile} />}
          {view === 'attendance' && <AttendanceCenter profile={profile} teams={scopedTeams} />}
          {view === 'weekly' && <WeeklyMonitoring profile={profile} teams={scopedTeams} reports={data.reports} setData={setData} />}
          {view === 'outputs' && <OutputTracker profile={profile} teams={scopedTeams} outputs={data.outputs} setData={setData} />}
          {view === 'challenge' && <ChallengeScoring profile={profile} teams={scopedTeams} scores={data.scores} />}
          {view === 'reports' && <ReportCenter profile={profile} teams={scopedTeams} />}
        </main>
      </div>
    </div>
  )
}

function LoginScreen({ onSelect, onLogin }: { onSelect: (role: Role) => void; onLogin: (email: string) => Promise<void> }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [requestedRole, setRequestedRole] = useState<Role>('mahasiswa')
  const [institution, setInstitution] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [note, setNote] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const result = await postGoogleAction('registerAccount', {
        email,
        name,
        requested_role: requestedRole,
        institution,
        whatsapp,
        note,
      })
      setMessage(result?.message || 'Registrasi diterima. Admin akan mengonfirmasi akun dan menetapkan role.')
      setLoginEmail(email)
      setName('')
      setInstitution('')
      setWhatsapp('')
      setNote('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registrasi belum berhasil dikirim.')
    } finally {
      setBusy(false)
    }
  }

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      await onLogin(loginEmail)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Akun belum aktif atau belum diberi role oleh admin.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main
      className="monitoring-login"
      style={{
        backgroundImage:
          'linear-gradient(120deg, rgba(15, 118, 110, 0.88), rgba(30, 64, 175, 0.82)), url("./images/banner-opening.png")',
      }}
    >
      <section className="login-panel">
        <p className="eyebrow">Babel Youthpreneur 2026</p>
        <h1>Learning and Monitoring Platform</h1>
        <p>
          Register akun Google terlebih dahulu. Setelah admin mengonfirmasi dan menetapkan role, akun dapat masuk ke dashboard sesuai aksesnya.
        </p>
        <form className="register-card" onSubmit={submitRegistration}>
          <div className="form-grid two">
            <label>Nama lengkap <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama sesuai akun Google" /></label>
            <label>Email Google <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@gmail.com" /></label>
            <label>Daftar sebagai <select value={requestedRole} onChange={(event) => setRequestedRole(event.target.value as Role)}>
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen</option>
              <option value="umkm">UMKM</option>
              <option value="juri">Juri</option>
              <option value="admin">Panitia</option>
            </select></label>
            <label>Kampus/UMKM/Instansi <input value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder="Contoh: UBB / DND Cake" /></label>
            <label>WhatsApp <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="08..." /></label>
            <label>Catatan <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tim, UMKM, atau kebutuhan akses" /></label>
          </div>
          <button className="monitoring-button primary" disabled={busy}>
            <ShieldCheck size={16} /> Register Akun Google
          </button>
        </form>
        <form className="login-check-card" onSubmit={submitLogin}>
          <label>Email yang sudah dikonfirmasi admin <input type="email" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} placeholder="nama@gmail.com" /></label>
          <button className="monitoring-button" disabled={busy}>Cek Status / Masuk</button>
        </form>
        {message && <div className="login-message">{message}</div>}
        {!hasGoogleBackend() && (
          <details className="demo-login-panel">
            <summary>Mode demo lokal</summary>
            <div className="role-grid">
              {Object.values(profiles).map((profile) => (
                <button className="monitoring-button" key={profile.role} onClick={() => onSelect(profile.role)}>
                  {profile.title}
                </button>
              ))}
            </div>
          </details>
        )}
      </section>
      <section className="login-health" aria-label="Program health">
        <div className="health-tile">
          <span>Program Health</span>
          <strong>78%</strong>
        </div>
        <div className="health-tile">
          <span>Tim Aktif</span>
          <strong>10 Tim</strong>
        </div>
        <div className="health-tile">
          <span>Mahasiswa</span>
          <strong>30 Peserta</strong>
        </div>
        <div className="health-tile">
          <span>Presensi QR</span>
          <strong>Foto + Geotag</strong>
        </div>
        <div className="health-tile">
          <span>Output UMKM</span>
          <strong>Challenge</strong>
        </div>
      </section>
    </main>
  )
}

function BackendNotice({ status }: { status: BackendStatus }) {
  return (
    <div className={status.mode === 'google' ? 'backend-notice connected' : 'backend-notice local'}>
      <strong>{status.mode === 'google' ? 'Google backend aktif' : 'Mode lokal'}</strong>
      <span>{status.message}</span>
      {status.sheetId && <a href={`https://docs.google.com/spreadsheets/d/${status.sheetId}/edit`} target="_blank" rel="noreferrer">Buka Google Sheet</a>}
    </div>
  )
}

function getActionItems(visibleTeams: Team[], activeReports: WeeklyReport[], activeOutputs: OutputItem[]) {
  return visibleTeams.flatMap((team) => {
    const reports = activeReports.filter((report) => report.teamId === team.id)
    const outputs = activeOutputs.filter((output) => output.teamId === team.id)
    const actions: Array<{ type: string; team: string; detail: string; tone: string }> = []

    if (reports.length === 0 || team.reports < 2) {
      actions.push({ type: 'Laporan', team: team.name, detail: 'Laporan mingguan belum lengkap atau perlu dikejar.', tone: 'pending' })
    }
    if (outputs.length === 0 || outputs.some((output) => output.linkStatus === 'kosong')) {
      actions.push({ type: 'Output', team: team.name, detail: 'Ada output yang belum memiliki link atau belum dikirim.', tone: 'revision' })
    }
    if (outputs.some((output) => ['perlu dicek', 'restricted', 'perlu revisi'].includes(output.linkStatus))) {
      actions.push({ type: 'Link', team: team.name, detail: 'Ada link output yang perlu dicek panitia sebelum final.', tone: 'submitted' })
    }
    if (team.attendance < 75) {
      actions.push({ type: 'Presensi', team: team.name, detail: `Presensi tim baru ${team.attendance}%.`, tone: 'revision' })
    }
    if (team.status === 'kritis') {
      actions.push({ type: 'Kritis', team: team.name, detail: 'Perlu eskalasi ke dosen pendamping dan panitia.', tone: 'kritis' })
    }

    return actions
  })
}

function Dashboard({ profile, teams: visibleTeams, reports: activeReports, outputs: activeOutputs }: { profile: Profile; teams: Team[]; reports: WeeklyReport[]; outputs: OutputItem[] }) {
  const totalReports = activeReports.filter((report) => visibleTeams.some((team) => team.id === report.teamId)).length
  const totalOutputs = activeOutputs.filter((output) => visibleTeams.some((team) => team.id === output.teamId)).length
  const totalStudents = visibleTeams.reduce((sum, team) => sum + team.members.length, 0)
  const averageProgress = Math.round(visibleTeams.reduce((sum, team) => sum + team.progress, 0) / Math.max(1, visibleTeams.length))
  const criticalCount = visibleTeams.filter((team) => team.status === 'kritis').length
  const actions = getActionItems(visibleTeams, activeReports, activeOutputs)

  return (
    <div className="content-grid">
      <section className="hero-strip">
        <div>
          <p className="eyebrow">Command Center</p>
          <h2>Babel Youthpreneur 2026</h2>
          <p>Ringkasan cepat untuk melihat pembelajaran, presensi, laporan, output, dan tim yang membutuhkan pendampingan tambahan.</p>
          <span className="role-pill status-pill submitted">Role aktif: {profile.title}</span>
        </div>
        <div className="progress-ring">
          <strong>{averageProgress}%</strong>
        </div>
      </section>

      <section className="metric-grid">
        <Metric label="Total Tim" value={visibleTeams.length} hint="Sesuai hak akses role" />
        <Metric label="Mahasiswa" value={totalStudents} hint="Data peserta batch 2026" />
        <Metric label="Laporan Masuk" value={totalReports} hint="Laporan mingguan" />
        <Metric label="Output Terkirim" value={totalOutputs} hint="Draft sampai approved" />
        <Metric label="Tim Kritis" value={criticalCount} hint="Perlu intervensi" />
      </section>

      {profile.role === 'admin' && (
        <section className="panel">
          <div className="panel-title">
            <h3>Action List Panitia</h3>
            <span className="muted">{actions.length} prioritas</span>
          </div>
          <div className="action-list">
            {actions.length === 0 && <div className="empty-state">Tidak ada isu kritis untuk role ini.</div>}
            {actions.map((action) => (
              <article className="action-item" key={`${action.type}-${action.team}`}>
                <span className={`status-pill ${action.tone}`}>{action.type}</span>
                <strong>{action.team}</strong>
                <p>{action.detail}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="panel">
        <div className="panel-title">
          <h3>Progress Program</h3>
          <span className="muted">Fase berjalan</span>
        </div>
        <div className="phase-track">
          {[
            ['Kurasi', 100],
            ['Pelatihan', 70],
            ['Pendampingan', 52],
            ['Final Challenge', 24],
            ['Evaluasi', 10],
          ].map(([label, value]) => (
            <div className="phase-item" key={label}>
              <strong>{label}</strong>
              <div className="bar">
                <span style={{ width: `${value}%` }} />
              </div>
              <span>{value}%</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">
          <h3>Monitoring Tim</h3>
          <span className="muted">{visibleTeams.length} tim</span>
        </div>
        <TeamList teams={visibleTeams} />
      </section>
    </div>
  )
}

function LearningCenter({ profile }: { profile: Profile }) {
  return (
    <div className="content-grid">
      <section className="hero-strip">
        <div>
          <p className="eyebrow">Learning Center</p>
          <h2>Course Pelatihan Agustus</h2>
          <p>Materi, video, slide, kuis, tugas, dan progress belajar diringkas agar mahasiswa, dosen, dan panitia punya acuan yang sama.</p>
        </div>
        <GraduationCap size={96} color="#0f766e" />
      </section>
      <section className="learning-grid">
        {learningModules.map((module, index) => (
          <article className="learning-card" key={module.id}>
            <div className="module-head">
              <div className="module-number">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <span className={`status-pill ${module.status === 'Selesai' ? 'selesai' : 'submitted'}`}>{module.status}</span>
                <h3>{module.title}</h3>
                <p>{module.date}</p>
              </div>
            </div>
            <div className="bar">
              <span style={{ width: `${module.progress}%` }} />
            </div>
            <div className="material-list">
              {module.materials.map((material) => (
                <span className="material-chip" key={material}>{material}</span>
              ))}
            </div>
            <p className="muted">Tugas: {module.assignment}</p>
            <strong>Rata-rata kuis: {module.quizAverage || '-'}{module.quizAverage ? '/100' : ''}</strong>
            {profile.role === 'admin' && <button className="monitoring-button primary">Kelola Modul</button>}
          </article>
        ))}
      </section>
    </div>
  )
}

function AttendanceCenter({ profile, teams: visibleTeams }: { profile: Profile; teams: Team[] }) {
  const attendanceRows = visibleTeams.map((team) => ({
    team: team.name,
    campus: team.campus,
    students: team.members.join('; '),
    umkm: team.umkm,
    attendance: `${team.attendance}%`,
    status: team.attendance >= 80 ? 'valid' : 'flagged_location',
  }))

  return (
    <div className="content-grid">
      <section className="attendance-grid">
        <Metric label="Presensi Valid" value={`${Math.round(visibleTeams.reduce((sum, team) => sum + team.attendance, 0) / Math.max(1, visibleTeams.length))}%`} hint="Rata-rata tim" />
        <Metric label="Pending Review" value={profile.role === 'admin' ? 3 : 0} hint="Butuh cek panitia" />
        <Metric label="Duplikat" value={0} hint="Percobaan ulang" />
      </section>
      <section className="hero-strip">
        <div>
          <p className="eyebrow">QR Dinamis</p>
          <h2>Mode Presentasi Presensi</h2>
          <p>Produksi memakai Google Apps Script untuk token QR, validasi waktu, foto ke Google Drive, rekap ke Google Sheet, dan audit perangkat.</p>
          <div className="button-row">
            <button className="monitoring-button primary" disabled={profile.role !== 'admin'}>Buat Sesi Presensi</button>
            <button className="monitoring-button">Scan QR</button>
          </div>
        </div>
        <QrCode size={120} color="#0f766e" />
      </section>
      <section className="panel">
        <div className="panel-title">
          <h3>Rekap Presensi</h3>
          <button className="monitoring-button" onClick={() => downloadCsv('attendance-recap.csv', attendanceRows)}>
            <Download size={16} /> CSV
          </button>
        </div>
        <div className="report-list">
          {attendanceRows.map((row) => (
            <article className="attendance-card" key={row.team}>
              <div>
                <strong>{row.team}</strong>
                <p>{row.campus} - {row.umkm} - {row.attendance}</p>
              </div>
              <span className={`status-pill ${row.status}`}>{statusLabel(row.status)}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function WeeklyMonitoring({ profile, teams: visibleTeams, reports: activeReports, setData }: { profile: Profile; teams: Team[]; reports: WeeklyReport[]; setData: Dispatch<SetStateAction<MonitoringData>> }) {
  const visibleReports = activeReports.filter((report) => visibleTeams.some((team) => team.id === report.teamId))
  const [teamId, setTeamId] = useState(visibleTeams[0]?.id ?? '')
  const [activity, setActivity] = useState('')
  const [progress, setProgress] = useState('')
  const [message, setMessage] = useState('')

  async function submitWeeklyReport() {
    const targetTeam = visibleTeams.find((team) => team.id === teamId) ?? visibleTeams[0]
    if (!targetTeam || !activity.trim() || !progress.trim()) {
      setMessage('Isi tim, aktivitas, dan progress sebelum mengirim laporan.')
      return
    }

    const report: WeeklyReport = {
      id: `local-report-${Date.now()}`,
      teamId: targetTeam.id,
      week: Math.max(1, targetTeam.reports + 1),
      activity: activity.trim(),
      progress: progress.trim(),
      validation: 'pending',
    }

    try {
      await postGoogleAction('submitWeeklyReport', {
        team_id: targetTeam.id,
        week: report.week,
        activity: report.activity,
        progress: report.progress,
        email: profile.name,
      })
      setMessage('Laporan berhasil dikirim ke Google Sheet.')
    } catch {
      setMessage('Laporan tersimpan di tampilan lokal. Cek kembali endpoint Google Sheet jika ingin permanen.')
    }

    setData((current) => ({
      ...current,
      reports: [report, ...current.reports],
      teams: current.teams.map((team) => team.id === targetTeam.id ? { ...team, reports: team.reports + 1 } : team),
    }))
    setActivity('')
    setProgress('')
  }

  return (
    <div className="content-grid">
      {(profile.role === 'admin' || profile.role === 'mahasiswa') && (
        <section className="panel">
          <div className="panel-title">
            <h3>Input Laporan Mingguan</h3>
            <span className="muted">Stepper ringkas</span>
          </div>
          <div className="stepper-grid">
            <article className="form-step">
              <label>
                Tim
                <select value={teamId} onChange={(event) => setTeamId(event.target.value)}>
                  {visibleTeams.map((team) => <option value={team.id} key={team.id}>{team.name}</option>)}
                </select>
              </label>
              <label>
                Aktivitas minggu ini
                <textarea value={activity} onChange={(event) => setActivity(event.target.value)} placeholder="Kegiatan, kunjungan, diskusi, produksi konten..." />
              </label>
            </article>
            <article className="form-step">
              <label>
                Progress dan link
                <textarea value={progress} onChange={(event) => setProgress(event.target.value)} placeholder="Progress output, kendala, rencana berikutnya, link Drive..." />
              </label>
              <button className="monitoring-button primary" onClick={submitWeeklyReport}>Review dan Kirim</button>
              {message && <span className="form-message">{message}</span>}
            </article>
          </div>
        </section>
      )}
      <section className="panel">
        <div className="panel-title">
          <h3>Laporan Masuk</h3>
          <span className="muted">{visibleReports.length} laporan</span>
        </div>
        <div className="report-list">
          {visibleReports.map((report) => {
            const team = visibleTeams.find((item) => item.id === report.teamId)
            return (
              <article className="report-card" key={report.id}>
                <div>
                  <strong>{team?.name ?? '-'} - Minggu {report.week}</strong>
                  <p>{report.activity}</p>
                  <span>{report.progress}</span>
                </div>
                <span className={`status-pill ${report.validation}`}>{statusLabel(report.validation)}</span>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function OutputTracker({ profile, teams: visibleTeams, outputs: activeOutputs, setData }: { profile: Profile; teams: Team[]; outputs: OutputItem[]; setData: Dispatch<SetStateAction<MonitoringData>> }) {
  const visibleOutputs = activeOutputs.filter((output) => visibleTeams.some((team) => team.id === output.teamId))
  const [teamId, setTeamId] = useState(visibleTeams[0]?.id ?? '')
  const [type, setType] = useState('Kalender konten')
  const [title, setTitle] = useState('')
  const [driveLink, setDriveLink] = useState('')
  const [message, setMessage] = useState('')
  const columns: Array<{ key: OutputStatus; label: string }> = [
    { key: 'draft', label: 'Belum dikirim' },
    { key: 'submitted', label: 'Perlu validasi' },
    { key: 'revision', label: 'Perlu revisi' },
    { key: 'approved', label: 'Valid' },
  ]

  async function submitOutput() {
    const targetTeam = visibleTeams.find((team) => team.id === teamId) ?? visibleTeams[0]
    if (!targetTeam || !title.trim()) {
      setMessage('Pilih tim dan isi judul output sebelum menyimpan.')
      return
    }

    const cleanLink = driveLink.trim()
    const output: OutputItem = {
      id: `local-output-${Date.now()}`,
      teamId: targetTeam.id,
      type,
      title: title.trim(),
      status: 'submitted',
      linkStatus: cleanLink ? 'perlu dicek' : 'kosong',
      umkmFeedback: 'Menunggu review',
    }

    try {
      await postGoogleAction('submitOutput', {
        team_id: targetTeam.id,
        type,
        title: output.title,
        drive_link: cleanLink,
        email: profile.name,
      })
      setMessage('Output berhasil dikirim ke Google Sheet.')
    } catch {
      setMessage('Output tersimpan di tampilan lokal. Link boleh dilengkapi nanti.')
    }

    setData((current) => ({
      ...current,
      outputs: [output, ...current.outputs],
      teams: current.teams.map((team) => team.id === targetTeam.id ? { ...team, outputs: team.outputs + 1 } : team),
    }))
    setTitle('')
    setDriveLink('')
  }

  return (
    <div className="content-grid">
      {(profile.role === 'admin' || profile.role === 'mahasiswa') && (
        <section className="panel">
          <div className="panel-title">
            <h3>Upload Output</h3>
            <span className="muted">Checklist final challenge</span>
          </div>
          <div className="form-grid">
            <label>Tim <select value={teamId} onChange={(event) => setTeamId(event.target.value)}>{visibleTeams.map((team) => <option value={team.id} key={team.id}>{team.name}</option>)}</select></label>
            <label>Jenis Output <select value={type} onChange={(event) => setType(event.target.value)}><option>Kalender konten</option><option>Konten media sosial</option><option>Video pendek</option><option>Katalog digital atau landing page</option></select></label>
            <label>Judul <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Judul output" /></label>
            <label>Link Google Drive <input value={driveLink} onChange={(event) => setDriveLink(event.target.value)} placeholder="Opsional jika belum ada" /></label>
            <button className="monitoring-button primary" onClick={submitOutput}>Simpan Output</button>
            {message && <span className="form-message">{message}</span>}
          </div>
        </section>
      )}
      <section className="output-board">
        {columns.map((column) => {
          const items = visibleOutputs.filter((output) => output.status === column.key)
          return (
            <div className="output-column" key={column.key}>
              <div className="panel-title">
                <strong>{column.label}</strong>
                <span className="muted">{items.length}</span>
              </div>
              {items.length === 0 && <div className="empty-state">Belum ada output</div>}
              {items.map((output) => {
                const team = visibleTeams.find((item) => item.id === output.teamId)
                return (
                  <article className="output-card" key={output.id}>
                    <span>{output.type}</span>
                    <strong>{output.title}</strong>
                    <p>{team?.name} - {output.linkStatus}</p>
                    <small>{output.umkmFeedback}</small>
                  </article>
                )
              })}
            </div>
          )
        })}
      </section>
    </div>
  )
}

function ChallengeScoring({ profile, teams: visibleTeams, scores: activeScores }: { profile: Profile; teams: Team[]; scores: Score[] }) {
  const ranked = activeScores
    .filter((score) => visibleTeams.some((team) => team.id === score.teamId))
    .sort((left, right) => right.score - left.score)

  return (
    <div className="content-grid">
      {(profile.role === 'admin' || profile.role === 'juri') && (
        <section className="panel">
          <div className="panel-title">
            <h3>Rubrik Penilaian Challenge</h3>
            <span className="muted">Nilai 1 sampai 100</span>
          </div>
          <div className="material-list">
            {['Kesesuaian kebutuhan UMKM', 'Kualitas output', 'Keterpakaian', 'Kreativitas', 'Dampak awal', 'Konsistensi'].map((rubric) => (
              <span className="material-chip" key={rubric}>{rubric}</span>
            ))}
          </div>
        </section>
      )}
      <section className="challenge-grid">
        {ranked.map((score, index) => {
          const team = visibleTeams.find((item) => item.id === score.teamId)
          return (
            <article className="challenge-card" key={`${score.teamId}-${score.category}`}>
              <span className="module-number">{index + 1}</span>
              <strong>{team?.name ?? '-'}</strong>
              <p>{team?.umkm}</p>
              <span>{score.category}</span>
              <h3>Nilai {score.score}</h3>
              <p>{score.note}</p>
              <button className="monitoring-button primary" disabled={profile.role !== 'juri' && profile.role !== 'admin'}>Nilai Tim</button>
            </article>
          )
        })}
      </section>
    </div>
  )
}

function ReportCenter({ profile, teams: visibleTeams }: { profile: Profile; teams: Team[] }) {
  if (profile.role !== 'admin' && profile.role !== 'dosen') {
    return (
      <section className="panel">
        <div className="empty-state">Export laporan hanya tersedia untuk Panitia dan Dosen.</div>
      </section>
    )
  }

  const rows = visibleTeams.map((team) => ({
    tim: team.name,
    kampus: team.campus,
    mahasiswa: team.members.join('; '),
    umkm: team.umkm,
    komoditi: team.umkmCategory,
    pemilik: team.umkmOwner,
    lokasi: team.umkmLocation,
    progress: team.progress,
    status: team.status,
    laporan: team.reports,
    output: team.outputs,
    presensi: team.attendance,
  }))

  return (
    <div className="content-grid">
      <section className="hero-strip">
        <div>
          <p className="eyebrow">Report Center</p>
          <h2>Pusat Laporan</h2>
          <p>CSV lokal sudah aktif untuk kebutuhan cepat. Export server-side bisa dibuat oleh Apps Script dan disimpan otomatis ke Google Drive.</p>
        </div>
        <button className="monitoring-button primary" onClick={() => downloadCsv('babel-youthpreneur-monitoring.csv', rows)}>
          <Download size={16} /> Download CSV
        </button>
      </section>
      <section className="panel">
        <div className="panel-title">
          <h3>Riwayat Export</h3>
          <span className="muted">Status job</span>
        </div>
        <div className="job-list">
          {['Excel Monitoring', 'PDF Executive Summary', 'Attendance Audit', 'Weekly Report Recap', 'Output Recap', 'Challenge Score Recap'].map((job, index) => (
            <article className="job-row" key={job}>
              <div>
                <strong>{job}</strong>
                <span>{visibleTeams.length} tim tercakup</span>
              </div>
              <span className={`status-pill ${index === 0 ? 'approved' : 'submitted'}`}>{index === 0 ? 'csv ready' : 'queued'}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </article>
  )
}

function TeamList({ teams: visibleTeams }: { teams: Team[] }) {
  if (visibleTeams.length === 0) return <div className="empty-state">Tidak ada tim yang cocok dengan pencarian.</div>

  return (
    <div className="team-list">
      {visibleTeams.map((team) => (
        <article className="team-card" key={team.id}>
          <div className="team-line">
            <div className="avatar">{initials(team.name)}</div>
            <div>
              <strong>{team.name}</strong>
              <span>{team.campus}</span>
            </div>
          </div>
          <div>
            <span>UMKM Dampingan</span>
            <strong>{team.umkm}</strong>
            <span>{team.umkmCategory} - {team.umkmOwner}</span>
          </div>
          <div>
            <span>Progress</span>
            <div className="bar">
              <span style={{ width: `${team.progress}%` }} />
            </div>
          </div>
          <div>
            <span>Mahasiswa</span>
            <strong>{team.members.length} peserta</strong>
            <span>{team.members.join(', ')}</span>
          </div>
          <span className={`status-pill ${team.status}`}>{statusLabel(team.status)}</span>
        </article>
      ))}
    </div>
  )
}

function pageTitle(view: View) {
  const titles: Record<View, string> = {
    dashboard: 'Visual Monitoring',
    learning: 'Course Pelatihan',
    attendance: 'Attendance Center',
    weekly: 'Laporan Mingguan',
    outputs: 'Output UMKM',
    challenge: 'Challenge Scoring',
    reports: 'Pusat Laporan',
  }
  return titles[view]
}

export default MonitoringPage
