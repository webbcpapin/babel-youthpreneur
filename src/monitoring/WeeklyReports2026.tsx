import { useEffect, useMemo, useRef, useState } from 'react'
import { CheckCircle2, Download, ExternalLink } from 'lucide-react'
import { readStoredSession } from '@/auth/session-storage'
import { postAction } from '@/services/monitoring-api'
import { prepareSubmission, saveSubmission, type SubmissionAttempt } from './submission'
import { activationDate, finalDeadline, finalDeadlineLabel, jakartaTimestamp, reportIsOpen, reportingPeriods } from './monitoring-schedule'
import { WeeklyVisitEditor, type WeeklyVisit } from './WeeklyVisits2026'
import { encodeWeeklyPhoto } from './weekly-photo'

export type WeeklyItem = { id: string; status: 'todo' | 'doing' | 'done'; evidenceUrl: string; note: string; updatedAt?: string }
export type FinalOutputs = { marketing: string; catalog: string; business: string; contentLinks: string[] }
export type WeeklyReport = {
  id: string; teamId: string; week: number; status?: 'draft' | 'submitted' | 'revision' | 'verified'
  items?: WeeklyItem[]; finalOutputs?: FinalOutputs; umkmApprovalUrl?: string; umkmApproved?: boolean
  obstacles?: string; nextPlan?: string; reviewNote?: string; umkmNote?: string; updatedAt?: string
  submittedBy?: string; reviewedBy?: string; revision?: number; completion?: number
  activity?: string; progress?: string; validation?: 'pending' | 'validated' | 'revision' | 'draft'
}

type Team = { id: string; name: string; campus: string; umkm: string }
type Profile = { role: string; name: string }
type Props = {
  profile: Profile; teams: Team[]; reports: WeeklyReport[]; visits: WeeklyVisit[]
  onReport: (report: WeeklyReport) => void; onVisit: (visit: WeeklyVisit) => void
}
type Period = { week: number; dates: string; focus: string; tasks: Array<{ id: string; label: string }> }

const periods: Period[] = [
  { week: 1, dates: reportingPeriods[0].dates, focus: 'Diagnosis dan strategi', tasks: [
    { id: 'profile', label: 'Profil dan keunggulan produk UMKM teridentifikasi' },
    { id: 'swot', label: 'Permasalahan usaha dan SWOT awal tersusun' },
    { id: 'channel_audit', label: 'Audit Instagram, WhatsApp Business, dan marketplace' },
    { id: 'target', label: 'Produk unggulan dan target konsumen ditentukan' },
    { id: 'concept', label: 'Konsep konten, katalog, dan ide bisnis awal disusun' },
  ] },
  { week: 2, dates: reportingPeriods[1].dates, focus: 'Implementasi aset digital', tasks: [
    { id: 'channel_update', label: 'Profil atau kanal digital UMKM diperbaiki' },
    { id: 'photo_video', label: 'Foto dan video produk diproduksi' },
    { id: 'content', label: 'Konten promosi dipublikasikan atau dijadwalkan' },
    { id: 'catalog_draft', label: 'Draf katalog produk dibuat' },
    { id: 'idea_draft', label: 'Draf analisis ide bisnis disusun' },
    { id: 'ai_review', label: 'Saran AI diperiksa terhadap kondisi usaha' },
  ] },
  { week: 3, dates: reportingPeriods[2].dates, focus: 'Finalisasi dan serah terima', tasks: [
    { id: 'three_contents', label: 'Tiga konten promosi dipublikasikan' },
    { id: 'marketing_evaluation', label: 'Strategi pemasaran dan evaluasinya terdokumentasi' },
    { id: 'catalog_final', label: 'Katalog produk final diperiksa UMKM' },
    { id: 'idea_final', label: 'Analisis ide bisnis final selesai' },
    { id: 'ai_final', label: 'Hasil AI diperiksa dan diperbaiki tim' },
    { id: 'handover', label: 'Hasil pekerjaan diserahkan kepada UMKM' },
    { id: 'challenge_ready', label: 'Seluruh berkas challenge siap dikumpulkan' },
  ] },
]

