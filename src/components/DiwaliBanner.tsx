import { Link } from 'react-router-dom';
import Diya from './Diya';
import { useTheme } from '../contexts/ThemeContext';
import { useFestival, FESTIVAL } from '../config/festival';

const GOLD = '#f5a524';

/** Slim Diwali strip shown under the hero. Hidden outside the campaign dates. */
const DiwaliBanner = () => {
  const { phase, days, hours, minutes, seconds } = useFestival(1000);
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  if (phase === 'off') return null;

  const live = phase === 'live';
  const units: [number, string][] = [[days, 'Days'], [hours, 'Hrs'], [minutes, 'Min'], [seconds, 'Sec']];

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap',
        padding: '20px 24px', borderRadius: '16px',
        background: isDark ? 'linear-gradient(120deg, rgba(245,165,36,0.10), rgba(255,0,0,0.08))' : 'linear-gradient(120deg, rgba(245,165,36,0.16), rgba(255,0,0,0.05))',
        border: `1px solid ${isDark ? 'rgba(245,165,36,0.3)' : 'rgba(217,119,6,0.3)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: '240px', flex: '1 1 280px' }}>
          <Diya size={44} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.01em' }}>
              {live ? `${FESTIVAL.name} Sale is live` : `${FESTIVAL.name} Sale starts ${FESTIVAL.saleStartLabel}`}
            </div>
            <div style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginTop: '2px' }}>
              {live ? 'Festive prices on limited drops. Sale ends in' : 'Festive prices on limited drops are on the way. Starts in'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }} role="timer" aria-label="Countdown">
          {units.map(([v, l]) => (
            <div key={l} style={{ minWidth: '56px', padding: '8px 6px', textAlign: 'center', borderRadius: '10px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
              <div style={{ fontSize: '20px', fontWeight: 900, color: isDark ? GOLD : '#b45309', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{String(v).padStart(2, '0')}</div>
              <div style={{ fontSize: '10px', color: 'hsl(var(--muted-foreground))', marginTop: '3px' }}>{l}</div>
            </div>
          ))}
        </div>

        <Link to={FESTIVAL.ctaLink} className="btn-yt" style={{ borderRadius: '10px', padding: '12px 22px', textDecoration: 'none', fontWeight: 700 }}>
          {live ? 'Shop the sale' : 'See the sneak peek'}
        </Link>
      </div>
    </section>
  );
};

export default DiwaliBanner;
