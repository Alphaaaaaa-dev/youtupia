import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RefreshCw, TrendingUp, Zap, Package, Users } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import DropVotingSection from '@/components/DropVotingSection';

// Scroll reveal hook
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
};

// Animated counter
const Counter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let start = 0;
      const step = target / 40;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 30);
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

const DropCountdown = ({ endsAt }: { endsAt: string }) => {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return;
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      {[
        ['d', time.d],
        ['h', time.h],
        ['m', time.m],
        ['s', time.s],
      ].map(([label, val]) => (
        <div key={label} style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,0,0,0.12)', border: '1px solid rgba(255,0,0,0.25)', borderRadius: 12, padding: '10px 14px', fontSize: 18, fontWeight: 900, color: '#ff0000', minWidth: 52, fontVariantNumeric: 'tabular-nums' }}>
            {String(val).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 9, color: 'hsl(var(--muted-foreground))', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
};

const HomePage = () => {
  const { products, series, creators, drops, addToCart, homePromo } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const featured = products.filter(p => p.featured);
  const latestDrop = drops.slice().sort((a, b) => b.dropNumber - a.dropNumber)[0];
  const [heroImgIdx, setHeroImgIdx] = useState(0);
  useReveal();

  // Cycle hero product images
  useEffect(() => {
    if (!featured.length) return;
    const t = setInterval(() => setHeroImgIdx(i => (i + 1) % Math.min(featured.length, 4)), 3000);
    return () => clearInterval(t);
  }, [featured.length]);

  return (
    <div style={{ paddingTop: '56px', position: 'relative', zIndex: 1 }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: isDark ? 'hsl(0 0% 6%)' : 'hsl(0 0% 98%)' }}>
        {/* Background texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: isDark ? 'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(255,0,0,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 70%, rgba(255,0,0,0.04) 0%, transparent 50%)' : 'radial-gradient(ellipse 80% 50% at 20% 40%, rgba(255,0,0,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(hsl(var(--border)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.3) 1px, transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', opacity: 0.4 }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div className="page-enter">
            {/* Live badge */}
            <div className="glow-pill" style={{ marginBottom: '28px', width: 'fit-content' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#ff0000', display: 'inline-block', animation: 'glowPulse 1.5s ease-in-out infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.08em' }}>
                LATEST DROP {latestDrop ? `#${String(latestDrop.dropNumber).padStart(3, '0')}` : ''}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 68px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.03em', marginBottom: '6px' }}>
              Wear you
            </h1>
            <h1 className="gradient-text" style={{ fontSize: 'clamp(40px, 5.5vw, 68px)', fontWeight: 900, lineHeight: 1.02, letterSpacing: '-0.03em', marginBottom: '24px' }}>
              Dreams.
            </h1>

            <p style={{ fontSize: '17px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.75, marginBottom: '36px', maxWidth: '440px' }}>
              Premium merch drops from Youtupia. Every piece is limited, every series tells a story. No fast fashion, no compromises.
            </p>

            {/* Latest Drop Spotlight */}
            {latestDrop && (
              <div style={{ background: isDark ? 'rgba(255,0,0,0.06)' : 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.16)', borderRadius: 18, padding: 18, marginBottom: 36 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ff0000' }}>Limited Drop</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'hsl(var(--foreground))', marginTop: 4 }}>{latestDrop.name}</div>
                    <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', marginTop: 2 }}>{latestDrop.theme}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: '#f97316', background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', padding: '6px 10px', borderRadius: 999 }}>Selling fast</span>
                    {latestDrop.limited && <span style={{ fontSize: 12, fontWeight: 900, color: '#ff0000', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.16)', padding: '6px 10px', borderRadius: 999 }}>Never restocking</span>}
                  </div>
                </div>

                {latestDrop.endsAt ? (
                  <DropCountdown endsAt={latestDrop.endsAt} />
                ) : (
                  <div style={{ fontSize: 13, color: 'hsl(var(--muted-foreground))', fontWeight: 600 }}>Drop is live now.</div>
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 14, flexWrap: 'wrap' }}>
                  <Link to={`/shop?drop=${latestDrop.id}`} className="btn-yt ripple" style={{ textDecoration: 'none', borderRadius: 12, padding: '12px 18px', fontSize: 14 }}>
                    Shop Latest Drop <ArrowRight size={16} />
                  </Link>
                  <Link to="/drops" className="btn-ghost" style={{ textDecoration: 'none', borderRadius: 12, padding: '12px 18px', fontSize: 14 }}>
                    View all drops
                  </Link>
                </div>
              </div>
            )}

            {/* Tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
              {['Limited Drops', '220gsm+', 'Free Delivery', 'Streetwear'].map(tag => (
                <span key={tag} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, background: 'hsl(var(--secondary))', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.03em', border: '1px solid hsl(var(--border))' }}>{tag}</span>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn-yt ripple" style={{ borderRadius: '10px', padding: '14px 28px', fontSize: '15px', textDecoration: 'none', fontWeight: 700 }}>
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/catalogue" className="btn-ghost" style={{ borderRadius: '10px', padding: '14px 28px', fontSize: '15px', textDecoration: 'none' }}>
                Browse Catalogue
              </Link>
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: '32px', marginTop: '48px', paddingTop: '32px', borderTop: '1px solid hsl(var(--border))' }}>
              {[{ label: 'Items Sold', value: 2400, suffix: '+' }, { label: 'Happy Customers', value: 1800, suffix: '+' }, { label: 'Limited Drops', value: 12, suffix: '' }].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: '#ff0000', lineHeight: 1 }}><Counter target={s.value} suffix={s.suffix} /></div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '4px', fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: promo video (large) + small product grid */}
          <div className="page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Promo video — supports YouTube URL, direct video URL, or Instagram reel */}
            <div style={{ borderRadius: '24px', overflow: 'hidden', background: 'rgba(0,0,0,0.35)', aspectRatio: '16/9', position: 'relative', border: isDark ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid rgba(0,0,0,0.08)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
              {homePromo.videoUrl ? (() => {
                const url = homePromo.videoUrl.trim();
                // Extract YouTube video ID from any YouTube URL
                const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                const ytId = ytMatch ? ytMatch[1] : null;
                // Instagram embed
                const isInsta = url.includes('instagram.com');
                if (ytId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&loop=1&playlist=${ytId}&controls=1&modestbranding=1&rel=0`}
                      title={homePromo.title || 'Promo Video'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                    />
                  );
                }
                if (isInsta) {
                  const instaPostMatch = url.match(/instagram\.com\/(p|reel)\/([A-Za-z0-9_-]+)/);
                  if (instaPostMatch) {
                    return (
                      <iframe
                        src={`https://www.instagram.com/${instaPostMatch[1]}/${instaPostMatch[2]}/embed`}
                        title={homePromo.title || 'Promo Video'}
                        allowFullScreen
                        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                      />
                    );
                  }
                }
                // Direct video file
                return (
                  <video
                    src={url}
                    poster={homePromo.posterUrl}
                    autoPlay muted loop playsInline controls
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                );
              })() : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(255,0,0,0.08) 0%, rgba(0,0,0,0.6) 100%)', color: 'rgba(255,255,255,0.7)', gap: '12px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,0,0,0.15)', border: '2px solid rgba(255,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M8 5.14v14.72L19 12 8 5.14z" fill="rgba(255,255,255,0.8)"/></svg>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.04em' }}>Promotion Video</span>
                  <span style={{ fontSize: '11px', opacity: 0.5 }}>Paste YouTube / Instagram link in Admin → Home Content</span>
                </div>
              )}
              {/* Video overlay info — only shows on non-iframe */}
              {homePromo.videoUrl && !homePromo.videoUrl.includes('youtube') && !homePromo.videoUrl.includes('youtu.be') && !homePromo.videoUrl.includes('instagram') && (homePromo.title || homePromo.ctaText) && (
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
                  {homePromo.title && <div style={{ color: 'white', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>{homePromo.title}{homePromo.subtitle ? ` — ${homePromo.subtitle}` : ''}</div>}
                  {homePromo.ctaText && (
                    <Link to={homePromo.ctaLink || '/drops'} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ff0000', color: 'white', textDecoration: 'none', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, marginTop: '6px' }}>
                      {homePromo.ctaText} →
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Small product strip below video */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
            {featured.slice(0, 4).map((p, i) => (
              <Link key={p.id} to={`/product/${p.id}`}
                style={{ textDecoration: 'none', borderRadius: '10px', overflow: 'hidden', aspectRatio: '3/4', position: 'relative', display: 'block', background: 'hsl(var(--secondary))', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}>
                <div className="img-zoom" style={{ width: '100%', height: '100%' }}>
                  <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                </div>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.8))' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px' }}>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '8px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>{p.series}</div>
                  <div style={{ color: 'white', fontSize: '11px', fontWeight: 700, lineHeight: 1.2 }}>{p.name}</div>
                  <div style={{ color: '#ff6666', fontSize: '11px', fontWeight: 800, marginTop: '1px' }}>₹{p.price.toLocaleString()}</div>
                </div>
                {p.originalPrice && <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff0000', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 7px', borderRadius: '4px', letterSpacing: '0.05em' }}>SALE</div>}
              </Link>
            ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', opacity: 0.5 }}>
          <span style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'hsl(var(--muted-foreground))' }}>SCROLL</span>
          <div style={{ width: '1px', height: '32px', background: 'linear-gradient(hsl(var(--muted-foreground)), transparent)', animation: 'fadeIn 2s ease infinite' }} />
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <div style={{ borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))', background: isDark ? 'hsl(0 0% 7%)' : 'hsl(var(--secondary))' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0' }}>
          {[
            { icon: Truck, label: 'Free Delivery', sub: 'On Every order!!!!' },
       { icon: Sparkles, label: 'Unique Design', sub: 'Unique all over internet' },
            { icon: Shield, label: 'Secure Payments', sub: 'Razorpay encrypted' }
            { icon: Star, label: 'Premium Quality', sub: '220+gsm fabrics' },
          ].map(({ icon: Icon, label, sub }, i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRight: i < 3 ? '1px solid hsl(var(--border))' : 'none' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.3s' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(8deg) scale(1.1)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                <Icon size={17} style={{ color: '#ff0000' }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px' }}>{label}</div>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SERIES ── */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px' }}>
        <div className="reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Collections</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Shop by Series</h2>
            <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginTop: '6px' }}>Each series is a story. Every drop has a reason.</p>
          </div>
          <Link to="/shop" className="hover-underline" style={{ fontSize: '13px', color: '#ff0000', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            View all series <ArrowRight size={14} />
          </Link>
        </div>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {series.map(s => (
            <Link key={s.id} to={`/shop?series=${s.id}`}
              className="img-zoom"
              style={{ textDecoration: 'none', borderRadius: '20px', overflow: 'hidden', position: 'relative', height: '220px', display: 'flex', alignItems: 'flex-end', background: 'hsl(var(--secondary))', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              {s.banner && <img src={s.banner} alt={s.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 20%, rgba(0,0,0,0.75))' }} />
              <div style={{ position: 'relative', padding: '20px', display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.35)', background: 'rgba(0,0,0,0.3)', flexShrink: 0, transition: 'border-color 0.2s' }}>
                  {s.logo && <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '16px', letterSpacing: '-0.01em' }}>{s.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '12px', marginTop: '2px' }}>{s.description}</div>
                </div>
                <ArrowRight size={18} style={{ color: 'rgba(255,255,255,0.6)', flexShrink: 0 }} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── COMMUNITY VOTING ── */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 64px' }}>
        <DropVotingSection />
      </section>

      {/* ── FEATURED ── */}
      <section style={{ background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px' }}>
          <div className="reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Trending</div>
              <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={26} style={{ color: '#ff0000' }} /> Featured Drops
              </h2>
              <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginTop: '6px' }}>Handpicked. Flying off shelves.</p>
            </div>
            <Link to="/shop" className="hover-underline" style={{ fontSize: '13px', color: '#ff0000', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              See all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
            {featured.map(p => (
              <div key={p.id} className="product-card">
                <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="img-zoom" style={{ position: 'relative', aspectRatio: '3/4', background: 'hsl(var(--secondary))' }}>
                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                    {p.originalPrice && <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff0000', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(255,0,0,0.4)' }}>SALE</span>}
                    {/* Quick-add overlay */}
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'flex-end', padding: '12px', transition: 'background 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                    </div>
                  </div>
                  <div style={{ padding: '12px 12px 6px' }}>
                    <div style={{ fontSize: '10px', color: '#ff0000', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{p.series}</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px', lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 800, fontSize: '16px', color: '#ff0000' }}>₹{p.price.toLocaleString()}</span>
                      {p.originalPrice && <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
                    </div>
                  </div>
                </Link>
                <div style={{ padding: '6px 12px 12px' }}>
                  <button onClick={() => addToCart(p, p.variants[0]?.size || 'M')} className="btn-yt ripple" style={{ width: '100%', justifyContent: 'center', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600 }}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── CREATORS ── */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 64px' }}>
        <div className="reveal" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Creators</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>Shop by Creator</h2>
            <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', marginTop: '6px' }}>Merch from your favourite YouTubers.</p>
          </div>
        </div>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {creators.map(c => (
            <a key={c.id} href={`/creator/${c.handle}`}
              style={{ textDecoration: 'none', borderRadius: '20px', overflow: 'hidden', position: 'relative', height: '200px', display: 'flex', alignItems: 'flex-end', background: 'hsl(var(--secondary))', transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
              {c.banner && <img src={c.banner} alt={c.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 20%, rgba(0,0,0,0.8))' }} />
              <div style={{ position: 'relative', padding: '18px', display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
                <img src={c.avatar} alt={c.name} style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #ff0000', objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: 800, fontSize: '16px' }}>{c.name}</div>
                  {c.subscribers && <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '2px' }}>{c.subscribers} subscribers</div>}
                  <div style={{ color: '#ff6666', fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>{c.productIds.length} products →</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── WHY YOUTUPIA ── */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '64px 24px' }}>
        <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>Why Us</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>Built Different</h2>
        </div>
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { icon: Zap, title: 'Limited Runs Only', desc: 'Every drop is limited. We never restock. Once it\'s gone, it\'s gone forever — that\'s what makes it special.' },
            { icon: Package, title: 'Obsessed With Quality', desc: 'Minimum 240gsm cotton for tees, 380gsm fleece for hoodies. We wear everything we sell.' },
            { icon: Users, title: 'Community First', desc: 'Every drop is informed by the community. You vote, we drop. Your feedback shapes the next collection.' },
            { icon: Star, title: 'Premium Every Time', desc: 'From packaging to the final stitch — every detail is deliberate. Unwrapping a Youtupia order should feel premium.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="stat-card" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '28px 24px', transition: 'transform 0.3s, border-color 0.2s, box-shadow 0.3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,0,0,0.2)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Icon size={22} style={{ color: '#ff0000' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>{title}</h3>
              <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 64px' }}>
        <div className="reveal" style={{ background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)', borderRadius: '24px', padding: '56px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '32px', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: '-80px', left: '30%', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
          <div style={{ position: 'relative' }}>
            <h2 style={{ fontSize: '30px', fontWeight: 900, color: 'white', margin: '0 0 10px', letterSpacing: '-0.02em' }}>Don't miss the next drop.</h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Join the community. Be first when new merch lands.</p>
          </div>
          <Link to="/shop" style={{ background: 'white', color: '#ff0000', textDecoration: 'none', padding: '14px 28px', borderRadius: '12px', fontWeight: 800, fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)'; }}>
            Shop the Drop <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid hsl(var(--border))', background: isDark ? 'hsl(0 0% 5%)' : 'hsl(var(--secondary))' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 32px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img src="/favicon.ico" alt="Youtupia" width={28} height={28} style={{ borderRadius: '6px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.02em' }}>Youtupia</span>
            </div>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.8, maxWidth: '240px', marginBottom: '20px' }}>Premium merch for the culture. Limited drops, real quality. No compromises.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {['📸', '🐦', '▶️'].map((emoji, i) => (
                <div key={i} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', transition: 'transform 0.2s, border-color 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(255,0,0,0.3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}>
                  {emoji}
                </div>
              ))}
            </div>
          </div>
          {[
            { heading: 'Shop', links: [['All Products', '/shop'], ['Drops', '/drops'], ['Creators', '/shop'], ['Wishlist', '/wishlist'], ['New Arrivals', '/shop']] },
            { heading: 'Info', links: [['About Us', '/about'], ['Track Order', '/track-order'], ['FAQ', '/faq'], ['Contact', '/contact'], ['Policies', '/policy']] },
            { heading: 'Connect', links: [['📧 hello@youtupia.com', '/contact'], ['📱 +91 00000 00000', '/contact'], ['📸 @youtupia', '/contact'], ['💬 WhatsApp', '/contact']] },
          ].map(col => (
            <div key={col.heading}>
              <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '16px', letterSpacing: '0.02em' }}>{col.heading}</div>
              {col.links.map(([label, to]) => (
                <div key={label} style={{ marginBottom: '10px' }}>
                  <Link to={to} className="hover-underline" style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'hsl(var(--foreground))')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'hsl(var(--muted-foreground))')}>
                    {label}
                  </Link>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px 24px', borderTop: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>© 2026 Youtupia. All rights reserved. Made with ❤️ for the culture.</span>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[['Privacy', '/policy'], ['Terms', '/policy'], ['Refunds', '/policy']].map(([l, to]) => (
              <Link key={l} to={to} style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#ff0000')}
                onMouseLeave={e => (e.currentTarget.style.color = 'hsl(var(--muted-foreground))')}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
