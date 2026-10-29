import { useId } from 'react';

/** Lit diya (clay lamp) with a flickering flame and glow. Pure SVG + CSS. */
const Diya = ({ size = 48, delay = 0 }: { size?: number; delay?: number }) => {
  const id = useId().replace(/:/g, '');
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <radialGradient id={`g${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb627" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ff7a1a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9622a" /><stop offset="100%" stopColor="#7c2d12" />
        </linearGradient>
        <linearGradient id={`f${id}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ff6a00" /><stop offset="100%" stopColor="#ffc93c" />
        </linearGradient>
      </defs>
      <circle className="diya-glow" cx="32" cy="24" r="30" fill={`url(#g${id})`} style={{ animationDelay: `${delay}s` }} />
      <path d="M8 36 C10 52 22 58 32 58 C42 58 54 52 56 36 Z" fill={`url(#b${id})`} />
      <ellipse cx="32" cy="36" rx="24" ry="4.5" fill="#ea7a2e" />
      <ellipse cx="32" cy="36" rx="20" ry="2.8" fill="#5a1d0a" />
      <rect x="31" y="30" width="2" height="6" rx="1" fill="#3a1206" />
      <g className="diya-flame" style={{ animationDelay: `${delay}s` }}>
        <path d="M32 4 C41 15 43 24 32 33 C21 24 23 15 32 4Z" fill={`url(#f${id})`} />
        <path d="M32 17 C36 22 36 27 32 31 C28 27 28 22 32 17Z" fill="#fff3b0" />
      </g>
    </svg>
  );
};

export default Diya;
