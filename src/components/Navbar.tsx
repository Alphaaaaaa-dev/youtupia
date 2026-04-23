import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Sun, Moon, Menu, X, User, LogOut, ChevronDown, Heart, ChevronRight, Zap, Tag, Package } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';

const FaviconLogo = ({ size = 28 }: { size?: number }) => (
  <img src="/favicon.ico" alt="Youtupia" width={size} height={size}
    style={{ borderRadius: '6px', objectFit: 'contain', display: 'block' }}
    onError={e => {
      const el = e.target as HTMLImageElement;
      el.style.display = 'none';
      const fb = el.nextSibling as HTMLElement;
      if (fb) fb.style.display = 'flex';
    }}
  />
);

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [animating, setAnimating] = useState(false);
  const handleToggle = () => { setAnimating(true); toggleTheme(); setTimeout(() => setAnimating(false), 400); };
  return (
    <button onClick={handleToggle} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{ width: '52px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer', background: isDark ? 'hsl(0 0% 24%)' : 'hsl(0 0% 85%)', position: 'relative', transition: 'background 0.3s ease', display: 'flex', alignItems: 'center', padding: '2px', flexShrink: 0, boxShadow: isDark ? 'inset 0 1px 3px rgba(0,0,0,0.4)' : 'inset 0 1px 3px rgba(0,0,0,0.1)' }}>
      <span style={{ position: 'absolute', left: '5px', fontSize: '9px', opacity: isDark ? 0 : 1, transition: 'opacity 0.25s' }}>☀️</span>
      <span style={{ position: 'absolute', right: '5px', fontSize: '9px', opacity: isDark ? 1 : 0, transition: 'opacity 0.25s' }}>🌙</span>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: isDark ? '#ff0000' : 'white', position: 'absolute', left: isDark ? 'calc(100% - 23px)' : '3px', boxShadow: isDark ? '0 0 8px rgba(255,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', transition: 'left 0.28s cubic-bezier(0.34,1.56,0.64,1), background 0.25s', transform: animating ? 'scale(0.85)' : 'scale(1)' }}>
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
};

