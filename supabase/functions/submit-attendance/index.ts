import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type TokenPayload = {
  attendance_session_id: string;
  session_id: string;
  nonce: string;
  issued_at: string;
  expires_at: string;
};

type AttendanceStatus = 'valid' | 'pending_review' | 'flagged_location' | 'expired_qr' | 'duplicate_attempt' | 'rejected';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function base64Url(bytes: Uint8Array) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function base64UrlDecode(value: string) {
  const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function hmacSha256(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return base64Url(new Uint8Array(signature));
}

async function sha256Hex(value: string | Uint8Array) {
  const input = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest('SHA-256', input);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqual(left: string, right: string) {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let result = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    result |= leftBytes[index] ^ rightBytes[index];
  }
  return result === 0;
}

function parsePhotoDataUrl(dataUrl: string) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i.exec(dataUrl);
  if (!match) throw new Error('Photo must be a JPEG, PNG, or WebP data URL');

  const mimeType = match[1].toLowerCase();
  const binary = atob(match[2]);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  if (bytes.byteLength > 3 * 1024 * 1024) {
    throw new Error('Photo exceeds the 3 MB attendance limit');
  }

  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  return { bytes, mimeType, extension };
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.asin(Math.sqrt(a));
}

async function verifyToken(token: string, secret: string): Promise<TokenPayload> {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) throw new Error('Malformed QR token');

  const expectedSignature = await hmacSha256(encodedPayload, secret);
  if (!timingSafeEqual(signature, expectedSignature)) throw new Error('Invalid QR signature');

  const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(encodedPayload))) as TokenPayload;
  if (!payload.attendance_session_id || !payload.session_id || !payload.nonce || !payload.issued_at || !payload.expires_at) {
    throw new Error('Incomplete QR token payload');
  }

  return payload;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const qrSecret = Deno.env.get('QR_SIGNING_SECRET');

  if (!supabaseUrl || !serviceRoleKey || !qrSecret) {
    return json({ error: 'Server is missing Supabase or QR signing configuration' }, 500);
  }

  const authHeader = req.headers.get('authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
  if (!jwt) return json({ error: 'Authentication required' }, 401);

  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? '');
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const photoDataUrl = String(body.photoDataUrl ?? '');
  const scannedAt = body.scannedAt ? new Date(body.scannedAt) : new Date();
  const deviceFingerprint = String(body.deviceFingerprint ?? '');

  if (!token) return json({ error: 'QR token is required' }, 400);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return json({ error: 'Valid latitude and longitude are required' }, 400);
  }
  if (!photoDataUrl) return json({ error: 'Camera photo is required' }, 400);

  let payload: TokenPayload;
  try {
    payload = await verifyToken(token, qrSecret);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid QR token' }, 401);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !userData.user?.email) return json({ error: 'Invalid session' }, 401);

  const { data: actor, error: actorError } = await supabase
    .from('app_users')
    .select('id, role, email')
    .or(`auth_user_id.eq.${userData.user.id},email.eq.${userData.user.email}`)
    .eq('status', 'active')
    .maybeSingle();

  if (actorError) return json({ error: actorError.message }, 500);
  if (!actor || !['mahasiswa', 'admin'].includes(actor.role)) {
    return json({ error: 'Only students may submit attendance' }, 403);
  }

  const tokenHash = await sha256Hex(token);
  const { data: tokenRow, error: tokenError } = await supabase
    .from('attendance_tokens')
    .select('id, attendance_session_id, nonce, expires_at')
    .eq('token_hash', tokenHash)
    .eq('nonce', payload.nonce)
    .maybeSingle();

  if (tokenError) return json({ error: tokenError.message }, 500);
  if (!tokenRow) return json({ error: 'QR token was not issued by this server' }, 401);

  const { data: attendanceSession, error: sessionError } = await supabase
    .from('attendance_sessions')
    .select('id, session_id, latitude, longitude, radius_meters, starts_at, ends_at, is_active')
    .eq('id', payload.attendance_session_id)
    .maybeSingle();

  if (sessionError) return json({ error: sessionError.message }, 500);
  if (!attendanceSession || attendanceSession.session_id !== payload.session_id || !attendanceSession.is_active) {
    return json({ error: 'Attendance session is not active' }, 409);
  }

  const { data: duplicate, error: duplicateError } = await supabase
    .from('attendance')
    .select('id, validation_status')
    .eq('attendance_session_id', payload.attendance_session_id)
    .eq('user_id', actor.id)
    .maybeSingle();

  if (duplicateError) return json({ error: duplicateError.message }, 500);
  if (duplicate) {
    return json({
      status: 'duplicate_attempt',
      attendanceId: duplicate.id,
      message: 'Presensi untuk sesi ini sudah pernah dikirim.',
    }, 409);
  }

  const now = new Date();
  const tokenExpired = new Date(payload.expires_at).getTime() < now.getTime();
  const sessionWindowClosed = now < new Date(attendanceSession.starts_at) || now > new Date(attendanceSession.ends_at);
  const distanceMeters = haversineMeters(
    Number(attendanceSession.latitude),
    Number(attendanceSession.longitude),
    latitude,
    longitude,
  );

  let validationStatus: AttendanceStatus = 'valid';
  if (tokenExpired) validationStatus = 'expired_qr';
  else if (sessionWindowClosed) validationStatus = 'pending_review';
  else if (distanceMeters > Number(attendanceSession.radius_meters)) validationStatus = 'flagged_location';

  let photo;
  try {
    photo = parsePhotoDataUrl(photoDataUrl);
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Invalid attendance photo' }, 400);
  }

  const photoHash = await sha256Hex(photo.bytes);
  const photoPath = `${payload.attendance_session_id}/${actor.id}/${crypto.randomUUID()}.${photo.extension}`;
  const { error: uploadError } = await supabase.storage
    .from('attendance-photos')
    .upload(photoPath, photo.bytes, {
      contentType: photo.mimeType,
      upsert: false,
    });

  if (uploadError) return json({ error: uploadError.message }, 500);

  const forwardedFor = req.headers.get('x-forwarded-for') ?? '';
  const firstIp = forwardedFor.split(',')[0]?.trim() || null;

  const { data: inserted, error: insertError } = await supabase
    .from('attendance')
    .insert({
      session_id: payload.session_id,
      attendance_session_id: payload.attendance_session_id,
      user_id: actor.id,
      scanned_at: Number.isNaN(scannedAt.getTime()) ? now.toISOString() : scannedAt.toISOString(),
      submitted_at: now.toISOString(),
      latitude,
      longitude,
      distance_meters: Number(distanceMeters.toFixed(2)),
      photo_path: photoPath,
      photo_hash: photoHash,
      photo_size_bytes: photo.bytes.byteLength,
      user_agent: req.headers.get('user-agent'),
      device_fingerprint: deviceFingerprint || null,
      ip_address: firstIp,
      qr_nonce: payload.nonce,
      token_issued_at: payload.issued_at,
      token_expires_at: payload.expires_at,
      validation_status: validationStatus,
    })
    .select('id, validation_status')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return json({ status: 'duplicate_attempt', message: 'Presensi untuk sesi ini sudah pernah dikirim.' }, 409);
    }
    return json({ error: insertError.message }, 500);
  }

  return json({
    status: inserted.validation_status,
    attendanceId: inserted.id,
    distanceMeters: Number(distanceMeters.toFixed(2)),
    radiusMeters: Number(attendanceSession.radius_meters),
    photoPath,
  });
});
