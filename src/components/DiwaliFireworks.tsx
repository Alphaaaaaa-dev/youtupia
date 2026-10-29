import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type Part = { x: number; y: number; vx: number; vy: number; l: number; d: number; c: string; g: number; k: number };
type Rocket = { x: number; y: number; ty: number; vy: number; c: string };
const COL = ['255,182,39', '255,122,26', '255,59,59', '255,241,184', '255,80,160', '120,220,255'];

/** Full-screen fireworks + cursor embers. Click anywhere (not on buttons/links) for a burst. */
const DiwaliFireworks = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const cx = cv?.getContext('2d');
    if (!cv || !cx) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let W = 0, H = 0, raf = 0, last = 0;
    const F: Part[] = [];
    const R: Rocket[] = [];
    let autoTimer: ReturnType<typeof setTimeout>;

    const resize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * d; cv.height = H * d;
      cx.setTransform(d, 0, 0, d, 0, 0);
    };
    const launch = (x?: number, y?: number) => {
      R.push({ x: x ?? W * (0.12 + Math.random() * 0.76), y: H, ty: y ?? H * (0.1 + Math.random() * 0.35), vy: -(10 + Math.random() * 3), c: COL[(Math.random() * COL.length) | 0] });
    };
    const boom = (x: number, y: number, c: string) => {
      const n = 70 + ((Math.random() * 40) | 0), t = Math.random();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, s = t < 0.5 ? 1.5 + Math.random() * 4.5 : (i % 2 ? 5 : 2.6);
        F.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, d: 0.011 + Math.random() * 0.012, c, g: 0.04, k: 2.2 });
      }
      if (F.length > 1100) F.splice(0, F.length - 1100);
    };
    const ember = (x: number, y: number) => F.push({ x, y, vx: (Math.random() - 0.5) * 0.9, vy: -0.3 - Math.random() * 1.3, l: 1, d: 0.028, c: '255,190,60', g: -0.01, k: 1.7 });

    const step = () => {
      cx.globalCompositeOperation = 'destination-out';
      cx.fillStyle = 'rgba(0,0,0,0.3)';
      cx.fillRect(0, 0, W, H);
      cx.globalCompositeOperation = 'lighter';
      for (let i = R.length; i--;) {
        const r = R[i];
        r.y += r.vy; r.vy *= 0.985;
        cx.fillStyle = `rgb(${r.c})`; cx.fillRect(r.x, r.y, 2, 7);
        if (r.y <= r.ty || r.vy > -2) { boom(r.x, r.y, r.c); R.splice(i, 1); }
      }
      for (let i = F.length; i--;) {
        const p = F[i];
        p.x += p.vx; p.y += p.vy; p.vx *= 0.985; p.vy = p.vy * 0.985 + p.g; p.l -= p.d;
        if (p.l <= 0) { F.splice(i, 1); continue; }
        cx.fillStyle = `rgba(${p.c},${p.l})`;
        cx.beginPath(); cx.arc(p.x, p.y, p.k * p.l + 0.3, 0, Math.PI * 2); cx.fill();
      }
      raf = requestAnimationFrame(step);
    };
    const auto = () => {
      if (!document.hidden) { launch(); if (Math.random() < 0.4) setTimeout(launch, 250); }
      autoTimer = setTimeout(auto, 2600 + Math.random() * 2400);
    };
    const onMove = (e: PointerEvent) => {
      const n = performance.now();
      if (n - last > 28) { last = n; ember(e.clientX, e.clientY); }
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button,a,input,select,textarea,[role="dialog"]')) return;
      launch(e.clientX, Math.max(60, e.clientY - 140));
      boom(e.clientX, e.clientY, COL[(Math.random() * COL.length) | 0]);
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerdown', onDown);
    raf = requestAnimationFrame(step);
    autoTimer = setTimeout(auto, 800);
    return () => {
      cancelAnimationFrame(raf); clearTimeout(autoTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
    };
  }, []);

  // Portal to <body> so "fixed" means the screen, not the transformed page wrapper.
  return createPortal(
    <canvas ref={ref} aria-hidden style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 40, pointerEvents: 'none' }} />,
    document.body
  );
};

export default DiwaliFireworks;
