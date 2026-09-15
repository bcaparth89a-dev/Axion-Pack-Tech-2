'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdminMobileNav } from '@/context/AdminMobileNavContext';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { flushPublicCache } from '@/lib/api/admin';
import { useToast } from '@/context/ToastContext';

interface DrawerNavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  exact?: boolean;
}

interface DrawerSection {
  title: string;
  id: string;
  items: DrawerNavItem[];
}

export const AdminRightDrawer: React.FC = () => {
  const pathname = usePathname();
  const { isOpen, closeNav } = useAdminMobileNav();
  const { user, logout } = useAdminAuth();
  const { showToast } = useToast();

  const [searchFilter, setSearchFilter] = useState('');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isFlushing, setIsFlushing] = useState(false);

  // Close drawer on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeNav();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Lock body scroll when drawer is open
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeNav]);

  const sections: DrawerSection[] = [
    {
      title: 'MAIN',
      id: 'main',
      items: [
        {
          label: 'Dashboard Overview',
          href: '/admin',
          icon: '📊',
          exact: true,
        },
      ],
    },
    {
      title: 'CATALOG',
      id: 'catalog',
      items: [
        {
          label: 'Equipment Catalog',
          href: '/admin/product-pages',
          icon: '📦',
          badge: 'Hierarchy',
        },
        {
          label: 'Categories',
          href: '/admin/product-pages?filter=categories',
          icon: '📁',
        },
        {
          label: 'Products',
          href: '/admin/product-pages?filter=products',
          icon: '⚙️',
        },
        {
          label: 'Models',
          href: '/admin/product-pages?filter=models',
          icon: '🏷️',
        },
      ],
    },
    {
      title: 'CONTENT',
      id: 'content',
      items: [
        {
          label: 'Home Page CMS',
          href: '/admin/pages/home',
          icon: '🏠',
        },
        {
          label: 'About Page CMS',
          href: '/admin/pages/about',
          icon: '🏢',
        },
        {
          label: 'News & Press',
          href: '/admin/news',
          icon: '📰',
        },
        {
          label: 'Blogs & Insights',
          href: '/admin/blogs',
          icon: '✍️',
        },
        {
          label: 'Category Hero CMS',
          href: '/admin/pages/category-hero',
          icon: '🖼️',
        },
        {
          label: 'Performance Statistics',
          href: '/admin/pages/stats',
          icon: '📈',
        },
        {
          label: 'Corporate Responsibilities',
          href: '/admin/pages/responsibilities',
          icon: '🌱',
        },
      ],
    },
    {
      title: 'BUSINESS',
      id: 'business',
      items: [
        {
          label: 'Industries Solutions',
          href: '/admin/industries',
          icon: '🏭',
        },
        {
          label: 'Engineering Services',
          href: '/admin/services',
          icon: '🔧',
        },
      ],
    },
    {
      title: 'CAREERS',
      id: 'careers',
      items: [
        {
          label: 'Job Openings',
          href: '/admin/careers',
          icon: '💼',
        },
        {
          label: 'Candidate Applications',
          href: '/admin/applications',
          icon: '📄',
          badge: 'Applicants',
        },
      ],
    },
    {
      title: 'OPERATIONS',
      id: 'operations',
      items: [
        {
          label: 'Media Library',
          href: '/admin/media',
          icon: '🖼️',
        },
        {
          label: 'Catalog Leads & Requests',
          href: '/admin/inquiries',
          icon: '📬',
          badge: 'Leads',
        },
      ],
    },
    {
      title: 'SYSTEM',
      id: 'system',
      items: [
        {
          label: 'Site Configuration',
          href: '/admin/settings/site',
          icon: '⚙️',
        },
        {
          label: 'Contact Information',
          href: '/admin/settings/contact',
          icon: '📍',
        },
      ],
    },
  ];

  const isItemActive = (item: DrawerNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    const cleanHref = item.href.split('?')[0];
    return pathname.startsWith(cleanHref);
  };

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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

  return (
    <>
      {/* Subtle Backdrop - Closes on click */}
      <div
        onClick={closeNav}
        className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Right Slide-Over Navigation Drawer */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-full sm:w-96 max-w-full bg-[#050e18] border-l border-slate-800/90 shadow-2xl flex flex-col transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Admin Complete Navigation Drawer"
      >
        {/* Drawer Header */}
        <div className="h-16 px-5 border-b border-slate-800/90 flex items-center justify-between bg-[#030910] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-sky-500/20">
              AX
            </div>
            <div>
              <h2 className="text-xs font-black tracking-tight text-white uppercase">
                AXION PackTech CMS
              </h2>
              <span className="text-[10px] text-sky-400 font-semibold tracking-wider uppercase">
                All Modules & Services
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={closeNav}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close navigation drawer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input within Drawer */}
        <div className="p-3 border-b border-slate-800/80 bg-[#06121f] shrink-0">
          <div className="relative">
            <svg
              className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Quick find admin page..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {sections.map((section) => {
            const isCollapsed = collapsedSections[section.id];
            const filteredItems = section.items.filter((item) =>
              item.label.toLowerCase().includes(searchFilter.toLowerCase())
            );

            if (searchFilter && filteredItems.length === 0) {
              return null;
            }

            return (
              <div key={section.id} className="space-y-1">
                {/* Section Header with Expand/Collapse */}
                <div
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between px-2.5 py-1 text-[10px] font-extrabold tracking-widest text-slate-400 uppercase cursor-pointer hover:text-slate-200 select-none group"
                >
                  <span className="group-hover:text-sky-400 transition-colors">{section.title}</span>
                  <svg
                    className={`w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-transform duration-200 ${
                      isCollapsed ? '-rotate-90' : 'rotate-0'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Items List */}
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {filteredItems.map((item) => {
                      const active = isItemActive(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeNav}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                            active
                              ? 'bg-sky-500/20 text-white border border-sky-500/40 shadow-sm'
                              : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-sm shrink-0">{item.icon}</span>
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                active
                                  ? 'bg-sky-500 text-white'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Utility Actions in Drawer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#06121f] space-y-2 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleFlushCache}
              disabled={isFlushing}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold transition-colors"
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
              <span>{isFlushing ? 'Flushing...' : 'Flush Cache'}</span>
            </button>

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeNav}
              className="flex items-center justify-center gap-1.5 px-3 py-2 bg-sky-950/60 hover:bg-sky-900/60 text-sky-300 border border-sky-600/30 rounded-xl text-xs font-semibold transition-colors"
            >
              <span>Live Website</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Drawer Footer with Admin Profile & Sign Out */}
        <div className="p-4 border-t border-slate-800/90 bg-[#030910] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@axionpacktech.com'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              closeNav();
              logout();
            }}
            className="p-2 rounded-xl text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors shrink-0"
            title="Log Out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>
    </>
  );
};
