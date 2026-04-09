import { useParams, Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowLeft, Users, Heart, ShoppingCart, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';

const CountdownTimer = ({ endsAt }: { endsAt: string }) => {
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const update = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) return;
      setTime({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {[['d', time.d], ['h', time.h], ['m', time.m], ['s', time.s]].map(([label, val]) => (
        <div key={label as string} style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', padding: '8px 14px', fontSize: '22px', fontWeight: 900, color: '#ff0000', minWidth: '52px', fontVariantNumeric: 'tabular-nums' }}>{String(val).padStart(2, '0')}</div>
          <div style={{ fontSize: '9px', color: 'hsl(var(--muted-foreground))', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label as string}</div>
        </div>
      ))}
    </div>
  );
};

const CreatorPage = () => {
  const { handle } = useParams();
  const { creators, products, addToCart, toggleWishlist, wishlist } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const creator = creators.find(c => c.handle === handle);
  const [addedId, setAddedId] = useState<string | null>(null);

  if (!creator) return (
    <div style={{ paddingTop: '24px', textAlign: 'center' }}>
      <h2>Creator not found</h2>
      <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none', marginTop: '16px', display: 'inline-flex' }}>Back to Shop</Link>
    </div>
  );

  const creatorProducts = products.filter(p => creator.productIds.includes(p.id));

  const handleAdd = (p: any, e: React.MouseEvent) => {
    e.preventDefault();
    const firstAvailable = p.variants.find((v: any) => v.stock > 0) || (p.preorder ? p.variants[0] : undefined);
    if (!firstAvailable) return;
    addToCart(p, firstAvailable.size || 'M');
    setAddedId(p.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <div style={{ paddingTop: '0px' }}>
      {/* Banner */}
      <div style={{ position: 'relative', height: '340px', overflow: 'hidden' }}>
        <img src={creator.banner} alt={creator.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 20%, rgba(0,0,0,0.85))' }} />
        <div style={{ position: 'absolute', top: '20px', left: '24px' }}>
          <Link to="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'white', textDecoration: 'none', fontSize: '13px', opacity: 0.8 }}>
            <ArrowLeft size={16} /> Back
          </Link>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', display: 'flex', alignItems: 'flex-end', gap: '20px' }}>
          <img src={creator.avatar} alt={creator.name} style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid #ff0000', objectFit: 'cover', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>Creator</div>
            <h1 style={{ color: 'white', fontSize: '28px', fontWeight: 900, margin: 0 }}>{creator.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
              {creator.subscribers && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                  <Users size={13} /> {creator.subscribers} subscribers
                </div>
              )}
              {creator.youtubeUrl && (
                <a href={creator.youtubeUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#ff0000', fontSize: '13px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ExternalLink size={12} /> YouTube
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px', alignItems: 'start' }}>
          <div>
            <p style={{ fontSize: '15px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.8, marginBottom: '32px', maxWidth: '580px' }}>{creator.bio}</p>

            {/* YouTube embed */}
            {creator.youtubeVideoId && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Featured Video</h3>
                <div style={{ borderRadius: '16px', overflow: 'hidden', aspectRatio: '16/9', maxWidth: '560px' }}>
                  <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${creator.youtubeVideoId}`} title="YouTube" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen style={{ display: 'block' }} />
                </div>
              </div>
            )}

            {/* Products */}
            <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>{creator.name}'s Collection</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {creatorProducts.map(p => (
                <div key={p.id} className="product-card" style={{ position: 'relative' }}>
                  <button onClick={() => toggleWishlist(p.id)} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wishlist.includes(p.id) ? '#ff0000' : 'white' }}>
                    <Heart size={14} fill={wishlist.includes(p.id) ? '#ff0000' : 'none'} />
                  </button>
                  <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="img-zoom" style={{ position: 'relative', aspectRatio: '3/4', background: 'hsl(var(--secondary))' }}>
                      <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      {p.limitedEdition && <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#ff0000', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>LIMITED</span>}
                    </div>
                    <div style={{ padding: '12px 12px 4px' }}>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{p.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px', color: '#ff0000' }}>₹{p.price.toLocaleString()}</span>
                        {p.originalPrice && <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
                      </div>
                    </div>
                  </Link>
                  <div style={{ padding: '0 10px 10px' }}>
                    <button onClick={(e) => handleAdd(p, e)} className="btn-yt ripple" style={{ width: '100%', justifyContent: 'center', borderRadius: '8px', padding: '9px', fontSize: '13px', fontWeight: 600, background: addedId === p.id ? '#16a34a' : '#ff0000', transition: 'background 0.3s', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ShoppingCart size={13} /> {addedId === p.id ? 'Added!' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar — Drop countdown */}
          {creator.dropCountdownEnd && (
            <div style={{ background: 'hsl(var(--card))', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '20px', padding: '24px', position: 'sticky', top: '80px' }}>
              <div style={{ fontSize: '10px', color: '#ff0000', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>Next Drop Countdown</div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', lineHeight: 1.3 }}>{creator.name}'s next exclusive drop</h3>
              <CountdownTimer endsAt={creator.dropCountdownEnd} />
              <p style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '16px', lineHeight: 1.6 }}>Limited pieces. Once they're gone, they're gone. No restock, ever.</p>
              <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,0,0,0.05)', borderRadius: '10px', fontSize: '12px', color: 'hsl(var(--muted-foreground))', border: '1px solid rgba(255,0,0,0.1)' }}>
                🔔 Turn on notifications to be first when this drops.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorPage;
