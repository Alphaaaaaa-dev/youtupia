import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';

const StoreSidebar = () => {
  const { products, addToCart } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Pick 4 random products
  const sidebarProducts = useMemo(() => {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 4);
  }, [products.length]);

  const bg = isDark ? 'hsl(0 0% 9%)' : 'hsl(0 0% 97%)';
  const cardBg = isDark ? 'hsl(0 0% 12%)' : 'white';
  const border = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)';
  const muted = isDark ? '#64748b' : '#94a3b8';
  const text = isDark ? '#f1f5f9' : '#0f172a';

  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      background: bg,
      borderLeft: border,
      display: 'flex',
      flexDirection: 'column',
      gap: '0',
      paddingTop: '8px',
      overflowY: 'auto',
      overflowX: 'hidden',
    }}>

      {/* Header */}
      <div style={{ padding: '14px 14px 8px', borderBottom: border }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <Zap size={12} style={{ color: '#ff0000' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#ff0000', letterSpacing: '0.1em', fontWeight: 700 }}>
            TRENDING NOW
          </span>
        </div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '13px', color: text }}>
          You might like
        </div>
      </div>

      {/* Product cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', padding: '8px 10px', flex: 1 }}>
        {sidebarProducts.map(product => (
          <div key={product.id} style={{
            background: cardBg,
            border,
            borderRadius: '12px',
            marginBottom: '8px',
            overflow: 'hidden',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = isDark ? '0 8px 24px rgba(0,0,0,0.4)' : '0 8px 24px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
          >
            {/* Product image */}
            <Link to={`/product/${product.id}`} style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ position: 'relative', height: '130px', overflow: 'hidden', background: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc' }}>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop'; }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.05)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
                />
                {product.limitedEdition && (
                  <div style={{ position: 'absolute', top: '6px', left: '6px', background: '#ff0000', color: 'white', fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                    LIMITED
                  </div>
                )}
                {product.featured && !product.limitedEdition && (
                  <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(251,191,36,0.9)', color: '#000', fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                    HOT
                  </div>
                )}
              </div>
            </Link>

            {/* Product info */}
            <div style={{ padding: '8px 10px 10px' }}>
              <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '12px', color: text, lineHeight: 1.3, marginBottom: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {product.name}
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: '9px', color: muted, marginBottom: '5px', letterSpacing: '0.05em' }}>
                  {product.series.toUpperCase()}
                </div>
              </Link>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <div>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '13px', color: '#ff0000' }}>
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '10px', color: muted, textDecoration: 'line-through', marginLeft: '4px' }}>
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    const firstVariant = product.variants[0];
                    if (firstVariant) addToCart(product, firstVariant.size, 1);
                  }}
                  title="Quick add"
                  style={{ width: '28px', height: '28px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.1s' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'scale(1.1)'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'scale(1)'; }}
                >
                  <ShoppingBag size={12} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All CTA */}
      <div style={{ padding: '12px 10px', borderTop: border }}>
        <Link to="/shop" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          background: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)',
          borderRadius: '10px', padding: '9px 12px', textDecoration: 'none',
          color: '#ff0000', fontFamily: 'Roboto, sans-serif', fontWeight: 700,
          fontSize: '12px', letterSpacing: '0.03em', transition: 'background 0.15s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,0,0,0.14)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,0,0,0.08)'; }}
        >
          <Star size={11} />
          View All Products
        </Link>
      </div>
    </aside>
  );
};

export default StoreSidebar;
