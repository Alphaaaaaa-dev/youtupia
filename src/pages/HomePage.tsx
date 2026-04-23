import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, TrendingUp, Zap, Package, Users, Sparkles } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';

/* ---------------- Scroll Reveal ---------------- */

const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');

    const obs = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    els.forEach(el => obs.observe(el));

    return () => obs.disconnect();
  });
};

/* ---------------- Animated Counter ---------------- */

const Counter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;

      obs.disconnect();

      let start = 0;
      const step = target / 40;

      const timer = setInterval(() => {
        start += step;

        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 30);
    });

    if (ref.current) obs.observe(ref.current);

    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
};

/* ---------------- Dynamic Stats ---------------- */

const useDynamicStats = () => {
  const { orders } = useStore();
  const [stats, setStats] = useState({ itemsSold: 0, customers: 0 });

  useEffect(() => {
    try {
      const itemsSold = orders.reduce(
        (s, o) => s + o.items.reduce((ss, i) => ss + i.quantity, 0),
        0
      );

      const customers = new Set(
        orders.map(o => o.customerEmail).filter(Boolean)
      ).size;

      setStats({ itemsSold, customers });
    } catch {
      setStats({ itemsSold: 0, customers: 0 });
    }
  }, [orders]);

  return stats;
};

/* ---------------- Skeleton ---------------- */

const ProductSkeleton = () => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))',
      gap: 16
    }}
  >
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        style={{
          borderRadius: 12,
          overflow: 'hidden',
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))'
        }}
      >
        <div className="shimmer" style={{ aspectRatio: '3/4' }} />
        <div style={{ padding: 12 }}>
          <div className="shimmer" style={{ height: 12, width: '70%' }} />
        </div>
      </div>
    ))}
  </div>
);

/* ================= MAIN ================= */

const HomePage = () => {
  const { products, series, creators, addToCart, homePromo, dbLoading } = useStore();
  const { theme } = useTheme();

  const isDark = theme === 'dark';

  const featured = products.filter(p => p.featured);

  const dynStats = useDynamicStats();

  useReveal();

  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    if (!featured.length) return;

    const t = setInterval(() => {
      setHeroIdx(i => (i + 1) % Math.min(featured.length, 4));
    }, 3000);

    return () => clearInterval(t);
  }, [featured.length]);

  return (
    <div style={{ paddingTop: 56 }}>

      {/* HERO */}

      <section
        style={{
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          background: isDark ? 'hsl(0 0% 6%)' : 'hsl(0 0% 98%)'
        }}
      >
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px', width: '100%' }}>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit,minmax(420px,1fr))',
              gap: 48,
              alignItems: 'center'
            }}
          >

            {/* LEFT */}

            <div>

              <h1 style={{ fontSize: 64, fontWeight: 900 }}>Wear your</h1>

              <h1 className="gradient-text" style={{ fontSize: 64, fontWeight: 900 }}>
                Dreams.
              </h1>

              <p style={{ fontSize: 18, marginTop: 20 }}>
                Premium merch drops from Youtupia.
              </p>

              <div style={{ marginTop: 30, display: 'flex', gap: 12 }}>

                <Link to="/shop" className="btn-yt">
                  Shop Now <ArrowRight size={16} />
                </Link>

                <Link to="/catalogue" className="btn-ghost">
                  Browse Catalogue
                </Link>

              </div>

              {/* Stats */}

              <div
                style={{
                  display: 'flex',
                  gap: 40,
                  marginTop: 40,
                  borderTop: '1px solid hsl(var(--border))',
                  paddingTop: 30
                }}
              >

                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#ff0000' }}>
                    <Counter target={dynStats.itemsSold || 1} />
                  </div>
                  <div style={{ fontSize: 12 }}>Items Sold</div>
                </div>

                <div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#ff0000' }}>
                    <Counter target={dynStats.customers || 1} />
                  </div>
                  <div style={{ fontSize: 12 }}>Customers</div>
                </div>

              </div>

            </div>

            {/* RIGHT */}

            <div>

              {/* Promo Video */}

              <div
                style={{
                  borderRadius: 20,
                  overflow: 'hidden',
                  aspectRatio: '16/9',
                  background: '#000'
                }}
              >

                {homePromo?.videoUrl ? (
                  <video
                    src={homePromo.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      color: 'white',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    Promo Video
                  </div>
                )}

              </div>

              {/* Featured Strip */}

              {dbLoading ? (
                <ProductSkeleton />
              ) : (
                <div
                  style={{
                    marginTop: 16,
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4,1fr)',
                    gap: 8
                  }}
                >
                  {featured.slice(0, 4).map(p => (
                    <Link key={p.id} to={`/product/${p.id}`}>
                      <img
                        src={p.images[0]}
                        style={{
                          width: '100%',
                          aspectRatio: '3/4',
                          objectFit: 'cover',
                          borderRadius: 8
                        }}
                      />
                    </Link>
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* FEATURED */}

      <section style={{ padding: 60 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800 }}>
          <TrendingUp size={26} /> Featured Drops
        </h2>

        {dbLoading ? (
          <ProductSkeleton />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))',
              gap: 16,
              marginTop: 20
            }}
          >
            {featured.map(p => (
              <div key={p.id} className="product-card">

                <Link to={`/product/${p.id}`}>
                  <img
                    src={p.images[0]}
                    style={{
                      width: '100%',
                      aspectRatio: '3/4',
                      objectFit: 'cover'
                    }}
                  />
                </Link>

                <div style={{ padding: 12 }}>

                  <div style={{ fontWeight: 700 }}>{p.name}</div>

                  <div style={{ color: '#ff0000', fontWeight: 800 }}>
                    ₹{p.price.toLocaleString()}
                  </div>

                  <button
                    onClick={() => {
                      const v = p.variants.find(v => v.stock > 0);
                      if (v) addToCart(p, v.size);
                    }}
                    className="btn-yt"
                    style={{ marginTop: 10, width: '100%' }}
                  >
                    Add to Cart
                  </button>

                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}

      <footer
        style={{
          padding: 40,
          borderTop: '1px solid hsl(var(--border))',
          textAlign: 'center'
        }}
      >
        © 2026 Youtupia
      </footer>

    </div>
  );
};

export default HomePage;
