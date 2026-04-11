import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY    = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// ── Supabase admin helper ──────────────────────────────────────────────────
const sbAdmin = (path: string, method = 'GET', body?: object) =>
  fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_KEY!,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
    console.error('Missing env vars:', {
      SUPABASE_URL: !!SUPABASE_URL,
      SUPABASE_ANON_KEY: !!SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_KEY: !!SUPABASE_SERVICE_KEY,
    });
    return res.status(500).json({ error: 'Server configuration error — missing env vars' });
  }

  const { action, email, password, name, phone, userId, newPassword, code } = req.body || {};

  try {
    // ── LOGIN ──────────────────────────────────────────────────────────────
    if (action === 'login') {
      const data = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password }),
      }).then(r => r.json());

      if (data.error || data.error_code) {
        const msg = (data.error_description || data.msg || '').toLowerCase();
        if (msg.includes('email not confirmed'))
          return res.status(400).json({ error: 'Please verify your email first. Check your inbox for the confirmation link.' });
        return res.status(400).json({ error: 'Invalid email or password.' });
      }

      return res.status(200).json({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          phone: data.user.user_metadata?.phone || '',
        },
        access_token: data.access_token,
        expires_in: data.expires_in || 3600,
      });
    }

    // ── SIGNUP — uses Supabase built-in email confirmation (no Resend) ─────
    if (action === 'signup') {
      console.log('Signup attempt for:', email);

      const signupRes = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email,
          password,
          data: {
            name:      name  || '',
            full_name: name  || '',
            phone:     phone || '',
            role:      'user',
          },
        }),
      });

      const signupData = await signupRes.json();
      console.log('Supabase signup response:', JSON.stringify(signupData));

      if (signupData?.error) {
        const raw = String(signupData.error?.message || signupData.msg || '').toLowerCase();
        if (raw.includes('already') || raw.includes('registered') || raw.includes('duplicate'))
          return res.status(400).json({ error: 'This email is already registered. Please sign in instead.' });
        return res.status(400).json({ error: `Signup failed: ${signupData.error?.message || signupData.msg || 'Unknown error'}` });
      }

      return res.status(200).json({ success: true, needsEmailConfirmation: true });
    }

    // ── FORGOT PASSWORD ────────────────────────────────────────────────────
    if (action === 'forgot_password') {
      await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY },
        body: JSON.stringify({ email }),
      });
      return res.status(200).json({ success: true });
    }

    // ── RESET PASSWORD ─────────────────────────────────────────────────────
    if (action === 'reset_password') {
      const data = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${code}`,
        },
        body: JSON.stringify({ password: newPassword }),
      }).then(r => r.json());

      if (data.error)
        return res.status(400).json({ error: data.error?.message || 'Password reset failed.' });

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (err) {
    console.error('Auth handler error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
