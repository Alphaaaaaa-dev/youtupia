```tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Heart,
  ChevronRight,
  Zap,
  Tag,
  Package
} from 'lucide-react';

import { useTheme } from '../contexts/ThemeContext';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';


const FaviconLogo = ({ size = 28 }: { size?: number }) => (
  <img
    src="/favicon.ico"
    alt="Youtupia"
    width={size}
    height={size}
    style={{
      borderRadius: '6px',
      objectFit: 'contain',
      display: 'block'
    }}
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

  const handleToggle = () => {
    setAnimating(true);
    toggleTheme();
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <button
      onClick={handleToggle}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      style={{
        width: '52px',
        height: '26px',
        borderRadius: '13px',
        border: 'none',
        cursor: 'pointer',
        background: isDark ? 'hsl(0 0% 24%)' : 'hsl(0 0% 85%)',
        position: 'relative',
        transition: 'background 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        padding: '2px',
        flexShrink: 0,
        boxShadow: isDark
          ? 'inset 0 1px 3px rgba(0,0,0,0.4)'
          : 'inset 0 1px 3px rgba(0,0,0,0.1)'
      }}
    >

      <span
        style={{
          position: 'absolute',
          left: '5px',
          fontSize: '9px',
          opacity: isDark ? 0 : 1,
          transition: 'opacity 0.25s'
        }}
      >
        ☀️
      </span>

      <span
        style={{
          position: 'absolute',
          right: '5px',
          fontSize: '9px',
          opacity: isDark ? 1 : 0,
          transition: 'opacity 0.25s'
        }}
      >
        🌙
      </span>

      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background: isDark ? '#ff0000' : 'white',
          position: 'absolute',
          left: isDark ? 'calc(100% - 23px)' : '3px',
          boxShadow: isDark
            ? '0 0 8px rgba(255,0,0,0.5)'
            : '0 2px 4px rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '9px',
          transition: 'left 0.28s cubic-bezier(0.34,1.56,0.64,1), background 0.25s',
          transform: animating ? 'scale(0.85)' : 'scale(1)'
        }}
      >
        {isDark ? '🌙' : '☀️'}
      </div>

    </button>
  );
};



// ── LEFT SIDEBAR DRAWER (Souled Store style) ─────────────────

const LeftSidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {

  const { theme } = useTheme();

  const {
    products,
    series,
    creators
  } = useStore();

  const { user, logout } = useAuth();

  const navigate = useNavigate();


  const linkStyle = {
    padding: '12px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    color: 'inherit',
    fontWeight: 500,
    borderBottom: '1px solid rgba(0,0,0,0.06)'
  };


  if (!open) return null;


  return (
    <div>

      {/* Overlay */}

      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 90
        }}
      />


      {/* Sidebar */}

      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '280px',
          height: '100%',
          background: theme === 'dark' ? '#111' : '#fff',
          zIndex: 100,
          padding: '18px',
          overflowY: 'auto',
          boxShadow: '2px 0 10px rgba(0,0,0,0.2)'
        }}
      >

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}
        >
          <strong>Menu</strong>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X />
          </button>
        </div>


        <Link to="/" style={linkStyle} onClick={onClose}>
          <Zap size={18} />
          Home
        </Link>

        <Link to="/shop" style={linkStyle} onClick={onClose}>
          <Tag size={18} />
          Shop
        </Link>

        <Link to="/series" style={linkStyle} onClick={onClose}>
          <Package size={18} />
          Series ({series.length})
        </Link>

        <Link to="/creators" style={linkStyle} onClick={onClose}>
          <User size={18} />
          Creators ({creators.length})
        </Link>

        <Link to="/products" style={linkStyle} onClick={onClose}>
          <Package size={18} />
          Products ({products.length})
        </Link>


        {user && (
          <button
            onClick={() => {
              logout();
              onClose();
              navigate('/');
            }}
            style={{
              marginTop: '20px',
              padding: '10px',
              width: '100%',
              background: '#ff0000',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            <LogOut size={16} style={{ marginRight: '6px' }} />
            Logout
          </button>
        )}

      </div>

    </div>
  );
};


export default LeftSidebar;
```
