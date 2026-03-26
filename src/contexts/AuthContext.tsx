import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const SESSION_KEY = 'averti_session';

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
  signup: (email: string, password: string, name: string) => Promise<{ error?: string; needsConfirmation?: boolean; needsOTP?: boolean; userId?: string }>;
  logout: () => void;
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
      setUser(userData);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({
        user: userData,
        access_token: data.access_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
      }));
      return {};
    } catch {
      return { error: 'Connection error. Please try again.' };
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<{ error?: string; needsConfirmation?: boolean; needsOTP?: boolean; userId?: string }> => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email, password, name }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        return { error: 'Server error — API not reachable. Please try again.' };
      }
      const data = await res.json();
      if (!res.ok) return { error: data.error || 'Signup failed' };
      if (data.needsOTP) return { needsOTP: true, userId: data.userId };
      if (data.needsConfirmation) return { needsConfirmation: true };
      if (data.user && data.access_token) {
        const userData: User = { id: data.user.id, email: data.user.email, name };
        setUser(userData);
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({
          user: userData,
          access_token: data.access_token,
          expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        }));
      }
      return {};
    } catch (err) {
      return { error: 'Connection error. Please try again.' };
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

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
