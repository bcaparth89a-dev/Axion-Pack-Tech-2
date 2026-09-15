'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useToast } from '@/context/ToastContext';
import { useAdminMobileNav } from '@/context/AdminMobileNavContext';
import { flushPublicCache } from '@/lib/api/admin';

export const AdminHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, logoutAll } = useAdminAuth();
  const { showToast } = useToast();
  const { toggleNav } = useAdminMobileNav();

  const [isFlushing, setIsFlushing] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickAddMenuOpen, setQuickAddMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickAddMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (quickAddMenuRef.current && !quickAddMenuRef.current.contains(target)) {
        setQuickAddMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setQuickAddMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Generate breadcrumb titles from pathname
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = segments.map((seg, idx) => {
    const href = '/' + segments.slice(0, idx + 1).join('/');
    const title = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
    return { href, title };
  });

  const handleFlushCache = async () => {
    if (isFlushing) return;
    setIsFlushing(true);
    try {
      await flushPublicCache();
      showToast('Public Redis cache flushed successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to flush cache';
      showToast(msg, 'error');
    } finally {
      setIsFlushing(false);
    }
  };

  const handleLogoutThisDevice = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  const handleLogoutAllDevices = async () => {
    setUserMenuOpen(false);
    if (confirm('Are you sure you want to log out from all devices? All active sessions will be terminated.')) {
      await logoutAll();
    }
  };

  const navigateToCreate = (type: 'category' | 'product' | 'model' | 'news' | 'blogs' | 'careers') => {
    setQuickAddMenuOpen(false);
    if (type === 'category' || type === 'product' || type === 'model') {
      router.push(`/admin/product-pages?create=${type}`);
    } else {
      router.push(`/admin/${type}?action=new`);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-[#061220]/90 backdrop-blur-md border-b border-slate-800/80 text-slate-200">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={toggleNav}
          className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs truncate" aria-label="Breadcrumb">
          <Link
            href="/admin"
            className="text-slate-400 hover:text-sky-400 transition-colors font-semibold tracking-wider uppercase text-[11px]"
          >
            ADMIN
          </Link>
          {breadcrumbs.map((b, idx) => (
            <React.Fragment key={b.href}>
              <span className="text-slate-600">/</span>
              {idx === breadcrumbs.length - 1 ? (
                <span className="font-semibold text-white truncate max-w-[150px] sm:max-w-xs">
                  {b.title}
                </span>
              ) : (
                <Link
                  href={b.href}
                  className="text-slate-400 hover:text-white transition-colors truncate hidden sm:inline"
                >
                  {b.title}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Quick Action Dropdown + System Health + Flush Cache + Live Site + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick "+ New..." Dropdown Overlay */}
        <div className="relative" ref={quickAddMenuRef}>
          <button
            type="button"
            onClick={() => setQuickAddMenuOpen(!quickAddMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-950 transition-all active:scale-95"
          >
            <span className="text-sm leading-none font-black">+</span>
            <span className="hidden sm:inline">Add New</span>
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${
                quickAddMenuOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Quick Add Overlay Menu */}
          {quickAddMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0a1b2e] border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 text-xs font-medium space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-sky-400 font-bold border-b border-slate-800">
                Catalog Entities
              </div>
              <button
                type="button"
                onClick={() => navigateToCreate('category')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-amber-500/15 text-amber-300 transition-colors text-left group"
              >
                <div className="flex items-center gap-2">
                  <span>📁</span>
                  <span className="font-semibold">+ Add Category</span>
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-amber-400">Division</span>
              </button>

              <button
                type="button"
                onClick={() => navigateToCreate('product')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-sky-500/15 text-sky-300 transition-colors text-left group"
              >
                <div className="flex items-center gap-2">
                  <span>⚙️</span>
                  <span className="font-semibold">+ Add Product</span>
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-sky-400">Machine</span>
              </button>

              <button
                type="button"
                onClick={() => navigateToCreate('model')}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-500/15 text-emerald-300 transition-colors text-left group"
              >
                <div className="flex items-center gap-2">
                  <span>🏷️</span>
                  <span className="font-semibold">+ Add Model</span>
                </div>
                <span className="text-[10px] text-slate-500 group-hover:text-emerald-400">Variant</span>
              </button>

              <div className="h-px bg-slate-800 my-1" />

              <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Articles & Careers
              </div>
              <button
                type="button"
                onClick={() => navigateToCreate('news')}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left"
              >
                <span>📰</span>
                <span>+ News Article</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToCreate('blogs')}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left"
              >
                <span>✍️</span>
                <span>+ Blog Post</span>
              </button>
              <button
                type="button"
                onClick={() => navigateToCreate('careers')}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left"
              >
                <span>💼</span>
                <span>+ Job Opening</span>
              </button>
            </div>
          )}
        </div>

        {/* Flush Cache Button */}
        <button
          type="button"
          onClick={handleFlushCache}
          disabled={isFlushing}
          title="Invalidate all public Redis cached endpoints and Next.js static pages"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-medium transition-colors"
        >
          <svg
            className={`w-3.5 h-3.5 ${isFlushing ? 'animate-spin text-sky-400' : 'text-slate-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="hidden md:inline">{isFlushing ? 'Flushing...' : 'Flush Cache'}</span>
        </button>

        {/* View Public Website Link */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Open live public website in a new tab"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-600/30 rounded-xl text-xs font-semibold transition-colors"
        >
          <span className="hidden sm:inline">Live Site</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>

        {/* User Profile Menu with Overlay */}
        <div className="relative pl-1 sm:pl-2 border-l border-slate-800" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-900 rounded-xl transition-colors text-left"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 border border-sky-500/30 flex items-center justify-center text-xs font-black text-white shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                {user?.name || 'Admin'}
              </span>
              <span className="text-[10px] text-sky-400 font-mono leading-tight">
                {user?.role || 'superuser'}
              </span>
            </div>
            <svg
              className={`w-3.5 h-3.5 text-slate-400 ml-0.5 transition-transform duration-200 ${
                userMenuOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* User Profile Dropdown Overlay */}
          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-[#0a1b2e] border border-slate-700/80 rounded-2xl shadow-2xl py-2 z-50 text-xs font-medium animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-800">
                <p className="font-bold text-white truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@axionpacktech.com'}</p>
                <span className="mt-1 inline-block text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800/40">
                  {user?.role || 'admin'}
                </span>
              </div>

              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/admin/settings/site"
                  onClick={() => setUserMenuOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                  <span>System Settings</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogoutThisDevice}
                  className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/40 rounded-xl flex items-center gap-2.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Log Out (This Device)</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogoutAllDevices}
                  className="w-full text-left px-3 py-2 text-slate-400 hover:text-rose-300 hover:bg-slate-800 rounded-xl flex items-center gap-2.5 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Log Out All Devices</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
