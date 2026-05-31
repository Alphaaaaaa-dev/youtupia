import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';

// ── Masonry skeleton item ──────────────────────────────────────────────────
const MasonrySkeleton = ({ height }: { height: string }) => (
  <div style={{
    height,
    borderRadius: '12px',
    background: 'linear-gradient(90deg, hsl(var(--secondary)) 25%, hsl(var(--border)) 50%, hsl(var(--secondary)) 75%)',
    backgroundSize: '200% 100%',
    animation: 'catShimmer 1.4s infinite',
    marginBottom: '12px',
  }} />
);

const CataloguePage = () => {
  const { products, hydrating, dbLoading } = useStore();
  const { theme } = useTheme();
  const isLoading = hydrating || dbLoading;

  // Sort newest first
  const sorted = [...products].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Varied heights for Pinterest-style masonry
  const heights = ['200px','280px','180px','320px','240px','200px','300px','180px','260px','220px','200px','280px'];
  // Skeleton heights — randomish but fixed for consistency
  const skeletonHeights = ['220px','300px','180px','260px','240px','200px','280px','320px','200px','240px','180px','260px','220px','200px','300px','180px'];

  return (
    <div style={{ paddingTop: '0px' }}>
      <style>{`
        @keyframes catShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .masonry-grid {
          columns: 5 160px;
          column-gap: 10px;
        }
        .masonry-item {
          break-inside: avoid;
          margin-bottom: 10px;
          border-radius: 12px;
          overflow: hidden;
          display: block;
        }
        @media (max-width: 1100px) { .masonry-grid { columns: 4 140px; } }
        @media (max-width: 800px)  { .masonry-grid { columns: 3 130px; } }
        @media (max-width: 520px)  { .masonry-grid { columns: 2 130px; } }
      `}</style>

      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 16px 48px' }}>
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Catalogue</h1>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>
              Browse everything — just pictures, Pinterest-style.
            </p>
          </div>
          {!isLoading && (
            <span style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
              {products.length} products
            </span>
          )}
        </div>

        {/* ── SKELETON while loading ── */}
        {isLoading ? (
          <div className="masonry-grid">
            {skeletonHeights.map((h, i) => (
              <div key={i} className="masonry-item">
                <MasonrySkeleton height={h} />
              </div>
            ))}
          </div>
        ) : (
          <div className="masonry-grid">
            {sorted.map((p, i) => (
              <Link key={p.id} to={`/product/${p.id}`} className="masonry-item" style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  height: heights[i % heights.length],
                  background: 'hsl(var(--secondary))',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: '12px',
                }}>
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease', display: 'block' }}
                    onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                    onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                  />
                  {/* Hover overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(transparent 45%, rgba(0,0,0,0.72))',
                    opacity: 0, transition: 'opacity 0.22s',
                    display: 'flex', alignItems: 'flex-end',
                  }}
                    onMouseEnter={e => { (e.currentTarget.style.opacity = '1'); }}
                    onMouseLeave={e => { (e.currentTarget.style.opacity = '0'); }}>
                    <div style={{ padding: '12px 14px', width: '100%' }}>
                      <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '2px' }}>{p.series}</div>
                      <div style={{ color: 'white', fontWeight: 700, fontSize: '13px', lineHeight: 1.2, marginBottom: '3px' }}>{p.name}</div>
                      <div style={{ color: '#ff6666', fontWeight: 800, fontSize: '13px' }}>₹{p.price.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Badges */}
                  {p.limitedEdition && (
                    <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#ff0000', color: 'white', fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                      LIMITED
                    </div>
                  )}
                  {p.originalPrice && (
                    <div style={{ position: 'absolute', top: p.limitedEdition ? '28px' : '8px', left: '8px', background: '#ff0000', color: 'white', fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>
                      {Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                    </div>
                  )}
                  {/* NEW badge for products uploaded in last 7 days */}
                  {Date.now() - new Date(p.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000 && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', background: '#16a34a', color: 'white', fontSize: '8px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                      NEW
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CataloguePage;
