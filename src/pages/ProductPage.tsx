import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Zap, Star, Truck, Shield, Heart, Eye, Users, CheckCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { toast as sonnerToast } from '@/components/ui/sonner';

const StarInput = ({ value, onChange }: { value: number; onChange: (n: number) => void }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {[1,2,3,4,5].map(i => (
      <button key={i} onClick={() => onChange(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}>
        <Star size={20} style={{ fill: i <= value ? '#fbbf24' : 'none', color: '#fbbf24', transition: 'transform 0.1s' }} />
      </button>
    ))}
  </div>
);

const SizeGuideModal = ({ onClose }: { onClose: () => void }) => (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={onClose}>
    <div style={{ background: 'hsl(var(--card))', borderRadius: '20px', padding: '28px', maxWidth: '500px', width: '100%', position: 'relative' }} onClick={e => e.stopPropagation()}>
      <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}><X size={20} /></button>
      <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '20px' }}>Size Guide</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid hsl(var(--border))' }}>
            {['Size', 'Chest (in)', 'Length (in)', 'Shoulder (in)'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 700, color: 'hsl(var(--muted-foreground))', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[['S', '36–38', '27', '17'], ['M', '38–40', '28', '18'], ['L', '40–42', '29', '19'], ['XL', '42–44', '30', '20'], ['XXL', '44–46', '31', '21']].map(([s, c, l, sh]) => (
            <tr key={s} style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              {[s, c, l, sh].map((v, i) => <td key={i} style={{ padding: '10px 12px', fontWeight: i === 0 ? 700 : 400 }}>{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '16px', lineHeight: 1.6 }}>💡 Tip: Our tees run slightly large. If you're between sizes, size down for a fitted look, or stay true to size for a relaxed fit.</p>
    </div>
  </div>
);

const ProductPage = () => {
  const { id } = useParams();
  const { products, addToCart, toggleWishlist, wishlist, addRecentlyViewed, addReview } = useStore();
  const { theme } = useTheme();
  const { user } = useAuth() as any;
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [imgZoom, setImgZoom] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (product) addRecentlyViewed(product.id);
  }, [id]); // depend on `id` from useParams, not product?.id

  useEffect(() => {
    if (!product) return;
    const key = 'youtupia_notify_stock';
    try {
      const stored = localStorage.getItem(key);
      const arr = stored ? (JSON.parse(stored) as Array<{ productId: string }>) : [];
      const already = arr.some((x) => x.productId === product.id);
      setNotified(already);
    } catch {
      setNotified(false);
    }
  }, [product?.id]);

  if (!product) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
      <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Product not found</h2>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px', fontSize: '14px' }}>
        This product may have been removed or the link is broken.
      </p>
      <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none' }}>← Back to Shop</Link>
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
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }
    addToCart(product, selectedSize);
    navigate('/checkout');
  };

  const handleReviewSubmit = () => {
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) return;
    addReview(product.id, { userName: reviewForm.name, rating: reviewForm.rating, comment: reviewForm.comment, verified: false });
    setReviewSubmitted(true);
    setReviewForm({ name: '', rating: 5, comment: '' });
  };

  const related = products.filter(p => p.seriesId === product.seriesId && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
  const reviews = product.reviews || [];
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0);
  const canPurchase = totalStock > 0 || Boolean(product.preorder);
  const isWishlisted = wishlist.includes(product.id);

  return (
    <div style={{ paddingTop: '24px' }}>
      {sizeGuide && <SizeGuideModal onClose={() => setSizeGuide(false)} />}

      {/* Full image zoom */}
      {imgZoom && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setImgZoom(false)}>
          <button onClick={() => setImgZoom(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
          <button onClick={() => setSelectedImg(i => (i - 1 + product.images.length) % product.images.length)} style={{ position: 'absolute', left: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={20} /></button>
          <img src={product.images[selectedImg]} alt={product.name} style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain', borderRadius: '8px' }} />
          <button onClick={() => setSelectedImg(i => (i + 1) % product.images.length)} style={{ position: 'absolute', right: '20px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={20} /></button>
        </div>
      )}

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
            <div style={{ aspectRatio: '3/4', borderRadius: '16px', overflow: 'hidden', background: 'hsl(var(--secondary))', marginBottom: '12px', cursor: 'zoom-in', position: 'relative' }} onClick={() => setImgZoom(true)}>
              <img src={product.images[selectedImg] || product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
              <div style={{ position: 'absolute', bottom: '14px', right: '14px', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '10px', padding: '4px 10px', borderRadius: '20px', backdropFilter: 'blur(6px)' }}>Click to zoom</div>
              {product.limitedEdition && <div style={{ position: 'absolute', top: '14px', left: '14px', background: '#ff0000', color: 'white', fontSize: '10px', fontWeight: 800, padding: '5px 12px', borderRadius: '6px', letterSpacing: '0.05em' }}>LIMITED EDITION</div>}
            </div>
            {product.images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {product.images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImg(i)} style={{ width: '72px', height: '72px', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${i === selectedImg ? '#ff0000' : 'transparent'}`, background: 'hsl(var(--secondary))', flexShrink: 0, transition: 'border-color 0.15s, transform 0.15s', transform: i === selectedImg ? 'scale(1.05)' : 'scale(1)' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="fade-in">
            {/* Viewers */}
            {product.viewerCount && product.viewerCount > 1 && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.2)', borderRadius: '20px', padding: '4px 12px', marginBottom: '14px', fontSize: '12px', color: '#f97316' }}>
                <Eye size={12} /> {product.viewerCount} people viewing this right now
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#ff0000', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.series}</div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '14px', lineHeight: 1.2 }}>{product.name}</h1>

            {/* Rating summary */}
            {avgRating && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14} style={{ fill: i <= Math.round(Number(avgRating)) ? '#fbbf24' : 'none', color: '#fbbf24' }} />)}
                <span style={{ fontWeight: 700, fontSize: '14px' }}>{avgRating}</span>
                <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px', fontWeight: 800, color: '#ff0000' }}>₹{product.price.toLocaleString()}</span>
              {product.originalPrice && <>
                <span style={{ fontSize: '18px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{product.originalPrice.toLocaleString()}</span>
                <span style={{ background: '#ff0000', color: 'white', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '4px' }}>{discount}% OFF</span>
              </>}
            </div>

            {/* Stock / urgency indicators */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {totalStock <= 5 && totalStock > 0 && <span style={{ fontSize: '12px', color: '#f97316', fontWeight: 600, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '20px', padding: '4px 12px' }}>⚡ Only {totalStock} left!</span>}
              {product.preorder && <span style={{ fontSize: '12px', color: '#60a5fa', fontWeight: 600, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: '20px', padding: '4px 12px' }}>📦 Preorder open</span>}
              {product.limitedEdition && <span style={{ fontSize: '12px', color: '#ff0000', fontWeight: 600, background: 'rgba(255,0,0,0.06)', border: '1px solid rgba(255,0,0,0.15)', borderRadius: '20px', padding: '4px 12px' }}>🔥 Limited Drop — Never Restocking</span>}
              {product.tags.includes('bestseller') && <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.15)', borderRadius: '20px', padding: '4px 12px' }}>🏆 Bestseller</span>}
            </div>

            <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.8, marginBottom: '24px' }}>{product.description}</p>

            {/* Size selector */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 600, fontSize: '14px' }}>Select Size</span>
                <button onClick={() => setSizeGuide(true)} style={{ fontSize: '12px', color: '#ff0000', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'Roboto, sans-serif', fontWeight: 600 }}>📏 Size Guide</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {product.variants.map(v => (
                  <button key={v.size} onClick={() => (v.stock > 0 || product.preorder) && setSelectedSize(v.size)} disabled={v.stock === 0 && !product.preorder}
                    style={{ padding: '8px 18px', borderRadius: '8px', border: `2px solid ${selectedSize === v.size ? '#ff0000' : 'hsl(var(--border))'}`, background: selectedSize === v.size ? 'rgba(255,0,0,0.08)' : 'none', color: v.stock === 0 ? 'hsl(var(--muted-foreground))' : 'hsl(var(--foreground))', fontWeight: selectedSize === v.size ? 700 : 400, cursor: v.stock === 0 ? 'not-allowed' : 'pointer', opacity: v.stock === 0 ? 0.4 : 1, fontSize: '14px', transition: 'all 0.15s', fontFamily: 'Roboto, sans-serif', position: 'relative' }}>
                    {v.size}
                    {v.stock <= 3 && v.stock > 0 && <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#f97316', color: 'white', fontSize: '8px', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{v.stock}</span>}
                  </button>
                ))}
              </div>
              {totalStock === 0 && !product.preorder && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '10px' }}>Out of stock — get notified when it's back:</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={notifyEmail} onChange={e => setNotifyEmail(e.target.value)} placeholder="your@email.com"
                      style={{ flex: 1, padding: '9px 12px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '13px', outline: 'none', fontFamily: 'Roboto, sans-serif' }} />
                    <button
                      onClick={() => {
                        if (notified) return;
                        const email = notifyEmail.trim();
                        if (!email || !email.includes('@')) {
                          sonnerToast.message('Enter a valid email', { description: 'So we can notify you when this is back in stock.' });
                          return;
                        }
                        const key = 'youtupia_notify_stock';
                        try {
                          const stored = localStorage.getItem(key);
                          const arr = stored ? (JSON.parse(stored) as Array<{ productId: string; email: string; createdAt: string }>) : [];
                          const next = [{ productId: product.id, email, createdAt: new Date().toISOString() }, ...arr.filter((x) => x.productId !== product.id)].slice(0, 25);
                          localStorage.setItem(key, JSON.stringify(next));
                        } catch (e) {
                          void e;
                        }
                        setNotified(true);
                        sonnerToast.success('You’re in!', { description: 'We’ll email you when it’s back.' });
                      }}
                      style={{ background: '#ff0000', color: 'white', border: 'none', borderRadius: '8px', padding: '9px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'Roboto, sans-serif' }}
                    >
                      {notified ? '✓ Done' : 'Notify Me'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button onClick={handleBuyNow} className="btn-yt" style={{ flex: 1, padding: '14px', borderRadius: '10px', fontSize: '15px', fontWeight: 600, justifyContent: 'center', gap: '8px' }} disabled={!canPurchase}>
                <Zap size={16} /> {product.preorder && totalStock === 0 ? 'Preorder Now' : 'Buy Now'}
              </button>
              <button onClick={handleAddToCart} className="btn-ghost" style={{ flex: 1, padding: '14px', borderRadius: '10px', fontSize: '15px', justifyContent: 'center', gap: '8px' }} disabled={!canPurchase}>
                <ShoppingCart size={16} /> {added ? '✓ Added!' : product.preorder && totalStock === 0 ? 'Add Preorder' : 'Add to Cart'}
              </button>
              <button onClick={() => toggleWishlist(product.id)} style={{ padding: '14px', borderRadius: '10px', border: `1px solid ${isWishlisted ? 'rgba(255,0,0,0.4)' : 'hsl(var(--border))'}`, background: isWishlisted ? 'rgba(255,0,0,0.06)' : 'none', cursor: 'pointer', color: isWishlisted ? '#ff0000' : 'hsl(var(--muted-foreground))', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Heart size={18} fill={isWishlisted ? '#ff0000' : 'none'} />
              </button>
            </div>

            {/* Trust */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '16px', background: 'hsl(var(--secondary))', borderRadius: '12px' }}>
              {[{ icon: Truck, text: 'Free delivery on orders above ₹999' }, { icon: Shield, text: 'Secure payment via Razorpay' }, { icon: CheckCircle, text: '7-day easy returns, no questions asked' }].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                  <Icon size={14} style={{ color: '#ff0000', flexShrink: 0 }} /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginTop: '64px', paddingTop: '40px', borderTop: '1px solid hsl(var(--border))' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '28px' }}>Customer Reviews</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
            {/* Existing reviews */}
            <div>
              {reviews.length === 0 ? (
                <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>No reviews yet. Be the first!</p>
              ) : (
                reviews.map(r => (
                  <div key={r.id} style={{ padding: '18px', background: 'hsl(var(--card))', borderRadius: '14px', border: '1px solid hsl(var(--border))', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {r.userName}
                          {r.verified && <span style={{ fontSize: '10px', color: '#16a34a', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '20px', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><CheckCircle size={9} /> Verified</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '2px', marginTop: '4px' }}>
                          {[1,2,3,4,5].map(i => <Star key={i} size={12} style={{ fill: i <= r.rating ? '#fbbf24' : 'none', color: '#fbbf24' }} />)}
                        </div>
                      </div>
                      <span style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.7, margin: 0 }}>{r.comment}</p>
                  </div>
                ))
              )}
            </div>

            {/* Write a review */}
            <div style={{ background: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Write a Review</h3>
              {reviewSubmitted ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <CheckCircle size={40} style={{ color: '#16a34a', marginBottom: '12px' }} />
                  <p style={{ fontWeight: 600 }}>Thanks for your review!</p>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Name</label>
                    <input value={reviewForm.name} onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))} placeholder="John D."
                      style={{ width: '100%', padding: '10px 14px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '14px', outline: 'none', fontFamily: 'Roboto, sans-serif', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</label>
                    <StarInput value={reviewForm.rating} onChange={n => setReviewForm(f => ({ ...f, rating: n }))} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Review</label>
                    <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} placeholder="Share your experience..."
                      rows={4} style={{ width: '100%', padding: '10px 14px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '14px', outline: 'none', resize: 'vertical', fontFamily: 'Roboto, sans-serif', boxSizing: 'border-box' }} />
                  </div>
                  <button onClick={handleReviewSubmit} className="btn-yt" style={{ width: '100%', justifyContent: 'center', borderRadius: '10px', padding: '12px' }}>
                    Submit Review
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div style={{ marginTop: '64px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '20px' }}>More from {product.series}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {related.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="img-zoom" style={{ aspectRatio: '3/4', background: 'hsl(var(--secondary))' }}>
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
