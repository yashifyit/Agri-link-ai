import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  location: string;
  businessName?: string;
  fpoRegNo?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (mobileOrEmail: string, pass: string) => Promise<boolean>;
  demoLogin: (role: UserRole) => void;
  logout: () => void;
  registerUser: (userData: Partial<AuthUser>) => void;
}

const DEMO_USERS: Record<UserRole, AuthUser> = {
  FARMER: {
    id: "USR-FARM-01",
    name: "Ramesh Verma",
    phone: "9876543210",
    email: "ramesh@kisanlink.in",
    role: "FARMER",
    location: "Kanpur, Uttar Pradesh"
  },
  BUYER: {
    id: "USR-BUY-01",
    name: "FreshHarvest Foods",
    phone: "9876543212",
    email: "procurement@freshharvest.com",
    role: "BUYER",
    location: "Lucknow, Uttar Pradesh",
    businessName: "FreshHarvest Processors Pvt Ltd"
  },
  FPO: {
    id: "USR-FPO-01",
    name: "Sahyadri FPO",
    phone: "9876543211",
    email: "contact@sahyadrifpo.org",
    role: "FPO",
    location: "Nashik, Maharashtra",
    fpoRegNo: "FPO-MH-2024-88"
  },
  ADMIN: {
    id: "USR-ADM-01",
    name: "Command Center Admin",
    phone: "9876543213",
    email: "admin@kisanlink.gov.in",
    role: "ADMIN",
    location: "Mumbai, Maharashtra"
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('kisanlink_user');
    return saved ? JSON.parse(saved) : DEMO_USERS.FARMER;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('kisanlink_token') || 'demo-jwt-token-sih-2026';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('kisanlink_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('kisanlink_user');
    }
  }, [user]);

  const login = async (mobileOrEmail: string, pass: string): Promise<boolean> => {
    // Simulated JWT login response
    const loggedUser: AuthUser = {
      id: `USR-${Date.now()}`,
      name: mobileOrEmail.includes('@') ? mobileOrEmail.split('@')[0] : 'Kisan User',
      phone: mobileOrEmail,
      email: mobileOrEmail.includes('@') ? mobileOrEmail : undefined,
      role: 'FARMER',
      location: 'Kanpur, Uttar Pradesh'
    };
    setUser(loggedUser);
    setToken('jwt-token-' + Date.now());
    return true;
  };

  const demoLogin = (role: UserRole) => {
    const targetUser = DEMO_USERS[role];
    setUser(targetUser);
    setToken(`demo-jwt-${role.toLowerCase()}`);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kisanlink_user');
    localStorage.removeItem('kisanlink_token');
  };

  const registerUser = (userData: Partial<AuthUser>) => {
    const newUser: AuthUser = {
      id: `USR-REG-${Date.now()}`,
      name: userData.name || 'New Producer',
      phone: userData.phone || '9900112233',
      email: userData.email,
      role: userData.role || 'FARMER',
      location: userData.location || 'Maharashtra',
      businessName: userData.businessName,
      fpoRegNo: userData.fpoRegNo
    };
    setUser(newUser);
    setToken('jwt-token-reg-' + Date.now());
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user),
      login,
      demoLogin,
      logout,
      registerUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
