import { useState } from 'react';
import { Mail, Phone, Instagram, MessageSquare, Send, Clock, MapPin } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ContactSupportPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 5000);
  };

  const contactCards = [
    { icon: Mail, label: 'Email Us', value: 'hello@youtupia.com', sub: 'Response within 24 hrs', href: 'mailto:hello@youtupia.com', color: '#ff0000' },
    { icon: Phone, label: 'WhatsApp', value: '+91 00000 00000', sub: 'Mon–Sat, 10am–8pm IST', href: 'https://wa.me/910000000000', color: '#25D366' },
    { icon: Instagram, label: 'Instagram', value: '@youtupia', sub: 'DMs open for collabs', href: 'https://instagram.com/youtupia', color: '#E1306C' },
    { icon: Clock, label: 'Support Hours', value: '10am – 8pm', sub: 'Monday to Saturday', href: '#', color: '#ff0000' },
  ];

  return (
    <div style={{ paddingTop: '56px' }}>
      {/* Header */}
      <div style={{ background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', borderBottom: '1px solid hsl(var(--border))', padding: '48px 24px', textAlign: 'center' }}>
        <div className="page-enter">
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Get in Touch</div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>Contact Us</h1>
          <p style={{ fontSize: '16px', color: 'hsl(var(--muted-foreground))', maxWidth: '440px', margin: '0 auto', lineHeight: 1.7 }}>We're real people, not bots. Questions, collabs, feedback — hit us up.</p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 64px' }}>
        {/* Contact cards */}
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '48px' }}>
          {contactCards.map(({ icon: Icon, label, value, sub, href, color }) => (
            <a key={label} href={href} target={href !== '#' ? '_blank' : undefined} rel="noreferrer"
              style={{ textDecoration: 'none', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, box-shadow 0.2s', cursor: href === '#' ? 'default' : 'pointer' }}
              onMouseEnter={e => { if (href !== '#') { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.15)`; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'hsl(var(--border))'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'hsl(var(--muted-foreground))', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'hsl(var(--foreground))' }}>{value}</div>
                <div style={{ fontSize: '11px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>{sub}</div>
              </div>
            </a>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {/* Newsletter */}
          <div>
            <div style={{ background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)', borderRadius: '20px', padding: '32px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
              <MessageSquare size={28} style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '14px' }} />
              <h3 style={{ color: 'white', fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>Connect with Youtupia</h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px' }}>Get early access to drops, exclusive discount codes, and community updates.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none' }} />
                <button onClick={() => { if (email) { setEmailSent(true); setEmail(''); setTimeout(() => setEmailSent(false), 3000); } }}
                  style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'white', color: '#ff0000', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'transform 0.15s', flexShrink: 0 }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                  {emailSent ? '✓' : 'Join'}
                </button>
              </div>
            </div>

            {/* FAQ quick links */}
            <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Quick Answers</h3>
              {[
                'How do I track my order?',
                'What is the return policy?',
                'How long does delivery take?',
                'Are payments secure?',
              ].map(q => (
                <a key={q} href="/faq" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid hsl(var(--border))', textDecoration: 'none', color: 'hsl(var(--foreground))', fontSize: '13px', transition: 'color 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ff0000')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'hsl(var(--foreground))')}>
                  {q} <span style={{ fontSize: '16px' }}>›</span>
                </a>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '20px', padding: '32px' }}>
            <h2 style={{ fontWeight: 800, fontSize: '20px', marginBottom: '6px' }}>Send a Message</h2>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '24px' }}>We reply within 24 hours on weekdays.</p>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                {[['name', 'Name', 'text', 'John Doe'], ['email', 'Email', 'email', 'john@example.com']].map(([key, label, type, ph]) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
                    <input type={type} required placeholder={ph} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px 14px', background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                      onFocus={e => (e.target.style.borderColor = '#ff0000')}
                      onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
                  </div>
                ))}
              </div>
              {[['subject', 'Subject', 'text', 'Order inquiry...']].map(([key, label, type, ph]) => (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</label>
                  <input type={type} required placeholder={ph} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                    onFocus={e => (e.target.style.borderColor = '#ff0000')}
                    onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
                </div>
              ))}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: 'hsl(var(--muted-foreground))', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Message</label>
                <textarea required rows={5} placeholder="Tell us what's up..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={e => (e.target.style.borderColor = '#ff0000')}
                  onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
              </div>
              <button type="submit" disabled={loading} className="btn-yt ripple"
                style={{ width: '100%', justifyContent: 'center', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 700, gap: '8px', background: sent ? '#16a34a' : '#ff0000', transition: 'background 0.3s', opacity: loading ? 0.7 : 1 }}>
                <Send size={15} />
                {sent ? '✓ Message Sent!' : loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactSupportPage;
