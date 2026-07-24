import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(
    localStorage.getItem('is_impersonating') === 'true'
  );

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            // fetch fresh user data
            const res = await api.get('auth/me/');
            setUser(res.data);
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (username, password) => {
    const response = await api.post('auth/login/', { username, password });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    // fetch user data
    const res = await api.get('auth/me/');
    setUser(res.data);
  };

  const loginWithToken = async (token) => {
    const response = await api.post('auth/google/', { token });
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    // fetch user data
    const res = await api.get('auth/me/');
    setUser(res.data);
  };

  const impersonateUser = async (username, passcode) => {
    const response = await api.post('auth/impersonate/', { username, passcode });
    
    // Save admin tokens first
    const adminAccess = localStorage.getItem('access_token');
    const adminRefresh = localStorage.getItem('refresh_token');
    localStorage.setItem('admin_access_token', adminAccess);
    localStorage.setItem('admin_refresh_token', adminRefresh);
    
    // Set employee tokens
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    localStorage.setItem('is_impersonating', 'true');
    setIsImpersonating(true);
    
    // Fetch employee user data
    const res = await api.get('auth/me/');
    setUser(res.data);
  };

  const restoreAdmin = async () => {
    const adminAccess = localStorage.getItem('admin_access_token');
    const adminRefresh = localStorage.getItem('admin_refresh_token');
    
    if (adminAccess && adminRefresh) {
      localStorage.setItem('access_token', adminAccess);
      localStorage.setItem('refresh_token', adminRefresh);
    }
    
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('is_impersonating');
    setIsImpersonating(false);
    
    // Fetch admin user data
    const res = await api.get('auth/me/');
    setUser(res.data);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('is_impersonating');
    setIsImpersonating(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, loginWithToken, logout, loading, isImpersonating, impersonateUser, restoreAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
