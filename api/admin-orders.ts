import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: 'Missing env vars' });

  const headers = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  };

  // ── GET — fetch ALL orders newest first ──────────────────────────────────
  if (req.method === 'GET') {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/orders?order=created_at.desc&select=*`,
      { headers }
    );
    if (!r.ok) {
      const e = await r.json();
      return res.status(500).json({ error: e?.message || 'Failed to fetch orders' });
    }
    const rows = await r.json();

    // Map DB snake_case → camelCase for frontend Order interface
    const orders = (rows || []).map((o: any) => ({
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
    }));

    return res.status(200).json({ orders });
  }

  // ── PATCH — update order fields ───────────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, ...updates } = req.body || {};
    if (!id) return res.status(400).json({ error: 'Missing order id' });

    // Map camelCase → snake_case for DB
    const dbUpdates: any = {};
    if (updates.status        !== undefined) dbUpdates.status         = updates.status;
    if (updates.trackingId    !== undefined) dbUpdates.tracking_id    = updates.trackingId;
    if (updates.trackingUrl   !== undefined) dbUpdates.tracking_url   = updates.trackingUrl;
    if (updates.notes         !== undefined) dbUpdates.notes          = updates.notes;
    if (updates.cancelReason  !== undefined) dbUpdates.cancel_reason  = updates.cancelReason;

    const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify(dbUpdates),
    });
    if (!r.ok) {
      const e = await r.json();
      return res.status(500).json({ error: e?.message || 'Failed to update order' });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
