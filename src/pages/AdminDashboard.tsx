import { toast as sonnerToast } from '@/components/ui/sonner';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useStore } from '../contexts/StoreContext';
import { useNavigate } from 'react-router-dom';
import {
  LogOut, Package, ShoppingBag, Clock, TrendingUp, Plus, Edit2, Trash2,
  X, Save, Image as ImageIcon, BarChart2, Settings, CheckCircle, Users,
  Upload, Link as LinkIcon, Youtube, Zap, Tag, ToggleLeft, ToggleRight, Palette, MessageSquare, AlertCircle, RefreshCw
} from 'lucide-react';
import { Product, Series, Creator, HomePromo, DiscountCoupon, TopBanner } from '../contexts/StoreContext';

// ── SHARED STYLES ─────────────────────────────────
const card = { background: 'hsl(0 0% 11%)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px' } as const;
const label = { fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em' } as const;
const inputStyle = { width: '100%', padding: '9px 12px', background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const };

type AdminTab = 'overview' | 'orders' | 'products' | 'series' | 'creators' | 'drops' | 'homepage' | 'coupons' | 'tickets';

// ── IMAGE UPLOAD DROPZONE ──────────────────────────
const ImageDropzone = ({ value, onChange, label: lbl }: { value: string; onChange: (url: string) => void; label: string }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [tab, setTab] = useState<'url' | 'upload'>('url');
  const [preview, setPreview] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
      onChange(url);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ ...label, marginBottom: '8px' }}>{lbl}</div>
      {/* Tab toggle */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {(['url', 'upload'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'Roboto, sans-serif', background: tab === t ? '#ff0000' : 'rgba(255,255,255,0.06)', color: tab === t ? 'white' : '#64748b', transition: 'all 0.15s' }}>
            {t === 'url' ? <><LinkIcon size={9} style={{ display: 'inline', marginRight: '4px' }} />URL</> : <><Upload size={9} style={{ display: 'inline', marginRight: '4px' }} />Upload</>}
          </button>
        ))}
      </div>

      {tab === 'url' ? (
        <input style={inputStyle} value={value} onChange={e => { onChange(e.target.value); setPreview(e.target.value); }} placeholder="https://images.unsplash.com/..." />
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? '#ff0000' : 'rgba(255,255,255,0.12)'}`, borderRadius: '10px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: isDragging ? 'rgba(255,0,0,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
          <Upload size={20} style={{ color: isDragging ? '#ff0000' : '#475569', marginBottom: '8px' }} />
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Drag & drop image here</div>
          <div style={{ fontSize: '11px', color: '#334155' }}>or click to select from device</div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {preview && (
        <div style={{ marginTop: '8px', position: 'relative', display: 'inline-block' }}>
          <img src={preview} alt="Preview" style={{ height: '72px', width: '72px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          <button onClick={() => { setPreview(''); onChange(''); }} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ff0000', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} /></button>
        </div>
      )}
    </div>
  );
};

// ── VIDEO UPLOAD DROPZONE ──────────────────────────
const VideoDropzone = ({ value, onChange, label: lbl }: { value: string; onChange: (url: string) => void; label: string }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [tab, setTab] = useState<'url' | 'upload'>('url');
  const [preview, setPreview] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('video/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setPreview(url);
      onChange(url);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ ...label, marginBottom: '8px' }}>{lbl}</div>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
        {(['url', 'upload'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'Roboto, sans-serif', background: tab === t ? '#ff0000' : 'rgba(255,255,255,0.06)', color: tab === t ? 'white' : '#64748b', transition: 'all 0.15s' }}>
            {t === 'url' ? <><LinkIcon size={9} style={{ display: 'inline', marginRight: '4px' }} />URL</> : <><Upload size={9} style={{ display: 'inline', marginRight: '4px' }} />Upload</>}
          </button>
        ))}
      </div>

      {tab === 'url' ? (
        <input
          style={inputStyle}
          value={value}
          onChange={e => { onChange(e.target.value); setPreview(e.target.value); }}
          placeholder="https://...mp4"
        />
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${isDragging ? '#ff0000' : 'rgba(255,255,255,0.12)'}`, borderRadius: '10px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: isDragging ? 'rgba(255,0,0,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
          <Upload size={20} style={{ color: isDragging ? '#ff0000' : '#475569', marginBottom: '8px' }} />
          <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Drag & drop video here</div>
          <div style={{ fontSize: '11px', color: '#334155' }}>or click to select from device</div>
          <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>
      )}

      {preview && (
        <div style={{ marginTop: '10px', position: 'relative' }}>
          <video src={preview} controls muted playsInline style={{ width: '100%', maxHeight: '220px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'black' }} />
          <button onClick={() => { setPreview(''); onChange(''); }} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff0000', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={11} /></button>
        </div>
      )}
    </div>
  );
};

// ── MULTI IMAGE DROPZONE ───────────────────────────
const MultiImageDropzone = ({ images, onChange }: { images: string[]; onChange: (imgs: string[]) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        onChange([...images.filter(Boolean), url]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ ...label, marginBottom: '8px' }}>PRODUCT IMAGES</div>

      {/* Drag drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
        style={{ border: `2px dashed ${isDragging ? '#ff0000' : 'rgba(255,255,255,0.12)'}`, borderRadius: '10px', padding: '20px', textAlign: 'center', cursor: 'pointer', background: isDragging ? 'rgba(255,0,0,0.05)' : 'rgba(255,255,255,0.02)', transition: 'all 0.2s', marginBottom: '10px' }}>
        <Upload size={18} style={{ color: isDragging ? '#ff0000' : '#475569', marginBottom: '6px' }} />
        <div style={{ fontSize: '12px', color: '#64748b' }}>Drag & drop images or <span style={{ color: '#ff6666' }}>click to upload</span></div>
        <div style={{ fontSize: '10px', color: '#334155', marginTop: '3px' }}>Multiple files supported</div>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) handleFiles(e.target.files); }} />
      </div>

      {/* URL inputs */}
      {images.map((img, i) => (
        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
          {img && <img src={img} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />}
          <input style={{ ...inputStyle }} value={img} onChange={e => { const imgs = [...images]; imgs[i] = e.target.value; onChange(imgs); }} placeholder="https://... or drag image above" />
          <button onClick={() => { const imgs = [...images]; imgs.splice(i, 1); onChange(imgs.length ? imgs : ['']); }} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: '#f87171', flexShrink: 0 }}><X size={12} /></button>
        </div>
      ))}
      <button onClick={() => onChange([...images, ''])} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer' }}>+ Add image URL</button>
    </div>
  );
};

