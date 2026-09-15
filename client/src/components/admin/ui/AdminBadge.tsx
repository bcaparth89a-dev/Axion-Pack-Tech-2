import React from 'react';

export interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
}

export const AdminBadge: React.FC<AdminBadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
}) => {
  const variantStyles = {
    default: 'bg-slate-800 text-slate-200 border-slate-700',
    success: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-950/80 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-950/80 text-rose-300 border-rose-500/30',
    info: 'bg-sky-950/80 text-sky-300 border-sky-500/30',
    neutral: 'bg-slate-900 text-slate-400 border-slate-800',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium uppercase tracking-wider ${variantStyles[variant]} ${sizeStyles[size]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success'
            ? 'bg-emerald-400'
            : variant === 'warning'
            ? 'bg-amber-400'
            : variant === 'danger'
            ? 'bg-rose-400'
            : variant === 'info'
            ? 'bg-sky-400'
            : 'bg-slate-400'
        }`}
      />
      {children}
    </span>
  );
};
