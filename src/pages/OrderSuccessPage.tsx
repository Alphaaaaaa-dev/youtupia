import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Truck, Clock, Banknote, CreditCard } from 'lucide-react';
import { useStore } from '../contexts/StoreContext';

const OrderSuccessPage = () => {
  const [params] = useSearchParams();
  const { orders } = useStore();
  const orderId = params.get('id');
  const order = orders.find(o => o.id === orderId);
  const isCOD = order?.paymentMethod === 'cod';

  return (
    <div style={{ paddingTop: '0px', minHeight: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
      <div style={{ maxWidth: '520px', width: '100%' }}>
        {/* Hero icon */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <CheckCircle size={38} style={{ color: '#22c55e' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 900, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            {isCOD ? 'Order Placed! 📦' : 'Payment Successful! 🎉'}
          </h1>
          <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.7, fontSize: '14px' }}>
            {isCOD
              ? order?.status === 'preorder_confirmed'
                ? <>Your preorder is confirmed! We'll notify you at <strong>{order?.customerEmail}</strong> as soon as stock arrives.</>
                : <>Your order is confirmed. Please keep <strong>₹{order?.total?.toLocaleString()}</strong> ready when the delivery arrives.</>
              : order?.status === 'preorder_confirmed'
                ? <>Your preorder is confirmed! We'll notify you at <strong>{order?.customerEmail}</strong> as soon as stock arrives.</>
                : <>Payment confirmed! We'll email <strong>{order?.customerEmail}</strong> with tracking details.</>
            }
          </p>
        </div>

        {/* Order details card */}
        {order && (
          <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '22px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {[
                { label: 'ORDER ID', value: order.id, mono: true },
                { label: 'DATE', value: new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { label: 'PAYMENT', value: isCOD ? '💵 Cash on Delivery' : '💳 Razorpay (' + order.paymentId?.slice(0, 12) + '...)', mono: isCOD ? false : true },
                { label: 'AMOUNT', value: '₹' + order.total.toLocaleString(), color: '#ff0000' },
              ].map(({ label, value, mono, color }) => (
                <div key={label} style={{ padding: '10px 12px', background: 'hsl(var(--secondary))', borderRadius: '8px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em', marginBottom: '5px' }}>{label}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: color || 'hsl(var(--foreground))', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Address */}
            <div style={{ padding: '10px 12px', background: 'hsl(var(--secondary))', borderRadius: '8px', marginBottom: '14px' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em', marginBottom: '5px' }}>DELIVERING TO</div>
              <div style={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}>{order.customerName} · {order.address}</div>
            </div>

            {/* Items */}
            <div>
              <div style={{ fontSize: '9px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em', marginBottom: '10px' }}>ITEMS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.items.map(item => (
                  <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <img src={item.product.images[0]} alt={item.product.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
                      <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))' }}>Size: {item.size} · ×{item.quantity}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#ff0000', flexShrink: 0 }}>₹{(item.product.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* What happens next */}
        <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '18px', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '14px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.06em', textTransform: 'uppercase' }}>What happens next</div>
          {[
            { icon: Clock,        color: '#fbbf24', title: 'Order Processing',    desc: 'We\'re packing your order (1–2 business days)' },
            { icon: Truck,        color: '#60a5fa', title: 'Shipped via Delhivery', desc: 'You\'ll get a tracking number via SMS & email' },
            { icon: isCOD ? Banknote : Package, color: '#22c55e', title: isCOD ? 'Pay on delivery' : 'Delivered!', desc: isCOD ? 'Keep exact change ready when delivery arrives' : 'Expected in 4–7 business days' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', marginBottom: '12px', padding: '10px', borderRadius: '8px', background: 'hsl(var(--secondary))' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={15} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>{title}</div>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/orders" className="btn-ghost" style={{ textDecoration: 'none', gap: '8px', borderRadius: '10px' }}>
            <Package size={14} /> My Orders
          </Link>
          <Link to="/track-order" className="btn-ghost" style={{ textDecoration: 'none', gap: '8px', borderRadius: '10px' }}>
            <Truck size={14} /> Track Order
          </Link>
          <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none', borderRadius: '10px' }}>
            Continue Shopping →
          </Link>
        </div>
      </div>
      <style>{`@keyframes popIn { from { transform: scale(0.5); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  );
};

export default OrderSuccessPage;
