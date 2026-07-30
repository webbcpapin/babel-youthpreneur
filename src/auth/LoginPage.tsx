import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { LogIn } from 'lucide-react'
import { useAuth } from '@/auth/useAuth'
import { getGoogleOAuthClientId, hasGoogleBackend, type GoogleCredentialResponse } from '@/lib/monitoring-config'
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
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const destination = (location.state as { from?: string } | null)?.from || '/monitoring'

  if (profile) return <Navigate to={destination} replace />

  async function handleCredential(credential: string) {
    setBusy(true)
    setMessage('')
    try {
      await loginWithGoogleCredential(credential)
      navigate(destination, { replace: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login Google belum berhasil.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="monitoring-login" style={{ backgroundImage: 'linear-gradient(120deg, rgba(15, 118, 110, 0.91), rgba(30, 64, 175, 0.82)), url("./images/banner-opening.png")' }}>
      <section className="login-panel auth-login-card">
        <p className="eyebrow">Babel Youthpreneur 2026</p>
        <h1>Masuk Monitoring System</h1>
        <p>Gunakan akun Google terverifikasi. Jika belum punya akses, pilih pendaftaran sesuai profil Anda.</p>

        <div className="login-check-card oauth-card">
          <div>
            <strong>Masuk dengan Google</strong>
            <span>Identitas Google diverifikasi oleh backend sebelum role dan data program dibuka.</span>
          </div>
          {hasGoogleBackend() ? <GoogleLoginButton onCredential={handleCredential} onError={setMessage} /> : <div className="login-message warning">Backend Google belum tersedia.</div>}
        </div>

        <section className="register-card" aria-labelledby="registration-title">
          <h3 id="registration-title">Pendaftaran Akun Baru</h3>
          <p className="muted">Pilih jenis pendaftaran agar data masuk ke antrean verifikasi admin.</p>
          <div className="button-row">
            <Link className="monitoring-button primary" to="/register/mahasiswa">
              <LogIn size={16} /> Daftar Mahasiswa
            </Link>
            <Link className="monitoring-button" to="/register/umkm">
              Daftar UMKM
            </Link>
          </div>
        </section>
        {busy && <div className="login-message" role="status">Memverifikasi akun Google...</div>}
        {message && <div className="login-message" role="status">{message}</div>}
        <Link className="monitoring-button auth-link-button" to="/">Kembali ke beranda</Link>
      </section>
    </main>
  )
}
