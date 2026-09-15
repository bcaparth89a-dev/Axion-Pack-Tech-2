'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AdminUser,
  getStoredToken,
  ADMIN_USER_KEY,
  loginAdmin,
  logoutAdmin,
  logoutAllAdmin,
  getAdminProfile,
  clearStoredAuth,
} from '@/lib/api/admin';

interface AdminAuthContextValue {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize authentication once on mount
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      // 1. Check cached user in localStorage for fast initial state
      if (typeof window !== 'undefined') {
        const cachedUserStr = localStorage.getItem(ADMIN_USER_KEY);
        if (cachedUserStr) {
          try {
            const parsed = JSON.parse(cachedUserStr) as AdminUser;
            if (parsed.role === 'admin' && isMounted) {
              setUser(parsed);
              setToken(getStoredToken());
            }
          } catch {
            localStorage.removeItem(ADMIN_USER_KEY);
          }
        }
      }

      // 2. Validate session with backend (silent refresh runs automatically if access token expired)
      try {
        const profile = await getAdminProfile();
        if (!isMounted) return;

        if (profile.role === 'admin') {
          setUser(profile);
          const currentToken = getStoredToken();
          setToken(currentToken);
          if (typeof window !== 'undefined') {
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(profile));
          }

          // If valid session already exists on /admin/login, redirect to /admin dashboard
          if (window.location.pathname === '/admin/login') {
            router.replace('/admin');
          }
        } else {
          clearStoredAuth();
          setUser(null);
          setToken(null);
          if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
            router.replace('/admin/login?error=forbidden');
          }
        }
      } catch {
        if (!isMounted) return;
        clearStoredAuth();
        setUser(null);
        setToken(null);
        if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
          router.replace('/admin/login');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  // Route protection sync when route changes after initial load
  useEffect(() => {
    if (isLoading) return;

    const isLoginRoute = pathname === '/admin/login';
    const isAdminRoute = pathname?.startsWith('/admin');

    if (isAdminRoute && !isLoginRoute && (!user || user.role !== 'admin')) {
      router.replace('/admin/login');
    } else if (isLoginRoute && user && user.role === 'admin') {
      router.replace('/admin');
    }
  }, [pathname, isLoading, user, router]);

  const login = useCallback(
    async (email: string, pass: string) => {
      setIsLoading(true);
      try {
        const res = await loginAdmin(email, pass);
        if (res.user.role !== 'admin') {
          throw new Error('Access restricted. User role must be admin.');
        }
        setUser(res.user);
        setToken(res.token);
        if (typeof window !== 'undefined') {
          localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.user));
        }
        router.replace('/admin');
      } finally {
        setIsLoading(false);
      }
    },
    [router]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutAdmin();
    } finally {
      setUser(null);
      setToken(null);
      clearStoredAuth();
      setIsLoading(false);
      router.replace('/admin/login');
    }
  }, [router]);

  const logoutAll = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutAllAdmin();
    } finally {
      setUser(null);
      setToken(null);
      clearStoredAuth();
      setIsLoading(false);
      router.replace('/admin/login');
    }
  }, [router]);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && user.role === 'admin',
        isLoading,
        login,
        logout,
        logoutAll,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
