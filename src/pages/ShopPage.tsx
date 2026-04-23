import { useState, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Heart, ShoppingCart, X } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import ProductQuickViewModal from '../components/ProductQuickViewModal';
import type { Product } from '../contexts/StoreContext';

/* ── Product card ── */
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
      <button
        onClick={onWishlist}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 10,
          background: 'rgba(0,0,0,0.55)',
          border: 'none',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isWishlisted ? '#ff0000' : 'white',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Heart size={14} fill={isWishlisted ? '#ff0000' : 'none'} />
      </button>

      <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ position: 'relative', aspectRatio: '3/4', background: 'hsl(var(--secondary))', overflow: 'hidden' }}>
          <img
            src={p.images[imgIdx] || p.images[0]}
            alt={p.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {p.limitedEdition && (
            <span
              style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: '#ff0000',
                color: 'white',
                fontSize: '9px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px'
              }}
            >
              LIMITED
            </span>
          )}

          {discount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: p.limitedEdition ? '34px' : '10px',
                left: '10px',
                background: '#ff0000',
                color: 'white',
                fontSize: '9px',
                fontWeight: 800,
                padding: '3px 8px',
                borderRadius: '4px'
              }}
            >
              {discount}% OFF
            </span>
          )}
        </div>

        <div style={{ padding: '12px 12px 4px' }}>
          <div style={{ fontSize: '10px', color: '#ff0000', fontWeight: 700 }}>
            {p.series}
          </div>

          <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>
            {p.name}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '15px', color: '#ff0000' }}>
              ₹{p.price.toLocaleString()}
            </span>

            {p.originalPrice && (
              <span style={{ fontSize: '12px', textDecoration: 'line-through' }}>
                ₹{p.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div style={{ padding: '6px 10px 10px', display: 'flex', gap: '6px' }}>
        <button
          onClick={onQuickAdd}
          className="btn-yt"
          style={{ flex: 1 }}
        >
          <ShoppingCart size={12} />
          {isAdded ? 'Added!' : 'Add'}
        </button>

        <button
          onClick={onQuickView}
          className="btn-ghost"
        >
          View
        </button>
      </div>
    </div>
  );
};

/* ── Main ShopPage ── */
const ShopPage = () => {
  const { products, series, addToCart, toggleWishlist, wishlist } = useStore();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedSeries, setSelectedSeries] = useState(searchParams.get('series') || '');
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
        p.series.toLowerCase().includes(q)
      );
    }

    if (selectedSeries) {
      list = list.filter(p => p.seriesId === selectedSeries);
    }

    list = list.filter(p => p.price <= priceMax);

    switch (sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        list.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    return list;
  }, [products, search, selectedSeries, priceMax, sortBy]);

  const clearFilters = () => {
    setSearch('');
    setSelectedSeries('');
    setPriceMax(10000);
    setSortBy('newest');
  };

  const handleQuickAdd = (p: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const v = p.variants.find(v => v.stock > 0);
    if (!v) return;

    addToCart(p, v.size);

    setAddedIds(prev => {
      const next = new Set(prev);
      next.add(p.id);
      return next;
    });

    setTimeout(() => {
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });
    }, 1800);
  };

  return (
    <div>
      <div style={{ padding: '32px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 900 }}>
          {selectedSeries
            ? `Shop — ${series.find(s => s.id === selectedSeries)?.name || ''}`
            : 'Shop All'}
        </h1>
      </div>

      <div style={{ padding: '24px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center' }}>
            <h3>No products found</h3>
            <button onClick={clearFilters} className="btn-yt">
              Clear Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
              gap: '16px'
            }}
          >
            {filtered.map(p => (
              <ProductCard
                key={p.id}
                p={p}
                isWishlisted={wishlist.includes(p.id)}
                isAdded={addedIds.has(p.id)}
                onWishlist={e => {
                  e.preventDefault();
                  toggleWishlist(p.id);
                }}
                onQuickAdd={e => handleQuickAdd(p, e)}
                onQuickView={e => {
                  e.preventDefault();
                  setQuickView(p);
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ProductQuickViewModal
        open={quickView !== null}
        product={quickView}
        onClose={() => setQuickView(null)}
      />
    </div>
  );
};

export default ShopPage;
