import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const SESSION_KEY = 'youtupia_session';

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name: string, phone?: string) => Promise<{ error?: string; needsEmailConfirmation?: boolean }>;
  logout: () => void;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        if (session.expires_at && new Date(session.expires_at) > new Date()) {
          setUser(session.user);
        } else {
          sessionStorage.removeItem(SESSION_KEY);
        }
      }
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
    }
    setLoading(false);
  }, []);

  const saveSession = (userData: User, access_token: string, expires_in: number) => {
    setUser(userData);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      user: userData,
      access_token,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
    }));
  };

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Invalid email or password' };
      const userData: User = { id: data.user.id, email: data.user.email, name: data.user.name, phone: data.user.phone };
      saveSession(userData, data.access_token, data.expires_in);
      return {};
    } catch {
      return { error: 'Connection error. Please check your internet and try again.' };
    }
  };

  const signup = async (email: string, password: string, name: string, phone?: string): Promise<{ error?: string; needsEmailConfirmation?: boolean }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password, name, phone }),
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Signup failed. Please try again.' };
      return { needsEmailConfirmation: true };
    } catch {
      return { error: 'Connection error. Please check your internet and try again.' };
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        session.user = updated;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      }
    } catch {}
  };

  const logout = () => { sessionStorage.removeItem(SESSION_KEY); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, signOut: logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
