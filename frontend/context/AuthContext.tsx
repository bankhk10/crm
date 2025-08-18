'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'sonner';
import { getCookie, setCookie, deleteCookie } from '@/lib/cookies';

interface User {
  id: number;
  email: string;
  name: string;
  role: { name: string; permissions: any[] };
}

interface AuthContextType {
  user: User | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const tokenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isHandlingRef = useRef(false);

  const handleTokenExpired = () => {
    if (isHandlingRef.current) return;
    isHandlingRef.current = true;
    toast.error('เซสชั่นหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง.');
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    delete api.defaults.headers.Authorization;
    setUser(null);
    setTimeout(() => {
      router.push('/login');
      isHandlingRef.current = false;
    }, 3000);
  };

  const startTokenTimer = (token: string) => {
    const decoded = jwtDecode<{ exp: number }>(token);
    const expiresInMs = decoded.exp * 1000 - Date.now();
    if (tokenTimeoutRef.current) clearTimeout(tokenTimeoutRef.current);
    if (expiresInMs > 0) {
      tokenTimeoutRef.current = setTimeout(handleTokenExpired, expiresInMs);
    }
  };

  // This effect runs once on mount to check for an existing session
  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = getCookie('accessToken');
      if (accessToken) {
        try {
          // Set the auth header for the initial request
          api.defaults.headers.Authorization = `Bearer ${accessToken}`;
          const profile = await api.get('/auth/profile');
          setUser(profile.data);
          startTokenTimer(accessToken);
        } catch (error) {
          console.error('Failed to fetch profile, session might be expired.', error);
          handleTokenExpired();
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
    // The empty dependency array ensures this runs only once.
  }, []);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          handleTokenExpired();
        }
        return Promise.reject(error);
      },
    );
    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = (accessToken: string, refreshToken: string) => {
    // Set cookies for session persistence
    setCookie('accessToken', accessToken, 59 / (24 * 60))  // 59 minutes
    setCookie('refreshToken', refreshToken, 7); // 7 days

    // Set auth header for subsequent requests
    api.defaults.headers.Authorization = `Bearer ${accessToken}`;

    startTokenTimer(accessToken);

    // Fetch user profile to update the state
    api.get('/auth/profile').then(response => {
      setUser(response.data);
      toast.success(`เข้าสู่ระบบสำเร็จ`);
      router.push('/dashboard');
    });
  };

  const logout = () => {
    if (tokenTimeoutRef.current) {
      clearTimeout(tokenTimeoutRef.current);
    }
    // Clear cookies
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    // Remove auth header from axios instance
    delete api.defaults.headers.Authorization;
    // Clear user state
    setUser(null);
    // Redirect to login page
    router.push('/login');
    toast.info('คุณได้ออกจากระบบแล้ว.');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
