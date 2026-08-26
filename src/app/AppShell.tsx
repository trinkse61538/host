import { useState, type ReactNode } from 'react';
import { useAuth } from './providers/AuthProvider';
import { useTheme } from './providers/ThemeProvider';
import { useLocale } from './providers/LocaleProvider';
import { useApartments } from './providers/ApartmentProvider';
import { Button } from '../shared/components/Button';

export type AppTab = 'inventory' | 'notifications' | 'cleaner' | 'invoice' | 'wifi' | 'checkin' | 'parking' | 'manage';
const tabs: Array<{ id: AppTab; label: string; icon: string }> = [
  { id: 'inventory', label: 'Inventory', icon: 'I' },
  { id: 'notifications', label: 'Alerts', icon: 'A' },
  { id: 'cleaner', label: 'Cleaner', icon: 'C' },
  { id: 'invoice', label: 'Invoice', icon: '$' },
  { id: 'wifi', label: 'Wi-Fi', icon: 'W' },
  { id: 'checkin', label: 'Check-in', icon: 'K' },
  { id: 'parking', label: 'Parking Guide', icon: 'P' },
  { id: 'manage', label: 'Manage', icon: 'M' },
];
const validTabs = new Set<AppTab>(tabs.map(item => item.id));

export function AppShell({ render }: { render: (tab: AppTab) => ReactNode }) {
  const [tab, setTab] = useState<AppTab>(() => {
    const requested = new URLSearchParams(location.search).get('tab') as AppTab | null;
    return requested && validTabs.has(requested) ? requested : 'inventory';
  });
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { locale, setLocale } = useLocale();
  const { canEdit, role } = useApartments();
  const setActive = (next: AppTab) => {
    setTab(next);
    const url = new URL(location.href);
    url.searchParams.set('tab', next);
    history.replaceState({}, '', url);
  };

  return <div className="app-shell" data-tab={tab}>
    <header className="app-header">
      <div className="brand"><div className="brand-mark">H</div><div><strong>Host Control Center</strong><span>host.khaitringuyen.com</span></div></div>
      <nav className="top-actions">
        <button className="icon-button" onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}>{locale === 'vi' ? 'VI' : 'EN'}</button>
        <button className="icon-button" onClick={toggle}>{theme === 'dark' ? '☀' : '☾'}</button>
        <div className="user-chip"><span>{user?.displayName || user?.email}</span><small>{role || 'checking'}</small></div>
        <Button variant="ghost" onClick={() => void signOut()}>Sign out</Button>
      </nav>
    </header>
    <div className="workspace">
      <aside className="nav-rail">
        {tabs.filter(item => item.id !== 'manage' || canEdit).map(item => (
          <button key={item.id} onClick={() => setActive(item.id)} data-tab-id={item.id} className={tab === item.id ? 'nav-item nav-item--active' : 'nav-item'}>
            <span className="nav-item__icon">{item.icon}</span><span>{item.label}</span>
          </button>
        ))}
      </aside>
      <main className="content">{render(tab)}</main>
    </div>
  </div>;
}
