import type { Metadata } from 'next';
import { AdminAuthProvider } from '@/context/AdminAuthContext';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'AXION PackTech | Admin Management Portal',
  description: 'Enterprise Administrative Management Console for AXION PackTech',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-white">
          {children}
        </div>
      </ToastProvider>
    </AdminAuthProvider>
  );
}
