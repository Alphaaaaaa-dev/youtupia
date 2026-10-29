import { useEffect, useState } from 'react';

/**
 * Festival campaign settings. Change the dates here and redeploy.
 * Phases switch automatically:  off -> teaser -> live -> off
 */
export const FESTIVAL = {
  name: 'Diwali',
  teaserStart: '2026-10-29T00:00:00+05:30', // teaser appears (countdown to sale start)
  saleStart:   '2026-11-01T00:00:00+05:30', // sale goes live: 1 Nov, 12:00 AM IST
  saleEnd:     '2026-11-11T23:59:59+05:30', // sale ends: end of 11 Nov, IST
  saleStartLabel: '1 Nov',
  ctaLink: '/diwali-sale',
  offerText: '',   // e.g. 'Up to 40% off'. Leave empty to show a generic line.
  couponCode: '',  // e.g. 'DIWALI10'. Leave empty to hide the coupon chip.
};

export type FestivalPhase = 'off' | 'teaser' | 'live';

const t = (s: string) => new Date(s).getTime();

export const getFestivalPhase = (now = Date.now()): FestivalPhase => {
  if (now >= t(FESTIVAL.saleEnd)) return 'off';
  if (now >= t(FESTIVAL.saleStart)) return 'live';
  if (now >= t(FESTIVAL.teaserStart)) return 'teaser';
  return 'off';
};

/** tickMs: 1000 for countdowns, 60000 if you only need the phase. */
export const useFestival = (tickMs = 60000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), tickMs);
    return () => clearInterval(id);
  }, [tickMs]);

  const phase = getFestivalPhase(now);
  const target = phase === 'teaser' ? t(FESTIVAL.saleStart) : t(FESTIVAL.saleEnd);
  const s = Math.max(0, Math.floor((target - now) / 1000));
  return {
    phase,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
};
