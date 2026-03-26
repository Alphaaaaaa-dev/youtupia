import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Zap, Star, Truck, Shield } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';

const ProductPage = () => {
  const { id } = useParams();
  const { products, addToCart } = useStore();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [added, setAdded] = useState(false);

  if (!product) return (
    <div style={{ paddingTop: '80px', textAlign: 'center', padding: '100px 24px' }}>
      <h2 style={{ marginBottom: '16px' }}>Product not found</h2>
      <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none' }}>Back to Shop</Link>
    </div>
  );

  const handleAddToCart = () => {
    if (!selectedSize) { alert('Please select a size'); return; }
    addToCart(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { alert('Please select a size'); return; }
    addToCart(product, selectedSize);
    navigate('/checkout');
  };

  const related = products.filter(p => p.seriesId === product.seriesId && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;

  return (
    <div style={{ paddingTop: '56px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px 48px' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <Link to="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</Link>
          <span>/</span>
          <span style={{ color: 'hsl(var(--foreground))' }}>{product.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div style={{ aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden', background: 'hsl(var(--secondary))', marginBottom: '12px' }}>
              <img src={product.images[selectedImg] || product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            </div>
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImg(i)} style={{ width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: i === selectedImg ? '2px solid #ff0000' : '2px solid transparent', background: 'hsl(var(--secondary))', flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="fade-in">
            <div style={{ fontSize: '12px', color: '#ff0000', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.series}</div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2 }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#ff0000' }}>₹{product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span style={{ fontSize: '18px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString()}</span>
                  <span style={{ background: '#ff0000', color: 'white', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>{discount}% OFF</span>
                </>
              )}
            </div>

            {/* Ratings */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} style={{ fill: i <= 4 ? '#fbbf24' : 'none', color: '#fbbf24' }} />)}
              <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>4.0 (24 reviews)</span>
            </div>

            <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.7, marginBottom: '24px' }}>{product.description}</p>

            {/* Size selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Select Size</span>
                <span style={{ fontSize: '12px', color: '#ff0000', cursor: 'pointer' }}>Size Guide</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.variants.map(v => (
                  <button key={v.size} onClick={() => v.stock > 0 && setSelectedSize(v.size)} disabled={v.stock === 0}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: `2px solid ${selectedSize === v.size ? '#ff0000' : 'hsl(var(--border))'}`, background: selectedSize === v.size ? 'rgba(255,0,0,0.08)' : 'none', color: v.stock === 0 ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))', fontWeight: selectedSize === v.size ? 700 : 400, cursor: v.stock === 0 ? 'not-allowed' : 'pointer', opacity: v.stock === 0 ? 0.4 : 1, fontSize: '14px', transition: 'all 0.15s', fontFamily: 'Roboto, sans-serif' }}>
                    {v.size}
                    {v.stock <= 3 && v.stock > 0 && <span style={{ fontSize: '10px', color: '#f97316', marginLeft: '4px' }}>({v.stock})</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexDirection: 'column' }}>
              <button onClick={handleBuyNow} className="btn-yt" style={{ padding: '14px', borderRadius: '8px', fontSize: '15px', fontWeight: 600, justifyContent: 'center', gap: '8px' }}>
                <Zap size={16} /> Buy Now
              </button>
              <button onClick={handleAddToCart} className="btn-ghost" style={{ padding: '14px', borderRadius: '8px', fontSize: '15px', justifyContent: 'center', gap: '8px' }}>
                <ShoppingCart size={16} /> {added ? '✓ Added to Cart!' : 'Add to Cart'}
              </button>
            </div>

            {/* Info strips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'hsl(var(--secondary))', borderRadius: '12px' }}>
              {[{ icon: Truck, text: 'Free delivery on orders above ₹999' }, { icon: Shield, text: 'Secure payment via Razorpay' }, { icon: Star, text: '7-day easy returns, no questions asked' }].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                  <Icon size={14} style={{ color: '#ff0000', flexShrink: 0 }} /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>More from {product.series}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {related.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ aspectRatio: '3/4', background: 'hsl(var(--secondary))' }}>
                    <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                  </div>
                  <div style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                    <div style={{ color: '#ff0000', fontWeight: 700, fontSize: '14px', marginTop: '4px' }}>₹{p.price.toLocaleString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
