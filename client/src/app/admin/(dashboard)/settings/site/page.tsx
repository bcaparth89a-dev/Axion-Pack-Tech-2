'use client';

import React, { useEffect, useState } from 'react';
import { getSiteSettingsAdmin, updateSiteSettingsAdmin } from '@/lib/api/admin';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminLoadingState } from '@/components/admin/ui/AdminLoadingState';
import { useToast } from '@/context/ToastContext';

interface SiteSettingsData {
  siteName?: string;
  siteTitle?: string;
  logoUrl?: string;
  faviconUrl?: string;
  metaDescription?: string;
  copyrightText?: string;
  footerTagline?: string;
  maintenanceMode?: boolean;
}

export default function AdminSiteSettingsPage() {
  const [data, setData] = useState<SiteSettingsData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getSiteSettingsAdmin<SiteSettingsData>();
        setData(res || {});
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load site settings';
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
      await updateSiteSettingsAdmin(data);
      showToast('Global site settings updated successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update site settings';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumbs={[{ label: 'System Settings', href: '/admin/settings/site' }, { label: 'Site Configuration' }]}
          title="Global Site Configuration"
          description="Default metadata, branding assets, copyright notices, and system status."
        />
        <AdminLoadingState type="form" count={3} message="Loading site configuration..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: 'System Settings', href: '/admin/settings/site' }, { label: 'Site Configuration' }]}
        title="Global Site Configuration"
        badge="System"
        description="Configure brand identifiers, default browser titles, copyright notices, and maintenance status across the AXION platform."
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
          <span>{isSaving ? 'Saving...' : 'Save Site Settings'}</span>
        </button>
      </AdminPageHeader>

      <form onSubmit={handleSave} className="space-y-6">
        {/* BRAND & TITLES */}
        <div className="p-6 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-sky-400 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              General Brand &amp; SEO Identification
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Branding</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Company / Brand Name *</label>
              <input
                type="text"
                required
                value={data.siteName || ''}
                onChange={(e) => setData((prev) => ({ ...prev, siteName: e.target.value }))}
                placeholder="AXION PackTech"
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Global Title Suffix *</label>
              <input
                type="text"
                required
                value={data.siteTitle || ''}
                onChange={(e) => setData((prev) => ({ ...prev, siteTitle: e.target.value }))}
                placeholder="AXION PackTech | Packaging & Processing Machinery"
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Default Meta Description</label>
            <textarea
              rows={3}
              value={data.metaDescription || ''}
              onChange={(e) => setData((prev) => ({ ...prev, metaDescription: e.target.value }))}
              placeholder="Leading manufacturer of high-performance industrial packaging machinery, bagging systems, and automated conveyors in India..."
              className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Footer Tagline</label>
              <input
                type="text"
                value={data.footerTagline || ''}
                onChange={(e) => setData((prev) => ({ ...prev, footerTagline: e.target.value }))}
                placeholder="Next-Generation Packaging Machinery Engineering"
                className="w-full px-3.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Copyright Statement</label>
              <input
                type="text"
                value={data.copyrightText || ''}
                onChange={(e) => setData((prev) => ({ ...prev, copyrightText: e.target.value }))}
                placeholder="© 2026 AXION PackTech Pvt. Ltd. All rights reserved."
                className="w-full px-3.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="p-6 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-amber-400 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              System Status &amp; Maintenance Mode
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Control</span>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={data.maintenanceMode || false}
                onChange={(e) => setData((prev) => ({ ...prev, maintenanceMode: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-950"
              />
              <div>
                <span className="text-xs font-bold text-white block">Enable Public Maintenance Mode</span>
                <span className="text-[11px] text-slate-400 block">
                  When enabled, public visitors will see a maintenance notice while admin users retain full dashboard access.
                </span>
              </div>
            </label>
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
            <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
