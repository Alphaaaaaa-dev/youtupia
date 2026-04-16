```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'Youtupia <noreply@youtupia.in>';

const orderConfirmEmail = (
  name: string,
  orderId: string,
  items: Array<{ product: { name: string; price: number }; size: string; quantity: number }>,
  total: number,
  address: string,
  paymentMethod: string,
) => `
<!DOCTYPE html>
<html>
<body style="font-family:Arial;background:#0a0a0a;color:white;padding:30px">
<h2 style="color:#22c55e">Order Confirmed 🎉</h2>
<p>Hi ${name}, your order <strong>${orderId}</strong> is confirmed.</p>

<h3>Items</h3>
${items.map(i => `
<div>
${i.product.name} · Size ${i.size} · Qty ${i.quantity}
<strong>₹${(i.product.price * i.quantity).toLocaleString()}</strong>
</div>
`).join('')}

<hr/>

<p><strong>Total:</strong> ₹${total.toLocaleString()}</p>
<p><strong>Delivery Address:</strong> ${address}</p>
<p><strong>Payment:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</p>

</body>
</html>
`;

export default async function handler(req: VercelRequest, res: VercelResponse) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {

    const { order, userId } = req.body;

    if (!order || !order.id) {
      return res.status(400).json({ error: 'Missing order data' });
    }

    console.log('Saving order:', order.id, 'userId:', userId);

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: order.id,
        user_id: userId ?? null,
        items: order.items,
        total: order.total,
        status: order.status || 'processing',
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        customer_phone: order.customerPhone,
        address: order.address,
        payment_method: order.paymentMethod,
        payment_id: order.paymentId || null,
        discount_code: order.discountCode || null,
        discount_amount: order.discountAmount || null,
        cod_charge: order.codCharge || null,
        tracking_id: order.trackingId || null,
        tracking_url: order.trackingUrl || null,
        notes: order.notes || null,
        cancel_reason: order.cancelReason || null
      })
    });

    if (!insertRes.ok) {

      const err = await insertRes.json();
      console.error('Supabase insert error:', err);

      if (err?.code === '23505') {
        return res.status(200).json({ success: true, note: 'order already exists' });
      }

      return res.status(500).json({ error: 'Failed to save order', detail: err });
    }

    const rows = await insertRes.json();
    const savedOrder = Array.isArray(rows) ? rows[0] : rows;

    if (RESEND_API_KEY && order.customerEmail) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [order.customerEmail],
            subject: `Order Confirmed — ${order.id}`,
            html: orderConfirmEmail(
              order.customerName,
              order.id,
              order.items,
              order.total,
              order.address,
              order.paymentMethod
            )
          })
        });
      } catch (emailErr) {
        console.error('Email send failed:', emailErr);
      }
    }

    return res.status(200).json({
      success: true,
      order: savedOrder
    });

  } catch (err) {
    console.error('Save order error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```
