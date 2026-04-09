import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useState } from 'react';

const WishlistPage = () => {
  const { products, wishlist, toggleWishlist, addToCart } = useStore();
  const [addedId, setAddedId] = useState<string | null>(null);
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  const handleAdd = (p: any) => {
    const firstAvailable = p.variants.find((v: any) => v.stock > 0) || (p.preorder ? p.variants[0] : undefined);
    if (!firstAvailable) return;
    addToCart(p, firstAvailable.size || 'M');
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div style={{ paddingTop: '16px', maxWidth: '1280px', margin: '0 auto', padding: '80px 24px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <Heart size={24} style={{ color: '#ff0000' }} />
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0 }}>Wishlist</h1>
        <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>({wishlistProducts.length} items)</span>
      </div>

      {wishlistProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <Heart size={48} style={{ color: 'hsl(var(--border))', marginBottom: '16px' }} />
          <h2 style={{ fontWeight: 700, marginBottom: '10px' }}>Your wishlist is empty</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px' }}>Save items you love and come back to them anytime.</p>
          <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none', borderRadius: '10px' }}>Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
          {wishlistProducts.map(p => (
            <div key={p.id} className="product-card">
              <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="img-zoom" style={{ position: 'relative', aspectRatio: '3/4', background: 'hsl(var(--secondary))' }}>
                  <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {p.limitedEdition && <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff0000', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>LIMITED</span>}
                </div>
                <div style={{ padding: '12px 12px 4px' }}>
                  <div style={{ fontSize: '10px', color: '#ff0000', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '3px' }}>{p.series}</div>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 800, fontSize: '15px', color: '#ff0000' }}>₹{p.price.toLocaleString()}</span>
                    {p.originalPrice && <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
                  </div>
                </div>
              </Link>
              <div style={{ padding: '8px 10px 12px', display: 'flex', gap: '8px' }}>
                <button onClick={() => handleAdd(p)} className="btn-yt ripple" style={{ flex: 1, justifyContent: 'center', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, background: addedId === p.id ? '#16a34a' : '#ff0000', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.3s' }}>
                  <ShoppingCart size={13} /> {addedId === p.id ? 'Added!' : 'Add to Cart'}
                </button>
                <button onClick={() => toggleWishlist(p.id)} style={{ padding: '9px', borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'none', cursor: 'pointer', color: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
