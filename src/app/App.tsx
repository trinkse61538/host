import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { LocaleProvider } from './providers/LocaleProvider';
import { ApartmentProvider } from './providers/ApartmentProvider';
import { InventoryProvider } from './providers/InventoryProvider';
import { AccessGate } from './AccessGate';
import { AppShell, type AppTab } from './AppShell';
import { InventoryPage } from '../features/inventory/InventoryPage';
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { CleanerPage } from '../features/cleaner/CleanerPage';
import { InvoicePage } from '../features/invoice/InvoicePage';
import { WifiPage } from '../features/wifi/WifiPage';
import { CheckinPage } from '../features/checkin/CheckinPage';
import { ParkingPage } from '../features/parking/ParkingPage';
import { ManagementPage } from '../features/management/ManagementPage';

function Page({ tab }: { tab: AppTab }) {
  if (tab === 'notifications') return <NotificationsPage />;
  if (tab === 'cleaner') return <CleanerPage />;
  if (tab === 'invoice') return <InvoicePage />;
  if (tab === 'wifi') return <WifiPage />;
  if (tab === 'checkin') return <CheckinPage />;
  if (tab === 'parking') return <ParkingPage />;
  if (tab === 'manage') return <ManagementPage />;
  return <InventoryPage />;
}

export function App() {
  return <ThemeProvider><LocaleProvider><AuthProvider><ApartmentProvider><InventoryProvider><AccessGate><AppShell render={tab => <Page tab={tab} />} /></AccessGate></InventoryProvider></ApartmentProvider></AuthProvider></LocaleProvider></ThemeProvider>;
}
