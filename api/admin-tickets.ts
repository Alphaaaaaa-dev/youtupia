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

  // ── GET — fetch all tickets newest first ──────────────────────────────
  if (req.method === 'GET') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/tickets?order=created_at.desc&select=*`, { headers });
    if (!r.ok) {
      const e = await r.json();
      return res.status(500).json({ error: e?.message || 'Failed to fetch tickets' });
    }
    const tickets = await r.json();
    return res.status(200).json({ tickets });
  }

  // ── PATCH — update ticket status ──────────────────────────────────────
  if (req.method === 'PATCH') {
    const { id, status } = req.body || {};
    if (!id || !status) return res.status(400).json({ error: 'Missing id or status' });

    const r = await fetch(`${SUPABASE_URL}/rest/v1/tickets?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...headers, Prefer: 'return=representation' },
      body: JSON.stringify({ status }),
    });
    if (!r.ok) {
      const e = await r.json();
      return res.status(500).json({ error: e?.message || 'Failed to update ticket' });
    }
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
