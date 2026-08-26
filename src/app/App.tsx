import { lazy, Suspense } from 'react';
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { LocaleProvider } from './providers/LocaleProvider';
import { ApartmentProvider } from './providers/ApartmentProvider';
import { InventoryProvider } from './providers/InventoryProvider';
import { AccessGate } from './AccessGate';
import { AppShell, type AppTab } from './AppShell';

const InventoryPage = lazy(() => import('../features/inventory/InventoryPage').then(module => ({ default: module.InventoryPage })));
const NotificationsPage = lazy(() => import('../features/notifications/NotificationsPage').then(module => ({ default: module.NotificationsPage })));
const CleanerPage = lazy(() => import('../features/cleaner/CleanerPage').then(module => ({ default: module.CleanerPage })));
const InvoicePage = lazy(() => import('../features/invoice/InvoicePage').then(module => ({ default: module.InvoicePage })));
const WifiPage = lazy(() => import('../features/wifi/WifiPage').then(module => ({ default: module.WifiPage })));
const CheckinPage = lazy(() => import('../features/checkin/CheckinPage').then(module => ({ default: module.CheckinPage })));
const ParkingPage = lazy(() => import('../features/parking/ParkingPage').then(module => ({ default: module.ParkingPage })));
const ManagementPage = lazy(() => import('../features/management/ManagementPage').then(module => ({ default: module.ManagementPage })));

function ActivePage({ tab }: { tab: AppTab }) {
  if (tab === 'notifications') return <NotificationsPage />;
  if (tab === 'cleaner') return <CleanerPage />;
  if (tab === 'invoice') return <InvoicePage />;
  if (tab === 'wifi') return <WifiPage />;
  if (tab === 'checkin') return <CheckinPage />;
  if (tab === 'parking') return <ParkingPage />;
  if (tab === 'manage') return <ManagementPage />;
  return <InventoryPage />;
}

function Page({ tab }: { tab: AppTab }) {
  return (
    <Suspense fallback={
      <div className="card">
        <span className="eyebrow">Loading module</span>
        <h2>Loading…</h2>
      </div>
    }>
      <ActivePage tab={tab} />
    </Suspense>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <AuthProvider>
          <ApartmentProvider>
            <InventoryProvider>
              <AccessGate>
                <AppShell render={tab => <Page tab={tab} />} />
              </AccessGate>
            </InventoryProvider>
          </ApartmentProvider>
        </AuthProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
