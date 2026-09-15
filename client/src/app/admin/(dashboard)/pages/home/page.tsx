'use client';

import React, { useEffect, useState } from 'react';
import { getHomePageAdmin, updateHomePageAdmin } from '@/lib/api/admin';
import { AdminMediaPicker } from '@/components/admin/ui/AdminMediaPicker';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminLoadingState } from '@/components/admin/ui/AdminLoadingState';
import { useToast } from '@/context/ToastContext';

interface HomePageData {
  hero?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    ctaPrimaryText?: string;
    ctaPrimaryLink?: string;
    ctaSecondaryText?: string;
    ctaSecondaryLink?: string;
    primaryButtonText?: string;
    primaryButtonLink?: string;
    secondaryButtonText?: string;
    secondaryButtonLink?: string;
    videoLandscapeUrl?: string;
    videoPortraitUrl?: string;
  };
  intro?: {
    badge?: string;
    tagline?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    points?: string[];
  };
}

export default function AdminHomePageCMS() {
  const [data, setData] = useState<HomePageData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getHomePageAdmin<HomePageData>();
        setData(res || {});
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load Home page data';
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
      await updateHomePageAdmin(data);
      showToast('Home page content and media updated successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update Home page';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumbs={[{ label: 'Content', href: '/admin/pages/home' }, { label: 'Home Page CMS' }]}
          title="Home Page CMS"
          description="Configure main hero splash videos, headlines, intro section, and action buttons."
        />
        <AdminLoadingState type="form" count={3} message="Loading Home Page content..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: 'Content', href: '/admin/pages/home' }, { label: 'Home Page CMS' }]}
        title="Home Page CMS"
        badge="Live Section"
        description="Configure the primary hero splash videos, headlines, intro section, and key capabilities for the AXION PackTech homepage."
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
          <span>{isSaving ? 'Saving Changes...' : 'Save Home Page'}</span>
        </button>
      </AdminPageHeader>

      <form onSubmit={handleSave} className="space-y-6">
        {/* BLOCK 1: HERO SPLASH & HEADLINE */}
        <div className="p-6 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-sky-400 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              Hero Section Configuration &amp; Splash Media
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Top Block</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Hero Badge</label>
              <input
                type="text"
                value={data.hero?.badge || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, badge: e.target.value },
                  }))
                }
                placeholder="Engineered for High-Speed Performance"
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Main Headline Title</label>
              <input
                type="text"
                value={data.hero?.title || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, title: e.target.value },
                  }))
                }
                placeholder="Industrial Packaging & Bagging Systems"
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Hero Subtitle</label>
            <textarea
              rows={2}
              value={data.hero?.subtitle || ''}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, subtitle: e.target.value },
                }))
              }
              placeholder="Precision-engineered packaging and material handling machinery built for modern industrial factories..."
              className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Primary CTA Label</label>
              <input
                type="text"
                value={data.hero?.primaryButtonText || data.hero?.ctaPrimaryText || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, primaryButtonText: e.target.value, ctaPrimaryText: e.target.value },
                  }))
                }
                placeholder="Explore Machinery Catalog"
                className="w-full px-3.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Primary CTA Link</label>
              <input
                type="text"
                value={data.hero?.primaryButtonLink || data.hero?.ctaPrimaryLink || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    hero: { ...prev.hero, primaryButtonLink: e.target.value, ctaPrimaryLink: e.target.value },
                  }))
                }
                placeholder="/products"
                className="w-full px-3.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Hero Splash Video Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <AdminMediaPicker
              label="Desktop Hero Splash Video"
              description="High-definition 16:9 landscape splash video for desktop monitors"
              type="video"
              folder="home/hero"
              value={data.hero?.videoLandscapeUrl || '/landscape splash screen.mp4'}
              onChange={(url) =>
                setData((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, videoLandscapeUrl: url },
                }))
              }
            />

            <AdminMediaPicker
              label="Mobile Hero Splash Video"
              description="Vertical 9:16 portrait video optimized for mobile devices"
              type="video"
              folder="home/hero"
              value={data.hero?.videoPortraitUrl || '/portrait splash screen.mp4'}
              onChange={(url) =>
                setData((prev) => ({
                  ...prev,
                  hero: { ...prev.hero, videoPortraitUrl: url },
                }))
              }
            />
          </div>
        </div>

        {/* BLOCK 2: COMPANY INTRODUCTION */}
        <div className="p-6 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-cyan-400 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              Company Introduction Section
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Overview Block</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Intro Badge / Tagline</label>
              <input
                type="text"
                value={data.intro?.tagline || data.intro?.badge || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    intro: { ...prev.intro, tagline: e.target.value, badge: e.target.value },
                  }))
                }
                placeholder="About AXION PackTech"
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Intro Headline</label>
              <input
                type="text"
                value={data.intro?.title || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    intro: { ...prev.intro, title: e.target.value },
                  }))
                }
                placeholder="Pioneering Precision Packaging Systems Since 2012"
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Intro Description</label>
            <textarea
              rows={4}
              value={data.intro?.description || ''}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  intro: { ...prev.intro, description: e.target.value },
                }))
              }
              placeholder="AXION PackTech is an industry leader in end-to-end secondary packaging automation, high-speed baggers, conveyor lines..."
              className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Sticky Save Bar */}
        <div className="sticky bottom-4 z-30 p-4 bg-[#050e18]/95 backdrop-blur-md border border-slate-700/90 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-300 font-medium hidden sm:inline">
              Changes ready to sync with live website
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-950 transition-all flex items-center gap-2 active:scale-95"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>💾</span>
              )}
              <span>{isSaving ? 'Saving Changes...' : 'Save & Publish Home Page'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
