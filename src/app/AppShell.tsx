import { useState, type ReactNode } from 'react';
import { useAuth } from './providers/AuthProvider';
import { useTheme } from './providers/ThemeProvider';
import { useLocale } from './providers/LocaleProvider';
import { useApartments } from './providers/ApartmentProvider';
import { Button } from '../shared/components/Button';

export type AppTab = 'inventory' | 'notifications' | 'cleaner' | 'wifi' | 'checkin' | 'manage';
const tabs: Array<{ id: AppTab; label: string }> = [
  { id: 'inventory', label: 'Inventory' }, { id: 'notifications', label: 'Alerts' }, { id: 'cleaner', label: 'Cleaner' },
  { id: 'wifi', label: 'Wi-Fi' }, { id: 'checkin', label: 'Check-in' }, { id: 'manage', label: 'Manage' },
];

export function AppShell({ render }: { render: (tab: AppTab) => ReactNode }) {
  const [tab, setTab] = useState<AppTab>(() => (new URLSearchParams(location.search).get('tab') as AppTab) || 'inventory');
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const { locale, setLocale } = useLocale();
  const { canEdit, role } = useApartments();
  const setActive = (next: AppTab) => { setTab(next); const url = new URL(location.href); url.searchParams.set('tab', next); history.replaceState({}, '', url); };
  return <div className="app-shell"><header className="app-header"><div className="brand"><div className="brand-mark">H</div><div><strong>Host Control Center</strong><span>host.khaitringuyen.com</span></div></div><nav className="top-actions"><button className="icon-button" onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}>{locale === 'vi' ? 'VI' : 'EN'}</button><button className="icon-button" onClick={toggle}>{theme === 'dark' ? '☀' : '☾'}</button><div className="user-chip"><span>{user?.displayName || user?.email}</span><small>{role || 'checking'}</small></div><Button variant="ghost" onClick={() => void signOut()}>Sign out</Button></nav></header><div className="workspace"><aside className="nav-rail">{tabs.filter(item => item.id !== 'manage' || canEdit).map(item => <button key={item.id} onClick={() => setActive(item.id)} className={tab === item.id ? 'nav-item nav-item--active' : 'nav-item'}>{item.label}</button>)}</aside><main className="content">{render(tab)}</main></div></div>;
}
