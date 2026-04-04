import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

/**
 * PromoBanner — dynamic scrolling ticker at the very top of the site.
 * Messages and colors are controlled from the Admin > Home Content tab.
 */
const PromoBanner = () => {
  const { topBanner } = useStore();
  const [visible, setVisible] = useState(true);
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('promo_dismissed');
    if (dismissed) setVisible(false);
  }, []);

  useEffect(() => {
    if (!topBanner.messages.length) return;
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % topBanner.messages.length); setFade(true); }, 300);
    }, 3500);
    return () => clearInterval(t);
  }, [topBanner.messages.length]);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem('promo_dismissed', '1');
  };

  if (!topBanner.enabled || !visible || !topBanner.messages.length) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 101,
      height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: topBanner.bgColor,
      color: topBanner.textColor, fontSize: '12px', fontWeight: 600,
      letterSpacing: '0.03em',
    }}>
      <span style={{ opacity: fade ? 1 : 0, transition: 'opacity 0.3s ease', pointerEvents: 'none' }}>
        {topBanner.messages[idx]}
      </span>
      <button onClick={dismiss} style={{ position: 'absolute', right: '12px', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)', display: 'flex', padding: '4px' }}>
        <X size={12} />
      </button>
    </div>
  );
};

export default PromoBanner;
