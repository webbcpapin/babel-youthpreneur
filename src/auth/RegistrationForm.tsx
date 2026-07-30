import { useState, type FormEvent } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { postAction } from '@/services/monitoring-api'

type RegistrationRole = 'mahasiswa' | 'umkm'

type RegistrationFormProps = {
  role: RegistrationRole
  title: string
  subtitle: string
}

const roleLabel: Record<RegistrationRole, string> = {
  mahasiswa: 'Mahasiswa',
  umkm: 'UMKM',
}

export default function RegistrationForm({ role, title, subtitle }: RegistrationFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [note, setNote] = useState('')
  const [hasConsent, setHasConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setMessage('')

    try {
      const result = await postAction('registerAccount', {
        email,
        name,
        requested_role: role,
        institution,
        whatsapp,
        note,
        data_consent: hasConsent,
      })
      setMessage(String(result.message || 'Registrasi diterima. Admin akan mengonfirmasi akun.'))
      setName('')
      setEmail('')
      setInstitution('')
      setWhatsapp('')
      setNote('')
      setHasConsent(false)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registrasi belum dapat dikirim.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="monitoring-login" style={{ backgroundImage: 'linear-gradient(120deg, rgba(15, 118, 110, 0.91), rgba(30, 64, 175, 0.82)), url("./images/banner-opening.png")' }}>
      <section className="login-panel auth-login-card">
        <p className="eyebrow">Babel Youthpreneur 2026</p>
        <h1>{title}</h1>
        <p>{subtitle}</p>

        <form className="register-card" onSubmit={submitRegistration}>
          <div className="form-grid two">
            <label>Nama lengkap<input required maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama lengkap" /></label>
            <label>Email Google<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@gmail.com" /></label>
            <label>Daftar sebagai<input value={roleLabel[role]} disabled /></label>
            <label>{role === 'mahasiswa' ? 'Kampus' : 'Nama UMKM'}<input required maxLength={160} value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder={role === 'mahasiswa' ? 'Contoh: UBB' : 'Contoh: DND Cake'} /></label>
            <label>WhatsApp<input required maxLength={32} inputMode="tel" value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="08..." /></label>
            <label>Catatan<input maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tim, kebutuhan pendampingan, atau informasi relevan" /></label>
          </div>
          <label className="consent-row"><input required type="checkbox" checked={hasConsent} onChange={(event) => setHasConsent(event.target.checked)} />Saya menyetujui pemrosesan data ini untuk verifikasi dan pelaksanaan program Babel Youthpreneur.</label>
          <button className="monitoring-button primary" disabled={busy}><ShieldCheck size={16} />{busy ? 'Mengirim...' : `Daftar ${roleLabel[role]}`}</button>
        </form>

        {message && <div className="login-message" role="status">{message}</div>}
        <div className="button-row"><Link className="monitoring-button auth-link-button" to="/login">Kembali ke Login</Link><Link className="monitoring-button auth-link-button" to="/">Ke Beranda</Link></div>
      </section>
    </main>
  )
}
