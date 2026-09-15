import Link from 'next/link';
import { BreadcrumbItem } from '@/types/products';

interface ProductBreadcrumbsProps {
  breadcrumbs: BreadcrumbItem[];
  className?: string;
}

export default function ProductBreadcrumbs({ breadcrumbs, className = '' }: ProductBreadcrumbsProps) {
  if (!breadcrumbs || breadcrumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`py-3 text-sm text-slate-400 font-medium overflow-x-auto whitespace-nowrap scrollbar-none ${className}`}
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/"
            className="hover:text-amber-400 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={`${item.path}-${index}`} className="flex items-center space-x-2">
              <svg
                className="w-3.5 h-3.5 text-slate-600 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>

              {isLast ? (
                <span
                  aria-current="page"
                  className="text-amber-400 font-semibold truncate max-w-[260px] sm:max-w-md inline-block"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="hover:text-amber-400 transition-colors truncate max-w-[200px] inline-block"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
