import type { CSSProperties } from 'react';
const paths = {
  leaf: 'M20 4C10 2 3 7 5 15c2 7 14 6 15-11ZM5 20 16 9M10 15v-5M10 15h5',
  fridge: 'M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM5 10h14M8 6v1M8 13v3',
  chef: 'M7 14a5 5 0 1 1 1-9 5 5 0 0 1 8 0 5 5 0 1 1 1 9v6H7v-6ZM7 17h10M10 13v2M14 13v2',
  plus: 'M12 5v14M5 12h14', arrow: 'M4 12h16m-6-6 6 6-6 6', back: 'M20 12H4m6-6-6 6 6 6', chevron: 'm9 5 7 7-7 7', down: 'm6 9 6 6 6-6',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z', clock: 'M12 8v5l3 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
  calendar: 'M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1ZM8 3v4M16 3v4M4 10h16M8 14h2M14 14h2',
  check: 'm5 12 4 4L19 6', close: 'm6 6 12 12M6 18 18 6', edit: 'm15 4 5 5M4 20l5-1L21 7l-4-4L5 15l-1 5Z',
  trash: 'M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7M14 10v7', logout: 'M9 4H4v16h5M10 12h11m-4-4 4 4-4 4',
  sparkles: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4M18 4h4',
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z', list: 'M8 5h13M8 12h13M8 19h13M3 5h.01M3 12h.01M3 19h.01',
  warning: 'm12 3 10 18H2L12 3ZM12 9v5M12 17h.01', mail: 'M3 5h18v14H3V5Zm0 1 9 7 9-7', lock: 'M6 10h12v11H6V10Zm2 0V6a4 4 0 0 1 8 0v4M12 14v3',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  eyeOff: 'm3 3 18 18M9 5a10 10 0 0 1 3 0c6 0 10 7 10 7a20 20 0 0 1-3 4M6 6a22 22 0 0 0-4 6s4 7 10 7a11 11 0 0 0 5-1',
  barcode: 'M3 5v14M6 5v14M10 5v14M12 5v14M17 5v14M21 5v14', basket: 'M3 9h18l-2 12H5L3 9Zm4 0 3-6M17 9l-3-6M9 13v4M15 13v4',
  sun: 'M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  heart: 'M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 3 11 8 15 5-4 13-10 8-15Z',
} as const;
export type IconName = keyof typeof paths;
export function Icon({ name, size = 20, className = '', style }: { name: IconName; size?: number; className?: string; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true"><path d={paths[name]} /></svg>;
}
