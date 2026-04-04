import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';

const CataloguePage = () => {
  const { products } = useStore();
  const { theme } = useTheme();

  // Randomize heights for Pinterest-style masonry
  const heights = ['200px','280px','180px','320px','240px','200px','300px','180px','260px','220px','200px','280px'];

  return (
    <div style={{ paddingTop: '0px' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px 16px 48px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Catalogue</h1>
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>Browse everything — just pictures, Pinterest-style.</p>
        </div>

        <div className="masonry-grid">
          {products.map((p, i) => (
            <Link key={p.id} to={`/product/${p.id}`} className="masonry-item" style={{ textDecoration: 'none', display: 'block' }}>
              <div style={{ height: heights[i % heights.length], background: 'hsl(var(--secondary))', position: 'relative', overflow: 'hidden' }}>
                <img src={p.images[0]} alt={p.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onMouseEnter={e => { (e.target as HTMLImageElement).style.transform = 'scale(1.04)'; }}
                  onMouseLeave={e => { (e.target as HTMLImageElement).style.transform = 'scale(1)'; }}
                  onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%, rgba(0,0,0,0.65))', opacity: 0, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => { (e.currentTarget.style.opacity = '1'); }}
                  onMouseLeave={e => { (e.currentTarget.style.opacity = '0'); }}>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px' }}>
                    <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>{p.name}</div>
                    <div style={{ color: '#ff6666', fontWeight: 700, fontSize: '14px' }}>₹{p.price.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CataloguePage;
