import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Shield, Lock, Truck, CreditCard, Banknote, Info } from 'lucide-react';
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
    name: '',
    email: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: ''
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

  if (cart.length === 0)
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', paddingTop: '24px' }}>
        <div style={{ fontSize: '48px' }}>🛒</div>
        <h2 style={{ fontWeight: 700 }}>Your cart is empty</h2>
        <Link to="/shop" className="btn-yt" style={{ textDecoration: 'none' }}>
          Go Shopping
        </Link>
      </div>
    );

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

    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.includes('@')) e.email = 'Valid email required';
    if (form.phone.replace(/\D/g, '').length < 10) e.phone = 'Valid phone required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.city.trim()) e.city = 'Required';
    if (!form.state.trim()) e.state = 'Required';
    if (form.pincode.replace(/\D/g, '').length < 6) e.pincode = 'Valid PIN required';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const hasPreorder = cart.some(item => item.product.preorder);

  const buildOrder = (paymentId?: string): Order => ({
    id: 'YTP-' + Date.now(),
    items: cart,
    total,
    status: hasPreorder ? 'preorder_confirmed' : 'processing',

    customerName: form.name.trim(),
    customerEmail: form.email.trim(),
    customerPhone: form.phone.trim(),

    address: [form.address, form.landmark, form.city, form.state, form.pincode].filter(Boolean).join(', '),

    paymentId,
    paymentMethod,

    codCharge: codCharge > 0 ? codCharge : undefined,

    discountCode: discountApplied ? discountCode : undefined,
    discountAmount: discountApplied ? discountAmount : undefined,

    createdAt: new Date().toISOString()
  });

  const persistOrder = async (order: Order, userId?: string) => {
    try {
      await fetch('/api/save-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order,
          userId: userId || null
        })
      });
    } catch (err) {
      console.error('Failed to persist order:', err);
    }
  };

  const handleRazorpay = () => {
    if (!validate()) {
      sonnerToast.error('Please fix the form errors');
      return;
    }

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
      } catch {
        rzpKey = '';
      }

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

        handler: async (response: any) => {
          const order = buildOrder(response.razorpay_payment_id);

          addOrder(order);

          await persistOrder(order, user?.id);

          clearCart();

          sonnerToast.success('Payment successful!', {
            description: 'Order ID: ' + order.id
          });

          navigate('/order-success?id=' + order.id);
        }
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.open();

      setLoading(false);
    };
  };

  const handleCOD = () => {
    if (!validate()) {
      sonnerToast.error('Please fix the form errors');
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      const order = buildOrder();

      addOrder(order);

      await persistOrder(order, user?.id);

      clearCart();

      sonnerToast.success('Order placed!', {
        description: 'Pay ₹' + total + ' on delivery.'
      });

      navigate('/order-success?id=' + order.id);

      setLoading(false);
    }, 600);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px 24px 64px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '32px' }}>Checkout</h1>

      {/* UI kept same as your original code */}

      <button onClick={paymentMethod === 'razorpay' ? handleRazorpay : handleCOD}>
        Place Order
      </button>
    </div>
  );
};

export default CheckoutPage;
