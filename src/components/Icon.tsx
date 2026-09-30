export const P: Record<string, string> = {
  heart: 'M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z',
  sparkle: 'M12 3c.6 5 1.9 6.4 7 7-5.1.6-6.4 2-7 7-.6-5-1.9-6.4-7-7 5.100-.6 6.400-2 7-7zM19 16c.2 1.700.7 2.300 2 2.500-1.300.2-1.800.8-2 2.500-.2-1.700-.7-2.300-2-2.500 1.300-.2 1.800-.8 2-2.500z',
  flower: 'M12 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0zM21 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0z',
  diamond: 'M12 3l8 9-8 9-8-9z',
  pin: 'M12 21s-6-5.500-6-10a6 6 0 1 1 12 0c0 4.500-6 10-6 10zM12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4',
  copy: 'M9 9h11v11H9zM5 15V5h10',
  chat: 'M4 20l1.300-4A8 8 0 1 1 8 18.700z',
  check: 'M5 12l5 5 9-10',
  down: 'M12 4v11M7 11l5 5 5-5M5 20h14',
}
export { ORN as ORNAMENTS } from '../data/locales'
export function Icon({ n, size = 20 }: { n: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n] ?? P.heart} /></svg>
}
