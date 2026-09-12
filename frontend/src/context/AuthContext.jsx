import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiBaseUrl } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qt_token') || null);
  const [loading, setLoading] = useState(true);

  // Dynamically resolve API URL so cross-device auth works
  const API_URL = getApiBaseUrl();

  useEffect(() => {
    if (token) {
      localStorage.setItem('qt_token', token);
      fetchCurrentUser();
    } else {
      localStorage.removeItem('qt_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    const MAX_RETRIES = 5;
    const BASE_DELAY_MS = 500; // starts at 500ms, doubles each retry

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          setToken(null);
        }
        setLoading(false);
        return; // success — stop retrying
      } catch (error) {
        const isLastAttempt = attempt === MAX_RETRIES;
        if (isLastAttempt) {
          // Backend never came up — quietly clear token
          console.warn('[Auth] Backend unreachable after retries. Clearing session.');
          setToken(null);
          setLoading(false);
        } else {
          // Backend still starting — wait and retry silently
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.access_token);
        return { success: true };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Network error during login:', error);
      return { success: false, error: `Cannot reach backend at ${API_URL}. Please ensure backend is running with --host 0.0.0.0.` };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      if (response.ok) {
        // Auto-login after signup
        return login(email, password);
      } else {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, error: errorData.detail || 'Signup failed' };
      }
    } catch (error) {
      console.error('Network error during signup:', error);
      return { success: false, error: `Cannot reach backend at ${API_URL}. Please ensure backend is running with --host 0.0.0.0.` };
    }
  };

  const logout = () => {
    setToken(null);
  };

  const updateProfile = async (profileData) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      const updatedUser = await response.json();
      setUser(updatedUser);
      return { success: true };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.detail || 'Profile update failed' };
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
