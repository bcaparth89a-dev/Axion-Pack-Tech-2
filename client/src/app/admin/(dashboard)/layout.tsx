'use client';

import React from 'react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { AdminTopNavbar } from '@/components/admin/ui/AdminTopNavbar';
import { AdminRightDrawer } from '@/components/admin/ui/AdminRightDrawer';
import { AdminMobileNavProvider } from '@/context/AdminMobileNavContext';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#030910] text-slate-400 gap-4">
        <div className="w-10 h-10 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 font-mono">
          Loading AXION Admin Portal...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled by AdminAuthContext
  }

  return (
    <AdminMobileNavProvider>
      <div className="min-h-screen bg-[#030910] text-slate-100 flex flex-col antialiased selection:bg-sky-500 selection:text-white">
        {/* Full-Width Top Bar Navigation */}
        <AdminTopNavbar />

        {/* Slide-Over Navigation Drawer for all CMS modules */}
        <AdminRightDrawer />

        {/* Full-Width Workspace Container */}
        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 min-w-0">
          <div className="w-full max-w-[1920px] mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </AdminMobileNavProvider>
  );
}


