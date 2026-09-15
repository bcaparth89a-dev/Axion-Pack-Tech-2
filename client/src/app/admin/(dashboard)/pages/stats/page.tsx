'use client';

import React, { useEffect, useState } from 'react';
import { getCompanyStatsAdmin, updateCompanyStatsAdmin } from '@/lib/api/admin';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminLoadingState } from '@/components/admin/ui/AdminLoadingState';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';
import { useToast } from '@/context/ToastContext';

interface StatItem {
  label: string;
  value: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  sortOrder?: number;
}

interface StatsData {
  stats?: StatItem[];
  isActive?: boolean;
}

export default function AdminCompanyStatsPageCMS() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getCompanyStatsAdmin<StatsData>();
        setStats(res?.stats || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load company stats';
        showToast(msg, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  const handleStatChange = (idx: number, field: keyof StatItem, val: string) => {
    setStats((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleAddStat = () => {
    setStats((prev) => [
      ...prev,
      { label: 'New Metric', value: '100', suffix: '+', description: '', sortOrder: prev.length + 1 },
    ]);
  };

  const handleRemoveStat = (idx: number) => {
    setStats((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      await updateCompanyStatsAdmin({ stats });
      showToast('Company statistics updated successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update stats';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumbs={[{ label: 'Content', href: '/admin/pages/about' }, { label: 'Performance Statistics' }]}
          title="Company Statistics & Achievements"
          description="Key performance indicators and achievement metrics featured across the AXION website."
        />
        <AdminLoadingState type="cards" count={4} message="Loading metrics from database..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: 'Content', href: '/admin/pages/about' }, { label: 'Performance Statistics' }]}
        title="Company Statistics & Achievements"
        badge={`${stats.length} Metrics`}
        description="Configure corporate metrics, installations completed, countries served, and manufacturing capacities displayed on the live website."
      >
        <button
          type="button"
          onClick={handleAddStat}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <span className="text-sm font-black">+</span>
          <span>Add Metric</span>
        </button>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={isSaving}
          className="px-5 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-950 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>💾</span>
          )}
          <span>{isSaving ? 'Saving...' : 'Save Statistics'}</span>
        </button>
      </AdminPageHeader>

      {stats.length === 0 ? (
        <AdminEmptyState
          icon="📈"
          title="No Corporate Metrics Configured"
          description="Create your first achievement counter to display on the public homepage and about page."
          actionLabel="Add Metric"
          onAction={handleAddStat}
        />
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-5 bg-[#071524] border border-slate-800 rounded-2xl space-y-3 relative group shadow-lg"
              >
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider">
                    Metric #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg text-xs transition-colors"
                    title="Remove metric"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Metric Label *</label>
                  <input
                    type="text"
                    required
                    value={stat.label}
                    onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                    placeholder="e.g. Machinery Installations"
                    className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Prefix</label>
                    <input
                      type="text"
                      value={stat.prefix || ''}
                      onChange={(e) => handleStatChange(idx, 'prefix', e.target.value)}
                      placeholder="e.g. >"
                      className="w-full px-2.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white text-center focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Value *</label>
                    <input
                      type="text"
                      required
                      value={stat.value}
                      onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                      placeholder="500"
                      className="w-full px-2.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white text-center font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Suffix</label>
                    <input
                      type="text"
                      value={stat.suffix || ''}
                      onChange={(e) => handleStatChange(idx, 'suffix', e.target.value)}
                      placeholder="+"
                      className="w-full px-2.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white text-center focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">Description (Optional)</label>
                  <input
                    type="text"
                    value={stat.description || ''}
                    onChange={(e) => handleStatChange(idx, 'description', e.target.value)}
                    placeholder="Across 14+ industrial sectors"
                    className="w-full px-3 py-1.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Statistics'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
