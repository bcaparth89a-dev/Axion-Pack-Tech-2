'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToProductPages() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/product-pages');
  }, [router]);

  return (
    <div className="p-8 text-center text-slate-400 text-sm">
      Redirecting to Product Pages CMS...
    </div>
  );
}
