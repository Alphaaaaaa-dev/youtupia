import { useState } from 'react';
import { Mail, Instagram, MessageSquare, Send, Clock, ExternalLink, Handshake, Twitter } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

type TabId = 'support' | 'social' | 'collab';

const ContactSupportPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<TabId>('support');
  const [form, setForm] = useState({ name: '', email: '', category: 'GENERAL INQUIRY', subject: '', message: '' });
  const [collabForm, setCollabForm] = useState({ name: '', channel: '', subscribers: '', email: '', pitch: '' });
  const [sent, setSent] = useState(false);
  const [collabSent, setCollabSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/submit-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          category: form.category,
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }
      setSent(true);
      setForm({ name: '', email: '', category: 'GENERAL INQUIRY', subject: '', message: '' });
      setTimeout(() => setSent(false), 6000);
    } catch {
      setSubmitError('Connection error. Please check your internet and try again.');
    }
    setLoading(false);
  };

  const handleCollabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setCollabSent(true);
    setLoading(false);
    setCollabForm({ name: '', channel: '', subscribers: '', email: '', pitch: '' });
    setTimeout(() => setCollabSent(false), 5000);
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    background: isDark ? 'hsl(0 0% 8%)' : 'hsl(var(--secondary))',
    border: '1px solid hsl(var(--border))', borderRadius: '8px',
    color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  };
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px',
    color: 'hsl(var(--muted-foreground))', letterSpacing: '0.06em', textTransform: 'uppercase' as const,
  };

  const tabs: { id: TabId; label: string; emoji: string }[] = [
    { id: 'support', label: 'Customer Support', emoji: '🙋' },
    { id: 'social', label: 'Social & Connect', emoji: '📲' },
    { id: 'collab', label: 'Creator Collab', emoji: '🤝' },
  ];

  // Social links — only Instagram and Twitter/X shown
  const socialLinks = [
    { icon: Instagram, label: 'Instagram', handle: '@_youtupia_', sub: 'Follow for drops & behind the scenes', href: 'https://www.instagram.com/_youtupia_', color: '#E1306C', bg: 'rgba(225,48,108,0.1)' },
    { icon: Twitter, label: 'Twitter / X', handle: '@_youtupia_', sub: 'Latest news, restocks & announcements', href: 'https://twitter.com/_youtupia_', color: '#1DA1F2', bg: 'rgba(29,161,242,0.1)' },
    { icon: Mail, label: 'Email Support', handle: 'youtupiastore@gmail.com', sub: 'Response within 24 hrs', href: 'mailto:youtupiastore@gmail.com', color: '#ff0000', bg: 'rgba(255,0,0,0.1)' },
  ];

  return (
    <div style={{ paddingTop: '0px' }}>
      {/* Header */}
      <div style={{ background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', borderBottom: '1px solid hsl(var(--border))', padding: '48px 24px 0', textAlign: 'center' }}>
        <div className="page-enter">
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>Get in Touch</div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>Contact Us</h1>
          <p style={{ fontSize: '16px', color: 'hsl(var(--muted-foreground))', maxWidth: '440px', margin: '0 auto 32px', lineHeight: 1.7 }}>We're real people, not bots. Questions, collabs, feedback — hit us up.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', paddingBottom: '0' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding: '12px 22px', border: 'none', cursor: 'pointer', fontFamily: 'Roboto, sans-serif', fontSize: '14px', fontWeight: activeTab === tab.id ? 700 : 500, background: 'transparent', color: activeTab === tab.id ? '#ff0000' : 'hsl(var(--muted-foreground))', borderBottom: `3px solid ${activeTab === tab.id ? '#ff0000' : 'transparent'}`, transition: 'all 0.2s', gap: '6px', display: 'inline-flex', alignItems: 'center' }}>
              <span>{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 64px' }}>

        {/* ── SUPPORT TAB ── */}
        {activeTab === 'support' && (
          <div className="fade-in">
            {/* Contact cards — no WhatsApp */}
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '48px' }}>
              {[
                { icon: Mail, label: 'Email Us', value: 'youtupiastore@gmail.com', sub: 'Response within 24 hrs', href: 'mailto:youtupiastore@gmail.com', color: '#ff0000' },
                { icon: Instagram, label: 'Instagram', value: '@_youtupia_', sub: 'DMs open for support', href: 'https://www.instagram.com/_youtupia_', color: '#E1306C' },
                { icon: Clock, label: 'Support Hours', value: '10am – 8pm', sub: 'Monday to Saturday', href: '#', color: '#f59e0b' },
              ].map(({ icon: Icon, label, value, sub, href, color }) => (
                <a key={label} href={href} target={href !== '#' ? '_blank' : undefined} rel="noreferrer"
                  style={{ textDecoration: 'none', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.2s, box-shadow 0.2s', cursor: href === '#' ? 'default' : 'pointer' }}
                  onMouseEnter={e => { if (href !== '#') { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = color + '40'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'; } }}
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
              {/* Newsletter + FAQ */}
              <div>
                <div style={{ background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)', borderRadius: '20px', padding: '32px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
                  <MessageSquare size={28} style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '14px' }} />
                  <h3 style={{ color: 'white', fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>Get Early Access</h3>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px' }}>Exclusive drops, discount codes, and community updates — before anyone else.</p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)}
                      style={{ flex: 1, padding: '10px 14px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', color: 'white', fontFamily: 'Roboto, sans-serif', fontSize: '13px', outline: 'none' }} />
                    <button onClick={() => { if (email) { setEmailSent(true); setEmail(''); setTimeout(() => setEmailSent(false), 3000); } }}
                      style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', background: 'white', color: '#ff0000', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'transform 0.15s', flexShrink: 0 }}
                      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                      onMouseLeave={e => (e.currentTarget.style.transform = 'none')}>
                      {emailSent ? '✓ Done!' : 'Join'}
                    </button>
                  </div>
                </div>
                <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '20px', padding: '24px' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>Quick Answers</h3>
                  {['How do I track my order?', 'What is the return policy?', 'How long does delivery take?', 'Are payments secure?'].map(q => (
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
                    {[['name', 'Name', 'text', 'John Doe'], ['email', 'Email', 'email', 'john@example.com']].map(([key, lbl, type, ph]) => (
                      <div key={key}>
                        <label style={labelStyle}>{lbl}</label>
                        <input type={type} required placeholder={ph} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                          style={inputStyle}
                          onFocus={e => (e.target.style.borderColor = '#ff0000')}
                          onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      style={{ ...inputStyle, cursor: 'pointer' }}
                    >
                      {['GENERAL INQUIRY', 'ORDER ISSUE', 'RETURN / REFUND', 'PAYMENT ISSUE', 'PRODUCT FEEDBACK', 'OTHER'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={labelStyle}>Subject</label>
                    <input type="text" required placeholder="Order inquiry..." value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      style={inputStyle} onFocus={e => (e.target.style.borderColor = '#ff0000')} onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Message</label>
                    <textarea required rows={5} placeholder="Tell us what's up..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      style={{ ...inputStyle, resize: 'vertical' }}
                      onFocus={e => (e.target.style.borderColor = '#ff0000')} onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
                  </div>
                  <button type="submit" disabled={loading} className="btn-yt ripple"
                    style={{ width: '100%', justifyContent: 'center', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 700, gap: '8px', background: sent ? '#16a34a' : '#ff0000', transition: 'background 0.3s', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center' }}>
                    <Send size={15} />
                    {sent ? '✓ Message Sent!' : loading ? 'Sending...' : 'Send Message'}
                  </button>
                  {submitError && (
                    <div style={{ marginTop: '10px', fontSize: '13px', color: '#f87171', textAlign: 'center' }}>
                      {submitError}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ── SOCIAL TAB ── */}
        {activeTab === 'social' && (
          <div className="fade-in">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Find Us Everywhere</h2>
              <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>Follow for drop announcements, exclusive previews, BTS content, and community vibes.</p>
            </div>
            <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '48px' }}>
              {socialLinks.map(({ icon: Icon, label, handle, sub, href, color, bg }) => (
                <a key={label} href={href} target={href !== '#' ? '_blank' : undefined} rel="noreferrer"
                  style={{ textDecoration: 'none', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '18px', padding: '28px', display: 'flex', alignItems: 'center', gap: '18px', transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s, border-color 0.2s', cursor: href === '#' ? 'default' : 'pointer' }}
                  onMouseEnter={e => { if (href !== '#') { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.2)`; e.currentTarget.style.borderColor = color + '50'; } }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'hsl(var(--border))'; }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={26} style={{ color }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '15px', marginBottom: '3px' }}>{label}</div>
                    <div style={{ fontSize: '13px', color, fontWeight: 600, marginBottom: '3px' }}>{handle}</div>
                    <div style={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}>{sub}</div>
                  </div>
                  {href !== '#' && <ExternalLink size={14} style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }} />}
                </a>
              ))}
            </div>

            {/* Community CTA */}
            <div style={{ background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)', borderRadius: '20px', padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
              <div>
                <h3 style={{ color: 'white', fontWeight: 900, fontSize: '22px', marginBottom: '8px' }}>Join the Youtupia Community</h3>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', maxWidth: '400px', lineHeight: 1.6 }}>Be part of the movement — get early access to drops, vote on next collections, and rep the culture.</p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', position: 'relative' }}>
                <a href="https://www.instagram.com/_youtupia_" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', color: '#E1306C', textDecoration: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '14px' }}>
                  <Instagram size={16} /> Instagram
                </a>
                <a href="https://twitter.com/_youtupia_" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '14px', border: '1px solid rgba(255,255,255,0.3)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  X / Twitter
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── COLLAB TAB ── */}
        {activeTab === 'collab' && (
          <div className="fade-in">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
              {/* Left: info */}
              <div>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#ff0000', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '10px' }}>For Creators</div>
                  <h2 style={{ fontSize: '26px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>Want Your Own Merch Drop?</h2>
                  <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '14px', lineHeight: 1.8, marginBottom: '20px' }}>
                    We partner with YouTube creators of all sizes to design, produce, and sell exclusive limited merch drops. Zero upfront cost — we handle everything from design to delivery.
                  </p>
                </div>

                {[
                  { emoji: '🎨', title: 'Custom Designs', desc: 'Our design team works with you to create merch that matches your brand and aesthetic.' },
                  { emoji: '📦', title: 'We Handle Everything', desc: 'Production, inventory, payments, shipping — fully managed by Youtupia.' },
                  { emoji: '💰', title: 'Revenue Share', desc: 'You earn a % on every sale. More merch sold = more money for you.' },
                  { emoji: '🚀', title: 'Limited Drop Hype', desc: 'Exclusive, time-limited drops create scarcity and drive higher conversions.' },
                ].map(item => (
                  <div key={item.title} style={{ display: 'flex', gap: '14px', marginBottom: '20px', padding: '18px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '14px', transition: 'border-color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,0,0,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'hsl(var(--border))')}>
                    <span style={{ fontSize: '24px', flexShrink: 0, lineHeight: 1 }}>{item.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}

                <div style={{ padding: '16px 20px', background: 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.12)', borderRadius: '12px', fontSize: '13px', color: 'hsl(var(--muted-foreground))' }}>
                  📧 For urgent collab enquiries: <a href="mailto:connectyoutupia@gmail.com" style={{ color: '#ff0000', textDecoration: 'none', fontWeight: 700 }}>connectyoutupia@gmail.com</a>
                </div>
              </div>

              {/* Right: collab form */}
              <div style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '20px', padding: '32px', position: 'sticky', top: '80px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Handshake size={20} style={{ color: '#ff0000' }} />
                  <h2 style={{ fontWeight: 800, fontSize: '20px', margin: 0 }}>Apply to Collab</h2>
                </div>
                <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '24px' }}>Fill this out and our team will reach out within 48 hours.</p>

                {collabSent ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                    <h3 style={{ fontWeight: 800, fontSize: '18px', marginBottom: '8px' }}>Application Received!</h3>
                    <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '13px' }}>We'll review your profile and get back to you within 48 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleCollabSubmit}>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={labelStyle}>Your Name *</label>
                      <input required placeholder="Creator name / real name" value={collabForm.name} onChange={e => setCollabForm(f => ({ ...f, name: e.target.value }))}
                        style={inputStyle} onFocus={e => (e.target.style.borderColor = '#ff0000')} onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                      <label style={labelStyle}>YouTube Channel URL *</label>
                      <input required placeholder="https://youtube.com/@yourchannel" value={collabForm.channel} onChange={e => setCollabForm(f => ({ ...f, channel: e.target.value }))}
                        style={inputStyle} onFocus={e => (e.target.style.borderColor = '#ff0000')} onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                      <div>
                        <label style={labelStyle}>Subscribers</label>
                        <input placeholder="e.g. 50K" value={collabForm.subscribers} onChange={e => setCollabForm(f => ({ ...f, subscribers: e.target.value }))}
                          style={inputStyle} onFocus={e => (e.target.style.borderColor = '#ff0000')} onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
                      </div>
                      <div>
                        <label style={labelStyle}>Business Email *</label>
                        <input required type="email" placeholder="you@email.com" value={collabForm.email} onChange={e => setCollabForm(f => ({ ...f, email: e.target.value }))}
                          style={inputStyle} onFocus={e => (e.target.style.borderColor = '#ff0000')} onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={labelStyle}>Your Pitch / Merch Idea</label>
                      <textarea rows={4} placeholder="Tell us your vision — audience, style, what makes your community unique..." value={collabForm.pitch} onChange={e => setCollabForm(f => ({ ...f, pitch: e.target.value }))}
                        style={{ ...inputStyle, resize: 'vertical' }}
                        onFocus={e => (e.target.style.borderColor = '#ff0000')} onBlur={e => (e.target.style.borderColor = 'hsl(var(--border))')} />
                    </div>
                    <button type="submit" disabled={loading} className="btn-yt ripple"
                      style={{ width: '100%', justifyContent: 'center', borderRadius: '10px', padding: '13px', fontSize: '14px', fontWeight: 700, gap: '8px', display: 'flex', alignItems: 'center', opacity: loading ? 0.7 : 1 }}>
                      <Send size={15} />
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSupportPage;
