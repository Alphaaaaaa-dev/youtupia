import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Percent } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const CartDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { cart, cartTotal, removeFromCart, updateCartQty, recentlyViewed, products, validateDiscountCode } = useStore();
  const { theme } = useTheme();
  const { user } = useAuth() as any;
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const shipping = 0;

  const [discountCode, setDiscountCode] = useState('');
  const [discountPct, setDiscountPct] = useState(0);
  const [discountFixed, setDiscountFixed] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState('');

  const discountAmount = discountApplied
    ? (discountType === 'percentage' ? Math.round(cartTotal * discountPct / 100) : Math.min(discountFixed, cartTotal))
    : 0;

  const discountedSubtotal = cartTotal - discountAmount;
  const total = discountedSubtotal + shipping;

  const applyDiscount = () => {
    const result = validateDiscountCode(discountCode);
    if (result.valid) {
      setDiscountPct(result.pct);
      setDiscountFixed(result.amount);
      setDiscountType(result.type);
      setDiscountApplied(true);
      setDiscountError('');
    } else {
      setDiscountApplied(false);
      setDiscountError('Invalid code. Please try a valid code.');
    }
  };

  const discountLabel = discountApplied
    ? (discountType === 'percentage' ? `${discountPct}% off` : `₹${discountFixed} off`)
    : '';

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 199,
            backdropFilter: 'blur(2px)'
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          maxWidth: '100vw',
          background: isDark ? 'hsl(0 0% 9%)' : 'hsl(var(--background))',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.3)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid hsl(var(--border))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '16px' }}>
            Your Cart ({cart.length})
          </span>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '50%',
                gap: '16px'
              }}
            >
              <ShoppingBag size={48} style={{ opacity: 0.3 }} />
              <p>Your cart is empty</p>
              <button onClick={onClose} className="btn-yt">
                Start Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map(item => (
                <div
                  key={`${item.productId}-${item.size}`}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    background: 'hsl(var(--secondary))',
                    borderRadius: '12px'
                  }}
                >
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    style={{
                      width: '72px',
                      height: '72px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>
                      {item.product.name}
                    </div>

                    <div style={{ fontSize: '12px' }}>
                      Size: {item.size}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button onClick={() => updateCartQty(item.productId,item.size,item.quantity-1)}>
                          <Minus size={12} />
                        </button>

                        <span>{item.quantity}</span>

                        <button onClick={() => updateCartQty(item.productId,item.size,item.quantity+1)}>
                          <Plus size={12} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ color: '#ff0000', fontWeight: 700 }}>
                          ₹{(item.product.price * item.quantity).toLocaleString()}
                        </span>

                        <button onClick={() => removeFromCart(item.productId,item.size)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid hsl(var(--border))' }}>

            <div
              style={{
                marginBottom: '12px',
                padding: '8px 12px',
                background: 'rgba(22,163,74,0.08)',
                borderRadius: '8px',
                border: '1px solid rgba(22,163,74,0.2)',
                fontSize: '12px',
                color: '#16a34a',
                fontWeight: 600
              }}
            >
              🚚 Free delivery on all orders
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>₹{cartTotal.toLocaleString()}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span style={{ color: '#16a34a' }}>FREE</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '10px',
                fontWeight: 800,
                fontSize: '16px'
              }}
            >
              <span>Total</span>
              <span style={{ color: '#ff0000' }}>
                ₹{total.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                const dest = '/checkout';
                if (!user) navigate(`/login?redirect=${encodeURIComponent(dest)}`);
                else navigate(dest);
              }}
              className="btn-yt"
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '14px'
              }}
            >
              {user ? 'Proceed to Checkout' : 'Sign in to Checkout'}
            </button>

            <button
              onClick={onClose}
              style={{
                width: '100%',
                marginTop: '8px',
                background: 'none',
                border: 'none'
              }}
            >
              Continue Shopping
            </button>

          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
