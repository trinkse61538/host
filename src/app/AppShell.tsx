import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PwaInstallButton } from './PwaInstallButton';
import { useAuth } from './providers/AuthProvider';
import { useTheme } from './providers/ThemeProvider';
import { useLocale } from './providers/LocaleProvider';
import { useApartments } from './providers/ApartmentProvider';
import { AppIcon, type AppIconName } from '../shared/components/AppIcon';

export type AppTab = 'inventory' | 'notifications' | 'cleaner' | 'invoice' | 'wifi' | 'checkin' | 'parking' | 'manage';

const tabs: Array<{ id: AppTab; label: string; icon: AppIconName }> = [
  { id: 'inventory', label: 'Inventory', icon: 'inventory' },
  { id: 'notifications', label: 'Alerts', icon: 'alert' },
  { id: 'cleaner', label: 'Cleaner', icon: 'cleaner' },
  { id: 'invoice', label: 'Invoice', icon: 'invoice' },
  { id: 'wifi', label: 'Wi-Fi', icon: 'wifi' },
  { id: 'checkin', label: 'Check-in', icon: 'key' },
  { id: 'parking', label: 'Parking', icon: 'parking' },
  { id: 'manage', label: 'Manage', icon: 'manage' },
];

const validTabs = new Set<AppTab>(tabs.map(item => item.id));

function initials(value: string): string {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'H';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AppShell({ render }: { render: (tab: AppTab) => ReactNode }) {
  const [tab, setTab] = useState<AppTab>(() => {
    const requested = new URLSearchParams(location.search).get('tab') as AppTab | null;
    return requested && validTabs.has(requested) ? requested : 'inventory';
  });

  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { locale, setLocale } = useLocale();
  const { canEdit, role } = useApartments();
  const navRef = useRef<HTMLElement | null>(null);
  const [navEdges, setNavEdges] = useState({ left: false, right: false });

  const availableTabs = tabs.filter(item => item.id !== 'manage' || canEdit);
  const current = availableTabs.find(item => item.id === tab) || availableTabs[0];
  const userLabel = user?.displayName || user?.email || 'Host user';
  const avatar = useMemo(() => initials(userLabel), [userLabel]);

  const updateNavEdges = useCallback(() => {
    const nav = navRef.current;
    if (!nav) return;
    const maxScroll = Math.max(0, nav.scrollWidth - nav.clientWidth);
    setNavEdges({
      left: nav.scrollLeft > 5,
      right: nav.scrollLeft < maxScroll - 5,
    });
  }, []);

  const scrollNav = (direction: -1 | 1) => {
    const nav = navRef.current;
    if (!nav) return;
    nav.scrollBy({
      left: direction * Math.max(150, nav.clientWidth * 0.58),
      behavior: 'smooth',
    });
  };

  const revealTab = (id: AppTab) => {
    window.requestAnimationFrame(() => {
      const nav = navRef.current;
      const item = nav?.querySelector<HTMLElement>(`[data-tab-id="${id}"]`);
      if (!nav || !item) return;

      const target = item.offsetLeft - (nav.clientWidth - item.offsetWidth) / 2;
      nav.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
    });
  };

  useEffect(() => {
    updateNavEdges();
    const nav = navRef.current;
    if (!nav) return;

    const onScroll = () => updateNavEdges();
    const onResize = () => updateNavEdges();

    nav.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const frame = window.requestAnimationFrame(updateNavEdges);
    return () => {
      window.cancelAnimationFrame(frame);
      nav.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [availableTabs.length, updateNavEdges]);

  const setActive = (next: AppTab) => {
    setTab(next);
    const url = new URL(location.href);
    url.searchParams.set('tab', next);
    history.replaceState({}, '', url);
    revealTab(next);
  };

  return (
    <div className="app-shell" data-tab={tab}>
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">H</div>
          <div className="brand-copy">
            <strong>Host Control Center</strong>
            <span><i /> Property operations · {current?.label || 'Workspace'}</span>
          </div>
        </div>

        <nav className="top-actions">
          <PwaInstallButton />
          <button
            className="icon-button locale-button"
            type="button"
            onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
            title="Change language"
          >
            {locale === 'vi' ? 'VI' : 'EN'}
          </button>
          <button className="icon-button theme-button" type="button" onClick={toggle} title="Toggle theme" aria-label="Toggle light and dark theme">
            <AppIcon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
          </button>
          <div className="user-chip">
            <span className="user-avatar">{avatar}</span>
            <span className="user-chip__copy">
              <strong>{userLabel}</strong>
              <small>{role || 'checking'}</small>
            </span>
          </div>
          <button className="signout-button" type="button" onClick={() => void signOut()} title="Sign out">
            <AppIcon name="logout" size={16} />
            <span>Sign out</span>
          </button>
        </nav>
      </header>

      <div className="workspace">
        <div className="nav-rail-shell">
          <button
            className={`nav-edge-button nav-edge-button--left ${navEdges.left ? '' : 'nav-edge-button--hidden'}`}
            type="button"
            onClick={() => scrollNav(-1)}
            aria-label="Show previous tabs"
            tabIndex={navEdges.left ? 0 : -1}
          >
            ‹
          </button>

          <aside ref={navRef} className="nav-rail" aria-label="Main navigation">
            <div className="nav-rail__label">Workspace</div>
            {availableTabs.map(item => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                data-tab-id={item.id}
                className={tab === item.id ? 'nav-item nav-item--active' : 'nav-item'}
                type="button"
              >
                <span className="nav-item__icon"><AppIcon name={item.icon} size={17} /></span>
                <span className="nav-item__label">{item.label}</span>
              </button>
            ))}
          </aside>

          <button
            className={`nav-edge-button nav-edge-button--right ${navEdges.right ? '' : 'nav-edge-button--hidden'}`}
            type="button"
            onClick={() => scrollNav(1)}
            aria-label="Show more tabs"
            tabIndex={navEdges.right ? 0 : -1}
          >
            ›
          </button>

          <span
            className={`nav-more-hint ${navEdges.right ? '' : 'nav-more-hint--hidden'}`}
            aria-hidden="true"
          >
            More
          </span>
        </div>

        <main className="content">{render(tab)}</main>
      </div>
    </div>
  );
}