// ── SIDEBAR ────────────────────────────────────────
const Sidebar = ({ tab, setTab, onLogout }: { tab: AdminTab; setTab: (t: AdminTab) => void; onLogout: () => void }) => {
  const items: { id: AdminTab; icon: any; label: string }[] = [
    { id: 'overview', icon: BarChart2, label: 'Overview' },
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'products', icon: ShoppingBag, label: 'Products' },
    { id: 'series', icon: Settings, label: 'Series' },
    { id: 'creators', icon: Users, label: 'Creators' },
    { id: 'drops', icon: Zap, label: 'Drop Control' },
    { id: 'homepage', icon: Youtube, label: 'Home Content' },
    { id: 'coupons', icon: Tag, label: 'Coupons' },
    { id: 'tickets', icon: MessageSquare, label: 'Support Tickets' },
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
  const ordersLeft = orders.filter(o => ['processing','confirmed','shipped'].includes(o.status)).length;
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
      <div style={{ ...card, padding: '20px', marginBottom: '16px' }}>
        <div style={{ ...label, marginBottom: '6px' }}>TOTAL REVENUE</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '36px', color: '#f1f5f9' }}>₹{totalRevenue.toLocaleString()}</div>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>From {orders.length} total orders</div>
      </div>
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
              <span style={{ background: o.status === 'delivered' ? 'rgba(74,222,128,0.1)' : o.status === 'shipped' ? 'rgba(139,92,246,0.1)' : 'rgba(251,191,36,0.1)', color: o.status === 'delivered' ? '#4ade80' : o.status === 'shipped' ? '#a78bfa' : '#fbbf24', borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'capitalize' }}>{o.status}</span>
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
  const { orders, updateOrderStatus, updateOrder } = useStore();
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});
  const [savedTracking, setSavedTracking] = useState<string | null>(null);

  const STATUS_COLOR: Record<string, string> = { processing: '#fbbf24', confirmed: '#60a5fa', shipped: '#a78bfa', delivered: '#4ade80' };
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const codCount = orders.filter(o => (o as any).paymentMethod === 'cod').length;
  const onlineCount = orders.filter(o => (o as any).paymentMethod !== 'cod').length;

  const saveTracking = (orderId: string) => {
    const trackingId = (trackingInputs[orderId] || '').trim();
    const notes = (notesInputs[orderId] || '').trim();
    if (!trackingId && !notes) return;
    const updates: any = {};
    if (trackingId) {
      updates.trackingId = trackingId;
      updates.trackingUrl = `https://www.delhivery.com/track/package/${trackingId}`;
      updates.status = 'shipped'; // auto-mark shipped when tracking added
    }
    if (notes) updates.notes = notes;
    updateOrder(orderId, updates);
    sonnerToast.success('Tracking saved!', { description: `Order ${orderId} updated.` });
    setSavedTracking(orderId);
    setTimeout(() => setSavedTracking(null), 2500);
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Orders</h1>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Manage orders, update status, add Delhivery tracking numbers.</p>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'TOTAL ORDERS', value: orders.length, color: '#f1f5f9' },
          { label: 'REVENUE', value: '₹' + totalRevenue.toLocaleString(), color: '#ff6666' },
          { label: 'PROCESSING', value: orders.filter(o => o.status === 'processing').length, color: STATUS_COLOR.processing },
          { label: 'SHIPPED', value: orders.filter(o => o.status === 'shipped').length, color: STATUS_COLOR.shipped },
          { label: 'COD ORDERS', value: codCount, color: '#4ade80' },
          { label: 'ONLINE PAID', value: onlineCount, color: '#60a5fa' },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '12px 14px' }}>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '20px', color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ ...label, marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all','processing','confirmed','shipped','delivered'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: `1px solid ${filter === f ? '#ff0000' : 'rgba(255,255,255,0.1)'}`, background: filter === f ? 'rgba(255,0,0,0.12)' : 'transparent', color: filter === f ? '#ff6666' : '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize' }}>
            {f === 'all' ? `All (${orders.length})` : `${f.charAt(0).toUpperCase()+f.slice(1)} (${orders.filter(o=>o.status===f).length})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#475569', fontFamily: 'Roboto, sans-serif' }}>No orders found.</div>
        ) : filtered.map(o => {
          const isCOD = (o as any).paymentMethod === 'cod';
          const isOpen = expanded === o.id;
          return (
            <div key={o.id} style={{ ...card, overflow: 'hidden' }}>
              {/* Header row — clickable */}
              <div style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}
                onClick={() => setExpanded(isOpen ? null : o.id)}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#f1f5f9' }}>{o.id}</span>
                    <span style={{ background: STATUS_COLOR[o.status] + '18', color: STATUS_COLOR[o.status], border: `1px solid ${STATUS_COLOR[o.status]}30`, borderRadius: '20px', padding: '2px 9px', fontSize: '10px', fontWeight: 700, textTransform: 'capitalize' }}>{o.status}</span>
                    <span style={{ background: isCOD ? 'rgba(74,222,128,0.1)' : 'rgba(96,165,250,0.1)', color: isCOD ? '#4ade80' : '#60a5fa', borderRadius: '20px', padding: '2px 8px', fontSize: '9px', fontWeight: 700 }}>{isCOD ? '💵 COD' : '💳 PAID'}</span>
                    {(o as any).trackingId && <span style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', borderRadius: '20px', padding: '2px 8px', fontSize: '9px', fontWeight: 700 }}>🚚 TRACKING ADDED</span>}
                  </div>
                  <div style={{ ...label }}>{o.customerName} · {o.customerEmail} · {o.customerPhone}</div>
                  <div style={{ ...label, marginTop: '2px' }}>📍 {o.address}</div>
                  {(o as any).discountCode && <div style={{ ...label, color: '#4ade80', marginTop: '2px' }}>🏷 {(o as any).discountCode}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '18px', color: '#ff6666' }}>₹{o.total.toLocaleString()}</div>
                  <div style={{ ...label, marginTop: '2px' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                  <div style={{ ...label, marginTop: '4px', color: isOpen ? '#ff6666' : '#475569' }}>{isOpen ? '▲ collapse' : '▼ expand'}</div>
                </div>
              </div>

              {/* Expanded section */}
              {isOpen && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 18px' }}>
                  {/* Items */}
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {o.items.map(item => (
                      <div key={`${item.productId}-${item.size}`} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '6px 10px' }}>
                        <img src={item.product.images[0]} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} onError={e => { (e.target as any).style.display = 'none'; }} />
                        <div>
                          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#f1f5f9', fontWeight: 600 }}>{item.product.name}</div>
                          <div style={{ ...label }}>{item.size} × {item.quantity} · ₹{(item.product.price * item.quantity).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status buttons */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ ...label, marginBottom: '8px' }}>UPDATE STATUS</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(['processing','confirmed','shipped','delivered'] as const).map(s => (
                        <button key={s} onClick={() => { updateOrderStatus(o.id, s); sonnerToast.success('Status updated', { description: o.id + ' → ' + s }); }} disabled={o.status === s}
                          style={{ padding: '6px 14px', borderRadius: '6px', border: `1px solid ${o.status === s ? STATUS_COLOR[s] : 'rgba(255,255,255,0.1)'}`, background: o.status === s ? STATUS_COLOR[s] + '18' : 'rgba(255,255,255,0.03)', color: o.status === s ? STATUS_COLOR[s] : '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: o.status === s ? 'default' : 'pointer', textTransform: 'capitalize', transition: 'all 0.15s', fontWeight: o.status === s ? 700 : 400 }}>
                          {o.status === s ? '● ' : ''}{s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delhivery tracking input */}
                  <div style={{ ...card, padding: '14px', marginBottom: '10px', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <div style={{ ...label, marginBottom: '8px', color: '#a78bfa' }}>DELHIVERY TRACKING NUMBER (AWB)</div>
                    {(o as any).trackingId ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#a78bfa', fontWeight: 700 }}>{(o as any).trackingId}</div>
                          <a href={(o as any).trackingUrl || `https://www.delhivery.com/track/package/${(o as any).trackingId}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#60a5fa', textDecoration: 'none' }}>
                            🔗 Open on Delhivery →
                          </a>
                        </div>
                        <button onClick={() => { updateOrder(o.id, { trackingId: '', trackingUrl: '' }); }} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: '11px', cursor: 'pointer' }}>
                          Clear
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <input
                            value={trackingInputs[o.id] || ''}
                            onChange={e => setTrackingInputs(prev => ({ ...prev, [o.id]: e.target.value }))}
                            placeholder="Enter AWB / tracking number from Delhivery"
                            style={{ ...inputStyle, flex: 1 }}
                          />
                        </div>
                        <div style={{ ...label, marginBottom: '6px', marginTop: '4px' }}>INTERNAL NOTES (optional)</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            value={notesInputs[o.id] || ''}
                            onChange={e => setNotesInputs(prev => ({ ...prev, [o.id]: e.target.value }))}
                            placeholder="e.g. Dispatched from Delhi warehouse"
                            style={{ ...inputStyle, flex: 1 }}
                          />
                          <button onClick={() => saveTracking(o.id)}
                            style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: savedTracking === o.id ? '#16a34a' : '#8b5cf6', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.25s', flexShrink: 0 }}>
                            <Save size={12} /> {savedTracking === o.id ? 'Saved!' : 'Save & Mark Shipped'}
                          </button>
                        </div>
                        <div style={{ ...label, marginTop: '6px', color: '#475569' }}>
                          💡 Saving a tracking number automatically marks the order as "Shipped"
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── PRODUCT MODAL ──────────────────────────────────
const ProductModal = ({ product, onSave, onClose }: { product: Partial<Product> | null; onSave: (p: Product) => void; onClose: () => void }) => {
  const { series, creators, drops } = useStore();
  const isNew = !product?.id;
  const [form, setForm] = useState<Partial<Product>>(product || {
    name: '', series: '', seriesId: '', price: 0, description: '',
    images: [''], variants: [{ size: 'S', stock: 10 }, { size: 'M', stock: 10 }, { size: 'L', stock: 10 }],
    tags: [], featured: false, limitedEdition: false, preorder: false, createdAt: new Date().toISOString(),
  });

  const setField = (k: keyof Product, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name || !form.price || !form.seriesId) { alert('Name, price and series are required'); return; }
    const selectedSeries = series.find(s => s.id === form.seriesId);
    onSave({ ...form, id: form.id || 'p' + Date.now(), series: selectedSeries?.name || form.series || '', createdAt: form.createdAt || new Date().toISOString() } as Product);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: 'hsl(0 0% 10%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '620px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '18px', color: '#f1f5f9', margin: 0 }}>{isNew ? 'Add Product' : 'Edit Product'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...label, marginBottom: '6px' }}>PRODUCT NAME *</div>
          <input style={inputStyle} value={form.name || ''} onChange={e => setField('name', e.target.value)} placeholder="OG Logo Tee" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>SERIES *</div>
            <select value={form.seriesId || ''} onChange={e => { const s = series.find(ss => ss.id === e.target.value); setForm(f => ({ ...f, seriesId: e.target.value, series: s?.name || '' })); }} style={inputStyle}>
              <option value="">Select series...</option>
              {series.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>DROP</div>
            <select value={form.dropId || ''} onChange={e => setField('dropId', e.target.value)} style={inputStyle}>
              <option value="">No drop assigned</option>
              {drops.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <div style={{ ...label, marginBottom: '6px' }}>CREATOR</div>
          <select value={form.creatorId || ''} onChange={e => setField('creatorId', e.target.value)} style={{ ...inputStyle, marginBottom: '14px' }}>
            <option value="">No creator assigned</option>
            {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>PRICE (₹) *</div>
            <input style={inputStyle} type="number" value={form.price || ''} onChange={e => setField('price', Number(e.target.value))} placeholder="799" />
          </div>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>ORIGINAL PRICE (₹)</div>
            <input style={inputStyle} type="number" value={form.originalPrice || ''} onChange={e => setField('originalPrice', e.target.value ? Number(e.target.value) : undefined)} placeholder="999" />
          </div>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...label, marginBottom: '6px' }}>DESCRIPTION</div>
          <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.description || ''} onChange={e => setField('description', e.target.value)} placeholder="Product description..." />
        </div>

        {/* Multi image dropzone */}
        <MultiImageDropzone images={form.images || ['']} onChange={imgs => setField('images', imgs)} />

        <div style={{ marginBottom: '14px' }}>
          <div style={{ ...label, marginBottom: '6px' }}>SIZES & STOCK</div>
          {(form.variants || []).map((v, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
              <input style={inputStyle} value={v.size} onChange={e => { const vars = [...(form.variants || [])]; vars[i] = { ...vars[i], size: e.target.value }; setField('variants', vars); }} placeholder="S/M/L/XL" />
              <input style={inputStyle} type="number" value={v.stock} onChange={e => { const vars = [...(form.variants || [])]; vars[i] = { ...vars[i], stock: Number(e.target.value) }; setField('variants', vars); }} placeholder="Stock" />
              <button onClick={() => { const vars = [...(form.variants || [])]; vars.splice(i, 1); setField('variants', vars); }} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: '#f87171' }}><X size={12} /></button>
            </div>
          ))}
          <button onClick={() => setField('variants', [...(form.variants || []), { size: '', stock: 10 }])} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}>+ Add size</button>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[['featured', 'Featured product'], ['limitedEdition', 'Limited Edition'], ['preorder', 'Preorder enabled']].map(([key, lbl]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button onClick={() => setField(key as keyof Product, !(form as any)[key])} style={{ width: '36px', height: '20px', borderRadius: '10px', background: (form as any)[key] ? '#ff0000' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: (form as any)[key] ? '18px' : '2px', transition: 'left 0.2s' }} />
              </button>
              <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#94a3b8' }}>{lbl}</span>
            </div>
          ))}
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
    setShowModal(false); setEditing(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Products</h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>Add, edit, or remove products.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Add Product
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {products.map(p => (
          <div key={p.id} style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.04)' }}>
              {p.images[0] ? <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={18} style={{ color: '#334155' }} /></div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: '14px', color: '#f1f5f9', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {p.name}
                {p.featured && <span style={{ background: 'rgba(255,0,0,0.12)', color: '#ff6666', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>FEATURED</span>}
                {p.limitedEdition && <span style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>LIMITED</span>}
                {p.preorder && <span style={{ background: 'rgba(59,130,246,0.14)', color: '#60a5fa', fontSize: '9px', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>PREORDER</span>}
              </div>
              <div style={{ ...label, marginBottom: '4px' }}>{p.series} · {p.variants.map(v => v.size).join(', ')}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#ff6666' }}>₹{p.price.toLocaleString()}</span>
                {p.originalPrice && <span style={{ fontSize: '12px', color: '#475569', textDecoration: 'line-through' }}>₹{p.originalPrice.toLocaleString()}</span>}
                <span style={{ ...label }}>· Stock: {p.variants.reduce((s, v) => s + v.stock, 0)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => { setEditing(p); setShowModal(true); }} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => { if (confirm('Delete this product?')) setProducts(products.filter(x => x.id !== p.id)); }} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      {showModal && <ProductModal product={editing} onSave={handleSave} onClose={() => { setShowModal(false); setEditing(null); }} />}
    </div>
  );
};

// ── SERIES TAB ─────────────────────────────────────
const SeriesTab = () => {
  const { series, setSeries } = useStore();
  const [editing, setEditing] = useState<Partial<Series> | null>(null);

  const handleSave = () => {
    if (!editing?.name) { alert('Name required'); return; }
    const updated: Series = { id: editing.id || 's' + Date.now(), name: editing.name || '', description: editing.description || '', logo: editing.logo || '', banner: editing.banner || '', color: editing.color || '#ff0000' };
    if (series.find(s => s.id === updated.id)) setSeries(series.map(s => s.id === updated.id ? updated : s));
    else setSeries([...series, updated]);
    setEditing(null);
  };

  const SeriesForm = ({ data, setData }: { data: Partial<Series>; setData: (d: Partial<Series>) => void }) => (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div><div style={{ ...label, marginBottom: '5px' }}>NAME *</div><input style={inputStyle} value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} placeholder="Drop Name" /></div>
        <div><div style={{ ...label, marginBottom: '5px' }}>ACCENT COLOR</div><input type="color" value={data.color || '#ff0000'} onChange={e => setData({ ...data, color: e.target.value })} style={{ width: '100%', height: '38px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent' }} /></div>
      </div>
      <div style={{ marginBottom: '10px' }}><div style={{ ...label, marginBottom: '5px' }}>DESCRIPTION</div><input style={inputStyle} value={data.description || ''} onChange={e => setData({ ...data, description: e.target.value })} /></div>
      <ImageDropzone value={data.logo || ''} onChange={v => setData({ ...data, logo: v })} label="LOGO IMAGE" />
      <ImageDropzone value={data.banner || ''} onChange={v => setData({ ...data, banner: v })} label="BANNER IMAGE" />
      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
        <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={13} /> Save</button>
        <button onClick={() => setEditing(null)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Series</h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>Manage product collections.</p>
        </div>
        <button onClick={() => setEditing({ name: '', description: '', logo: '', banner: '', color: '#ff0000' })} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Add Series
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {series.map(s => (
          <div key={s.id} style={{ ...card, padding: '16px 20px' }}>
            {editing?.id === s.id ? <SeriesForm data={editing} setData={setEditing} /> : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.04)', flexShrink: 0, border: `2px solid ${s.color}40` }}>
                  {s.logo && <img src={s.logo} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#f1f5f9', marginBottom: '2px' }}>{s.name}</div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#64748b' }}>{s.description}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setEditing({ ...s })} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}><Edit2 size={12} /> Edit</button>
                  <button onClick={() => { if (confirm('Delete?')) setSeries(series.filter(ss => ss.id !== s.id)); }} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}><Trash2 size={12} /> Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {editing && !editing.id && (
          <div style={{ ...card, padding: '20px' }}>
            <h3 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#f1f5f9', margin: '0 0 16px' }}>New Series</h3>
            <SeriesForm data={editing} setData={setEditing} />
          </div>
        )}
      </div>
    </div>
  );
};

// ── CREATORS TAB ───────────────────────────────────
const CreatorsTab = () => {
  const { creators, setCreators, products } = useStore();
  const [editing, setEditing] = useState<Partial<Creator> | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSave = () => {
    if (!editing?.name || !editing?.handle) { alert('Name and handle required'); return; }
    const updated: Creator = {
      id: editing.id || 'c' + Date.now(),
      name: editing.name, handle: editing.handle.toLowerCase().replace(/\s+/g, ''),
      bio: editing.bio || '', avatar: editing.avatar || '', banner: editing.banner || '',
      youtubeVideoId: editing.youtubeVideoId || '', subscribers: editing.subscribers || '',
      productIds: editing.productIds || [],
      dropCountdownEnd: editing.dropCountdownEnd || '',
    };
    if (creators.find(c => c.id === updated.id)) setCreators(creators.map(c => c.id === updated.id ? updated : c));
    else setCreators([...creators, updated]);
    setShowModal(false); setEditing(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Creators</h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>Manage creator pages and their merch assignments.</p>
        </div>
        <button onClick={() => { setEditing({ productIds: [] }); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> Add Creator
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {creators.map(c => (
          <div key={c.id} style={{ ...card, overflow: 'hidden' }}>
            {c.banner && <div style={{ position: 'relative', height: '100px', overflow: 'hidden' }}><img src={c.banner} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /></div>}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <img src={c.avatar} alt={c.name} style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,0,0,0.4)', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>{c.name}</div>
                <div style={{ ...label, marginTop: '2px' }}>@{c.handle} · {c.subscribers || '—'} subscribers</div>
                <div style={{ ...label, marginTop: '2px' }}>{c.productIds.length} products assigned</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <a href={`/creator/${c.handle}`} target="_blank" rel="noopener noreferrer" style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>View Page</a>
                <button onClick={() => { setEditing({ ...c }); setShowModal(true); }} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}><Edit2 size={12} /> Edit</button>
                <button onClick={() => { if (confirm('Delete creator?')) setCreators(creators.filter(x => x.id !== c.id)); }} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}><Trash2 size={12} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Creator Modal */}
      {showModal && editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }} onClick={() => { setShowModal(false); setEditing(null); }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'hsl(0 0% 10%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '18px', color: '#f1f5f9', margin: 0 }}>{editing.id ? 'Edit Creator' : 'Add Creator'}</h2>
              <button onClick={() => { setShowModal(false); setEditing(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div><div style={{ ...label, marginBottom: '6px' }}>NAME *</div><input style={inputStyle} value={editing.name || ''} onChange={e => setEditing(ed => ({ ...ed!, name: e.target.value }))} placeholder="Carry Minati" /></div>
              <div><div style={{ ...label, marginBottom: '6px' }}>HANDLE * (URL slug)</div><input style={inputStyle} value={editing.handle || ''} onChange={e => setEditing(ed => ({ ...ed!, handle: e.target.value.toLowerCase().replace(/\s/g, '') }))} placeholder="carryminati" /></div>
            </div>

            <div style={{ marginBottom: '14px' }}><div style={{ ...label, marginBottom: '6px' }}>BIO</div><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={editing.bio || ''} onChange={e => setEditing(ed => ({ ...ed!, bio: e.target.value }))} placeholder="Creator bio..." /></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div><div style={{ ...label, marginBottom: '6px' }}>SUBSCRIBERS</div><input style={inputStyle} value={editing.subscribers || ''} onChange={e => setEditing(ed => ({ ...ed!, subscribers: e.target.value }))} placeholder="41M" /></div>
              <div><div style={{ ...label, marginBottom: '6px' }}>YOUTUBE VIDEO ID</div><input style={inputStyle} value={editing.youtubeVideoId || ''} onChange={e => setEditing(ed => ({ ...ed!, youtubeVideoId: e.target.value }))} placeholder="dQw4w9WgXcQ" /></div>
            </div>

            <ImageDropzone value={editing.avatar || ''} onChange={v => setEditing(ed => ({ ...ed!, avatar: v }))} label="AVATAR IMAGE" />
            <ImageDropzone value={editing.banner || ''} onChange={v => setEditing(ed => ({ ...ed!, banner: v }))} label="BANNER IMAGE" />

            <div style={{ marginBottom: '14px' }}>
              <div style={{ ...label, marginBottom: '6px' }}>DROP COUNTDOWN END (optional)</div>
              <input type="datetime-local" style={inputStyle} value={editing.dropCountdownEnd ? new Date(editing.dropCountdownEnd).toISOString().slice(0, 16) : ''} onChange={e => setEditing(ed => ({ ...ed!, dropCountdownEnd: e.target.value ? new Date(e.target.value).toISOString() : '' }))} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ ...label, marginBottom: '8px' }}>ASSIGN PRODUCTS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                {products.map(p => {
                  const assigned = (editing.productIds || []).includes(p.id);
                  return (
                    <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '8px 10px', borderRadius: '8px', background: assigned ? 'rgba(255,0,0,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${assigned ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.06)'}`, transition: 'all 0.15s' }}>
                      <input type="checkbox" checked={assigned} onChange={() => {
                        const ids = editing.productIds || [];
                        setEditing(ed => ({ ...ed!, productIds: assigned ? ids.filter(id => id !== p.id) : [...ids, p.id] }));
                      }} style={{ accentColor: '#ff0000' }} />
                      {p.images[0] && <img src={p.images[0]} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />}
                      <div>
                        <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#f1f5f9' }}>{p.name}</div>
                        <div style={{ ...label }}>₹{p.price}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setShowModal(false); setEditing(null); }} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '14px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSave} style={{ flex: 2, padding: '11px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Save size={14} /> {editing.id ? 'Save Changes' : 'Add Creator'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── DROP CONTROL TAB ───────────────────────────────
const DropControlTab = () => {
  const { drops, products, setDrops } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(null);

  const openEdit = (dropId: string) => {
    const d = drops.find(x => x.id === dropId);
    if (!d) return;
    setEditingId(dropId);
    setForm({ ...d });
  };

  const save = () => {
    if (!form?.id || !form?.name) return;
    setDrops(drops.map(d => d.id === form.id ? {
      ...d,
      name: form.name || d.name,
      description: form.description || '',
      theme: form.theme || '',
      banner: form.banner || '',
      endsAt: form.endsAt || '',
      limited: Boolean(form.limited),
      productIds: form.productIds || [],
    } : d));
    setEditingId(null);
    setForm(null);
  };

  const [creatingNew, setCreatingNew] = useState(false);
  const [newForm, setNewForm] = useState<any>({
    id: '', name: '', description: '', dropNumber: drops.length + 1, theme: '',
    banner: '', endsAt: '', productIds: [], limited: false
  });
  const [dropSaved, setDropSaved] = useState<string | null>(null);

  const saveNew = () => {
    if (!newForm.name) return;
    const newDrop = {
      ...newForm,
      id: 'drop' + Date.now(),
      dropNumber: drops.length + 1,
    };
    setDrops([...drops, newDrop]);
    sonnerToast.success('Drop created!', { description: newDrop.name + ' is now live.' });
    setCreatingNew(false);
    setNewForm({ id: '', name: '', description: '', dropNumber: drops.length + 2, theme: '', banner: '', endsAt: '', productIds: [], limited: false });
  };

  const saveDrop = () => {
    save();
    sonnerToast.success('Drop updated!', { description: form?.name + ' saved successfully.' });
    setDropSaved(editingId);
    setTimeout(() => setDropSaved(null), 2500);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Drop Control</h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>Create, edit and manage your drops.</p>
        </div>
        <button onClick={() => setCreatingNew(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> New Drop
        </button>
      </div>

      {/* Create new drop form */}
      {creatingNew && (
        <div style={{ ...card, padding: '20px', marginBottom: '16px', border: '1px solid rgba(255,0,0,0.2)' }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#f1f5f9', marginBottom: '14px' }}>New Drop</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div><div style={{ ...label, marginBottom: '5px' }}>DROP NAME *</div><input style={inputStyle} value={newForm.name} onChange={e => setNewForm((f: any) => ({ ...f, name: e.target.value }))} placeholder="Drop 003 — Summer" /></div>
            <div><div style={{ ...label, marginBottom: '5px' }}>THEME</div><input style={inputStyle} value={newForm.theme} onChange={e => setNewForm((f: any) => ({ ...f, theme: e.target.value }))} placeholder="Streetwear / Gaming..." /></div>
          </div>
          <div style={{ marginBottom: '10px' }}><div style={{ ...label, marginBottom: '5px' }}>DESCRIPTION</div><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={2} value={newForm.description} onChange={e => setNewForm((f: any) => ({ ...f, description: e.target.value }))} placeholder="What this drop is about..." /></div>
          <div style={{ marginBottom: '10px' }}><div style={{ ...label, marginBottom: '5px' }}>BANNER URL</div><input style={inputStyle} value={newForm.banner} onChange={e => setNewForm((f: any) => ({ ...f, banner: e.target.value }))} placeholder="https://..." /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <div><div style={{ ...label, marginBottom: '5px' }}>DROP END TIME</div><input type="datetime-local" style={inputStyle} value={newForm.endsAt ? new Date(newForm.endsAt).toISOString().slice(0,16) : ''} onChange={e => setNewForm((f: any) => ({ ...f, endsAt: e.target.value ? new Date(e.target.value).toISOString() : '' }))} /></div>
            <div><div style={{ ...label, marginBottom: '5px' }}>LIMITED DROP</div><button onClick={() => setNewForm((f: any) => ({ ...f, limited: !f.limited }))} style={{ ...inputStyle, textAlign: 'left', cursor: 'pointer' as const }}>{newForm.limited ? 'YES — Never restocking' : 'NO — Regular drop'}</button></div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ ...label, marginBottom: '6px' }}>ASSIGN PRODUCTS</div>
            <div style={{ maxHeight: '140px', overflowY: 'auto', padding: '6px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
              {products.map(p => {
                const checked = (newForm.productIds || []).includes(p.id);
                return (<label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 4px', cursor: 'pointer' }}><input type="checkbox" checked={checked} onChange={() => { const ids = newForm.productIds || []; setNewForm((f: any) => ({ ...f, productIds: checked ? ids.filter((id: string) => id !== p.id) : [...ids, p.id] })); }} /><span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#cbd5e1' }}>{p.name}</span></label>);
              })}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={saveNew} style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><Save size={13} /> Create Drop</button>
            <button onClick={() => setCreatingNew(false)} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {drops.map(d => (
          <div key={d.id} style={{ ...card, padding: '18px' }}>
            {editingId === d.id && form ? (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div><div style={{ ...label, marginBottom: '5px' }}>DROP NAME</div><input style={inputStyle} value={form.name || ''} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} /></div>
                  <div><div style={{ ...label, marginBottom: '5px' }}>THEME</div><input style={inputStyle} value={form.theme || ''} onChange={e => setForm((f: any) => ({ ...f, theme: e.target.value }))} /></div>
                </div>
                <div style={{ marginBottom: '10px' }}><div style={{ ...label, marginBottom: '5px' }}>DESCRIPTION</div><textarea style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={form.description || ''} onChange={e => setForm((f: any) => ({ ...f, description: e.target.value }))} /></div>
                <div style={{ marginBottom: '10px' }}><div style={{ ...label, marginBottom: '5px' }}>BANNER URL</div><input style={inputStyle} value={form.banner || ''} onChange={e => setForm((f: any) => ({ ...f, banner: e.target.value }))} /></div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ ...label, marginBottom: '5px' }}>DROP END TIME</div>
                    <input
                      type="datetime-local"
                      style={inputStyle}
                      value={form.endsAt ? new Date(form.endsAt).toISOString().slice(0, 16) : ''}
                      onChange={e => setForm((f: any) => ({ ...f, endsAt: e.target.value ? new Date(e.target.value).toISOString() : '' }))}
                    />
                  </div>
                  <div>
                    <div style={{ ...label, marginBottom: '5px' }}>LIMITED DROP</div>
                    <button onClick={() => setForm((f: any) => ({ ...f, limited: !f.limited }))}
                      style={{ ...inputStyle, textAlign: 'left', cursor: 'pointer' as const }}>
                      {form.limited ? 'YES (Never restocking)' : 'NO (Regular drop)'}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ ...label, marginBottom: '6px' }}>ASSIGNED PRODUCTS</div>
                  <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '6px', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}>
                    {products.map(p => {
                      const checked = (form.productIds || []).includes(p.id);
                      return (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 4px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              const ids = form.productIds || [];
                              setForm((f: any) => ({ ...f, productIds: checked ? ids.filter((id: string) => id !== p.id) : [...ids, p.id] }));
                            }}
                          />
                          <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#cbd5e1' }}>{p.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button onClick={saveDrop} style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', background: dropSaved === editingId ? '#16a34a' : '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.25s' }}><Save size={13} /> {dropSaved === editingId ? '✓ Saved!' : 'Save Drop'}</button>
                  <button onClick={() => { setEditingId(null); setForm(null); }} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>
                    {d.name}
                  </div>
                  <div style={{ ...label, marginTop: '4px' }}>{d.theme}</div>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#94a3b8', marginTop: '6px', maxWidth: '680px' }}>{d.description}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span style={{ ...label }}>Products: {d.productIds.length}</span>
                    <span style={{ ...label }}>Limited: {d.limited ? 'Yes' : 'No'}</span>
                    <span style={{ ...label }}>Ends: {d.endsAt ? new Date(d.endsAt).toLocaleString() : 'Not set'}</span>
                  </div>
                </div>
                <button onClick={() => openEdit(d.id)} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px', flexShrink: 0 }}>
                  <Edit2 size={12} /> Edit Drop
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ── HOME CONTENT TAB ───────────────────────────────
const HomeContentTab = () => {
  const { homePromo, setHomePromo, topBanner, setTopBanner } = useStore();
  const [form, setForm] = useState<HomePromo>(homePromo);
  const [bannerForm, setBannerForm] = useState<TopBanner>(topBanner);
  const [saved, setSaved] = useState(false);
  const [bannerSaved, setBannerSaved] = useState(false);
  const [videoTab, setVideoTab] = useState<'url' | 'upload'>('url');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setForm(homePromo); }, [homePromo]);
  useEffect(() => { setBannerForm(topBanner); }, [topBanner]);

  const save = () => {
    setHomePromo(form);
    setSaved(true);
    sonnerToast.success('Home content saved!', { description: 'Video and promo settings updated.' });
    setTimeout(() => setSaved(false), 3000);
  };

  const saveBanner = () => {
    setTopBanner(bannerForm);
    setBannerSaved(true);
    sonnerToast.success('Top banner saved!', { description: 'Banner settings updated live.' });
    setTimeout(() => setBannerSaved(false), 3000);
  };

  const handleVideoFile = (file: File) => {
    if (!file.type.startsWith('video/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setForm(f => ({ ...f, videoUrl: url }));
    };
    reader.readAsDataURL(file);
  };

  const removeVideo = () => {
    setForm(f => ({ ...f, videoUrl: '', posterUrl: '' }));
    sonnerToast.success('Video removed', { description: 'The promo video has been cleared.' });
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Home Content</h1>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Manage the top banner and promo video on the home page.</p>

      {/* TOP BANNER SECTION */}
      <div style={{ ...card, padding: '20px', maxWidth: '760px', marginBottom: '24px', border: '1px solid rgba(255,165,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>📢 Top Announcement Banner</div>
            <div style={{ ...label, marginTop: '2px' }}>Customise the scrolling banner at the top of all pages</div>
          </div>
          <button onClick={() => setBannerForm(f => ({ ...f, enabled: !f.enabled }))}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px', borderRadius: '8px', border: `1px solid ${bannerForm.enabled ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, background: bannerForm.enabled ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)', color: bannerForm.enabled ? '#4ade80' : '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
            {bannerForm.enabled ? 'ON' : 'OFF'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>BACKGROUND COLOR</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={bannerForm.bgColor} onChange={e => setBannerForm(f => ({ ...f, bgColor: e.target.value }))}
                style={{ width: '48px', height: '38px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent' }} />
              <input style={{ ...inputStyle, flex: 1 }} value={bannerForm.bgColor} onChange={e => setBannerForm(f => ({ ...f, bgColor: e.target.value }))} placeholder="#ff0000" />
            </div>
          </div>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>TEXT COLOR</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="color" value={bannerForm.textColor} onChange={e => setBannerForm(f => ({ ...f, textColor: e.target.value }))}
                style={{ width: '48px', height: '38px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: 'transparent' }} />
              <input style={{ ...inputStyle, flex: 1 }} value={bannerForm.textColor} onChange={e => setBannerForm(f => ({ ...f, textColor: e.target.value }))} placeholder="#ffffff" />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{ marginBottom: '14px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ height: '32px', background: bannerForm.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: bannerForm.textColor, letterSpacing: '0.03em' }}>
            {bannerForm.messages[0] || 'Preview message here'}
          </div>
        </div>

        <div style={{ ...label, marginBottom: '8px' }}>BANNER MESSAGES (rotate automatically)</div>
        {bannerForm.messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
            <input style={{ ...inputStyle, flex: 1 }} value={msg}
              onChange={e => { const msgs = [...bannerForm.messages]; msgs[i] = e.target.value; setBannerForm(f => ({ ...f, messages: msgs })); }}
              placeholder="Message text..." />
            <button onClick={() => { const msgs = bannerForm.messages.filter((_, idx) => idx !== i); setBannerForm(f => ({ ...f, messages: msgs })); }}
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: '#f87171', flexShrink: 0 }}>
              <X size={12} />
            </button>
          </div>
        ))}
        <button onClick={() => setBannerForm(f => ({ ...f, messages: [...f.messages, ''] }))}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer', marginTop: '4px', marginBottom: '16px' }}>
          + Add message
        </button>

        <button onClick={saveBanner}
          style={{ padding: '10px 18px', borderRadius: '8px', border: 'none', background: bannerSaved ? '#16a34a' : '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.25s' }}>
          <Save size={13} /> {bannerSaved ? '✓ Banner Saved!' : 'Save Banner Settings'}
        </button>
      </div>

      {/* PROMO VIDEO SECTION */}
      <div style={{ ...card, padding: '20px', maxWidth: '760px' }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#f1f5f9', marginBottom: '4px' }}>🎬 Home Page Promo Video</div>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
          Supports YouTube links, Instagram Reel links, or uploaded video files (.mp4 / .webm).
        </p>

        <div style={{ ...label, marginBottom: '8px' }}>VIDEO SOURCE</div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {(['url', 'upload'] as const).map(t => (
            <button key={t} onClick={() => setVideoTab(t)}
              style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '12px', fontFamily: 'Roboto, sans-serif', background: videoTab === t ? '#ff0000' : 'rgba(255,255,255,0.06)', color: videoTab === t ? 'white' : '#64748b', transition: 'all 0.15s' }}>
              {t === 'url' ? 'URL (YouTube / Instagram / Direct)' : 'Upload Video File'}
            </button>
          ))}
        </div>

        {videoTab === 'url' ? (
          <div style={{ marginBottom: '14px' }}>
            <input
              style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '12px' }}
              value={form.videoUrl.startsWith('data:') ? '' : form.videoUrl}
              onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value.trim() }))}
              placeholder="https://youtu.be/... or instagram.com/reel/... or direct .mp4"
            />
            <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#475569', marginTop: '5px' }}>
              YouTube · Instagram Reels · Direct video file (.mp4 / .webm) — all supported
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: '14px' }}>
            <div onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed rgba(255,255,255,0.12)', borderRadius: '10px', padding: '24px', textAlign: 'center', cursor: 'pointer', background: 'rgba(255,255,255,0.02)', marginBottom: '8px' }}>
              <Upload size={20} style={{ color: '#475569', marginBottom: '8px' }} />
              <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Click to upload video file</div>
              <div style={{ fontSize: '11px', color: '#334155' }}>MP4, WebM, MOV supported</div>
              <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleVideoFile(f); }} />
            </div>
            {form.videoUrl.startsWith('data:video') && (
              <div style={{ fontSize: '11px', color: '#4ade80' }}>✓ Video file uploaded successfully</div>
            )}
          </div>
        )}

        {form.videoUrl && (
          <button onClick={removeVideo}
            style={{ marginBottom: '14px', padding: '7px 14px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Trash2 size={12} /> Remove Current Video / Banner
          </button>
        )}

        <ImageDropzone value={form.posterUrl || ''} onChange={v => setForm(f => ({ ...f, posterUrl: v }))} label="POSTER IMAGE (shown before video loads)" />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>TITLE</div>
            <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Promotion Video" />
          </div>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>SUBTITLE</div>
            <input style={inputStyle} value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Creator drop preview" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>CTA BUTTON TEXT</div>
            <input style={inputStyle} value={form.ctaText} onChange={e => setForm(f => ({ ...f, ctaText: e.target.value }))} placeholder="Watch Drop" />
          </div>
          <div>
            <div style={{ ...label, marginBottom: '6px' }}>CTA BUTTON LINK</div>
            <input style={inputStyle} value={form.ctaLink} onChange={e => setForm(f => ({ ...f, ctaLink: e.target.value }))} placeholder="/drops" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={save}
            style={{ padding: '11px 20px', borderRadius: '8px', border: 'none', background: saved ? '#16a34a' : '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.25s' }}>
            <Save size={14} /> {saved ? '✓ Saved!' : 'Save Home Content'}
          </button>
          {saved && <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#4ade80' }}>Changes live on homepage ✓</span>}
        </div>
      </div>
    </div>
  );
};

// ── COUPONS TAB ──────────────────────────────────────
const CouponsTab = () => {
  const { coupons, setCoupons } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<DiscountCoupon>>({ code: '', type: 'percentage', value: 10, active: true, description: '' });

  const resetForm = () => { setForm({ code: '', type: 'percentage', value: 10, active: true, description: '' }); setEditingId(null); setShowForm(false); };

  const handleSave = () => {
    if (!form.code?.trim()) { sonnerToast.error('Coupon code is required'); return; }
    if (!form.value || form.value <= 0) { sonnerToast.error('Value must be greater than 0'); return; }
    const coupon: DiscountCoupon = {
      id: editingId || 'c' + Date.now(),
      code: form.code.trim().toUpperCase(),
      type: form.type || 'percentage',
      value: Number(form.value),
      active: form.active !== false,
      description: form.description || '',
    };
    if (editingId) setCoupons(coupons.map(c => c.id === editingId ? coupon : c));
    else setCoupons([...coupons, coupon]);
    sonnerToast.success(editingId ? 'Coupon updated!' : 'Coupon created!', { description: coupon.code + ' is now ' + (coupon.active ? 'active' : 'inactive') });
    resetForm();
  };

  const toggleActive = (id: string) => setCoupons(coupons.map(c => c.id === id ? { ...c, active: !c.active } : c));

  const deleteCoupon = (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    setCoupons(coupons.filter(c => c.id !== id));
    sonnerToast.success('Coupon deleted');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Discount Coupons</h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>Create and manage coupon codes used at checkout. Supports % or fixed ₹ discounts.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, padding: '20px', marginBottom: '20px', border: '1px solid rgba(255,0,0,0.2)' }}>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#f1f5f9', marginBottom: '16px' }}>
            {editingId ? 'Edit Coupon' : 'New Coupon'}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ ...label, marginBottom: '6px' }}>COUPON CODE *</div>
              <input style={{ ...inputStyle, fontFamily: 'monospace', textTransform: 'uppercase' as const }}
                value={form.code || ''}
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                placeholder="YOUTUPIA10" />
            </div>
            <div>
              <div style={{ ...label, marginBottom: '6px' }}>DISCOUNT TYPE</div>
              <select value={form.type || 'percentage'} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))} style={inputStyle}>
                <option value="percentage">Percentage (e.g. 10%)</option>
                <option value="fixed">Fixed Amount (e.g. Rs.100)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ ...label, marginBottom: '6px' }}>{form.type === 'fixed' ? 'AMOUNT (Rs.)' : 'PERCENTAGE (%)'}</div>
              <input type="number" min="0" max={form.type === 'percentage' ? '100' : undefined}
                style={inputStyle} value={form.value || ''}
                onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                placeholder={form.type === 'fixed' ? '100' : '10'} />
            </div>
            <div>
              <div style={{ ...label, marginBottom: '6px' }}>DESCRIPTION (optional)</div>
              <input style={inputStyle} value={form.description || ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="e.g. 10% off for Youtupia fans" />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <button onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              style={{ width: '38px', height: '22px', borderRadius: '11px', background: form.active ? '#ff0000' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: form.active ? '18px' : '2px', transition: 'left 0.2s' }} />
            </button>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: form.active ? '#4ade80' : '#64748b' }}>
              {form.active ? 'Active — customers can use this code' : 'Inactive — code will not work'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleSave}
              style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={13} /> {editingId ? 'Update Coupon' : 'Create Coupon'}
            </button>
            <button onClick={resetForm}
              style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '13px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {coupons.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', color: '#475569', fontFamily: 'Roboto, sans-serif', fontSize: '13px' }}>No coupons yet. Create your first one!</div>
        )}
        {coupons.map(c => (
          <div key={c.id} style={{ ...card, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: c.active ? 'rgba(255,0,0,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${c.active ? 'rgba(255,0,0,0.2)' : 'rgba(255,255,255,0.06)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Tag size={18} style={{ color: c.active ? '#ff6666' : '#475569' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '15px', color: '#f1f5f9', letterSpacing: '0.05em' }}>{c.code}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: c.type === 'percentage' ? 'rgba(96,165,250,0.1)' : 'rgba(251,191,36,0.1)', color: c.type === 'percentage' ? '#60a5fa' : '#fbbf24' }}>
                  {c.type === 'percentage' ? `${c.value}% OFF` : `Rs.${c.value} OFF`}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: c.active ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.08)', color: c.active ? '#4ade80' : '#f87171' }}>
                  {c.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              {c.description && <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#64748b' }}>{c.description}</div>}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button onClick={() => toggleActive(c.id)}
                style={{ padding: '6px 12px', borderRadius: '7px', border: `1px solid ${c.active ? 'rgba(239,68,68,0.2)' : 'rgba(74,222,128,0.2)'}`, background: c.active ? 'rgba(239,68,68,0.06)' : 'rgba(74,222,128,0.06)', color: c.active ? '#f87171' : '#4ade80', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: 600 }}>
                {c.active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => { setForm({ ...c }); setEditingId(c.id); setShowForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
                <Edit2 size={12} /> Edit
              </button>
              <button onClick={() => deleteCoupon(c.id)}
                style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
                <Trash2 size={12} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// ── SUPPORT TICKETS TAB ────────────────────────────
const SupportTicketsTab = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [selected, setSelected] = useState<any | null>(null);
  const [updating, setUpdating] = useState('');

  const fetchTickets = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/admin-tickets');
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Failed to load tickets'); setLoading(false); return; }
      const data = await res.json();
      setTickets(data.tickets || []);
    } catch { setError('Connection error'); }
    setLoading(false);
  };

  useEffect(() => { fetchTickets(); }, []);

  const updateStatus = async (ticketId: string, status: string) => {
    setUpdating(ticketId);
    try {
      await fetch('/api/admin-tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, status }),
      });
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
      if (selected?.id === ticketId) setSelected((s: any) => ({ ...s, status }));
    } catch {}
    setUpdating('');
  };

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);
  const counts = {
    all: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
  };
  const statusColor = (s: string) => s === 'open' ? '#f97316' : s === 'in_progress' ? '#60a5fa' : '#22c55e';
  const statusBg   = (s: string) => s === 'open' ? 'rgba(249,115,22,0.1)' : s === 'in_progress' ? 'rgba(96,165,250,0.1)' : 'rgba(34,197,94,0.1)';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '20px', marginBottom: '4px' }}>Support Tickets</h2>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>Messages submitted via the Contact Support page</p>
        </div>
        <button onClick={fetchTickets} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', fontFamily: 'Roboto, sans-serif' }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {(['all', 'open', 'in_progress', 'resolved'] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ ...card, padding: '14px', border: filter === s ? '1px solid #ff0000' : '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', textAlign: 'left', background: filter === s ? 'rgba(255,0,0,0.06)' : 'hsl(0 0% 11%)' }}>
            <div style={{ fontSize: '22px', fontWeight: 800, color: s === 'all' ? '#f1f5f9' : statusColor(s) }}>{counts[s]}</div>
            <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', letterSpacing: '0.08em', marginTop: '2px', textTransform: 'uppercase' }}>{s.replace('_', ' ')}</div>
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: '#ef4444', fontSize: '13px', fontFamily: 'Roboto, sans-serif' }}>
          <AlertCircle size={16} /> {error} — make sure the <code>tickets</code> table exists in Supabase and <code>/api/admin-tickets</code> is deployed.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#475569', fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}>Loading tickets...</div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding: '48px', textAlign: 'center', color: '#475569', fontFamily: 'Roboto, sans-serif', fontSize: '14px' }}>
          <MessageSquare size={32} style={{ color: '#1e293b', marginBottom: '12px' }} />
          <div>No {filter !== 'all' ? filter.replace('_', ' ') : ''} tickets yet.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: '16px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(t => (
              <div key={t.id} onClick={() => setSelected(selected?.id === t.id ? null : t)}
                style={{ ...card, padding: '16px 20px', cursor: 'pointer', border: selected?.id === t.id ? '1px solid #ff0000' : '1px solid rgba(255,255,255,0.07)', background: selected?.id === t.id ? 'rgba(255,0,0,0.04)' : 'hsl(0 0% 11%)', transition: 'border-color 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.subject}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: statusBg(t.status), color: statusColor(t.status), flexShrink: 0, fontFamily: 'Roboto, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.status?.replace('_', ' ')}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Roboto, sans-serif' }}>{t.name} · {t.email}</div>
                    <div style={{ fontSize: '12px', color: '#475569', fontFamily: 'Roboto, sans-serif', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.message}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#334155', flexShrink: 0, fontFamily: 'Roboto, sans-serif' }}>
                    {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selected && (
            <div style={{ ...card, padding: '20px', position: 'sticky', top: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '13px', color: '#f1f5f9' }}>Ticket Detail</span>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex' }}><X size={16} /></button>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '3px', textTransform: 'uppercase' }}>Subject</div>
                <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#f1f5f9' }}>{selected.subject}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                {[
                  { label: 'FROM', value: selected.name },
                  { label: 'EMAIL', value: selected.email },
                  { label: 'CATEGORY', value: selected.category || 'General' },
                  { label: 'DATE', value: new Date(selected.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
                ].map(({ label: l, value: v }) => (
                  <div key={l}>
                    <div style={{ fontSize: '9px', color: '#475569', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '2px', textTransform: 'uppercase' }}>{l}</div>
                    <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#94a3b8', wordBreak: 'break-all' }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>Message</div>
                <div style={{ background: 'hsl(0 0% 7%)', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#cbd5e1', fontFamily: 'Roboto, sans-serif', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.message}</div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'monospace', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>Update Status</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(['open', 'in_progress', 'resolved'] as const).map(s => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={updating === selected.id || selected.status === s}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: selected.status === s ? `1px solid ${statusColor(s)}` : '1px solid rgba(255,255,255,0.08)', background: selected.status === s ? statusBg(s) : 'transparent', color: selected.status === s ? statusColor(s) : '#64748b', cursor: selected.status === s ? 'default' : 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: selected.status === s ? 700 : 400, textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s' }}>
                      {selected.status === s && <CheckCircle size={12} />} {s.replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
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
        {tab === 'creators' && <CreatorsTab />}
        {tab === 'drops' && <DropControlTab />}
        {tab === 'homepage' && <HomeContentTab />}
        {tab === 'coupons' && <CouponsTab />}
        {tab === 'tickets' && <SupportTicketsTab />}
      </main>
    </div>
  );
};

export default AdminDashboard;
