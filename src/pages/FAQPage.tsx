import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  { q: 'What sizes are available?', a: 'Most products come in S, M, L, XL, and XXL. Some accessories are one-size-fits-all. Always check the individual product page for exact size availability and stock.' },
  { q: 'How do I track my order?', a: 'Once your order is shipped, you\'ll receive a tracking link via email. You can also check your order status in the My Orders section after logging in.' },
  { q: 'What is your return policy?', a: 'We accept returns within 7 days of delivery. The item must be unused and in original condition. Drop us an email at hello@youtupia.com to initiate a return.' },
  { q: 'How long does delivery take?', a: 'Standard delivery takes 5-7 business days across India. Express options may be available at checkout for select pincodes.' },
  { q: 'Is the payment secure?', a: 'Yes! We use Razorpay, one of India\'s most trusted payment gateways. We never store your card details.' },
  { q: 'Do you ship internationally?', a: 'Currently we only ship within India. International shipping is something we\'re working on — stay tuned.' },
  { q: 'Are the products limited edition?', a: 'Yes! Each series has limited stock. Once a size sells out, it may not be restocked. We recommend grabbing your size early.' },
  { q: 'Can I cancel my order?', a: 'Orders can be cancelled within 2 hours of placement. After that, the order moves to processing and cannot be cancelled. Contact us ASAP if you need to cancel.' },
];

const FAQPage = () => {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ paddingTop: '56px', maxWidth: '720px', margin: '0 auto', padding: '72px 24px 48px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>FAQs</h1>
      <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '32px' }}>Got questions? We've got answers.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '12px', overflow: 'hidden' }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--foreground))', fontFamily: 'Roboto, sans-serif', textAlign: 'left', gap: '12px' }}>
              <span style={{ fontWeight: 600, fontSize: '14px' }}>{faq.q}</span>
              <ChevronDown size={16} style={{ transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, color: open === i ? '#ff0000' : 'hsl(var(--muted-foreground))' }} />
            </button>
            {open === i && (
              <div style={{ padding: '0 20px 16px', fontSize: '14px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.7 }}>{faq.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
export default FAQPage;
