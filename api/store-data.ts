import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const headers = () => ({
  'Content-Type': 'application/json',
  apikey: SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  Prefer: 'return=representation',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  const { table } = req.query as { table: string };
  const ALLOWED_TABLES = ['yt_products', 'yt_series', 'yt_drops', 'yt_creators'];

  if (!table || !ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: 'Invalid table. Allowed: ' + ALLOWED_TABLES.join(', ') });
  }

  try {
    // ── GET all rows ──────────────────────────────────────────────────────
    if (req.method === 'GET') {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*`, {
        headers: headers(),
      });
      if (!r.ok) {
        const e = await r.json();
        return res.status(500).json({ error: e?.message || 'Fetch failed' });
      }
      const data = await r.json();
      return res.status(200).json({ data });
    }

    // ── POST — upsert entire array (replace all) ──────────────────────────
    if (req.method === 'POST') {
      const { rows } = req.body || {};
      if (!Array.isArray(rows)) {
        return res.status(400).json({ error: 'rows must be an array' });
      }

      // Delete all existing rows first, then insert fresh
      const del = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=neq.NEVER_MATCH_THIS_PLACEHOLDER`, {
        method: 'DELETE',
        headers: headers(),
      });

      // Actually delete all — use a filter that matches everything
      await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=gte.0`, {
        method: 'DELETE',
        headers: headers(),
      });

      // Fallback: delete with no filter (requires RLS to allow)
      await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'DELETE',
        headers: { ...headers(), 'Content-Range': '*' },
      });

      if (rows.length === 0) {
        return res.status(200).json({ data: [] });
      }

      const ins = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...headers(), Prefer: 'return=representation' },
        body: JSON.stringify(rows),
      });

      if (!ins.ok) {
        const e = await ins.json();
        return res.status(500).json({ error: e?.message || 'Insert failed', detail: e });
      }

      const data = await ins.json();
      return res.status(200).json({ data });
    }

    // ── PUT — upsert single row ──────────────────────────────────────────
    if (req.method === 'PUT') {
      const { row } = req.body || {};
      if (!row || !row.id) {
        return res.status(400).json({ error: 'row with id required' });
      }

      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(row),
      });

      if (!r.ok) {
        const e = await r.json();
        return res.status(500).json({ error: e?.message || 'Upsert failed' });
      }

      const data = await r.json();
      return res.status(200).json({ data });
    }

    // ── DELETE single row ────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });

      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: headers(),
      });

      if (!r.ok) {
        const e = await r.json();
        return res.status(500).json({ error: e?.message || 'Delete failed' });
      }

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('store-data error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
