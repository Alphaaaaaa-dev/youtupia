import { Shield, RefreshCw, Truck, Lock } from 'lucide-react';

const sections = [
  {
    icon: Shield,
    title: 'Privacy Policy',
    content: `We collect only the information necessary to process your orders: name, email, phone, and delivery address. This data is never sold to third parties. Payment details are handled entirely by Razorpay and never stored on our servers. By using Youtupia, you consent to this data collection for order fulfillment purposes only.`
  },
  {
    icon: RefreshCw,
    title: 'Returns & Refunds',
    content: `We accept returns within 7 days of delivery. Items must be unused, unwashed, and in original packaging. To initiate a return, email hello@youtupia.com with your order ID and reason. Refunds are processed within 5-7 business days to your original payment method. Sale items and accessories are non-returnable unless defective.`
  },
  {
    icon: Truck,
    title: 'Shipping Policy',
    content: `Standard delivery: 5-7 business days across India. Free shipping on orders above ₹999. Orders below ₹999 incur a ₹60 shipping fee. Orders are dispatched within 1-2 business days of payment confirmation. Once shipped, you'll receive a tracking link via email. We are not responsible for delays caused by courier partners or natural events.`
  },
  {
    icon: Lock,
    title: 'Terms of Service',
    content: `By placing an order on Youtupia, you agree that all products are for personal use only. Reselling Youtupia merchandise without written permission is prohibited. We reserve the right to cancel orders that appear fraudulent. Prices are subject to change without notice. All disputes are subject to jurisdiction in India.`
  },
];

const PolicyPage = () => (
  <div style={{ paddingTop: '0px', maxWidth: '800px', margin: '0 auto', padding: '72px 24px 48px' }}>
    <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>Policies</h1>
    <p style={{ color: 'hsl(var(--muted-foreground))', marginBottom: '40px' }}>Read our policies carefully before placing an order.</p>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {sections.map(({ icon: Icon, title, content }) => (
        <div key={title} style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(255,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} style={{ color: '#ff0000' }} />
            </div>
            <h2 style={{ fontSize: '17px', fontWeight: 700, margin: 0 }}>{title}</h2>
          </div>
          <p style={{ fontSize: '14px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.8, margin: 0 }}>{content}</p>
        </div>
      ))}
    </div>
  </div>
);

export default PolicyPage;
