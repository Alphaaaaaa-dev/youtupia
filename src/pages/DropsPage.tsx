import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowRight, Lock, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

const CountdownBadge = ({ endsAt }: { endsAt: string }) => {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return;
      setTime({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    update(); const t = setInterval(update, 1000); return () => clearInterval(t);
  }, [endsAt]);
  return <span style={{ fontSize: '11px', color: '#ff0000', fontWeight: 700 }}>{time.d}d {time.h}h {time.m}m {time.s}s</span>;
};

const DropsPage = () => {
  const { drops, products } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div style={{ paddingTop: '0px', position: 'relative', zIndex: 1 }}>
      <div style={{ background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', borderBottom: '1px solid hsl(var(--border))', padding: '40px 24px 32px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', color: '#ff0000', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Drops</div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, margin: '0 0 8px', letterSpacing: '-0.03em' }}>All Drops</h1>
          <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>Every collection tells a story. Every piece is limited.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px' }}>
        {drops.map((drop, i) => {
          const dropProducts = products.filter(p => drop.productIds.includes(p.id));
          return (
            <div key={drop.id} style={{ marginBottom: '48px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '24px', overflow: 'hidden', transition: 'box-shadow 0.3s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.2)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              {/* Banner */}
              <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
                <img src={drop.banner} alt={drop.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s ease' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.7))' }} />
                <div style={{ position: 'absolute', top: '20px', left: '24px', display: 'flex', gap: '8px' }}>
                  <span style={{ background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '10px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', letterSpacing: '0.08em' }}>DROP {String(drop.dropNumber).padStart(3, '0')}</span>
                  {drop.limited && <span style={{ background: '#ff0000', color: 'white', fontSize: '10px', fontWeight: 700, padding: '5px 12px', borderRadius: '20px', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={9} /> LIMITED</span>}
                </div>
                <div style={{ position: 'absolute', bottom: '20px', left: '24px' }}>
                  <h2 style={{ color: 'white', fontSize: '22px', fontWeight: 900, margin: '0 0 4px' }}>{drop.name}</h2>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px' }}>{drop.theme}</div>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', lineHeight: 1.7, margin: 0, maxWidth: '500px' }}>{drop.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {drop.endsAt && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Ends in</span>
                        <CountdownBadge endsAt={drop.endsAt} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product thumbnails */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {dropProducts.slice(0, 4).map(p => (
                    <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: 'none', borderRadius: '12px', overflow: 'hidden', width: '90px', height: '110px', flexShrink: 0, background: 'hsl(var(--secondary))', transition: 'transform 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                      <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                    </Link>
                  ))}
                  {dropProducts.length > 4 && (
                    <div style={{ width: '90px', height: '110px', borderRadius: '12px', background: 'hsl(var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: 'hsl(var(--muted-foreground))' }}>+{dropProducts.length - 4}</div>
                  )}
                </div>

                <Link to={`/shop?drop=${drop.id}`} className="btn-yt" style={{ textDecoration: 'none', borderRadius: '10px', padding: '11px 22px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={14} /> Shop This Drop <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DropsPage;
