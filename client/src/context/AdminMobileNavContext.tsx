'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface AdminMobileNavContextType {
  isOpen: boolean;
  openNav: () => void;
  closeNav: () => void;
  toggleNav: () => void;
}

const AdminMobileNavContext = createContext<AdminMobileNavContextType | undefined>(undefined);

export const AdminMobileNavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openNav = useCallback(() => setIsOpen(true), []);
  const closeNav = useCallback(() => setIsOpen(false), []);
  const toggleNav = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <AdminMobileNavContext.Provider value={{ isOpen, openNav, closeNav, toggleNav }}>
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
