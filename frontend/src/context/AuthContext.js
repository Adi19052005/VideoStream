import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Restore session on refresh
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          apiService.setToken(token);

          const userData = await apiService.getMe();

          // ✅ CRITICAL FIX
          // Backend returns user object directly
          setUser(userData);

        } catch (err) {
          console.error('Session restore failed:', err);

          localStorage.removeItem('token');
          apiService.setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);

    try {
      const data = await apiService.login(email, password);

      // ✅ Login API DOES return { user }
      setUser(data.user);

      return data;

    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, password, username) => {
    setError(null);

    try {
      const data = await apiService.register(email, password, username);

      // ✅ Signup API returns { user }
      setUser(data.user);

      return data;

    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    apiService.logout();
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
