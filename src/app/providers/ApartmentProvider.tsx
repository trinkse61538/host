import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AccessAccount, AccessRole, ManagedApartment } from '../../domain/models';
import { resolveAccessRole, subscribeAccessAccounts, subscribeApartments } from '../../infrastructure/firebase/apartmentRepository';
import { useAuth } from './AuthProvider';

interface ApartmentContextValue {
  status: 'signed-out' | 'checking-access' | 'unauthorized' | 'loading' | 'ready' | 'error';
  role: AccessRole | null;
  apartments: ManagedApartment[];
  accessAccounts: AccessAccount[];
  error: string;
  canEdit: boolean;
  isAdmin: boolean;
}
const ApartmentContext = createContext<ApartmentContextValue | null>(null);

export function ApartmentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [role, setRole] = useState<AccessRole | null>(null);
  const [apartments, setApartments] = useState<ManagedApartment[]>([]);
  const [accessAccounts, setAccessAccounts] = useState<AccessAccount[]>([]);
  const [status, setStatus] = useState<ApartmentContextValue['status']>(user ? 'checking-access' : 'signed-out');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setApartments([]); setAccessAccounts([]); setRole(null); setError('');
    if (!user?.email) { setStatus('signed-out'); return; }
    setStatus('checking-access');
    void resolveAccessRole(user.email).then(nextRole => {
      if (cancelled) return;
      setRole(nextRole);
      setStatus(nextRole ? 'loading' : 'unauthorized');
    }).catch(reason => {
      if (!cancelled) { setStatus('error'); setError(reason instanceof Error ? reason.message : 'Unable to check access.'); }
    });
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!role) return;
    return subscribeApartments(value => { setApartments(value); setStatus('ready'); setError(''); }, reason => {
      setStatus('error'); setError(reason.message);
    });
  }, [role]);

  useEffect(() => {
    if (role !== 'admin') { setAccessAccounts([]); return; }
    return subscribeAccessAccounts(setAccessAccounts);
  }, [role]);

  const value = useMemo<ApartmentContextValue>(() => ({
    status, role, apartments, accessAccounts, error,
    canEdit: role === 'admin' || role === 'editor',
    isAdmin: role === 'admin',
  }), [accessAccounts, apartments, error, role, status]);

  return <ApartmentContext.Provider value={value}>{children}</ApartmentContext.Provider>;
}

export function useApartments() { const value = useContext(ApartmentContext); if (!value) throw new Error('Missing ApartmentProvider'); return value; }
