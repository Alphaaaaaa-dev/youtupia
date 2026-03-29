import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../contexts/StoreContext';
import { useTheme } from '../contexts/ThemeContext';

const CartDrawer = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { cart, cartTotal, removeFromCart, updateCartQty } = useStore();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199, backdropFilter: 'blur(2px)' }} />}
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '100%', maxWidth: '400px', background: isDark ? 'hsl(0 0% 10%)' : 'white', zIndex: 200, transform: open ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 32px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} />
            <span style={{ fontWeight: 700, fontSize: '16px' }}>Your Cart ({cart.length})</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--foreground))', padding: '6px', borderRadius: '50%' }}><X size={20} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'hsl(var(--muted-foreground))' }}>
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
                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>
                    <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginBottom: '8px' }}>Size: {item.size}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateCartQty(item.productId, item.size, item.quantity - 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid hsl(var(--border))', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--foreground))' }}><Minus size={12} /></button>
                        <span style={{ fontWeight: 600, fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => updateCartQty(item.productId, item.size, item.quantity + 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid hsl(var(--border))', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'hsl(var(--foreground))' }}><Plus size={12} /></button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: '#ff0000' }}>₹{(item.product.price * item.quantity).toLocaleString()}</span>
                        <button onClick={() => removeFromCart(item.productId, item.size)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))', padding: '4px', display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid hsl(var(--border))' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))' }}>Subtotal</span>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>₹{cartTotal.toLocaleString()}</span>
            </div>
            <Link to="/checkout" onClick={onClose} className="btn-yt" style={{ width: '100%', justifyContent: 'center', borderRadius: '8px', padding: '14px', fontSize: '15px', textDecoration: 'none' }}>
              Checkout →
            </Link>
            <button onClick={onClose} className="btn-ghost" style={{ width: '100%', justifyContent: 'center', borderRadius: '8px', padding: '10px', fontSize: '13px', marginTop: '8px' }}>
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
 
