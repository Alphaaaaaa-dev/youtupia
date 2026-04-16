import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

function headers() {
  return {
    'Content-Type': 'application/json',
    apikey:         SUPABASE_SERVICE_KEY!,
    Authorization:  `Bearer ${SUPABASE_SERVICE_KEY}`,
  };
}

function mapOrder(o: any) {
  return {
    id:             o.id,
    items:          o.items,
    total:          o.total,
    status:         o.status,
    customerName:   o.customer_name,
    customerEmail:  o.customer_email,
    customerPhone:  o.customer_phone,
    address:        o.address,
    paymentMethod:  o.payment_method,
    paymentId:      o.payment_id,
    discountCode:   o.discount_code,
    discountAmount: o.discount_amount,
    trackingId:     o.tracking_id,
    trackingUrl:    o.tracking_url,
    notes:          o.notes,
    cancelReason:   o.cancel_reason,
    codCharge:      o.cod_charge,
    createdAt:      o.created_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: 'Missing env vars' });

  // ── GET /api/orders  ────────────────────────────────────────────────────
  // ?userId=xxx  → orders for that user
  // (no param)   → ALL orders (admin)
  if (req.method === 'GET') {
    const userId = req.query.userId as string | undefined;
    const filter = userId
      ? `?user_id=eq.${userId}&order=created_at.desc`
      : `?order=created_at.desc&select=*`;

    const r = await fetch(`${SUPABASE_URL}/rest/v1/orders${filter}`, { headers: headers() });
    if (!r.ok) {
      const e = await r.json();
      return res.status(500).json({ error: e?.message || 'Failed to fetch orders' });
    }
    const rows = await r.json();
    return res.status(200).json({ orders: (rows || []).map(mapOrder) });
  }

  // ── POST /api/orders  ───────────────────────────────────────────────────
  // Body: { order, userId }  → save a new order
  if (req.method === 'POST') {
    const { order, userId } = req.body || {};
    if (!order) return res.status(400).json({ error: 'Order data missing' });

    const orderData = {
      id:              order.id,
      user_id:         userId || null,
      items:           order.items,
      total:           order.total,
      status:          order.status || 'processing',
      customer_name:   order.customerName,
      customer_email:  order.customerEmail,
      customer_phone:  order.customerPhone,
      address:         order.address,
      payment_method:  order.paymentMethod,
      payment_id:      order.paymentId      || null,
      discount_code:   order.discountCode   || null,
      discount_amount: order.discountAmount || 0,
      cod_charge:      order.codCharge      || 0,
      tracking_id:     order.trackingId     || null,
      tracking_url:    order.trackingUrl    || null,
      notes:           order.notes          || null,
      cancel_reason:   order.cancelReason   || null,
      created_at:      new Date().toISOString(),
    };

    const r = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method:  'POST',
      headers: { ...headers(), Prefer: 'return=representation' },
      body:    JSON.stringify(orderData),
    });
    if (!r.ok) {
      const e = await r.json();
      console.error('Supabase insert error:', e);
      return res.status(500).json({ error: e?.message || 'Failed to save order' });
    }
    const data = await r.json();
    return res.status(200).json({ success: true, order: data?.[0] || null });
  }

  // ── PATCH /api/orders  ──────────────────────────────────────────────────
  // Body: { id, ...updates } OR { orderId, updates }  → update order fields
  if (req.method === 'PATCH') {
    // Support both call shapes used across the codebase
    const id      = req.body?.id || req.body?.orderId;
    const updates = req.body?.updates || req.body;

    if (!id) return res.status(400).json({ error: 'Missing order id' });

    // Map camelCase → snake_case
    const dbUpdates: any = {};
    if (updates.status       !== undefined) dbUpdates.status        = updates.status;
    if (updates.trackingId   !== undefined) dbUpdates.tracking_id   = updates.trackingId;
    if (updates.trackingUrl  !== undefined) dbUpdates.tracking_url  = updates.trackingUrl;
    if (updates.notes        !== undefined) dbUpdates.notes         = updates.notes;
    if (updates.cancelReason !== undefined) dbUpdates.cancel_reason = updates.cancelReason;

    const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
      method:  'PATCH',
      headers: { ...headers(), Prefer: 'return=representation' },
      body:    JSON.stringify(dbUpdates),
    });
    if (!r.ok) {
      const e = await r.json();
      return res.status(500).json({ error: e?.message || 'Failed to update order' });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
