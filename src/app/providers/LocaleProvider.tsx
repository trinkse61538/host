import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
export type Locale = 'vi' | 'en';
const LocaleContext = createContext<{ locale: Locale; setLocale: (value: Locale) => void; text: (vi: string, en: string) => string } | null>(null);
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => localStorage.getItem('host_locale') === 'en' ? 'en' : 'vi');
  const value = useMemo(() => ({
    locale,
    setLocale: (next: Locale) => { setLocaleState(next); localStorage.setItem('host_locale', next); },
    text: (vi: string, en: string) => locale === 'vi' ? vi : en,
  }), [locale]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
export function useLocale() { const value = useContext(LocaleContext); if (!value) throw new Error('Missing LocaleProvider'); return value; }
