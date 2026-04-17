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

type AdminTab = 'overview' | 'orders' | 'products' | 'series' | 'creators' | 'drops' | 'homepage' | 'coupons' | 'tickets' | 'voting';

// ── CALENDAR DATE-TIME PICKER ──────────────────────
const DateTimePicker = ({ value, onChange, labelText }: { value: string; onChange: (iso: string) => void; labelText: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const localValue = value ? new Date(value).toISOString().slice(0, 16) : '';

  const displayDate = value
    ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' +
      new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    : 'Pick a date & time';

  return (
    <div style={{ marginBottom: '0' }}>
      <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em', marginBottom: '6px' }}>{labelText}</div>
      <div style={{ position: 'relative' }}>
        <div
          onClick={() => inputRef.current?.showPicker?.() ?? inputRef.current?.click()}
          style={{
            width: '100%', padding: '9px 38px 9px 12px', background: 'hsl(0 0% 7%)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
            color: value ? '#f1f5f9' : '#475569', fontFamily: 'Roboto, sans-serif',
            fontSize: '13px', cursor: 'pointer', boxSizing: 'border-box' as const,
            display: 'flex', alignItems: 'center', gap: '8px', userSelect: 'none' as const,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ef4444', flexShrink: 0 }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          <span>{displayDate}</span>
          {value && (
            <span
              onClick={e => { e.stopPropagation(); onChange(''); }}
              style={{ marginLeft: 'auto', color: '#475569', fontSize: '16px', lineHeight: 1, cursor: 'pointer', padding: '0 2px' }}
            >×</span>
          )}
        </div>
        <input
          ref={inputRef}
          type="datetime-local"
          value={localValue}
          onChange={e => onChange(e.target.value ? new Date(e.target.value).toISOString() : '')}
          style={{ position: 'absolute', opacity: 0, top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          tabIndex={-1}
        />
      </div>
    </div>
  );
};

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
    { id: 'voting', icon: BarChart2, label: 'Voting Control' },
  ];
  return (
    <aside style={{ width: '220px', flexShrink: 0, height: '100vh', background: 'hsl(0 0% 2.5%)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0 }}>
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

  const pendingOrders    = orders.filter(o => ['processing', 'preorder_confirmed', 'confirmed', 'shipped'].includes(o.status));
  const deliveredOrders  = orders.filter(o => o.status === 'delivered');
  const cancelledOrders  = orders.filter(o => o.status === 'cancelled');

  const pendingRevenue   = pendingOrders.reduce((s, o) => s + o.total, 0);
  const earnedRevenue    = deliveredOrders.reduce((s, o) => s + o.total, 0);
  const cancelledValue   = cancelledOrders.reduce((s, o) => s + o.total, 0);

  const totalSold        = deliveredOrders.reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.quantity, 0), 0);
  const activeOrders     = pendingOrders.length;

  const STATUS_COLOR_MAP: Record<string, string> = {
    processing: '#fbbf24', preorder_confirmed: '#a78bfa', confirmed: '#60a5fa',
    shipped: '#8b5cf6', delivered: '#4ade80', cancelled: '#ef4444',
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Store Overview</h1>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>Real-time snapshot of your merch store.</p>

      <div style={{ ...card, padding: '22px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ ...label, marginBottom: '16px', fontSize: '11px' }}>REVENUE BREAKDOWN</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', position: 'relative' }}>
          <div style={{ padding: '0 20px 0 0', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
              <span style={{ ...label, color: '#4ade80' }}>EARNED REVENUE</span>
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, fontSize: '30px', color: '#4ade80', lineHeight: 1, letterSpacing: '-0.02em' }}>
              ₹{earnedRevenue.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#334155', marginTop: '5px' }}>
              {deliveredOrders.length} delivered order{deliveredOrders.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ padding: '0 20px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fbbf24', flexShrink: 0 }} />
              <span style={{ ...label, color: '#fbbf24' }}>PENDING / IN TRANSIT</span>
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, fontSize: '30px', color: '#fbbf24', lineHeight: 1, letterSpacing: '-0.02em' }}>
              ₹{pendingRevenue.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#334155', marginTop: '5px' }}>
              {activeOrders} active order{activeOrders !== 1 ? 's' : ''}
            </div>
          </div>

          <div style={{ padding: '0 0 0 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
              <span style={{ ...label, color: '#ef4444' }}>CANCELLED / LOST</span>
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 900, fontSize: '30px', color: '#ef4444', lineHeight: 1, letterSpacing: '-0.02em' }}>
              ₹{cancelledValue.toLocaleString()}
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#334155', marginTop: '5px' }}>
              {cancelledOrders.length} cancelled order{cancelledOrders.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {orders.length > 0 && (() => {
          const total = earnedRevenue + pendingRevenue + cancelledValue || 1;
          const earnedPct   = Math.round((earnedRevenue  / total) * 100);
          const pendingPct  = Math.round((pendingRevenue / total) * 100);
          const cancelledPct = 100 - earnedPct - pendingPct;
          return (
            <div style={{ marginTop: '18px' }}>
              <div style={{ display: 'flex', height: '6px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                {earnedPct   > 0 && <div style={{ width: earnedPct   + '%', background: '#4ade80', transition: 'width 0.5s' }} />}
                {pendingPct  > 0 && <div style={{ width: pendingPct  + '%', background: '#fbbf24', transition: 'width 0.5s' }} />}
                {cancelledPct > 0 && <div style={{ width: cancelledPct + '%', background: '#ef4444', transition: 'width 0.5s' }} />}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                {[
                  { label: 'Earned', pct: earnedPct, color: '#4ade80' },
                  { label: 'Pending', pct: pendingPct, color: '#fbbf24' },
                  { label: 'Cancelled', pct: cancelledPct, color: '#ef4444' },
                ].map(({ label: l, pct, color }) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                    <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '11px', color: '#475569' }}>{l} {pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '16px' }}>
        {[
          { label: 'ITEMS SOLD', value: totalSold, color: '#ff6666', icon: TrendingUp },
          { label: 'ACTIVE ORDERS', value: activeOrders, color: '#fbbf24', icon: Clock },
          { label: 'DELIVERED', value: deliveredOrders.length, color: '#4ade80', icon: CheckCircle },
          { label: 'CANCELLED', value: cancelledOrders.length, color: '#ef4444', icon: Package },
        ].map(s => (
          <div key={s.label} style={{ ...card, padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
              <div style={{ ...label }}>{s.label}</div>
              <s.icon size={13} style={{ color: s.color, opacity: 0.7 }} />
            </div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '28px', color: s.color, lineHeight: 1 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#f1f5f9' }}>Recent Orders</span>
          <span style={{ ...label }}>{orders.length} TOTAL</span>
        </div>
        {orders.slice(0, 5).map((o, i) => (
          <div key={o.id} style={{ padding: '12px 20px', borderBottom: i < Math.min(4, orders.length - 1) ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 600, fontSize: '13px', color: o.status === 'cancelled' ? '#64748b' : '#f1f5f9', textDecoration: o.status === 'cancelled' ? 'line-through' : 'none' }}>{o.customerName}</div>
              <div style={{ ...label, marginTop: '2px' }}>{o.id} · {o.items.length} item(s)</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: o.status === 'cancelled' ? '#ef4444' : o.status === 'delivered' ? '#4ade80' : '#fbbf24', textDecoration: o.status === 'cancelled' ? 'line-through' : 'none' }}>
                {o.status === 'cancelled' ? '-' : ''}₹{o.total.toLocaleString()}
              </div>
              <span style={{ background: (STATUS_COLOR_MAP[o.status] || '#fbbf24') + '18', color: STATUS_COLOR_MAP[o.status] || '#fbbf24', borderRadius: '20px', padding: '2px 8px', fontSize: '10px', fontFamily: 'monospace', textTransform: 'capitalize' }}>
                {o.status.replace('_', ' ')}
              </span>
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
  const { orders, updateOrderStatus, updateOrder, deleteOrder } = useStore();
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({});
  const [savedTracking, setSavedTracking] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [cancelRemarkInput, setCancelRemarkInput] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const STATUS_COLOR: Record<string, string> = { processing: '#fbbf24', preorder_confirmed: '#a78bfa', confirmed: '#60a5fa', shipped: '#8b5cf6', delivered: '#4ade80', cancelled: '#ef4444' };
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const codCount = orders.filter(o => (o as any).paymentMethod === 'cod').length;
  const onlineCount = orders.filter(o => (o as any).paymentMethod !== 'cod').length;
  const pendingCOD = orders.filter(o => (o as any).paymentMethod === 'cod' && o.status === 'processing').length;

  const saveTracking = (orderId: string) => {
    const trackingId = (trackingInputs[orderId] || '').trim();
    const notes = (notesInputs[orderId] || '').trim();
    if (!trackingId && !notes) return;
    const updates: any = {};
    if (trackingId) {
      updates.trackingId = trackingId;
      updates.trackingUrl = 'https://www.delhivery.com/track/package/' + trackingId;
      updates.status = 'shipped';
    }
    if (notes) updates.notes = notes;
    updateOrder(orderId, updates);
    sonnerToast.success('Tracking saved!', { description: 'Order ' + orderId + ' updated.' });
    setSavedTracking(orderId);
    setTimeout(() => setSavedTracking(null), 2500);
  };

  return (
    <div>
      <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Orders</h1>
      <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Manage orders, update status, add Delhivery tracking numbers.</p>

      {pendingCOD > 0 && (
        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '14px', color: '#fbbf24' }}>{pendingCOD} COD order{pendingCOD > 1 ? 's' : ''} waiting for your approval</div>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Accept or decline each COD order below. Prepaid orders are auto-accepted.</div>
          </div>
        </div>
      )}

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

      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all','processing','preorder_confirmed','confirmed','shipped','delivered','cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid ' + (filter === f ? '#ff0000' : 'rgba(255,255,255,0.1)'), background: filter === f ? 'rgba(255,0,0,0.12)' : 'transparent', color: filter === f ? '#ff6666' : STATUS_COLOR[f] || '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize' }}>
            {f === 'all' ? 'All (' + orders.length + ')' : (f.replace('_',' ').charAt(0).toUpperCase()+f.replace('_',' ').slice(1)) + ' (' + orders.filter(o=>o.status===f).length + ')'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#475569', fontFamily: 'Roboto, sans-serif' }}>No orders found.</div>
        ) : filtered.map(o => {
          const isCOD = (o as any).paymentMethod === 'cod';
          const isPrepaid = !isCOD;
          const isOpen = expanded === o.id;
          const isNewCOD = isCOD && o.status === 'processing';
          const isNewPrepaid = isPrepaid && o.status === 'processing';
          return (
            <div key={o.id} style={{ ...card, overflow: 'hidden', border: isNewCOD ? '1px solid rgba(251,191,36,0.4)' : isNewPrepaid ? '1px solid rgba(96,165,250,0.3)' : '1px solid rgba(255,255,255,0.07)' }}>

              {isNewCOD && (
                <div style={{ background: 'rgba(251,191,36,0.07)', borderBottom: '1px solid rgba(251,191,36,0.2)', padding: '10px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px' }}>💵</span>
                    <div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '13px', color: '#fbbf24' }}>New COD Order — Action Required</div>
                      <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '11px', color: '#64748b' }}>Verify and accept or decline this cash on delivery order.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { updateOrder(o.id, { status: 'confirmed' }); sonnerToast.success('COD order accepted!', { description: o.id }); }}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#22c55e', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                      ✓ Accept Order
                    </button>
                    <button onClick={() => { setCancelTarget(o.id); setCancelRemarkInput(''); }}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                      ✕ Decline Order
                    </button>
                  </div>
                </div>
              )}

              {isNewPrepaid && (
                <div style={{ background: 'rgba(96,165,250,0.06)', borderBottom: '1px solid rgba(96,165,250,0.15)', padding: '9px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>💳</span>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#60a5fa', fontWeight: 700 }}>Prepaid — Payment verified. Auto-accepted.</span>
                  <button onClick={() => { updateOrder(o.id, { status: 'confirmed' }); sonnerToast.success('Order confirmed', { description: o.id }); }}
                    style={{ marginLeft: 'auto', padding: '5px 12px', borderRadius: '6px', border: 'none', background: '#22c55e', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                    Confirm Now
                  </button>
                </div>
              )}

              {cancelTarget === o.id && (
                <div style={{ background: 'rgba(239,68,68,0.06)', borderBottom: '1px solid rgba(239,68,68,0.2)', padding: '12px 18px' }}>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em', marginBottom: '6px' }}>DECLINE / CANCELLATION REASON</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input value={cancelRemarkInput} onChange={e => setCancelRemarkInput(e.target.value)}
                      placeholder="e.g. Item out of stock, suspicious address, customer unreachable..."
                      style={{ width: '100%', padding: '9px 12px', background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const, flex: 1 }} />
                    <button onClick={() => { updateOrder(o.id, { status: 'cancelled', cancelReason: cancelRemarkInput || 'Declined by seller' }); setCancelTarget(null); sonnerToast.success('Order declined/cancelled', { description: o.id }); }}
                      style={{ padding: '9px 14px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                      Confirm Decline
                    </button>
                    <button onClick={() => setCancelTarget(null)} style={{ padding: '9px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                  </div>
                </div>
              )}

              <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : o.id)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '5px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#f1f5f9' }}>{o.id}</span>
                    <span style={{ background: STATUS_COLOR[o.status] + '18', color: STATUS_COLOR[o.status], border: '1px solid ' + STATUS_COLOR[o.status] + '30', borderRadius: '20px', padding: '2px 9px', fontSize: '10px', fontWeight: 700, textTransform: 'capitalize' }}>{o.status.replace('_', ' ')}</span>
                    <span style={{ background: isCOD ? 'rgba(74,222,128,0.1)' : 'rgba(96,165,250,0.1)', color: isCOD ? '#4ade80' : '#60a5fa', borderRadius: '20px', padding: '2px 8px', fontSize: '9px', fontWeight: 700 }}>{isCOD ? '💵 COD' : '💳 PAID'}</span>
                    {(o as any).trackingId && <span style={{ background: 'rgba(139,92,246,0.12)', color: '#a78bfa', borderRadius: '20px', padding: '2px 8px', fontSize: '9px', fontWeight: 700 }}>🚚 TRACKING ADDED</span>}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em' }}>{o.customerName} · {o.customerEmail} · {o.customerPhone}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em', marginTop: '2px' }}>📍 {o.address}</div>
                  {(o as any).discountCode && <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4ade80', letterSpacing: '0.1em', marginTop: '2px' }}>🏷 {(o as any).discountCode}</div>}
                  {(o as any).cancelReason && <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#f87171', letterSpacing: '0.1em', marginTop: '2px' }}>❌ {(o as any).cancelReason}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '18px', color: '#ff6666' }}>₹{o.total.toLocaleString()}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      onClick={e => { e.stopPropagation(); generateInvoice(o); }}
                      style={{ padding: '5px 11px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontFamily: 'Roboto, sans-serif', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      🧾 Invoice
                    </button>
                    {deleteConfirm === o.id ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => { deleteOrder(o.id); setDeleteConfirm(null); sonnerToast.success('Order deleted', { description: o.id }); }}
                          style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                          Confirm Delete
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '11px' }}>
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); setDeleteConfirm(o.id); }}
                        style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: '11px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        🗑 Delete
                      </button>
                    )}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '10px', color: isOpen ? '#ff6666' : '#475569', cursor: 'pointer', letterSpacing: '0.1em' }} onClick={() => setExpanded(isOpen ? null : o.id)}>{isOpen ? '▲ collapse' : '▼ expand'}</div>
                </div>
              </div>

              {isOpen && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 18px' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {o.items.map(item => (
                      <div key={item.productId + '-' + item.size} style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '6px 10px' }}>
                        <img src={item.product.images[0]} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} onError={e => { (e.target as any).style.display = 'none'; }} />
                        <div>
                          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#f1f5f9', fontWeight: 600 }}>{item.product.name}</div>
                          <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em' }}>{item.size} × {item.quantity} · ₹{(item.product.price * item.quantity).toLocaleString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em', marginBottom: '8px' }}>UPDATE STATUS</div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {(['processing','preorder_confirmed','confirmed','shipped','delivered','cancelled'] as const).map(s => (
                        <button key={s} onClick={() => {
                          if (s === 'cancelled') { setCancelTarget(o.id); setCancelRemarkInput(''); return; }
                          updateOrder(o.id, { status: s });
                          sonnerToast.success('Status updated', { description: o.id + ' → ' + s });
                        }} disabled={o.status === s}
                          style={{ padding: '6px 14px', borderRadius: '6px', border: '1px solid ' + (o.status === s ? STATUS_COLOR[s] : 'rgba(255,255,255,0.1)'), background: o.status === s ? STATUS_COLOR[s] + '18' : 'rgba(255,255,255,0.03)', color: o.status === s ? STATUS_COLOR[s] : s === 'cancelled' ? '#f87171' : '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: o.status === s ? 'default' : 'pointer', textTransform: 'capitalize', fontWeight: o.status === s ? 700 : 400 }}>
                          {o.status === s ? '● ' : ''}{s.replace('_',' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'hsl(0 0% 11%)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '12px', padding: '14px', marginBottom: '10px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#a78bfa', letterSpacing: '0.1em', marginBottom: '8px' }}>DELHIVERY TRACKING NUMBER (AWB)</div>
                    {(o as any).trackingId ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontFamily: 'monospace', fontSize: '13px', color: '#a78bfa', fontWeight: 700 }}>{(o as any).trackingId}</div>
                          <a href={(o as any).trackingUrl || 'https://www.delhivery.com/track/package/' + (o as any).trackingId} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#60a5fa', textDecoration: 'none' }}>🔗 Open on Delhivery →</a>
                        </div>
                        <button onClick={() => updateOrder(o.id, { trackingId: '', trackingUrl: '' })} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: '11px', cursor: 'pointer' }}>Clear</button>
                      </div>
                    ) : (
                      <div>
                        <div style={{ marginBottom: '8px' }}>
                          <input value={trackingInputs[o.id] || ''} onChange={e => setTrackingInputs(prev => ({ ...prev, [o.id]: e.target.value }))} placeholder="Enter AWB / tracking number from Delhivery" style={{ width: '100%', padding: '9px 12px', background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const }} />
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.1em', marginBottom: '6px' }}>INTERNAL NOTES (optional)</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input value={notesInputs[o.id] || ''} onChange={e => setNotesInputs(prev => ({ ...prev, [o.id]: e.target.value }))} placeholder="e.g. Dispatched from Jaipur warehouse" style={{ width: '100%', padding: '9px 12px', background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#f1f5f9', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const, flex: 1 }} />
                          <button onClick={() => saveTracking(o.id)} style={{ padding: '9px 16px', borderRadius: '8px', border: 'none', background: savedTracking === o.id ? '#16a34a' : '#8b5cf6', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.25s', flexShrink: 0 }}>
                            💾 Save & Mark Shipped
                          </button>
                        </div>
                        <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#475569', letterSpacing: '0.1em', marginTop: '6px' }}>
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
  const { products, setProduct, deleteProduct } = useStore();
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
 
  const handleSave = async (p: Product) => {
    setSaving(true);
    // OPTIMISTIC: UI updates instantly, DB saves in background
    setProduct(p);  // ← uses setProduct (single row) instead of setProducts (all rows)
    setShowModal(false);
    setEditing(null);
    setSaving(false);
    sonnerToast.success(editing?.id ? 'Product updated!' : 'Product added!', {
      description: p.name + ' saved successfully.'
    });
  };
 
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteProduct(id);  // ← uses deleteProduct (single row) instead of setProducts(filtered)
    sonnerToast.success('Product deleted', { description: name + ' removed.' });
  };
 
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Products</h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>
            Add, edit, or remove products. Changes reflect instantly.
          </p>
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
              <button onClick={() => handleDelete(p.id, p.name)} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
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
              <DateTimePicker
                labelText="DROP COUNTDOWN END (optional)"
                value={editing.dropCountdownEnd || ''}
                onChange={v => setEditing(ed => ({ ...ed!, dropCountdownEnd: v }))}
              />
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
            <div><DateTimePicker labelText="DROP END TIME" value={newForm.endsAt || ''} onChange={v => setNewForm((f: any) => ({ ...f, endsAt: v }))} /></div>
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
                    <DateTimePicker
                      labelText="DROP END TIME"
                      value={form.endsAt || ''}
                      onChange={v => setForm((f: any) => ({ ...f, endsAt: v }))}
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
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => openEdit(d.id)} style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
                    <Edit2 size={12} /> Edit Drop
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete "${d.name}"? This cannot be undone.`)) {
                        setDrops(drops.filter(x => x.id !== d.id));
                        sonnerToast.success('Drop deleted', { description: d.name + ' has been removed.' });
                      }
                    }}
                    style={{ padding: '7px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Roboto, sans-serif', fontSize: '12px' }}>
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
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

      <div style={{ ...card, padding: '20px', maxWidth: '760px' }}>
        <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#f1f5f9', marginBottom: '4px' }}>🎬 Home Page Promo Video</div>
        <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
          Supports YouTube links, Instagram Reel links, or uploaded video files (.mp4 / .webm).
        </p>

        <VideoDropzone value={form.videoUrl} onChange={v => setForm(f => ({ ...f, videoUrl: v }))} label="VIDEO SOURCE" />

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
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>Create and manage coupon codes used at checkout.</p>
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
      const res = await fetch('/api/tickets');
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
      await fetch('/api/tickets', {
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
          <AlertCircle size={16} /> {error}
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

// ── INVOICE GENERATOR ────────────────────────────────
const generateInvoice = (order: any) => {
  const subtotal = order.items.reduce(
    (s: number, i: any) => s + i.product.price * i.quantity,
    0
  );

  const GST_RATE = 0.12;
  const baseAmount = Math.round(subtotal / (1 + GST_RATE));
  const gstAmount = subtotal - baseAmount;
  const cgst = Math.round(gstAmount / 2);
  const sgst = gstAmount - cgst;

  const toWords = (num: number): string => {
    if (num === 0) return 'Zero';
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const convert = (n: number): string => {
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convert(n % 100) : '');
      if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
      if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
      return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
    };
    const rupees = Math.floor(num);
    const paise = Math.round((num - rupees) * 100);
    let result = convert(rupees) + ' Rupees';
    if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
    return result + ' Only';
  };

  const amountInWords = toWords(order.total);

  const rows = order.items.map((item: any, i: number) =>
    `<tr>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#999;">${i + 1}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;">
        <strong>${item.product.name}</strong>
        <div style="font-size:11px;color:#888;margin-top:2px;">${item.product.series || ''}</div>
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;color:#666;">${item.size}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;">&#8377;${item.product.price.toLocaleString('en-IN')}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #f0f0f0;font-size:13px;font-weight:700;text-align:right;">&#8377;${(item.product.price * item.quantity).toLocaleString('en-IN')}</td>
    </tr>`
  ).join('');

  const qrData = JSON.stringify({
    inv: order.id,
    date: new Date(order.createdAt).toLocaleDateString('en-IN'),
    buyer: order.customerName,
    total: order.total,
  });

  const qrUrl = `https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=${encodeURIComponent(qrData)}&choe=UTF-8`;
  const payBg = order.paymentMethod === 'cod' ? '#dcfce7' : '#dbeafe';
  const payColor = order.paymentMethod === 'cod' ? '#16a34a' : '#2563eb';
  const payLabel = order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online';
  const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Invoice ${order.id}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:Arial,sans-serif;color:#1a1a1a;background:#fff;padding:32px;}
.page{max-width:820px;margin:0 auto;}
.header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:20px;border-bottom:3px solid #ff0000;margin-bottom:24px;}
table{width:100%;border-collapse:collapse;margin-bottom:20px;}
th{background:#ff0000;color:white;padding:10px 14px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;}
th:last-child{text-align:right;}
@media print{body{padding:16px;}}
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div>
      <div style="font-size:28px;font-weight:900;color:#ff0000;">YOUTUPIA</div>
      <div style="font-size:11px;color:#666;">Wear Your Dreams · GSTIN: 08CLBPJ3540A1ZP</div>
      <div style="font-size:11px;color:#666;">Jaipur, Rajasthan · youtupiastore@gmail.com</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:28px;font-weight:900;">TAX INVOICE</div>
      <div style="font-family:monospace;font-size:14px;color:#ff0000;font-weight:700;margin-top:4px;">${order.id}</div>
      <div style="font-size:12px;color:#666;margin-top:4px;">${dateStr}</div>
      <div style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;background:${payBg};color:${payColor};margin-top:6px;">${payLabel}</div>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
    <div style="background:#f9f9f9;border-radius:10px;padding:14px;border:1px solid #eee;">
      <div style="font-size:9px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#999;margin-bottom:8px;">Sold By</div>
      <div style="font-size:15px;font-weight:700;margin-bottom:4px;">Youtupia Merchandise LLP</div>
      <div style="font-size:12px;color:#555;line-height:1.6;">64/158 Pratap Nagar, Sanganer<br/>Jaipur, Rajasthan – 302033<br/>GSTIN: 08CLBPJ3540A1ZP</div>
    </div>
    <div style="background:#f9f9f9;border-radius:10px;padding:14px;border:1px solid #eee;">
      <div style="font-size:9px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:#999;margin-bottom:8px;">Bill To</div>
      <div style="font-size:15px;font-weight:700;margin-bottom:4px;">${order.customerName}</div>
      <div style="font-size:12px;color:#555;line-height:1.6;">${order.address}<br/>Phone: ${order.customerPhone}<br/>Email: ${order.customerEmail}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:36px;">#</th>
        <th>Product</th>
        <th style="width:60px;">Size</th>
        <th style="width:50px;text-align:center;">Qty</th>
        <th style="width:100px;">Unit Price</th>
        <th style="width:110px;text-align:right;">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-top:4px;">
    <div style="flex:1;background:#f9f9f9;border-radius:10px;padding:14px;border:1px solid #eee;">
      <div style="font-size:10px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#999;margin-bottom:10px;">GST Breakdown (5%)</div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid #eee;"><span style="color:#666;">Taxable Amount</span><span>&#8377;${baseAmount.toLocaleString('en-IN')}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid #eee;"><span style="color:#666;">CGST @ 2.5%</span><span>&#8377;${cgst.toLocaleString('en-IN')}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid #eee;"><span style="color:#666;">SGST @ 2.5%</span><span>&#8377;${sgst.toLocaleString('en-IN')}</span></div>
      <div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0;font-weight:700;"><span>Total Tax</span><span>&#8377;${gstAmount.toLocaleString('en-IN')}</span></div>
    </div>
    <div style="width:260px;flex-shrink:0;">
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#444;"><span>Subtotal</span><span>&#8377;${subtotal.toLocaleString('en-IN')}</span></div>
      ${order.discountAmount ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#16a34a;"><span>Discount</span><span>-&#8377;${order.discountAmount.toLocaleString('en-IN')}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;"><span>Shipping</span><span style="color:#16a34a;">FREE</span></div>
      ${order.codCharge ? `<div style="display:flex;justify-content:space-between;padding:5px 0;font-size:13px;"><span>COD Handling</span><span>&#8377;${order.codCharge}</span></div>` : ''}
      <div style="display:flex;justify-content:space-between;padding:10px 0;font-size:18px;font-weight:900;color:#ff0000;border-top:2px solid #eee;margin-top:6px;"><span>Grand Total</span><span>&#8377;${order.total.toLocaleString('en-IN')}</span></div>
      ${order.paymentId ? `<div style="font-size:10px;color:#999;margin-top:6px;font-family:monospace;">Txn: ${order.paymentId}</div>` : ''}
    </div>
  </div>

  <div style="background:#fff3f3;border:1px solid #ffcccc;border-radius:8px;padding:10px 14px;margin-top:16px;margin-bottom:16px;">
    <div style="font-size:9px;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;color:#cc0000;margin-bottom:4px;">Amount in Words</div>
    <div style="font-size:12px;color:#7a0000;font-style:italic;">${amountInWords}</div>
  </div>

  <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:20px;padding-top:16px;border-top:2px solid #f0f0f0;">
    <div style="font-size:11px;color:#999;line-height:1.7;max-width:480px;">
      All sales are final. Subject to Jaipur jurisdiction.<br/>
      COMPUTER GENERATED INVOICE — NO SIGNATURE REQUIRED
    </div>
    <div style="text-align:center;">
      <img src="${qrUrl}" alt="QR" style="width:100px;height:100px;border:1px solid #eee;border-radius:8px;padding:4px;" />
    </div>
  </div>
</div>
<script>window.onload=()=>setTimeout(()=>window.print(),600);</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
};

// ── VOTING CONTROL TAB ────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// REPLACE the VotingControlTab const in src/pages/AdminDashboard.tsx
// Find: const VotingControlTab = () => {
// Replace the entire component with this
// ─────────────────────────────────────────────────────────────────────────────

const VotingControlTab = () => {
  const [polls, setPolls] = useState<VotingPoll[]>([]);
  const [options, setOptions] = useState<VotingPollOption[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [tablesReady, setTablesReady] = useState<boolean | null>(null); // null = unknown
  const [creating, setCreating] = useState(false);
  const [expandedPoll, setExpandedPoll] = useState<string | null>(null);
  const [countInputs, setCountInputs] = useState<Record<string, number>>({});
  const [savingCount, setSavingCount] = useState<string | null>(null);
  const [deletingPoll, setDeletingPoll] = useState<string | null>(null);

  const [newPoll, setNewPoll] = useState({
    title: '',
    description: '',
    active: true,
    options: ['', ''],
  });

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/drop-votes');
      if (!res.ok) {
        setTablesReady(false);
        setLoading(false);
        return;
      }
      const data = await res.json();

      // API now returns tablesExist flag
      if (data.tablesExist === false) {
        setTablesReady(false);
        setLoading(false);
        return;
      }

      setTablesReady(true);
      setPolls(data.polls || []);
      setOptions(data.options || []);
      setCounts(data.counts || {});

      const inputs: Record<string, number> = {};
      for (const opt of (data.options || [])) {
        inputs[opt.id] = data.counts?.[opt.id] || 0;
      }
      setCountInputs(inputs);
    } catch {
      setTablesReady(false);
      sonnerToast.error('Failed to load polls');
    }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreatePoll = async () => {
    const validOptions = newPoll.options.filter(o => o.trim());
    if (!newPoll.title.trim()) { sonnerToast.error('Poll title is required'); return; }
    if (validOptions.length < 2) { sonnerToast.error('At least 2 options required'); return; }

    try {
      const res = await fetch('/api/drop-votes?action=create_poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPoll.title.trim(),
          description: newPoll.description.trim(),
          active: newPoll.active,
          options: validOptions,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        sonnerToast.error(e?.error || 'Failed to create poll');
        return;
      }
      sonnerToast.success('Poll created!', { description: newPoll.title });
      setCreating(false);
      setNewPoll({ title: '', description: '', active: true, options: ['', ''] });
      fetchAll();
    } catch {
      sonnerToast.error('Failed to create poll');
    }
  };

  const togglePollActive = async (poll: VotingPoll) => {
    try {
      await fetch('/api/drop-votes?action=update_poll', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId: poll.id, active: !poll.active }),
      });
      setPolls(prev => prev.map(p => p.id === poll.id ? { ...p, active: !p.active } : p));
      sonnerToast.success(poll.active ? 'Poll hidden from public' : 'Poll now visible');
    } catch {
      sonnerToast.error('Failed to update poll');
    }
  };

  const resetPollVotes = async (pollId: string) => {
    if (!confirm('Reset ALL votes for this poll? Cannot be undone.')) return;
    try {
      await fetch('/api/drop-votes?action=reset_poll', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId }),
      });
      setCounts(prev => {
        const next = { ...prev };
        for (const opt of options.filter(o => o.poll_id === pollId)) delete next[opt.id];
        return next;
      });
      sonnerToast.success('Votes reset!');
    } catch {
      sonnerToast.error('Failed to reset votes');
    }
  };

  const deletePoll = async (pollId: string) => {
    if (deletingPoll !== pollId) { setDeletingPoll(pollId); return; }
    try {
      await fetch('/api/drop-votes?action=delete_poll', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId }),
      });
      sonnerToast.success('Poll deleted');
      setDeletingPoll(null);
      fetchAll();
    } catch {
      sonnerToast.error('Failed to delete poll');
    }
  };

  const setManualCount = async (optionId: string, pollId: string) => {
    const count = countInputs[optionId] ?? 0;
    setSavingCount(optionId);
    try {
      await fetch('/api/drop-votes?action=set_count', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId, pollId, count }),
      });
      setCounts(prev => ({ ...prev, [optionId]: count }));
      sonnerToast.success('Count updated globally');
    } catch {
      sonnerToast.error('Failed to update count');
    }
    setSavingCount(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 800, fontSize: '22px', color: '#f1f5f9', margin: '0 0 4px' }}>Voting Control</h1>
          <p style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b' }}>
            Create custom polls, manage options, and control vote counts globally.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#94a3b8', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer' }}>
            <RefreshCw size={12} /> Refresh
          </button>
          {tablesReady && (
            <button onClick={() => setCreating(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <Plus size={14} /> New Poll
            </button>
          )}
        </div>
      </div>

      {/* Tables not ready — show setup instructions */}
      {tablesReady === false && (
        <div style={{ ...card, padding: '28px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <AlertCircle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>Voting tables not found</div>
              <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Run the SQL file in Supabase to create them, then click Refresh.</div>
            </div>
          </div>
          <div style={{ background: 'hsl(0 0% 7%)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ ...label, marginBottom: '10px', color: '#60a5fa' }}>REQUIRED TABLES (create via supabase_complete.sql)</div>
            <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#94a3b8', lineHeight: 1.8 }}>
              <div>• <span style={{ color: '#60a5fa' }}>yt_polls</span> — poll titles and active status</div>
              <div>• <span style={{ color: '#60a5fa' }}>yt_poll_options</span> — options per poll</div>
              <div>• <span style={{ color: '#60a5fa' }}>yt_votes</span> — individual votes</div>
            </div>
          </div>
          <button onClick={fetchAll} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '8px', border: 'none', background: '#3b82f6', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <RefreshCw size={14} /> Check Again
          </button>
        </div>
      )}

      {/* Tables exist — show controls */}
      {tablesReady && creating && (
        <div style={{ ...card, padding: '22px', marginBottom: '20px', border: '1px solid rgba(255,0,0,0.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '16px', color: '#f1f5f9' }}>New Poll</div>
            <button onClick={() => setCreating(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div>
              <div style={{ ...label, marginBottom: '6px' }}>POLL TITLE *</div>
              <input style={inputStyle} value={newPoll.title} onChange={e => setNewPoll(f => ({ ...f, title: e.target.value }))} placeholder="Vote for next drop category" />
            </div>
            <div>
              <div style={{ ...label, marginBottom: '6px' }}>DESCRIPTION (optional)</div>
              <input style={inputStyle} value={newPoll.description} onChange={e => setNewPoll(f => ({ ...f, description: e.target.value }))} placeholder="Help us decide what to drop next" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <button
              onClick={() => setNewPoll(f => ({ ...f, active: !f.active }))}
              style={{ width: '38px', height: '22px', borderRadius: '11px', background: newPoll.active ? '#ff0000' : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
            >
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: newPoll.active ? '18px' : '2px', transition: 'left 0.2s' }} />
            </button>
            <span style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: newPoll.active ? '#4ade80' : '#64748b' }}>
              {newPoll.active ? 'Visible to public immediately' : 'Hidden (draft)'}
            </span>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ ...label, marginBottom: '8px' }}>POLL OPTIONS * (min 2)</div>
            {newPoll.options.map((opt, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,0,0,0.12)', border: '1px solid rgba(255,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#ff6666', flexShrink: 0 }}>{i + 1}</div>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  value={opt}
                  onChange={e => { const opts = [...newPoll.options]; opts[i] = e.target.value; setNewPoll(f => ({ ...f, options: opts })); }}
                  placeholder={`Option ${i + 1}`}
                />
                {newPoll.options.length > 2 && (
                  <button
                    onClick={() => { const opts = newPoll.options.filter((_, idx) => idx !== i); setNewPoll(f => ({ ...f, options: opts })); }}
                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: '#f87171', flexShrink: 0 }}
                  ><X size={12} /></button>
                )}
              </div>
            ))}
            <button
              onClick={() => setNewPoll(f => ({ ...f, options: [...f.options, ''] }))}
              style={{ padding: '6px 14px', borderRadius: '6px', border: '1px dashed rgba(255,255,255,0.12)', background: 'transparent', color: '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer', marginTop: '4px' }}
            >
              + Add option
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={handleCreatePoll}
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={13} /> Create Poll
            </button>
            <button
              onClick={() => setCreating(false)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '13px', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#475569', fontFamily: 'Roboto, sans-serif' }}>Loading polls...</div>
      ) : tablesReady && polls.length === 0 ? (
        <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🗳️</div>
          <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '14px', color: '#64748b' }}>No polls yet. Create your first poll above.</div>
        </div>
      ) : tablesReady ? polls.map(poll => {
        const pollOpts = options.filter(o => o.poll_id === poll.id);
        const pollTotal = pollOpts.reduce((s, o) => s + (counts[o.id] || 0), 0);
        const isExpanded = expandedPoll === poll.id;

        return (
          <div key={poll.id} style={{ ...card, marginBottom: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => setExpandedPoll(isExpanded ? null : poll.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '15px', color: '#f1f5f9' }}>{poll.title}</span>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', background: poll.active ? 'rgba(74,222,128,0.1)' : 'rgba(100,116,139,0.1)', color: poll.active ? '#4ade80' : '#64748b' }}>
                    {poll.active ? 'LIVE' : 'HIDDEN'}
                  </span>
                </div>
                {poll.description && (
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#64748b' }}>{poll.description}</div>
                )}
                <div style={{ fontFamily: 'monospace', fontSize: '10px', color: 'rgba(148,163,184,0.55)', letterSpacing: '0.08em', marginTop: '4px' }}>
                  {pollOpts.length} options · {pollTotal.toLocaleString()} votes · {isExpanded ? '▲ collapse' : '▼ expand'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, alignItems: 'center' }}>
                <button
                  onClick={() => togglePollActive(poll)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', border: `1px solid ${poll.active ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`, background: poll.active ? 'rgba(74,222,128,0.08)' : 'transparent', color: poll.active ? '#4ade80' : '#64748b', fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {poll.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {poll.active ? 'Live' : 'Hidden'}
                </button>
                <button
                  onClick={() => resetPollVotes(poll.id)}
                  style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid rgba(251,191,36,0.25)', background: 'rgba(251,191,36,0.06)', color: '#fbbf24', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer' }}
                >
                  Reset Votes
                </button>
                {deletingPoll === poll.id ? (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => deletePoll(poll.id)}
                      style={{ padding: '6px 10px', borderRadius: '7px', border: 'none', background: '#ef4444', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setDeletingPoll(null)}
                      style={{ padding: '6px 8px', borderRadius: '7px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '11px' }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => deletePoll(poll.id)}
                    style={{ padding: '6px 12px', borderRadius: '7px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', fontFamily: 'Roboto, sans-serif', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                )}
              </div>
            </div>

            {isExpanded && (
              <div style={{ padding: '16px 20px' }}>
                <div style={{ ...label, marginBottom: '12px' }}>VOTE COUNTS — set manually to seed data</div>
                {pollOpts.length === 0 ? (
                  <div style={{ fontFamily: 'Roboto, sans-serif', fontSize: '13px', color: '#475569' }}>No options found.</div>
                ) : pollOpts.map(opt => {
                  const voteCount = counts[opt.id] || 0;
                  const pct = pollTotal > 0 ? Math.round((voteCount / pollTotal) * 100) : 0;
                  return (
                    <div key={opt.id} style={{ ...card, padding: '12px 14px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700, fontSize: '13px', color: '#f1f5f9', marginBottom: '6px' }}>{opt.label}</div>
                          <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#ff0000,#ff6b6b)', borderRadius: '3px', transition: 'width 0.4s' }} />
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: '10px', color: '#475569', marginTop: '4px' }}>
                            {pct}% — {voteCount.toLocaleString()} votes
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                          <input
                            type="number"
                            min={0}
                            value={countInputs[opt.id] ?? voteCount}
                            onChange={e => setCountInputs(prev => ({ ...prev, [opt.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                            style={{ width: '80px', padding: '6px 10px', background: 'hsl(0 0% 7%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#f1f5f9', fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: 700, textAlign: 'center', outline: 'none' }}
                          />
                          <button
                            onClick={() => setManualCount(opt.id, poll.id)}
                            disabled={savingCount === opt.id}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: savingCount === opt.id ? '#16a34a' : '#ff0000', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.25s' }}
                          >
                            {savingCount === opt.id ? '✓' : 'Set'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: '10px', fontFamily: 'Roboto, sans-serif', fontSize: '12px', color: '#60a5fa' }}>
                  💡 Setting a count replaces all votes for that option with seeded data globally.
                </div>
              </div>
            )}
          </div>
        );
      }) : null}
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
        {tab === 'voting' && <VotingControlTab />}
      </main>
    </div>
  );
};

export default AdminDashboard;
