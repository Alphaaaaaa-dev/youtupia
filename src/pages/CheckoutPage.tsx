import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, Lock, Truck, CreditCard, Banknote, CheckCircle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Order } from '../contexts/StoreContext';
import { toast as sonnerToast } from '@/components/ui/sonner';

// COD extra charge (set to 0 for free COD or e.g. 29 for ₹29 handling fee)
const COD_CHARGE = 0;

type PaymentMethod = 'razorpay' | 'cod';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, addOrder, validateDiscountCode } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Payment method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');

  // Discount
  const [discountCode, setDiscountCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [discountError, setDiscountError] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  // Form
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', landmark: '', city: '', state: '', pincode: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-apply discount from URL
  const discountFromUrl = (searchParams.get('discountCode') || '').trim();
  useEffect(() => {
    if (!discountFromUrl) return;
    const upper = discountFromUrl.toUpperCase();
    const pct = validateDiscountCode(upper);
    setDiscountCode(upper);
    if (pct > 0) { setDiscountPct(pct); setDiscountApplied(true); }
  }, [discountFromUrl]);

  if (cart.length === 0) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', paddingTop: '128px' }}>
      <div style={{ fontSize: '48px' }}>🛒</div>
      <h2 style={{ fontWeight: 700 }}>Your cart is empty</h2>
      <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none' }}>Go Shopping</Link>
    </div>
  );

  // ── Calculations ──────────────────────────────────
  const shipping = cartTotal >= 999 ? 0 : 60;
  const discountAmount = Math.round(cartTotal * discountPct / 100);
  const codCharge = paymentMethod === 'cod' ? COD_CHARGE : 0;
  const total = cartTotal - discountAmount + shipping + codCharge;

  // ── Validation ────────────────────────────────────
  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Valid 10-digit number required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (form.pincode.replace(/\D/g, '').length < 6) e.pincode = '6-digit PIN code required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Build order object ────────────────────────────
  const buildOrder = (paymentId?: string): Order => ({
    id: 'YTP-' + Date.now(),
    items: cart,
    total,
    status: 'processing',
    customerName: form.name.trim(),
    customerEmail: form.email.trim(),
    customerPhone: form.phone.trim(),
    address: [form.address, form.landmark, form.city, form.state, form.pincode].filter(Boolean).join(', '),
    paymentId,
    paymentMethod,
    codCharge: codCharge > 0 ? codCharge : undefined,
    discountCode: discountApplied ? discountCode : undefined,
    discountAmount: discountApplied ? discountAmount : undefined,
    createdAt: new Date().toISOString(),
  });

  // ── Razorpay handler ──────────────────────────────
  const handleRazorpay = () => {
    if (!validate()) { sonnerToast.error('Please fix the form errors'); return; }
    setLoading(true);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    script.onload = async () => {
      // Fetch key from server — never exposed in frontend bundle
      let rzpKey = '';
      try {
        const keyRes = await fetch('/api/razorpay-key');
        const keyData = await keyRes.json();
        rzpKey = keyData.key || '';
      } catch {
        rzpKey = '';
      }
      if (!rzpKey) {
        sonnerToast.error('Razorpay not configured', {
          description: 'Add RAZORPAY_KEY_ID to your Vercel environment variables.',
        });
        setLoading(false);
        return;
      }

      const options = {
        key: rzpKey,
        amount: total * 100,
        currency: 'INR',
        name: 'Youtupia',
        description: `${cart.length} item(s) — ${cart.map(i => i.product.name).join(', ').slice(0, 80)}`,
        image: '/favicon.ico',
        prefill: { name: form.name, email: form.email, contact: form.phone.replace(/\D/g, '') },
        notes: { address: form.address, city: form.city, pincode: form.pincode },
        theme: { color: '#ff0000' },
        modal: { escape: true, backdropclose: false },
        handler: (response: any) => {
          const order = buildOrder(response.razorpay_payment_id);
          addOrder(order);
          clearCart();
          sonnerToast.success('Payment successful!', { description: 'Order ID: ' + order.id });
          navigate('/order-success?id=' + order.id);
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (resp: any) => {
        sonnerToast.error('Payment failed', { description: resp.error?.description || 'Please try again.' });
        setLoading(false);
      });
      rzp.open();
      setLoading(false);
    };

    script.onerror = () => {
      sonnerToast.error('Could not load Razorpay. Check your internet connection.');
      setLoading(false);
    };
  };

  // ── COD handler ───────────────────────────────────
  const handleCOD = () => {
    if (!validate()) { sonnerToast.error('Please fix the form errors'); return; }
    setLoading(true);
    setTimeout(() => {
      const order = buildOrder(undefined);
      addOrder(order);
      clearCart();
      sonnerToast.success('Order placed!', { description: 'Pay ₹' + total + ' cash on delivery.' });
      navigate('/order-success?id=' + order.id);
      setLoading(false);
    }, 600);
  };

  const applyDiscount = () => {
    const pct = validateDiscountCode(discountCode.trim());
    if (pct > 0) { setDiscountPct(pct); setDiscountApplied(true); setDiscountError(''); sonnerToast.success(`${discountCode} applied — ${pct}% off!`); }
    else setDiscountError('Invalid code. Try a valid code');
  };

  // ── Field renderer ────────────────────────────────
  const inp = (key: string, label: string, type = 'text', ph = '', half = false) => (
    <div style={{ gridColumn: half ? 'span 1' : 'span 2' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'hsl(var(--muted-foreground))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      <input
        type={type}
        value={(form as any)[key]}
        placeholder={ph}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ width: '100%', padding: '10px 14px', background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))', border: `1px solid ${errors[key] ? '#ff0000' : 'hsl(var(--border))'}`, borderRadius: '8px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
        onFocus={e => (e.target.style.borderColor = '#ff0000')}
        onBlur={e => (e.target.style.borderColor = errors[key] ? '#ff0000' : 'hsl(var(--border))')}
      />
      {errors[key] && <div style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>{errors[key]}</div>}
    </div>
  );

  // ── Card style ────────────────────────────────────
  const cardStyle = { background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px' };

  return (
    <div style={{ paddingTop: '128px', maxWidth: '1100px', margin: '0 auto', padding: '72px 24px 64px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '32px', letterSpacing: '-0.02em' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px', alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Delivery form */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '20px' }}>📦 Delivery Information</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {inp('name',    'Full Name',       'text',  'John Doe')}
              {inp('email',   'Email Address',   'email', 'john@example.com')}
              {inp('phone',   'Phone Number',    'tel',   '+91 99999 99999')}
              {inp('address', 'Street Address',  'text',  'House / Flat / Building, Street')}
              {inp('landmark','Landmark (opt.)', 'text',  'Near Metro Station', true)}
              {inp('city',    'City',            'text',  'Mumbai',              true)}
              {inp('state',   'State',           'text',  'Maharashtra',         true)}
              {inp('pincode', 'PIN Code',        'text',  '400001',              true)}
            </div>
          </div>

          {/* Payment method selector */}
          <div style={cardStyle}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>💳 Payment Method</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Razorpay */}
              <label
                onClick={() => setPaymentMethod('razorpay')}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: paymentMethod === 'razorpay' ? 'rgba(255,0,0,0.06)' : 'hsl(var(--secondary))', border: `2px solid ${paymentMethod === 'razorpay' ? '#ff0000' : 'hsl(var(--border))'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'razorpay' ? '#ff0000' : 'hsl(var(--border))'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {paymentMethod === 'razorpay' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff0000' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={15} style={{ color: '#ff0000' }} />
                    Pay Online — UPI / Card / Net Banking
                  </div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '3px' }}>
                    Secured by Razorpay · All major cards, UPI, wallets accepted
                  </div>
                </div>
                {/* Razorpay logo pills */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  {['UPI', 'Card', 'EMI'].map(m => (
                    <span key={m} style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', background: 'rgba(255,0,0,0.1)', color: '#ff0000', borderRadius: '4px', letterSpacing: '0.04em' }}>{m}</span>
                  ))}
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                onClick={() => setPaymentMethod('cod')}
                style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px', background: paymentMethod === 'cod' ? 'rgba(34,197,94,0.06)' : 'hsl(var(--secondary))', border: `2px solid ${paymentMethod === 'cod' ? '#22c55e' : 'hsl(var(--border))'}`, borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${paymentMethod === 'cod' ? '#22c55e' : 'hsl(var(--border))'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {paymentMethod === 'cod' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Banknote size={15} style={{ color: '#22c55e' }} />
                    Cash on Delivery (COD)
                  </div>
                  <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', marginTop: '3px' }}>
                    Pay cash when your order arrives at your door
                    {COD_CHARGE > 0 && <span style={{ color: '#fbbf24' }}> · ₹{COD_CHARGE} handling fee</span>}
                    {COD_CHARGE === 0 && <span style={{ color: '#22c55e' }}> · No extra charge</span>}
                  </div>
                </div>
                <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 8px', background: 'rgba(34,197,94,0.12)', color: '#22c55e', borderRadius: '4px', letterSpacing: '0.04em', flexShrink: 0 }}>FREE</span>
              </label>
            </div>

            {/* COD notice */}
            {paymentMethod === 'cod' && (
              <div style={{ marginTop: '14px', padding: '12px 14px', background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <Info size={14} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '1px' }} />
                <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>
                  <strong style={{ color: 'hsl(var(--foreground))' }}>COD note:</strong> Please keep exact change ready. If you miss the delivery, re-delivery may take 1–2 extra days. COD orders cannot be cancelled after dispatch.
                </div>
              </div>
            )}
          </div>

          {/* Security note */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(255,0,0,0.04)', border: '1px solid rgba(255,0,0,0.12)', borderRadius: '10px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
            <Lock size={13} style={{ color: '#ff0000', flexShrink: 0 }} />
            All transactions are 256-bit SSL encrypted. We never store card or bank details.
          </div>
        </div>

        {/* ── RIGHT COLUMN — Order Summary ── */}
        <div style={{ position: 'sticky', top: '72px' }}>
          <div style={cardStyle}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Order Summary</h2>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {cart.map(item => (
                <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <img src={item.product.images[0]} alt={item.product.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: '8px', background: 'hsl(var(--secondary))' }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
                    <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff0000', color: 'white', borderRadius: '50%', width: '17px', height: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 700 }}>{item.quantity}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
                    <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Size: {item.size}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>₹{(item.product.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? '#22c55e' : 'inherit' }}>{shipping === 0 ? 'FREE ✓' : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <div style={{ fontSize: '11px', color: '#fbbf24' }}>Add ₹{(999 - cartTotal).toLocaleString()} more for free shipping</div>
              )}
              {discountApplied && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#22c55e' }}>
                  <span>Discount ({discountCode})</span><span>−₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              {codCharge > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#fbbf24' }}>
                  <span>COD Handling</span><span>+₹{codCharge}</span>
                </div>
              )}

              {/* Discount input */}
              <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid hsl(var(--border))' }}>
                {!discountApplied ? (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, marginBottom: '7px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Discount Code</div>
                    <div style={{ display: 'flex', gap: '7px' }}>
                      <input
                        value={discountCode}
                        onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); }}
                        onKeyDown={e => e.key === 'Enter' && applyDiscount()}
                        placeholder="YOUTUPIA10"
                        style={{ flex: 1, padding: '8px 11px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '7px', color: 'hsl(var(--foreground))', fontSize: '13px', outline: 'none', fontFamily: 'monospace' }}
                      />
                      <button
                        onClick={applyDiscount}
                        style={{ background: '#ff0000', color: 'white', border: 'none', borderRadius: '7px', padding: '8px 13px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, fontFamily: 'Roboto, sans-serif', flexShrink: 0 }}
                      >Apply</button>
                    </div>
                    {discountError && <div style={{ fontSize: '11px', color: '#f87171', marginTop: '5px' }}>{discountError}</div>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 11px', background: 'rgba(34,163,74,0.08)', border: '1px solid rgba(34,163,74,0.2)', borderRadius: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ {discountCode} ({discountPct}% off)</span>
                    <button onClick={() => { setDiscountApplied(false); setDiscountPct(0); setDiscountCode(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', fontSize: '11px', textDecoration: 'underline', fontFamily: 'Roboto, sans-serif' }}>Remove</button>
                  </div>
                )}
              </div>

              {/* Grand total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '18px', borderTop: '1px solid hsl(var(--border))', paddingTop: '12px', marginTop: '4px' }}>
                <span>Total</span>
                <span style={{ color: '#ff0000' }}>₹{total.toLocaleString()}</span>
              </div>
              {paymentMethod === 'cod' && (
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', textAlign: 'right' }}>Pay on delivery</div>
              )}
            </div>

            {/* CTA */}
            <div style={{ marginTop: '18px' }}>
              {paymentMethod === 'razorpay' ? (
                <button
                  onClick={handleRazorpay}
                  disabled={loading}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', background: loading ? 'rgba(255,0,0,0.5)' : '#ff0000', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Roboto, sans-serif', transition: 'background 0.2s' }}
                >
                  {loading ? (
                    <><span style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Processing...</>
                  ) : (
                    <><Shield size={16} /> Pay ₹{total.toLocaleString()} Securely</>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleCOD}
                  disabled={loading}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '15px', background: loading ? 'rgba(34,197,94,0.5)' : '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Roboto, sans-serif', transition: 'background 0.2s' }}
                >
                  {loading ? (
                    <><span style={{ width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Placing Order...</>
                  ) : (
                    <><Banknote size={16} /> Place Order — Pay on Delivery</>
                  )}
                </button>
              )}

              {/* Trust line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '10px', fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
                {paymentMethod === 'razorpay' ? <><Lock size={10} /> Secured by Razorpay</> : <><Truck size={10} /> Free delivery · Pay on arrival</>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default CheckoutPage;
