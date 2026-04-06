import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { Package, MapPin, Truck, CreditCard, Banknote, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  processing: { label: 'Processing',  color: '#f97316', bg: 'rgba(249,115,22,0.1)'  },
  confirmed:  { label: 'Confirmed',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  shipped:    { label: 'Shipped',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  delivered:  { label: 'Delivered',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
};

const STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];

const OrdersPage = () => {
  const { orders, addOrder } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [syncing, setSyncing] = useState(false);

  // ── On mount: sync orders from Supabase into local state ─────────────────
  useEffect(() => {
    if (!user?.id) return;
    setSyncing(true);
    fetch(`/api/get-orders?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.orders && Array.isArray(data.orders)) {
          // Merge: add any DB orders not already in local state
          data.orders.forEach((dbOrder: any) => {
            const exists = orders.find(o => o.id === dbOrder.id);
            if (!exists) addOrder(dbOrder);
          });
        }
      })
      .catch(err => console.error('Failed to sync orders:', err))
      .finally(() => setSyncing(false));
  }, [user?.id]);

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (orders.length === 0 && !syncing) return (
    <div style={{ paddingTop: '0px', textAlign: 'center', padding: '40px 24px' }}>
      <Package size={52} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
      <h2 style={{ fontWeight: 700, marginBottom: '12px' }}>No orders yet</h2>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px', fontSize: '14px' }}>Your orders will appear here after you shop.</p>
      <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none', borderRadius: '10px' }}>Start Shopping</Link>
    </div>
  );

  if (syncing && orders.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <div style={{ width: '32px', height: '32px', border: '3px solid rgba(255,0,0,0.2)', borderTopColor: '#ff0000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>Loading your orders...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ paddingTop: '0px', maxWidth: '820px', margin: '0 auto', padding: '72px 24px 64px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>My Orders</h1>
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '4px' }}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</p>
        </div>
        <Link to="/track-order" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#ff0000', textDecoration: 'none', fontWeight: 600 }}>
          <Truck size={14} /> Track with ID
        </Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['all', 'processing', 'confirmed', 'shipped', 'delivered'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filter === f ? '#ff0000' : 'hsl(var(--border))'}`, background: filter === f ? 'rgba(255,0,0,0.08)' : 'transparent', color: filter === f ? '#ff0000' : 'hsl(var(--muted-foreground))', fontSize: '12px', fontWeight: filter === f ? 700 : 400, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'Roboto, sans-serif', transition: 'all 0.15s' }}>
            {f === 'all' ? `All (${orders.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${orders.filter(o => o.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', background: 'hsl(var(--card))', borderRadius: '16px', border: '1px solid hsl(var(--border))' }}>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>No {filter} orders.</p>
          </div>
        ) : filtered.map(order => {
          const meta = STATUS_META[order.status] || STATUS_META.processing;
          const isExpanded = expanded === order.id;
          const stepIdx = STEPS.indexOf(order.status);
          const isCOD = order.paymentMethod === 'cod';

          return (
            <div key={order.id} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', overflow: 'hidden', transition: 'box-shadow 0.2s' }}>
              {/* Order header */}
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700 }}>{order.id}</span>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', background: meta.bg, color: meta.color, fontSize: '11px', fontWeight: 700 }}>{meta.label}</span>
                    {isCOD && <span style={{ padding: '3px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>COD</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items.length} item{order.items.length !== 1 ? 's' : ''} · <strong style={{ color: '#ff0000' }}>₹{order.total.toLocaleString()}</strong>
                  </div>
                </div>
                <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: 'none', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', fontFamily: 'Roboto, sans-serif' }}>
                  {isExpanded ? <><ChevronUp size={13} /> Hide</> : <><ChevronDown size={13} /> Details</>}
                </button>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid hsl(var(--border))', padding: '20px' }}>
                  {/* Progress bar */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      {STEPS.map((step, i) => (
                        <div key={step} style={{ textAlign: 'center', flex: 1 }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', margin: '0 auto 4px', background: i <= stepIdx ? '#ff0000' : 'hsl(var(--secondary))', border: `2px solid ${i <= stepIdx ? '#ff0000' : 'hsl(var(--border))'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {i < stepIdx && <span style={{ color: 'white', fontSize: '10px' }}>✓</span>}
                            {i === stepIdx && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white' }} />}
                          </div>
                          <div style={{ fontSize: '10px', color: i <= stepIdx ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', textTransform: 'capitalize', fontWeight: i === stepIdx ? 700 : 400 }}>{step}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: '3px', background: 'hsl(var(--secondary))', borderRadius: '2px', position: 'relative', marginTop: '4px' }}>
                      <div style={{ height: '100%', background: '#ff0000', borderRadius: '2px', width: `${(stepIdx / (STEPS.length - 1)) * 100}%`, transition: 'width 0.5s' }} />
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ marginBottom: '16px' }}>
                    {order.items.map(item => (
                      <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                        <img src={item.product.images[0]} alt={item.product.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.product.name}</div>
                          <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Size: {item.size} · ×{item.quantity}</div>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#ff0000' }}>₹{(item.product.price * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Address & payment */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                    <div style={{ padding: '10px 12px', background: 'hsl(var(--secondary))', borderRadius: '8px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em', marginBottom: '4px' }}>DELIVERING TO</div>
                      <div style={{ fontSize: '12px' }}>{order.customerName}</div>
                      <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px', lineHeight: 1.5 }}>{order.address}</div>
                    </div>
                    <div style={{ padding: '10px 12px', background: 'hsl(var(--secondary))', borderRadius: '8px' }}>
                      <div style={{ fontSize: '9px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em', marginBottom: '4px' }}>PAYMENT</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                        {isCOD ? <Banknote size={13} style={{ color: '#22c55e' }} /> : <CreditCard size={13} style={{ color: '#3b82f6' }} />}
                        {isCOD ? 'Cash on Delivery' : 'Razorpay'}
                      </div>
                      {order.paymentId && <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', fontFamily: 'monospace', marginTop: '3px' }}>{order.paymentId}</div>}
                    </div>
                  </div>

                  {/* Tracking */}
                  {order.trackingId && (
                    <div style={{ padding: '12px', background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#8b5cf6', marginBottom: '2px' }}>TRACKING ID</div>
                        <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>{order.trackingId}</div>
                      </div>
                      {order.trackingUrl && (
                        <a href={order.trackingUrl} target="_blank" rel="noreferrer"
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#8b5cf6', textDecoration: 'none', fontWeight: 600 }}>
                          <ExternalLink size={13} /> Track
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrdersPage;
