import type { VercelRequest, VercelResponse } from '@vercel/node';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const keyForRead = () => SUPABASE_ANON_KEY || SUPABASE_SERVICE_KEY!;
const keyForWrite = () => SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY!;

const sbHeaders = (write = false) => ({
  'Content-Type': 'application/json',
  apikey: write ? keyForWrite() : keyForRead(),
  Authorization: `Bearer ${write ? keyForWrite() : keyForRead()}`,
  Prefer: 'return=representation',
});

/* ── helpers ── */
async function getPolls() {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/yt_polls?order=created_at.desc&select=*`, {
    headers: sbHeaders(),
  });
  if (!r.ok) return [];
  return await r.json();
}

async function getOptions(pollId?: string) {
  const filter = pollId
    ? `?poll_id=eq.${pollId}&order=sort_order.asc&select=*`
    : `?order=sort_order.asc&select=*`;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/yt_poll_options${filter}`, {
    headers: sbHeaders(),
  });
  if (!r.ok) return [];
  return await r.json();
}

async function getVoteCounts(pollId?: string) {
  const filter = pollId
    ? `?poll_id=eq.${pollId}&select=option_id`
    : `?select=option_id,poll_id`;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/yt_votes${filter}`, {
    headers: sbHeaders(),
  });
  if (!r.ok) return {};
  const rows: Array<{ option_id: string; poll_id?: string }> = await r.json();
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.option_id] = (counts[row.option_id] || 0) + 1;
  }
  return counts;
}

// Check if voting tables exist
async function tablesExist(): Promise<boolean> {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/yt_polls?select=id&limit=1`,
    { headers: sbHeaders() }
  );
  return r.ok;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!SUPABASE_URL || (!SUPABASE_ANON_KEY && !SUPABASE_SERVICE_KEY)) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { action } = req.query as Record<string, string>;

  /* ── GET /api/drop-votes — list all polls with options + counts ── */
  if (req.method === 'GET' && !action) {
    try {
      // Check if tables exist first
      const exists = await tablesExist();
      if (!exists) {
        // Return empty state instead of error — admin dashboard handles this gracefully
        return res.status(200).json({
          polls: [],
          options: [],
          counts: {},
          totalVotes: 0,
          tablesExist: false,
        });
      }

      const polls = await getPolls();
      const options = await getOptions();
      const counts = await getVoteCounts();
      const totalVotes = Object.values(counts).reduce((s: number, n: number) => s + n, 0);

      return res.status(200).json({
        polls,
        options,
        counts,
        totalVotes,
        tablesExist: true,
      });
    } catch (err) {
      console.error('drop-votes GET error:', err);
      return res.status(200).json({
        polls: [],
        options: [],
        counts: {},
        totalVotes: 0,
        tablesExist: false,
      });
    }
  }

  /* ── POST /api/drop-votes?action=vote — cast a vote ── */
  if (req.method === 'POST' && action === 'vote') {
    try {
      const { optionId, pollId, userKey } = req.body || {};
      if (!optionId || !pollId) return res.status(400).json({ error: 'Missing optionId or pollId' });

      // Check if user already voted on this poll
      if (userKey) {
        const checkR = await fetch(
          `${SUPABASE_URL}/rest/v1/yt_votes?poll_id=eq.${pollId}&user_key=eq.${encodeURIComponent(userKey)}&select=id`,
          { headers: sbHeaders() }
        );
        if (checkR.ok) {
          const existing = await checkR.json();
          if (existing.length > 0) return res.status(400).json({ error: 'Already voted' });
        }
      }

      const voteRes = await fetch(`${SUPABASE_URL}/rest/v1/yt_votes`, {
        method: 'POST',
        headers: { ...sbHeaders(true), Prefer: 'return=minimal' },
        body: JSON.stringify({ poll_id: pollId, option_id: optionId, user_key: userKey || null }),
      });

      if (!voteRes.ok) {
        const e = await voteRes.json();
        return res.status(500).json({ error: e?.message || 'Vote failed' });
      }

      const counts = await getVoteCounts(pollId);
      const totalVotes = Object.values(counts).reduce((s: number, n: number) => s + n, 0);
      return res.status(200).json({ counts, totalVotes });
    } catch (err) {
      console.error('drop-votes vote error:', err);
      return res.status(500).json({ error: 'Vote failed' });
    }
  }

  /* ── POST /api/drop-votes?action=create_poll ── */
  if (req.method === 'POST' && action === 'create_poll') {
    try {
      const { title, description, options, active } = req.body || {};
      if (!title || !Array.isArray(options) || options.length < 2) {
        return res.status(400).json({ error: 'title and at least 2 options required' });
      }

      const pollR = await fetch(`${SUPABASE_URL}/rest/v1/yt_polls`, {
        method: 'POST',
        headers: sbHeaders(true),
        body: JSON.stringify({
          title,
          description: description || '',
          active: active !== false,
        }),
      });

      if (!pollR.ok) {
        const e = await pollR.json();
        return res.status(500).json({ error: e?.message || 'Failed to create poll' });
      }

      const [poll] = await pollR.json();
      if (!poll?.id) {
        return res.status(500).json({ error: 'Poll created but no ID returned' });
      }

      // Insert options one by one to preserve order
      for (let i = 0; i < options.length; i++) {
        await fetch(`${SUPABASE_URL}/rest/v1/yt_poll_options`, {
          method: 'POST',
          headers: { ...sbHeaders(true), Prefer: 'return=minimal' },
          body: JSON.stringify({
            poll_id: poll.id,
            label: options[i],
            sort_order: i,
          }),
        });
      }

      return res.status(200).json({ success: true, poll });
    } catch (err) {
      console.error('create_poll error:', err);
      return res.status(500).json({ error: 'Failed to create poll' });
    }
  }

  /* ── PATCH /api/drop-votes?action=update_poll ── */
  if (req.method === 'PATCH' && action === 'update_poll') {
    try {
      const { pollId, active, title, description } = req.body || {};
      if (!pollId) return res.status(400).json({ error: 'Missing pollId' });

      const updates: any = {};
      if (active !== undefined) updates.active = active;
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;

      const r = await fetch(`${SUPABASE_URL}/rest/v1/yt_polls?id=eq.${pollId}`, {
        method: 'PATCH',
        headers: { ...sbHeaders(true), Prefer: 'return=minimal' },
        body: JSON.stringify(updates),
      });

      if (!r.ok) {
        const e = await r.json();
        return res.status(500).json({ error: e?.message || 'Failed to update poll' });
      }

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to update poll' });
    }
  }

  /* ── PATCH /api/drop-votes?action=set_count — admin: override vote count ── */
  if (req.method === 'PATCH' && action === 'set_count') {
    try {
      const { optionId, pollId, count } = req.body || {};
      if (!optionId || !pollId) return res.status(400).json({ error: 'Missing optionId or pollId' });

      // Delete existing votes for this option
      await fetch(`${SUPABASE_URL}/rest/v1/yt_votes?option_id=eq.${optionId}&poll_id=eq.${pollId}`, {
        method: 'DELETE',
        headers: { ...sbHeaders(true), Prefer: 'return=minimal' },
      });

      // Insert synthetic votes
      const targetCount = Math.max(0, parseInt(count) || 0);
      if (targetCount > 0) {
        const BATCH_SIZE = 100;
        const rows = Array.from({ length: targetCount }, (_, i) => ({
          poll_id: pollId,
          option_id: optionId,
          user_key: `admin_seed_${i}_${Date.now()}`,
        }));

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          await fetch(`${SUPABASE_URL}/rest/v1/yt_votes`, {
            method: 'POST',
            headers: { ...sbHeaders(true), Prefer: 'return=minimal' },
            body: JSON.stringify(rows.slice(i, i + BATCH_SIZE)),
          });
        }
      }

      const counts = await getVoteCounts(pollId);
      return res.status(200).json({ success: true, counts });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to set count' });
    }
  }

  /* ── DELETE /api/drop-votes?action=reset_poll ── */
  if (req.method === 'DELETE' && action === 'reset_poll') {
    try {
      const { pollId } = req.body || {};
      if (!pollId) return res.status(400).json({ error: 'Missing pollId' });

      await fetch(`${SUPABASE_URL}/rest/v1/yt_votes?poll_id=eq.${pollId}`, {
        method: 'DELETE',
        headers: { ...sbHeaders(true), Prefer: 'return=minimal' },
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to reset votes' });
    }
  }

  /* ── DELETE /api/drop-votes?action=delete_poll ── */
  if (req.method === 'DELETE' && action === 'delete_poll') {
    try {
      const { pollId } = req.body || {};
      if (!pollId) return res.status(400).json({ error: 'Missing pollId' });

      // Delete in order: votes → options → poll (cascade handles it but be explicit)
      await fetch(`${SUPABASE_URL}/rest/v1/yt_votes?poll_id=eq.${pollId}`, {
        method: 'DELETE',
        headers: { ...sbHeaders(true), Prefer: 'return=minimal' },
      });
      await fetch(`${SUPABASE_URL}/rest/v1/yt_poll_options?poll_id=eq.${pollId}`, {
        method: 'DELETE',
        headers: { ...sbHeaders(true), Prefer: 'return=minimal' },
      });
      await fetch(`${SUPABASE_URL}/rest/v1/yt_polls?id=eq.${pollId}`, {
        method: 'DELETE',
        headers: { ...sbHeaders(true), Prefer: 'return=minimal' },
      });

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to delete poll' });
    }
  }

  /* ── Legacy POST (no action) — old vote format ── */
  if (req.method === 'POST' && !action) {
    const { optionId, userKey } = req.body || {};
    if (!optionId) return res.status(400).json({ error: 'Missing optionId' });

    try {
      await fetch(`${SUPABASE_URL}/rest/v1/yt_votes`, {
        method: 'POST',
        headers: { ...sbHeaders(true), Prefer: 'return=minimal' },
        body: JSON.stringify({ option_id: String(optionId), user_key: userKey || null }),
      });
      const counts = await getVoteCounts();
      return res.status(200).json({ counts });
    } catch (err) {
      return res.status(500).json({ error: 'Vote failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
