"use client";

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu on auth state change (e.g., after sign-in)
  useEffect(() => {
    setMobileOpen(false);
  }, [user]);

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

  const routes = [
    { href: '/', label: 'Home' },
    { href: '/chat', label: 'Chat' },
    { href: '/collection', label: 'Collection' },
    { href: '/marketplace', label: 'Marketplace' },
    { href: '/social-credit', label: 'Social Credit' },
    // { href: '/admin', label: 'Admin' },
    { href: '/calendar', label: 'Calendar' },
    { href: '/user', label: 'User' },
    // Only show Auth when no user is logged in
    ...(!user ? [{ href: '/auth', label: 'Auth' as const }] : []),
  ];

  return (
    <nav className="bg-gray-900 border-b border-green-500 px-6 py-5">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-white hover:text-green-400 transition-colors">
          ♻️ Go Green
        </Link>

        {/* Desktop navigation + actions */}
        <div className="hidden md:flex items-center gap-6">
          <div className="flex items-center gap-2">
            {routes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="nav-link px-3 py-2 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition-colors"
              >
                {r.label}
              </Link>
            ))}
          </div>
          <div className="w-px h-8 bg-gray-600" />
          {user ? (
            <button
              onClick={signOut}
              className="btn px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
            >
              Sign Out
            </button>
          ) : (
            <Link
              href="/auth"
              className="btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
          aria-controls="primary-menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="sr-only">Toggle menu</span>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile panel */}
      <div
        id="primary-menu"
        className={`md:hidden ${mobileOpen ? 'block' : 'hidden'}`}
      >
        <div className="px-4 pt-4 pb-3 border-t border-gray-800">
          <div className="flex flex-col gap-2 mb-3">
            {routes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                className="w-full text-left px-4 py-2 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {r.label}
              </Link>
            ))}
          </div>

          <div className="border-t border-gray-800 my-3" />

          {user ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => { setMobileOpen(false); signOut(); }}
                className="btn w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/auth"
                className="btn w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
