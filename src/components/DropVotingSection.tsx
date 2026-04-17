import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast as sonnerToast } from '@/components/ui/sonner';

const SESSION_ID_KEY = 'youtupia_session_id';
const VOTED_KEY_PREFIX = 'youtupia_voted_poll_';

const ensureSessionId = () => {
  try {
    const existing = localStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const id = 'sess_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
    localStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    return 'anonymous_' + Math.random().toString(16).slice(2);
  }
};

interface PollOption {
  id: string;
  poll_id: string;
  label: string;
  sort_order: number;
}

interface Poll {
  id: string;
  title: string;
  description?: string;
  active: boolean;
  created_at: string;
}

export default function DropVotingSection() {
  const { user } = useAuth();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  // Map of pollId -> optionId the user has voted for
  const [myVotes, setMyVotes] = useState<Record<string, string>>({});

  const loadVotedState = useCallback((loadedPolls: Poll[]) => {
    const votes: Record<string, string> = {};
    for (const poll of loadedPolls) {
      try {
        const stored = localStorage.getItem(VOTED_KEY_PREFIX + poll.id);
        if (stored) votes[poll.id] = stored;
      } catch {}
    }
    setMyVotes(votes);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/drop-votes');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      const fetchedPolls: Poll[] = (data.polls || []).filter((p: Poll) => p.active);
      setPolls(fetchedPolls);
      setOptions(data.options || []);
      setCounts(data.counts || {});
      loadVotedState(fetchedPolls);
    } catch {
      // silently degrade
    } finally {
      setLoading(false);
    }
  }, [loadVotedState]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVote = async (pollId: string, optionId: string) => {
    if (myVotes[pollId]) {
      sonnerToast.message('Already voted', { description: 'Come back when the next poll launches.' });
      return;
    }

    setVoting(optionId);
    const userKey = (user as any)?.id || ensureSessionId();

    try {
      const res = await fetch('/api/drop-votes?action=vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, optionId, userKey }),
      });

      if (!res.ok) {
        const err = await res.json();
        if (err.error === 'Already voted') {
          sonnerToast.message('Already voted', { description: 'Your vote is already counted.' });
          setMyVotes(prev => ({ ...prev, [pollId]: optionId }));
          try { localStorage.setItem(VOTED_KEY_PREFIX + pollId, optionId); } catch {}
          return;
        }
        throw new Error(err.error || 'Vote failed');
      }

      const data = await res.json();
      if (data.counts) setCounts(prev => ({ ...prev, ...data.counts }));

      setMyVotes(prev => ({ ...prev, [pollId]: optionId }));
      try { localStorage.setItem(VOTED_KEY_PREFIX + pollId, optionId); } catch {}
      sonnerToast.success('Vote submitted!', { description: 'Your voice shapes the next drop.' });
    } catch (err: any) {
      // Local fallback
      setCounts(prev => ({ ...prev, [optionId]: (prev[optionId] || 0) + 1 }));
      setMyVotes(prev => ({ ...prev, [pollId]: optionId }));
      try { localStorage.setItem(VOTED_KEY_PREFIX + pollId, optionId); } catch {}
      sonnerToast.success('Vote saved locally', { description: 'Backend unavailable — vote recorded.' });
    } finally {
      setVoting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg,rgba(255,0,0,0.06) 0%,rgba(255,0,0,0.02) 50%,rgba(0,0,0,0) 100%)', border: '1px solid rgba(255,0,0,0.15)', borderRadius: 24, padding: 24 }}>
        <Skeleton className="h-8 w-64 mb-4" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!polls.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {polls.map(poll => {
        const pollOptions = options.filter(o => o.poll_id === poll.id);
        const totalVotes = pollOptions.reduce((s, o) => s + (counts[o.id] || 0), 0);
        const myVote = myVotes[poll.id];

        return (
          <div
            key={poll.id}
            style={{ background: 'linear-gradient(135deg,rgba(255,0,0,0.06) 0%,rgba(255,0,0,0.02) 50%,rgba(0,0,0,0) 100%)', border: '1px solid rgba(255,0,0,0.15)', borderRadius: 24, padding: 24, overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ff0000' }}>Community Voting</div>
                <h2 style={{ fontSize: 26, fontWeight: 900, margin: '6px 0 0', letterSpacing: '-0.02em' }}>{poll.title}</h2>
                {poll.description && (
                  <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', marginTop: 6 }}>{poll.description}</p>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Total Votes</div>
                <div style={{ fontSize: 22, color: '#ff0000', fontWeight: 900, marginTop: 4 }}>{totalVotes.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12 }}>
              {pollOptions.map(option => {
                const chosen = myVote === option.id;
                const voteCount = counts[option.id] || 0;
                const pct = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                return (
                  <button
                    key={option.id}
                    onClick={() => handleVote(poll.id, option.id)}
                    disabled={Boolean(myVote) && !chosen}
                    style={{
                      textAlign: 'left', borderRadius: 18, border: `1px solid ${chosen ? 'rgba(255,0,0,0.35)' : 'hsl(var(--border))'}`,
                      background: chosen ? 'rgba(255,0,0,0.08)' : 'hsl(var(--card))',
                      padding: 16, cursor: myVote ? (chosen ? 'default' : 'not-allowed') : 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                      boxShadow: chosen ? '0 16px 48px rgba(255,0,0,0.12)' : 'none', position: 'relative', overflow: 'hidden',
                    }}
                    onMouseEnter={e => { if (myVote) return; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = chosen ? '0 16px 48px rgba(255,0,0,0.12)' : 'none'; }}
                  >
                    {/* Progress bar background */}
                    {myVote && (
                      <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', width: `${pct}%`, background: chosen ? '#ff0000' : 'rgba(255,255,255,0.15)', transition: 'width 0.5s ease', borderRadius: '0 2px 0 0' }} />
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                      <div>
                        <div style={{ fontWeight: 900, color: '#f1f5f9', fontSize: 14 }}>{option.label}</div>
                        {myVote && (
                          <div style={{ fontSize: 11, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>{pct}% of votes</div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: chosen ? '#ff0000' : 'hsl(var(--muted-foreground))' }}>Votes</div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: chosen ? '#ff0000' : 'hsl(var(--foreground))', marginTop: 4 }}>{voteCount.toLocaleString()}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 12 }}>
                      {chosen ? (
                        <span style={{ background: 'rgba(255,0,0,0.10)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: 999, padding: '5px 11px', color: '#ff0000', fontWeight: 900, fontSize: 11 }}>✓ Your choice</span>
                      ) : (
                        <span style={{ background: 'rgba(255,0,0,0.06)', border: '1px solid rgba(255,0,0,0.15)', borderRadius: 999, padding: '5px 11px', color: '#ff0000', fontWeight: 900, fontSize: 11 }}>
                          {voting === option.id ? 'Voting…' : myVote ? `${pct}%` : 'Vote'}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
