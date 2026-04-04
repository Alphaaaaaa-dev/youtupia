import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { Heart, Eye, ShoppingCart, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductQuickViewModal from '@/components/ProductQuickViewModal';
import type { Product, ProductVariant } from '@/contexts/StoreContext';

// ── Category definitions (extend as your catalog grows) ──────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: '🛍️' },
  { id: 'tshirt', label: 'T-Shirts', icon: '👕' },
  { id: 'hoodie', label: 'Hoodies', icon: '🧥' },
  { id: 'jacket', label: 'Jackets', icon: '🫱' },
  { id: 'cap', label: 'Caps', icon: '🧢' },
  { id: 'sticker', label: 'Accessories', icon: '📦' },
];

// Map product tags → category ids
const tagToCategory = (tags: string[]): string => {
  if (tags.some(t => ['hoodie'].includes(t))) return 'hoodie';
  if (tags.some(t => ['jacket'].includes(t))) return 'jacket';
  if (tags.some(t => ['cap'].includes(t))) return 'cap';
  if (tags.some(t => ['sticker', 'accessory'].includes(t))) return 'sticker';
  if (tags.some(t => ['tshirt'].includes(t))) return 'tshirt';
  return 'tshirt';
};

// ─────────────────────────────────────────────────────────────────────────────

