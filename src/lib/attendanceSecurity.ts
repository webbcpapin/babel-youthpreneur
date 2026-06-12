import { supabase, supabaseConfigured } from './supabase';

export interface AttendanceTokenRequest {
  sessionId: string;
  locationName?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  radiusMeters?: number | null;
  ttlSeconds?: number;
}

export interface AttendanceTokenResponse {
  token: string;
  attendanceSessionId: string;
  sessionId: string;
  issuedAt: string;
  expiresAt: string;
  ttlSeconds: number;
}

export interface SecureAttendanceRequest {
  token: string;
  latitude: number;
  longitude: number;
  photoDataUrl: string;
  scannedAt: string;
  deviceFingerprint: string;
}

export interface SecureAttendanceResponse {
  status: string;
  attendanceId?: string;
  distanceMeters?: number;
  radiusMeters?: number;
  photoPath?: string;
  message?: string;
}

function assertSupabase() {
  if (!supabaseConfigured || !supabase) {
    throw new Error('Supabase belum dikonfigurasi.');
  }
  return supabase;
}

function functionError(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'error' in data) {
    return String((data as { error?: unknown }).error ?? fallback);
  }
  return null;
}

export async function requestAttendanceToken(payload: AttendanceTokenRequest): Promise<AttendanceTokenResponse> {
  const client = assertSupabase();
  const { data, error } = await client.functions.invoke('attendance-token', { body: payload });
  if (error) throw error;
  const remoteError = functionError(data, 'Gagal membuat QR presensi.');
  if (remoteError) throw new Error(remoteError);
  return data as AttendanceTokenResponse;
}

export async function submitSecureAttendance(payload: SecureAttendanceRequest): Promise<SecureAttendanceResponse> {
  const client = assertSupabase();
  const { data, error } = await client.functions.invoke('submit-attendance', { body: payload });
  if (error) throw error;
  const remoteError = functionError(data, 'Gagal mengirim presensi.');
  if (remoteError) throw new Error(remoteError);
  return data as SecureAttendanceResponse;
}

export async function getDeviceFingerprint() {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|');

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
