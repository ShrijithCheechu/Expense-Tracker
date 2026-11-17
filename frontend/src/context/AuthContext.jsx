import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('user_info');
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const profile = await api.getProfile();
          setUser(profile);
          localStorage.setItem('user_info', JSON.stringify(profile));
        } catch {
          api.clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    }

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    setUser(res.user);
    return res;
  };

  const register = async (name, email, password) => {
    const res = await api.register(name, email, password);
    setUser(res.user);
    return res;
  };

  const demoLogin = async () => {
    const res = await api.demoLogin();
    setUser(res.user);
    return res;
  };

  const logout = () => {
    api.clearTokens();
    setUser(null);
  };

  const updateProfile = async (data) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
    localStorage.setItem('user_info', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, demoLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
