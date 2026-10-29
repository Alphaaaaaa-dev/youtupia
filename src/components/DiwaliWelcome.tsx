import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import Diya from './Diya';
import { useFestival, FESTIVAL } from '../config/festival';

const SEEN_KEY = 'diwali-welcome-seen-2026';

/** Opening popup with fireworks + lit diyas. Shows once per browser session, only during the campaign. */
const DiwaliWelcome = () => {
  const { phase, days, hours, minutes, seconds } = useFestival(1000);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (phase === 'off') return;
    let seen = false;
    try { seen = sessionStorage.getItem(SEEN_KEY) === '1'; } catch { /* ignore */ }
    if (seen) return;
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [phase === 'off']); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open]);

  const sparks = useMemo(() => Array.from({ length: 28 }).map((_, i) => {
    const a = (i / 28) * Math.PI * 2, r = 120 + Math.random() * 140;
    return { dx: Math.cos(a) * r, dy: Math.sin(a) * r, c: ['#ffb627', '#ff7a1a', '#ff3b3b', '#fff1b8'][i % 4], d: Math.random() * 0.4 };
  }), []);
  const embers = useMemo(() => Array.from({ length: 16 }).map(() => ({
    l: Math.random() * 100, s: 3 + Math.random() * 3, dur: 6 + Math.random() * 6, del: Math.random() * 6, sway: (Math.random() - 0.5) * 80,
  })), []);

  if (!open || phase === 'off') return null;
  const live = phase === 'live';

  return (
    <div role="dialog" aria-modal="true" aria-label={`${FESTIVAL.name} Sale`} onClick={close}
      style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        background: 'radial-gradient(ellipse at 50% 40%, rgba(110,15,25,0.92), rgba(10,2,3,0.96) 70%)', backdropFilter: 'blur(6px)', overflow: 'hidden' }}>
      {embers.map((e, i) => (
        <span key={i} className="ember" style={{ position: 'absolute', bottom: '-10px', left: `${e.l}%`, width: e.s, height: e.s, borderRadius: '50%', background: '#ffb627', boxShadow: '0 0 8px 2px rgba(255,170,40,.7)', animation: `emberRise ${e.dur}s linear ${e.del}s infinite`, ['--sway' as string]: `${e.sway}px` }} />
      ))}

      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: '100%', maxWidth: '520px', textAlign: 'center', padding: '36px 28px 30px', borderRadius: '24px',
        background: 'linear-gradient(160deg, #2a0a0e, #14060a)', border: '1px solid rgba(245,165,36,0.45)', boxShadow: '0 0 60px rgba(245,120,20,0.25)', color: '#fff1dc', animation: 'welcomeIn 0.6s cubic-bezier(0.22,1,0.36,1) both' }}>
        <button onClick={close} autoFocus aria-label="Close" style={{ position: 'absolute', top: '12px', right: '12px', width: '34px', height: '34px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#fff1dc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>

        <div aria-hidden style={{ position: 'absolute', top: '40%', left: '50%', width: 0, height: 0 }}>
          {sparks.map((p, i) => (
            <span key={i} className="burst-p" style={{ position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: p.c, boxShadow: `0 0 8px ${p.c}`, animation: `burst 1.6s ease-out ${0.2 + p.d}s both`, ['--dx' as string]: `${p.dx}px`, ['--dy' as string]: `${p.dy}px` }} />
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '10px', marginBottom: '18px' }}>
          {[40, 52, 64, 52, 40].map((sz, i) => <Diya key={i} size={sz} delay={i * 0.25} />)}
        </div>
        <div className="gold-shine" style={{ fontSize: '34px', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.1 }}>Shubh Deepavali</div>
        <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '10px' }}>
          {live ? `${FESTIVAL.name} Sale is live` : `${FESTIVAL.name} Sale starts ${FESTIVAL.saleStartLabel}`}
        </div>
        <p style={{ fontSize: '14px', color: '#d9b99a', margin: '8px auto 18px', maxWidth: '360px', lineHeight: 1.6 }}>
          {FESTIVAL.offerText ? `${FESTIVAL.offerText}. ` : ''}{live ? 'Festive prices on limited drops, while stock lasts.' : 'Festive prices on limited drops are almost here.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '22px' }}>
          {([[days, 'Days'], [hours, 'Hrs'], [minutes, 'Min'], [seconds, 'Sec']] as [number, string][]).map(([v, l]) => (
            <div key={l} style={{ minWidth: '58px', padding: '8px 6px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(245,165,36,0.25)' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#ffb627', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{String(v).padStart(2, '0')}</div>
              <div style={{ fontSize: '10px', color: '#b8977c', marginTop: '3px' }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={FESTIVAL.ctaLink} onClick={close} className="btn-yt" style={{ borderRadius: '10px', padding: '13px 26px', textDecoration: 'none', fontWeight: 700 }}>
            {live ? 'Shop the sale' : 'See the sneak peek'}
          </Link>
          <button onClick={close} className="btn-ghost" style={{ borderRadius: '10px', padding: '13px 22px', background: 'rgba(255,255,255,0.08)', color: '#fff1dc' }}>Maybe later</button>
        </div>
      </div>
    </div>
  );
};

export default DiwaliWelcome;
