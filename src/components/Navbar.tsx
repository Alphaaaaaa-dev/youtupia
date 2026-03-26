import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Sun, Moon, Menu, X, User, LogOut } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ onCartOpen }: { onCartOpen: () => void }) => {
  const { theme, toggleTheme } = useTheme();
  const { cartCount } = useStore();
  const { user, signOut } = useAuth() as any;
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const isDark = theme === 'dark';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { navigate('/shop?q=' + encodeURIComponent(search.trim())); setSearch(''); }
  };

  const navLinks = [
    { to: '/', label: 'Home' }, { to: '/shop', label: 'Shop' },
    { to: '/catalogue', label: 'Catalogue' }, { to: '/about', label: 'About' },
    { to: '/faq', label: 'FAQ' }, { to: '/contact', label: 'Contact' },
  ];

  const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--foreground))', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center' as const };

  return (
    <>
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: isDark ? 'rgba(15,15,15,0.97)' : 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid hsl(var(--border))', height: '56px', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={iconBtn}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
            <div style={{ background: '#ff0000', borderRadius: '6px', padding: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="14" viewBox="0 0 16 14" fill="none"><path d="M6.5 10L10.5 7L6.5 4V10Z" fill="white"/></svg>
            </div>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '18px', color: 'hsl(var(--foreground))', letterSpacing: '-0.5px' }}>Youtupia</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '560px', display: 'flex', alignItems: 'center' }}>
          <input type="text" placeholder="Search merch..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '8px 16px', background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRight: 'none', borderRadius: '20px 0 0 20px', outline: 'none', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px' }} />
          <button type="submit" style={{ background: isDark ? 'hsl(0 0% 22%)' : 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '0 20px 20px 0', padding: '8px 16px', cursor: 'pointer', color: 'hsl(var(--foreground))', display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
          <button onClick={toggleTheme} style={iconBtn} title="Toggle theme">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
          <button onClick={onCartOpen} style={{ ...iconBtn, position: 'relative' }}>
            <ShoppingCart size={20} />
            {cartCount > 0 && <span style={{ position: 'absolute', top: '3px', right: '3px', background: '#ff0000', color: 'white', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{cartCount > 9 ? '9+' : cartCount}</span>}
          </button>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ background: user ? '#ff0000' : 'none', border: user ? 'none' : '1px solid hsl(var(--border))', cursor: 'pointer', color: user ? 'white' : 'hsl(var(--foreground))', padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, fontFamily: 'Roboto, sans-serif' }}>
              <User size={15} />{user ? 'Account' : 'Sign in'}
            </button>
            {userMenuOpen && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: isDark ? 'hsl(0 0% 14%)' : 'white', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '8px', minWidth: '180px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 200 }}>
                {user ? (
                  <>
                    <div style={{ padding: '8px 12px', fontSize: '12px', color: 'hsl(var(--muted-foreground))', borderBottom: '1px solid hsl(var(--border))', marginBottom: '4px', wordBreak: 'break-all' as const }}>{user.email}</div>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', color: 'hsl(var(--foreground))', textDecoration: 'none' }}>📦 My Orders</Link>
                    <button onClick={() => { signOut?.(); setUserMenuOpen(false); }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                      <LogOut size={14} /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', color: 'hsl(var(--foreground))', textDecoration: 'none' }}>Sign in</Link>
                    <Link to="/login?mode=signup" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', color: '#ff0000', textDecoration: 'none', fontWeight: 500 }}>Create account</Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div style={{ position: 'fixed', top: '56px', left: 0, bottom: 0, width: '240px', background: isDark ? 'hsl(0 0% 9%)' : 'white', borderRight: '1px solid hsl(var(--border))', zIndex: 99, padding: '16px 12px', overflowY: 'auto' }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              style={{ display: 'block', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 500, color: location.pathname === link.to ? '#ff0000' : 'hsl(var(--foreground))', background: location.pathname === link.to ? 'rgba(255,0,0,0.08)' : 'none', textDecoration: 'none', marginBottom: '2px' }}>
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;
