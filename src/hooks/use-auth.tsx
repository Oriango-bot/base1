
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const publicPages = ['/', '/login', '/signup', '/terms-of-service', '/privacy-policy', '/admin/login', '/admin/signup', '/about', '/forgot-password'];

  useEffect(() => {
    setLoading(true);
    const storedUser = localStorage.getItem('loggedInUser');
    const isPublicPage = publicPages.includes(pathname);

    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
    } else {
      setUser(null);
      if (!isPublicPage) {
        router.push('/login');
      }
    }
    setLoading(false);
  }, [pathname, router]);

  const login = (userData: User | null) => {
    if (userData) {
      localStorage.setItem('loggedInUser', JSON.stringify(userData));
      setUser(userData);
    } else {
      localStorage.removeItem('loggedInUser');
      setUser(null);
    }
  };

  const logout = useCallback(() => {
    const wasAdmin = user?.role === 'admin' || user?.role === 'super-admin';
    localStorage.removeItem('loggedInUser');
    setUser(null);
    if (wasAdmin) {
      router.push('/admin/login');
    } else {
      router.push('/login');
    }
  }, [user, router]);
  

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
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
