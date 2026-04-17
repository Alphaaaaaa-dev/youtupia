import { useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart, ShoppingCart, X } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import type { Product } from '../contexts/StoreContext';

/* ── Product card with image cycling on hover (Souled Store style) ── */
const ProductCard = ({
  p,
  isWishlisted,
  isAdded,
  onWishlist,
  onQuickAdd,
  onQuickView,
}: {
  p: Product;
  isWishlisted: boolean;
  isAdded: boolean;
  onWishlist: (e: React.MouseEvent) => void;
  onQuickAdd: (e: React.MouseEvent) => void;
  onQuickView: (e: React.MouseEvent) => void;
}) => {
  const [imgIdx, setImgIdx] = useState(0);
  const [hoverTimer, setHoverTimer] = useState<ReturnType<typeof setInterval> | null>(null);

  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  const startCycling = useCallback(() => {
    if (p.images.length <= 1) return;
    let idx = 0;
    const t = setInterval(() => {
      idx = (idx + 1) % p.images.length;
      setImgIdx(idx);
    }, 700);
    setHoverTimer(t);
  }, [p.images.length]);

  const stopCycling = useCallback(() => {
    if (hoverTimer) {
      clearInterval(hoverTimer);
      setHoverTimer(null);
    }
    setImgIdx(0);
  }, [hoverTimer]);

  return (
    <div
      className="product-card"
      style={{ position: 'relative' }}
      onMouseEnter={startCycling}
      onMouseLeave={stopCycling}
    >
      {/* Wishlist button */}
      <button
        onClick={onWishlist}
        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isWishlisted ? '#ff0000' : 'white', backdropFilter: 'blur(4px)' }}
      >
        <Heart size={14} fill={isWishlisted ? '#ff0000' : 'none'} />
      </button>

      {/* Image dot indicators */}
      {p.images.length > 1 && (
        <div style={{ position: 'absolute', bottom: '42%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px', zIndex: 5 }}>
          {p.images.map((_, i) => (
            <div
              key={i}
              style={{ width: '5px', height: '5px', borderRadius: '50%', background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.4)', transition: 'background 0.2s' }}
            />
          ))}
        </div>
      )}

      <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', aspectRatio: '3/4', background: 'hsl(var(--secondary))', overflow: 'hidden' }}>
          <img
            src={p.images[imgIdx] || p.images[0]}
            alt={p.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s ease' }}
            onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
          />
          {p.limitedEdition && (
            <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff0000', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>LIMITED</span>
          )}
          {discount > 0 && (
            <span style={{ position: 'absolute', top: p.limitedEdition ? '34px' : '10px', left: '10px', background: '#ff0000', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
              {discount}% OFF
            </span>
          )}
          {totalStock === 0 && !p.preorder && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '12px', fontWeight: 700, padding: '6px 14px', borderRadius: '20px' }}>Sold Out</span>
            </div>
          )}
        </div>
        <div style={{ padding: '12px 12px 4px' }}>
          <div style={{ fontSize: '10px', color: '#ff0000', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{p.series}</div>
          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '15px', color: '#ff0000' }}>₹{p.price.toLocaleString()}</span>
            {p.originalPrice && <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
          </div>
        </div>
      </Link>

      <div style={{ padding: '6px 10px 10px', display: 'flex', gap: '6px' }}>
        <button
          onClick={onQuickAdd}
          disabled={totalStock === 0 && !p.preorder}
          className="btn-yt ripple"
          style={{ flex: 1, justifyContent: 'center', borderRadius: '8px', padding: '9px', fontSize: '12px', fontWeight: 600, background: isAdded ? '#16a34a' : '#ff0000', transition: 'background 0.3s', display: 'flex', alignItems: 'center', gap: '5px', opacity: totalStock === 0 && !p.preorder ? 0.5 : 1, border: 'none', cursor: totalStock === 0 && !p.preorder ? 'not-allowed' : 'pointer', fontFamily: 'Roboto, sans-serif' }}
        >
          <ShoppingCart size={12} />
          {isAdded ? 'Added!' : totalStock === 0 && !p.preorder ? 'Sold Out' : 'Add'}
        </button>
        <button
          onClick={onQuickView}
          className="btn-ghost"
          style={{ padding: '9px 12px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          View
        </button>
      </div>
    </div>
  );
};

/* ── Main ShopPage ── */
const ShopPage = () => {
  const { products, series, drops, addToCart, toggleWishlist, wishlist } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedSeries, setSelectedSeries] = useState(searchParams.get('series') || '');
  const [selectedDrop, setSelectedDrop] = useState(searchParams.get('drop') || '');
  const [sortBy, setSortBy] = useState('newest');
  const [priceMax, setPriceMax] = useState(10000);
  const [showFilters, setShowFilters] = useState(false);
  const [quickView, setQuickView] = useState<Product | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedSeries) list = list.filter(p => p.seriesId === selectedSeries);
    if (selectedDrop) list = list.filter(p => p.dropId === selectedDrop);
    list = list.filter(p => p.price <= priceMax);
    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'newest': list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case 'featured': list.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
    }
    return list;
  }, [products, search, selectedSeries, selectedDrop, priceMax, sortBy]);

  const clearFilters = () => {
    setSearch(''); setSelectedSeries(''); setSelectedDrop('');
    setPriceMax(10000); setSortBy('newest');
  };

  const hasFilters = search || selectedSeries || selectedDrop || priceMax < 10000;

  const handleQuickAdd = (p: Product, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const v = p.variants.find(v => v.stock > 0) || (p.preorder ? p.variants[0] : undefined);
    if (!v) return;
    addToCart(p, v.size);
    setAddedIds(prev => { const next = new Set(prev); next.add(p.id); return next; });
    setTimeout(() => setAddedIds(prev => { const next = new Set(prev); next.delete(p.id); return next; }), 1800);
  };

  return (
    <div style={{ paddingTop: '0px' }}>
      {/* Header */}
      <div style={{ background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', borderBottom: '1px solid hsl(var(--border))', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            {selectedSeries
              ? `Shop — ${series.find(s => s.id === selectedSeries)?.name || ''}`
              : selectedDrop
              ? `Shop — ${drops.find(d => d.id === selectedDrop)?.name || ''}`
              : 'Shop All'}
          </h1>
          <div style={{ display: 'flex', gap: '10px', maxWidth: '600px' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={15} style={{ position: 'absolute', left: '13px', color: 'hsl(var(--muted-foreground))', pointerEvents: 'none' }} />
              <input
                type="text" placeholder="Search products..." value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 38px', background: isDark ? 'hsl(0 0% 9%)' : 'white', border: '1px solid hsl(var(--border))', borderRadius: '10px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }}
              />
            </div>
            <button
              onClick={() => setShowFilters(f => !f)}
              style={{ padding: '10px 16px', borderRadius: '10px', border: `1px solid ${showFilters ? '#ff0000' : 'hsl(var(--border))'}`, background: showFilters ? 'rgba(255,0,0,0.06)' : 'transparent', color: showFilters ? '#ff0000' : 'hsl(var(--foreground))', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '14px', fontFamily: 'Roboto, sans-serif', fontWeight: 500 }}>
              <SlidersHorizontal size={15} /> Filters
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px 64px' }}>
        {/* Filter panel */}
        {showFilters && (
          <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Series</label>
              <select value={selectedSeries} onChange={e => setSelectedSeries(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                <option value="">All Series</option>
                {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Drop</label>
              <select value={selectedDrop} onChange={e => setSelectedDrop(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                <option value="">All Drops</option>
                {drops.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: '100%', padding: '8px 12px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '13px', outline: 'none', cursor: 'pointer' }}>
                <option value="newest">Newest First</option>
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase' as const, letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>
                Max Price: ₹{priceMax.toLocaleString()}
              </label>
              <input type="range" min={200} max={10000} step={100} value={priceMax} onChange={e => setPriceMax(Number(e.target.value))} style={{ width: '100%', accentColor: '#ff0000' }} />
            </div>
          </div>
        )}

        {/* Count + chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</span>
          {selectedSeries && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '20px', fontSize: '12px', color: '#ff0000', fontWeight: 600 }}>
              {series.find(s => s.id === selectedSeries)?.name}
              <button onClick={() => setSelectedSeries('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff0000', padding: '0', display: 'flex' }}><X size={11} /></button>
            </span>
          )}
          {selectedDrop && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '20px', fontSize: '12px', color: '#ff0000', fontWeight: 600 }}>
              {drops.find(d => d.id === selectedDrop)?.name}
              <button onClick={() => setSelectedDrop('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff0000', padding: '0', display: 'flex' }}><X size={11} /></button>
            </span>
          )}
          {hasFilters && (
            <button onClick={clearFilters} style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Roboto, sans-serif' }}>
              Clear all
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 24px', color: 'hsl(var(--muted-foreground))' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>No products found</h3>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>Try adjusting your filters or search.</p>
            <button onClick={clearFilters} className="btn-yt" style={{ borderRadius: '10px' }}>Clear Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                p={p}
                isWishlisted={wishlist.includes(p.id)}
                isAdded={addedIds.has(p.id)}
                onWishlist={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist(p.id); }}
                onQuickAdd={e => handleQuickAdd(p, e)}
                onQuickView={e => { e.preventDefault(); setQuickView(p); }}
              />
            ))}
          </div>
        )}
      </div>

      <ProductQuickViewModal open={quickView !== null} product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
};

export default ShopPage;
