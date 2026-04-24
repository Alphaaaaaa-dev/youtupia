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
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199, backdropFilter: 'blur(2px)', transition: 'opacity 0.3s' }} />
      )}

      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: '420px', maxWidth: '100vw',
        background: isDark ? 'hsl(0 0% 9%)' : 'hsl(var(--background))',
        boxShadow: '-20px 0 60px rgba(0,0,0,0.3)',
        zIndex: 200, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
      }}>
        {/* Header */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Your Cart ({cart.length})</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--foreground))', padding: '6px', borderRadius: '50%' }}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50%', gap: '16px', color: 'hsl(var(--muted-foreground))' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3 }} />
              <p style={{ fontSize: '14px' }}>Your cart is empty</p>
              <button onClick={onClose} className="btn-yt" style={{ fontSize: '13px', padding: '8px 20px' }}>Start Shopping</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {cart.map(item => (
                <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'hsl(var(--secondary))', borderRadius: '12px' }}>
                  <img src={item.product.images[0]} alt={item.product.name} style={{ width: '72px', height: '72px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, background: 'hsl(var(--muted))' }} onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=72&h=72&fit=crop'; }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</div>
                    <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}>Size: {item.size}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateCartQty(item.productId, item.size, item.quantity - 1)}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--foreground))' }}>
                          <Minus size={11} />
                        </button>
                        <span style={{ fontWeight: 600, fontSize: '13px', minWidth: '16px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.productId, item.size, item.quantity + 1)}
                          style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid hsl(var(--border))', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--foreground))' }}>
                          <Plus size={11} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#ff0000' }}>₹{(item.product.price * item.quantity).toLocaleString()}</span>
                        <button onClick={() => removeFromCart(item.productId, item.size)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', padding: '2px', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                          onMouseEnter={e => (e.currentTarget.style.color = '#ff0000')}
                          onMouseLeave={e => (e.currentTarget.style.color = 'hsl(var(--muted-foreground))')}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && cart.length === 0 && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>Recently Viewed</div>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {recentlyViewed.slice(0, 5).map(pid => {
                  const p = products.find(pr => pr.id === pid);
                  if (!p) return null;
                  return (
                    <Link key={pid} to={`/product/${pid}`} onClick={onClose} style={{ textDecoration: 'none', flexShrink: 0 }}>
                      <div style={{ width: '76px', height: '96px', borderRadius: '10px', overflow: 'hidden', background: 'hsl(var(--secondary))', marginBottom: '6px' }}>
                        <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontSize: '10px', fontWeight: 600, color: 'hsl(var(--foreground))', lineHeight: 1.3, maxWidth: '76px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#ff0000', fontWeight: 700 }}>₹{p.price.toLocaleString()}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid hsl(var(--border))' }}>
            <div style={{ marginBottom: '14px', padding: '8px 12px', background: 'rgba(22,163,74,0.08)', borderRadius: '8px', border: '1px solid rgba(22,163,74,0.2)', fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✅ Free delivery on all orders!
              </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
              <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
            </div>

            {/* Discount code */}
            <div style={{ marginBottom: '12px' }}>
              {!discountApplied ? (
                <div style={{ padding: '10px 12px', borderRadius: 12, border: '1px solid hsl(var(--border))', background: 'hsl(var(--secondary))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Percent size={14} style={{ color: '#ff0000' }} />
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#ff0000' }}>Discount Code</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      value={discountCode}
                      onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); }}
                      onKeyDown={e => e.key === 'Enter' && applyDiscount()}
                      placeholder="Enter code"
                      style={{ flex: 1, padding: '10px 12px', background: 'transparent', border: `1px solid ${discountError ? '#f87171' : 'hsl(var(--border))'}`, borderRadius: 10, color: 'hsl(var(--foreground))', fontSize: 13, outline: 'none', fontFamily: 'Roboto, sans-serif' }}
                    />
                    <button onClick={applyDiscount} style={{ background: '#ff0000', color: 'white', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 800 }}>Apply</button>
                  </div>
                  {discountError && (
                    <div style={{ fontSize: '11px', color: '#f87171', marginTop: '6px', fontFamily: 'Roboto, sans-serif' }}>
                      {discountError}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: '12px', borderRadius: 12, border: '1px solid rgba(22,163,74,0.2)', background: 'rgba(22,163,74,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <div style={{ color: '#16a34a', fontWeight: 900, fontSize: 13 }}>✓ {discountCode} ({discountLabel})</div>
                  <div style={{ color: '#16a34a', fontWeight: 900, fontSize: 13 }}>−₹{discountAmount.toLocaleString()}</div>
                  <button onClick={() => { setDiscountCode(''); setDiscountPct(0); setDiscountFixed(0); setDiscountApplied(false); setDiscountError(''); }}
                    style={{ background: 'transparent', border: '1px solid rgba(22,163,74,0.25)', color: '#16a34a', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', fontWeight: 900, fontSize: 12 }}>
                    Remove
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
              <span>Shipping</span><span style={{ color: shipping === 0 ? '#16a34a' : 'inherit' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '16px', fontWeight: 800 }}>
              <span>Total</span><span style={{ color: '#ff0000' }}>₹{total.toLocaleString()}</span>
            </div>

            <button
              onClick={() => {
                onClose();
                const dest = discountApplied && discountCode
                  ? `/checkout?discountCode=${encodeURIComponent(discountCode)}`
                  : '/checkout';
                if (!user) navigate(`/login?redirect=${encodeURIComponent(dest)}`);
                else navigate(dest);
              }}
              className="btn-yt ripple"
              style={{ display: 'flex', width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 20px rgba(255,0,0,0.3)' }}
            >
              {user ? 'Proceed to Checkout' : '🔒 Sign in to Checkout'}
            </button>
            <button onClick={onClose} style={{ width: '100%', marginTop: '8px', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'hsl(var(--muted-foreground))', fontFamily: 'Roboto, sans-serif' }}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
