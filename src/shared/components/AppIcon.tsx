export type AppIconName =
  | 'inventory'
  | 'alert'
  | 'cleaner'
  | 'invoice'
  | 'wifi'
  | 'key'
  | 'parking'
  | 'manage'
  | 'copy'
  | 'share'
  | 'image'
  | 'file'
  | 'trash'
  | 'plus'
  | 'download'
  | 'check'
  | 'search'
  | 'print'
  | 'loader'
  | 'sun'
  | 'moon'
  | 'logout';

export function AppIcon({
  name,
  size = 18,
  className = '',
}: {
  name: AppIconName;
  size?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
    'aria-hidden': true,
  };

  if (name === 'inventory') return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></svg>;
  if (name === 'alert') return <svg {...common}><path d="M12 3 2.8 19h18.4L12 3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>;
  if (name === 'cleaner') return <svg {...common}><path d="m14 4 6 6" /><path d="M4 20c3-1 5.5-3.5 7-7l3-7 4 4-7 3c-3.5 1.5-6 4-7 7Z" /><path d="m6 16 2 2" /></svg>;
  if (name === 'invoice') return <svg {...common}><path d="M7 3h10a2 2 0 0 1 2 2v16l-3-2-4 2-4-2-3 2V5a2 2 0 0 1 2-2Z" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>;
  if (name === 'wifi') return <svg {...common}><path d="M5 9.5a11 11 0 0 1 14 0M8 13a6.5 6.5 0 0 1 8 0M10.7 16.4a2.3 2.3 0 0 1 2.6 0" /><circle cx="12" cy="19" r=".8" fill="currentColor" stroke="none" /></svg>;
  if (name === 'key') return <svg {...common}><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8M15 8l2 2M17 6l2 2" /></svg>;
  if (name === 'parking') return <svg {...common}><path d="M5 17h14M6 17l1-7h10l1 7" /><path d="m8 10 1.5-3h5L16 10" /><circle cx="8" cy="17" r="1.5" /><circle cx="16" cy="17" r="1.5" /></svg>;
  if (name === 'manage') return <svg {...common}><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></svg>;
  if (name === 'copy') return <svg {...common}><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>;
  if (name === 'share') return <svg {...common}><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.6M8.2 13.2l7.6 4.6" /></svg>;
  if (name === 'image') return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 15-4-4-7 7" /></svg>;
  if (name === 'file') return <svg {...common}><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></svg>;
  if (name === 'trash') return <svg {...common}><path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" /></svg>;
  if (name === 'plus') return <svg {...common}><path d="M12 5v14M5 12h14" /></svg>;
  if (name === 'download') return <svg {...common}><path d="M12 3v12M7 10l5 5 5-5M5 21h14" /></svg>;
  if (name === 'check') return <svg {...common}><path d="m5 12 4 4L19 6" /></svg>;
  if (name === 'search') return <svg {...common}><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>;
  if (name === 'print') return <svg {...common}><path d="M7 9V4h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" /><path d="M7 14h10v7H7z" /></svg>;
  if (name === 'loader') return <svg {...common}><path d="M21 12a9 9 0 1 1-2.64-6.36" /></svg>;
  if (name === 'sun') return <svg {...common}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" /></svg>;
  if (name === 'moon') return <svg {...common}><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" /></svg>;
  if (name === 'logout') return <svg {...common}><path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" /></svg>;
  return null;
}
