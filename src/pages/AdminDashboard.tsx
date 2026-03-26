import { useState, useEffect } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Package, ShoppingBag, Clock, TrendingUp, Plus, Edit2, Trash2,
  X, Save, Image, BarChart2, Settings, ChevronDown, ChevronUp, CheckCircle
} from 'lucide-react';
import { Product, Series } from '../contexts/StoreContext';

// ── SHARED STYLES ─────────────────────────────────
const card = { background: 'hsl(0 0% 11%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' } as const;
const label = { fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em' } as const;
const inputStyle = { width: '100%', padding: '9px 12px', background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const };

type AdminTab = 'overview' | 'orders' | 'products' | 'series';

// ── SIDEBAR ────────────────────────────────────────
const Sidebar = ({ tab, setTab, onLogout }: { tab: AdminTab; setTab: (t: AdminTab) => void; onLogout: () => void }) => {
  const items: { id: AdminTab; icon: any; label: string }[] = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'products', icon: ShoppingBag, label: 'Products' },
    { id: 'series', icon: Settings, label: 'Series' },
  ];
  return (
    <aside style={{ width: '220px', flexShrink: 0, height: '100vh', background: 'hsl(0 0% 6%)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0 }}>
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '32px', height: '32px', background: '#ff0000', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="12" viewBox="0 0 16 14" fill="none"><path d="M6.5 10L10.5 7L6.5 4V10Z" fill="white"/></svg>
        </div>
        <div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '14px', color: '#f1f5f9' }}>Youtupia</div>
          <div style={{ ...label, marginTop: '1px' }}>ADMIN PANEL</div>
        </div>
      </div>
      <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
        {items.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '2px', textAlign: 'left', background: tab === item.id ? 'rgba(255,0,0,0.12)' : 'transparent', borderLeft: tab === item.id ? '2px solid #ff0000' : '2px solid transparent', transition: 'all 0.15s' }}>
            <item.icon size={15} style={{ color: tab === item.id ? '#ff6666' : '#64748b', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: tab === item.id ? 600 : 400, fontSize: '13px', color: tab === item.id ? '#f1f5f9' : '#94a3b8' }}>{item.label}</span>
          </button>
        ))}
      </nav>
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.08)', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: '13px' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </aside>
  );
};

