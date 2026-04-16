import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, Lock, Truck, CreditCard, Banknote, ChevronDown, MapPin, User, Phone, Mail, Home } from 'lucide-react';
import { Order } from '../contexts/StoreContext';
import { toast as sonnerToast } from '@/components/ui/sonner';

const COD_CHARGE = 0;

type PaymentMethod = 'razorpay' | 'cod';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, addOrder, validateDiscountCode } = useStore();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [discountCode, setDiscountCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [discountFixed, setDiscountFixed] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountError, setDiscountError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const [form, setForm] = useState({
    name: (user as any)?.name || '',
    email: (user as any)?.email || '',
    phone: (user as any)?.phone || '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const discountFromUrl = (searchParams.get('discountCode') || '').trim();

  useEffect(() => {
    if (!discountFromUrl) return;
    const result = validateDiscountCode(discountFromUrl);
    setDiscountCode(discountFromUrl.toUpperCase());
    if (result.valid) {
      setDiscountPct(result.pct);
      setDiscountFixed(result.amount);
      setDiscountType(result.type);
      setDiscountApplied(true);
    }
  }, [discountFromUrl]);

  if (cart.length === 0) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', paddingTop: '24px' }}>
        <div style={{ fontSize: '48px' }}>🛒</div>
        <h2 style={{ fontWeight: 700 }}>Your cart is empty</h2>
        <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none' }}>Go Shopping</Link>
      </div>
    );
  }

  const shipping = 0;

  const discountAmount = discountApplied
    ? discountType === 'percentage'
      ? Math.round((cartTotal * discountPct) / 100)
      : Math.min(discountFixed, cartTotal)
    : 0;

  const codCharge = paymentMethod === 'cod' ? COD_CHARGE : 0;
  const total = cartTotal - discountAmount + shipping + codCharge;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())              e.name    = 'Required';
    if (!form.email.includes('@'))      e.email   = 'Valid email required';
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Valid phone required';
    if (!form.address.trim())           e.address = 'Required';
    if (!form.city.trim())              e.city    = 'Required';
    if (!form.state.trim())             e.state   = 'Required';
    if (form.pincode.replace(/\D/g, '').length < 6) e.pincode = 'Valid PIN required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const hasPreorder = cart.some(item => item.product.preorder);

  const buildOrder = (paymentId?: string): Order => ({
    id:            'YTP-' + Date.now(),
    items:         cart,
    total,
    status:        hasPreorder ? 'preorder_confirmed' : 'processing',
    customerName:  form.name.trim(),
    customerEmail: form.email.trim(),
    customerPhone: form.phone.trim(),
    address:       [form.address, form.landmark, form.city, form.state, form.pincode].filter(Boolean).join(', '),
    paymentId,
    paymentMethod,
    codCharge:     codCharge > 0 ? codCharge : undefined,
    discountCode:  discountApplied ? discountCode : undefined,
    discountAmount: discountApplied ? discountAmount : undefined,
    createdAt:     new Date().toISOString(),
  });

  // ── persist to Supabase via our serverless API ──────────────────────────
  const persistOrder = async (order: Order, userId?: string | null) => {
    try {
      await fetch('/api/save-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, userId: userId || null }),
      });
    } catch (err) {
      console.error('Failed to persist order:', err);
    }
  };

  // ── Razorpay ─────────────────────────────────────────────────────────────
  const handleRazorpay = () => {
    if (!validate()) { sonnerToast.error('Please fix the form errors'); return; }
    setLoading(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
    script.onload = async () => {
      let rzpKey = '';
      try {
        const keyRes = await fetch('/api/razorpay-key');
        const keyData = await keyRes.json();
        rzpKey = keyData.key || '';
      } catch { rzpKey = ''; }

      if (!rzpKey) {
        sonnerToast.error('Razorpay not configured');
        setLoading(false);
        return;
      }

      const options = {
        key: rzpKey,
        amount: total * 100,
        currency: 'INR',
        name: 'Youtupia',
        prefill: { name: form.name, email: form.email, contact: form.phone },
        handler: async (response: any) => {
          const order = buildOrder(response.razorpay_payment_id);
          addOrder(order);
          await persistOrder(order, (user as any)?.id);
          clearCart();
          sonnerToast.success('Payment successful!', { description: 'Order ID: ' + order.id });
          navigate('/order-success?id=' + order.id);
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setLoading(false);
    };
  };

  // ── COD ──────────────────────────────────────────────────────────────────
  const handleCOD = () => {
    if (!validate()) { sonnerToast.error('Please fix the form errors'); return; }
    setLoading(true);
    setTimeout(async () => {
      const order = buildOrder();
      addOrder(order);
      await persistOrder(order, (user as any)?.id);
      clearCart();
      sonnerToast.success('Order placed!', { description: 'Pay ₹' + total + ' on delivery.' });
      navigate('/order-success?id=' + order.id);
      setLoading(false);
    }, 600);
  };

  const inp = (
    icon: React.ReactNode,
    key: keyof typeof form,
    label: string,
    type = 'text',
    placeholder = '',
    required = true,
  ) => (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        {label} {required && <span style={{ color: '#ff0000' }}>*</span>}
      </label>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', left: '12px', color: 'hsl(var(--muted-foreground))', display: 'flex', pointerEvents: 'none' }}>{icon}</div>
        <input
          type={type}
          value={form[key]}
          onChange={e => { setForm(f => ({ ...f, [key]: e.target.value })); setErrors(er => ({ ...er, [key]: '' })); }}
          placeholder={placeholder}
          style={{
            width: '100%', padding: '11px 14px 11px 38px',
            background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))',
            border: `1.5px solid ${errors[key] ? '#ef4444' : 'hsl(var(--border))'}`,
            borderRadius: '10px', color: 'hsl(var(--foreground))',
            fontFamily: 'Roboto, sans-serif', fontSize: '14px',
            outline: 'none', boxSizing: 'border-box' as const,
          }}
          onFocus={e => { e.target.style.borderColor = '#ff0000'; e.target.style.boxShadow = '0 0 0 3px rgba(255,0,0,0.08)'; }}
          onBlur={e => { e.target.style.borderColor = errors[key] ? '#ef4444' : 'hsl(var(--border))'; e.target.style.boxShadow = 'none'; }}
        />
      </div>
      {errors[key] && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{errors[key]}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 64px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '32px', letterSpacing: '-0.02em' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

        {/* ── LEFT: Form ── */}
        <div>
          {/* Delivery info */}
          <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <MapPin size={18} style={{ color: '#ff0000' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Delivery Information</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
              {inp(<User size={14} />, 'name', 'Full Name', 'text', 'John Doe')}
              {inp(<Mail size={14} />, 'email', 'Email', 'email', 'john@example.com')}
              {inp(<Phone size={14} />, 'phone', 'Phone', 'tel', '9999999999')}
            </div>
            {inp(<Home size={14} />, 'address', 'Street Address', 'text', 'House/Flat No, Street, Area')}
            {inp(<MapPin size={14} />, 'landmark', 'Landmark', 'text', 'Near XYZ (optional)', false)}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0 14px' }}>
              {inp(<MapPin size={14} />, 'city', 'City', 'text', 'Mumbai')}
              {inp(<MapPin size={14} />, 'state', 'State', 'text', 'Maharashtra')}
              {inp(<MapPin size={14} />, 'pincode', 'PIN Code', 'text', '400001')}
            </div>
          </div>

          {/* Payment method */}
          <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <CreditCard size={18} style={{ color: '#ff0000' }} />
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Payment Method</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { id: 'razorpay' as PaymentMethod, icon: <CreditCard size={18} />, label: 'Pay Online', sub: 'Credit/Debit Card, UPI, Net Banking via Razorpay', color: '#3b82f6' },
                { id: 'cod' as PaymentMethod, icon: <Banknote size={18} />, label: 'Cash on Delivery', sub: codCharge > 0 ? `+₹${codCharge} handling charge` : 'Free — Pay when your order arrives', color: '#22c55e' },
              ].map(m => (
                <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', border: `2px solid ${paymentMethod === m.id ? m.color : 'hsl(var(--border))'}`, borderRadius: '12px', cursor: 'pointer', background: paymentMethod === m.id ? m.color + '08' : 'transparent', transition: 'all 0.15s' }}>
                  <input type="radio" name="payment" value={m.id} checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} style={{ accentColor: m.color, width: '16px', height: '16px' }} />
                  <span style={{ color: m.color }}>{m.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{m.label}</div>
                    <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{m.sub}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Order summary ── */}
        <div style={{ position: 'sticky', top: '120px' }}>
          <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Order Summary</h2>

            {/* Cart items */}
            <div style={{ marginBottom: '16px', maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cart.map(item => (
                <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={item.product.images[0]} alt={item.product.name} style={{ width: '44px', height: '44px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
                    <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Size: {item.size} · ×{item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#ff0000', flexShrink: 0 }}>₹{(item.product.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div style={{ height: '1px', background: 'hsl(var(--border))', marginBottom: '14px' }} />

            {/* Discount code */}
            <div style={{ marginBottom: '14px' }}>
              {!discountApplied ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={discountCode} onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); }}
                    placeholder="Discount code"
                    style={{ flex: 1, padding: '9px 12px', background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))', border: `1px solid ${discountError ? '#ef4444' : 'hsl(var(--border))'}`, borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '13px', outline: 'none', fontFamily: 'Roboto, sans-serif' }} />
                  <button onClick={() => {
                    const result = validateDiscountCode(discountCode);
                    if (result.valid) { setDiscountPct(result.pct); setDiscountFixed(result.amount); setDiscountType(result.type); setDiscountApplied(true); setDiscountError(''); }
                    else { setDiscountError('Invalid code'); }
                  }} style={{ padding: '9px 14px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>Apply</button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(22,163,74,0.06)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#16a34a' }}>✓ {discountCode}</span>
                  <button onClick={() => { setDiscountCode(''); setDiscountPct(0); setDiscountFixed(0); setDiscountApplied(false); setDiscountError(''); }}
                    style={{ fontSize: '12px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                </div>
              )}
              {discountError && <div style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px' }}>{discountError}</div>}
            </div>

            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--muted-foreground))' }}>
                <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
              </div>
              {discountApplied && discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                  <span>Discount</span><span>−₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                <span>Shipping</span><span>FREE</span>
              </div>
              {codCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'hsl(var(--muted-foreground))' }}>
                  <span>COD charge</span><span>₹{codCharge}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, marginBottom: '20px', paddingTop: '12px', borderTop: '2px solid hsl(var(--border))' }}>
              <span>Total</span><span style={{ color: '#ff0000' }}>₹{total.toLocaleString()}</span>
            </div>

            {/* Place order button */}
            <button
              onClick={paymentMethod === 'razorpay' ? handleRazorpay : handleCOD}
              disabled={loading}
              className="btn-yt ripple"
              style={{ width: '100%', justifyContent: 'center', borderRadius: '12px', padding: '14px', fontSize: '15px', fontWeight: 700, opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {loading ? 'Processing...' : paymentMethod === 'razorpay' ? '💳 Pay ₹' + total.toLocaleString() : '📦 Place Order — Pay on Delivery'}
            </button>

            {/* Trust badges */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '14px' }}>
              {[
                { icon: Shield, text: 'Secure' },
                { icon: Lock, text: 'Encrypted' },
                { icon: Truck, text: 'Free Ship' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
                  <Icon size={12} /> {text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
