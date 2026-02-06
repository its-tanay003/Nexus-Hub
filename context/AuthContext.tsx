
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
  
  // Conditional Auth State
  isLoginModalOpen: boolean;
  openLoginModal: (redirectAfterLogin?: string) => void;
  closeLoginModal: () => void;
  pendingRedirect: string | null;
  clearPendingRedirect: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage on load
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setIsLoginModalOpen(false); // Close modal on success
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    fetch('http://localhost:4000/api/v1/auth/logout', { method: 'POST' }).catch(console.error);
  };

  const openLoginModal = (redirectPath?: string) => {
    if (redirectPath) setPendingRedirect(redirectPath);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setPendingRedirect(null);
  };

  const clearPendingRedirect = () => {
      setPendingRedirect(null);
  };

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SECURITY';

  return (
    <AuthContext.Provider value={{ 
        user, 
        token, 
        isAuthenticated: !!user, 
        isAdmin, 
        login, 
        logout, 
        loading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        pendingRedirect,
        clearPendingRedirect
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
