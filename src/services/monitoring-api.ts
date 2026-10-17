import { getAppsScriptUrl, hasGoogleBackend } from '@/lib/monitoring-config'

export type ApiPayload = Record<string, string | number | boolean | undefined>

export type ApiResponse = {
  ok: boolean
  error?: string
  code?: string
  message?: string
  [key: string]: unknown
}

export const SESSION_INVALID_EVENT = 'byp:session-invalid'

export class ApiError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

function apiUrl(action: string): string {
  const baseUrl = getAppsScriptUrl()
  if (!hasGoogleBackend() || !baseUrl) {
    throw new Error('Backend Google belum dikonfigurasi.')
  }

  const url = new URL(baseUrl)
  url.searchParams.set('action', action)
  return url.toString()
}

async function parseResponse(response: Response, sessionToken?: string): Promise<ApiResponse> {
  if (!response.ok) throw new Error(`Backend Google mengembalikan status ${response.status}.`)
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error('Backend Google belum memakai versi API terbaru. Deploy ulang Apps Script terlebih dahulu.')
  }

  const body = await response.json() as ApiResponse
  if (!body.ok) {
    if (['SESSION_REQUIRED', 'SESSION_EXPIRED', 'ACCOUNT_DISABLED'].includes(body.code ?? '')) {
      window.dispatchEvent(new CustomEvent(SESSION_INVALID_EVENT, { detail: sessionToken }))
    }
    throw new ApiError(body.error || 'Permintaan tidak dapat diproses.', body.code)
  }
  return body
}

async function request(url: string, options?: RequestInit, sessionToken?: string): Promise<ApiResponse> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 30_000)
  try {
    return await parseResponse(await fetch(url, { ...options, signal: controller.signal }), sessionToken)
  } catch (error) {
    if (controller.signal.aborted) {
      throw new ApiError('Koneksi terlalu lama. Status pengiriman belum dapat dipastikan. Coba lagi saat koneksi pulih.', 'TIMEOUT')
    }
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function getPublicAction(action: string, payload: ApiPayload = {}): Promise<ApiResponse> {
  const url = new URL(apiUrl(action))
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })
  return request(url.toString())
}

export async function postAction(action: string, payload: ApiPayload = {}): Promise<ApiResponse> {
  return request(apiUrl(action), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  }, typeof payload.session_token === 'string' ? payload.session_token : undefined)
}
