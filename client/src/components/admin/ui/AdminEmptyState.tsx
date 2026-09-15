'use client';

import React from 'react';

interface AdminEmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  icon = '📦',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}) => {
  return (
    <div className="w-full py-16 px-6 bg-[#071524]/60 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-[#0d2238] border border-slate-700/60 flex items-center justify-center text-3xl shadow-inner">
        {typeof icon === 'string' ? <span>{icon}</span> : icon}
      </div>

      <div className="max-w-md space-y-1.5">
        <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="flex items-center gap-3 pt-2">
          {secondaryActionLabel && onSecondaryAction && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold border border-slate-800 transition-colors"
            >
              {secondaryActionLabel}
            </button>
          )}

          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-950 transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span>+</span>
              <span>{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
