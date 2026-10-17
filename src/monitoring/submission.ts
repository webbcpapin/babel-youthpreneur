import { readStoredSession } from '@/auth/session-storage'
import { postAction, type ApiPayload } from '@/services/monitoring-api'

export type SubmissionAttempt = { fingerprint: string; id: string }
export type SubmissionReceipt = { id: string; team_id: string; [key: string]: unknown }

export function prepareSubmission(payload: ApiPayload, previous: SubmissionAttempt | null): SubmissionAttempt {
  const fingerprint = JSON.stringify(payload)
  return previous?.fingerprint === fingerprint ? previous : { fingerprint, id: crypto.randomUUID() }
}

export async function saveSubmission(action: 'submitWeeklyReport' | 'submitOutput', payload: ApiPayload, requestId: string): Promise<SubmissionReceipt> {
  const session = readStoredSession()
  if (!session) throw new Error('Sesi login sudah berakhir. Silakan masuk kembali.')
  const response = await postAction(action, { ...payload, request_id: requestId, session_token: session.token })
  const row = response.row as SubmissionReceipt | undefined
  if (!row || typeof row.id !== 'string' || !row.id || row.team_id !== payload.team_id) {
    throw new Error('Konfirmasi penyimpanan belum lengkap. Isian tetap tersedia; coba kirim lagi dengan data yang sama.')
  }
  return row
}
