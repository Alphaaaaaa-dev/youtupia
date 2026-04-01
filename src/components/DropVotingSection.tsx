import { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast as sonnerToast } from '@/components/ui/sonner';

const SESSION_VOTE_KEY = 'youtupia_drop_vote';
const LOCAL_COUNTS_KEY = 'youtupia_drop_vote_counts';
const SESSION_ID_KEY = 'youtupia_session_id';

type VoteCounts = Record<string, number>;

const safeJSONParse = <T,>(v: string | null, fallback: T): T => {
  if (!v) return fallback;
  try {
    return JSON.parse(v) as T;
  } catch {
    return fallback;
  }
};

const ensureSessionId = () => {
  try {
    const existing = localStorage.getItem(SESSION_ID_KEY);
    if (existing) return existing;
    const id = 'sess_' + Math.random().toString(16).slice(2) + '_' + Date.now().toString(16);
    localStorage.setItem(SESSION_ID_KEY, id);
    return id;
  } catch {
    return 'anonymous';
  }
};

export default function DropVotingSection() {
  const { series } = useStore();
  const { user } = useAuth();

  const options = useMemo(() => series.slice(0, 6), [series]);

  const [myOption, setMyOption] = useState<string | null>(() => {
    const stored = safeJSONParse<{ optionId: string } | null>(localStorage.getItem(SESSION_VOTE_KEY), null);
    return stored?.optionId || null;
  });

  const [counts, setCounts] = useState<VoteCounts>({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  const totalVotes = Object.values(counts).reduce((s, n) => s + n, 0);

  const loadLocalCounts = () => {
    const local = safeJSONParse<VoteCounts>(localStorage.getItem(LOCAL_COUNTS_KEY), {});
    setCounts(local);
    setLoading(false);
  };

  const loadFromBackend = async () => {
    try {
      const res = await fetch('/api/drop-votes', { method: 'GET' });
      if (!res.ok) throw new Error('Backend votes unavailable');
      const data = await res.json();
      const next = (data?.counts || {}) as VoteCounts;
      setCounts(next);
      // Keep local cache in sync for offline fallback.
      try {
        localStorage.setItem(LOCAL_COUNTS_KEY, JSON.stringify(next));
      } catch (e) {
        void e;
      }
      setLoading(false);
    } catch {
      loadLocalCounts();
    }
  };

  useEffect(() => {
    loadFromBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVote = async (optionId: string) => {
    if (myOption) {
      sonnerToast.message('You already voted', { description: 'Come back later for the next drop.' });
      return;
    }

    setVoting(optionId);
    const userKey = user?.id || ensureSessionId();

    try {
      const res = await fetch('/api/drop-votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId, userKey }),
      });

      if (!res.ok) throw new Error('Vote failed');

      const data = await res.json();
      const next = (data?.counts || null) as VoteCounts | null;
      if (next) {
        setCounts(next);
        localStorage.setItem(LOCAL_COUNTS_KEY, JSON.stringify(next));
      } else {
        await loadFromBackend();
      }

      setMyOption(optionId);
      localStorage.setItem(SESSION_VOTE_KEY, JSON.stringify({ optionId, at: Date.now() }));
      sonnerToast.success('Vote submitted', { description: 'Your voice helps shape the next drop.' });
    } catch {
      // Offline/local fallback so voting still works in dev.
      const local = safeJSONParse<VoteCounts>(localStorage.getItem(LOCAL_COUNTS_KEY), {});
      const next = { ...local, [optionId]: (local[optionId] || 0) + 1 };
      setCounts(next);
      localStorage.setItem(LOCAL_COUNTS_KEY, JSON.stringify(next));
      setMyOption(optionId);
      localStorage.setItem(SESSION_VOTE_KEY, JSON.stringify({ optionId, at: Date.now() }));
      sonnerToast.success('Vote saved locally', { description: 'Backend voting failed, but your vote is kept.' });
    } finally {
      setVoting(null);
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(255,0,0,0.06) 0%, rgba(255,0,0,0.02) 50%, rgba(0,0,0,0) 100%)',
        border: '1px solid rgba(255,0,0,0.15)',
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ff0000' }}>Community Voting</div>
          <h2 style={{ fontSize: 26, fontWeight: 900, margin: '6px 0 0', letterSpacing: '-0.02em' }}>Vote for next drop category</h2>
          <p style={{ fontSize: 14, color: 'hsl(var(--muted-foreground))', marginTop: 6 }}>Limited drops, community-driven. Your vote decides what we drop next.</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))' }}>Total Votes</div>
          <div style={{ fontSize: 22, color: '#ff0000', fontWeight: 900, marginTop: 4 }}>{totalVotes.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ border: '1px solid hsl(var(--border))', borderRadius: 18, padding: 16, background: 'hsl(var(--card))' }}>
                <Skeleton className="h-4 w-2/3" />
                <div style={{ height: 10 }} />
                <Skeleton className="h-6 w-1/2" />
                <div style={{ height: 12 }} />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {options.map((s) => {
              const chosen = myOption === s.id;
              const voteCount = counts[s.id] || 0;
              return (
                <button
                  key={s.id}
                  onClick={() => handleVote(s.id)}
                  disabled={Boolean(myOption) && !chosen}
                  style={{
                    textAlign: 'left',
                    borderRadius: 18,
                    border: `1px solid ${chosen ? 'rgba(255,0,0,0.35)' : 'hsl(var(--border))'}`,
                    background: chosen ? 'rgba(255,0,0,0.08)' : 'hsl(var(--card))',
                    padding: 16,
                    cursor: myOption ? (chosen ? 'default' : 'not-allowed') : 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                    boxShadow: chosen ? '0 16px 48px rgba(255,0,0,0.12)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (myOption) return;
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 900, color: '#f1f5f9', fontSize: 15 }}>{s.name}</div>
                      <div style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>{s.description}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: chosen ? '#ff0000' : 'hsl(var(--muted-foreground))' }}>
                        Votes
                      </div>
                      <div style={{ fontSize: 22, fontWeight: 900, color: chosen ? '#ff0000' : 'hsl(var(--foreground))', marginTop: 4 }}>
                        {voteCount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, display: 'flex', gap: 10, alignItems: 'center' }}>
                    {chosen ? (
                      <span style={{ background: 'rgba(255,0,0,0.10)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: 999, padding: '6px 12px', color: '#ff0000', fontWeight: 900, fontSize: 12 }}>
                        ✓ Your choice
                      </span>
                    ) : (
                      <span style={{ background: 'rgba(255,0,0,0.06)', border: '1px solid rgba(255,0,0,0.15)', borderRadius: 999, padding: '6px 12px', color: '#ff0000', fontWeight: 900, fontSize: 12 }}>
                        {voting === s.id ? 'Voting…' : 'Vote'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