const emptyOutputs = (): FinalOutputs => ({ marketing: '', catalog: '', business: '', contentLinks: ['', '', ''] })
const blankItems = (week: number): WeeklyItem[] => periods[week - 1].tasks.map(({ id }) => ({ id, status: 'todo', evidenceUrl: '', note: '' }))
const statusText: Record<string, string> = { missing: 'Belum mengirim', draft: 'Draft', submitted: 'Menunggu verifikasi', revision: 'Perlu revisi', verified: 'Terverifikasi' }
const safeUrl = (value?: string) => { try { const url = new URL(value || ''); return ['http:', 'https:'].includes(url.protocol) ? url.href : '' } catch { return '' } }
const hasEvidence = (item: WeeklyItem) => !!safeUrl(item.evidenceUrl) || (item.note ?? '').trim().length >= 12
export const stateOf = (report?: WeeklyReport) => report?.status || (report?.validation === 'validated' ? 'verified' : report?.validation === 'revision' ? 'revision' : report?.validation === 'draft' ? 'draft' : report ? 'submitted' : 'missing')
const itemCount = (report?: WeeklyReport) => report?.items?.filter((item) => item.status === 'done' && hasEvidence(item)).length || 0
export const weeklyCompletion = (report?: WeeklyReport, week?: number) => {
  const total = periods[(week || report?.week || 1) - 1]?.tasks.length || 1
  return Math.round(70 * itemCount(report) / total + (stateOf(report) === 'verified' ? 30 : 0))
}
const challengeReady = (report?: WeeklyReport) => {
  const output = report?.finalOutputs
  return !!output && [output.marketing, output.catalog, output.business, ...(output.contentLinks || [])].length === 6
    && [output.marketing, output.catalog, output.business, ...output.contentLinks].every((url) => !!safeUrl(url))
    && stateOf(report) === 'verified'
}

function downloadCsv(rows: Array<Record<string, string | number>>) {
  const headers = Object.keys(rows[0] || { status: '' })
  const quote = (value: string | number) => {
    const text = String(value)
    const literal = typeof value === 'string' && /^\s*[=+@-]/.test(text) ? "'" + text : text
    return `"${literal.replace(/"/g, '""')}"`
  }
  const csv = '\ufeff' + [headers.join(','), ...rows.map((row) => headers.map((key) => quote(row[key] || '')).join(','))].join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a'); link.href = url; link.download = 'laporan-mingguan-byp-2026.csv'; link.click(); URL.revokeObjectURL(url)
}

