import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { Package, Truck, CreditCard, Banknote, ChevronDown, ChevronUp, ExternalLink, X } from 'lucide-react';

const generateInvoice = (order: any) => {
  const subtotal = order.items.reduce((s: number, i: any) => s + i.product.price * i.quantity, 0);
  const rows = order.items.map((item: any, i: number) =>
    '<tr><td style="color:#999;font-size:12px;">' + (i+1) + '</td><td><strong>' + item.product.name + '</strong></td><td style="color:#666;">' + item.size + '</td><td style="color:#666;">' + item.quantity + '</td><td>&#8377;' + item.product.price.toLocaleString('en-IN') + '</td><td style="font-weight:700;">&#8377;' + (item.product.price * item.quantity).toLocaleString('en-IN') + '</td></tr>'
  ).join('');
  const discountRow = order.discountAmount ? '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#16a34a;"><span>Discount (' + order.discountCode + ')</span><span>&#8722;&#8377;' + order.discountAmount.toLocaleString('en-IN') + '</span></div>' : '';
  const codRow = order.codCharge ? '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;"><span>COD Handling</span><span>&#8377;' + order.codCharge + '</span></div>' : '';
  const txnRow = order.paymentId ? '<div style="font-size:10px;color:#999;margin-top:6px;font-family:monospace;">Txn: ' + order.paymentId + '</div>' : '';
  const payBg = order.paymentMethod === 'cod' ? '#dcfce7' : '#dbeafe';
  const payColor = order.paymentMethod === 'cod' ? '#16a34a' : '#2563eb';
  const payLabel = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online';
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const html = '<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>Invoice ' + order.id + '</title>'
    + '<style>*{margin:0;padding:0;box-sizing:border-box;}body{font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;padding:40px;}.hdr{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #ff0000;margin-bottom:28px;}.parties{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px;}.pbox{background:#f9f9f9;border-radius:10px;padding:16px;border:1px solid #eee;}.plabel{font-size:9px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#999;margin-bottom:8px;}table{width:100%;border-collapse:collapse;margin-bottom:24px;}th{background:#ff0000;color:white;padding:10px 14px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}th:last-child,td:last-child{text-align:right;}td{padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;}.ftr{margin-top:40px;padding-top:20px;border-top:2px solid #f0f0f0;display:flex;justify-content:space-between;align-items:center;}@media print{body{padding:20px;}}</style>'
    + '</head><body>'
    + '<div class="hdr"><div style="display:flex;align-items:center;">'
    + '<div style="width:48px;height:48px;background:#ff0000;border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-right:14px;"><svg width="20" height="18" viewBox="0 0 16 14" fill="none"><path d="M6.5 10L10.5 7L6.5 4V10Z" fill="white"/></svg></div>'
    + '<div><div style="font-size:26px;font-weight:900;color:#ff0000;">YOUTUPIA</div><div style="font-size:11px;color:#666;">Creator Merchandise Platform</div></div>'
    + '</div><div style="text-align:right;">'
    + '<div style="font-size:28px;font-weight:900;">INVOICE</div>'
    + '<div style="font-family:monospace;font-size:14px;color:#ff0000;font-weight:700;margin-top:4px;">' + order.id + '</div>'
    + '<div style="font-size:12px;color:#666;margin-top:4px;">' + dateStr + '</div>'
    + '<div style="display:inline-block;background:#fff3f3;border:1px solid #ffcccc;border-radius:6px;padding:3px 10px;font-size:11px;color:#cc0000;font-weight:700;margin-top:6px;">GST: 27AABCU9603R1ZM</div>'
    + '</div></div>'
    + '<div class="parties">'
    + '<div class="pbox"><div class="plabel">Sold By</div><div style="font-size:15px;font-weight:700;margin-bottom:4px;">Youtupia Merchandise LLP</div><div style="font-size:12px;color:#555;line-height:1.6;">123, Creator Hub, Bandra West<br/>Mumbai, Maharashtra - 400050<br/>India<br/>support@youtupia.com</div></div>'
    + '<div class="pbox"><div class="plabel">Bill To / Ship To</div><div style="font-size:15px;font-weight:700;margin-bottom:4px;">' + order.customerName + '</div><div style="font-size:12px;color:#555;line-height:1.6;">' + order.address + '<br/>Phone: ' + order.customerPhone + '<br/>Email: ' + order.customerEmail + '</div></div>'
    + '</div>'
    + '<table><thead><tr><th>#</th><th>Product</th><th>Size</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>' + rows + '</tbody></table>'
    + '<div style="margin-left:auto;width:280px;">'
    + '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#444;"><span>Subtotal</span><span>&#8377;' + subtotal.toLocaleString('en-IN') + '</span></div>'
    + discountRow
    + '<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;"><span>Shipping</span><span style="color:#16a34a;">FREE</span></div>'
    + codRow
    + '<hr style="border:none;border-top:1px solid #eee;margin:8px 0;"/>'
    + '<div style="display:flex;justify-content:space-between;padding:10px 0;font-size:18px;font-weight:900;color:#ff0000;"><span>Total</span><span>&#8377;' + order.total.toLocaleString('en-IN') + '</span></div>'
    + '<div style="margin-top:6px;display:flex;gap:8px;"><span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:' + payBg + ';color:' + payColor + ';">' + payLabel + '</span>'
    + '<span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:#fff3f3;color:#cc0000;text-transform:capitalize;">' + order.status.replace('_',' ') + '</span></div>'
    + txnRow
    + '</div>'
    + '<div class="ftr"><div style="font-size:11px;color:#999;line-height:1.7;"><strong>Terms:</strong> All sales are final. Exchange within 7 days with original invoice.<br/>GSTIN: 27AABCU9603R1ZM · CIN: U74999MH2024LLP123456<br/>Computer-generated invoice. No signature required.</div>'
    + '<div style="text-align:right;"><div style="font-size:16px;font-weight:900;color:#ff0000;">YOUTUPIA</div><div style="font-size:10px;color:#bbb;margin-top:2px;">Creator Merch, Made Real.</div></div></div>'
    + '</body></html>';

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
};

