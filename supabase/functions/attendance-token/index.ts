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

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
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
  if (!actor || actor.role !== 'admin') return json({ error: 'Admin access required' }, 403);

  const body = await req.json().catch(() => ({}));
  const sessionId = String(body.sessionId ?? '');
  if (!sessionId) return json({ error: 'sessionId is required' }, 400);

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, title, location_name, latitude, longitude, radius_meters, session_date, start_time, end_time')
    .eq('id', sessionId)
    .maybeSingle();

  if (sessionError) return json({ error: sessionError.message }, 500);
  if (!session) return json({ error: 'Session not found' }, 404);

  const latitude = Number(body.latitude ?? session.latitude);
  const longitude = Number(body.longitude ?? session.longitude);
  const radiusMeters = Number(body.radiusMeters ?? session.radius_meters ?? 150);
  const locationName = String(body.locationName ?? session.location_name ?? session.title);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return json({ error: 'Attendance location latitude and longitude are required' }, 400);
  }

  const now = new Date();
  const startsAt = body.startsAt ? new Date(body.startsAt) : now;
  const endsAt = body.endsAt ? new Date(body.endsAt) : new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const ttlSeconds = Math.min(30, Math.max(5, Number(body.ttlSeconds ?? 15)));

  let attendanceSessionId: string | undefined;
  const { data: activeSession, error: activeError } = await supabase
    .from('attendance_sessions')
    .select('id')
    .eq('session_id', sessionId)
    .eq('is_active', true)
    .maybeSingle();

  if (activeError) return json({ error: activeError.message }, 500);

  if (activeSession?.id) {
    attendanceSessionId = activeSession.id;
    const { error: updateError } = await supabase
      .from('attendance_sessions')
      .update({
        location_name: locationName,
        latitude,
        longitude,
        radius_meters: radiusMeters,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      .eq('id', attendanceSessionId);
    if (updateError) return json({ error: updateError.message }, 500);
  } else {
    const { data: createdSession, error: createError } = await supabase
      .from('attendance_sessions')
      .insert({
        session_id: sessionId,
        location_name: locationName,
        latitude,
        longitude,
        radius_meters: radiusMeters,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        is_active: true,
        created_by: actor.id,
      })
      .select('id')
      .single();
    if (createError) return json({ error: createError.message }, 500);
    attendanceSessionId = createdSession.id;
  }

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + ttlSeconds * 1000);
  const payload: TokenPayload = {
    attendance_session_id: attendanceSessionId,
    session_id: sessionId,
    nonce: crypto.randomUUID(),
    issued_at: issuedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
  };
  const encodedPayload = base64Url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await hmacSha256(encodedPayload, qrSecret);
  const token = `${encodedPayload}.${signature}`;
  const tokenHash = await sha256Hex(token);

  const { error: tokenError } = await supabase.from('attendance_tokens').insert({
    attendance_session_id: attendanceSessionId,
    nonce: payload.nonce,
    token_hash: tokenHash,
    issued_at: payload.issued_at,
    expires_at: payload.expires_at,
    created_by: actor.id,
  });

  if (tokenError) return json({ error: tokenError.message }, 500);

  return json({
    token,
    attendanceSessionId,
    sessionId,
    issuedAt: payload.issued_at,
    expiresAt: payload.expires_at,
    ttlSeconds,
  });
});
