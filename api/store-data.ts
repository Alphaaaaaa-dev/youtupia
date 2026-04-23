import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");

function headers() {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_SERVICE_KEY!,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    Prefer: 'return=representation',
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('Missing env vars: SUPABASE_URL or SUPABASE_SERVICE_KEY');
    return res.status(500).json({ error: 'Missing env vars' });
  }

  const { table } = req.query as { table: string };
  const ALLOWED_TABLES = ['yt_products', 'yt_series', 'yt_creators'];

  if (!table || !ALLOWED_TABLES.includes(table)) {
    return res.status(400).json({ error: 'Invalid table. Allowed: ' + ALLOWED_TABLES.join(', ') });
  }

  try {

    // ── GET — fetch all rows ────────────────────────────────────────────────
    if (req.method === 'GET') {
      const url = `${SB_URL}/rest/v1/${table}?select=*&order=updated_at.asc`;
      console.log(`[store-data] GET ${url}`);

      const r = await fetch(url, { headers: headers() });
      const responseText = await r.text();

      if (!r.ok) {
        console.error(`[store-data] GET failed ${r.status}:`, responseText);
        return res.status(500).json({ error: `Fetch failed: ${responseText}` });
      }

      const rows = JSON.parse(responseText);
      // Unwrap payload
      const data = (rows || []).map((row: any) => {
        if (row.payload && typeof row.payload === 'object') {
          return { ...row.payload, id: row.id };
        }
        return row;
      });

      console.log(`[store-data] GET ${table} returned ${data.length} rows`);
      return res.status(200).json({ data });
    }

    // ── POST — upsert ENTIRE array (bulk save / replace all) ───────────────
    if (req.method === 'POST') {
      const { rows } = req.body || {};
      if (!Array.isArray(rows)) {
        return res.status(400).json({ error: 'rows must be an array' });
      }

      console.log(`[store-data] POST bulk upsert ${table}: ${rows.length} rows`);

      // If empty array, delete all rows first
      if (rows.length === 0) {
        const delR = await fetch(
          `${SB_URL}/rest/v1/${table}?id=not.is.null`,
          { method: 'DELETE', headers: headers() }
        );
        if (!delR.ok) {
          const e = await delR.text();
          console.error('[store-data] DELETE all failed:', e);
          return res.status(500).json({ error: 'Delete failed: ' + e });
        }
        return res.status(200).json({ data: [] });
      }

      const dbRows = rows.map((row: any) => ({
        id: String(row.id),
        payload: row.payload !== undefined ? row.payload : row,
      }));

      const ins = await fetch(`${SB_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...headers(),
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(dbRows),
      });

      const insText = await ins.text();
      if (!ins.ok) {
        console.error(`[store-data] POST upsert failed ${ins.status}:`, insText);
        return res.status(500).json({ error: `Upsert failed: ${insText}` });
      }

      const saved = JSON.parse(insText);
      const data = (saved || []).map((row: any) => {
        if (row.payload && typeof row.payload === 'object') {
          return { ...row.payload, id: row.id };
        }
        return row;
      });

      console.log(`[store-data] POST bulk upsert ${table} saved ${data.length} rows`);
      return res.status(200).json({ data });
    }

    // ── PUT — upsert/update a SINGLE row ───────────────────────────────────
    if (req.method === 'PUT') {
      const { row } = req.body || {};
      if (!row || !row.id) {
        return res.status(400).json({ error: 'row with id required' });
      }

      const dbRow = {
        id: String(row.id),
        payload: row.payload !== undefined ? row.payload : row,
      };

      console.log(`[store-data] PUT upsert ${table} id=${dbRow.id}`);

      const upsertRes = await fetch(`${SB_URL}/rest/v1/${table}`, {
        method: 'POST',
        headers: {
          ...headers(),
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(dbRow),
      });

      const upsertText = await upsertRes.text();
      if (!upsertRes.ok) {
        console.error(`[store-data] PUT upsert failed ${upsertRes.status}:`, upsertText);
        return res.status(500).json({ error: `Upsert failed: ${upsertText}` });
      }

      const saved = JSON.parse(upsertText);
      const data = (saved || []).map((r: any) =>
        r.payload && typeof r.payload === 'object' ? { ...r.payload, id: r.id } : r
      );

      console.log(`[store-data] PUT upsert ${table} id=${dbRow.id} success`);
      return res.status(200).json({ data });
    }

    // ── DELETE — single row ─────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: 'id required' });

      console.log(`[store-data] DELETE ${table} id=${id}`);

      const r = await fetch(
        `${SB_URL}/rest/v1/${table}?id=eq.${encodeURIComponent(String(id))}`,
        { method: 'DELETE', headers: headers() }
      );

      if (!r.ok) {
        const e = await r.text();
        console.error('[store-data] DELETE failed:', e);
        return res.status(500).json({ error: `Delete failed: ${e}` });
      }

      console.log(`[store-data] DELETE ${table} id=${id} success`);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (err: any) {
    console.error('[store-data] Unhandled error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
