import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AuthService, AuthUser } from '../services/authService';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await AuthService.me();
        if (mounted) setUser(me);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (email: string) => {
    const u = await AuthService.login(email);
    setUser(u);
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
