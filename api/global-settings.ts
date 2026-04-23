import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SB_URL = (process.env.SUPABASE_URL || "").replace(/\/$/, "");

const headers = () => ({
  'Content-Type': 'application/json',
  apikey: SUPABASE_SERVICE_KEY!,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  Prefer: 'return=representation',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY)
    return res.status(500).json({ error: 'Missing env vars' });

  const { key } = req.query as { key: string };
  if (!key) return res.status(400).json({ error: 'key param required' });

  // ── GET — fetch a setting by key ─────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const r = await fetch(
        `${SB_URL}/rest/v1/yt_settings?key=eq.${encodeURIComponent(key)}&select=*`,
        { headers: headers() }
      );
      if (!r.ok) return res.status(200).json({ value: null });
      const rows = await r.json();
      return res.status(200).json({ value: rows?.[0]?.value ?? null });
    } catch {
      return res.status(200).json({ value: null });
    }
  }

  // ── POST — upsert a setting ───────────────────────────────────────────────
  if (req.method === 'POST') {
    const { value } = req.body || {};
    try {
      const r = await fetch(`${SB_URL}/rest/v1/yt_settings`, {
        method: 'POST',
        headers: { ...headers(), Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify({ key, value }),
      });
      if (!r.ok) {
        const e = await r.json();
        return res.status(500).json({ error: e?.message || 'Failed to save setting' });
      }
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('global-settings error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
