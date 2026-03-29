import { useState } from 'react';
import { useStore } from '../contexts/StoreContext';
import { Package, Truck, CheckCircle, Clock, Search } from 'lucide-react';

const STATUS_STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];
const STATUS_LABELS: Record<string, string> = { processing: 'Processing', confirmed: 'Confirmed', shipped: 'Shipped', delivered: 'Delivered' };
const STATUS_ICONS: Record<string, any> = { processing: Clock, confirmed: CheckCircle, shipped: Truck, delivered: Package };
const STATUS_DESC: Record<string, string> = { processing: 'We received your order and are verifying payment.', confirmed: 'Payment confirmed! We\'re preparing your order.', shipped: 'Your order is on its way to you!', delivered: 'Your order has been delivered. Enjoy!' };

const TrackOrderPage = () => {
  const { orders } = useStore();
  const [input, setInput] = useState('');
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState<any>(null);

  const handleSearch = () => {
    setSearched(true);
    const order = orders.find(o => o.id.toLowerCase() === input.trim().toLowerCase() || o.id.includes(input.trim().toUpperCase()));
    setFound(order || null);
  };

  const currentStep = found ? STATUS_STEPS.indexOf(found.status) : -1;

  return (
    <div style={{ paddingTop: '80px', maxWidth: '680px', margin: '0 auto', padding: '80px 24px 64px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ width: '60px', height: '60px', background: 'rgba(255,0,0,0.08)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Package size={28} style={{ color: '#ff0000' }} />
        </div>
        <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Track Your Order</h1>
        <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Enter your order ID to see real-time status</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="e.g. YTP-2026-XXXX"
          style={{ flex: 1, padding: '13px 16px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', fontSize: '14px', outline: 'none', fontFamily: 'Roboto, sans-serif' }} />
        <button onClick={handleSearch} className="btn-yt" style={{ borderRadius: '12px', padding: '13px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <Search size={15} /> Track
        </button>
      </div>

      {/* Quick select from existing orders */}
      {orders.length > 0 && !found && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Your Recent Orders</div>
          {orders.slice(0, 3).map(o => (
            <button key={o.id} onClick={() => { setInput(o.id); setFound(o); setSearched(true); }}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '10px', marginBottom: '8px', cursor: 'pointer', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '13px', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,0,0,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'hsl(var(--border))'}>
              <span style={{ fontWeight: 600 }}>{o.id}</span>
              <span style={{ color: '#ff0000', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>{o.status}</span>
            </button>
          ))}
        </div>
      )}

      {searched && !found && (
        <div style={{ textAlign: 'center', padding: '40px', background: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ fontWeight: 700, marginBottom: '8px' }}>Order not found</h3>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '13px' }}>Double-check your Order ID. It should be in your confirmation email.</p>
        </div>
      )}

      {found && (
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '20px', padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Order ID</div>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>{found.id}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</div>
              <div style={{ fontWeight: 800, fontSize: '18px', color: '#ff0000' }}>₹{found.total.toLocaleString()}</div>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', height: '2px', background: 'hsl(var(--border))', zIndex: 0 }}>
                <div style={{ height: '100%', background: '#ff0000', width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%`, transition: 'width 0.8s ease', borderRadius: '2px' }} />
              </div>
              {STATUS_STEPS.map((step, i) => {
                const Icon = STATUS_ICONS[step];
                const done = i <= currentStep;
                return (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: done ? '#ff0000' : 'hsl(var(--card))', border: `2px solid ${done ? '#ff0000' : 'hsl(var(--border))'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                      <Icon size={13} style={{ color: done ? 'white' : 'hsl(var(--muted-foreground))' }} />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: done ? 700 : 400, color: done ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', whiteSpace: 'nowrap' }}>{STATUS_LABELS[step]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current status */}
          <div style={{ background: 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.1)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ fontSize: '12px', color: '#ff0000', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Current Status — {STATUS_LABELS[found.status]}</div>
            <p style={{ margin: 0, fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>{STATUS_DESC[found.status]}</p>
          </div>

          {/* Items */}
          <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Items ({found.items.length})</div>
          {found.items.map((item: any, i: number) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < found.items.length - 1 ? '1px solid hsl(var(--border))' : 'none' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.product.name}</div>
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '12px' }}>Size: {item.size} · Qty: {item.quantity}</div>
              </div>
              <div style={{ fontWeight: 700, color: '#ff0000' }}>₹{(item.product.price * item.quantity).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackOrderPage;
