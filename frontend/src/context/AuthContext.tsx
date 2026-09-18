import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole } from '../types';
import { API_BASE } from '../services/apiClient';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  location: string;
  businessName?: string;
  fpoRegNo?: string;
  is_verified?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (mobileOrEmail: string, pass: string) => Promise<boolean>;
  demoLogin: (role: UserRole) => Promise<boolean>;
  logout: () => void;
  registerUser: (userData: any) => Promise<boolean>;
}

/**
 * Demo credentials for hackathon demo — these match the seeded DB users.
 * demoLogin() calls the real backend; it does NOT fake a JWT client-side.
 */
export const DEMO_CREDENTIALS: Record<UserRole, { phone: string; pass: string }> = {
  FARMER:    { phone: '9876543210', pass: 'demo1234' },
  BUYER:     { phone: '9876543212', pass: 'demo1234' },
  FPO:       { phone: '9876543211', pass: 'demo1234' },
  LOGISTICS: { phone: '9876543214', pass: 'demo1234' },
  ADMIN:     { phone: '9876543213', pass: 'demo1234' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('kisanlink_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const saved = localStorage.getItem('kisanlink_token');
    // Reject any legacy demo-jwt-* tokens stored from before this fix
    if (saved && saved.startsWith('demo-jwt-')) return null;
    return saved;
  });

  // Persist auth state
  useEffect(() => {
    if (user) {
      localStorage.setItem('kisanlink_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kisanlink_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('kisanlink_token', token);
    } else {
      localStorage.removeItem('kisanlink_token');
    }
  }, [token]);

  // Listen for 401 events dispatched by apiClient
  useEffect(() => {
    const handle = () => {
      console.warn('[Auth] Received 401 — clearing auth state');
      setUser(null);
      setToken(null);
    };
    window.addEventListener('kisanlink:auth:unauthorized', handle);
    return () => window.removeEventListener('kisanlink:auth:unauthorized', handle);
  }, []);

  const applyAuthResponse = (data: { access_token: string; refresh_token?: string; user: AuthUser }) => {
    setUser(data.user);
    setToken(data.access_token);
    if (data.refresh_token) {
      localStorage.setItem('kisanlink_refresh_token', data.refresh_token);
    }
  };

  const login = async (mobileOrEmail: string, pass: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: mobileOrEmail, password: pass }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
      throw new Error(err.detail ?? 'Invalid credentials');
    }

    const data = await res.json();
    applyAuthResponse(data);
    return true;
  };

  /**
   * Demo login — still calls the real backend using seeded credentials.
   * The backend must be running for this to work.
   * Returns true on success, throws on failure.
   */
  const demoLogin = async (role: UserRole): Promise<boolean> => {
    const cred = DEMO_CREDENTIALS[role];
    return login(cred.phone, cred.pass);
  };

  const logout = useCallback(() => {
    // Attempt server-side session invalidation (best-effort)
    const currentToken = localStorage.getItem('kisanlink_token');
    if (currentToken && !currentToken.startsWith('demo-jwt-')) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${currentToken}` },
      }).catch(() => { /* ignore network errors during logout */ });
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('kisanlink_user');
    localStorage.removeItem('kisanlink_token');
    localStorage.removeItem('kisanlink_refresh_token');
  }, []);

  const registerUser = async (userData: any): Promise<boolean> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        password: userData.password || 'kisanlink123',
        role: userData.role || 'FARMER',
        location: userData.location || 'Maharashtra',
        business_name: userData.businessName,
        gstin: userData.gstin,
        fpo_reg_no: userData.fpoRegNo,
        fleet_type: userData.fleetType,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail ?? 'Registration failed');
    }

    const data = await res.json();
    applyAuthResponse(data);
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user && token),
      login,
      demoLogin,
      logout,
      registerUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
