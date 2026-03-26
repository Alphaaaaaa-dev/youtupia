import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

const OrderSuccessPage = () => {
  const [params] = useSearchParams();
  const { orders } = useStore();
  const orderId = params.get('id');
  const order = orders.find(o => o.id === orderId);

  return (
    <div style={{ paddingTop: '56px', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(34,197,94,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle size={36} style={{ color: '#22c55e' }} />
        </div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>Order Confirmed! 🎉</h1>
        <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px', lineHeight: 1.7 }}>
          Your order has been placed successfully. You'll receive a confirmation on <strong>{order?.customerEmail}</strong>.
        </p>
        {order && (
          <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>ORDER ID</span>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>{order.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>AMOUNT PAID</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#ff0000' }}>₹{order.total.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>STATUS</span>
              <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: 600 }}>Confirmed</span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn-ghost" style={{ textDecoration: 'none', gap: '8px' }}><Package size={14} /> Track Orders</Link>
          <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none' }}>Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
