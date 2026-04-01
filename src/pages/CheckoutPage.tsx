import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, Lock, ChevronRight } from 'lucide-react';
import { Order } from '../contexts/StoreContext';

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart, addOrder, validateDiscountCode } = useStore();
  const [discountCode, setDiscountCode] = useState("");
  const [discountPct, setDiscountPct] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [searchParams] = useSearchParams();
  const discountCodeFromUrl = (searchParams.get('discountCode') || '').trim();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', city: '', pincode: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Apply discount automatically if user came from Cart with a code.
  useEffect(() => {
    if (!discountCodeFromUrl) return;
    const upper = discountCodeFromUrl.toUpperCase();
    const pct = validateDiscountCode(upper);
    setDiscountCode(upper);
    if (pct > 0) {
      setDiscountPct(pct);
      setDiscountApplied(true);
      setDiscountError('');
    } else {
      setDiscountApplied(false);
      setDiscountPct(0);
      setDiscountError('Invalid code from cart. You can re-apply a valid one.');
    }
  }, [discountCodeFromUrl, validateDiscountCode]);

  if (cart.length === 0) return (
    <div style={{ paddingTop: '80px', textAlign: 'center', padding: '120px 24px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛒</div>
      <h2 style={{ marginBottom: '16px' }}>Your cart is empty</h2>
      <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none' }}>Go Shopping</Link>
    </div>
  );

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.email.includes('@')) errs.email = 'Valid email required';
    if (form.phone.length < 10) errs.phone = 'Valid phone required';
    if (!form.address.trim()) errs.address = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (form.pincode.length < 6) errs.pincode = 'Valid pincode required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRazorpay = async () => {
    if (!validate()) return;
    setLoading(true);

    const shippingNow = cartTotal >= 999 ? 0 : 60;
    const discountAmountNow = Math.round(cartTotal * discountPct / 100);
    const totalNow = cartTotal - discountAmountNow + shippingNow;

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    script.onload = () => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: totalNow * 100, // paise
        currency: 'INR',
        name: 'Youtupia',
        description: `Order - ${cart.length} item(s)`,
        image: 'https://via.placeholder.com/150x50?text=Youtupia',
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: '#ff0000' },
        handler: (response: any) => {
          const order: Order = {
            id: 'ORD' + Date.now(),
            items: cart,
            total: totalNow,
            status: 'confirmed',
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: form.phone,
            address: `${form.address}, ${form.city} - ${form.pincode}`,
            paymentId: response.razorpay_payment_id,
            discountCode: discountApplied ? discountCode : undefined,
            discountAmount: discountApplied ? discountAmountNow : undefined,
            createdAt: new Date().toISOString(),
          };
          addOrder(order);
          clearCart();
          navigate('/order-success?id=' + order.id);
        },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setLoading(false);
    };

    script.onerror = () => {
      alert('Failed to load payment gateway. Please try again.');
      setLoading(false);
    };
  };

  const field = (key: string, label: string, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: '16px' }}>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>{label}</label>
      <input type={type} value={(form as any)[key]} placeholder={placeholder}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{ width: '100%', padding: '10px 14px', background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))', border: `1px solid ${errors[key] ? '#ff0000' : 'hsl(var(--border))'}`, borderRadius: '8px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }} />
      {errors[key] && <div style={{ fontSize: '11px', color: '#ff0000', marginTop: '4px' }}>{errors[key]}</div>}
    </div>
  );

  const shipping = cartTotal >= 999 ? 0 : 60;
  const discountAmount = Math.round(cartTotal * discountPct / 100);
  const total = cartTotal - discountAmount + shipping;

  const applyDiscount = () => {
    const pct = validateDiscountCode(discountCode);
    if (pct > 0) { setDiscountPct(pct); setDiscountApplied(true); setDiscountError(""); }
    else { setDiscountError("Invalid code. Try YOUTUPIA10, DROP001 or FIRSTORDER"); }
  };

  return (
    <div style={{ paddingTop: '56px', maxWidth: '1100px', margin: '0 auto', padding: '72px 24px 48px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '32px' }}>Checkout</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>
        {/* Form */}
        <div>
          <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Delivery Information</h2>
            {field('name', 'Full Name', 'text', 'John Doe')}
            {field('email', 'Email Address', 'email', 'john@example.com')}
            {field('phone', 'Phone Number', 'tel', '+91 99999 99999')}
            {field('address', 'Street Address', 'text', 'House no., Street, Area')}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                {field('city', 'City')}
              </div>
              <div>
                {field('pincode', 'PIN Code')}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.15)', borderRadius: '8px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
            <Lock size={14} style={{ color: '#ff0000', flexShrink: 0 }} />
            Your payment is secured by Razorpay. We never store your card details.
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px', position: 'sticky', top: '72px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {cart.map(item => (
                <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <img src={item.product.images[0]} alt={item.product.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', background: 'hsl(var(--secondary))' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
                    <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Size: {item.size} · Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>₹{(item.product.price * item.quantity).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid hsl(var(--border))', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                <span>Shipping</span><span style={{ color: shipping === 0 ? '#22c55e' : 'inherit' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>Add ₹{999 - cartTotal} more for free shipping</div>}

              {/* Discount code */}
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid hsl(var(--border))' }}>
                {!discountApplied ? (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Discount Code</div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input value={discountCode} onChange={e => setDiscountCode(e.target.value.toUpperCase())} placeholder="Enter code" style={{ flex: 1, padding: '8px 12px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontSize: '13px', outline: 'none', fontFamily: 'Roboto, sans-serif' }} />
                      <button onClick={applyDiscount} style={{ background: '#ff0000', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'Roboto, sans-serif' }}>Apply</button>
                    </div>
                    {discountError && <div style={{ fontSize: '11px', color: '#f87171', marginTop: '6px' }}>{discountError}</div>}
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>✓ {discountCode} ({discountPct}% off)</span>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>−₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', borderTop: '1px solid hsl(var(--border))', paddingTop: '12px', marginTop: '4px' }}>
                <span>Total</span><span style={{ color: '#ff0000' }}>₹{total.toLocaleString()}</span>
              </div>
            </div>

            <button onClick={handleRazorpay} disabled={loading} className="btn-yt" style={{ width: '100%', justifyContent: 'center', borderRadius: '8px', padding: '14px', fontSize: '15px', fontWeight: 600, marginTop: '16px', opacity: loading ? 0.7 : 1, gap: '8px' }}>
              {loading ? 'Loading...' : <><Shield size={16} /> Pay ₹{total.toLocaleString()} Securely</>}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px', fontSize: '11px', color: 'hsl(var(--muted-foreground))' }}>
              <Lock size={11} /> Powered by Razorpay
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
 
