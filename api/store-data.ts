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

    // ── POST — upsert entire array (replace all) using UPSERT ─────────────
    // This is called when admin saves entire product list
    if (req.method === 'POST') {
      const { rows } = req.body || {};
      if (!Array.isArray(rows)) {
        return res.status(400).json({ error: 'rows must be an array' });
      }

      if (rows.length === 0) {
        // Delete all rows safely
        const del = await fetch(
          `${SUPABASE_URL}/rest/v1/${table}?id=not.is.null`,
          { method: 'DELETE', headers: headers() }
        );
        return res.status(200).json({ data: [] });
      }

      // Use upsert with merge-duplicates — much safer than delete+insert
      const ins = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...headers(),
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(rows),
      });

      if (!ins.ok) {
        const e = await ins.json();
        return res.status(500).json({ error: e?.message || 'Upsert failed', detail: e });
      }

      const data = await ins.json();
      return res.status(200).json({ data });
    }

    // ── PUT — upsert/update a SINGLE row ──────────────────────────────────
    // Used for individual product edits — FAST, targeted update
    if (req.method === 'PUT') {
      const { row } = req.body || {};
      if (!row || !row.id) {
        return res.status(400).json({ error: 'row with id required' });
      }

      // Try PATCH first (update existing)
      const patch = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(row.id)}`,
        {
          method: 'PATCH',
          headers: { ...headers(), Prefer: 'return=representation' },
          body: JSON.stringify(row),
        }
      );

      if (!patch.ok) {
        const e = await patch.json();
        return res.status(500).json({ error: e?.message || 'Update failed' });
      }

      const patched = await patch.json();

      // If no rows were updated (new record), INSERT instead
      if (!patched || patched.length === 0) {
        const ins = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: { ...headers(), Prefer: 'return=representation' },
          body: JSON.stringify(row),
        });
        if (!ins.ok) {
          const e = await ins.json();
          return res.status(500).json({ error: e?.message || 'Insert failed' });
        }
        const data = await ins.json();
        return res.status(200).json({ data });
      }

      return res.status(200).json({ data: patched });
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
