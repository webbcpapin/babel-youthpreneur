import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { readStoredSession } from '@/auth/session-storage'
import { postAction } from '@/services/monitoring-api'
import { jakartaDate, jakartaTimestamp } from './monitoring-schedule'

export type WeeklyVisit = { teamId: string; week: number; plannedVisitAt: string; updatedAt: string }
type Team = { id: string; name: string; campus: string; umkm: string }

export function WeeklyVisitEditor({ teamId, week, visit, onSave }: {
  teamId: string; week: number; visit?: WeeklyVisit; onSave: (visit: WeeklyVisit) => void
}) {
  const saved = visit?.plannedVisitAt ?? ''
  const [draft, setDraft] = useState(saved)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  async function save() {
    if (busy || draft === saved) return
    setBusy(true)
    setMessage('')
    try {
      const session = readStoredSession()
      if (!session) throw new Error('Sesi login berakhir. Silakan masuk kembali.')
      const response = await postAction('saveWeeklyVisit', {
        session_token: session.token, team_id: teamId, week, planned_visit_at: draft,
      })
      const confirmed = response.visit as WeeklyVisit | undefined
      if (confirmed?.teamId !== teamId || confirmed.week !== week || confirmed.plannedVisitAt !== draft || !confirmed.updatedAt) {
        throw new Error('Penyimpanan jadwal belum dikonfirmasi.')
      }
      onSave(confirmed)
      setMessage(draft ? 'Jadwal kunjungan tersimpan.' : 'Jadwal kunjungan dikosongkan.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Jadwal belum tersimpan.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="weekly-visit-editor">
      <h3>Rencana Kunjungan ke UMKM</h3>
      <p className="muted">Silakan isi rencana tanggal dan jam kunjungan setelah berkoordinasi dengan UMKM. Informasi ini digunakan panitia untuk mengatur kehadiran, monitoring, dan dokumentasi kegiatan.</p>
      <div className="weekly-visit-controls">
        <label>
          Tanggal dan jam kunjungan (WIB)
          <input type="datetime-local" min="2026-01-01T00:00" max="2026-12-31T23:59" value={draft} disabled={busy} onChange={(event) => setDraft(event.target.value)} />
        </label>
        <button type="button" className="monitoring-button primary" disabled={busy || draft === saved} onClick={() => { void save() }}>
          <CalendarClock size={16} /> {busy ? 'Menyimpan...' : 'Simpan Jadwal'}
        </button>
      </div>
      {message && <p className="form-message" role="status">{message}</p>}
    </section>
  )
}

export function WeeklyVisitSchedule({ teams, visits }: { teams: Team[]; visits: WeeklyVisit[] }) {
  const teamById = new Map(teams.map((team) => [team.id, team]))
  const today = jakartaDate()
  const rows = visits.filter((visit) => visit.plannedVisitAt && teamById.has(visit.teamId))
    .sort((a, b) => a.plannedVisitAt.localeCompare(b.plannedVisitAt))
  const next = rows.find((visit) => Date.parse(visit.plannedVisitAt + ':00+07:00') >= Date.now())
  const scheduledTeamIds = new Set(rows.map((visit) => visit.teamId))
  const pending = teams.filter((team) => !scheduledTeamIds.has(team.id))
  const todayCount = rows.filter((visit) => visit.plannedVisitAt.startsWith(today)).length
  const lastChange = visits.filter((visit) => teamById.has(visit.teamId) && Number.isFinite(Date.parse(visit.updatedAt)))
    .reduce<WeeklyVisit | undefined>((latest, visit) => !latest || Date.parse(visit.updatedAt) > Date.parse(latest.updatedAt) ? visit : latest, undefined)

  return (
    <section className="panel">
      <div className="panel-title"><h3>Jadwal Kunjungan UMKM</h3></div>
      <div className="weekly-visit-summary">
        <span><strong>{todayCount}</strong> kunjungan hari ini</span>
        <span><strong>{scheduledTeamIds.size}/{teams.length}</strong> tim sudah mengisi</span>
        <span><strong>{pending.length}</strong> tim belum mengisi</span>
      </div>
      {next && <p><strong>Kunjungan berikutnya:</strong> {jakartaTimestamp(next.plannedVisitAt + ':00+07:00')} WIB · {teamById.get(next.teamId)?.name}</p>}
      {lastChange && <p className="muted">Perubahan terakhir: {jakartaTimestamp(lastChange.updatedAt)} WIB · {teamById.get(lastChange.teamId)?.name}{!lastChange.plannedVisitAt && ' (jadwal dikosongkan)'}</p>}
      {rows.length === 0 ? <p className="empty-state">Belum ada jadwal kunjungan.</p> : (
        <div className="weekly-visit-table">
          <table>
            <thead><tr><th>Tanggal</th><th>Jam WIB</th><th>Nama Tim</th><th>Universitas</th><th>UMKM</th><th>Terakhir Diubah</th></tr></thead>
            <tbody>{rows.map((visit) => {
              const team = teamById.get(visit.teamId)
              const date = new Date(visit.plannedVisitAt + ':00+07:00')
              return (
                <tr key={`${visit.teamId}:${visit.week}`}>
                  <td>{date.toLocaleDateString('id-ID', { dateStyle: 'medium', timeZone: 'Asia/Jakarta' })}{visit.plannedVisitAt.startsWith(today) && <strong> · Hari ini</strong>}</td>
                  <td>{visit.plannedVisitAt.slice(11)}</td>
                  <td>{team?.name}<small>Minggu {visit.week}</small></td>
                  <td>{team?.campus}</td><td>{team?.umkm}</td>
                  <td>{Number.isFinite(Date.parse(visit.updatedAt)) ? jakartaTimestamp(visit.updatedAt) : '-'}</td>
                </tr>
              )
            })}</tbody>
          </table>
        </div>
      )}
      {pending.length > 0 && <details className="weekly-visit-pending"><summary>Tim yang belum mengisi jadwal ({pending.length})</summary><ul>{pending.map((team) => <li key={team.id}>{team.name} · {team.campus}</li>)}</ul></details>}
    </section>
  )
}
