import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { SheetReport } from '../../domain/models';
import { runtimeConfig } from '../../config/runtime';
import { fetchSpreadsheetReports, fetchSpreadsheetTitle } from '../../infrastructure/google/sheets';
import { readJson, writeJson } from '../../shared/lib/browserStorage';
import { useAuth } from './AuthProvider';

const CACHE_KEY = 'host_inventory_snapshot_v1';
interface Snapshot { title: string; reports: SheetReport[]; syncedAt: string; }
interface InventoryContextValue {
  spreadsheetInput: string;
  setSpreadsheetInput: (value: string) => void;
  shortageTermsInput: string;
  setShortageTermsInput: (value: string) => void;
  title: string;
  reports: SheetReport[];
  syncedAt: string;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}
const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { sheetsAccessToken } = useAuth();
  const snapshot = readJson<Snapshot | null>(CACHE_KEY, null);
  const [spreadsheetInput, setSpreadsheetInput] = useState(localStorage.getItem('host_sheet_id') || runtimeConfig.defaultSpreadsheetId);
  const [shortageTermsInput, setShortageTermsInput] = useState(localStorage.getItem('host_shortage_terms') || 'low, empty, 0, shortage, out');
  const [title, setTitle] = useState(snapshot?.title || '—');
  const [reports, setReports] = useState<SheetReport[]>(snapshot?.reports || []);
  const [syncedAt, setSyncedAt] = useState(snapshot?.syncedAt || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!sheetsAccessToken) { setError('Connect Google Sheets to refresh inventory. Saved snapshot is still available.'); return; }
    setLoading(true); setError('');
    try {
      const terms = shortageTermsInput.split(',').map(value => value.trim()).filter(Boolean);
      const [nextTitle, nextReports] = await Promise.all([
        fetchSpreadsheetTitle(spreadsheetInput, sheetsAccessToken),
        fetchSpreadsheetReports(spreadsheetInput, sheetsAccessToken, terms),
      ]);
      const nextSyncedAt = new Date().toISOString();
      setTitle(nextTitle); setReports(nextReports); setSyncedAt(nextSyncedAt);
      localStorage.setItem('host_sheet_id', spreadsheetInput);
      localStorage.setItem('host_shortage_terms', shortageTermsInput);
      writeJson(CACHE_KEY, { title: nextTitle, reports: nextReports, syncedAt: nextSyncedAt });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to refresh inventory.'); }
    finally { setLoading(false); }
  }, [sheetsAccessToken, shortageTermsInput, spreadsheetInput]);

  const value = useMemo(() => ({ spreadsheetInput, setSpreadsheetInput, shortageTermsInput, setShortageTermsInput, title, reports, syncedAt, loading, error, refresh }),
    [error, loading, refresh, reports, shortageTermsInput, spreadsheetInput, syncedAt, title]);
  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() { const value = useContext(InventoryContext); if (!value) throw new Error('Missing InventoryProvider'); return value; }
