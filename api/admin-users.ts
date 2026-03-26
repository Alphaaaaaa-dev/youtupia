import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: 'Server config error' });
  }

  try {
    // Uses service role key to access auth.users
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ users: [] });
    }

    const data = await response.json();
    // Return only safe fields — no passwords or sensitive data
    const safeUsers = (data.users || []).map((u: any) => ({
      id: u.id,
      email: u.email,
      user_metadata: u.user_metadata,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
    }));

    return res.status(200).json({ users: safeUsers });
  } catch (err) {
    return res.status(500).json({ users: [] });
  }
}
