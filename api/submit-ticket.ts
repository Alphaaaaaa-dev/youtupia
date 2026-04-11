import type { VercelRequest, VercelResponse } from '@vercel/node';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL     = process.env.FROM_EMAIL || 'Youtupia <noreply@youtupia.in>';
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL || 'admin@youtupia.in';

// ── Email: ticket confirmation to customer ────────────────────────────────────
const ticketConfirmHtml = (name: string, ticketId: string, subject: string) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 16px;">
  <tr><td align="center">
    <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border-radius:18px;overflow:hidden;border:1px solid #222;">
      <tr><td style="background:linear-gradient(90deg,#ff0000,#cc0000);height:4px;"></td></tr>
      <tr>
        <td style="padding:32px 36px 24px;text-align:center;border-bottom:1px solid #1a1a1a;">
          <span style="color:#f1f5f9;font-size:24px;font-weight:900;letter-spacing:-0.5px;">Youtupia</span>
          <p style="color:#475569;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:8px 0 0;">WEAR YOUR DREAMS</p>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 36px 28px;">
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
            You can also reach us directly at <a href="mailto:support@youtupia.in" style="color:#ff0000;text-decoration:none;">support@youtupia.in</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#0a0a0a;padding:20px 36px;text-align:center;border-top:1px solid #1a1a1a;">
          <p style="color:#334155;font-size:11px;margin:0;">YOUTUPIA · WEAR YOUR DREAMS</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;

// ── Email: new ticket alert to admin ─────────────────────────────────────────
const adminAlertHtml = (
  name: string, email: string, category: string, subject: string, message: string, ticketId: string
) => `
<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, email, category, subject, message } = req.body;

    if (!name || !email || !subject || !message)
      return res.status(400).json({ error: 'Missing required fields' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY)
      return res.status(500).json({ error: 'Server configuration error' });

    // ── 1. Insert ticket into Supabase ─────────────────────────────────────
    const response = await fetch(`${SUPABASE_URL}/rest/v1/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        name:     name.trim(),
        email:    email.trim(),
        category: category || 'GENERAL INQUIRY',
        subject:  subject.trim(),
        message:  message.trim(),
        status:   'open',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to save ticket' });
    }

    const [ticket] = await response.json();
    const ticketId = ticket?.id || 'N/A';

    // ── 2. Send emails via Resend ──────────────────────────────────────────
    if (RESEND_API_KEY) {
      // Confirmation to customer
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: `We received your message — ${subject}`,
          html: ticketConfirmHtml(name, ticketId, subject),
        }),
      });

      // Alert to admin
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [ADMIN_EMAIL],
          subject: `[Ticket] ${category} — ${subject}`,
          html: adminAlertHtml(name, email, category, subject, message, ticketId),
        }),
      });
    }

    return res.status(200).json({ success: true, ticket });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