// ── LEFT SIDEBAR DRAWER (Souled Store style) ─────────────────
const LeftSidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { theme } = useTheme();
  const { products, series, drops, creators } = useStore();
  const isDark = theme === 'dark';
  const [expandedSection, setExpandedSection] = useState<string | null>('collections');

  const bg = isDark ? 'hsl(0 0% 9%)' : 'white';
  const border = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.08)';
  const textMain = isDark ? '#f1f5f9' : '#0f172a';
  const textMuted = isDark ? '#64748b' : '#94a3b8';
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const sectionBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const latestDrop = drops.slice().sort((a, b) => b.dropNumber - a.dropNumber)[0];

  const toggle = (key: string) => setExpandedSection(prev => prev === key ? null : key);

  const SectionHeader = ({ id, label, icon }: { id: string; label: string; icon: React.ReactNode }) => (
    <button onClick={() => toggle(id)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: textMain }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {icon}
        <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
      </div>
      <ChevronDown size={14} style={{ color: textMuted, transform: expandedSection === id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
    </button>
  );

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 998, backdropFilter: 'blur(4px)', opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none', transition: 'opacity 0.28s ease' }} />

      {/* Drawer */}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '320px', maxWidth: '90vw', background: bg, zIndex: 999, overflowY: 'auto', overflowX: 'hidden', transform: open ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)', boxShadow: open ? '12px 0 48px rgba(0,0,0,0.35)' : 'none' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 16px', borderBottom: border, background: isDark ? 'hsl(0 0% 7%)' : 'hsl(0 0% 98%)', position: 'sticky', top: 0, zIndex: 10 }}>
          <FaviconLogo size={32} />
          <div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, fontSize: '17px', color: textMain, letterSpacing: '-0.3px' }}>Youtupia</div>
            <div style={{ fontFamily: 'monospace', fontSize: '9px', color: '#ff0000', letterSpacing: '0.1em' }}>WEAR THE CULTURE</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, padding: '6px', display: 'flex', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Latest Drop Banner */}
        {latestDrop && (
          <Link to="/drops" onClick={onClose} style={{ display: 'block', margin: '12px 12px 4px', borderRadius: '12px', overflow: 'hidden', textDecoration: 'none', position: 'relative' }}>
            <div style={{ background: 'linear-gradient(135deg, #ff0000 0%, #8b0000 100%)', padding: '14px 16px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '9px', color: 'rgba(255,255,255,0.7)', letterSpacing: '0.12em', marginBottom: '4px' }}>🔥 LIVE NOW</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '14px', color: 'white' }}>{latestDrop.name}</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '11px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>{latestDrop.theme}</div>
              <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '4px 10px', fontSize: '11px', color: 'white', fontWeight: 700 }}>
                Shop Drop <ChevronRight size={11} />
              </div>
            </div>
          </Link>
        )}

        {/* Quick Links */}
        <div style={{ padding: '8px 12px', borderBottom: border }}>
         {[
  { to: '/', emoji: '🏠', label: 'Home' },
  { to: '/shop', emoji: '🛍️', label: 'All Products' },
  { to: '/catalogue', emoji: '📖', label: 'Catalogue' },
].map(item => (
            <Link key={item.to} to={item.to} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 8px', borderRadius: '10px', textDecoration: 'none', color: textMain, transition: 'background 0.15s', fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: 500 }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              <span style={{ fontSize: '16px' }}>{item.emoji}</span>
              {item.label}
              <ChevronRight size={13} style={{ color: textMuted, marginLeft: 'auto' }} />
            </Link>
          ))}
        </div>

        {/* Collections / Series */}
        <div style={{ borderBottom: border }}>
          <SectionHeader id="collections" label="Collections" icon={<Tag size={14} style={{ color: '#ff0000' }} />} />
          {expandedSection === 'collections' && (
            <div style={{ padding: '4px 12px 12px' }}>
              {series.map(s => (
                <Link key={s.id} to={`/shop?series=${s.id}`} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 8px', borderRadius: '10px', textDecoration: 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', background: sectionBg, border: `2px solid ${s.color}40`, flexShrink: 0 }}>
                    {s.logo && <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: '13px', color: textMain }}>{s.name}</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '11px', color: textMuted }}>{s.description}</div>
                  </div>
                  <ChevronRight size={13} style={{ color: textMuted, marginLeft: 'auto', flexShrink: 0 }} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Featured Products */}
        <div style={{ borderBottom: border }}>
          <SectionHeader id="featured" label="Trending Now" icon={<Zap size={14} style={{ color: '#ff0000' }} />} />
          {expandedSection === 'featured' && (
            <div style={{ padding: '4px 12px 12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {featuredProducts.map(product => (
                  <Link key={product.id} to={`/product/${product.id}`} onClick={onClose} style={{ textDecoration: 'none', borderRadius: '10px', overflow: 'hidden', border, display: 'block', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
                    <div style={{ height: '100px', overflow: 'hidden', background: sectionBg }}>
                      <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                    </div>
                    <div style={{ padding: '8px' }}>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: '11px', color: textMain, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '12px', color: '#ff0000', marginTop: '2px' }}>₹{product.price.toLocaleString()}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link to="/shop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px', padding: '9px', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '10px', textDecoration: 'none', color: '#ff0000', fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '12px' }}>
                View All Products <ChevronRight size={13} />
              </Link>
            </div>
          )}
        </div>

        {/* Creators */}
        {creators.length > 0 && (
          <div style={{ borderBottom: border }}>
            <SectionHeader id="creators" label="Creators" icon={<Package size={14} style={{ color: '#ff0000' }} />} />
            {expandedSection === 'creators' && (
              <div style={{ padding: '4px 12px 12px' }}>
                {creators.map(creator => (
                  <Link key={creator.id} to={`/creator/${creator.handle}`} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 8px', borderRadius: '10px', textDecoration: 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                    <img src={creator.avatar} alt={creator.name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,0,0,0.3)', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }} />
                    <div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: '13px', color: textMain }}>{creator.name}</div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '11px', color: textMuted }}>@{creator.handle} · {creator.subscribers}</div>
                    </div>
                    <ChevronRight size={13} style={{ color: textMuted, marginLeft: 'auto', flexShrink: 0 }} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bottom links */}
        <div style={{ padding: '12px' }}>
          {[
            { to: '/about', label: '👋 About Us' },
            { to: '/faq', label: '❓ FAQs' },
            { to: '/contact', label: '📩 Contact' },
            { to: '/policy', label: '📜 Policies' },
          ].map(item => (
            <Link key={item.to} to={item.to} onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 8px', borderRadius: '10px', textDecoration: 'none', color: textMuted, fontSize: '13px', fontFamily: 'Roboto, sans-serif', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

// ── MAIN NAVBAR ──────────────────────────────────────────────
const Navbar = ({ onCartOpen }: { onCartOpen: () => void }) => {
  const { theme } = useTheme();
  const { cartCount, topBanner } = useStore();
  const { user, signOut } = useAuth() as any;
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartCount);
  const [cartBounce, setCartBounce] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (cartCount > prevCartCount) { setCartBounce(true); setTimeout(() => setCartBounce(false), 500); }
    setPrevCartCount(cartCount);
  }, [cartCount]);

  useEffect(() => { setSidebarOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { navigate('/shop?q=' + encodeURIComponent(search.trim())); setSearch(''); }
  };

 const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/shop', label: 'Shop' },
  { to: '/catalogue', label: 'Catalogue' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];
  const iconBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'hsl(var(--foreground))', padding: '6px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', transition: 'background 0.15s, transform 0.15s',
  };

  const headerBg = isDark
    ? scrolled ? 'rgba(12,12,12,0.99)' : 'rgba(15,15,15,0.95)'
    : scrolled ? 'rgba(255,255,255,0.99)' : 'rgba(255,255,255,0.96)';

  return (
    <>
      {/* Left sidebar drawer */}
      <LeftSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header style={{ position: 'fixed', top: topBanner.enabled ? 32 : 0, left: 0, right: 0, zIndex: 100, background: headerBg, backdropFilter: 'blur(16px)', borderBottom: scrolled ? '1px solid hsl(var(--border))' : '1px solid transparent', boxShadow: scrolled ? (isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)') : 'none', transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease' }}>

        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px', height: '58px', gap: '14px' }}>

          {/* Hamburger + Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              title="Open menu"
              style={{ ...iconBtn, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '5px', padding: '8px', borderRadius: '8px', width: '36px', height: '36px' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--secondary))')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ display: 'block', width: '18px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '14px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '18px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
            </button>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                <FaviconLogo size={28} />
                <div style={{ display: 'none', width: '28px', height: '28px', background: '#ff0000', borderRadius: '6px', alignItems: 'center', justifyContent: 'center', position: 'absolute', inset: 0 }}>
                  <svg width="14" height="12" viewBox="0 0 16 14" fill="none"><path d="M6.5 10L10.5 7L6.5 4V10Z" fill="white" /></svg>
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: '18px', color: 'hsl(var(--foreground))', letterSpacing: '-0.5px' }}>Youtupia</span>
            </Link>
          </div>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: 'flex', alignItems: 'center', maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRight: 'none', borderRadius: '22px 0 0 22px', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onFocusCapture={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,0,0,0.15)')}
              onBlurCapture={e => (e.currentTarget.style.boxShadow = 'none')}>
              <input type="text" placeholder="Search drops, series..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, padding: '9px 16px', background: 'transparent', border: 'none', outline: 'none', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px' }} />
            </div>
            <button type="submit" style={{ background: '#ff0000', border: '1px solid #ff0000', borderRadius: '0 22px 22px 0', padding: '9px 18px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, fontFamily: 'Roboto, sans-serif', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#cc0000')}
              onMouseLeave={e => (e.currentTarget.style.background = '#ff0000')}>
              <Search size={14} />
              <span style={{ display: window.innerWidth < 480 ? 'none' : 'inline' }}>Search</span>
            </button>
          </form>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <ThemeToggle />

            <a href="/wishlist" style={{ ...iconBtn, textDecoration: 'none', color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'hsl(var(--secondary))'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>
              <Heart size={20} />
            </a>

            <button onClick={onCartOpen} style={{ ...iconBtn, position: 'relative' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}>
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className={cartBounce ? 'badge-bounce' : ''} style={{ position: 'absolute', top: '2px', right: '2px', background: '#ff0000', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700, boxShadow: '0 0 6px rgba(255,0,0,0.5)' }}>
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* User menu */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ background: user ? '#ff0000' : 'transparent', border: user ? 'none' : '1px solid hsl(var(--border))', cursor: 'pointer', color: user ? 'white' : 'hsl(var(--foreground))', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 500, fontFamily: 'Roboto, sans-serif', transition: 'all 0.2s', boxShadow: user ? '0 2px 8px rgba(255,0,0,0.3)' : 'none' }}
                onMouseEnter={e => { if (!user) e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
                onMouseLeave={e => { if (!user) e.currentTarget.style.background = 'transparent'; }}>
                <User size={14} />
                {user ? 'Account' : 'Sign in'}
                <ChevronDown size={12} style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              <div style={{ position: 'absolute', top: 'calc(100% + 10px)', right: 0, background: isDark ? 'hsl(0 0% 13%)' : 'white', border: '1px solid hsl(var(--border))', borderRadius: '14px', padding: '8px', minWidth: '192px', boxShadow: '0 12px 40px rgba(0,0,0,0.25)', zIndex: 200, overflow: 'hidden', transform: userMenuOpen ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(-8px)', opacity: userMenuOpen ? 1 : 0, pointerEvents: userMenuOpen ? 'auto' : 'none', transformOrigin: 'top right', transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease' }}>
                {user ? (
                  <>
                    <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid hsl(var(--border))', marginBottom: '6px' }}>
                      <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', wordBreak: 'break-all' }}>{user.email}</div>
                    </div>
                    {[{ to: '/orders', icon: '📦', label: 'My Orders' }, { to: '/wishlist', icon: '❤️', label: 'Wishlist' }, { to: '/track-order', icon: '🚚', label: 'Track Order' }].map(item => (
                      <Link key={item.to} to={item.to} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', color: 'hsl(var(--foreground))', textDecoration: 'none', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--secondary))')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                        <span>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                    <button onClick={() => { signOut?.(); setUserMenuOpen(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', transition: 'background 0.15s', marginTop: '2px' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      <LogOut size={13} /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" style={{ display: 'flex', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', color: 'hsl(var(--foreground))', textDecoration: 'none', transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--secondary))')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      Sign in
                    </Link>
                    <Link to="/login?mode=signup" style={{ display: 'flex', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', color: '#ff0000', textDecoration: 'none', fontWeight: 600, transition: 'background 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,0,0,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      Create account →
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM NAV LINKS */}
        <div style={{ display: 'flex', alignItems: 'center', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`, padding: '0 24px', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {navLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 18px', fontSize: '13px', fontWeight: isActive ? 700 : 500, textDecoration: 'none', whiteSpace: 'nowrap', color: isActive ? '#ff0000' : 'hsl(var(--foreground))', borderBottom: isActive ? '2px solid #ff0000' : '2px solid transparent', transition: 'color 0.15s, border-color 0.15s', letterSpacing: '0.02em', marginBottom: '-1px' }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = '#ff0000'; (e.currentTarget as HTMLElement).style.borderBottomColor = 'rgba(255,0,0,0.3)'; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.color = 'hsl(var(--foreground))'; (e.currentTarget as HTMLElement).style.borderBottomColor = 'transparent'; } }}>
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>
    </>
  );
};

export default Navbar;
