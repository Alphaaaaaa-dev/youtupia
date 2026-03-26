import { useState } from 'react';
import { Mail, Phone, Instagram, MessageSquare, Send } from 'lucide-react';

const ContactSupportPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div style={{ paddingTop: '56px', maxWidth: '1000px', margin: '0 auto', padding: '72px 24px 48px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Contact Us</h1>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '40px' }}>We usually respond within 24 hours.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Get in Touch</h2>
          {[
            { icon: Mail, label: 'Email', value: 'hello@youtupia.com', href: 'mailto:hello@youtupia.com' },
            { icon: Phone, label: 'WhatsApp', value: '+91 00000 00000', href: 'https://wa.me/910000000000' },
            { icon: Instagram, label: 'Instagram', value: '@youtupia', href: 'https://instagram.com/youtupia' },
          ].map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color: '#ff0000' }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px' }}>{label}</div>
                <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px' }}>{value}</div>
              </div>
            </a>
          ))}

          <div style={{ background: 'hsl(var(--secondary))', borderRadius: '12px', padding: '16px', marginTop: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={14} style={{ color: '#ff0000' }} /> Connect with Youtupia</h3>
            <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.7 }}>
              Want to stay updated on new drops, exclusive releases, and discount codes? Subscribe to our newsletter.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input type="email" placeholder="Your email" style={{ flex: 1, padding: '8px 12px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none' }} />
              <button className="btn-yt" style={{ borderRadius: '8px', padding: '8px 14px', fontSize: '13px' }}>Join</button>
            </div>
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Send a Message</h2>
          <form onSubmit={handleSubmit}>
            {[['name', 'Name', 'text'], ['email', 'Email', 'email'], ['subject', 'Subject', 'text']].map(([key, label, type]) => (
              <div key={key} style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'hsl(var(--muted-foreground))' }}>{label}</label>
                <input type={type} required value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }} />
              </div>
            ))}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: 'hsl(var(--muted-foreground))' }}>Message</label>
              <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                style={{ width: '100%', padding: '10px 14px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' as const }} />
            </div>
            <button type="submit" className="btn-yt" style={{ width: '100%', justifyContent: 'center', borderRadius: '8px', padding: '12px', fontSize: '14px', gap: '8px' }}>
              <Send size={14} /> {sent ? '✓ Message Sent!' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ContactSupportPage;