const STATUS_META: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  processing:        { label: 'Processing',         color: '#f97316', bg: 'rgba(249,115,22,0.1)',   emoji: '⏳' },
  preorder_confirmed:{ label: 'Preorder Confirmed', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', emoji: '📦' },
  confirmed:         { label: 'Confirmed',          color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  emoji: '✅' },
  shipped:           { label: 'Shipped',            color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  emoji: '🚚' },
  delivered:         { label: 'Delivered',          color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   emoji: '🎉' },
  cancelled:         { label: 'Cancelled',          color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   emoji: '❌' },
};

const STEPS = ['processing', 'confirmed', 'shipped', 'delivered'];

const OrdersPage = () => {
  const { orders, addOrder, updateOrder } = useStore();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [syncing, setSyncing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setSyncing(true);
    fetch(`/api/orders?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.orders && Array.isArray(data.orders)) {
          data.orders.forEach((dbOrder: any) => {
            const exists = orders.find(o => o.id === dbOrder.id);
            if (!exists) addOrder(dbOrder);
          });
        }
      })
      .catch(err => console.error('Failed to sync orders:', err))
      .finally(() => setSyncing(false));
  }, [user?.id]);

  const handleCancelRequest = (orderId: string) => {
    setCancellingId(orderId);
    setCancelReason('');
  };

  const submitCancel = (orderId: string) => {
    if (!cancelReason.trim()) return;
    setCancelLoading(true);
    // Update locally — admin will see the cancellation request
    updateOrder(orderId, {
      status: 'cancelled',
      cancelReason: cancelReason.trim(),
    });
    setCancelLoading(false);
    setCancellingId(null);
    setCancelReason('');
  };

  const allFilters = ['all', 'processing', 'preorder_confirmed', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (orders.length === 0 && !syncing) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
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
    <div style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 24px 64px' }}>

      {/* Cancel modal */}
      {cancellingId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
          onClick={() => setCancellingId(null)}>
          <div style={{ background: 'hsl(var(--card))', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', border: '1px solid hsl(var(--border))' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontWeight: 800, fontSize: '16px', margin: 0 }}>Cancel Order</h3>
              <button onClick={() => setCancellingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: 1.6 }}>
              Please tell us why you want to cancel. Our team will review and process your request.
            </p>
            <textarea
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="e.g. Ordered by mistake, changed my mind, found a better deal..."
              rows={3}
              style={{ width: '100%', padding: '10px 12px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '13px', outline: 'none', resize: 'vertical', fontFamily: 'Roboto, sans-serif', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button onClick={() => setCancellingId(null)}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'none', color: 'hsl(var(--muted-foreground))', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: '13px' }}>
                Keep Order
              </button>
              <button onClick={() => submitCancel(cancellingId)} disabled={!cancelReason.trim() || cancelLoading}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: cancelReason.trim() ? '#ef4444' : 'rgba(239,68,68,0.3)', color: 'white', cursor: cancelReason.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 700 }}>
                {cancelLoading ? 'Cancelling...' : 'Submit Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

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
        {allFilters.map(f => {
          const count = f === 'all' ? orders.length : orders.filter(o => o.status === f).length;
          if (f !== 'all' && count === 0) return null;
          const meta = STATUS_META[f];
          return (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filter === f ? '#ff0000' : 'hsl(var(--border))'}`, background: filter === f ? 'rgba(255,0,0,0.08)' : 'transparent', color: filter === f ? '#ff0000' : 'hsl(var(--muted-foreground))', fontSize: '12px', fontWeight: filter === f ? 700 : 400, cursor: 'pointer', fontFamily: 'Roboto, sans-serif', transition: 'all 0.15s' }}>
              {f === 'all' ? `All (${count})` : `${meta?.emoji} ${meta?.label} (${count})`}
            </button>
          );
        })}
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
          const isPreorder = order.status === 'preorder_confirmed';
          const isCancelled = order.status === 'cancelled';
          const canCancel = ['processing', 'preorder_confirmed', 'confirmed'].includes(order.status);

          return (
            <div key={order.id} style={{ background: 'hsl(var(--card))', border: `1px solid ${isCancelled ? 'rgba(239,68,68,0.2)' : isPreorder ? 'rgba(167,139,250,0.2)' : 'hsl(var(--border))'}`, borderRadius: '16px', overflow: 'hidden' }}>

              {/* Preorder banner */}
              {isPreorder && (
                <div style={{ background: 'rgba(167,139,250,0.08)', borderBottom: '1px solid rgba(167,139,250,0.15)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>📦</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#a78bfa' }}>Preorder Confirmed — Thank you!</div>
                    <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>We're waiting for stock to arrive. You'll be notified as soon as it ships.</div>
                  </div>
                </div>
              )}

              {/* Cancelled banner */}
              {isCancelled && (
                <div style={{ background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.15)', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>❌</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>Order Cancelled</div>
                    {(order as any).cancelReason && (
                      <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>Reason: {(order as any).cancelReason}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Order header */}
              <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700 }}>{order.id}</span>
                    <span style={{ padding: '3px 10px', borderRadius: '20px', background: meta.bg, color: meta.color, fontSize: '11px', fontWeight: 700 }}>{meta.emoji} {meta.label}</span>
                    {isCOD && <span style={{ padding: '3px 8px', borderRadius: '20px', background: 'rgba(34,197,94,0.08)', color: '#22c55e', fontSize: '11px', fontWeight: 600 }}>COD</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items.length} item{order.items.length !== 1 ? 's' : ''} · <strong style={{ color: '#ff0000' }}>₹{order.total.toLocaleString()}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {canCancel && (
                    <button onClick={() => handleCancelRequest(order.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: 'none', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#ef4444', fontFamily: 'Roboto, sans-serif' }}>
                      <X size={12} /> Cancel
                    </button>
                  )}
                  <button onClick={() => generateInvoice(order)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: 'none', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: '#ff6666', fontFamily: 'Roboto, sans-serif' }}>
                    🧾 Invoice
                  </button>
                  <button onClick={() => setExpanded(isExpanded ? null : order.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', background: 'none', border: '1px solid hsl(var(--border))', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', fontFamily: 'Roboto, sans-serif' }}>
                    {isExpanded ? <><ChevronUp size={13} /> Hide</> : <><ChevronDown size={13} /> Details</>}
                  </button>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid hsl(var(--border))', padding: '20px' }}>

                  {/* Progress tracker — hide for preorder and cancelled */}
                  {!isPreorder && !isCancelled && stepIdx >= 0 && (
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
                      <div style={{ height: '3px', background: 'hsl(var(--secondary))', borderRadius: '2px' }}>
                        <div style={{ height: '100%', background: '#ff0000', borderRadius: '2px', width: `${(stepIdx / (STEPS.length - 1)) * 100}%`, transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  )}

                  {/* Preorder timeline */}
                  {isPreorder && (
                    <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: '10px', padding: '14px 16px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#a78bfa', marginBottom: '8px' }}>PREORDER TIMELINE</div>
                      {[
                        { step: 'Preorder placed', done: true },
                        { step: 'Stock arrives & verified', done: false },
                        { step: 'Order confirmed & packed', done: false },
                        { step: 'Shipped to you', done: false },
                      ].map(({ step, done }) => (
                        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '12px', color: done ? '#a78bfa' : 'hsl(var(--muted-foreground))' }}>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${done ? '#a78bfa' : 'hsl(var(--border))'}`, background: done ? '#a78bfa' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {done && <span style={{ color: 'white', fontSize: '9px' }}>✓</span>}
                          </div>
                          {step}
                        </div>
                      ))}
                    </div>
                  )}

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
