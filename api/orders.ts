import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');

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
    userId:         o.user_id,
    createdAt:      o.created_at,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: 'Missing env vars' });

  // ── GET /api/orders  ────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const userId = req.query.userId as string | undefined;

    const url = userId
      ? `${SB_URL}/rest/v1/orders?user_id=eq.${userId}&order=created_at.desc&select=*`
      : `${SB_URL}/rest/v1/orders?order=created_at.desc&select=*`;

    try {
      const r = await fetch(url, { headers: headers() });
      if (!r.ok) {
        const e = await r.json();
        return res.status(500).json({ error: e?.message || 'Failed to fetch orders' });
      }
      const rows = await r.json();
      return res.status(200).json({ orders: (rows || []).map(mapOrder) });
    } catch (err: any) {
      console.error('GET orders error:', err);
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  }

  // ── POST /api/orders  ───────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { order, userId } = req.body || {};
    if (!order) return res.status(400).json({ error: 'Order data missing' });

    const orderData = {
      id:              order.id,
      user_id:         userId || order.userId || null,
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
      created_at:      order.createdAt || new Date().toISOString(),
    };

    try {
      const r = await fetch(`${SB_URL}/rest/v1/orders`, {
        method:  'POST',
        headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=representation' },
        body:    JSON.stringify(orderData),
      });
      if (!r.ok) {
        const e = await r.json();
        console.error('Supabase insert error:', e);
        return res.status(500).json({ error: e?.message || 'Failed to save order' });
      }
      const data = await r.json();
      return res.status(200).json({ success: true, order: data?.[0] ? mapOrder(data[0]) : null });
    } catch (err: any) {
      console.error('POST orders error:', err);
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  }

  // ── PATCH /api/orders  ──────────────────────────────────────────────────
  if (req.method === 'PATCH') {
    // Support both { id, updates: {...} } and { id, status, trackingId, ... } flat formats
    const id = req.body?.id || req.body?.orderId;
    // Accept updates from a nested `updates` key OR directly from the body
    const updates = req.body?.updates || req.body;

    if (!id) return res.status(400).json({ error: 'Missing order id' });

    const dbUpdates: any = {};
    if (updates.status       !== undefined) dbUpdates.status        = updates.status;
    if (updates.trackingId   !== undefined) dbUpdates.tracking_id   = updates.trackingId;
    if (updates.trackingUrl  !== undefined) dbUpdates.tracking_url  = updates.trackingUrl;
    if (updates.notes        !== undefined) dbUpdates.notes         = updates.notes;
    if (updates.cancelReason !== undefined) dbUpdates.cancel_reason = updates.cancelReason;
    // Also accept snake_case directly (in case sent that way)
    if (updates.tracking_id  !== undefined) dbUpdates.tracking_id   = updates.tracking_id;
    if (updates.tracking_url !== undefined) dbUpdates.tracking_url  = updates.tracking_url;
    if (updates.cancel_reason !== undefined) dbUpdates.cancel_reason = updates.cancel_reason;

    if (Object.keys(dbUpdates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    try {
      const r = await fetch(`${SB_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`, {
        method:  'PATCH',
        headers: { ...headers(), Prefer: 'return=representation' },
        body:    JSON.stringify(dbUpdates),
      });
      if (!r.ok) {
        const e = await r.json();
        return res.status(500).json({ error: e?.message || 'Failed to update order' });
      }
      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('PATCH orders error:', err);
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  }

  // ── DELETE /api/orders  ─────────────────────────────────────────────────
  if (req.method === 'DELETE') {
    const id = req.body?.id;
    if (!id) return res.status(400).json({ error: 'Missing order id' });

    try {
      const r = await fetch(`${SB_URL}/rest/v1/orders?id=eq.${encodeURIComponent(id)}`, {
        method:  'DELETE',
        headers: headers(),
      });
      if (!r.ok) {
        const e = await r.json();
        return res.status(500).json({ error: e?.message || 'Failed to delete order' });
      }
      return res.status(200).json({ success: true });
    } catch (err: any) {
      console.error('DELETE orders error:', err);
      return res.status(500).json({ error: err.message || 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
