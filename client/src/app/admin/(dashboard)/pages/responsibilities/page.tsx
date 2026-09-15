'use client';

import React, { useEffect, useState } from 'react';
import { getResponsibilityPageAdmin, updateResponsibilityPageAdmin } from '@/lib/api/admin';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminLoadingState } from '@/components/admin/ui/AdminLoadingState';
import { useToast } from '@/context/ToastContext';

interface ResponsibilityData {
  intro?: {
    title?: string;
    subtitle?: string;
    description?: string;
  };
  commitments?: Array<{
    title: string;
    description: string;
  }>;
}

export default function AdminResponsibilitiesPageCMS() {
  const [data, setData] = useState<ResponsibilityData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getResponsibilityPageAdmin<ResponsibilityData>();
        setData(res || {});
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load Responsibilities page';
        showToast(msg, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateResponsibilityPageAdmin(data);
      showToast('Responsibilities content updated successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update Responsibilities page';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumbs={[{ label: 'Content', href: '/admin/pages/about' }, { label: 'Corporate Responsibilities' }]}
          title="Corporate Responsibilities CMS"
          description="Manage sustainability policies, environmental initiatives, and safety standards."
        />
        <AdminLoadingState type="form" count={2} message="Loading responsibilities content..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: 'Content', href: '/admin/pages/about' }, { label: 'Corporate Responsibilities' }]}
        title="Corporate Responsibilities CMS"
        badge="Policy Section"
        description="Manage corporate sustainability commitments, energy-efficient engineering standards, and operator safety protocols."
      >
        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-950 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>💾</span>
          )}
          <span>{isSaving ? 'Saving...' : 'Save Responsibilities'}</span>
        </button>
      </AdminPageHeader>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-emerald-400 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Core Responsibility Policy &amp; Vision
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Sustainability</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Policy Title</label>
            <input
              type="text"
              value={data.intro?.title || ''}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, title: e.target.value },
                }))
              }
              placeholder="Commitment to Sustainable Machinery Engineering"
              className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Subheadline</label>
            <input
              type="text"
              value={data.intro?.subtitle || ''}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, subtitle: e.target.value },
                }))
              }
              placeholder="Minimizing environmental footprint while maximizing plant output"
              className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Policy Statement &amp; Details</label>
            <textarea
              rows={5}
              value={data.intro?.description || ''}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, description: e.target.value },
                }))
              }
              placeholder="At AXION PackTech, sustainable manufacturing is embedded in our engineering lifecycle. We design high-efficiency servo drives..."
              className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-950 transition-all flex items-center gap-2 active:scale-95"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>💾</span>
            )}
            <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Responsibilities'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
