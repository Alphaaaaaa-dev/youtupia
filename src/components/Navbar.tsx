import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Sun, Moon, Menu, X, User, LogOut, ChevronDown, Heart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';

const FaviconLogo = ({ size = 28 }: { size?: number }) => (
  <img src="/favicon.ico" alt="Youtupia" width={size} height={size}
    style={{ borderRadius: '6px', objectFit: 'contain', display: 'block' }}
    onError={e => {
      // Fallback to SVG play-button if favicon not loaded
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

  const handleToggle = () => {
    setAnimating(true);
    toggleTheme();
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <button onClick={handleToggle} title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        width: '56px', height: '28px', borderRadius: '14px', border: 'none', cursor: 'pointer',
        background: isDark ? 'hsl(0 0% 24%)' : 'hsl(0 0% 85%)',
        position: 'relative', transition: 'background 0.3s ease',
        display: 'flex', alignItems: 'center', padding: '3px', flexShrink: 0,
        boxShadow: isDark ? 'inset 0 1px 3px rgba(0,0,0,0.4)' : 'inset 0 1px 3px rgba(0,0,0,0.1)',
      }}>
      {/* Track icons */}
      <span style={{ position: 'absolute', left: '6px', fontSize: '10px', opacity: isDark ? 0 : 1, transition: 'opacity 0.25s' }}>☀️</span>
      <span style={{ position: 'absolute', right: '6px', fontSize: '10px', opacity: isDark ? 1 : 0, transition: 'opacity 0.25s' }}>🌙</span>
      {/* Knob */}
      <div className="toggle-knob" style={{
        width: '22px', height: '22px', borderRadius: '50%',
        background: isDark ? '#ff0000' : 'white',
        position: 'absolute',
        left: isDark ? 'calc(100% - 25px)' : '3px',
        boxShadow: isDark ? '0 0 8px rgba(255,0,0,0.5)' : '0 2px 4px rgba(0,0,0,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px',
        transition: 'left 0.28s cubic-bezier(0.34,1.56,0.64,1), background 0.25s, box-shadow 0.25s',
        transform: animating ? 'scale(0.85)' : 'scale(1)',
      }}>
        {isDark ? '🌙' : '☀️'}
      </div>
    </button>
  );
};

