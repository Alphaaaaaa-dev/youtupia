import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Zap, Package, Users, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

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

const AboutPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  useReveal();

  const milestones = [
    { year: '2024', event: 'Youtupia is born — first 50 tees sold out in 6 hours.' },
    { year: 'Early 2025', event: 'Street Series launched. 200+ orders in the first week.' },
    { year: 'Mid 2025', event: 'Introduced heavyweight hoodies. Community voted on the colourways.' },
    { year: '2026', event: 'Over 2,400 pieces sold. 12 drops and counting.' },
  ];

  return (
    <div style={{ paddingTop: '56px' }}>
      {/* Hero */}
      <section style={{ position: 'relative', background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', padding: '80px 24px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(255,0,0,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(hsl(var(--border)/0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.3) 1px, transparent 1px)', backgroundSize: '50px 50px', opacity: 0.3 }} />
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center', position: 'relative' }} className="page-enter">
          <div style={{ width: '72px', height: '72px', margin: '0 auto 24px', position: 'relative' }}>
            <img src="/favicon.ico" alt="Youtupia" width={72} height={72} style={{ borderRadius: '16px', objectFit: 'contain' }} onError={e => { const el = e.target as HTMLImageElement; el.style.display = 'none'; }} />
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Our Story</div>
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.02em' }}>
            Born from the Culture.<br />Built for the Culture.
          </h1>
          <p style={{ fontSize: '17px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.8, marginBottom: '32px' }}>
            Youtupia isn't just a merch brand. It's a statement. Every piece we drop reflects something real — a moment, a feeling, a community. No fast fashion. No shortcuts.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none', borderRadius: '10px' }}>Shop the Drops <ArrowRight size={15} /></Link>
            <Link to="/contact" className="btn-ghost" style={{ textDecoration: 'none', borderRadius: '10px' }}>Get in Touch</Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0' }}>
          {[{ n: '2,400+', l: 'Pieces Sold' }, { n: '12', l: 'Limited Drops' }, { n: '7 Days', l: 'Return Window' }, { n: '100%', l: 'Legit Quality' }].map((s, i) => (
            <div key={s.l} style={{ textAlign: 'center', padding: '0 20px', borderRight: i < 3 ? '1px solid hsl(var(--border))' : 'none' }}>
              <div style={{ fontSize: '26px', fontWeight: 900, color: '#ff0000', marginBottom: '4px' }}>{s.n}</div>
              <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Story sections */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 24px' }}>
        {[
          { icon: Heart, title: 'Why We Started', color: '#ff0000', text: 'Youtupia started with a simple frustration — the merch available for creators and communities felt generic, cheap, and disposable. We wanted something better. A hoodie that actually fit. A tee that didn\'t shrink. A brand that gave a damn. So we built it.' },
          { icon: Zap, title: 'How Drops Work', color: '#ff0000', text: 'Every series has a concept. We design around it, source the right blanks, get samples made, and only release when we\'re happy with every detail. Drops are always limited — we don\'t believe in endless restocks. When it\'s gone, it captures that moment in time.' },
          { icon: Package, title: 'Our Quality Promise', color: '#ff0000', text: 'We use 240gsm cotton for tees — that\'s heavier than most high street brands. Our hoodies are 380gsm fleece. We inspect every garment before it ships. If you ever receive something that doesn\'t meet the standard, we\'ll sort it, no questions asked.' },
        ].map(({ icon: Icon, title, color, text }, i) => (
          <div key={title} className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '48px', alignItems: 'center', marginBottom: '56px', direction: i % 2 === 1 ? 'rtl' : 'ltr' }}>
            <div style={{ direction: 'ltr' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: `rgba(255,0,0,0.08)`, border: `1px solid rgba(255,0,0,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Icon size={32} style={{ color }} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '16px', letterSpacing: '-0.01em' }}>{title}</h2>
              <p style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.8, margin: 0 }}>{text}</p>
            </div>
            <div style={{ direction: 'ltr', background: isDark ? 'hsl(0 0% 7%)' : 'hsl(var(--secondary))', borderRadius: '20px', aspectRatio: '16/10', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid hsl(var(--border))' }}>
              <Icon size={64} style={{ color: 'rgba(255,0,0,0.12)' }} />
            </div>
          </div>
        ))}
      </section>

      {/* Timeline */}
      <section style={{ background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', padding: '64px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div className="reveal" style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Journey</div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0 }}>The Timeline</h2>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '20px', top: 0, bottom: 0, width: '1px', background: 'hsl(var(--border))' }} />
            {milestones.map((m, i) => (
              <div key={i} className="reveal" style={{ display: 'flex', gap: '28px', marginBottom: '36px', alignItems: 'flex-start' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, boxShadow: '0 0 16px rgba(255,0,0,0.3)' }}>
                  <Star size={16} style={{ color: 'white' }} />
                </div>
                <div style={{ paddingTop: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff0000', marginBottom: '4px', letterSpacing: '0.05em' }}>{m.year}</div>
                  <div style={{ fontSize: '15px', color: 'hsl(var(--foreground))', lineHeight: 1.6 }}>{m.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '800px', margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
        <div className="reveal">
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px' }}>Join the Movement</div>
          <h2 style={{ fontSize: '30px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em' }}>Ready to wear the culture?</h2>
          <p style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))', marginBottom: '32px', lineHeight: 1.7 }}>Browse the latest drops and find your size before it's gone.</p>
          <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none', borderRadius: '12px', padding: '14px 32px', fontSize: '16px', fontWeight: 700 }}>
            Shop Now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
