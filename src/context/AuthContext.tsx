import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, UserRole } from '../types';
import { DEMO_USERS } from '../data/mockData';
import { getRoleDashboardPath } from '../utils';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoMode] = useState(true); // Always demo mode until Firebase creds provided

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Get the latest users list (from DataContext persistence or mock fallback)
    let systemUsers: User[] = Object.values(DEMO_USERS);
    const saved = localStorage.getItem('zp_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        systemUsers = parsed.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        }));
      } catch (e) {
        // Fallback to demo users
      }
    }

    const found = systemUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (found) {
      if (!found.isActive) {
        setIsLoading(false);
        throw new Error('This account has been deactivated. Please contact an admin.');
      }
      
      // Verify password
      // If it's a demo user and no password is set, allow any password for demo purposes.
      // Otherwise, match exactly.
      if (found.password && found.password !== password) {
        setIsLoading(false);
        throw new Error('Incorrect password.');
      }
      
      setUser(found);
    } else {
      setIsLoading(false);
      throw new Error('Account not found. An administrator must add you to the system first.');
    }
    
    setIsLoading(false);
  }, []);

  const loginAsDemo = useCallback((role: UserRole) => {
    setUser(DEMO_USERS[role]);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : prev);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, isDemoMode, login, loginAsDemo, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { getRoleDashboardPath };
