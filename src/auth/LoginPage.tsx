import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { getGoogleOAuthClientId, hasGoogleBackend, type GoogleCredentialResponse } from '@/lib/monitoring-config'
import { postAction } from '@/services/monitoring-api'
import '@/monitoring/MonitoringPage.css'

const GOOGLE_SCRIPT_ID = 'google-identity-services'

function loadGoogleIdentity(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('Google Identity tidak dapat dimuat.')), { once: true })
      return
    }
    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Google Identity tidak dapat dimuat.'))
    document.head.appendChild(script)
  })
}

function GoogleLoginButton({ onCredential, onError }: { onCredential: (credential: string) => Promise<void>; onError: (message: string) => void }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const clientId = getGoogleOAuthClientId()

  useEffect(() => {
    if (!clientId || !mountRef.current) return
    let cancelled = false
    loadGoogleIdentity()
      .then(() => {
        if (cancelled || !mountRef.current || !window.google) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: 'popup',
          callback: (response: GoogleCredentialResponse) => {
            if (!response.credential) {
              onError('Google tidak mengirim bukti identitas. Silakan coba lagi.')
              return
            }
            onCredential(response.credential).catch((error: unknown) => onError(error instanceof Error ? error.message : 'Login Google tidak berhasil.'))
          },
        })
        mountRef.current.replaceChildren()
        window.google.accounts.id.renderButton(mountRef.current, { theme: 'outline', size: 'large', text: 'continue_with', width: 300 })
        setReady(true)
      })
      .catch((error: unknown) => onError(error instanceof Error ? error.message : 'Google Identity tidak tersedia.'))
    return () => { cancelled = true }
  }, [clientId, onCredential, onError])

  if (!clientId) return <div className="login-message warning">Login Google belum diaktifkan. Admin perlu mengisi Google OAuth Client ID pada konfigurasi produksi.</div>
  return <div className="google-signin-wrap" aria-busy={!ready} ref={mountRef} />
}

export default function LoginPage() {
  const { profile, loginWithGoogleCredential } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [requestedRole, setRequestedRole] = useState('mahasiswa')
  const [institution, setInstitution] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const destination = (location.state as { from?: string } | null)?.from || '/monitoring'

  if (profile) return <Navigate to={destination} replace />

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    try {
      const result = await postAction('registerAccount', { email, name, requested_role: requestedRole, institution, whatsapp, note })
      setMessage(String(result.message || 'Registrasi diterima. Admin akan mengonfirmasi akun dan menetapkan role.'))
      setName('')
      setInstitution('')
      setWhatsapp('')
      setNote('')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registrasi belum dapat dikirim.')
    } finally {
      setBusy(false)
    }
  }

  async function handleCredential(credential: string) {
    setBusy(true)
    setMessage('')
    try {
      await loginWithGoogleCredential(credential)
      navigate(destination, { replace: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="monitoring-login" style={{ backgroundImage: 'linear-gradient(120deg, rgba(15, 118, 110, 0.91), rgba(30, 64, 175, 0.82)), url("./images/banner-opening.png")' }}>
      <section className="login-panel auth-login-card">
        <p className="eyebrow">Babel Youthpreneur 2026</p>
        <h1>Learning and Monitoring Platform</h1>
        <p>Gunakan akun Google Anda. Setelah pendaftaran disetujui dan role ditetapkan, akses akan diberikan sesuai tanggung jawab program.</p>

        <div className="login-check-card oauth-card">
          <div>
            <strong>Masuk dengan Google</strong>
            <span>Identitas Google diverifikasi oleh backend sebelum role dan data program dibuka.</span>
          </div>
          {hasGoogleBackend() ? <GoogleLoginButton onCredential={handleCredential} onError={setMessage} /> : <div className="login-message warning">Backend Google belum tersedia.</div>}
        </div>

        <form className="register-card" onSubmit={submitRegistration}>
          <div className="form-grid two">
            <label>Nama lengkap <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama sesuai akun Google" /></label>
            <label>Email Google <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@gmail.com" /></label>
            <label>Daftar sebagai <select value={requestedRole} onChange={(event) => setRequestedRole(event.target.value)}><option value="mahasiswa">Mahasiswa</option><option value="dosen">Dosen</option><option value="umkm">UMKM</option><option value="juri">Juri</option><option value="admin_panitia">Panitia</option></select></label>
            <label>Kampus/UMKM/Instansi <input value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder="Contoh: UBB / DND Cake" /></label>
            <label>WhatsApp <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="08..." /></label>
            <label>Catatan <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tim, UMKM, atau kebutuhan akses" /></label>
          </div>
          <button className="monitoring-button primary" disabled={busy}><ShieldCheck size={16} />{busy ? 'Memproses...' : 'Daftar Akun'}</button>
        </form>
        {message && <div className="login-message" role="status">{message}</div>}
        <Link className="monitoring-button auth-link-button" to="/">Kembali ke beranda</Link>
      </section>
    </main>
  )
}
