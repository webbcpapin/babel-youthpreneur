import { getAppsScriptUrl, hasGoogleBackend } from '@/lib/monitoring-config'

export type ApiPayload = Record<string, string | number | boolean | undefined>

export type ApiResponse = {
  ok: boolean
  error?: string
  message?: string
  [key: string]: unknown
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

async function parseResponse(response: Response): Promise<ApiResponse> {
  if (!response.ok) throw new Error(`Backend Google mengembalikan status ${response.status}.`)
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    throw new Error('Backend Google belum memakai versi API terbaru. Deploy ulang Apps Script terlebih dahulu.')
  }

  const body = await response.json() as ApiResponse
  if (!body.ok) throw new Error(body.error || 'Permintaan tidak dapat diproses.')
  return body
}

export async function getPublicAction(action: string, payload: ApiPayload = {}): Promise<ApiResponse> {
  const url = new URL(apiUrl(action))
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
  })
  return parseResponse(await fetch(url.toString()))
}

export async function postAction(action: string, payload: ApiPayload = {}): Promise<ApiResponse> {
  const response = await fetch(apiUrl(action), {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  })
  return parseResponse(response)
}
