import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { SlidersHorizontal, X } from 'lucide-react';

const ShopPage = () => {
  const { products, series, addToCart } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();
  const [activeSeries, setActiveSeries] = useState(searchParams.get('series') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [priceMax, setPriceMax] = useState(5000);
  const query = searchParams.get('q') || '';

  const filtered = useMemo(() => {
    let res = [...products];
    if (activeSeries !== 'all') res = res.filter(p => p.seriesId === activeSeries);
    if (query) res = res.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.tags.some(t => t.includes(query.toLowerCase())));
    res = res.filter(p => p.price <= priceMax);
    if (sortBy === 'price-asc') res.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') res.sort((a, b) => b.price - a.price);
    else res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return res;
  }, [products, activeSeries, query, priceMax, sortBy]);

  return (
    <div style={{ paddingTop: '56px', maxWidth: '1280px', margin: '0 auto', padding: '72px 24px 48px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0 }}>Shop {query && `— "${query}"`}</h1>
        <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>{filtered.length} products</p>
      </div>

      {/* Filters row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          <button onClick={() => setActiveSeries('all')} className={`yt-chip ${activeSeries === 'all' ? 'active' : ''}`}>All</button>
          {series.map(s => (
            <button key={s.id} onClick={() => setActiveSeries(s.id)} className={`yt-chip ${activeSeries === s.id ? 'active' : ''}`}>{s.name}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '6px 12px', color: 'hsl(var(--foreground))', fontSize: '13px', cursor: 'pointer', outline: 'none' }}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>

      {/* Products grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'hsl(var(--muted-foreground))' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontWeight: 600, marginBottom: '8px' }}>No products found</p>
          <button onClick={() => setActiveSeries('all')} className="btn-yt" style={{ marginTop: '16px' }}>Clear filters</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {filtered.map(p => (
            <div key={p.id} className="product-card fade-in">
              <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', background: 'hsl(var(--secondary))' }}>
                  <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                  {p.originalPrice && <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#ff0000', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>SALE</span>}
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '2px' }}>{p.series}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px', color: '#ff0000' }}>₹{p.price.toLocaleString()}</span>
                    {p.originalPrice && <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
                  </div>
                </div>
              </Link>
              <div style={{ padding: '0 12px 12px' }}>
                <button onClick={() => addToCart(p, p.variants[0]?.size || 'M')} className="btn-yt" style={{ width: '100%', justifyContent: 'center', borderRadius: '6px', padding: '8px', fontSize: '13px' }}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShopPage;
