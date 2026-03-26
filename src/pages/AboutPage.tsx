import { useTheme } from '../contexts/ThemeContext';

const AboutPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div style={{ paddingTop: '56px' }}>
      <div style={{ background: isDark ? 'hsl(0 0% 6%)' : 'hsl(var(--secondary))', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ width: '80px', height: '80px', background: '#ff0000', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="32" height="28" viewBox="0 0 16 14" fill="none"><path d="M6.5 10L10.5 7L6.5 4V10Z" fill="white"/></svg>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, marginBottom: '16px' }}>About Youtupia</h1>
          <p style={{ fontSize: '16px', color: 'hsl(var(--muted-foreground))', lineHeight: 1.8 }}>
            We're a merch brand born from the culture. Every drop is a statement — limited, premium, and real.
          </p>
        </div>
      </div>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        {[
          { title: 'Our Story', text: 'Youtupia started as a passion project — a way to give fans and followers something real to wear. We obsess over fabric, fit, and finish. No mass-produced garbage. Every piece is thought through.' },
          { title: 'The Drops', text: 'We release in series — each with a theme, a look, a story. Two series on a page, each with its own logo and identity. When it\'s gone, it\'s gone. That\'s the point.' },
          { title: 'Quality Promise', text: 'Minimum 240gsm for tees, 380gsm for hoodies. We source from the best manufacturers. Returns accepted within 7 days, no questions asked.' },
        ].map(({ title, text }) => (
          <div key={title} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '4px', height: '24px', background: '#ff0000', borderRadius: '2px', display: 'inline-block' }} />{title}
            </h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.8, fontSize: '15px' }}>{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AboutPage;
