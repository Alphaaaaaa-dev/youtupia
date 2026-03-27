import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const ShopPage = () => {
  const { products, series, addToCart } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();
  const [activeSeries, setActiveSeries] = useState(searchParams.get('series') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const query = searchParams.get('q') || '';
  const [addedId, setAddedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let res = [...products];
    if (activeSeries !== 'all') res = res.filter(p => p.seriesId === activeSeries);
    if (query) res = res.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.tags.some(t => t.includes(query.toLowerCase())));
    if (sortBy === 'price-asc') res.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') res.sort((a, b) => b.price - a.price);
    else res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res;
  }, [products, activeSeries, query, sortBy]);

  const handleAdd = (p: any) => {
    addToCart(p, p.variants[0]?.size || 'M');
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div style={{ paddingTop: '56px', position: 'relative', zIndex: 1 }}>
      {/* Page header */}
      <div style={{ background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', borderBottom: '1px solid hsl(var(--border))', padding: '32px 24px 0' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="page-enter">
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
              {query ? `Results for "${query}"` : activeSeries !== 'all' ? series.find(s => s.id === activeSeries)?.name : 'All Products'}
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.02em' }}>Shop</h1>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '24px' }}>{filtered.length} product{filtered.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '1px' }}>
            <button onClick={() => setActiveSeries('all')} className={`yt-chip ${activeSeries === 'all' ? 'active' : ''}`}>All</button>
            {series.map(s => (
              <button key={s.id} onClick={() => setActiveSeries(s.id)} className={`yt-chip ${activeSeries === s.id ? 'active' : ''}`}>{s.name}</button>
            ))}
          </div>

          {/* Active indicator bar */}
          <div style={{ height: '2px', background: 'transparent', marginTop: '16px', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: 0, height: '2px', background: '#ff0000', borderRadius: '2px 2px 0 0', width: '40px', transition: 'left 0.3s ease' }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px 64px' }}>
        {/* Sort bar */}
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

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '100px 24px' }} className="page-enter">
            <div style={{ fontSize: '52px', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ fontWeight: 700, marginBottom: '10px' }}>Nothing found</h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px' }}>Try a different filter or browse all products</p>
            <button onClick={() => setActiveSeries('all')} className="btn-yt" style={{ borderRadius: '10px' }}>Clear Filters</button>
          </div>
        ) : (
          <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {filtered.map(p => (
              <div key={p.id} className="product-card">
                <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="img-zoom" style={{ position: 'relative', aspectRatio: '3/4', background: 'hsl(var(--secondary))' }}>
                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                    {p.originalPrice && (
                      <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff0000', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.05em', boxShadow: '0 2px 8px rgba(255,0,0,0.4)' }}>
                        {Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                      </span>
                    )}
                    {p.variants.reduce((s: number, v: any) => s + v.stock, 0) < 5 && (
                      <span style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.75)', color: '#fbbf24', fontSize: '9px', fontWeight: 700, padding: '3px 7px', borderRadius: '4px' }}>LOW STOCK</span>
                    )}
                  </div>
                  <div style={{ padding: '12px 12px 4px' }}>
                    <div style={{ fontSize: '10px', color: '#ff0000', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{p.series}</div>
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px', lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '15px', color: '#ff0000' }}>₹{p.price.toLocaleString()}</span>
                      {p.originalPrice && <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      {p.variants.slice(0, 4).map((v: any) => (
                        <span key={v.size} style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: 'hsl(var(--secondary))', color: v.stock === 0 ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))', textDecoration: v.stock === 0 ? 'line-through' : 'none', fontWeight: 600 }}>{v.size}</span>
                      ))}
                    </div>
                  </div>
                </Link>
                <div style={{ padding: '0 10px 10px' }}>
                  <button onClick={() => handleAdd(p)} className="btn-yt ripple"
                    style={{ width: '100%', justifyContent: 'center', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, background: addedId === p.id ? '#16a34a' : '#ff0000', transition: 'background 0.3s' }}>
                    {addedId === p.id ? '✓ Added!' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
