import { useFestival } from '../config/festival';

/** Small string of warm lights along the top edge of the hero. Decorative only. */
const DiwaliLights = () => {
  const { phase } = useFestival();
  if (phase === 'off') return null;
  const n = 14;
  return (
    <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '30px', zIndex: 2, pointerEvents: 'none' }}>
      <style>{`
        @keyframes diyaFlicker { 0%,100%{opacity:1} 50%{opacity:.6} }
        @media (prefers-reduced-motion: reduce) { .diya-bulb { animation: none !important; } }
      `}</style>
      <div style={{ position: 'absolute', left: '-2%', right: '-2%', top: 0, height: '16px', borderBottom: '1px solid rgba(245,165,36,0.35)', borderRadius: '0 0 50% 50% / 0 0 100% 100%' }} />
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="diya-bulb" style={{
          position: 'absolute', left: `${(i / (n - 1)) * 96 + 2}%`, top: `${Math.sin((i / (n - 1)) * Math.PI) * 10 + 2}px`,
          width: '7px', height: '10px', borderRadius: '50% 50% 55% 55%',
          background: 'radial-gradient(circle at 50% 35%, #fff3c0, #f5a524 60%, #ea7a0c)',
          boxShadow: '0 0 8px 2px rgba(245,165,36,0.5)',
          animation: `diyaFlicker ${2.6 + (i % 4) * 0.4}s ease-in-out ${i * 0.3}s infinite`,
        }} />
      ))}
    </div>
  );
};

export default DiwaliLights;
