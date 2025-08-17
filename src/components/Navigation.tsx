"use client";

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering auth state until mounted
  if (!mounted) {
    return (
      <nav className="bg-gray-900 border-b border-green-500 px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-white hover:text-green-400 transition-colors ht">
            ♻️ Go Green
          </Link>
          <div className="w-32 h-10 bg-gray-700 rounded animate-pulse"></div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-900 border-b border-green-500 px-6 py-5">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white hover:text-green-400 transition-colors">
          ♻️ Go Green
        </Link>
        
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                href="/social-credit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
              >
                🏆 Social Credit
              </Link>
              <div className="w-px h-8 bg-gray-600"></div>
              <span className="text-gray-300 px-2">Welcome, {user.email}</span>
              <div className="w-px h-8 bg-gray-600"></div>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                🔐 Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
