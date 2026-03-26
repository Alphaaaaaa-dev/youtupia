import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, RefreshCw, TrendingUp } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';

const HomePage = () => {
  const { products, series, addToCart } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const featured = products.filter(p => p.featured);

  return (
    <div style={{ paddingTop: '56px' }}>
      {/* Hero Banner */}
      <div style={{ position: 'relative', minHeight: '520px', display: 'flex', alignItems: 'center', overflow: 'hidden', background: isDark ? 'hsl(0 0% 6%)' : 'hsl(0 0% 97%)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,0,0,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px', width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div className="fade-in">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '20px', padding: '6px 14px', marginBottom: '24px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff0000', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#ff0000', letterSpacing: '0.05em' }}>NEW DROP AVAILABLE</span>
            </div>
            <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '20px' }}>
              Wear the<br />
              <span style={{ color: '#ff0000' }}>Culture</span>
            </h1>
            <p style={{ fontSize: '16px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.7, marginBottom: '32px', maxWidth: '440px' }}>
              Premium merch drops from Youtupia. Limited runs. Real quality. Streetwear made for those who actually know.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn-yt" style={{ borderRadius: '8px', padding: '14px 28px', fontSize: '15px', textDecoration: 'none', gap: '8px' }}>
                Shop Now <ArrowRight size={16} />
              </Link>
              <Link to="/catalogue" className="btn-ghost" style={{ borderRadius: '8px', padding: '14px 28px', fontSize: '15px', textDecoration: 'none' }}>
                View Catalogue
              </Link>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {featured.slice(0, 4).map((p, i) => (
              <Link key={p.id} to={`/product/${p.id}`} style={{ textDecoration: 'none', borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', position: 'relative', display: 'block', background: 'hsl(var(--secondary))' }}>
                <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                  <div style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>{p.name}</div>
                  <div style={{ color: '#ff0000', fontSize: '12px', fontWeight: 700 }}>₹{p.price}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div style={{ borderTop: '1px solid hsl(var(--border))', borderBottom: '1px solid hsl(var(--border))', padding: '20px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { icon: Truck, label: 'Free Delivery', sub: 'Orders above ₹999' },
            { icon: Shield, label: 'Secure Payments', sub: 'Razorpay secured' },
            { icon: RefreshCw, label: '7-Day Returns', sub: 'No questions asked' },
            { icon: Star, label: 'Premium Quality', sub: '240-380gsm fabrics' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color: '#ff0000' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Series section */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Shop by Series</h2>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>Each series is a story. Pick yours.</p>
          </div>
          <Link to="/shop" style={{ fontSize: '13px', color: '#ff0000', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>View all <ArrowRight size={14} /></Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {series.map(s => (
            <Link key={s.id} to={`/shop?series=${s.id}`} style={{ textDecoration: 'none', borderRadius: '16px', overflow: 'hidden', position: 'relative', minHeight: '180px', display: 'flex', alignItems: 'flex-end', background: 'hsl(var(--secondary))' }}>
              {s.banner && <img src={s.banner} alt={s.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, rgba(0,0,0,0.7))' }} />
              <div style={{ position: 'relative', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  {s.logo && <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 700, fontSize: '15px' }}>{s.name}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>{s.description}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><TrendingUp size={20} style={{ color: '#ff0000' }} /> Featured</h2>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>Handpicked, flying off shelves.</p>
          </div>
          <Link to="/shop" style={{ fontSize: '13px', color: '#ff0000', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>See all <ArrowRight size={14} /></Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
          {featured.map(p => (
            <div key={p.id} className="product-card fade-in">
              <Link to={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', background: 'hsl(var(--secondary))' }}>
                  <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                  {p.originalPrice && <span className="badge-sale">SALE</span>}
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px' }}>{p.series}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700, fontSize: '16px', color: '#ff0000' }}>₹{p.price.toLocaleString()}</span>
                    {p.originalPrice && <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
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
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid hsl(var(--border))', padding: '32px 24px', background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{ background: '#ff0000', borderRadius: '6px', padding: '4px 8px' }}><svg width="14" height="12" viewBox="0 0 16 14" fill="none"><path d="M6.5 10L10.5 7L6.5 4V10Z" fill="white"/></svg></div>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>Youtupia</span>
            </div>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>Premium merch for the culture. Limited drops, real quality.</p>
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>Shop</div>
            {['All Products', 'Classic Drop', 'Street Series', 'New Arrivals'].map(l => (
              <div key={l} style={{ marginBottom: '8px' }}><Link to="/shop" style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}>{l}</Link></div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>Info</div>
            {[['About Us', '/about'], ['FAQ', '/faq'], ['Contact', '/contact'], ['Privacy Policy', '/policy']].map(([l, to]) => (
              <div key={l} style={{ marginBottom: '8px' }}><Link to={to} style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}>{l}</Link></div>
            ))}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>Connect</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>📧 hello@youtupia.com</div>
              <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>📱 +91 00000 00000</div>
              <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>📸 @youtupia</div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1280px', margin: '24px auto 0', paddingTop: '24px', borderTop: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>© 2026 Youtupia. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/policy" style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link to="/policy" style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', textDecoration: 'none' }}>Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
