import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'staff';

export interface User {
  username: string;
  name: string;
  role: UserRole;
  title: string;
}

interface AuthContextType {
  user: User;
  isAdmin: boolean;
  login: (username: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const DEFAULT_STAFF: User = {
  username: 'staff',
  name: 'Staff BEM',
  role: 'staff',
  title: 'Staff / Panelis'
};

const IRE_ADMIN: User = {
  username: 'ire hebat',
  name: 'Admin IRE',
  role: 'admin',
  title: 'Internal Resource & Evaluation'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_STAFF;
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('auth_user', JSON.stringify(user));
  }, [user]);

  const login = (username: string, password: string) => {
    const cleanUser = username.trim().toLowerCase();
    const cleanPw = password.trim();

    if (cleanUser === 'ire hebat' && cleanPw === 'semangatIRE') {
      const adminUser = IRE_ADMIN;
      setUser(adminUser);
      setShowLoginModal(false);
      return { success: true };
    }

    // Dummy staff login fallback if entered
    if (cleanUser === 'staff' || cleanUser === 'biasa') {
      setUser(DEFAULT_STAFF);
      setShowLoginModal(false);
      return { success: true };
    }
    return {
      success: false,
      message: 'Username atau password salah! Silakan periksa kembali.'
    };
  };

  const logout = () => {
    setUser(DEFAULT_STAFF);
  };

  const isAdmin = user.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout, showLoginModal, setShowLoginModal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