// ── OVERVIEW TAB ───────────────────────────────────
const OverviewTab = () => {
  const { orders, products } = useStore();
  const totalSold = orders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.quantity, 0), 0);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const ordersLeft = orders.filter(o => o.status === 'processing' || o.status === 'confirmed' || o.status === 'shipped').length;
  const processing = orders.filter(o => o.status === 'processing').length;
  const delivered = orders.filter(o => o.status === 'delivered').length;

  const stats = [
    { label: 'TOTAL ITEMS SOLD', value: totalSold, color: '#ff6666', icon: TrendingUp },
    { label: 'ORDERS TO DELIVER', value: ordersLeft, color: '#fbbf24', icon: Clock },
    { label: 'PROCESSING', value: processing, color: '#60a5fa', icon: Package },
    { label: 'DELIVERED', value: delivered, color: '#4ade80', icon: CheckCircle },
  ];

  return (
    <div>
      <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Store Overview</h1>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Real-time snapshot of your merch store.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ ...card, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div style={{ ...label }}>{s.label}</div>
              <s.icon size={14} style={{ color: s.color, opacity: 0.7 }} />
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '32px', color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Revenue */}
      <div style={{ ...card, padding: '20px', marginBottom: '16px' }}>
        <div style={{ ...label, marginBottom: '6px' }}>TOTAL REVENUE</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '36px', color: '#f1f5f9' }}>₹{totalRevenue.toLocaleString()}</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>From {orders.length} total orders</div>
      </div>

      {/* Recent orders mini list */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#f1f5f9' }}>Recent Orders</span>
          <span style={{ ...label }}>{orders.length} TOTAL</span>
        </div>
        {orders.slice(0, 5).map((o, i) => (
          <div key={o.id} style={{ padding: '12px 20px', borderBottom: i < Math.min(4, orders.length - 1) ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: '13px', color: '#f1f5f9' }}>{o.customerName}</div>
              <div style={{ ...label, marginTop: '2px' }}>{o.id} · {o.items.length} item(s)</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#ff6666' }}>₹{o.total.toLocaleString()}</div>
              <span style={{ background: o.status === 'delivered' ? 'rgba(74,222,128,0.1)' : o.status === 'shipped' ? 'rgba(139,92,246,0.1)' : o.status === 'confirmed' ? 'rgba(96,165,250,0.1)' : 'rgba(251,191,36,0.1)', color: o.status === 'delivered' ? '#4ade80' : o.status === 'shipped' ? '#a78bfa' : o.status === 'confirmed' ? '#60a5fa' : '#fbbf24', borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.05em', textTransform: 'capitalize' }}>{o.status}</span>
            </div>
          </div>
        ))}
        {orders.length === 0 && <div style={{ padding: '32px', textAlign: 'center', color: '#475569', fontFamily: 'Roboto, sans-serif', fontSize: '13px' }}>No orders yet.</div>}
      </div>
    </div>
  );
};

// ── ORDERS TAB ─────────────────────────────────────
const OrdersTab = () => {
  const { orders, updateOrderStatus } = useStore();
  const [filter, setFilter] = useState('all');
  const STATUS_COLOR: Record<string, string> = { processing: '#fbbf24', confirmed: '#60a5fa', shipped: '#a78bfa', delivered: '#4ade80' };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 6px' }}>Orders</h1>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>View and update order statuses.</p>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
        {(['processing','confirmed','shipped','delivered'] as const).map(s => (
          <div key={s} style={{ ...card, padding: '14px' }}>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '24px', color: STATUS_COLOR[s] }}>{orders.filter(o => o.status === s).length}</div>
            <div style={{ ...label, marginTop: '4px', textTransform: 'capitalize' }}>{s}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all','processing','confirmed','shipped','delivered'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filter === f ? '#ff0000' : 'rgba(255,255,255,0.1)'}`, background: filter === f ? 'rgba(255,0,0,0.12)' : 'transparent', color: filter === f ? '#ff6666' : '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#475569', fontFamily: 'Roboto, sans-serif' }}>No orders found.</div>
        ) : filtered.map(o => (
          <div key={o.id} style={{ ...card, padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#f1f5f9' }}>{o.id}</div>
                <div style={{ ...label, marginTop: '2px' }}>{o.customerName} · {o.customerEmail} · {o.customerPhone}</div>
                <div style={{ ...label, marginTop: '2px' }}>📍 {o.address}</div>
                <div style={{ ...label, marginTop: '2px' }}>🕐 {new Date(o.createdAt).toLocaleString('en-IN')}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '18px', color: '#ff6666' }}>₹{o.total.toLocaleString()}</div>
                {o.paymentId && <div style={{ ...label, marginTop: '2px' }}>Pay: {o.paymentId.slice(0, 16)}...</div>}
              </div>
            </div>
            {/* Items */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              {o.items.map(item => (
                <div key={`${item.productId}-${item.size}`} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '5px 10px', fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#94a3b8' }}>
                  {item.product.name} · {item.size} × {item.quantity}
                </div>
              ))}
            </div>
            {/* Status buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['processing','confirmed','shipped','delivered'] as const).map(s => (
                <button key={s} onClick={() => updateOrderStatus(o.id, s)} disabled={o.status === s}
                  style={{ padding: '5px 12px', borderRadius: '6px', border: `1px solid ${o.status === s ? STATUS_COLOR[s] : 'rgba(255,255,255,0.08)'}`, background: o.status === s ? STATUS_COLOR[s] + '18' : 'transparent', color: o.status === s ? STATUS_COLOR[s] : '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '11px', cursor: o.status === s ? 'default' : 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── PRODUCT EDITOR MODAL ───────────────────────────
const ProductModal = ({ product, onSave, onClose }: { product: Partial<Product> | null; onSave: (p: Product) => void; onClose: () => void }) => {
  const { series } = useStore();
  const isNew = !product?.id;
  const [form, setForm] = useState<Partial<Product>>(product || { name: '', series: '', seriesId: '', price: 0, description: '', images: [''], variants: [{ size: 'S', stock: 10 }, { size: 'M', stock: 10 }, { size: 'L', stock: 10 }], tags: [], featured: false, createdAt: new Date().toISOString() });

  const setField = (k: keyof Product, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.price || !form.seriesId) { alert('Name, price and series are required'); return; }
    const selectedSeries = series.find(s => s.id === form.seriesId);
    onSave({ ...form, id: form.id || 'p' + Date.now(), series: selectedSeries?.name || form.series || '', createdAt: form.createdAt || new Date().toISOString() } as Product);
  };

  const backdrop = { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' };

  return (
    <div style={backdrop} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'hsl(0 0% 10%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '18px', color: '#f1f5f9', margin: 0 }}>{isNew ? 'Add Product' : 'Edit Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center' }}><X size={18} /></button>
        </div>

        {/* Name */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...label, marginBottom: '6px' }}>PRODUCT NAME *</div>
          <input style={inputStyle} value={form.name || ''} onChange={e => setField('name', e.target.value)} placeholder="OG Logo Tee" />
        </div>

        {/* Series */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...label, marginBottom: '6px' }}>SERIES *</div>
          <select value={form.seriesId || ''} onChange={e => { const s = series.find(ss => ss.id === e.target.value); setForm(f => ({ ...f, seriesId: e.target.value, series: s?.name || '' })); }}
            style={{ ...inputStyle }}>
            <option value="">Select series...</option>
            {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        {/* Price & Original Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>PRICE (₹) *</div>
            <input style={inputStyle} type="number" value={form.price || ''} onChange={e => setField('price', Number(e.target.value))} placeholder="799" />
          </div>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>ORIGINAL PRICE (₹)</div>
            <input style={inputStyle} type="number" value={form.originalPrice || ''} onChange={e => setField('originalPrice', e.target.value ? Number(e.target.value) : undefined)} placeholder="999 (for sale badge)" />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...label, marginBottom: '6px' }}>DESCRIPTION</div>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.description || ''} onChange={e => setField('description', e.target.value)} placeholder="Product description..." />
        </div>

        {/* Images */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...label, marginBottom: '6px' }}>IMAGE URLS</div>
          {(form.images || ['']).map((img, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
              <input style={{ ...inputStyle }} value={img} onChange={e => { const imgs = [...(form.images || [''])]; imgs[i] = e.target.value; setField('images', imgs); }} placeholder="https://..." />
              {i === (form.images || []).length - 1 ? (
                <button onClick={() => setField('images', [...(form.images || []), ''])} style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: '#ff6666', flexShrink: 0 }}>+</button>
              ) : (
                <button onClick={() => { const imgs = [...(form.images || [])]; imgs.splice(i, 1); setField('images', imgs); }} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: '#f87171', flexShrink: 0 }}><X size={12} /></button>
              )}
            </div>
          ))}
        </div>

        {/* Variants / Sizes */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...label, marginBottom: '6px' }}>SIZES & STOCK</div>
          {(form.variants || []).map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
              <input style={inputStyle} value={v.size} onChange={e => { const vars = [...(form.variants || [])]; vars[i] = { ...vars[i], size: e.target.value }; setField('variants', vars); }} placeholder="Size (S/M/L/XL)" />
              <input style={inputStyle} type="number" value={v.stock} onChange={e => { const vars = [...(form.variants || [])]; vars[i] = { ...vars[i], stock: Number(e.target.value) }; setField('variants', vars); }} placeholder="Stock" />
              <button onClick={() => { const vars = [...(form.variants || [])]; vars.splice(i, 1); setField('variants', vars); }} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: '#f87171' }}><X size={12} /></button>
            </div>
          ))}
          <button onClick={() => setField('variants', [...(form.variants || []), { size: '', stock: 10 }])} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}>+ Add size</button>
        </div>

        {/* Featured toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <button onClick={() => setField('featured', !form.featured)} style={{ width: '40px', height: '22px', borderRadius: '11px', background: form.featured ? '#ff0000' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: form.featured ? '20px' : '2px', transition: 'left 0.2s' }} />
          </button>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#94a3b8' }}>Featured product</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 2, padding: '11px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Save size={14} /> {isNew ? 'Add Product' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── PRODUCTS TAB ───────────────────────────────────
const ProductsTab = () => {
  const { products, setProducts } = useStore();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSave = (p: Product) => {
    const exists = products.find(x => x.id === p.id);
    if (exists) setProducts(products.map(x => x.id === p.id ? p : x));
    else setProducts([...products, p]);
    setShowModal(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this product?')) return;
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Products</h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>Add, edit, or remove products from your store.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {products.map(p => (
          <div key={p.id} style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.04)' }}>
              {p.images[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Image size={18} style={{ color: '#334155' }} /></div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: '14px', color: '#f1f5f9', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {p.name} {p.featured && <span style={{ background: 'rgba(255,0,0,0.12)', color: '#ff6666', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>FEATURED</span>}
              </div>
              <div style={{ ...label, marginBottom: '4px' }}>{p.series} · {p.variants.map(v => v.size).join(', ')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#ff6666' }}>₹{p.price.toLocaleString()}</span>
                {p.originalPrice && <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#475569', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
                <span style={{ ...label }}>· Stock: {p.variants.reduce((s, v) => s + v.stock, 0)} total</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => { setEditing(p); setShowModal(true); }} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => handleDelete(p.id)} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <ProductModal product={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />
      )}
    </div>
  );
};

// ── SERIES TAB ─────────────────────────────────────
const SeriesTab = () => {
  const { series, setSeries } = useStore();
  const [editing, setEditing] = useState<Partial<Series> | null>(null);

  const handleSave = () => {
    if (!editing?.name) { alert('Series name is required'); return; }
    const exists = series.find(s => s.id === editing.id);
    const updated: Series = { id: editing.id || 's' + Date.now(), name: editing.name || '', description: editing.description || '', logo: editing.logo || '', banner: editing.banner || '', color: editing.color || '#ff0000' };
    if (exists) setSeries(series.map(s => s.id === updated.id ? updated : s));
    else setSeries([...series, updated]);
    setEditing(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Series</h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>Manage your product series / collections.</p>
        </div>
        <button onClick={() => setEditing({ name: '', description: '', logo: '', banner: '', color: '#ff0000' })} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Add Series
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {series.map(s => (
          <div key={s.id} style={{ ...card, padding: '16px 20px' }}>
            {editing?.id === s.id ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ ...label, marginBottom: '5px' }}>NAME *</div>
                    <input style={inputStyle} value={editing.name || ''} onChange={e => setEditing(ed => ({ ...ed!, name: e.target.value }))} />
                  </div>
                  <div>
                    <div style={{ ...label, marginBottom: '5px' }}>COLOR</div>
                    <input type="color" value={editing.color || '#ff0000'} onChange={e => setEditing(ed => ({ ...ed!, color: e.target.value }))} style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent' }} />
                  </div>
                </div>
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ ...label, marginBottom: '5px' }}>DESCRIPTION</div>
                  <input style={inputStyle} value={editing.description || ''} onChange={e => setEditing(ed => ({ ...ed!, description: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ ...label, marginBottom: '5px' }}>LOGO URL</div>
                    <input style={inputStyle} value={editing.logo || ''} onChange={e => setEditing(ed => ({ ...ed!, logo: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div>
                    <div style={{ ...label, marginBottom: '5px' }}>BANNER URL</div>
                    <input style={inputStyle} value={editing.banner || ''} onChange={e => setEditing(ed => ({ ...ed!, banner: e.target.value }))} placeholder="https://..." />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={13} /> Save</button>
                  <button onClick={() => setEditing(null)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', flexShrink: 0, border: `2px solid ${s.color}40` }}>
                  {s.logo && <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#f1f5f9', marginBottom: '2px' }}>{s.name}</div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#64748b' }}>{s.description}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditing({ ...s })} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
                    <Edit2 size={12} /> Edit
                  </button>
                  <button onClick={() => { if(confirm('Delete series?')) setSeries(series.filter(ss => ss.id !== s.id)); }} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* New series inline form */}
        {editing && !editing.id && (
          <div style={{ ...card, padding: '20px' }}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#f1f5f9', margin: '0 0 16px' }}>New Series</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
              <div>
                <div style={{ ...label, marginBottom: '5px' }}>NAME *</div>
                <input style={inputStyle} value={editing.name || ''} onChange={e => setEditing(ed => ({ ...ed!, name: e.target.value }))} placeholder="Drop Name" />
              </div>
              <div>
                <div style={{ ...label, marginBottom: '5px' }}>COLOR</div>
                <input type="color" value={editing.color || '#ff0000'} onChange={e => setEditing(ed => ({ ...ed!, color: e.target.value }))} style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent' }} />
              </div>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <div style={{ ...label, marginBottom: '5px' }}>DESCRIPTION</div>
              <input style={inputStyle} value={editing.description || ''} onChange={e => setEditing(ed => ({ ...ed!, description: e.target.value }))} placeholder="Short series description" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
              <div>
                <div style={{ ...label, marginBottom: '5px' }}>LOGO URL</div>
                <input style={inputStyle} value={editing.logo || ''} onChange={e => setEditing(ed => ({ ...ed!, logo: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <div style={{ ...label, marginBottom: '5px' }}>BANNER URL</div>
                <input style={inputStyle} value={editing.banner || ''} onChange={e => setEditing(ed => ({ ...ed!, banner: e.target.value }))} placeholder="https://..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Plus size={13} /> Create Series</button>
              <button onClick={() => setEditing(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── MAIN ADMIN ─────────────────────────────────────
const AdminDashboard = () => {
  const { isAdmin, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>('overview');

  useEffect(() => { if (!isAdmin) navigate('/admin'); }, [isAdmin]);

  if (!isAdmin) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'hsl(0 0% 8%)', color: '#f1f5f9' }}>
      <Sidebar tab={tab} setTab={setTab} onLogout={() => { logout(); navigate('/admin'); }} />
      <main style={{ flex: 1, overflowY: 'auto', padding: '32px', minWidth: 0 }}>
        {tab === 'overview' && <OverviewTab />}
        {tab === 'orders' && <OrdersTab />}
        {tab === 'products' && <ProductsTab />}
        {tab === 'series' && <SeriesTab />}
      </main>
    </div>
  );
};

export default AdminDashboard;
