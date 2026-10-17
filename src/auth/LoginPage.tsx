import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { loadGoogleIdentity } from '@/auth/google-identity'
import { REGISTRATION_PROFILES } from '@/auth/registration-profiles'
import { getGoogleOAuthClientId, hasGoogleBackend, type GoogleCredentialResponse } from '@/lib/monitoring-config'
import '@/monitoring/MonitoringPage.css'

function GoogleLoginButton({ onCredential, onError, disabled }: { onCredential: (credential: string) => Promise<void>; onError: (message: string) => void; disabled: boolean }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
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
      .catch((error: unknown) => {
        if (cancelled) return
        setFailed(true)
        onError(error instanceof Error ? error.message : 'Google Identity tidak tersedia.')
      })
    return () => { cancelled = true }
  }, [clientId, onCredential, onError, attempt])

  if (!clientId) return <div className="login-message warning">Login Google belum diaktifkan. Admin perlu mengisi Google OAuth Client ID pada konfigurasi produksi.</div>
  return <div aria-busy={disabled || (!ready && !failed)}>
    <div className="google-signin-wrap" inert={disabled} ref={mountRef} />
    {!ready && !failed && <p role="status">Menyiapkan tombol Google...</p>}
    {failed && <button className="monitoring-button" onClick={() => { setFailed(false); setAttempt((value) => value + 1) }}>Coba muat ulang tombol Google</button>}
  </div>
}

export default function LoginPage() {
  const { profile, loginWithGoogleCredential } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const inFlight = useRef(false)
  const destination = (location.state as { from?: string } | null)?.from || '/monitoring'

  const handleCredential = useCallback(async (credential: string) => {
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setMessage('')
    try {
      await loginWithGoogleCredential(credential)
      navigate(destination, { replace: true })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login Google belum berhasil.')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }, [loginWithGoogleCredential, navigate, destination])

  if (profile) return <Navigate to={destination} replace />

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
          {hasGoogleBackend() ? <GoogleLoginButton onCredential={handleCredential} onError={setMessage} disabled={busy} /> : <div className="login-message warning">Layanan login belum tersedia. Hubungi panitia.</div>}
        </div>

        <section className="register-card" aria-labelledby="registration-title">
          <h3 id="registration-title">Pendaftaran Akun Baru</h3>
          <p className="muted">Pilih jenis pendaftaran agar data masuk ke antrean verifikasi admin.</p>
          <div className="registration-options">
            {Object.entries(REGISTRATION_PROFILES).map(([path, registration]) => (
              <Link className="monitoring-button registration-option" key={path} to={`/register/${path}`}>
                Daftar {registration.label}
              </Link>
            ))}
          </div>
          <small>Pendaftaran bukan persetujuan akses. Seluruh akun diverifikasi oleh admin terlebih dahulu.</small>
        </section>
        {busy && <div className="login-message" role="status">Memverifikasi akun Google...</div>}
        {message && <div className="login-message" role="status">{message}</div>}
        <Link className="monitoring-button auth-link-button" to="/">Kembali ke beranda</Link>
      </section>
    </main>
  )
}
