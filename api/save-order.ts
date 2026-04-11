import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL        = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY      = process.env.RESEND_API_KEY;
const FROM_EMAIL          = process.env.FROM_EMAIL || 'Youtupia <noreply@youtupia.in>';

// ── Email: order confirmation ─────────────────────────────────────────────────
const orderConfirmEmail = (
  name: string,
  orderId: string,
  items: Array<{ product: { name: string; price: number }; size: string; quantity: number }>,
  total: number,
  address: string,
  paymentMethod: string,
) => `
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
            <img src="https://youtupia.in/favicon.ico" width="42" height="42" style="border-radius:10px;display:block;" alt="Youtupia" />
            <span style="color:#f1f5f9;font-size:24px;font-weight:900;letter-spacing:-0.5px;">Youtupia</span>
          </div>
          <p style="color:#475569;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:8px 0 0;">WEAR YOUR DREAMS</p>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 36px 28px;">
          <h2 style="color:#22c55e;font-size:20px;font-weight:800;margin:0 0 6px;text-align:center;">Order Confirmed! 🎉</h2>
          <p style="color:#64748b;font-size:14px;line-height:1.8;margin:0 0 24px;text-align:center;">
            Hey ${name}! Your order <strong style="color:#f1f5f9;">${orderId}</strong> is confirmed and being packed.
          </p>

          <!-- Items -->
          <div style="background:#0a0a0a;border-radius:12px;padding:16px;margin-bottom:20px;">
            <p style="color:#64748b;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;font-weight:700;">YOUR ITEMS</p>
            ${items.map(item => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #1a1a1a;">
              <div>
                <p style="color:#f1f5f9;font-size:13px;font-weight:600;margin:0 0 2px;">${item.product.name}</p>
                <p style="color:#475569;font-size:11px;margin:0;">Size: ${item.size} · Qty: ${item.quantity}</p>
              </div>
              <p style="color:#ff0000;font-size:13px;font-weight:700;margin:0;">₹${(item.product.price * item.quantity).toLocaleString()}</p>
            </div>`).join('')}
            <div style="display:flex;justify-content:space-between;padding-top:12px;">
              <strong style="color:#f1f5f9;font-size:15px;">Total</strong>
              <strong style="color:#ff0000;font-size:15px;">₹${total.toLocaleString()}</strong>
            </div>
          </div>

          <!-- Details -->
          <div style="background:#0a0a0a;border-radius:12px;padding:16px;margin-bottom:20px;">
            <p style="color:#64748b;font-size:10px;letter-spacing:3px;text-transform:uppercase;margin:0 0 10px;font-weight:700;">DELIVERY DETAILS</p>
            <p style="color:#94a3b8;font-size:13px;margin:0 0 6px;">📦 <strong style="color:#f1f5f9;">Address:</strong> ${address}</p>
            <p style="color:#94a3b8;font-size:13px;margin:0;">💳 <strong style="color:#f1f5f9;">Payment:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid via Razorpay'}</p>
          </div>

          <p style="color:#475569;font-size:12px;text-align:center;margin:0;line-height:1.7;">
            We'll send you tracking details via SMS once your order ships (usually within 1–2 business days).
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#0a0a0a;padding:20px 36px;text-align:center;border-top:1px solid #1a1a1a;">
          <p style="color:#1e293b;font-size:11px;margin:0 0 4px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">YOUTUPIA · WEAR YOUR DREAMS</p>
          <p style="color:#334155;font-size:11px;margin:0;">
            Questions? <a href="mailto:support@youtupia.in" style="color:#ff0000;text-decoration:none;">support@youtupia.in</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body></html>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: 'Server configuration error' });

  try {
    const { order, userId } = req.body;

    if (!order || !order.id)
      return res.status(400).json({ error: 'Missing order data' });

    // ── 1. Save order to Supabase ──────────────────────────────────────────
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        id:               order.id,
        user_id:          userId || null,
        items:            order.items,
        total:            order.total,
        status:           'processing',
        customer_name:    order.customerName,
        customer_email:   order.customerEmail,
        customer_phone:   order.customerPhone,
        address:          order.address,
        payment_method:   order.paymentMethod,
        payment_id:       order.paymentId || null,
        discount_code:    order.discountCode || null,
        discount_amount:  order.discountAmount || null,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.json();
      console.error('Supabase insert error:', err);
      return res.status(500).json({ error: 'Failed to save order' });
    }

    const [savedOrder] = await insertRes.json();

    // ── 2. Send confirmation email via Resend ─────────────────────────────
    if (RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [order.customerEmail],
          subject: `Order Confirmed — ${order.id} 🎉`,
          html: orderConfirmEmail(
            order.customerName,
            order.id,
            order.items,
            order.total,
            order.address,
            order.paymentMethod,
          ),
        }),
      });
    }

    return res.status(200).json({ success: true, order: savedOrder });

  } catch (err) {
    console.error('Save order error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
