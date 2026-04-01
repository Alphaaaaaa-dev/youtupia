import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { SlidersHorizontal, ArrowUpDown, Heart, Eye, ShoppingCart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ProductQuickViewModal from '@/components/ProductQuickViewModal';
import type { Product, ProductVariant } from '@/contexts/StoreContext';

const ShopPage = () => {
  const { products, series, drops, addToCart, toggleWishlist, wishlist, hydrating } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();
  const [activeSeries, setActiveSeries] = useState(searchParams.get('series') || 'all');
  const [activeDrop, setActiveDrop] = useState(searchParams.get('drop') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [filterMode, setFilterMode] = useState<'series' | 'drop'>('series');
  const query = searchParams.get('q') || '';
  const [addedId, setAddedId] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('drop')) setFilterMode('drop');
  }, []);

  const filtered = useMemo(() => {
    let res = [...products];
    if (filterMode === 'series' && activeSeries !== 'all') res = res.filter(p => p.seriesId === activeSeries);
    if (filterMode === 'drop' && activeDrop !== 'all') res = res.filter(p => p.dropId === activeDrop);
    if (query) res = res.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.tags.some(t => t.includes(query.toLowerCase())));
    if (sortBy === 'price-asc') res.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') res.sort((a, b) => b.price - a.price);
    else res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res;
  }, [products, activeSeries, activeDrop, filterMode, query, sortBy]);

  const handleAdd = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    const inStock = p.variants.find(v => v.stock > 0);
    if (!inStock) return;
    addToCart(p, inStock.size || 'M');
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div style={{ paddingTop: '56px', position: 'relative', zIndex: 1 }}>
      <div style={{ background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', borderBottom: '1px solid hsl(var(--border))', padding: '32px 24px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="page-enter">
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
              {query ? `Results for "${query}"` : 'All Products'}
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Shop</h1>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '20px' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Filter mode toggle */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {(['series', 'drop'] as const).map(mode => (
              <button key={mode} onClick={() => setFilterMode(mode)}
                style={{ padding: '5px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 600, fontFamily: 'Roboto, sans-serif', textTransform: 'capitalize', background: filterMode === mode ? '#ff0000' : 'hsl(var(--secondary))', color: filterMode === mode ? 'white' : 'hsl(var(--muted-foreground))', transition: 'all 0.15s' }}>
                By {mode}
              </button>
            ))}
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '1px' }}>
            {filterMode === 'series' ? (
              <>
                <button onClick={() => setActiveSeries('all')} className={`yt-chip ${activeSeries === 'all' ? 'active' : ''}`}>All</button>
                {series.map(s => (
                  <button key={s.id} onClick={() => setActiveSeries(s.id)} className={`yt-chip ${activeSeries === s.id ? 'active' : ''}`}>{s.name}</button>
                ))}
              </>
            ) : (
              <>
                <button onClick={() => setActiveDrop('all')} className={`yt-chip ${activeDrop === 'all' ? 'active' : ''}`}>All Drops</button>
                {drops.map(d => (
                  <button key={d.id} onClick={() => setActiveDrop(d.id)} className={`yt-chip ${activeDrop === d.id ? 'active' : ''}`}>
                    {d.limited && '🔒 '}{d.name}
                  </button>
                ))}
              </>
            )}
          </div>
          <div style={{ height: '2px', background: 'transparent', marginTop: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 0, height: '2px', background: '#ff0000', borderRadius: '2px 2px 0 0', width: '40px' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px 64px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{filtered.length} items</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowUpDown size={13} style={{ color: 'hsl(var(--muted-foreground))' }} />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '7px 12px', color: 'hsl(var(--foreground))', fontSize: '13px', cursor: 'pointer', outline: 'none', fontFamily: 'Roboto, sans-serif' }}>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        {hydrating ? (
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, overflow: 'hidden' }}>
                <Skeleton className="w-full" style={{ aspectRatio: '3/4' }} />
                <div style={{ padding: 12 }}>
                  <Skeleton className="h-3 w-2/3" />
                  <div style={{ height: 8 }} />
                  <Skeleton className="h-3 w-full" />
                  <div style={{ height: 8 }} />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 24px' }} className="page-enter">
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ fontWeight: 700, marginBottom: '10px' }}>Nothing found</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px' }}>Try a different filter or browse all products</p>
            <button onClick={() => { setActiveSeries('all'); setActiveDrop('all'); }} className="btn-yt" style={{ borderRadius: '10px' }}>Clear Filters</button>
          </div>
        ) : (
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {filtered.map(p => {
              const totalStock = p.variants.reduce((s: number, v: ProductVariant) => s + v.stock, 0);
              const isWishlisted = wishlist.includes(p.id);
              const inStock = totalStock > 0;
              return (
                <div key={p.id} className="product-card" style={{ position: 'relative' }}>
                  {/* Wishlist */}
                  <button onClick={() => toggleWishlist(p.id)}
                    style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: isWishlisted ? '#ff0000' : 'white', transition: 'transform 0.2s', transform: isWishlisted ? 'scale(1.1)' : 'scale(1)' }}>
                    <Heart size={14} fill={isWishlisted ? '#ff0000' : 'none'} />
                  </button>

                  {/* Clicking image area opens quick view */}
                  <div onClick={() => { setQuickViewProduct(p); setQuickViewOpen(true); }} style={{ cursor: 'pointer' }}>
                    <div className="img-zoom" style={{ position: 'relative', aspectRatio: '3/4', background: 'hsl(var(--secondary))' }}>
                      <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                      {p.originalPrice && <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff0000', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(255,0,0,0.4)' }}>{Math.round((1 - p.price / p.originalPrice) * 100)}% OFF</span>}
                      {p.limitedEdition && <span style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.75)', color: '#ff0000', fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,0,0,0.3)' }}>LIMITED</span>}
                      {totalStock < 5 && totalStock > 0 && <span style={{ position: 'absolute', top: '10px', right: p.originalPrice ? 'auto' : '10px', left: p.originalPrice ? 'auto' : 'auto', background: 'rgba(0,0,0,0.75)', color: '#fbbf24', fontSize: '9px', fontWeight: 700, padding: '3px 7px', borderRadius: '4px' }}>LOW STOCK</span>}
                      {/* Viewer count */}
                      {p.viewerCount && p.viewerCount > 3 && (
                        <span style={{ position: 'absolute', bottom: p.limitedEdition ? '30px' : '10px', left: '10px', background: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.8)', fontSize: '9px', padding: '3px 7px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Eye size={8} /> {p.viewerCount} viewing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Product info — click name/price opens product page */}
                  <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ padding: '0 10px 4px' }}>
                    <div style={{ fontSize: '10px', color: '#ff0000', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{p.series}</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#ff0000' }}>₹{p.price.toLocaleString()}</span>
                      {p.originalPrice && <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
                    </div>
                  </div>
                  </Link>

                  <div style={{ padding: '0 10px 10px', display: 'flex', gap: '6px' }}>
                    <button onClick={e => handleAdd(p, e)} className="btn-yt ripple"
                      disabled={!inStock}
                      style={{ flex: 1, justifyContent: 'center', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, background: !inStock ? '#475569' : addedId === p.id ? '#16a34a' : '#ff0000', transition: 'background 0.3s', display: 'flex', alignItems: 'center', gap: '6px', cursor: inStock ? 'pointer' : 'not-allowed', opacity: inStock ? 1 : 0.75 }}>
                      <ShoppingCart size={13} /> {!inStock ? 'Out of Stock' : addedId === p.id ? '✓ Added!' : 'Add to Cart'}
                    </button>
                    <button onClick={(e) => { e.preventDefault(); setQuickViewProduct(p); setQuickViewOpen(true); }}
                      title="Quick view"
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

      <ProductQuickViewModal
        open={quickViewOpen}
        product={quickViewProduct}
        onClose={() => {
          setQuickViewOpen(false);
          setQuickViewProduct(null);
        }}
      />
    </div>
  );
};

export default ShopPage;
 
