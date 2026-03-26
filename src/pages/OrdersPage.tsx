import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { Package, MapPin } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  processing: '#f97316', confirmed: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e'
};

const OrdersPage = () => {
  const { orders } = useStore();

  if (orders.length === 0) return (
    <div style={{ paddingTop: '80px', textAlign: 'center', padding: '120px 24px' }}>
      <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
      <h2 style={{ marginBottom: '16px' }}>No orders yet</h2>
      <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none' }}>Start Shopping</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: '56px', maxWidth: '800px', margin: '0 auto', padding: '72px 24px 48px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px' }}>My Orders</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {orders.map(o => (
          <div key={o.id} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>{o.id}</div>
                <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ background: STATUS_COLORS[o.status] + '18', color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}40`, borderRadius: '20px', padding: '4px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize' }}>{o.status}</span>
                <span style={{ fontWeight: 700, color: '#ff0000' }}>₹{o.total.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {o.items.map(item => (
                <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'hsl(var(--secondary))', borderRadius: '8px', padding: '6px 10px 6px 6px' }}>
                  <img src={item.product.images[0]} alt={item.product.name} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 500 }}>{item.product.name}</div>
                    <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>Size: {item.size} × {item.quantity}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
              <MapPin size={12} /> {o.address}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
