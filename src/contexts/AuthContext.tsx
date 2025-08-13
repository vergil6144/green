"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, authDB } from '@/lib/db';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }

      await authDB.init();
      
      // Check localStorage for existing session
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        const user = await authDB.getUserById(storedUserId);
        if (user) {
          setUser(user);
        } else {
          // Clear invalid session
          localStorage.removeItem('userId');
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (name: string, email: string, phone: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Client-side only operation' };
      }

      // Check if user already exists
      const existingUser = await authDB.getUserByEmail(email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Create new user
      const newUser = await authDB.createUser({ name, email, phone, password });
      
      // Store session in localStorage
      newUser.emailVerified = true; // For demo purposes, auto-verify
      localStorage.setItem('userId', newUser.id);
      setUser(newUser);
      
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: 'Failed to create account' };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        return { success: false, error: 'Client-side only operation' };
      }

      const user = await authDB.getUserByEmail(email);
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.password !== password) {
        return { success: false, error: 'Invalid password' };
      }

      // Store session in localStorage
      localStorage.setItem('userId', user.id);
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Failed to sign in' };
    }
  };

  const signOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userId');
    }
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
