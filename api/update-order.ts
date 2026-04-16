import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: 'Missing env vars' });

  const { orderId, updates } = req.body || {};
  if (!orderId || !updates) return res.status(400).json({ error: 'orderId and updates required' });

  const headers = {
    'Content-Type': 'application/json',
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    Prefer: 'return=representation',
  };

  // Map camelCase → snake_case
  const dbUpdates: any = {};
  if (updates.status        !== undefined) dbUpdates.status         = updates.status;
  if (updates.trackingId    !== undefined) dbUpdates.tracking_id    = updates.trackingId;
  if (updates.trackingUrl   !== undefined) dbUpdates.tracking_url   = updates.trackingUrl;
  if (updates.notes         !== undefined) dbUpdates.notes          = updates.notes;
  if (updates.cancelReason  !== undefined) dbUpdates.cancel_reason  = updates.cancelReason;

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(dbUpdates),
    });

    if (!r.ok) {
      const e = await r.json();
      return res.status(500).json({ error: e?.message || 'Failed to update order' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('update-order error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
