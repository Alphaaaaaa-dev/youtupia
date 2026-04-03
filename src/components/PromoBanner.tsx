import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X } from 'lucide-react';

const MESSAGES = [
  '🔥 Free shipping on orders above ₹999',
  '⚡ New drops every Friday — Follow us to stay updated',
  '🎁 Use code YOUTUPIA10 for 10% off your first order',
  '🚚 COD available across India',
];

/**
 * PromoBanner — a scrolling marquee ticker at the very top of the site.
 * Drop this just ABOVE <Navbar> in your layout, or inside StoreLayout.
 * It can be dismissed and remembers via sessionStorage.
 */
const PromoBanner = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('promo_dismissed');
    if (dismissed) setVisible(false);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % MESSAGES.length); setFade(true); }, 300);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('promo_dismissed', '1');
  };

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 101,
      height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: isDark ? '#1a0000' : '#ff0000',
      color: 'white', fontSize: '12px', fontWeight: 600,
      letterSpacing: '0.03em',
    }}>
      <span style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }}>
        {MESSAGES[idx]}
      </span>
      <button onClick={dismiss} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex', padding: '4px' }}>
        <X size={12} />
      </button>
    </div>
  );
};

export default PromoBanner;
