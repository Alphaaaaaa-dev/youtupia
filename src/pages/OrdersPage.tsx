import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { Package, MapPin, Truck, CreditCard, Banknote, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  processing: { label: 'Processing',  color: '#f97316', bg: 'rgba(249,115,22,0.1)'  },
  confirmed:  { label: 'Confirmed',   color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  shipped:    { label: 'Shipped',     color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)'  },
  delivered:  { label: 'Delivered',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
};

const STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];

const OrdersPage = () => {
  const { orders } = useStore();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (orders.length === 0) return (
    <div style={{ paddingTop: '0px', textAlign: 'center', padding: '40px 24px' }}>
      <Package size={52} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
      <h2 style={{ fontWeight: 700, marginBottom: '12px' }}>No orders yet</h2>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '24px', fontSize: '14px' }}>Your orders will appear here after you shop.</p>
      <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none', borderRadius: '10px' }}>Start Shopping</Link>
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
        ) : filtered.map(o => {
          const meta = STATUS_META[o.status] || STATUS_META.processing;
          const isOpen = expanded === o.id;
          const isCOD = o.paymentMethod === 'cod';
          const stepIdx = STEPS.indexOf(o.status);

          return (
            <div key={o.id} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', overflow: 'hidden', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,0,0,0.2)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(var(--border))')}>

              {/* Order header — always visible */}
              <div style={{ padding: '18px 20px', cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : o.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 800, fontSize: '13px', fontFamily: 'monospace' }}>{o.id}</span>
                      <span style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.color}30`, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize' }}>{meta.label}</span>
                      <span style={{ background: isCOD ? 'rgba(34,197,94,0.08)' : 'rgba(255,0,0,0.06)', color: isCOD ? '#22c55e' : '#ff6666', borderRadius: '20px', padding: '3px 9px', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {isCOD ? <Banknote size={10} /> : <CreditCard size={10} />}
                        {isCOD ? 'COD' : 'PAID'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}{o.items.length} item{o.items.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <span style={{ fontWeight: 900, fontSize: '16px', color: '#ff0000' }}>₹{o.total.toLocaleString()}</span>
                    {isOpen ? <ChevronUp size={16} style={{ color: 'hsl(var(--muted-foreground))' }} /> : <ChevronDown size={16} style={{ color: 'hsl(var(--muted-foreground))' }} />}
                  </div>
                </div>

                {/* Progress bar — compact */}
                <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                  {STEPS.map((step, i) => (
                    <div key={step} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= stepIdx ? '#ff0000' : 'hsl(var(--border))', transition: 'background 0.3s' }} />
                  ))}
                </div>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: '1px solid hsl(var(--border))', padding: '18px 20px' }}>
                  {/* Tracking info */}
                  {o.trackingId && (
                    <div style={{ padding: '12px 14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#a78bfa', letterSpacing: '0.08em', marginBottom: '4px' }}>DELHIVERY TRACKING</div>
                        <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'monospace' }}>{o.trackingId}</div>
                      </div>
                      <a
                        href={o.trackingUrl || `https://www.delhivery.com/track/package/${o.trackingId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#8b5cf6', color: 'white', textDecoration: 'none', padding: '7px 13px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }}>
                        <ExternalLink size={12} /> Track on Delhivery
                      </a>
                    </div>
                  )}

                  {/* Status steps */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    {STEPS.map((step, i) => {
                      const done = i <= stepIdx;
                      const active = i === stepIdx;
                      const stepMeta = STATUS_META[step];
                      return (
                        <div key={step} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                          {i > 0 && <div style={{ position: 'absolute', top: '14px', right: '50%', left: '-50%', height: '2px', background: i <= stepIdx ? '#ff0000' : 'hsl(var(--border))' }} />}
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: done ? '#ff0000' : 'hsl(var(--secondary))', border: `2px solid ${done ? '#ff0000' : 'hsl(var(--border))'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px', position: 'relative', zIndex: 1, boxShadow: active ? '0 0 12px rgba(255,0,0,0.4)' : 'none', transition: 'all 0.3s' }}>
                            {done ? <span style={{ color: 'white', fontSize: '10px', fontWeight: 900 }}>✓</span> : <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'hsl(var(--border))', display: 'block' }} />}
                          </div>
                          <div style={{ fontSize: '9px', fontWeight: done ? 700 : 400, color: done ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))', textTransform: 'capitalize' }}>{step}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {o.items.map(item => (
                      <div key={`${item.productId}-${item.size}`}
                        onClick={() => navigate(`/product/${item.productId}`)}
                        style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', background: 'hsl(var(--secondary))', borderRadius: '10px', cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'hsl(var(--card-elevated))')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'hsl(var(--secondary))')}>
                        <img src={item.product.images[0]} alt={item.product.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '7px', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.product.name}</div>
                          <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Size: {item.size} · Qty: {item.quantity}</div>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#ff0000', flexShrink: 0 }}>₹{(item.product.price * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Order meta */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                    <div style={{ padding: '8px 12px', background: 'hsl(var(--secondary))', borderRadius: '8px' }}>
                      <div style={{ fontSize: '9px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '3px' }}>PAYMENT</div>
                      <div style={{ fontWeight: 600 }}>{isCOD ? '💵 Cash on Delivery' : `💳 Razorpay · ${o.paymentId?.slice(0, 14)}...`}</div>
                    </div>
                    <div style={{ padding: '8px 12px', background: 'hsl(var(--secondary))', borderRadius: '8px' }}>
                      <div style={{ fontSize: '9px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '3px' }}>TOTAL</div>
                      <div style={{ fontWeight: 700, color: '#ff0000' }}>₹{o.total.toLocaleString()}</div>
                    </div>
                    <div style={{ padding: '8px 12px', background: 'hsl(var(--secondary))', borderRadius: '8px', gridColumn: 'span 2' }}>
                      <div style={{ fontSize: '9px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '3px' }}>DELIVERY ADDRESS</div>
                      <div style={{ fontWeight: 500 }}>{o.customerName} · {o.address}</div>
                    </div>
                    {o.discountCode && (
                      <div style={{ padding: '8px 12px', background: 'rgba(34,197,94,0.06)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.15)' }}>
                        <div style={{ fontSize: '9px', color: '#22c55e', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '3px' }}>DISCOUNT APPLIED</div>
                        <div style={{ fontWeight: 600, color: '#22c55e' }}>{o.discountCode} (−₹{o.discountAmount?.toLocaleString()})</div>
                      </div>
                    )}
                    {o.notes && (
                      <div style={{ padding: '8px 12px', background: 'hsl(var(--secondary))', borderRadius: '8px' }}>
                        <div style={{ fontSize: '9px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '3px' }}>NOTES</div>
                        <div style={{ fontSize: '12px' }}>{o.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
