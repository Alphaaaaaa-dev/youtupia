import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// ── Email sender helper ──────────────────────────────────────────────────────
async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: 'Averti Safety Systems <noreply@miraenext.in>', to: [to], subject, html }),
  });
  return res.json();
}

// ── Branded email templates ──────────────────────────────────────────────────
const emailWrapper = (content: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
      <tr><td style="background:linear-gradient(90deg,#1d4ed8,#3b82f6,#1d4ed8);height:3px;"></td></tr>
      <tr>
        <td style="padding:36px 40px 28px;text-align:center;border-bottom:1px solid #334155;">
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr>
            <td style="vertical-align:middle;padding-right:14px;">
              <div style="width:52px;height:52px;background:#000;border-radius:14px;text-align:center;line-height:52px;box-shadow:0 8px 24px rgba(0,0,0,0.5);">
                <img src="https://miraenext.in/favicon.ico" width="30" height="30" alt="Averti" style="vertical-align:middle;margin-top:11px;" onerror="this.style.display='none'"/>
              </div>
            </td>
            <td style="vertical-align:middle;text-align:left;">
              <div style="color:#f8fafc;font-size:28px;font-weight:800;letter-spacing:-0.5px;line-height:1;">Averti</div>
              <div style="color:#64748b;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin-top:3px;">BY MIRAE NEXT</div>
            </td>
          </tr></table>
        </td>
      </tr>
      <tr><td style="padding:36px 40px;">${content}</td></tr>
      <tr>
        <td style="background:#0f172a;padding:22px 40px;text-align:center;border-top:1px solid #334155;">
          <p style="color:#334155;font-size:11px;margin:0 0 6px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">Averti Safety Systems · Mirae Next</p>
          <p style="color:#475569;font-size:11px;margin:0;line-height:1.7;">
            Sitapura Extension, Jaipur — 303905, Rajasthan, India<br>
            <a href="https://miraenext.in" style="color:#3b82f6;text-decoration:none;">miraenext.in</a> &nbsp;·&nbsp;
            <a href="mailto:miraenextai@gmail.com" style="color:#3b82f6;text-decoration:none;">miraenextai@gmail.com</a> &nbsp;·&nbsp;
            <a href="tel:+919636711659" style="color:#3b82f6;text-decoration:none;">+91 9636711659</a>
          </p>
          <div style="margin-top:14px;height:2px;background:linear-gradient(90deg,transparent,#1d4ed8,transparent);border-radius:99px;"></div>
        </td>
      </tr>
    </table>
    <p style="color:#334155;font-size:10px;text-align:center;margin:20px 0 0;">© 2026 Mirae Next · Averti Safety Systems · Patent Pending · Made in India</p>
  </td></tr>
</table>
</body></html>`;

const otpEmailHtml = (name: string, code: string, purpose: string, expiry: string) => emailWrapper(`
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;width:64px;height:64px;background:#1e3a8a;border-radius:50%;border:2px solid #3b82f6;line-height:64px;text-align:center;">
      <span style="font-size:28px;">✉️</span>
    </div>
  </div>
  <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 10px;text-align:center;">${purpose}</h2>
  <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 28px;text-align:center;">
    Hi ${name}! Use the code below to complete your request.
  </p>
  <div style="background:#0f172a;border:2px solid #3b82f6;border-radius:14px;padding:28px;text-align:center;margin-bottom:28px;box-shadow:0 0 32px rgba(59,130,246,0.15);">
    <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-weight:600;">YOUR CODE</p>
    <div style="font-size:48px;font-weight:900;letter-spacing:0.2em;color:#60a5fa;font-family:'Courier New',monospace;line-height:1;">${code}</div>
    <p style="color:#475569;font-size:11px;margin:12px 0 0;">Expires in <strong style="color:#f1f5f9;">${expiry}</strong></p>
  </div>
  <p style="color:#475569;font-size:11px;text-align:center;margin:0;line-height:1.6;">
    If you didn't request this, you can safely ignore this email.
  </p>`);

const verifyEmailHtml = (name: string, code: string) => emailWrapper(`
  <div style="text-align:center;margin-bottom:24px;">
    <div style="display:inline-block;width:64px;height:64px;background:#1e3a8a;border-radius:50%;border:2px solid #3b82f6;line-height:64px;text-align:center;">
      <span style="font-size:28px;">✉️</span>
    </div>
  </div>
  <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 10px;text-align:center;">Verify your email address</h2>
  <p style="color:#94a3b8;font-size:14px;line-height:1.8;margin:0 0 28px;text-align:center;">
    Welcome, ${name}! You're one step away from accessing your live safety dashboard.
  </p>
  <div style="background:#0f172a;border:2px solid #3b82f6;border-radius:14px;padding:28px;text-align:center;margin-bottom:28px;box-shadow:0 0 32px rgba(59,130,246,0.15);">
    <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;font-weight:600;">YOUR VERIFICATION CODE</p>
    <div style="font-size:48px;font-weight:900;letter-spacing:0.2em;color:#60a5fa;font-family:'Courier New',monospace;line-height:1;">${code}</div>
    <p style="color:#475569;font-size:11px;margin:12px 0 0;">Expires in <strong style="color:#f1f5f9;">15 minutes</strong></p>
  </div>
  <div style="border-top:1px solid #334155;margin:0 0 28px;"></div>
  <p style="color:#64748b;font-size:11px;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;font-weight:600;">WHAT AVERTI MONITORS FOR YOU</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td width="48%" style="padding:14px;background:#0f172a;border-radius:10px;border:1px solid #334155;vertical-align:top;">
        <p style="margin:0;font-size:20px;">💨</p><p style="margin:8px 0 2px;color:#f1f5f9;font-size:12px;font-weight:700;">LPG Gas Leak</p>
        <p style="margin:0;color:#64748b;font-size:11px;">Cooking gas detection with instant alert</p>
      </td>
      <td width="4%"></td>
      <td width="48%" style="padding:14px;background:#0f172a;border-radius:10px;border:1px solid #334155;vertical-align:top;">
        <p style="margin:0;font-size:20px;">☁️</p><p style="margin:8px 0 2px;color:#f1f5f9;font-size:12px;font-weight:700;">Air Quality</p>
        <p style="margin:0;color:#64748b;font-size:11px;">Smoke and pollutant monitoring</p>
      </td>
    </tr>
    <tr><td colspan="3" height="10"></td></tr>
    <tr>
      <td width="48%" style="padding:14px;background:#0f172a;border-radius:10px;border:1px solid #334155;vertical-align:top;">
        <p style="margin:0;font-size:20px;">⚠️</p><p style="margin:8px 0 2px;color:#f1f5f9;font-size:12px;font-weight:700;">Carbon Monoxide</p>
        <p style="margin:0;color:#64748b;font-size:11px;">Invisible CO gas — the silent killer</p>
      </td>
      <td width="4%"></td>
      <td width="48%" style="padding:14px;background:#0f172a;border-radius:10px;border:1px solid #334155;vertical-align:top;">
        <p style="margin:0;font-size:20px;">🔥</p><p style="margin:8px 0 2px;color:#f1f5f9;font-size:12px;font-weight:700;">Fire & Flame</p>
        <p style="margin:0;color:#64748b;font-size:11px;">Instant fire and open flame detection</p>
      </td>
    </tr>
  </table>
  <p style="color:#475569;font-size:11px;margin:28px 0 0;text-align:center;line-height:1.6;">
    If you didn't create an Averti account, you can safely ignore this email.
  </p>`);

// ── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return res.status(500).json({ error: 'Server configuration error' });

  const { action, email, password, name, otp, userId, code, phone, newEmail, newPassword, token } = req.body;

  try {

    // ── LOGIN ───────────────────────────────────────────────────────────────
    if (action === 'login') {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        const msg = data.error_description || data.msg || '';
        if (msg.toLowerCase().includes('email not confirmed')) {
          return res.status(400).json({ error: 'Please verify your email first. Check your inbox for the OTP code.' });
        }
        return res.status(400).json({ error: 'Invalid email or password' });
      }
      return res.status(200).json({
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          phone: data.user.user_metadata?.phone || '',
        },
        access_token: data.access_token,
        expires_in: data.expires_in,
      });
    }

    // ── SIGNUP ──────────────────────────────────────────────────────────────
    if (action === 'signup') {
      const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ email, password, user_metadata: { name }, email_confirm: false }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        const msg = createData.msg || createData.message || createData.error_description || '';
        if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')) {
          return res.status(400).json({ error: 'This email is already registered. Try logging in.' });
        }
        return res.status(400).json({ error: msg || 'Signup failed. Please try again.' });
      }
      const userEmail = createData.email || email;
      const signupCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = Date.now() + 15 * 60 * 1000;
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${createData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ user_metadata: { name, verification_code: signupCode, code_expiry: codeExpiry } }),
      });
      const emailRes = await sendEmail(userEmail, 'Verify your Averti account', verifyEmailHtml(name || userEmail.split('@')[0], signupCode));
      console.log('Signup email:', JSON.stringify(emailRes));
      if (emailRes?.statusCode >= 400 || emailRes?.name === 'validation_error') {
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${createData.id}`, {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        });
        return res.status(500).json({ error: 'Could not send verification email. Please try again.' });
      }
      return res.status(200).json({ needsOTP: true, userId: createData.id });
    }

    // ── VERIFY SIGNUP CODE ──────────────────────────────────────────────────
    if (action === 'verify_code') {
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        headers: { 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
      });
      const userData = await userRes.json();
      const meta = userData?.user_metadata || {};
      if (!meta.verification_code) return res.status(400).json({ error: 'No verification code found. Please sign up again.' });
      if (Date.now() > meta.code_expiry) return res.status(400).json({ error: 'Code expired. Please sign up again.' });
      if (meta.verification_code !== code) return res.status(400).json({ error: 'Invalid code. Check your email and try again.' });
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ email_confirm: true, user_metadata: { name: meta.name } }),
      });
      return res.status(200).json({ success: true });
    }

    // ── FORGOT PASSWORD ─────────────────────────────────────────────────────
    if (action === 'forgot_password') {
      // Find user by email
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=1000`, {
        headers: { 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
      });
      const listData = await listRes.json();
      const foundUser = (listData?.users || []).find((u: any) => u.email === email);
      if (!foundUser) {
        // Don't reveal if email exists
        return res.status(200).json({ success: true, message: 'If this email exists, a reset code has been sent.' });
      }
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = Date.now() + 15 * 60 * 1000;
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${foundUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ user_metadata: { ...foundUser.user_metadata, reset_code: resetCode, reset_expiry: codeExpiry } }),
      });
      await sendEmail(email, 'Reset your Averti password',
        otpEmailHtml(foundUser.user_metadata?.name || email.split('@')[0], resetCode, 'Reset your password', '15 minutes'));
      return res.status(200).json({ success: true, userId: foundUser.id });
    }

    // ── VERIFY RESET CODE + SET NEW PASSWORD ────────────────────────────────
    if (action === 'reset_password') {
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        headers: { 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
      });
      const userData = await userRes.json();
      const meta = userData?.user_metadata || {};
      if (!meta.reset_code) return res.status(400).json({ error: 'No reset code found. Please request a new one.' });
      if (Date.now() > meta.reset_expiry) return res.status(400).json({ error: 'Reset code expired. Please request a new one.' });
      if (meta.reset_code !== code) return res.status(400).json({ error: 'Invalid code. Check your email and try again.' });
      // Set new password
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ password: newPassword, user_metadata: { ...meta, reset_code: null, reset_expiry: null } }),
      });
      return res.status(200).json({ success: true });
    }

    // ── CHANGE EMAIL (send OTP to new email) ────────────────────────────────
    if (action === 'change_email') {
      // token = current user's access_token from localStorage
      const meRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
      });
      const meData = await meRes.json();
      if (!meRes.ok) return res.status(401).json({ error: 'Not authenticated. Please log in again.' });
      const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiry = Date.now() + 15 * 60 * 1000;
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${meData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ user_metadata: { ...meData.user_metadata, email_change_code: emailCode, email_change_expiry: codeExpiry, email_change_new: newEmail } }),
      });
      await sendEmail(newEmail, 'Confirm your new Averti email address',
        otpEmailHtml(meData.user_metadata?.name || meData.email.split('@')[0], emailCode, 'Confirm your new email', '15 minutes'));
      return res.status(200).json({ success: true, userId: meData.id });
    }

    // ── VERIFY EMAIL CHANGE CODE ────────────────────────────────────────────
    if (action === 'verify_email_change') {
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        headers: { 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
      });
      const userData = await userRes.json();
      const meta = userData?.user_metadata || {};
      if (!meta.email_change_code) return res.status(400).json({ error: 'No email change request found.' });
      if (Date.now() > meta.email_change_expiry) return res.status(400).json({ error: 'Code expired. Please request again.' });
      if (meta.email_change_code !== code) return res.status(400).json({ error: 'Invalid code. Check your new email inbox.' });
      // Update email in Supabase
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ email: meta.email_change_new, email_confirm: true, user_metadata: { ...meta, email_change_code: null, email_change_expiry: null, email_change_new: null } }),
      });
      return res.status(200).json({ success: true, newEmail: meta.email_change_new });
    }

    // ── UPDATE PHONE ────────────────────────────────────────────────────────
    if (action === 'update_phone') {
      const meRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
      });
      const meData = await meRes.json();
      if (!meRes.ok) return res.status(401).json({ error: 'Not authenticated. Please log in again.' });
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${meData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ user_metadata: { ...meData.user_metadata, phone } }),
      });
      return res.status(200).json({ success: true });
    }

    // ── UPDATE PASSWORD (logged in) ─────────────────────────────────────────
    if (action === 'update_password') {
      const meRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${token}` },
      });
      const meData = await meRes.json();
      if (!meRes.ok) return res.status(401).json({ error: 'Not authenticated. Please log in again.' });
      await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${meData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_SERVICE_KEY!, 'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}` },
        body: JSON.stringify({ password: newPassword }),
      });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (err) {
    console.error('Auth handler error:', err);
    return res.status(500).json({ error: 'Connection error. Please try again.' });
  }
}
