'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface AdminMobileNavContextType {
  isOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  toggleNav: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AdminMobileNavContext = createContext<AdminMobileNavContextType | undefined>(undefined);

export const AdminMobileNavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsedState] = useState(false);

  // Restore sidebar collapse state from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('axion_admin_sidebar_collapsed');
      if (saved !== null) {
        setIsSidebarCollapsedState(saved === 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  const openNav = useCallback(() => setIsOpen(true), []);
  const closeNav = useCallback(() => setIsOpen(false), []);
  const toggleNav = useCallback(() => setIsOpen((prev) => !prev), []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem('axion_admin_sidebar_collapsed', String(collapsed));
    } catch {
      // ignore
    }
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsedState((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('axion_admin_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return (
    <AdminMobileNavContext.Provider
      value={{
        isOpen,
        openNav,
        closeNav,
        toggleNav,
        isSidebarCollapsed,
        toggleSidebarCollapse,
        setSidebarCollapsed,
      }}
    >
      {children}
    </AdminMobileNavContext.Provider>
  );
};

export const useAdminMobileNav = (): AdminMobileNavContextType => {
  const context = useContext(AdminMobileNavContext);
  if (!context) {
    throw new Error('useAdminMobileNav must be used within an AdminMobileNavProvider');
  }
  return context;
};

