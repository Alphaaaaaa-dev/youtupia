import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Diya from './Diya';
import { useFestival, FESTIVAL } from '../config/festival';

/** Large festive promo banner for the middle of the home page. */
const DiwaliSaleBanner = () => {
  const { phase } = useFestival();
  const embers = useMemo(() => Array.from({ length: 10 }).map(() => ({
    l: Math.random() * 100, s: 3 + Math.random() * 2, dur: 5 + Math.random() * 5, del: Math.random() * 5, sway: (Math.random() - 0.5) * 50,
  })), []);
  if (phase === 'off') return null;
  const live = phase === 'live';

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 64px' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', padding: '40px 36px', color: '#fff',
        background: 'linear-gradient(120deg, #3d0810 0%, #8f1a1a 55%, #b45309 100%)', border: '1px solid rgba(245,165,36,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '28px', flexWrap: 'wrap' }}>
        {embers.map((e, i) => (
          <span key={i} className="ember" aria-hidden style={{ position: 'absolute', bottom: '-10px', left: `${e.l}%`, width: e.s, height: e.s, borderRadius: '50%', background: '#ffcf5a', boxShadow: '0 0 8px 2px rgba(255,170,40,.7)', animation: `emberRise ${e.dur}s linear ${e.del}s infinite`, ['--sway' as string]: `${e.sway}px` }} />
        ))}
        <div style={{ position: 'relative', flex: '1 1 320px' }}>
          <div className="gold-shine" style={{ fontSize: 'clamp(28px, 4.2vw, 46px)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.05 }}>
            {live ? `${FESTIVAL.name} Sale is live` : `${FESTIVAL.name} Sale starts ${FESTIVAL.saleStartLabel}`}
          </div>
          <p style={{ fontSize: '16px', margin: '12px 0 20px', maxWidth: '460px', lineHeight: 1.6, color: '#ffe9c9' }}>
            {FESTIVAL.offerText ? `${FESTIVAL.offerText}. ` : ''}{live ? 'Festive prices on limited drops. Once they’re gone, they’re gone.' : 'Get ready for festive prices on limited drops.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link to={FESTIVAL.ctaLink} className="btn-yt" style={{ borderRadius: '10px', padding: '13px 26px', textDecoration: 'none', fontWeight: 700, background: '#fff', color: '#8f1a1a' }}>
              {live ? 'Shop the sale' : 'See the sneak peek'}
            </Link>
            {FESTIVAL.couponCode && (
              <span style={{ padding: '8px 14px', borderRadius: '10px', border: '1px dashed rgba(255,233,201,0.7)', fontWeight: 800, letterSpacing: '0.06em', fontSize: '14px' }}>Code: {FESTIVAL.couponCode}</span>
            )}
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
          {[48, 68, 48].map((sz, i) => <Diya key={i} size={sz} delay={i * 0.3} />)}
        </div>
      </div>
    </section>
  );
};

export default DiwaliSaleBanner;
