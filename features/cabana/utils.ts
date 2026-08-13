// Date/format helpers ported one-for-one from the handoff's script block.
// The mockup runs in a browser with full Intl; Hermes ships Intl too, but
// `toLocaleDateString` options support varies by platform, so the two date
// formatters below are written out explicitly to guarantee the exact strings
// the design specifies ("Sat 16 Aug", "August 2026").

import { DAY } from './data';

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** `String(n).padStart(2,'0')`, clamped at zero like the mockup's `pad`. */
export const pad = (n: number) => String(Math.max(0, n)).padStart(2, '0');

/** Local-date ISO day key, e.g. "2026-08-13". */
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** en-GB short date: "Sat 16 Aug". */
export const fmt = (d: Date) =>
  `${WEEKDAYS_SHORT[d.getDay()]} ${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;

/** en-GB time: "4:00 pm" → the design renders `hour:'numeric',minute:'2-digit'`. */
export const fmtTime = (d: Date) => {
  const h = d.getHours();
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${pad(d.getMinutes())} ${suffix}`;
};

/** Calendar sheet header: "August 2026". */
export const fmtMonthYear = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS_LONG[m - 1]} ${y}`;
};

/** Parse a "YYYY-MM-DD" key into a local Date at the given hour. */
export const fromIso = (isoDay: string, hour = 12) => {
  const [y, m, d] = isoDay.split('-').map(Number);
  return new Date(y, m - 1, d, hour, 0, 0, 0);
};

/** Step a "YYYY-MM" key forward or back by whole months. */
export const shiftMonth = (ym: string, delta: number) => {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

export type CalCell =
  | { id: string; blank: true }
  | { id: string; blank?: false; day: number; iso: string };

/** Leading blanks to line the 1st up under its weekday, then the days. */
export const buildMonth = (ym: string): CalCell[] => {
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const days = new Date(y, m, 0).getDate();
  const out: CalCell[] = [];
  for (let i = 0; i < first.getDay(); i++) out.push({ id: `b${i}`, blank: true });
  for (let d = 1; d <= days; d++) {
    out.push({ id: `${ym}-${d}`, day: d, iso: `${y}-${pad(m)}-${pad(d)}` });
  }
  return out;
};

/**
 * Split "🔊 Speaker" into its emoji and name. Free text typed without a
 * leading emoji gets 🫶, exactly as the mockup does.
 */
export const splitThing = (raw: string): { emoji: string; name: string } | null => {
  const t = (raw || '').trim();
  if (!t) return null;
  const parts = t.split(' ');
  const hasEmoji = /\p{Extended_Pictographic}/u.test(parts[0]);
  return hasEmoji
    ? { emoji: parts[0], name: parts.slice(1).join(' ') }
    : { emoji: '🫶', name: t };
};

/** Countdown split used by the event hero and the event-card clock. */
export const countdown = (ms: number) => ({
  days: Math.floor(ms / DAY),
  hours: Math.floor((ms % DAY) / 3600000),
  mins: Math.floor((ms % 3600000) / 60000),
});

/** "just now" for the first minute, then "3m ago". */
export const relativeAge = (ageMs: number) =>
  ageMs < 60000 ? 'just now' : `${Math.floor(ageMs / 60000)}m ago`;

/**
 * Ink at a given alpha, expressed as an 8-digit hex suffix. The mockup builds
 * the claimed-item chip and row tints by string-concatenating an alpha onto
 * the person's hex colour (`col(i.who) + '40'`), which only works because
 * every colour in the palette is a 6-digit hex. Same trick, named.
 */
export const withAlpha = (hex: string, suffix: '40' | '4D') => hex + suffix;
