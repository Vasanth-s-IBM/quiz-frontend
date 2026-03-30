import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import SessionExpiredModal from '../components/SessionExpiredModal';

interface User { id: number; name: string; email: string; role: string; }

interface AuthContextType {
  user: User | null; token: string | null; initialized: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour
const LAST_ACTIVE_KEY = 'lastActive';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser]               = useState<User | null>(null);
  const [token, setToken]             = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSession = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    sessionStorage.clear();
    setToken(null);
    setUser(null);
    setSessionExpired(true);
  };

  const resetTimer = () => {
    sessionStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(clearSession, SESSION_TIMEOUT_MS);
  };

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    const storedUser  = sessionStorage.getItem('user');
    const lastActive  = sessionStorage.getItem(LAST_ACTIVE_KEY);

    if (storedToken && storedUser) {
      if (lastActive && Date.now() - parseInt(lastActive) > SESSION_TIMEOUT_MS) {
        clearSession();
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        resetTimer();
      }
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!token) return;
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [token]);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    sessionStorage.setItem('token', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setToken(accessToken); setUser(userData);
    setSessionExpired(false);
    resetTimer();
  };

  const logout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    sessionStorage.clear(); setToken(null); setUser(null);
  };

  const handleGoToLogin = () => {
    setSessionExpired(false);
    window.location.replace('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, initialized, login, logout }}>
      {children}
      {sessionExpired && <SessionExpiredModal onLogin={handleGoToLogin} />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
