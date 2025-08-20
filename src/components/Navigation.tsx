"use client";

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const navRef = useRef<HTMLElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // set desktop state after mount to avoid hydration mismatch
    function onResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setMobileOpen(false);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    function onPointerDown(e: MouseEvent | TouchEvent) {
      if (!navRef.current) return;
      const target = e.target as Node | null;
      if (mobileOpen && target && !navRef.current.contains(target)) {
        setMobileOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [mobileOpen]);

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

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
  <nav
    ref={navRef}
    className="sticky top-4 z-40 mx-4 md:mx-8 backdrop-blur-md bg-black/30 border border-white/6 rounded-xl px-4 md:px-6 py-3 shadow-lg"
  >
      <div className="max-w-6xl mx-auto flex items-center">
        {/* Left: logo (keeps left spacing) */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="text-2xl font-bold text-white hover:text-green-400 transition-colors">
            ♻️ Go Green
          </Link>
        </div>

        {/* Center: nav links (centered) */}
        <div className="hidden md:flex flex-1 justify-center items-center">
          <nav aria-label="Primary" className="">
            <ul className="flex items-center space-x-4">
              {routes.map((r) => {
                const active = isActive(r.href);
                return (
                  <li key={r.href}>
                    <Link
                      href={r.href}
                      aria-current={active ? 'page' : undefined}
                      className={`relative inline-block whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        active
                          ? 'text-white bg-gray-800 shadow-inner ring-1 ring-green-600'
                          : 'text-gray-200 hover:text-white hover:bg-gray-800'
                      }`}
                    >
                      {r.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Right: actions + mobile button */}
        <div className="flex-1 flex items-center justify-end gap-6">
          <div className="hidden md:block w-px h-8 bg-gray-600" />
          {mounted && isDesktop ? (
            user ? (
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
            )
          ) : null}

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500"
            aria-controls="primary-menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="sr-only">Toggle menu</span>
            {/* Animated hamburger: three bars that morph into an X */}
            <div className="flex flex-col justify-center items-center w-6 h-6">
              {/* base line style */}
              <span className={`block w-6 h-0.5 bg-gray-200 transform transition-all duration-300 ease-in-out ${mobileOpen ? 'translate-y-0 rotate-45' : '-translate-y-1'}`} />
              <span className={`block w-6 h-0.5 bg-gray-200 transform transition-all duration-300 ease-in-out my-1 ${mobileOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`block w-6 h-0.5 bg-gray-200 transform transition-all duration-300 ease-in-out ${mobileOpen ? 'translate-y-0 -rotate-45' : 'translate-y-1'}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="primary-menu"
        // use max-height + opacity with overflow-hidden for reliable collapse on all Tailwind configs
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 origin-top ${mobileOpen ? 'max-h-[700px] opacity-100 pointer-events-auto' : 'max-h-0 opacity-0 pointer-events-none'}`}
      >
        <div className="px-4 pt-4 pb-3 border-t border-gray-800">
          <div className="flex flex-col gap-2 mb-3">
            {routes.map((r) => (
              <Link
                key={r.href}
                href={r.href}
                aria-current={isActive(r.href) ? 'page' : undefined}
                className={`w-full text-left px-4 py-2 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition-colors ${isActive(r.href) ? 'bg-gray-800 border border-green-500 text-white' : ''}`}
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
