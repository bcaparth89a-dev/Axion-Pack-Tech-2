'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAllServicesAdmin,
  createServiceAdmin,
  updateServiceAdmin,
  reorderServicesAdmin,
  deleteServiceAdmin,
} from '@/lib/api/admin';
import { Service, ServiceSolution, ServiceStat } from '@/data/services';
import { AdminTable } from '@/components/admin/ui/AdminTable';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminMediaPicker } from '@/components/admin/ui/AdminMediaPicker';
import { useToast } from '@/context/ToastContext';


const PRESET_ICONS = ['🔧', '🛠️', '🎧', '⚙️', '🔄', '📐', '🚀', '⚡', '🏗️', '🔬', '📦', '💡', '🤖', '📊', '🛡️', '🏭'];

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'content' | 'capabilities' | 'seo'>('basic');
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const { showToast } = useToast();

  // Dynamic Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    heroTitle: '',
    heroDescription: '',
    heroImage: '/images/services/engineering-design.webp',
    heroVideo: '',
    overview: '',
    description: '',
    icon: '🔧',
    image: '/images/services/engineering-design.webp',
    capabilities: [] as string[],
    features: [] as string[],
    benefits: [] as string[],
    process: [] as string[],
    solutions: [] as ServiceSolution[],
    relatedProducts: [] as string[],
    relatedIndustries: [] as string[],
    stats: [] as ServiceStat[],
    cta: {
      title: 'Need Support for Your Production System?',
      description: 'Talk to our engineering team to discuss your production requirements and discover the right solution for your operation.',
      buttonText: 'Request a Quote',
      buttonLink: '/contact',
    },
    published: true,
    featured: false,
    sortOrder: 1,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[],
    },
  });

  // Temp inputs for adding array items
  const [newFeature, setNewFeature] = useState('');
  const [newCapability, setNewCapability] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newProcessStep, setNewProcessStep] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newSolTitle, setNewSolTitle] = useState('');
  const [newSolDesc, setNewSolDesc] = useState('');
  const [newStatLabel, setNewStatLabel] = useState('');
  const [newStatValue, setNewStatValue] = useState('');

  const triggerRevalidation = async () => {
    try {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/services', tag: 'services' }),
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('services-updated'));
      }
    } catch {
      // Silently handle revalidation errors
    }
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllServicesAdmin();
      const sorted = (data || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setServices(sorted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load services';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setActiveTab('basic');
    setFormData({
      title: '',
      slug: '',
      shortDescription: '',
      heroTitle: '',
      heroDescription: '',
      heroImage: '/images/services/engineering-design.webp',
      heroVideo: '',
      overview: '',
      description: '',
      icon: '🔧',
      image: '/images/services/engineering-design.webp',
      capabilities: [
        'Custom machine design',
        'Plant layout planning',
        'Production line integration',
      ],
      features: [
        'Technical consultation',
        'Capacity optimization',
        'Future expansion planning',
      ],
      benefits: [
        'Maximum equipment availability',
        'Reduced production downtime',
        'Seamless system integration',
      ],
      process: [
        'Initial Consultation & Layout Analysis',
        'Custom System Engineering & Blueprinting',
        'Onsite Implementation & Trial Runs',
      ],
      solutions: [
        {
          title: 'Turnkey Line Integration',
          description: 'End-to-end integration designed to maximize output and operational uptime.',
        },
      ],
      relatedProducts: [],
      relatedIndustries: [],
      stats: [
        { label: 'OEE Optimization', value: '99.2%' },
        { label: 'Technical Response', value: '24/7' },
      ],
      cta: {
        title: 'Need Support for Your Production System?',
        description: 'Talk to our engineering team to discuss your production requirements and discover the right solution for your operation.',
        buttonText: 'Request a Quote',
        buttonLink: '/contact',
      },
      published: true,
      featured: false,
      sortOrder: services.length + 1,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: [],
      },
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingService(srv);
    setActiveTab('basic');
    setFormData({
      title: srv.title || '',
      slug: srv.slug || '',
      shortDescription: srv.shortDescription || '',
      heroTitle: srv.heroTitle || '',
      heroDescription: srv.heroDescription || '',
      heroImage: srv.heroImage || srv.image || '/images/services/engineering-design.webp',
      heroVideo: srv.heroVideo || '',
      overview: srv.overview || '',
      description: srv.description || '',
      icon: srv.icon || '🔧',
      image: srv.image || '/images/services/engineering-design.webp',
      capabilities: Array.isArray(srv.capabilities) ? [...srv.capabilities] : [],
      features: Array.isArray(srv.features) ? [...srv.features] : [],
      benefits: Array.isArray(srv.benefits) ? [...srv.benefits] : [],
      process: Array.isArray(srv.process) ? [...srv.process] : [],
      solutions: Array.isArray(srv.solutions)
        ? srv.solutions.map((s) => (typeof s === 'string' ? { title: s, description: '' } : { ...s }))
        : [],
      relatedProducts: Array.isArray(srv.relatedProducts) ? [...srv.relatedProducts] : [],
      relatedIndustries: Array.isArray(srv.relatedIndustries) ? [...srv.relatedIndustries] : [],
      stats: Array.isArray(srv.stats) ? [...srv.stats] : [],
      cta: {
        title: srv.cta?.title || 'Need Support for Your Production System?',
        description: srv.cta?.description || 'Talk to our engineering team to discuss your production requirements and discover the right solution for your operation.',
        buttonText: srv.cta?.buttonText || 'Request a Quote',
        buttonLink: srv.cta?.buttonLink || '/contact',
      },
      published: srv.published !== false,
      featured: srv.featured || false,
      sortOrder: srv.sortOrder || 1,
      seo: {
        metaTitle: srv.seo?.metaTitle || '',
        metaDescription: srv.seo?.metaDescription || '',
        keywords: Array.isArray(srv.seo?.keywords) ? [...srv.seo.keywords] : [],
      },
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) {
      showToast('Service title and slug are required.', 'warning');
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      showToast('Service description must be at least 10 characters.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.toLowerCase().trim(),
        shortDescription: formData.shortDescription.trim(),
        heroTitle: formData.heroTitle.trim() || formData.title.trim(),
        heroDescription: formData.heroDescription.trim() || formData.shortDescription.trim(),
        heroImage: formData.heroImage.trim() || formData.image.trim(),
        heroVideo: formData.heroVideo.trim(),
        overview: formData.overview.trim(),
        description: formData.description.trim(),
        icon: formData.icon.trim() || '🔧',
        image: formData.image.trim() || '/images/services/engineering-design.webp',
        capabilities: formData.capabilities,
        features: formData.features,
        benefits: formData.benefits,
        process: formData.process,
        solutions: formData.solutions,
        relatedProducts: formData.relatedProducts,
        relatedIndustries: formData.relatedIndustries,
        stats: formData.stats,
        cta: formData.cta,
        published: formData.published,
        featured: formData.featured,
        sortOrder: Number(formData.sortOrder) || 1,
        seo: {
          metaTitle: formData.seo.metaTitle.trim(),
          metaDescription: formData.seo.metaDescription.trim(),
          keywords: formData.seo.keywords,
        },
      };

      if (editingService) {
        await updateServiceAdmin(editingService.slug, payload);
        showToast(`Service "${formData.title}" updated successfully`, 'success');
      } else {
        await createServiceAdmin(payload);
        showToast(`Service "${formData.title}" created successfully`, 'success');
      }

      await triggerRevalidation();
      setModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save service';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (srv: Service) => {
    try {
      const nextStatus = !srv.published;
      await updateServiceAdmin(srv.slug, { published: nextStatus });
      showToast(`Service "${srv.title}" marked as ${nextStatus ? 'Active' : 'Draft'}`, 'info');
      await triggerRevalidation();
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      showToast(msg, 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    if (isReordering) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= services.length) return;

    setIsReordering(true);
    try {
      const reorderedList = [...services];
      const itemToMove = reorderedList[index];
      reorderedList.splice(index, 1);
      reorderedList.splice(targetIndex, 0, itemToMove);

      const orders = reorderedList.map((item, idx) => ({
        slug: item.slug,
        sortOrder: idx + 1,
      }));

      await reorderServicesAdmin(orders);
      showToast('Service display order updated', 'success');
      await triggerRevalidation();
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reorder services';
      showToast(msg, 'error');
    } finally {
      setIsReordering(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await deleteServiceAdmin(slug);
      showToast('Service deleted successfully', 'success');
      setDeleteConfirmSlug(null);
      await triggerRevalidation();
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete service';
      showToast(msg, 'error');
    }
  };

  // Helper additions for arrays
  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData((prev) => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
    setNewFeature('');
  };

  const removeFeature = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const addCapability = () => {
    if (!newCapability.trim()) return;
    setFormData((prev) => ({ ...prev, capabilities: [...prev.capabilities, newCapability.trim()] }));
    setNewCapability('');
  };

  const removeCapability = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.filter((_, i) => i !== idx),
    }));
  };

  const addBenefit = () => {
    if (!newBenefit.trim()) return;
    setFormData((prev) => ({ ...prev, benefits: [...prev.benefits, newBenefit.trim()] }));
    setNewBenefit('');
  };

  const removeBenefit = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== idx),
    }));
  };

  const addProcessStep = () => {
    if (!newProcessStep.trim()) return;
    setFormData((prev) => ({ ...prev, process: [...prev.process, newProcessStep.trim()] }));
    setNewProcessStep('');
  };

  const removeProcessStep = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      process: prev.process.filter((_, i) => i !== idx),
    }));
  };

  const addSolution = () => {
    if (!newSolTitle.trim()) return;
    setFormData((prev) => ({
      ...prev,
      solutions: [...prev.solutions, { title: newSolTitle.trim(), description: newSolDesc.trim() }],
    }));
    setNewSolTitle('');
    setNewSolDesc('');
  };

  const removeSolution = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      solutions: prev.solutions.filter((_, i) => i !== idx),
    }));
  };

  const addStat = () => {
    if (!newStatLabel.trim() || !newStatValue.trim()) return;
    setFormData((prev) => ({
      ...prev,
      stats: [...prev.stats, { label: newStatLabel.trim(), value: newStatValue.trim() }],
    }));
    setNewStatLabel('');
    setNewStatValue('');
  };

  const removeStat = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== idx),
    }));
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: [...(prev.seo.keywords || []), newKeyword.trim()],
      },
    }));
    setNewKeyword('');
  };

  const removeKeyword = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        keywords: (prev.seo.keywords || []).filter((_, i) => i !== idx),
      },
    }));
  };

  // Filter logic
  const filtered = services.filter((srv) => {
    const matchesSearch =
      srv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (srv.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'published') return srv.published !== false;
    if (statusFilter === 'draft') return srv.published === false;
    return true;
  });

  const publishedCount = services.filter((s) => s.published !== false).length;
  const draftCount = services.filter((s) => s.published === false).length;
  const totalCapabilities = services.reduce(
    (acc, curr) => acc + (curr.capabilities?.length || 0) + (curr.features?.length || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1E36] border border-sky-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Total Services</span>
            <span className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-300 text-sm">🔧</span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">{services.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Engineering offerings</span>
        </div>

        <div className="bg-[#0B1E36] border border-sky-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">Active & Live</span>
            <span className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-300 text-sm">✓</span>
          </div>
          <p className="text-3xl font-extrabold text-emerald-300 mt-3">{publishedCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Visible on website & navbar</span>
        </div>

        <div className="bg-[#0B1E36] border border-sky-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Draft / Hidden</span>
            <span className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-300 text-sm">🔒</span>
          </div>
          <p className="text-3xl font-extrabold text-amber-300 mt-3">{draftCount}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Hidden from public view</span>
        </div>

        <div className="bg-[#0B1E36] border border-sky-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-brand-orange uppercase tracking-wider">Total Capabilities</span>
            <span className="h-8 w-8 rounded-xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-sm">⚙️</span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">{totalCapabilities}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Key engineered deliverables</span>
        </div>
      </div>

      {/* 2. Services Table */}
      <AdminTable
        title="Engineering Services CMS"
        description="Manage turnkey engineering services, capabilities, process workflows, hero banners, and website display order."
        totalCount={filtered.length}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter services by title, slug or summary..."
        actionButton={
          <div className="flex items-center gap-2.5">
            {/* Status Filter Badges */}
            <div className="hidden sm:flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'all'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({services.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'published'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Active ({publishedCount})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('draft')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === 'draft'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Draft ({draftCount})
              </button>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/20 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>New Service</span>
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 w-20 text-center">Order</th>
                <th className="py-3.5 px-4">Service Offering</th>
                <th className="py-3.5 px-4">Slug & Route</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Capabilities</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((srv, idx) => (
                <tr key={srv.slug} className="hover:bg-slate-800/30 transition-colors group">
                  {/* Order & Reorder Controls */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-mono text-slate-400 text-xs w-5 font-bold">
                        {srv.sortOrder ?? idx + 1}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0 || isReordering}
                          onClick={() => handleMoveOrder(idx, 'up')}
                          className="p-1 hover:bg-slate-700 text-slate-400 hover:text-sky-300 disabled:opacity-20 rounded transition-colors"
                          title="Move up in display order"
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          disabled={idx === filtered.length - 1 || isReordering}
                          onClick={() => handleMoveOrder(idx, 'down')}
                          className="p-1 hover:bg-slate-700 text-slate-400 hover:text-sky-300 disabled:opacity-20 rounded transition-colors"
                          title="Move down in display order"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </td>

                  {/* Service Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700 text-lg shadow-sm">
                        {srv.icon || '🔧'}
                      </span>
                      <div className="min-w-0 max-w-sm">
                        <span className="font-bold text-white text-sm block truncate group-hover:text-sky-300 transition-colors">
                          {srv.title}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                          {srv.shortDescription || 'No summary description provided.'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Slug & Link */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/services/${srv.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 font-mono text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800/40 transition-colors"
                      title="Open dynamic customer page in new tab"
                    >
                      <span>/{srv.slug}</span>
                      <span className="text-[10px]">↗</span>
                    </Link>
                  </td>

                  {/* Status & Quick Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(srv)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border transition-all ${
                        srv.published !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                      title="Click to toggle status"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          srv.published !== false ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span>{srv.published !== false ? 'Active' : 'Draft'}</span>
                    </button>
                  </td>

                  {/* Capabilities Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-[11px] font-semibold">
                      {(srv.capabilities?.length || 0) + (srv.features?.length || 0)} Capabilities
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(srv)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-sky-600 hover:text-white text-sky-400 rounded-lg font-semibold transition-all shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSlug(srv.slug)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-600 hover:text-white text-rose-400 rounded-lg font-semibold transition-all shadow-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTable>

      {/* 3. Comprehensive Multi-Tab Form Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingService ? `Edit Service: ${editingService.title}` : 'Create New Engineering Service'}
        description="Configure complete content, capabilities, process steps, visual media, and SEO metadata."
        maxWidth="2xl"
      >
        {/* Modal Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'basic'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            1. Basic Info
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'media'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            2. Visuals & Media
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'content'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            3. Content & Description
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('capabilities')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'capabilities'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            4. Scope & Steps ({formData.features.length + formData.capabilities.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'seo'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            5. SEO & Settings
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* TAB 1: BASIC INFORMATION */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Service Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Packaging Automation"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title,
                        slug: editingService
                          ? prev.slug
                          : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 shadow-inner"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Route Slug * (alphanumeric with dashes)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. packaging-automation"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500 shadow-inner"
                  />
                  <span className="text-[10px] text-slate-500">
                    Live dynamic URL: <strong className="text-sky-400">/services/{formData.slug || 'slug'}</strong>
                  </span>
                </div>
              </div>

              {/* Icon Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Service Icon (Emoji or Symbol)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                    className="w-20 px-3.5 py-2.5 text-center text-lg bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_ICONS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, icon: preset }))}
                        className={`h-8 w-8 rounded-lg border text-sm flex items-center justify-center transition-all ${
                          formData.icon === preset
                            ? 'bg-sky-600 border-sky-400 scale-110'
                            : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Short Summary */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Short Summary (Shown in cards & navbar dropdown)</label>
                <input
                  type="text"
                  placeholder="Customized system design and plant integration tailored to your specific production..."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 shadow-inner"
                />
              </div>

              {/* Display Order & Status Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Display Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: Number(e.target.value) }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Publish Status</label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2 text-xs font-semibold text-slate-300">
                        {formData.published ? 'Live (Published)' : 'Draft (Hidden)'}
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Featured Service</label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-orange"></div>
                      <span className="ml-2 text-xs font-semibold text-slate-300">
                        {formData.featured ? 'Featured' : 'Standard'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VISUALS & MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <AdminMediaPicker
                label="Card / Main Thumbnail Image"
                description="Thumbnail image displayed across customer service catalogs, navbar dropdowns, and home cards"
                type="image"
                folder="services"
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                required
              />

              <AdminMediaPicker
                label="Hero Section Media (Image or Video)"
                description="Large visual banner for the top of the /services/[slug] dynamic page. Supports local images/videos, direct URLs, or YouTube/Vimeo embeds."
                type="both"
                folder="services/hero"
                value={formData.heroVideo || formData.heroImage}
                onChange={(url, meta) => {
                  if (meta?.type === 'video' || url.endsWith('.mp4') || url.endsWith('.webm') || url.includes('youtube') || url.includes('vimeo')) {
                    setFormData((prev) => ({ ...prev, heroVideo: url }));
                  } else {
                    setFormData((prev) => ({ ...prev, heroImage: url, heroVideo: '' }));
                  }
                }}
              />
            </div>
          )}


          {/* TAB 3: CONTENT & OVERVIEW */}
          {activeTab === 'content' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Hero Banner Title (Overrides service title if set)</label>
                <input
                  type="text"
                  placeholder="e.g. Turnkey Packaging Engineering & Automation"
                  value={formData.heroTitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroTitle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Hero Banner Tagline / Subtitle</label>
                <textarea
                  rows={2}
                  placeholder="Customized system design and plant integration tailored to your specific production requirements..."
                  value={formData.heroDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroDescription: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Service Overview Highlight Callout</label>
                <textarea
                  rows={2}
                  placeholder="AXION PackTech provides customized engineering and design solutions for industrial packaging..."
                  value={formData.overview}
                  onChange={(e) => setFormData((prev) => ({ ...prev, overview: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Full Detailed Description * (Multi-paragraph)</label>
                  <span className="text-[10px] text-slate-500 font-mono">Use bullet lists with • for auto-formatting</span>
                </div>
                <textarea
                  rows={8}
                  required
                  placeholder={`AXION PackTech provides customized engineering and design solutions...

Our engineering team works closely with customers to understand:
• Production capacity requirements
• Available plant space
• Product characteristics
• Material handling requirements

We design practical and efficient solutions that integrate seamlessly.`}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-sans leading-relaxed focus:outline-none focus:border-sky-500 shadow-inner"
                />
              </div>
            </div>
          )}

          {/* TAB 4: CAPABILITIES & PROCESS */}
          {activeTab === 'capabilities' && (
            <div className="space-y-6">
              {/* Features / Capabilities Checklist */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 block">Key Features / Capabilities Checklist</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Custom machine design"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={addFeature}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl"
                    >
                      <span>✓ {feat}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-slate-400 hover:text-rose-400 ml-1 text-sm font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical Capabilities */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Technical Scope Items</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. PLC & Servo Motion Programming"
                    value={newCapability}
                    onChange={(e) => setNewCapability(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCapability();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={addCapability}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.capabilities.map((cap, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl"
                    >
                      <span>⚙️ {cap}</span>
                      <button
                        type="button"
                        onClick={() => removeCapability(idx)}
                        className="text-slate-400 hover:text-rose-400 ml-1 text-sm font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Solutions & Deliverables */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Structured Engineered Solutions</label>
                <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    placeholder="Solution title (e.g. Robotic Line Automation)"
                    value={newSolTitle}
                    onChange={(e) => setNewSolTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="Solution scope & deliverable description..."
                    value={newSolDesc}
                    onChange={(e) => setNewSolDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={addSolution}
                      className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                    >
                      + Add Solution
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  {formData.solutions.map((sol, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-start justify-between gap-3"
                    >
                      <div>
                        <span className="font-bold text-white text-xs block">{sol.title}</span>
                        {sol.description && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">{sol.description}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSolution(idx)}
                        className="text-slate-400 hover:text-rose-400 text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Implementation Process Steps */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Workflow / Process Steps</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Mechanical Erection & Positioning"
                    value={newProcessStep}
                    onChange={(e) => setNewProcessStep(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addProcessStep();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={addProcessStep}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
                  >
                    + Add Step
                  </button>
                </div>
                <div className="space-y-1.5 pt-1">
                  {formData.process.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                    >
                      <span>
                        <strong className="text-amber-400 font-mono mr-2">0{idx + 1}.</strong> {step}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeProcessStep(idx)}
                        className="text-slate-400 hover:text-rose-400 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Core Benefits */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Key Benefits / Operational Advantages</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Maximum Equipment Availability"
                    value={newBenefit}
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addBenefit();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.benefits.map((ben, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl"
                    >
                      <span>★ {ben}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="text-slate-400 hover:text-rose-400 ml-1 text-sm font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEO, STATS & SETTINGS */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold text-slate-300 block">Performance Stats / Metrics</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    placeholder="Stat Label (e.g. Uptime Optimization)"
                    value={newStatLabel}
                    onChange={(e) => setNewStatLabel(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Stat Value (e.g. 99.5%)"
                      value={newStatValue}
                      onChange={(e) => setNewStatValue(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={addStat}
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {formData.stats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-white text-sm font-mono block">{stat.value}</span>
                        <span className="text-[11px] text-sky-400 uppercase font-semibold">{stat.label}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStat(idx)}
                        className="text-slate-400 hover:text-rose-400 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom CTA */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Bottom Call to Action (CTA)</label>
                <input
                  type="text"
                  placeholder="CTA Heading"
                  value={formData.cta.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cta: { ...prev.cta, title: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <textarea
                  rows={2}
                  placeholder="CTA Description..."
                  value={formData.cta.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cta: { ...prev.cta, description: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Button Text (e.g. Request a Quote)"
                    value={formData.cta.buttonText}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cta: { ...prev.cta, buttonText: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <input
                    type="text"
                    placeholder="Button Link (e.g. /contact)"
                    value={formData.cta.buttonLink}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        cta: { ...prev.cta, buttonLink: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* SEO Metadata */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 block">Search Engine Optimization (SEO)</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Meta Title (e.g. Engineering & Design Services | AXION PackTech)"
                    value={formData.seo.metaTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, metaTitle: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 shadow-inner"
                  />
                  <textarea
                    rows={2}
                    placeholder="Meta Description (Summary shown on Google search results)..."
                    value={formData.seo.metaDescription}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        seo: { ...prev.seo, metaDescription: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 shadow-inner"
                  />
                </div>

                {/* Keywords Tag Manager */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs text-slate-400 font-semibold block">SEO Keywords:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. packaging engineering, plant layout, automation"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addKeyword();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold"
                    >
                      + Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {formData.seo.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-900 border border-slate-800 text-sky-300 text-xs rounded-lg"
                      >
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => removeKeyword(idx)}
                          className="text-slate-500 hover:text-rose-400 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-5 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              {editingService ? (
                <span>Editing <strong className="text-white">{editingService.title}</strong></span>
              ) : (
                <span>New dynamic service draft</span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/20 transition-all"
              >
                {isSaving ? 'Saving to Database...' : editingService ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={!!deleteConfirmSlug}
        onClose={() => setDeleteConfirmSlug(null)}
        title="Confirm Service Deletion"
        description="Are you sure you want to permanently delete this engineering service? This will remove its public page and dropdown links everywhere."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="p-3 bg-slate-950 rounded-xl border border-rose-900/40 text-rose-300 font-mono text-xs">
            /{deleteConfirmSlug}
          </div>
          <p className="text-xs text-slate-400">
            This action cannot be undone. All linked public routes will be removed.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmSlug(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmSlug && handleDelete(deleteConfirmSlug)}
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/20"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
