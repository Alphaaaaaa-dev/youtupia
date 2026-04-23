import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");
const RESEND_API_KEY       = process.env.RESEND_API_KEY;
const FROM_EMAIL           = process.env.FROM_EMAIL || 'Youtupia <noreply@youtupia.in>';
const ADMIN_EMAIL          = process.env.ADMIN_EMAIL || 'admin@youtupia.in';

function sbHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey:         SUPABASE_SERVICE_KEY!,
    Authorization:  `Bearer ${SUPABASE_SERVICE_KEY}`,
    Prefer:         'return=representation',
  };
}

// ── Email templates ──────────────────────────────────────────────────────────
const ticketConfirmHtml = (name: string, ticketId: string, subject: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border-radius:18px;overflow:hidden;border:1px solid #222;">
      <tr><td style="background:linear-gradient(90deg,#ff0000,#cc0000);height:4px;"></td></tr>
      <tr><td style="padding:32px 36px 24px;text-align:center;border-bottom:1px solid #1a1a1a;">
        <span style="color:#f1f5f9;font-size:24px;font-weight:900;">Youtupia</span>
        <p style="color:#475569;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:8px 0 0;">WEAR YOUR DREAMS</p>
      </td></tr>
      <tr><td style="padding:36px 36px 28px;">
        <h2 style="color:#f1f5f9;font-size:20px;font-weight:800;margin:0 0 10px;text-align:center;">We got your message ✅</h2>
        <p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 24px;text-align:center;">
          Hey ${name}! Our support team will get back to you within 24 hours.
        </p>
        <div style="background:#0a0a0a;border:1px solid #1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px;">
          <p style="color:#64748b;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;font-weight:700;">TICKET DETAILS</p>
          <p style="color:#94a3b8;font-size:13px;margin:0 0 6px;">🎫 <strong style="color:#f1f5f9;">Ticket ID:</strong> ${ticketId}</p>
          <p style="color:#94a3b8;font-size:13px;margin:0;">📝 <strong style="color:#f1f5f9;">Subject:</strong> ${subject}</p>
        </div>
        <p style="color:#334155;font-size:12px;text-align:center;margin:0;line-height:1.7;">
          You can also reach us at <a href="mailto:support@youtupia.in" style="color:#ff0000;text-decoration:none;">support@youtupia.in</a>
        </p>
      </td></tr>
      <tr><td style="background:#0a0a0a;padding:20px 36px;text-align:center;border-top:1px solid #1a1a1a;">
        <p style="color:#334155;font-size:11px;margin:0;">YOUTUPIA · WEAR YOUR DREAMS</p>
      </td></tr>
    </table>
  </td></tr>
</table></body></html>`;

const adminAlertHtml = (name: string, email: string, category: string, subject: string, message: string, ticketId: string) => `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
    <h2 style="color:#0f172a;margin:0 0 16px;">🎫 New Support Ticket</h2>
    <table style="width:100%;font-size:14px;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#64748b;width:100px;">Ticket ID</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">${ticketId}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;">Name</td><td style="padding:8px 0;color:#0f172a;">${name}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;color:#ff0000;">${email}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;">Category</td><td style="padding:8px 0;color:#0f172a;">${category}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b;">Subject</td><td style="padding:8px 0;font-weight:600;color:#0f172a;">${subject}</td></tr>
    </table>
    <div style="background:#f8fafc;border-radius:8px;padding:14px;margin-top:12px;">
      <p style="color:#64748b;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 8px;">MESSAGE</p>
      <p style="color:#0f172a;font-size:14px;line-height:1.7;margin:0;">${message}</p>
    </div>
  </div>
</body></html>`;

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_API_KEY) return;
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
}

// ── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: 'Missing env vars' });

  // ── GET — fetch all tickets (admin) ─────────────────────────────────────
  if (req.method === 'GET') {
    const r = await fetch(
      `${SB_URL}/rest/v1/tickets?order=created_at.desc&select=*`,
      { headers: sbHeaders() }
    );
    if (!r.ok) {
      const e = await r.json();
      return res.status(500).json({ error: e?.message || 'Failed to fetch tickets' });
    }
    const tickets = await r.json();
    return res.status(200).json({ tickets });
  }

  // ── POST — submit a new ticket (public) ─────────────────────────────────
  if (req.method === 'POST') {
    const { name, email, category, subject, message } = req.body || {};
    if (!name || !email || !subject || !message)
      return res.status(400).json({ error: 'Missing required fields' });

    const r = await fetch(`${SB_URL}/rest/v1/tickets`, {
      method:  'POST',
      headers: sbHeaders(),
      body: JSON.stringify({
        name:     name.trim(),
        email:    email.trim(),
        category: category || 'GENERAL INQUIRY',
        subject:  subject.trim(),
        message:  message.trim(),
        status:   'open',
      }),
    });

    if (!r.ok) {
      const e = await r.json();
      console.error('Supabase ticket error:', e);
      return res.status(500).json({ error: 'Failed to save ticket' });
    }

    const [ticket] = await r.json();
    const ticketId = ticket?.id || 'N/A';

    // Send emails (non-blocking — don't fail the request if email fails)
    sendEmail(email, `We received your message — ${subject}`, ticketConfirmHtml(name, ticketId, subject)).catch(console.warn);
    sendEmail(ADMIN_EMAIL, `[Ticket] ${category} — ${subject}`, adminAlertHtml(name, email, category, subject, message, ticketId)).catch(console.warn);

    return res.status(200).json({ success: true, ticket });
  }

  // ── PATCH — update ticket status (admin) ────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });

    const r = await fetch(`${SB_URL}/rest/v1/tickets?id=eq.${id}`, {
      method:  'PATCH',
      headers: sbHeaders(),
      body:    JSON.stringify({ status }),
    });
    if (!r.ok) {
      const e = await r.json();
      return res.status(500).json({ error: e?.message || 'Failed to update ticket' });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
