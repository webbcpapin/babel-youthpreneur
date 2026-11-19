import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Link } from 'react-router'
import { getPublicAction, postAction } from '@/services/monitoring-api'
import type { RegistrationProfile } from '@/auth/registration-profiles'
import '@/monitoring/MonitoringPage.css'

type RegistrationFormProps = {
  profile: RegistrationProfile
}

type AssignmentOption = { id: string; name: string; campusId?: string; umkmId?: string }
type RegistrationOptions = { campuses: AssignmentOption[]; umkms: AssignmentOption[]; teams: AssignmentOption[] }

export default function RegistrationForm({ profile }: RegistrationFormProps) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [institution, setInstitution] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [note, setNote] = useState('')
  const [assignmentId, setAssignmentId] = useState('')
  const [options, setOptions] = useState<RegistrationOptions>({ campuses: [], umkms: [], teams: [] })
  const [assignmentError, setAssignmentError] = useState('')
  const [hasConsent, setHasConsent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [succeeded, setSucceeded] = useState(false)
  const inFlight = useRef(false)
  const assignmentKind = profile.role === 'mahasiswa' ? 'team' : profile.role === 'umkm' ? 'umkm' : ['dosen', 'kampus_viewer'].includes(profile.role) ? 'campus' : ''
  const assignmentOptions = assignmentKind === 'team' ? options.teams : assignmentKind === 'umkm' ? options.umkms : options.campuses

  useEffect(() => {
    if (!assignmentKind) return
    let cancelled = false
    getPublicAction('getRegistrationOptions').then((response) => {
      if (cancelled) return
      setOptions({ campuses: response.campuses as AssignmentOption[] || [], umkms: response.umkms as AssignmentOption[] || [], teams: response.teams as AssignmentOption[] || [] })
      setAssignmentError('')
    }).catch((error: unknown) => {
      if (!cancelled) setAssignmentError(error instanceof Error ? error.message : 'Daftar penugasan belum dapat dimuat.')
    })
    return () => { cancelled = true }
  }, [assignmentKind])

  function chooseAssignment(id: string) {
    setAssignmentId(id)
    const selected = assignmentOptions.find((option) => option.id === id)
    const campus = assignmentKind === 'team' ? options.campuses.find((option) => option.id === selected?.campusId) : null
    setInstitution(campus?.name || selected?.name || '')
  }

  async function submitRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setMessage('')
    setSucceeded(false)

    try {
      const result = await postAction('registerAccount', {
        email,
        name,
        requested_role: profile.role,
        institution,
        whatsapp,
        note,
        requested_team_id: assignmentKind === 'team' ? assignmentId : '',
        requested_umkm_id: assignmentKind === 'umkm' ? assignmentId : '',
        requested_campus_id: assignmentKind === 'campus' ? assignmentId : '',
        data_consent: hasConsent,
      })
      setSucceeded(true)
      setMessage(String(result.message || 'Registrasi diterima. Admin akan mengonfirmasi akun.'))
      setName('')
      setEmail('')
      setInstitution('')
      setWhatsapp('')
      setNote('')
      setAssignmentId('')
      setHasConsent(false)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Registrasi belum dapat dikirim.')
    } finally {
      inFlight.current = false
      setBusy(false)
    }
  }

  return (
    <main className="monitoring-login" style={{ backgroundImage: 'linear-gradient(120deg, rgba(15, 118, 110, 0.91), rgba(30, 64, 175, 0.82)), url("./images/banner-opening.png")' }}>
      <section className="login-panel auth-login-card">
        <p className="eyebrow">Babel Youthpreneur 2026</p>
        <h1>{profile.title}</h1>
        <p>{profile.subtitle}</p>

        <form className="register-card" onSubmit={submitRegistration} aria-busy={busy}>
          <p className="registration-access-note">{profile.accessNote}</p>
          <fieldset className="registration-fields" disabled={busy}>
          <legend className="sr-only">Data pendaftaran {profile.label}</legend>
          <div className="form-grid two">
            <label>Nama lengkap<input required autoComplete="name" maxLength={120} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nama lengkap" /></label>
            <label>Email akun Google<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email yang dipakai untuk masuk dengan Google" /></label>
            <label>Daftar sebagai<input value={profile.label} disabled /></label>
            {assignmentKind && <label>{assignmentKind === 'team' ? 'Tim BYP 2026' : assignmentKind === 'umkm' ? 'UMKM BYP 2026' : 'Perguruan tinggi BYP 2026'}
              <select required value={assignmentId} onChange={(event) => chooseAssignment(event.target.value)}><option value="">Pilih {assignmentKind === 'team' ? 'tim' : assignmentKind === 'umkm' ? 'UMKM' : 'kampus'}</option>
                {assignmentOptions.map((option) => <option key={option.id} value={option.id}>{option.name}{assignmentKind === 'team' ? ` (${options.campuses.find((campus) => campus.id === option.campusId)?.name || ''})` : ''}</option>)}</select>
            </label>}
            <label>{profile.institutionLabel}<input required readOnly={!!assignmentKind} maxLength={160} value={institution} onChange={(event) => setInstitution(event.target.value)} placeholder={profile.institutionPlaceholder} /></label>
            <label>WhatsApp<input required type="tel" autoComplete="tel" maxLength={32} value={whatsapp} onChange={(event) => setWhatsapp(event.target.value)} placeholder="08..." /></label>
            <label>Catatan<input maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} placeholder={profile.notePlaceholder} /></label>
          </div>
          {assignmentError && <p className="form-message" role="status">{assignmentError}</p>}
          <label className="consent-row"><input required type="checkbox" checked={hasConsent} onChange={(event) => setHasConsent(event.target.checked)} />Saya menyetujui pemrosesan data ini untuk verifikasi dan pelaksanaan program Babel Youthpreneur.</label>
          </fieldset>
          <button className="monitoring-button primary" type="submit" disabled={busy}><ShieldCheck size={16} />{busy ? 'Mengirim...' : `Daftar ${profile.label}`}</button>
        </form>

        {message && <div className={`login-message${succeeded ? '' : ' warning'}`} role="status">{message}</div>}
        <div className="button-row"><Link className="monitoring-button auth-link-button" to="/login">Kembali ke Login</Link><Link className="monitoring-button auth-link-button" to="/">Ke Beranda</Link></div>
      </section>
    </main>
  )
}
