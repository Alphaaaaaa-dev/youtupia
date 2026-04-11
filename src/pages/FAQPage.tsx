import { useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const FAQS = [
  { cat: 'Orders', q: 'What sizes are available?', a: 'Most products come in S, M, L, XL, and XXL. Some accessories are one size. Always check the individual product page — sizes with low or zero stock are clearly marked.' },
  { cat: 'Orders', q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll get a tracking link via email. You can also check your order status in My Orders after signing in.' },
  { cat: 'Orders', q: 'Can I cancel my order?', a: 'Orders can be cancelled within 2 hours of placing them. After that the order goes into processing and cannot be cancelled. Email us ASAP at youtupiastore@gmail.com.' },
  { cat: 'Shipping', q: 'How long does delivery take?', a: 'Standard delivery takes 8–14 business days across India. Orders are dispatched within 1–2 business days of payment.' },
  { cat: 'Shipping', q: 'Do you offer free shipping?', a: 'Yes! We offer free shipping on all orders.' },
  { cat: 'Shipping', q: 'Do you ship internationally?', a: 'Currently India only. International shipping is on the roadmap — follow our Instagram for updates.' },
  { cat: 'Returns', q: 'What is your return policy?', a: 'Returns are accepted only in case of genuine errors from our side (like damaged or incorrect products). For any issues, contact us at youtupiastore@gmail.com.' },
  { cat: 'Payments', q: 'Is my payment secure?', a: 'Yes — we use Razorpay, one of India\'s most trusted gateways. We never store your card details. All transactions are encrypted.' },
  { cat: 'Products', q: 'Are the products limited edition?', a: 'Yes, every drop is limited. We don\'t do restocks — when a size is gone, it\'s gone. That\'s kind of the whole point.' },
];

const FAQPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('All');
  const cats = ['All', ...Array.from(new Set(FAQS.map(f => f.cat)))];

  const filtered = FAQS.filter(f => {
    const matchCat = activeCat === 'All' || f.cat === activeCat;
    const matchSearch = !search || f.q.toLowerCase().includes(search.toLowerCase()) || f.a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ paddingTop: '0px' }}>
      {/* Header */}
      <div style={{ background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', borderBottom: '1px solid hsl(var(--border))', padding: '56px 24px', textAlign: 'center' }}>
        <div className="page-enter">
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Support</div>
          <h1 style={{ fontSize: '38px', fontWeight: 900, marginBottom: '14px', letterSpacing: '-0.02em' }}>FAQs</h1>
          <p style={{ fontSize: '16px', color: 'hsl(var(--muted-foreground))', marginBottom: '28px' }}>Got questions? We've got answers.</p>
          {/* Search */}
          <div style={{ maxWidth: '440px', margin: '0 auto', position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--muted-foreground))' }} />
            <input type="text" placeholder="Search questions..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 16px 12px 40px', background: isDark ? 'hsl(0 0% 9%)' : 'white', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s, box-shadow 0.2s' }}
              onFocus={e => { e.target.style.borderColor = '#ff0000'; e.target.style.boxShadow = '0 0 0 3px rgba(255,0,0,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'hsl(var(--border))'; e.target.style.boxShadow = 'none'; }} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 64px' }}>
        {/* Category pills */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {cats.map(c => (
            <button key={c} onClick={() => setActiveCat(c)} className={`yt-chip ${activeCat === c ? 'active' : ''}`} style={{ fontSize: '13px' }}>{c}</button>
          ))}
        </div>

        {/* FAQ items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: 'hsl(var(--muted-foreground))' }}>
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤔</div>
              <p>No results found. <button onClick={() => { setSearch(''); setActiveCat('All'); }} style={{ background: 'none', border: 'none', color: '#ff0000', cursor: 'pointer', fontWeight: 600 }}>Clear filters</button></p>
            </div>
          ) : filtered.map((faq, i) => (
            <div key={i} style={{ background: 'hsl(var(--card))', border: `1px solid ${open === i ? 'rgba(255,0,0,0.2)' : 'hsl(var(--border))'}`, borderRadius: '14px', overflow: 'hidden', transition: 'border-color 0.2s, box-shadow 0.2s', boxShadow: open === i ? '0 4px 20px rgba(0,0,0,0.1)' : 'none' }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', textAlign: 'left', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, color: '#ff0000', background: 'rgba(255,0,0,0.08)', padding: '3px 7px', borderRadius: '4px', letterSpacing: '0.06em', flexShrink: 0 }}>{faq.cat.toUpperCase()}</span>
                  <span style={{ fontWeight: 600, fontSize: '14px', lineHeight: 1.4 }}>{faq.q}</span>
                </div>
                <ChevronDown size={16} style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)', color: open === i ? '#ff0000' : 'hsl(var(--muted-foreground))', flexShrink: 0 }} />
              </button>
              <div style={{ maxHeight: open === i ? '300px' : '0', overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.22,1,0.36,1)' }}>
                <div style={{ padding: '0 20px 18px 20px', paddingLeft: '20px' }}>
                  <div style={{ height: '1px', background: 'hsl(var(--border))', marginBottom: '14px' }} />
                  <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.75, margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Still stuck? */}
        <div style={{ marginTop: '40px', background: isDark ? 'hsl(0 0% 7%)' : 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '28px', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>💬</div>
          <h3 style={{ fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>Still need help?</h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '20px' }}>Our team responds within 24 hours on weekdays.</p>
          <Link to="/contact" className="btn-yt" style={{ textDecoration: 'none', borderRadius: '10px', display: 'inline-flex' }}>Contact Support</Link>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
