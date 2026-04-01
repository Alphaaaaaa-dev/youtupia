import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

type Counts = Record<string, number>;

const countBy = (rows: Array<{ option_id?: string }>) => {
  const next: Counts = {};
  for (const r of rows) {
    const k = r.option_id;
    if (!k) continue;
    next[k] = (next[k] || 0) + 1;
  }
  return next;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_KEY)) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const keyForRead = SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY!;
  const keyForWrite = SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY!;

  const getCounts = async (): Promise<Counts> => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/drop_votes?select=option_id`, {
      headers: {
        apikey: keyForRead,
        Authorization: `Bearer ${keyForRead}`,
      },
    });

    if (!response.ok) throw new Error('Failed to load votes');
    const data = (await response.json()) as Array<{ option_id?: string }>;
    return countBy(data || []);
  };

  try {
    if (req.method === 'GET') {
      const counts = await getCounts();
      const totalVotes = Object.values(counts).reduce((s, n) => s + n, 0);
      return res.status(200).json({ counts, totalVotes });
    }

    if (req.method === 'POST') {
      const { optionId, userKey } = req.body || {};
      if (!optionId) return res.status(400).json({ error: 'Missing optionId' });

      await fetch(`${SUPABASE_URL}/rest/v1/drop_votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: keyForWrite,
          Authorization: `Bearer ${keyForWrite}`,
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          option_id: String(optionId),
          user_key: userKey ? String(userKey) : null,
        }),
      });

      const counts = await getCounts();
      return res.status(200).json({ counts });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Voting backend error' });
  }
}

