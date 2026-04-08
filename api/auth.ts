import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY   = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY      = process.env.RESEND_API_KEY;

// ── IMPORTANT: FROM_EMAIL must be a domain verified in your Resend account.
// If you haven't verified a custom domain yet, use Resend's test domain:
//   "Youtupia <onboarding@resend.dev>"  — works for sending to YOUR OWN email only.
// Once you verify youtupia.in in Resend dashboard, change to:
//   "Youtupia <noreply@youtupia.in>"
const FROM_EMAIL = process.env.FROM_EMAIL || 'Youtupia <onboarding@resend.dev>';

// ── Email sender ─────────────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set — skipping email send');
    return { id: 'skipped' };
  }

  console.log(`Sending email to ${to} from ${FROM_EMAIL}`);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });

  const data = await res.json();
  console.log('Resend response:', JSON.stringify(data));
  return data;
}

// ── Youtupia OTP email template ──────────────────────────────────────────────
const otpEmail = (name: string, code: string, purpose: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border-radius:18px;overflow:hidden;border:1px solid #222;">
      <tr><td style="background:linear-gradient(90deg,#ff0000,#cc0000);height:4px;"></td></tr>
      <tr>
        <td style="padding:32px 36px 24px;text-align:center;border-bottom:1px solid #1a1a1a;">
          <div style="display:inline-flex;align-items:center;gap:10px;">
            <div style="width:42px;height:42px;background:#ff0000;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;">
              <span style="font-size:18px;">▶</span>
            </div>
            <span style="color:#f1f5f9;font-size:24px;font-weight:900;letter-spacing:-0.5px;">Youtupia</span>
          </div>
          <p style="color:#475569;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:8px 0 0;">WEAR THE CULTURE</p>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 36px 28px;">
          <h2 style="color:#f1f5f9;font-size:20px;font-weight:800;margin:0 0 10px;text-align:center;">${purpose}</h2>
          <p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 28px;text-align:center;">
            Hey ${name}! Use the code below to verify your account.
          </p>
          <div style="background:#0a0a0a;border:2px solid #ff0000;border-radius:14px;padding:28px;text-align:center;margin-bottom:24px;">
            <p style="color:#64748b;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;font-weight:700;">YOUR OTP CODE</p>
            <div style="font-size:52px;font-weight:900;letter-spacing:0.22em;color:#ff0000;font-family:'Courier New',monospace;line-height:1;">${code}</div>
            <p style="color:#475569;font-size:12px;margin:14px 0 0;">Expires in <strong style="color:#f1f5f9;">15 minutes</strong></p>
          </div>
          <p style="color:#334155;font-size:12px;text-align:center;margin:0;line-height:1.7;">
            If you didn't create a Youtupia account, ignore this email.
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#0a0a0a;padding:20px 36px;text-align:center;border-top:1px solid #1a1a1a;">
          <p style="color:#1e293b;font-size:11px;margin:0 0 4px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">YOUTUPIA · WEAR THE CULTURE</p>
          <p style="color:#334155;font-size:11px;margin:0;">
            Questions? <a href="mailto:support@youtupia.in" style="color:#ff0000;text-decoration:none;">support@youtupia.in</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;

// ── Supabase Admin helpers ────────────────────────────────────────────────────
const sbAdmin = (path: string, method = 'GET', body?: object) =>
  fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY!,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

// ── Main handler ─────────────────────────────────────────────────────────────
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

  const { action, email, password, name, phone, code, userId, newPassword } = req.body || {};

  try {

    // ── LOGIN ─────────────────────────────────────────────────────────────
    if (action === 'login') {
      const data = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password }),
      }).then(r => r.json());

      if (data.error || data.error_code) {
        const msg = (data.error_description || data.msg || '').toLowerCase();
        if (msg.includes('email not confirmed'))
          return res.status(400).json({ error: 'Please verify your email first. Check your inbox for the OTP.' });
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

    // ── SIGNUP ────────────────────────────────────────────────────────────
    if (action === 'signup') {
      console.log('Signup attempt for:', email);

      // Check if RESEND_API_KEY is set before even creating the user
      if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY is not set in environment variables');
        return res.status(500).json({
          error: 'Email service not configured. Please contact support or set RESEND_API_KEY in Vercel environment variables.',
        });
      }

      // Create user via admin
      const createData = await sbAdmin('/admin/users', 'POST', {
        email,
        password,
        email_confirm: false,
        user_metadata: { name: name || '', phone: phone || '' },
      });

      console.log('Supabase create user response:', JSON.stringify(createData));

      // Different GoTrue versions may return the created user either as the
      // response object itself OR nested under `user`.
      const createdUser = createData?.user || createData;
      const createError = createData?.error || createData?.msg || createData?.message || createData?.error_description;
      const hasError = Boolean(createError) || !createdUser?.id;
      if (hasError) {
        const raw = String(createError || '').toLowerCase();
        console.error('Supabase signup error:', JSON.stringify(createData));
        if (raw.includes('already') || raw.includes('duplicate') || raw.includes('unique') || raw.includes('registered'))
          return res.status(400).json({ error: 'This email is already registered. Please sign in instead.' });
        return res.status(400).json({ error: `Signup failed: ${createError || 'Unknown error'}` });
      }

      const uid = createdUser.id;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 15 * 60 * 1000;

      console.log(`Generated OTP ${otp} for user ${uid}`);

      // Store OTP in user metadata
      await sbAdmin(`/admin/users/${uid}`, 'PUT', {
        user_metadata: { name: name || '', phone: phone || '', otp_code: otp, otp_expiry: expiry },
      });

      // Send branded OTP email
      const emailResult = await sendEmail(
        email,
        'Your Youtupia verification code',
        otpEmail(name || email.split('@')[0], otp, 'Verify your email address')
      );

      // Check for Resend errors
      const emailFailed = !emailResult?.id || emailResult?.statusCode >= 400 || emailResult?.name === 'validation_error';
      if (emailFailed) {
        console.error('Resend email send failed:', JSON.stringify(emailResult));

        // Clean up user if email fails
        await sbAdmin(`/admin/users/${uid}`, 'DELETE');

        // Provide a helpful error message about FROM_EMAIL domain verification
        if (emailResult?.name === 'validation_error' || emailResult?.message?.includes('domain')) {
          return res.status(500).json({
            error: 'Email sending failed: The FROM_EMAIL domain is not verified in Resend. Please verify your domain at resend.com/domains or set FROM_EMAIL to "Youtupia <onboarding@resend.dev>" in Vercel environment variables.',
          });
        }

        return res.status(500).json({
          error: `Could not send verification email: ${emailResult?.message || 'Unknown error'}. Please check your RESEND_API_KEY and FROM_EMAIL settings.`,
        });
      }

      console.log('OTP email sent successfully, id:', emailResult.id);
      return res.status(200).json({ needsOTP: true, userId: uid });
    }

    // ── VERIFY OTP ────────────────────────────────────────────────────────
    if (action === 'verify_code') {
      const userData = await sbAdmin(`/admin/users/${userId}`);
      const meta = userData?.user_metadata || {};

      if (!meta.otp_code)
        return res.status(400).json({ error: 'No OTP found. Please sign up again.' });
      if (Date.now() > meta.otp_expiry)
        return res.status(400).json({ error: 'OTP expired. Click "Resend OTP" to get a new one.' });
      if (meta.otp_code !== code)
        return res.status(400).json({ error: 'Incorrect OTP. Please check your email and try again.' });

      // Confirm email + clear OTP
      await sbAdmin(`/admin/users/${userId}`, 'PUT', {
        email_confirm: true,
        user_metadata: { name: meta.name, phone: meta.phone, otp_code: null, otp_expiry: null },
      });

      // Write to profiles table
      await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_KEY!,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          id: userId,
          email: userData.email,
          name: meta.name || '',
          phone: meta.phone || '',
          role: 'user',
        }),
      });

      return res.status(200).json({ success: true });
    }

    // ── FORGOT PASSWORD ───────────────────────────────────────────────────
    if (action === 'forgot_password') {
      const listData = await sbAdmin('/admin/users?page=1&per_page=1000');
      const found = (listData?.users || []).find((u: any) => u.email === email);
      // Always return success (don't reveal if email exists)
      if (!found) return res.status(200).json({ success: true });

      const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = Date.now() + 15 * 60 * 1000;

      await sbAdmin(`/admin/users/${found.id}`, 'PUT', {
        user_metadata: { ...found.user_metadata, reset_otp: resetOtp, reset_expiry: expiry },
      });

      await sendEmail(
        email,
        'Reset your Youtupia password',
        otpEmail(found.user_metadata?.name || email.split('@')[0], resetOtp, 'Reset your password')
      );

      return res.status(200).json({ success: true, userId: found.id });
    }

    // ── RESET PASSWORD ────────────────────────────────────────────────────
    if (action === 'reset_password') {
      const userData = await sbAdmin(`/admin/users/${userId}`);
      const meta = userData?.user_metadata || {};
      if (!meta.reset_otp) return res.status(400).json({ error: 'No reset request found. Please start again.' });
      if (Date.now() > meta.reset_expiry) return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
      if (meta.reset_otp !== code) return res.status(400).json({ error: 'Incorrect OTP. Check your email.' });

      await sbAdmin(`/admin/users/${userId}`, 'PUT', {
        password: newPassword,
        user_metadata: { ...meta, reset_otp: null, reset_expiry: null },
      });

      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (err) {
    console.error('Auth handler error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
