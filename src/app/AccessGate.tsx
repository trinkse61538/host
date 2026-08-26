import type { ReactNode } from 'react';
import { useAuth } from './providers/AuthProvider';
import { useApartments } from './providers/ApartmentProvider';
import { Card } from '../shared/components/Card';
import { Button } from '../shared/components/Button';

export function AccessGate({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const apartments = useApartments();
  if (auth.initializing || apartments.status === 'checking-access' || apartments.status === 'loading') return <div className="center-screen"><div className="spinner"/><p>Loading secure workspace…</p></div>;
  if (apartments.status === 'signed-out') return <div className="center-screen"><Card className="login-card"><div className="brand-mark brand-mark--large">H</div><h1>Host Control Center</h1><p>Sign in with an authorized Google account to access apartment operations.</p><Button onClick={() => void auth.signIn()} disabled={auth.signingIn}>{auth.signingIn ? 'Connecting…' : 'Sign in with Google'}</Button></Card></div>;
  if (apartments.status === 'unauthorized') return <div className="center-screen"><Card className="login-card"><h2>Account not authorized</h2><p>{auth.user?.email} is not in the access list.</p><Button variant="secondary" onClick={() => void auth.signOut()}>Use another account</Button></Card></div>;
  if (apartments.status === 'error') return <div className="center-screen"><Card className="login-card"><h2>Unable to load Firebase data</h2><p>{apartments.error}</p><Button onClick={() => location.reload()}>Reload</Button></Card></div>;
  return <>{children}</>;
}