const ShopPage = () => {
  const { products, series, drops, addToCart, toggleWishlist, wishlist, hydrating } = useStore();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();

  // Filters
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSeries, setActiveSeries] = useState(searchParams.get('series') || 'all');
  const [activeDrop, setActiveDrop] = useState(searchParams.get('drop') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 9999]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);

  // UI state
  const [filterMode, setFilterMode] = useState<'series' | 'drop'>('series');
  const [sidebarOpen, setSidebarOpen] = useState(true);      // desktop: always open; mobile: toggle
  const [mobileSideOpen, setMobileSideOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState({ categories: true, collections: true, price: true, availability: true });
  const [addedId, setAddedId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const query = searchParams.get('q') || '';

  useEffect(() => {
    if (searchParams.get('drop')) setFilterMode('drop');
  }, []);

  // Max price from products
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 999), [products]);

  const filtered = useMemo(() => {
    let res = [...products];
    if (activeCategory !== 'all') res = res.filter(p => tagToCategory(p.tags) === activeCategory);
    if (filterMode === 'series' && activeSeries !== 'all') res = res.filter(p => p.seriesId === activeSeries);
    if (filterMode === 'drop' && activeDrop !== 'all') res = res.filter(p => p.dropId === activeDrop);
    if (query) res = res.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.tags.some(t => t.includes(query.toLowerCase())));
    if (showInStockOnly) res = res.filter(p => p.variants.some(v => v.stock > 0));
    res = res.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (sortBy === 'price-asc') res.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') res.sort((a, b) => b.price - a.price);
    else res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res;
  }, [products, activeCategory, activeSeries, activeDrop, filterMode, query, showInStockOnly, priceRange, sortBy]);

  const hasActiveFilters = activeCategory !== 'all' || activeSeries !== 'all' || activeDrop !== 'all' || showInStockOnly;

  const clearAll = () => {
    setActiveCategory('all');
    setActiveSeries('all');
    setActiveDrop('all');
    setShowInStockOnly(false);
    setPriceRange([0, maxPrice]);
  };

  const handleAdd = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const inStock = p.variants.find(v => v.stock > 0);
    if (!inStock) return;
    addToCart(p, inStock.size || 'M');
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const handleWishlist = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(productId);
  };

  const handleQuickView = (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProduct(p);
    setQuickViewOpen(true);
  };

  // ── Sidebar section toggle helper
  const toggleSection = (key: keyof typeof sectionsOpen) =>
    setSectionsOpen(s => ({ ...s, [key]: !s[key] }));

  // ── Sidebar panel (reused for desktop + mobile drawer)
  const SidebarContent = () => (
    <div style={{ padding: '0 0 40px' }}>

      {/* Header row */}
      <div style={{ padding: '18px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Filters</span>
        {hasActiveFilters && (
          <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#ff0000', fontWeight: 700, padding: 0 }}>
            Clear all
          </button>
        )}
      </div>

      {/* ── CATEGORIES ── */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <button onClick={() => toggleSection('categories')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: 'hsl(var(--foreground))' }}>
          Categories
          {sectionsOpen.categories ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {sectionsOpen.categories && (
          <div style={{ padding: '0 8px 10px' }}>
            {CATEGORIES.map(cat => {
              const count = cat.id === 'all' ? products.length : products.filter(p => tagToCategory(p.tags) === cat.id).length;
              const active = activeCategory === cat.id;
              return (
                <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    background: active ? 'rgba(255,0,0,0.08)' : 'none',
                    color: active ? '#ff0000' : 'hsl(var(--foreground))',
                    fontWeight: active ? 700 : 400, fontSize: '13px', fontFamily: 'Roboto, sans-serif',
                    textAlign: 'left', transition: 'all 0.15s',
                    borderLeft: active ? '3px solid #ff0000' : '3px solid transparent',
                  }}>
                  <span style={{ fontSize: '15px' }}>{cat.icon}</span>
                  <span style={{ flex: 1 }}>{cat.label}</span>
                  <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── COLLECTIONS (Series / Drops) ── */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <button onClick={() => toggleSection('collections')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: 'hsl(var(--foreground))' }}>
          Collections
          {sectionsOpen.collections ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {sectionsOpen.collections && (
          <div style={{ padding: '0 8px 10px' }}>
            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: '4px', margin: '0 8px 8px', background: 'hsl(var(--secondary))', borderRadius: '8px', padding: '3px' }}>
              {(['series', 'drop'] as const).map(m => (
                <button key={m} onClick={() => setFilterMode(m)}
                  style={{ flex: 1, padding: '4px 0', border: 'none', cursor: 'pointer', borderRadius: '6px', fontSize: '11px', fontWeight: 600, fontFamily: 'Roboto, sans-serif', textTransform: 'capitalize', background: filterMode === m ? '#ff0000' : 'transparent', color: filterMode === m ? 'white' : 'hsl(var(--muted-foreground))', transition: 'all 0.15s' }}>
                  {m === 'series' ? 'Series' : 'Drops'}
                </button>
              ))}
            </div>

            {filterMode === 'series' ? (
              <>
                {[{ id: 'all', name: 'All Series' }, ...series].map(s => {
                  const active = activeSeries === s.id;
                  return (
                    <button key={s.id} onClick={() => setActiveSeries(s.id)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: active ? 'rgba(255,0,0,0.08)' : 'none', color: active ? '#ff0000' : 'hsl(var(--foreground))', fontWeight: active ? 700 : 400, fontSize: '13px', fontFamily: 'Roboto, sans-serif', textAlign: 'left', transition: 'all 0.15s', borderLeft: active ? '3px solid #ff0000' : '3px solid transparent' }}>
                      {s.name}
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                {[{ id: 'all', name: 'All Drops', limited: false }, ...drops].map(d => {
                  const active = activeDrop === d.id;
                  return (
                    <button key={d.id} onClick={() => setActiveDrop(d.id)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: active ? 'rgba(255,0,0,0.08)' : 'none', color: active ? '#ff0000' : 'hsl(var(--foreground))', fontWeight: active ? 700 : 400, fontSize: '13px', fontFamily: 'Roboto, sans-serif', textAlign: 'left', transition: 'all 0.15s', borderLeft: active ? '3px solid #ff0000' : '3px solid transparent' }}>
                      {d.limited && <span style={{ fontSize: '10px' }}>🔒</span>}{d.name}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── PRICE RANGE ── */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <button onClick={() => toggleSection('price')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: 'hsl(var(--foreground))' }}>
          Price Range
          {sectionsOpen.price ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {sectionsOpen.price && (
          <div style={{ padding: '4px 16px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1] >= 9999 ? maxPrice + '+' : priceRange[1]}</span>
            </div>
            <input type="range" min={0} max={maxPrice} value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
              style={{ width: '100%', accentColor: '#ff0000', cursor: 'pointer' }} />
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              {[499, 999, 1999].map(p => (
                <button key={p} onClick={() => setPriceRange([0, p])}
                  style={{ flex: 1, padding: '4px', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: priceRange[1] === p ? '#ff0000' : 'hsl(var(--secondary))', color: priceRange[1] === p ? 'white' : 'hsl(var(--muted-foreground))', fontSize: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Roboto, sans-serif' }}>
                  ≤₹{p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── AVAILABILITY ── */}
      <div style={{ borderTop: '1px solid hsl(var(--border))' }}>
        <button onClick={() => toggleSection('availability')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: 'hsl(var(--foreground))' }}>
          Availability
          {sectionsOpen.availability ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        {sectionsOpen.availability && (
          <div style={{ padding: '4px 16px 14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <div onClick={() => setShowInStockOnly(!showInStockOnly)}
                style={{ width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${showInStockOnly ? '#ff0000' : 'hsl(var(--border))'}`, background: showInStockOnly ? '#ff0000' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', cursor: 'pointer', flexShrink: 0 }}>
                {showInStockOnly && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ fontSize: '13px' }}>In stock only</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: '24px', minHeight: '100vh', position: 'relative', zIndex: 1 }}>

      {/* ── Promo / breadcrumb bar ── */}
      <div style={{ background: isDark ? 'hsl(0 0% 6%)' : '#f8f8f8', borderBottom: '1px solid hsl(var(--border))', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
          <span style={{ color: 'hsl(var(--foreground))', fontWeight: 500 }}>Home</span>
          <span style={{ margin: '0 6px' }}>›</span>
          <span style={{ color: '#ff0000', fontWeight: 600 }}>Shop</span>
          {query && <><span style={{ margin: '0 6px' }}>›</span><span>"{query}"</span></>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
          <span style={{ color: '#16a34a', fontWeight: 600 }}>🚚 Free shipping</span> on orders above ₹999
        </div>
      </div>

      {/* ── Main layout: sidebar + content ── */}
      <div style={{ display: 'flex', maxWidth: '1400px', margin: '0 auto' }}>

        {/* ════ LEFT SIDEBAR — desktop (always visible ≥ 900px) ════ */}
        <aside style={{
          width: '240px', flexShrink: 0,
          background: isDark ? 'hsl(0 0% 7%)' : 'white',
          borderRight: '1px solid hsl(var(--border))',
          minHeight: 'calc(100vh - 96px)',
          position: 'sticky', top: '96px', alignSelf: 'flex-start',
          overflowY: 'auto', maxHeight: 'calc(100vh - 96px)',
          // Hide below 900px — mobile uses drawer
          display: 'none',
        }}
          className="shop-sidebar">
          <SidebarContent />
        </aside>

        {/* ════ CONTENT AREA ════ */}
        <main style={{ flex: 1, minWidth: 0, padding: '0 0 64px' }}>

          {/* Toolbar */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))' }}>
            {/* Mobile filter button */}
            <button onClick={() => setMobileSideOpen(true)}
              className="shop-filter-btn"
              style={{ display: 'none', alignItems: 'center', gap: '6px', padding: '7px 14px', border: '1px solid hsl(var(--border))', borderRadius: '8px', background: hasActiveFilters ? '#ff0000' : 'hsl(var(--card))', color: hasActiveFilters ? 'white' : 'hsl(var(--foreground))', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'Roboto, sans-serif' }}>
              <SlidersHorizontal size={14} />
              Filters {hasActiveFilters && `(on)`}
            </button>

            <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', flex: 1 }}>
              <span style={{ fontWeight: 700, color: 'hsl(var(--foreground))' }}>{filtered.length}</span> products
              {query && <span> for "<strong>{query}</strong>"</span>}
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                {activeCategory !== 'all' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(255,0,0,0.1)', color: '#ff0000', fontSize: '11px', fontWeight: 600 }}>
                    {CATEGORIES.find(c => c.id === activeCategory)?.label}
                    <button onClick={() => setActiveCategory('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ff0000', display: 'flex' }}><X size={10} /></button>
                  </span>
                )}
                {activeSeries !== 'all' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(255,0,0,0.1)', color: '#ff0000', fontSize: '11px', fontWeight: 600 }}>
                    {series.find(s => s.id === activeSeries)?.name}
                    <button onClick={() => setActiveSeries('all')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ff0000', display: 'flex' }}><X size={10} /></button>
                  </span>
                )}
                {showInStockOnly && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '20px', background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: '11px', fontWeight: 600 }}>
                    In stock
                    <button onClick={() => setShowInStockOnly(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#16a34a', display: 'flex' }}><X size={10} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Sort */}
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', fontSize: '13px', cursor: 'pointer', outline: 'none', fontFamily: 'Roboto, sans-serif' }}>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          {/* Product grid */}
          <div style={{ padding: '20px' }}>
            {hydrating ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, overflow: 'hidden' }}>
                    <Skeleton className="w-full" style={{ aspectRatio: '3/4' }} />
                    <div style={{ padding: 12 }}><Skeleton className="h-3 w-2/3" /><div style={{ height: 8 }} /><Skeleton className="h-3 w-full" /><div style={{ height: 8 }} /><Skeleton className="h-3 w-1/2" /></div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 24px' }}>
                <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔍</div>
                <h2 style={{ fontWeight: 700, marginBottom: '10px' }}>Nothing found</h2>
                <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px' }}>Try different filters or browse everything</p>
                <button onClick={clearAll} className="btn-yt" style={{ borderRadius: '10px' }}>Clear Filters</button>
              </div>
            ) : (
              <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '16px' }}>
                {filtered.map(p => {
                  const totalStock = p.variants.reduce((s: number, v: ProductVariant) => s + v.stock, 0);
                  const isWishlisted = wishlist.includes(p.id);
                  const inStock = totalStock > 0;
                  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

                  return (
                    <div key={p.id} className="product-card" style={{ position: 'relative', cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredId(p.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => navigate(`/product/${p.id}`)}>

                      {/* Wishlist btn */}
                      <button onClick={e => handleWishlist(p.id, e)}
                        style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 20, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isWishlisted ? '#ff0000' : 'white', transition: 'transform 0.2s', transform: isWishlisted ? 'scale(1.1)' : 'scale(1)' }}>
                        <Heart size={14} fill={isWishlisted ? '#ff0000' : 'none'} />
                      </button>

                      {/* Image with hover swap */}
                      <div className="img-zoom" style={{ position: 'relative', aspectRatio: '3/4', background: 'hsl(var(--secondary))', overflow: 'hidden' }}>
                        <img src={p.images[0]} alt={p.name} loading="lazy"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0, opacity: hoveredId === p.id && p.images.length > 1 ? 0 : 1, transition: 'opacity 0.35s ease' }}
                          onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                        {p.images.length > 1 && (
                          <img src={p.images[1]} alt={p.name + ' alt'} loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0, opacity: hoveredId === p.id ? 1 : 0, transform: hoveredId === p.id ? 'scale(1.04)' : 'scale(1)', transition: 'opacity 0.35s ease, transform 0.35s ease' }}
                            onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                        )}
                        {discount > 0 && <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff0000', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', zIndex: 5 }}>{discount}% OFF</span>}
                        {p.limitedEdition && <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.75)', color: '#ff0000', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,0,0,0.3)', zIndex: 5 }}>LIMITED</span>}
                        {totalStock > 0 && totalStock < 5 && <span style={{ position: 'absolute', top: discount ? '34px' : '10px', left: '10px', background: 'rgba(0,0,0,0.75)', color: '#fbbf24', fontSize: '9px', fontWeight: 700, padding: '3px 7px', borderRadius: '4px', zIndex: 5 }}>ONLY {totalStock} LEFT</span>}
                        {totalStock === 0 && <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.8)', color: '#94a3b8', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', zIndex: 5 }}>SOLD OUT</span>}
                        {p.viewerCount && p.viewerCount > 3 && (
                          <span style={{ position: 'absolute', bottom: p.limitedEdition ? '30px' : '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)', fontSize: '9px', padding: '3px 7px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px', zIndex: 5 }}>
                            <Eye size={8} /> {p.viewerCount} viewing
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ padding: '10px 10px 4px' }}>
                        <div style={{ fontSize: '10px', color: '#ff0000', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{p.series}</div>
                        <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', lineHeight: 1.3 }}>{p.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 800, fontSize: '15px', color: '#ff0000' }}>₹{p.price.toLocaleString()}</span>
                          {p.originalPrice && <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap' }}>
                          {p.variants.slice(0, 5).map((v: ProductVariant) => (
                            <span key={v.size} style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: 'hsl(var(--secondary))', color: v.stock === 0 ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))', textDecoration: v.stock === 0 ? 'line-through' : 'none', fontWeight: 600 }}>{v.size}</span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ padding: '8px 10px 10px', display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={e => handleAdd(p, e)} disabled={!inStock}
                          style={{ flex: 1, justifyContent: 'center', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, background: !inStock ? 'hsl(var(--secondary))' : addedId === p.id ? '#16a34a' : '#ff0000', color: !inStock ? 'hsl(var(--muted-foreground))' : 'white', transition: 'background 0.25s', display: 'flex', alignItems: 'center', gap: '6px', border: 'none', cursor: inStock ? 'pointer' : 'not-allowed', fontFamily: 'Roboto, sans-serif' }}>
                          <ShoppingCart size={13} />
                          {!inStock ? 'Out of Stock' : addedId === p.id ? '✓ Added!' : 'Add to Cart'}
                        </button>
                        <button onClick={e => handleQuickView(p, e)} title="Quick view"
                          style={{ width: '38px', borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--secondary))', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--muted-foreground))', flexShrink: 0, transition: 'all 0.15s' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ff0000'; (e.currentTarget as HTMLElement).style.color = '#ff0000'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'hsl(var(--border))'; (e.currentTarget as HTMLElement).style.color = 'hsl(var(--muted-foreground))'; }}>
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ════ MOBILE SIDEBAR DRAWER ════ */}
      <div onClick={() => setMobileSideOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 150, backdropFilter: 'blur(3px)', opacity: mobileSideOpen ? 1 : 0, pointerEvents: mobileSideOpen ? 'auto' : 'none', transition: 'opacity 0.25s' }} />
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '280px', background: isDark ? 'hsl(0 0% 9%)' : 'white', zIndex: 151, overflowY: 'auto', transform: mobileSideOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)', boxShadow: mobileSideOpen ? '8px 0 32px rgba(0,0,0,0.3)' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid hsl(var(--border))' }}>
          <span style={{ fontWeight: 800, fontSize: '16px' }}>Filter & Sort</span>
          <button onClick={() => setMobileSideOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--foreground))', display: 'flex' }}><X size={20} /></button>
        </div>
        <SidebarContent />
      </div>

      {/* Responsive CSS injected inline */}
      <style>{`
        @media (min-width: 900px) {
          .shop-sidebar { display: block !important; }
          .shop-filter-btn { display: none !important; }
        }
        @media (max-width: 899px) {
          .shop-sidebar { display: none !important; }
          .shop-filter-btn { display: flex !important; }
        }
      `}</style>

      <ProductQuickViewModal open={quickViewOpen} product={quickViewProduct} onClose={() => { setQuickViewOpen(false); setQuickViewProduct(null); }} />
    </div>
  );
};

export default ShopPage;
