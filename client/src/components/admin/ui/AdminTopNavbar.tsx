'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useToast } from '@/context/ToastContext';
import { useAdminMobileNav } from '@/context/AdminMobileNavContext';
import { flushPublicCache } from '@/lib/api/admin';

interface DropdownItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
  description?: string;
}

interface NavDropdown {
  title: string;
  prefix: string;
  items: DropdownItem[];
}

export const AdminTopNavbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, logoutAll } = useAdminAuth();
  const { showToast } = useToast();
  const { isOpen, toggleNav, closeNav } = useAdminMobileNav();

  const [isFlushing, setIsFlushing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);

  // Close all open menus on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (navRef.current && !navRef.current.contains(target)) {
        setActiveDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserMenuOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(target)) {
        setQuickAddOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setUserMenuOpen(false);
        setQuickAddOpen(false);
        closeNav();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeNav]);

  // Close dropdowns on route change
  useEffect(() => {
    setActiveDropdown(null);
    setUserMenuOpen(false);
    setQuickAddOpen(false);
    closeNav();
  }, [pathname, closeNav]);

  const handleFlushCache = async () => {
    if (isFlushing) return;
    setIsFlushing(true);
    try {
      await flushPublicCache();
      showToast('Public Redis cache & Next.js static pages invalidated', 'success');
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
    if (confirm('Log out from all devices? All active sessions will be terminated.')) {
      await logoutAll();
    }
  };

  const navDropdowns: NavDropdown[] = [
    {
      title: 'Catalog',
      prefix: '/admin/product',
      items: [
        {
          label: 'Equipment Catalog',
          href: '/admin/product-pages',
          icon: '📦',
          badge: 'Hierarchy',
          description: 'Manage Categories, Products & Models in visual tree',
        },
        {
          label: 'Categories',
          href: '/admin/product-pages?filter=categories',
          icon: '📁',
          description: 'High-level machinery divisions & series',
        },
        {
          label: 'Products',
          href: '/admin/product-pages?filter=products',
          icon: '⚙️',
          description: 'Industrial packaging & processing machines',
        },
        {
          label: 'Models',
          href: '/admin/product-pages?filter=models',
          icon: '🏷️',
          description: 'Variants, specifications & capacity models',
        },
      ],
    },
    {
      title: 'Content',
      prefix: '/admin/pages',
      items: [
        {
          label: 'Home Page CMS',
          href: '/admin/pages/home',
          icon: '🏠',
          description: 'Hero videos, headlines, tagline & intro blocks',
        },
        {
          label: 'About Page CMS',
          href: '/admin/pages/about',
          icon: '🏢',
          description: 'Company intro, vision, mission & capabilities',
        },
        {
          label: 'News & Press',
          href: '/admin/news',
          icon: '📰',
          description: 'Articles, trade show press & announcements',
        },
        {
          label: 'Blogs & Insights',
          href: '/admin/blogs',
          icon: '✍️',
          description: 'Technical insights & packaging guides',
        },
        {
          label: 'Category Hero CMS',
          href: '/admin/pages/category-hero',
          icon: '🖼️',
          description: 'Category landing banners & headers',
        },
      ],
    },
    {
      title: 'Business',
      prefix: '/admin/industries',
      items: [
        {
          label: 'Industries',
          href: '/admin/industries',
          icon: '🏭',
          description: 'Food, Pharma, Chemical & Agro solutions',
        },
        {
          label: 'Services',
          href: '/admin/services',
          icon: '🔧',
          description: 'Engineering, Retrofit, Maintenance & Support',
        },
      ],
    },
    {
      title: 'Careers',
      prefix: '/admin/careers',
      items: [
        {
          label: 'Job Openings',
          href: '/admin/careers',
          icon: '💼',
          description: 'Manage active engineering & shop positions',
        },
        {
          label: 'Candidate Applications',
          href: '/admin/applications',
          icon: '📄',
          badge: 'Applicants',
          description: 'Review applicant resumes & hiring statuses',
        },
      ],
    },
    {
      title: 'Operations',
      prefix: '/admin/media',
      items: [
        {
          label: 'Media Library',
          href: '/admin/media',
          icon: '🖼️',
          description: 'R2 storage, machine photos, videos & PDFs',
        },
        {
          label: 'Inquiries & Leads',
          href: '/admin/inquiries',
          icon: '📬',
          badge: 'Leads',
          description: 'Catalog downloads, quote requests & contact submissions',
        },
      ],
    },
  ];

  const isDropdownActive = (dropdown: NavDropdown) => {
    return dropdown.items.some((item) => pathname.startsWith(item.href.split('?')[0]));
  };

  // Helper to format breadcrumb from pathname
  const getBreadcrumb = () => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length <= 1) return 'Dashboard Overview';
    const last = segments[segments.length - 1];
    return last
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050e18]/95 backdrop-blur-md border-b border-slate-800 text-slate-200 select-none">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* LEFT: Logo & Location Breadcrumbs */}
        <div className="flex items-center gap-3.5 shrink-0 min-w-0">
          {/* Admin Portal Brand Logo & Title */}
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-sky-950 transition-transform group-hover:scale-105">
              AX
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-black tracking-tight text-white uppercase leading-tight group-hover:text-sky-300 transition-colors">
                AXION PackTech
              </span>
              <span className="text-[10px] text-sky-400 font-mono leading-tight tracking-wider uppercase hidden sm:inline">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Desktop Breadcrumb Trail */}
          <div className="hidden md:flex items-center gap-2 text-xs pl-3 border-l border-slate-800">
            <Link
              href="/admin"
              className="text-slate-400 hover:text-white transition-colors font-medium"
            >
              Dashboard
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-sky-200 font-bold tracking-tight truncate max-w-xs">
              {getBreadcrumb()}
            </span>
          </div>
        </div>

        {/* CENTER / DESKTOP HORIZONTAL NAVIGATION (Large & Medium Desktop) */}
        <nav
          ref={navRef}
          className="hidden xl:flex items-center gap-1 min-w-0"
          aria-label="Main Admin Navigation"
        >
          {/* Dashboard Link */}
          <Link
            href="/admin"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              pathname === '/admin'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
            }`}
          >
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Dashboard</span>
          </Link>

          {/* Nav Dropdowns */}
          {navDropdowns.map((drop) => {
            const active = isDropdownActive(drop);
            const isOpenState = activeDropdown === drop.title;

            return (
              <div key={drop.title} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(isOpenState ? null : drop.title)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                    active || isOpenState
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                  }`}
                  aria-expanded={isOpenState}
                >
                  <span>{drop.title}</span>
                  <svg
                    className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
                      isOpenState ? 'rotate-180 text-sky-400' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Overlay Menu */}
                {isOpenState && (
                  <div className="absolute left-0 mt-2 w-72 bg-[#071524] border border-slate-700/90 rounded-2xl shadow-2xl p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                      {drop.title} Management
                    </div>
                    <div className="space-y-1 mt-1">
                      {drop.items.map((item) => {
                        const isCurrentPage = pathname === item.href.split('?')[0];
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className={`flex items-start gap-2.5 p-2.5 rounded-xl transition-colors group ${
                              isCurrentPage
                                ? 'bg-sky-500/20 text-white border border-sky-500/40'
                                : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                            }`}
                          >
                            <span className="text-base leading-none shrink-0 mt-0.5">{item.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-bold truncate text-xs group-hover:text-sky-300 transition-colors">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-sky-950 text-sky-300 border border-sky-700/50">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* RIGHT END CONTROLS (Quick Add + Flush + Live Site + Profile + HAMBURGER ALWAYS AT THE RIGHT END) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 ml-auto">
          {/* Quick Add Menu */}
          <div className="relative" ref={quickAddRef}>
            <button
              type="button"
              onClick={() => setQuickAddOpen(!quickAddOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-sky-950 transition-all active:scale-95"
            >
              <span className="text-sm leading-none font-black">+</span>
              <span className="hidden sm:inline">Add New</span>
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${
                  quickAddOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {quickAddOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#071524] border border-slate-700/90 rounded-2xl shadow-2xl p-2 z-50 text-xs font-medium space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10px] uppercase tracking-widest text-sky-400 font-bold border-b border-slate-800">
                  Quick Catalog Entity
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddOpen(false);
                    router.push('/admin/product-pages?create=category');
                  }}
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
                  onClick={() => {
                    setQuickAddOpen(false);
                    router.push('/admin/product-pages?create=product');
                  }}
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
                  onClick={() => {
                    setQuickAddOpen(false);
                    router.push('/admin/product-pages?create=model');
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-emerald-500/15 text-emerald-300 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2">
                    <span>🏷️</span>
                    <span className="font-semibold">+ Add Model</span>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-emerald-400">Variant</span>
                </button>

                <div className="h-px bg-slate-800 my-1" />
                <div className="px-3 py-1 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Articles & Careers
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddOpen(false);
                    router.push('/admin/news?action=new');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left"
                >
                  <span>📰</span>
                  <span>+ News Article</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddOpen(false);
                    router.push('/admin/blogs?action=new');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left"
                >
                  <span>✍️</span>
                  <span>+ Blog Post</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickAddOpen(false);
                    router.push('/admin/careers?action=new');
                  }}
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
            title="Flush Redis cache & sync with Public Website"
            className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 disabled:opacity-50 text-slate-300 hover:text-white border border-slate-800 rounded-xl text-xs font-medium transition-colors"
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
            <span className="hidden lg:inline">{isFlushing ? 'Flushing...' : 'Flush Cache'}</span>
          </button>

          {/* Live Site Link */}
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open live public website in new tab"
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-600/30 rounded-xl text-xs font-semibold transition-colors"
          >
            <span>Live Site</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>

          {/* User Profile Menu */}
          <div className="relative pl-1 sm:pl-2 border-l border-slate-800/80" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-900 rounded-xl transition-colors text-left"
              aria-label="User profile menu"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 border border-sky-500/30 flex items-center justify-center text-xs font-black text-white shadow-sm">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="hidden 2xl:flex flex-col text-left">
                <span className="text-xs font-semibold text-white leading-tight truncate max-w-[100px]">
                  {user?.name || 'Admin'}
                </span>
                <span className="text-[10px] text-sky-400 font-mono leading-tight">
                  {user?.role || 'superuser'}
                </span>
              </div>
              <svg
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  userMenuOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-[#071524] border border-slate-700/90 rounded-2xl shadow-2xl py-2 z-50 text-xs font-medium animate-in fade-in zoom-in-95 duration-150">
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
                    <span>Site Configuration</span>
                  </Link>
                  <Link
                    href="/admin/settings/contact"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Contact Settings</span>
                  </Link>

                  <div className="h-px bg-slate-800 my-1" />

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

          {/* HAMBURGER BUTTON — ALWAYS AT THE FAR RIGHT END FOR ALL SCREEN SIZES */}
          <button
            type="button"
            onClick={toggleNav}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              isOpen
                ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-950'
                : 'bg-slate-900/90 text-slate-200 border-slate-800 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
            aria-label="Toggle Complete Navigation Drawer"
            title="Open Complete CMS Navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
