import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, ShoppingBag, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [visible, setVisible] = useState(false);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    console.error('404: Route not found —', location.pathname);
    setTimeout(() => setVisible(true), 80);
    // Glitch animation every few seconds
    const id = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 3500);
    return () => clearInterval(id);
  }, [location.pathname]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark ? 'hsl(0 0% 6%)' : 'hsl(0 0% 98%)',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px',
    }}>
      {/* Ambient background orbs */}
      <div style={{
        position: 'absolute', top: '-120px', left: '-120px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,0,0,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', right: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,0,0,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(hsl(var(--border)/0.25) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)/0.25) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none', opacity: 0.5,
      }} />

      {/* Big watermark 404 */}
      <div style={{
        position: 'absolute',
        fontSize: 'clamp(160px, 30vw, 320px)',
        fontWeight: 900,
        lineHeight: 1,
        color: 'transparent',
        WebkitTextStroke: `1px rgba(255,0,0,${isDark ? '0.07' : '0.06'})`,
        userSelect: 'none',
        pointerEvents: 'none',
        letterSpacing: '-0.05em',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        whiteSpace: 'nowrap',
        transition: 'filter 0.1s',
        filter: glitch
          ? 'drop-shadow(4px 0 0 rgba(255,0,0,0.3)) drop-shadow(-4px 0 0 rgba(0,200,255,0.2))'
          : 'none',
      }}>
        404
      </div>

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center',
        maxWidth: '520px', width: '100%',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)',
          borderRadius: '20px', padding: '6px 16px', marginBottom: '28px',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%', background: '#ff0000',
            display: 'inline-block',
            boxShadow: '0 0 0 3px rgba(255,0,0,0.2)',
            animation: 'pulseGlow 1.5s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em' }}>
            PAGE NOT FOUND
          </span>
        </div>

        {/* 404 number — visible, styled */}
        <div style={{
          fontSize: 'clamp(64px, 15vw, 120px)',
          fontWeight: 900,
          lineHeight: 1,
          color: '#ff0000',
          letterSpacing: '-0.04em',
          marginBottom: '16px',
          filter: glitch
            ? 'drop-shadow(3px 0 0 rgba(255,50,50,0.8)) drop-shadow(-3px 0 0 rgba(0,180,255,0.4))'
            : 'none',
          transition: 'filter 0.1s',
          textShadow: '0 0 40px rgba(255,0,0,0.2)',
        }}>
          404
        </div>

        <h1 style={{
          fontSize: 'clamp(20px, 4vw, 28px)',
          fontWeight: 800,
          marginBottom: '12px',
          letterSpacing: '-0.02em',
          color: 'hsl(var(--foreground))',
        }}>
          Oops, this drop doesn't exist
        </h1>

        <p style={{
          fontSize: '15px',
          color: 'hsl(var(--muted-foreground))',
          lineHeight: 1.7,
          marginBottom: '8px',
        }}>
          The page at <code style={{ fontFamily: 'monospace', background: 'hsl(var(--secondary))', padding: '2px 8px', borderRadius: '6px', fontSize: '13px', color: '#ff0000' }}>{location.pathname}</code> doesn't exist.
        </p>

        <p style={{
          fontSize: '13px',
          color: 'hsl(var(--muted-foreground))',
          marginBottom: '40px',
          opacity: 0.7,
        }}>
          It may have been removed or you may have typed the wrong address.
        </p>

        {/* CTA buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <Link to="/" className="btn-yt" style={{ textDecoration: 'none', borderRadius: '12px', padding: '13px 24px', fontSize: '14px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Home size={16} /> Go Home
          </Link>
          <Link to="/shop" className="btn-ghost" style={{ textDecoration: 'none', borderRadius: '12px', padding: '13px 24px', fontSize: '14px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={16} /> Browse Shop
          </Link>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '13px 24px', fontSize: '14px', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'border-color 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,0,0,0.3)'; e.currentTarget.style.color = '#ff0000'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.color = 'hsl(var(--muted-foreground))'; }}>
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>

        {/* Quick links */}
        <div style={{
          padding: '20px 24px',
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '16px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
            Quick Links
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
            
              { to: '/catalogue', icon: ShoppingBag, label: 'Catalogue' },
              { to: '/about', icon: null, label: 'About Us' },
              { to: '/contact', icon: null, label: 'Contact' },
              { to: '/faq', icon: null, label: 'FAQs' },
            ].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '20px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', textDecoration: 'none', fontSize: '12px', fontWeight: 600, color: 'hsl(var(--foreground))', transition: 'border-color 0.15s, background 0.15s, color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,0,0,0.3)'; e.currentTarget.style.color = '#ff0000'; e.currentTarget.style.background = 'rgba(255,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.color = 'hsl(var(--foreground))'; e.currentTarget.style.background = 'hsl(var(--secondary))'; }}>
                {Icon && <Icon size={11} />} {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <div style={{ marginTop: '24px', fontSize: '11px', color: 'hsl(var(--muted-foreground))', opacity: 0.5, letterSpacing: '0.06em' }}>
          YOUTUPIA · WEAR THE CULTURE · ERROR 404
        </div>
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 3px rgba(255,0,0,0.2); }
          50% { box-shadow: 0 0 0 6px rgba(255,0,0,0); }
        }
      `}</style>
    </div>
  );
};

export default NotFound;
