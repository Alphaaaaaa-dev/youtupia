import type { VercelRequest, VercelResponse } from '@vercel/node';

const SB_URL = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SB_KEY = process.env.SUPABASE_SERVICE_KEY!;

function sbHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: SB_KEY,
    Authorization: `Bearer ${SB_KEY}`,
  };
}

async function fetchTable(table: string): Promise<any[]> {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?select=*`, {
    headers: sbHeaders(),
  });
  if (!r.ok) {
    console.error(`[store-init] ${table} failed ${r.status}:`, await r.text());
    return [];
  }
  const rows: any[] = await r.json();
  if (!Array.isArray(rows)) return [];
  // Unwrap payload wrapper
  return rows.map((row: any) =>
    row.payload && typeof row.payload === 'object'
      ? { ...row.payload, id: row.id }
      : row
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  if (!SB_URL || !SB_KEY) {
    return res.status(500).json({ error: 'Missing env vars' });
  }

  try {
    // Fire all 3 table fetches simultaneously inside ONE cold start
    const [products, series, creators] = await Promise.all([
      fetchTable('yt_products'),
      fetchTable('yt_series'),
      fetchTable('yt_creators'),
    ]);

    console.log(`[store-init] loaded products=${products.length} series=${series.length} creators=${creators.length}`);

    // ── CDN caching ──────────────────────────────────────────────────────────
    // Vercel edge serves this from a node close to the user (India) after first hit.
    // s-maxage=60  → CDN caches for 60 seconds (fresh enough for a merch store)
    // stale-while-revalidate=300 → CDN keeps serving stale while fetching fresh
    // This means: after the first visitor, everyone else gets ~20ms response
    // from Vercel's Mumbai/Singapore edge instead of hitting Supabase at all.
    res.setHeader(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    return res.status(200).json({ products, series, creators });

  } catch (err: any) {
    console.error('[store-init] Unhandled error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
