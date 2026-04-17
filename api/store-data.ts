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
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=created_at.asc`, {
        headers: headers(),
      });
      if (!r.ok) {
        const e = await r.json();
        return res.status(500).json({ error: e?.message || 'Fetch failed' });
      }
      const rows = await r.json();
      // Unwrap payload if present, otherwise return row as-is
      const data = (rows || []).map((row: any) => {
        if (row.payload && typeof row.payload === 'object') {
          // Merge: payload fields take precedence, but keep id from row
          return { ...row.payload, id: row.id };
        }
        return row;
      });
      return res.status(200).json({ data });
    }

    // ── POST — upsert entire array (bulk save) ────────────────────────────
    if (req.method === 'POST') {
      const { rows } = req.body || {};
      if (!Array.isArray(rows)) {
        return res.status(400).json({ error: 'rows must be an array' });
      }

      if (rows.length === 0) {
        // Delete all rows
        await fetch(
          `${SUPABASE_URL}/rest/v1/${table}?id=not.is.null`,
          { method: 'DELETE', headers: headers() }
        );
        return res.status(200).json({ data: [] });
      }

      // Each row: { id, payload } where payload is the full product object
      const dbRows = rows.map((row: any) => ({
        id: row.id,
        payload: row.payload || row, // support both wrapped and unwrapped
      }));

      const ins = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...headers(),
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(dbRows),
      });

      if (!ins.ok) {
        const e = await ins.json();
        return res.status(500).json({ error: e?.message || 'Upsert failed', detail: e });
      }

      const saved = await ins.json();
      // Return unwrapped data
      const data = (saved || []).map((row: any) => {
        if (row.payload && typeof row.payload === 'object') {
          return { ...row.payload, id: row.id };
        }
        return row;
      });
      return res.status(200).json({ data });
    }

    // ── PUT — upsert/update a SINGLE row (fast, targeted) ────────────────
    if (req.method === 'PUT') {
      const { row } = req.body || {};
      if (!row || !row.id) {
        return res.status(400).json({ error: 'row with id required' });
      }

      const dbRow = {
        id: row.id,
        payload: row.payload || row,
      };

      // Try PATCH first (update existing)
      const patchRes = await fetch(
        `${SUPABASE_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(row.id)}`,
        {
          method: 'PATCH',
          headers: { ...headers(), Prefer: 'return=representation' },
          body: JSON.stringify(dbRow),
        }
      );

      if (!patchRes.ok) {
        const e = await patchRes.json();
        return res.status(500).json({ error: e?.message || 'Update failed' });
      }

      const patched = await patchRes.json();

      // If no rows were updated (new record), INSERT
      if (!patched || patched.length === 0) {
        const insRes = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            ...headers(),
            Prefer: 'resolution=merge-duplicates,return=representation',
          },
          body: JSON.stringify(dbRow),
        });
        if (!insRes.ok) {
          const e = await insRes.json();
          return res.status(500).json({ error: e?.message || 'Insert failed' });
        }
        const inserted = await insRes.json();
        const data = (inserted || []).map((r: any) =>
          r.payload && typeof r.payload === 'object' ? { ...r.payload, id: r.id } : r
        );
        return res.status(200).json({ data });
      }

      const data = patched.map((r: any) =>
        r.payload && typeof r.payload === 'object' ? { ...r.payload, id: r.id } : r
      );
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
