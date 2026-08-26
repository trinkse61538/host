import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../../infrastructure/firebase/client';
import { signInWithGoogle, signOutUser } from '../../infrastructure/firebase/auth';

interface AuthContextValue {
  user: User | null;
  sheetsAccessToken: string | null;
  initializing: boolean;
  signingIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [sheetsAccessToken, setSheetsAccessToken] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => onAuthStateChanged(auth, next => {
    setUser(next);
    if (!next) setSheetsAccessToken(null);
    setInitializing(false);
  }), []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    sheetsAccessToken,
    initializing,
    signingIn,
    signIn: async () => {
      setSigningIn(true);
      try {
        const result = await signInWithGoogle();
        setUser(result.user);
        setSheetsAccessToken(result.accessToken);
      } finally { setSigningIn(false); }
    },
    signOut: async () => {
      await signOutUser();
      setUser(null);
      setSheetsAccessToken(null);
    },
  }), [initializing, sheetsAccessToken, signingIn, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
