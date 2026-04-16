import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server configuration error - missing env vars' });
  }

  try {
    const { order, userId } = req.body;

    if (!order) {
      return res.status(400).json({ error: 'Order data missing' });
    }

    const orderData = {
      id:             order.id,
      user_id:        userId || null,
      items:          order.items,
      total:          order.total,
      status:         order.status || 'pending',
      customer_name:  order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      address:        order.address,
      payment_method: order.paymentMethod,
      payment_id:     order.paymentId     || null,
      discount_code:  order.discountCode  || null,
      discount_amount:order.discountAmount|| 0,
      cod_charge:     order.codCharge     || 0,
      tracking_id:    order.trackingId    || null,
      tracking_url:   order.trackingUrl   || null,
      notes:          order.notes         || null,
      cancel_reason:  order.cancelReason  || null,
      created_at:     new Date().toISOString(),
    };

    const response = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey:          SUPABASE_SERVICE_KEY,
        Authorization:  `Bearer ${SUPABASE_SERVICE_KEY}`,
        Prefer:          'return=representation',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message || 'Failed to save order' });
    }

    const data = await response.json();

    return res.status(200).json({ success: true, order: data?.[0] || null });
  } catch (err: any) {
    console.error('Save order error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
