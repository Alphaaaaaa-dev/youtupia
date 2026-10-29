import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import type { Product } from '../contexts/StoreContext';
import { useFestival, FESTIVAL } from '../config/festival';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import Diya from '../components/Diya';
import DiwaliLights from '../components/DiwaliLights';
import DiwaliFireworks from '../components/DiwaliFireworks';

const GOLD = '#f5a524';
const discountOf = (p: Product) => (p.originalPrice && p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0);

const SaleCard = ({ p, live, added, wished, onAdd, onWish, onQuick }: {
  p: Product; live: boolean; added: boolean; wished: boolean;
  onAdd: () => void; onWish: () => void; onQuick: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const stock = p.variants.reduce((s, v) => s + v.stock, 0);
  const soldOut = stock === 0 && !p.preorder;
  const off = discountOf(p);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (e.pointerType !== 'mouse' || !el) return;
    const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
    el.style.setProperty('--gx', `${x * 100}%`); el.style.setProperty('--gy', `${y * 100}%`);
  };
  const leave = () => { if (ref.current) ref.current.style.transform = ''; };

  return (
    <div ref={ref} className="ds-card" onPointerMove={move} onPointerLeave={leave}>
      <div className="ds-glare" />
      <button onClick={onWish} aria-label="Wishlist" style={{ position: 'absolute', top: 10, right: 10, zIndex: 5, width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'rgba(0,0,0,0.55)', color: wished ? '#ff3b3b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Heart size={14} fill={wished ? '#ff3b3b' : 'none'} />
      </button>
      <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div style={{ position: 'relative', aspectRatio: '3/4', background: '#1d1010', overflow: 'hidden' }}>
          <img src={p.images[0]} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
          <span style={{ position: 'absolute', top: 10, left: 10, background: 'linear-gradient(135deg,#ff2a00,#ff8a00)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 9px', borderRadius: 6, letterSpacing: '0.04em' }}>
            🪔 DIWALI DEAL{off > 0 ? ` ${off}% OFF` : ''}
          </span>
          {soldOut && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '6px 14px', borderRadius: 20 }}>Sold Out</span>
            </div>
          )}
        </div>
        <div style={{ padding: '12px 12px 6px' }}>
          <div style={{ fontSize: 10, color: GOLD, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 3 }}>{p.series}</div>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6, color: '#f6efe6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontWeight: 900, fontSize: 17, color: GOLD }}>₹{p.price.toLocaleString('en-IN')}</span>
            {p.originalPrice && p.originalPrice > p.price && <span style={{ fontSize: 12, color: '#a99888', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString('en-IN')}</span>}
          </div>
        </div>
      </Link>
      <div style={{ padding: '8px 10px 12px', display: 'flex', gap: 6 }}>
        {live ? (
          <>
            <button onClick={onAdd} disabled={soldOut} className="ripple"
              style={{ flex: 1, border: 'none', borderRadius: 8, padding: 10, cursor: soldOut ? 'not-allowed' : 'pointer', color: '#fff', fontWeight: 700, fontSize: 12, fontFamily: 'Roboto, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, opacity: soldOut ? 0.5 : 1, background: added ? '#16a34a' : 'linear-gradient(135deg,#ff2a00,#ff8a00)', transition: 'background .3s' }}>
              <ShoppingCart size={12} /> {added ? 'Added!' : soldOut ? 'Sold Out' : 'Add'}
            </button>
            <button onClick={onQuick} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(245,165,36,0.35)', background: 'transparent', color: '#f6efe6', fontSize: 12, cursor: 'pointer', fontFamily: 'Roboto, sans-serif' }}>View</button>
          </>
        ) : (
          <Link to={`/product/${p.id}`} style={{ flex: 1, textAlign: 'center', padding: 10, borderRadius: 8, border: '1px solid rgba(245,165,36,0.45)', color: GOLD, fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
            Sneak peek
          </Link>
        )}
      </div>
    </div>
  );
};

const DiwaliSalePage = () => {
  const { products, addToCart, toggleWishlist, wishlist, hydrating, dbLoading } = useStore();
  const { phase, days, hours, minutes, seconds } = useFestival(1000);
  const [seriesId, setSeriesId] = useState('');
  const [sortBy, setSortBy] = useState('discount');
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const loading = hydrating || dbLoading;
  const live = phase === 'live';

  const saleProducts = useMemo(() => products.filter(p => p.diwaliSale === true), [products]);
  const seriesChips = useMemo(() => {
    const m = new Map<string, string>();
    saleProducts.forEach(p => m.set(p.seriesId, p.series));
    return [...m.entries()];
  }, [saleProducts]);
  const list = useMemo(() => {
    const l = seriesId ? saleProducts.filter(p => p.seriesId === seriesId) : [...saleProducts];
    switch (sortBy) {
      case 'price-asc': l.sort((a, b) => a.price - b.price); break;
      case 'price-desc': l.sort((a, b) => b.price - a.price); break;
      case 'newest': l.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      default: l.sort((a, b) => discountOf(b) - discountOf(a));
    }
    return l;
  }, [saleProducts, seriesId, sortBy]);

  const quickAdd = (p: Product) => {
    const v = p.variants.find(v => v.stock > 0) || (p.preorder ? p.variants[0] : undefined);
    if (!v) return;
    addToCart(p, v.size);
    setAddedIds(prev => new Set(prev).add(p.id));
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(p.id); return n; }), 1800);
  };

  const ribbonText = `${live ? 'DIWALI SALE IS LIVE' : 'DIWALI SALE COMING'} ✦ LIMITED DROPS ✦ FREE SHIPPING ✦ COD AVAILABLE ✦ `;
  const units: [number, string][] = [[days, 'Days'], [hours, 'Hrs'], [minutes, 'Min'], [seconds, 'Sec']];
  const chip = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 99, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'Roboto, sans-serif', whiteSpace: 'nowrap',
    border: `1px solid ${active ? GOLD : 'rgba(245,165,36,0.25)'}`, background: active ? 'linear-gradient(135deg,#ff2a00,#ff8a00)' : 'transparent', color: active ? '#fff' : '#d9c3a8',
  });

  return (
    <div style={{ background: '#080606', color: '#f6efe6', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      {phase !== 'off' && <DiwaliFireworks />}

      {/* ── HERO ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '84px 24px 56px', background: 'radial-gradient(ellipse 60% 60% at 75% 45%, rgba(255,150,40,0.2), transparent 70%), radial-gradient(ellipse 50% 50% at 8% 95%, rgba(255,0,0,0.12), transparent 60%)' }}>
        <DiwaliLights />
        <svg className="ds-spin" viewBox="-200 -200 400 400" fill="none" stroke={GOLD} strokeWidth="1.2" aria-hidden
          style={{ position: 'absolute', right: '-12%', top: '50%', width: 'min(860px,120vw)', marginTop: 'calc(min(860px,120vw) / -2)', opacity: 0.18, animation: 'dsSpin 120s linear infinite', pointerEvents: 'none' }}>
          {Array.from({ length: 16 }).map((_, i) => <ellipse key={i} cx="0" cy="-120" rx="22" ry="62" transform={`rotate(${i * 22.5})`} />)}
          {Array.from({ length: 24 }).map((_, i) => <circle key={`c${i}`} cx="0" cy="-168" r="6" transform={`rotate(${i * 15})`} />)}
          <circle r="40" /><circle r="70" strokeDasharray="4 6" /><circle r="188" strokeDasharray="2 8" />
        </svg>

        <div style={{ maxWidth: 1180, margin: '0 auto', position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 420px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 99, border: '1px solid rgba(245,165,36,0.5)', background: 'rgba(245,165,36,0.1)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: GOLD, marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff1a1a', animation: 'pulse 1.4s infinite' }} />
              {live ? 'DIWALI SALE IS LIVE' : phase === 'teaser' ? `SNEAK PEEK · SALE STARTS ${FESTIVAL.saleStartLabel.toUpperCase()}` : 'SALE HAS ENDED'}
            </div>
            <h1 className="gold-shine" style={{ fontSize: 'clamp(46px, 8vw, 96px)', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.035em', margin: '0 0 18px' }}>Diwali Sale</h1>
            <p style={{ fontSize: 18, lineHeight: 1.65, color: '#c9b8a6', maxWidth: 480, margin: '0 0 26px' }}>
              {phase === 'off'
                ? 'Thank you for celebrating with us. Shubh Deepavali! Browse the full store for the latest drops.'
                : `${FESTIVAL.offerText ? FESTIVAL.offerText + '. ' : ''}${live ? 'Festive prices on limited drops. Once they’re gone, they’re gone.' : 'Take a first look at the pieces going on sale. Shopping opens when the sale starts.'}`}
            </p>
            {phase !== 'off' && (
              <>
                <div style={{ fontSize: 13, color: '#a99888', marginBottom: 10 }}>{live ? 'Sale ends in' : 'Sale starts in'}</div>
                <div role="timer" style={{ display: 'flex', gap: 10, marginBottom: 26 }}>
                  {units.map(([v, l]) => (
                    <div key={l} style={{ minWidth: 66, padding: '12px 8px', borderRadius: 12, textAlign: 'center', background: '#140c0c', border: '1px solid rgba(245,165,36,0.25)', boxShadow: '0 0 24px rgba(255,150,40,0.15)' }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: GOLD, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{String(v).padStart(2, '0')}</div>
                      <div style={{ fontSize: 11, color: '#a99888', marginTop: 4 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              {phase !== 'off' && <a href="#deals" className="btn-yt" style={{ borderRadius: 10, padding: '13px 26px', textDecoration: 'none', fontWeight: 700 }}>{live ? 'Shop the sale' : 'See the deals'}</a>}
              <Link to="/shop" className="btn-ghost" style={{ borderRadius: 10, padding: '13px 24px', textDecoration: 'none', fontWeight: 600, color: '#f6efe6' }}>All products</Link>
              {FESTIVAL.couponCode && phase !== 'off' && <span style={{ padding: '9px 14px', borderRadius: 10, border: '1px dashed rgba(245,165,36,0.7)', fontWeight: 800, letterSpacing: '0.06em', fontSize: 13, color: GOLD }}>Code: {FESTIVAL.couponCode}</span>}
            </div>
          </div>
          <div style={{ flex: '0 1 300px', display: 'flex', justifyContent: 'center', filter: 'drop-shadow(0 0 40px rgba(255,150,30,0.5))' }}>
            <Diya size={260} />
          </div>
        </div>
      </section>

      {/* ── RIBBON ── */}
      {phase !== 'off' && (
        <div aria-hidden style={{ overflow: 'hidden', margin: '8px 0 28px', transform: 'rotate(-1.5deg)', borderBlock: `2px solid ${GOLD}`, background: 'linear-gradient(90deg,#9c0010,#ff1a1a)' }}>
          <div className="ds-marquee" style={{ display: 'flex', width: 'max-content', animation: 'dsMarquee 28s linear infinite' }}>
            {Array.from({ length: 10 }).map((_, i) => <span key={i} style={{ whiteSpace: 'nowrap', padding: '12px 24px', fontWeight: 900, fontSize: 18, letterSpacing: '0.05em', color: '#fff1d6' }}>{ribbonText}</span>)}
          </div>
        </div>
      )}

      {/* ── DEALS ── */}
      {phase !== 'off' && (
        <section id="deals" style={{ maxWidth: 1280, margin: '0 auto', padding: '8px 24px 80px', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 22 }}>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
              <button style={chip(!seriesId)} onClick={() => setSeriesId('')}>All ({saleProducts.length})</button>
              {seriesChips.map(([id, name]) => <button key={id} style={chip(seriesId === id)} onClick={() => setSeriesId(id)}>{name}</button>)}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} aria-label="Sort"
              style={{ padding: '9px 14px', borderRadius: 10, background: '#140c0c', color: '#f6efe6', border: '1px solid rgba(245,165,36,0.3)', fontFamily: 'Roboto, sans-serif', fontSize: 13 }}>
              <option value="discount">Biggest discount</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
            </select>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {Array.from({ length: 8 }).map((_, i) => <div key={i} style={{ aspectRatio: '3/4.6', borderRadius: 16, background: 'linear-gradient(90deg,#150d0d 25%,#241414 50%,#150d0d 75%)', backgroundSize: '200% 100%', animation: 'dsShimmer 1.4s infinite' }} />)}
            </div>
          ) : list.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 24px', color: '#a99888' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Diya size={72} /></div>
              <h3 style={{ fontWeight: 800, fontSize: 20, color: '#f6efe6', marginBottom: 8 }}>The deals are being lit</h3>
              <p style={{ fontSize: 14, marginBottom: 20 }}>{saleProducts.length === 0 ? 'Sale pieces will appear here soon. Check back shortly.' : 'No sale pieces in this series yet.'}</p>
              <Link to="/shop" className="btn-yt" style={{ borderRadius: 10, padding: '12px 24px', textDecoration: 'none', fontWeight: 700 }}>Browse all products</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {list.map(p => (
                <SaleCard key={p.id} p={p} live={live} added={addedIds.has(p.id)} wished={wishlist.includes(p.id)}
                  onAdd={() => quickAdd(p)} onWish={() => toggleWishlist(p.id)} onQuick={() => setQuickView(p)} />
              ))}
            </div>
          )}
        </section>
      )}

      {phase === 'off' && (
        <section style={{ textAlign: 'center', padding: '20px 24px 100px' }}>
          <Link to="/shop" className="btn-yt" style={{ borderRadius: 10, padding: '14px 30px', textDecoration: 'none', fontWeight: 700 }}>Shop the store</Link>
        </section>
      )}

      <ProductQuickViewModal open={quickView !== null} product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
};

export default DiwaliSalePage;