export default function WeeklyReports2026({ profile, teams, reports, visits, onReport, onVisit }: Props) {
  const [teamFilter, setTeamFilter] = useState('')
  const [campusFilter, setCampusFilter] = useState('')
  const [umkmFilter, setUmkmFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [week, setWeek] = useState(1)
  const [items, setItems] = useState<WeeklyItem[]>(blankItems(1))
  const [outputs, setOutputs] = useState<FinalOutputs>(emptyOutputs)
  const [obstacles, setObstacles] = useState('')
  const [nextPlan, setNextPlan] = useState('')
  const [approvalUrl, setApprovalUrl] = useState('')
  const [reviewNote, setReviewNote] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploadingItem, setUploadingItem] = useState('')
  const [uploadMessage, setUploadMessage] = useState('')
  const inFlight = useRef(false)
  const attempt = useRef<SubmissionAttempt | null>(null)
  const campusTeams = useMemo(
    () => teams.filter((team) => !campusFilter || team.campus === campusFilter),
    [teams, campusFilter],
  )
  const umkmOptions = [...new Set(campusTeams.map((team) => team.umkm).filter(Boolean))]
  const selectedUmkm = umkmOptions.includes(umkmFilter) ? umkmFilter : ''
  const filteredTeams = useMemo(() => campusTeams.filter((team) =>
    (!selectedUmkm || team.umkm === selectedUmkm)
    && (!statusFilter || periods.some((item) => stateOf(reports.find((row) => row.teamId === team.id && row.week === item.week)) === statusFilter))
  ), [campusTeams, reports, selectedUmkm, statusFilter])
  const chosenTeam = filteredTeams.find((team) => team.id === teamFilter) || filteredTeams[0]
  const report = reports.find((row) => row.teamId === chosenTeam?.id && row.week === week)
  const period = periods[week - 1]
  const isStudent = profile.role === 'mahasiswa'
  const reportOpen = reportIsOpen(week)
  const editable = isStudent && reportOpen && stateOf(report) !== 'verified'
  const plannedVisit = visits.find((visit) => visit.teamId === chosenTeam?.id && visit.week === week)

  function changeCampus(campus: string) {
    setCampusFilter(campus)
    if (campus && !teams.some((team) => team.campus === campus && team.umkm === selectedUmkm)) {
      setUmkmFilter('')
    }
  }

  useEffect(() => {
    setItems(period.tasks.map(({ id }) => report?.items?.find((item) => item.id === id) || { id, status: 'todo', evidenceUrl: '', note: '' }))
    setOutputs(report?.finalOutputs || emptyOutputs())
    setObstacles(report?.obstacles || '')
    setNextPlan(report?.nextPlan || '')
    setApprovalUrl(report?.umkmApprovalUrl || '')
    setReviewNote('')
    setUploadMessage('')
    attempt.current = null
  }, [chosenTeam?.id, week, period.tasks, report])

  const patchItem = (id: string, patch: Partial<WeeklyItem>) => setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item))
  async function uploadPhoto(id: string, file: File) {
    if (!chosenTeam || !editable || inFlight.current) return
    inFlight.current = true
    setBusy(true)
    setUploadingItem(id)
    setUploadMessage('')
    try {
      const session = readStoredSession()
      if (!session) throw new Error('Sesi login berakhir. Silakan masuk kembali.')
      const photo = await encodeWeeklyPhoto(file)
      const response = await postAction('uploadWeeklyPhoto', {
        session_token: session.token, team_id: chosenTeam.id, week, item_id: id, photo_base64: photo,
      })
      const url = safeUrl(typeof response.url === 'string' ? response.url : '')
      if (!url) throw new Error('Penyimpanan foto belum dikonfirmasi.')
      patchItem(id, { evidenceUrl: url })
      setUploadMessage('Foto tersimpan. Simpan draft atau kirim laporan untuk mencatat tautan pada checklist.')
    } catch (error) {
      setUploadMessage(error instanceof Error ? error.message : 'Foto belum tersimpan. Coba lagi atau masukkan tautan bukti.')
    } finally {
      inFlight.current = false
      setBusy(false)
      setUploadingItem('')
    }
  }

  async function save(mode: 'draft' | 'submit') {
    if (inFlight.current || !chosenTeam || !editable) return
    if (mode === 'submit' && !items.some(hasEvidence)) { setMessage('Tambahkan setidaknya satu foto, tautan, atau catatan bukti.'); return }
    if (items.some((item) => item.status === 'done' && !hasEvidence(item))) { setMessage('Item selesai memerlukan foto, tautan, atau catatan relevan minimal 12 karakter.'); return }
    const payload = { team_id: chosenTeam.id, week, mode, items_json: JSON.stringify(items), final_outputs_json: JSON.stringify(outputs),
      obstacles: obstacles.trim(), next_plan: nextPlan.trim(), umkm_approval_url: approvalUrl.trim() }
    attempt.current = prepareSubmission(payload, attempt.current)
    inFlight.current = true; setBusy(true); setMessage('')
    try {
      const row = await saveSubmission('submitWeeklyReport', payload, attempt.current.id)
      onReport(row as unknown as WeeklyReport)
      attempt.current = null
      setMessage(mode === 'draft' ? 'Draft tersimpan.' : 'Laporan berhasil dikirim untuk review.')
    } catch (error) { setMessage(`${error instanceof Error ? error.message : 'Penyimpanan gagal.'} Isian tetap tersedia.`) }
    finally { inFlight.current = false; setBusy(false) }
  }

  async function review(decision: 'revision' | 'verified' | 'umkm_approve' | 'umkm_revision') {
    if (!report || inFlight.current) return
    inFlight.current = true; setBusy(true); setMessage('')
    try {
      const session = readStoredSession()
      if (!session) throw new Error('Sesi login berakhir.')
      const response = await postAction('reviewWeeklyReport', { session_token: session.token, report_id: report.id, decision, note: reviewNote.trim(), request_id: crypto.randomUUID() })
      const row = response.row as WeeklyReport | undefined
      if (!row?.id || row.id !== report.id) throw new Error('Konfirmasi review tidak lengkap.')
      onReport(row); setReviewNote(''); setMessage('Keputusan review tersimpan.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Review gagal.') }
    finally { inFlight.current = false; setBusy(false) }
  }

  const exportRows = filteredTeams.flatMap((team) => periods.map((item) => {
    const row = reports.find((entry) => entry.teamId === team.id && entry.week === item.week)
    const final = row?.finalOutputs
    const visit = visits.find((entry) => entry.teamId === team.id && entry.week === item.week)
    return { tim: team.name, kampus: team.campus, umkm: team.umkm, minggu: item.week,
      periode: item.dates, tenggat_final_wib: finalDeadlineLabel, rencana_kunjungan_wib: visit?.plannedVisitAt.replace('T', ' ') || '', status: statusText[stateOf(row)],
      checklist_berbukti: `${itemCount(row)}/${item.tasks.length}`, progres_persen: weeklyCompletion(row, item.week),
      bukti: (row?.items || []).map((entry) => safeUrl(entry.evidenceUrl)).filter(Boolean).join(' | '),
      catatan_checklist: (row?.items || []).map((entry) => entry.note?.trim()).filter(Boolean).join(' | '),
      strategi_marketing: final?.marketing || '', katalog: final?.catalog || '', ide_bisnis: final?.business || '',
      konten_publikasi: (final?.contentLinks || []).join(' | '), siap_challenge: challengeReady(row) ? 'Ya' : 'Belum',
      kendala: row?.obstacles || '', tindak_lanjut: row?.nextPlan || '', catatan_review: row?.reviewNote || '' }
  }))

  return <div className="content-grid weekly-workspace">
    <section className="panel">
      <div className="panel-title"><div><h3>Laporan Pendampingan 2026</h3><p className="muted">Batas final {finalDeadlineLabel}</p></div>
        {['admin', 'dosen'].includes(profile.role) && <button className="monitoring-button" onClick={() => downloadCsv(exportRows)}><Download size={16} /> CSV</button>}
      </div>
      {['admin', 'dosen'].includes(profile.role) && <div className="weekly-filters">
        <label>Kampus<select value={campusFilter} onChange={(event) => changeCampus(event.target.value)}><option value="">Semua</option>{[...new Set(teams.map((team) => team.campus))].map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>UMKM<select value={selectedUmkm} onChange={(event) => setUmkmFilter(event.target.value)}><option value="">{campusFilter ? 'Semua UMKM kampus ini' : 'Semua'}</option>{umkmOptions.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Semua</option>{Object.entries(statusText).map(([key, value]) => <option value={key} key={key}>{value}</option>)}</select></label>
      </div>}
      {['admin', 'dosen'].includes(profile.role) && <div className="weekly-matrix" role="table" aria-label="Matriks laporan mingguan">
        <div className="weekly-matrix-row weekly-matrix-head" role="row"><span>Tim / UMKM</span>{periods.map((item) => <span key={item.week}>Minggu {item.week}</span>)}</div>
        {filteredTeams.map((team) => <div className="weekly-matrix-row" role="row" key={team.id}><strong>{team.name}<small>{team.umkm} · {team.campus}</small></strong>{periods.map((item) => { const row = reports.find((entry) => entry.teamId === team.id && entry.week === item.week); return <button key={item.week} className={`weekly-status ${stateOf(row)}`} onClick={() => { setTeamFilter(team.id); setWeek(item.week) }}>{statusText[stateOf(row)]}<small>{weeklyCompletion(row, item.week)}%</small></button> })}</div>)}
      </div>}
      {isStudent && <p className="muted">{activationDate}: aktivasi akun dan cek tim serta UMKM. Satu tim mengisi satu laporan per minggu.</p>}
      {teams.length === 0 && <p className="empty-state">Belum ada tim yang dapat diakses.</p>}
      {teams.length > 0 && filteredTeams.length === 0 && <p className="empty-state">Tidak ada laporan yang cocok dengan filter.</p>}
    </section>
    {chosenTeam && <><section className="panel"><div className="panel-title"><div><h3>{chosenTeam.name}</h3><p className="muted">{chosenTeam.campus} · {chosenTeam.umkm}</p></div><strong>{Math.round(periods.reduce((sum, item) => sum + weeklyCompletion(reports.find((row) => row.teamId === chosenTeam.id && row.week === item.week), item.week), 0) / 3)}%</strong></div>
      <p className="muted">Progres tiap minggu = 70% checklist selesai dengan bukti + 30% setelah verifikasi panitia. Progres keseluruhan = rata-rata tiga minggu.</p>
      <div className="weekly-periods">{periods.map((item) => { const row = reports.find((entry) => entry.teamId === chosenTeam.id && entry.week === item.week); return <button className={week === item.week ? 'weekly-period active' : 'weekly-period'} key={item.week} disabled={busy} onClick={() => setWeek(item.week)}><strong>Minggu {item.week}</strong><span>{item.dates}</span><small>{statusText[stateOf(row)]} · {weeklyCompletion(row, item.week)}%</small></button> })}</div>
      <div className="weekly-period-heading"><h3>Minggu {week}: {period.focus}</h3><span className={`status-pill ${stateOf(report)}`}>{statusText[stateOf(report)]}</span></div>
      {report?.reviewNote && <p className="weekly-note">Catatan review: {report.reviewNote}</p>}
      {report?.umkmNote && <p className="weekly-note">Catatan UMKM: {report.umkmNote}</p>}
      {isStudent && <WeeklyVisitEditor key={`${chosenTeam.id}:${week}`} teamId={chosenTeam.id} week={week} visit={plannedVisit} onSave={onVisit} />}
      {!isStudent && plannedVisit?.plannedVisitAt && <p>Rencana kunjungan: {jakartaTimestamp(plannedVisit.plannedVisitAt + ':00+07:00')} WIB</p>}
      {isStudent && !reportOpen && <p className="weekly-note">Checklist dibuka pada periode {period.dates}.</p>}
      {isStudent && week === 1 && <p className="muted">Pekerjaan sejak pelatihan 18 November 2026 dapat dimasukkan ke laporan Minggu 1.</p>}
      {isStudent && <p className="muted">Gunakan foto, tangkapan layar, atau tautan hasil kerja. Tautan yang sama boleh dipakai jika relevan. Bila hanya memakai catatan bukti, tulis minimal 12 karakter.</p>}
      <div className="weekly-task-list">
        {period.tasks.map((task) => {
          const item = items.find((entry) => entry.id === task.id) || { id: task.id, status: 'todo' as const, evidenceUrl: '', note: '' }
          return (
            <div className="weekly-task" key={task.id}>
              <div className="weekly-task-title"><CheckCircle2 size={18} /><strong>{task.label}</strong></div>
              <label>Status<select value={item.status} disabled={!editable || busy} onChange={(event) => patchItem(item.id, { status: event.target.value as WeeklyItem['status'] })}><option value="todo">Belum Dikerjakan</option><option value="doing">Proses</option><option value="done">Selesai</option></select></label>
              <label>Tautan bukti<input type="url" value={item.evidenceUrl} disabled={!editable || busy} onChange={(event) => patchItem(item.id, { evidenceUrl: event.target.value })} placeholder="https://..." /></label>
              <label>Catatan singkat (opsional)<input value={item.note} maxLength={500} disabled={!editable || busy} onChange={(event) => patchItem(item.id, { note: event.target.value })} /></label>
              <div className="weekly-task-foot">
                {editable && Date.now() < finalDeadline && <label className="weekly-photo-input">{uploadingItem === item.id ? 'Mengunggah foto...' : 'Unggah foto bukti'}
                  <input type="file" accept="image/*" disabled={busy} onChange={(event) => {
                    const file = event.currentTarget.files?.[0]
                    event.currentTarget.value = ''
                    if (file) void uploadPhoto(item.id, file)
                  }} />
                </label>}
                {safeUrl(item.evidenceUrl) && <a href={safeUrl(item.evidenceUrl)} target="_blank" rel="noopener noreferrer">Lihat bukti <ExternalLink size={13} /></a>}
                {item.updatedAt && <small>Diperbarui {jakartaTimestamp(item.updatedAt)} WIB</small>}
              </div>
            </div>
          )
        })}
      </div>
      {uploadMessage && <p className="form-message" role="status">{uploadMessage}</p>}
      <div className="weekly-text-fields"><label>Kendala utama<textarea value={obstacles} maxLength={1000} disabled={!editable || busy} onChange={(event) => setObstacles(event.target.value)} /></label><label>Rencana tindak lanjut<textarea value={nextPlan} maxLength={1000} disabled={!editable || busy} onChange={(event) => setNextPlan(event.target.value)} /></label></div>
      {week === 3 && <div className="weekly-final"><h3>Berkas akhir challenge</h3><p className="muted">Tautan berikut otomatis masuk ke menu Output setelah tersimpan. PDF dan persetujuan UMKM diperiksa panitia.</p>{([['marketing', 'Digital Marketing Strategy PDF (minimal 3 halaman)'], ['catalog', 'Best Catalog Product PDF (3-10 halaman)'], ['business', 'Best Innovative Business Idea PDF (3-5 halaman)']] as const).map(([key, label]) => <label key={key}>{label}<input type="url" value={outputs[key]} disabled={!editable || busy} onChange={(event) => setOutputs((current) => ({ ...current, [key]: event.target.value }))} placeholder="https://drive.google.com/..." /></label>)}{[0, 1, 2].map((index) => <label key={index}>Konten publikasi {index + 1}<input type="url" value={outputs.contentLinks[index] || ''} disabled={!editable || busy} onChange={(event) => setOutputs((current) => ({ ...current, contentLinks: current.contentLinks.map((url, position) => position === index ? event.target.value : url) }))} placeholder="https://instagram.com/..." /></label>)}<label>Bukti persetujuan / serah terima UMKM<input type="url" value={approvalUrl} disabled={!editable || busy} onChange={(event) => setApprovalUrl(event.target.value)} placeholder="https://drive.google.com/..." /></label><p className="muted">Kesiapan challenge: {challengeReady(report) ? 'Siap dan terverifikasi' : 'Belum lengkap atau belum terverifikasi'}</p></div>}
      {editable && <div className="weekly-actions"><button className="monitoring-button" disabled={busy} onClick={() => { void save('draft') }}>Simpan draft</button><button className="monitoring-button primary" disabled={busy || Date.now() >= finalDeadline} onClick={() => { void save('submit') }}>Kirim laporan</button></div>}
      {stateOf(report) === 'submitted' && ['admin', 'dosen', 'umkm'].includes(profile.role) && <div className="weekly-review"><label>Catatan review<textarea maxLength={1000} value={reviewNote} disabled={busy} onChange={(event) => setReviewNote(event.target.value)} /></label><div className="weekly-actions">{['admin', 'dosen'].includes(profile.role) && <button className="monitoring-button" disabled={busy || !reviewNote.trim()} onClick={() => { void review('revision') }}>Minta revisi</button>}{profile.role === 'admin' && <button className="monitoring-button primary" disabled={busy} onClick={() => { void review('verified') }}>Verifikasi</button>}{profile.role === 'umkm' && <><button className="monitoring-button" disabled={busy || !reviewNote.trim()} onClick={() => { void review('umkm_revision') }}>Minta perbaikan</button><button className="monitoring-button primary" disabled={busy} onClick={() => { void review('umkm_approve') }}>Setujui hasil</button></>}</div></div>}
      {message && <p className="form-message" role="status">{message}</p>}
    </section>
    <section className="panel"><div className="panel-title"><h3>Perubahan Nyata bagi UMKM</h3></div><div className="report-list">{reports.filter((row) => row.teamId === chosenTeam.id && stateOf(row) === 'verified').flatMap((row) => row.items?.filter((item) => item.status === 'done' && safeUrl(item.evidenceUrl)).map((item) => ({ ...item, week: row.week })) || []).map((item) => <div className="weekly-impact" key={`${item.week}-${item.id}`}><span>Minggu {item.week}</span><strong>{periods[item.week - 1].tasks.find((task) => task.id === item.id)?.label}</strong><a href={safeUrl(item.evidenceUrl)} target="_blank" rel="noopener noreferrer">Lihat bukti <ExternalLink size={13} /></a></div>)}{!reports.some((row) => row.teamId === chosenTeam.id && stateOf(row) === 'verified') && <p className="muted">Belum ada bukti terverifikasi. Perubahan akan muncul setelah panitia memeriksa laporan.</p>}</div></section></>}
  </div>
}
