'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:8000/api';

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
  statut: string;
  prenom?: string;
  nom_famille?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  poste_actuel?: string;
  institution?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearSession: () => void;
  isAuthenticated: boolean;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'teacher';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // On mount, check if user is already logged in from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    const authTime = localStorage.getItem('auth_time');

    if (storedToken && storedUser && authTime) {
      const currentTime = Date.now();
      const loginTime = parseInt(authTime, 10);
      const sixtyMinutes = 60 * 60 * 1000;

      if (currentTime - loginTime > sixtyMinutes) {
        // Session expired
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_time');
        router.push('/');
      } else {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, [router]);

  // Global effect to handle auto-logout timer
  useEffect(() => {
    if (token && user) {
      const authTime = localStorage.getItem('auth_time');
      if (!authTime) return;

      const loginTime = parseInt(authTime, 10);
      const sixtyMinutes = 60 * 60 * 1000;
      const timeRemaining = sixtyMinutes - (Date.now() - loginTime);

      if (timeRemaining <= 0) {
        logout();
      } else {
        const timer = setTimeout(() => {
          logout();
        }, timeRemaining);
        return () => clearTimeout(timer);
      }
    }
  }, [token, user]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, mot_de_passe: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Invalid credentials' };
      }

      // Store token and user in state + localStorage
      const now = Date.now().toString();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_time', now);

      // Redirect based on role (only if active or super-admin)
      if (data.user.role === 'super-admin' || data.user.statut !== 'pending') {
        const role = data.user.role;
        if (role === 'super-admin') {
          router.push('/super-admin');
        } else if (role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/student');
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please check if the server is running.' };
    }
  }, [router]);

  const signup = useCallback(async (signupData: SignupData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.message || (data.errors ? Object.values(data.errors).flat().join(', ') : 'Registration failed');
        return { success: false, error: errorMessage };
      }

      // Store token and user in state + localStorage
      const now = Date.now().toString();
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_time', now);

      // Redirect based on role (only if active)
      if (data.user.statut !== 'pending') {
        const role = data.user.role;
        if (role === 'teacher') {
          router.push('/teacher');
        } else {
          router.push('/student');
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Network error. Please check if the server is running.' };
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state and localStorage regardless
      setToken(null);
      setUser(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_time');
      router.push('/');
    }
  }, [token, router]);

  // Vide la session sans redirection (utilisé depuis la page login avec ?logout=true)
  const clearSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_time');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        clearSession,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