const Navbar = ({ onCartOpen }: { onCartOpen: () => void }) => {
  const { theme } = useTheme();
  const { cartCount } = useStore();
  const { user, signOut } = useAuth() as any;
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prevCartCount, setPrevCartCount] = useState(cartCount);
  const [cartBounce, setCartBounce] = useState(false);
  const isDark = theme === 'dark';

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Cart badge bounce
  useEffect(() => {
    if (cartCount > prevCartCount) {
      setCartBounce(true);
      setTimeout(() => setCartBounce(false), 500);
    }
    setPrevCartCount(cartCount);
  }, [cartCount]);

  // Close menus on route change
  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { navigate('/shop?q=' + encodeURIComponent(search.trim())); setSearch(''); }
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/drops', label: 'Drops' },
    { to: '/catalogue', label: 'Catalogue' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const iconBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'hsl(var(--foreground))', padding: '8px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', transition: 'background 0.15s, transform 0.15s',
  };

  return (
    <>
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: isDark
          ? scrolled ? 'rgba(12,12,12,0.98)' : 'rgba(15,15,15,0.92)'
          : scrolled ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: scrolled ? '1px solid hsl(var(--border))' : '1px solid transparent',
        height: '56px', display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: '12px',
        transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: scrolled ? (isDark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)') : 'none',
      }}>

        {/* Left: hamburger + logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{ ...iconBtn, display: 'flex' }}>
            <span style={{ display: 'block', transition: 'transform 0.25s, opacity 0.25s', transform: mobileOpen ? 'rotate(90deg)' : 'none' }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </span>
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            {/* Favicon */}
            <div style={{ position: 'relative', width: '28px', height: '28px' }}>
              <FaviconLogo size={28} />
              {/* Fallback SVG */}
              <div style={{ display: 'none', width: '28px', height: '28px', background: '#ff0000', borderRadius: '6px', alignItems: 'center', justifyContent: 'center', position: 'absolute', inset: 0 }}>
                <svg width="14" height="12" viewBox="0 0 16 14" fill="none"><path d="M6.5 10L10.5 7L6.5 4V10Z" fill="white"/></svg>
              </div>
            </div>
            <span style={{
              fontWeight: 800, fontSize: '18px', color: 'hsl(var(--foreground))',
              letterSpacing: '-0.5px', transition: 'color 0.2s',
            }}>
              Youtupia
            </span>
          </Link>
        </div>

        {/* Center: search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '540px', display: 'flex', alignItems: 'center' }}>
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center',
            background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))',
            border: '1px solid hsl(var(--border))', borderRight: 'none',
            borderRadius: '20px 0 0 20px', transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
            onFocusCapture={e => (e.currentTarget.style.boxShadow = '0 0 0 2px rgba(255,0,0,0.15)')}
            onBlurCapture={e => (e.currentTarget.style.boxShadow = 'none')}>
            <input type="text" placeholder="Search drops, series..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: '8px 16px', background: 'transparent', border: 'none', outline: 'none', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px' }} />
          </div>
          <button type="submit" style={{
            background: isDark ? 'hsl(0 0% 20%)' : 'hsl(var(--secondary))',
            border: '1px solid hsl(var(--border))', borderRadius: '0 20px 20px 0',
            padding: '8px 16px', cursor: 'pointer', color: 'hsl(var(--foreground))',
            display: 'flex', alignItems: 'center', transition: 'background 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = isDark ? 'hsl(0 0% 28%)' : 'hsl(var(--card-elevated))')}
            onMouseLeave={e => (e.currentTarget.style.background = isDark ? 'hsl(0 0% 20%)' : 'hsl(var(--secondary))')}>
            <Search size={15} />
          </button>
        </form>

        {/* Right: actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
          <ThemeToggle />

          {/* Wishlist */}
          <a href="/wishlist" style={{ ...iconBtn, textDecoration: 'none', color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'hsl(var(--secondary))'; (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none'; (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}>
            <Heart size={20} />
          </a>

          {/* Cart */}
          <button onClick={onCartOpen} style={{ ...iconBtn, position: 'relative' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'hsl(var(--secondary))'; e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.transform = 'scale(1)'; }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className={cartBounce ? 'badge-bounce' : ''} style={{
                position: 'absolute', top: '2px', right: '2px',
                background: '#ff0000', color: 'white', borderRadius: '50%',
                width: '17px', height: '17px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '10px', fontWeight: 700,
                boxShadow: '0 0 6px rgba(255,0,0,0.5)',
              }}>
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </button>

          {/* User */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                background: user ? '#ff0000' : 'transparent',
                border: user ? 'none' : '1px solid hsl(var(--border))',
                cursor: 'pointer', color: user ? 'white' : 'hsl(var(--foreground))',
                padding: '6px 12px', borderRadius: '20px',
                display: 'flex', alignItems: 'center', gap: '5px',
                fontSize: '13px', fontWeight: 500, fontFamily: 'Roboto, sans-serif',
                transition: 'all 0.2s', boxShadow: user ? '0 2px 8px rgba(255,0,0,0.3)' : 'none',
              }}
              onMouseEnter={e => { if (!user) e.currentTarget.style.background = 'hsl(var(--secondary))'; }}
              onMouseLeave={e => { if (!user) e.currentTarget.style.background = 'transparent'; }}>
              <User size={14} />
              {user ? 'Account' : 'Sign in'}
              <ChevronDown size={12} style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {/* Dropdown */}
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: isDark ? 'hsl(0 0% 13%)' : 'white',
              border: '1px solid hsl(var(--border))', borderRadius: '14px',
              padding: '8px', minWidth: '192px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
              zIndex: 200, overflow: 'hidden',
              transform: userMenuOpen ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(-8px)',
              opacity: userMenuOpen ? 1 : 0,
              pointerEvents: userMenuOpen ? 'auto' : 'none',
              transformOrigin: 'top right',
              transition: 'transform 0.22s cubic-bezier(0.34,1.56,0.64,1), opacity 0.18s ease',
            }}>
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
      </header>

      {/* Mobile drawer */}
      {/* Backdrop */}
      <div onClick={() => setMobileOpen(false)} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 98, backdropFilter: 'blur(3px)',
        opacity: mobileOpen ? 1 : 0, pointerEvents: mobileOpen ? 'auto' : 'none',
        transition: 'opacity 0.25s ease',
      }} />
      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px',
        background: isDark ? 'hsl(0 0% 9%)' : 'white',
        borderRight: '1px solid hsl(var(--border))', zIndex: 99,
        padding: '0', overflowY: 'auto',
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        boxShadow: mobileOpen ? '8px 0 32px rgba(0,0,0,0.3)' : 'none',
      }}>
        {/* Drawer header */}
        <div style={{ padding: '16px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '10px', background: isDark ? 'hsl(0 0% 7%)' : 'hsl(var(--secondary))' }}>
          <FaviconLogo size={28} />
          <span style={{ fontWeight: 800, fontSize: '16px' }}>Youtupia</span>
        </div>
        <nav style={{ padding: '10px 10px' }}>
          {navLinks.map((link, i) => (
            <Link key={link.to} to={link.to}
              style={{
                display: 'flex', alignItems: 'center', padding: '11px 14px', borderRadius: '10px',
                fontSize: '14px', fontWeight: 500, textDecoration: 'none', marginBottom: '2px',
                color: location.pathname === link.to ? '#ff0000' : 'hsl(var(--foreground))',
                background: location.pathname === link.to ? 'rgba(255,0,0,0.08)' : 'none',
                borderLeft: location.pathname === link.to ? '3px solid #ff0000' : '3px solid transparent',
                transition: 'all 0.15s',
                animationDelay: `${i * 0.04}s`,
              }}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
