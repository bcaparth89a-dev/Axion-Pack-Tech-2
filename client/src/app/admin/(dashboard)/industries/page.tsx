'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAllIndustriesAdmin,
  createIndustryAdmin,
  updateIndustryAdmin,
  reorderIndustriesAdmin,
  deleteIndustryAdmin,
} from '@/lib/api/admin';
import { Industry, IndustrySolution } from '@/data/industries';
import { AdminTable } from '@/components/admin/ui/AdminTable';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminMediaPicker } from '@/components/admin/ui/AdminMediaPicker';
import { useToast } from '@/context/ToastContext';


interface ExtendedIndustry extends Omit<Industry, 'challenges' | 'benefits' | 'applications' | 'relatedCategories'> {
  _id?: string;
  heroSubtitle?: string;
  published?: boolean;
  sortOrder?: number;
  challenges?: string[];
  benefits?: string[];
  applications?: string[];
  relatedCategories?: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
}

const AVAILABLE_CATEGORY_SLUGS = [
  { slug: 'filling-bagging', label: 'Filling & Bagging Systems' },
  { slug: 'packaging-machines', label: 'Packaging Machines (VFFS)' },
  { slug: 'sealing-machines', label: 'Sealing Machines' },
  { slug: 'processing-equipment', label: 'Sanitary Processing Equipment' },
  { slug: 'inspection-quality-control', label: 'Inspection & Quality Control' },
  { slug: 'material-handling-conveyors', label: 'Material Handling & Conveyors' },
  { slug: 'carton-packaging-end-of-line', label: 'Carton Packaging & End-of-Line' },
];

const PRESET_ICONS = ['🍽️', '🧪', '💊', '🌾', '🌱', '🧱', '🐾', '⛽', '🧵', '🏭', '📦', '⚡', '🏗️', '🔬', '🍶', '⚙️'];

export default function AdminIndustriesPage() {
  const [industries, setIndustries] = useState<ExtendedIndustry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  
  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'media' | 'solutions' | 'highlights' | 'seo'>('basic');
  const [editingIndustry, setEditingIndustry] = useState<ExtendedIndustry | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  
  const { showToast } = useToast();

  // Dynamic Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    heroSubtitle: '',
    image: '/images/industries/food-beverage.webp',
    heroImage: '/images/industries/food-beverage-hero.webp',
    icon: '🏭',
    challenges: [] as string[],
    solutions: [] as IndustrySolution[],
    benefits: [] as string[],
    applications: [] as string[],
    relatedCategories: [] as string[],
    published: true,
    sortOrder: 1,
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [] as string[],
    },
  });

  // Temp inputs for adding array items
  const [newChallenge, setNewChallenge] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newApplication, setNewApplication] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newSolTitle, setNewSolTitle] = useState('');
  const [newSolDesc, setNewSolDesc] = useState('');

  const triggerRevalidation = async () => {
    try {
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/industries', tag: 'industries' }),
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('industries-updated'));
      }
    } catch {
      // Revalidation error silently handled
    }
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllIndustriesAdmin();
      const sorted = (data as ExtendedIndustry[]).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      setIndustries(sorted || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load industries';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingIndustry(null);
    setActiveTab('basic');
    setFormData({
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      heroSubtitle: '',
      image: '/images/industries/food-beverage.webp',
      heroImage: '/images/industries/food-beverage-hero.webp',
      icon: '🏭',
      challenges: [
        'High-speed packaging and filling accuracy',
        'Strict sanitary and hygienic material handling standards',
        'Minimizing product spillage and operational downtime',
      ],
      solutions: [
        {
          title: 'Automated Bagging & Dosing Systems',
          description: 'High-precision gravimetric and auger filling machines with rapid changeovers.',
        },
      ],
      benefits: [
        'Optimized overall equipment effectiveness (OEE)',
        'Enhanced package integrity and hermetic sealing',
        'Seamless integration with upstream processing systems',
      ],
      applications: [],
      relatedCategories: ['filling-bagging', 'packaging-machines'],
      published: true,
      sortOrder: industries.length + 1,
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: [],
      },
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (ind: ExtendedIndustry) => {
    setEditingIndustry(ind);
    setActiveTab('basic');
    setFormData({
      title: ind.title || ind.name || '',
      slug: ind.slug,
      shortDescription: ind.shortDescription || '',
      description: ind.description || '',
      heroSubtitle: ind.heroSubtitle || '',
      image: ind.image || '/images/industries/food-beverage.webp',
      heroImage: ind.heroImage || ind.image || '/images/industries/food-beverage-hero.webp',
      icon: ind.icon || '🏭',
      challenges: Array.isArray(ind.challenges) ? [...ind.challenges] : [],
      solutions: Array.isArray(ind.solutions)
        ? ind.solutions.map((s) => (typeof s === 'string' ? { title: s, description: '' } : { ...s }))
        : [],
      benefits: Array.isArray(ind.benefits) ? [...ind.benefits] : [],
      applications: Array.isArray(ind.applications) ? [...ind.applications] : [],
      relatedCategories: Array.isArray(ind.relatedCategories) ? [...ind.relatedCategories] : [],
      published: ind.published !== false,
      sortOrder: ind.sortOrder || 1,
      seo: {
        metaTitle: ind.seo?.metaTitle || '',
        metaDescription: ind.seo?.metaDescription || '',
        keywords: Array.isArray(ind.seo?.keywords) ? [...ind.seo.keywords] : [],
      },
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.slug.trim()) {
      showToast('Industry title and slug are required.', 'warning');
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      showToast('Industry description must be at least 10 characters.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: formData.title.trim(),
        name: formData.title.trim(),
        slug: formData.slug.toLowerCase().trim(),
        shortDescription: formData.shortDescription.trim(),
        description: formData.description.trim(),
        heroSubtitle: formData.heroSubtitle.trim() || formData.shortDescription.trim(),
        image: formData.image.trim() || '/images/industries/food-beverage.webp',
        heroImage: formData.heroImage.trim() || formData.image.trim() || '/images/industries/food-beverage-hero.webp',
        icon: formData.icon.trim() || '🏭',
        challenges: formData.challenges,
        solutions: formData.solutions,
        benefits: formData.benefits,
        applications: formData.applications,
        relatedCategories: formData.relatedCategories,
        published: formData.published,
        sortOrder: Number(formData.sortOrder) || 1,
        seo: {
          metaTitle: formData.seo.metaTitle.trim(),
          metaDescription: formData.seo.metaDescription.trim(),
          keywords: formData.seo.keywords,
        },
      };

      if (editingIndustry) {
        await updateIndustryAdmin(editingIndustry.slug, payload);
        showToast(`Industry "${formData.title}" updated successfully`, 'success');
      } else {
        await createIndustryAdmin(payload);
        showToast(`Industry "${formData.title}" created successfully`, 'success');
      }
      
      await triggerRevalidation();
      setModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save industry';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (ind: ExtendedIndustry) => {
    try {
      const nextStatus = !ind.published;
      await updateIndustryAdmin(ind.slug, { published: nextStatus });
      showToast(`Industry "${ind.title}" marked as ${nextStatus ? 'Published' : 'Draft'}`, 'info');
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
    if (targetIndex < 0 || targetIndex >= industries.length) return;

    setIsReordering(true);
    try {
      const reorderedList = [...industries];
      const itemToMove = reorderedList[index];
      reorderedList.splice(index, 1);
      reorderedList.splice(targetIndex, 0, itemToMove);

      const orders = reorderedList.map((item, idx) => ({
        slug: item.slug,
        sortOrder: idx + 1,
      }));

      await reorderIndustriesAdmin(orders);
      showToast('Industry display order updated', 'success');
      await triggerRevalidation();
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reorder industries';
      showToast(msg, 'error');
    } finally {
      setIsReordering(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await deleteIndustryAdmin(slug);
      showToast('Industry deleted successfully', 'success');
      setDeleteConfirmSlug(null);
      await triggerRevalidation();
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete industry';
      showToast(msg, 'error');
    }
  };

  // Helper additions for arrays
  const addChallenge = () => {
    if (!newChallenge.trim()) return;
    setFormData((prev) => ({ ...prev, challenges: [...prev.challenges, newChallenge.trim()] }));
    setNewChallenge('');
  };

  const removeChallenge = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      challenges: prev.challenges.filter((_, i) => i !== idx),
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

  const addApplication = () => {
    if (!newApplication.trim()) return;
    setFormData((prev) => ({ ...prev, applications: [...prev.applications, newApplication.trim()] }));
    setNewApplication('');
  };

  const removeApplication = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      applications: prev.applications.filter((_, i) => i !== idx),
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

  const toggleCategorySlug = (slug: string) => {
    setFormData((prev) => {
      const exists = prev.relatedCategories.includes(slug);
      return {
        ...prev,
        relatedCategories: exists
          ? prev.relatedCategories.filter((s) => s !== slug)
          : [...prev.relatedCategories, slug],
      };
    });
  };

  // Filter logic
  const filtered = industries.filter((ind) => {
    const matchesSearch =
      (ind.title || ind.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      ind.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ind.shortDescription || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'published') return ind.published !== false;
    if (statusFilter === 'draft') return ind.published === false;
    return true;
  });

  const publishedCount = industries.filter((i) => i.published !== false).length;
  const draftCount = industries.filter((i) => i.published === false).length;
  const totalSolutions = industries.reduce((acc, curr) => acc + (curr.solutions?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Header Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0B1E36] border border-sky-900/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Total Sectors</span>
            <span className="h-8 w-8 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-300 text-sm">🏭</span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">{industries.length}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Industrial markets managed</span>
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
            <span className="text-xs font-mono font-bold text-brand-orange uppercase tracking-wider">Total Solutions</span>
            <span className="h-8 w-8 rounded-xl bg-brand-orange/10 border border-brand-orange/30 flex items-center justify-center text-brand-orange text-sm">⚙️</span>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3">{totalSolutions}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Engineered capabilities</span>
        </div>
      </div>

      {/* 2. Industries Table */}
      <AdminTable
        title="Industries CMS Management"
        description="Configure dynamic manufacturing sectors, solutions, hero visual assets, and customer navigation order."
        totalCount={filtered.length}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter industries by name, slug or summary..."
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
                All ({industries.length})
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
              <span>New Industry</span>
            </button>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4 w-20 text-center">Order</th>
                <th className="py-3.5 px-4">Industry Sector</th>
                <th className="py-3.5 px-4">Slug & Route</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Capabilities</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((ind, idx) => (
                <tr key={ind.slug} className="hover:bg-slate-800/30 transition-colors group">
                  {/* Order & Reorder Controls */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-mono text-slate-400 text-xs w-5 font-bold">
                        {ind.sortOrder ?? idx + 1}
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

                  {/* Industry Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800/90 border border-slate-700 text-lg shadow-sm">
                        {ind.icon || '🏭'}
                      </span>
                      <div className="min-w-0 max-w-sm">
                        <span className="font-bold text-white text-sm block truncate group-hover:text-sky-300 transition-colors">
                          {ind.title || ind.name}
                        </span>
                        <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                          {ind.shortDescription || 'No summary description provided.'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Slug & Link */}
                  <td className="py-3.5 px-4">
                    <Link
                      href={`/industries/${ind.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 font-mono text-sky-400 hover:text-sky-300 bg-sky-950/40 hover:bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800/40 transition-colors"
                      title="Open dynamic customer page in new tab"
                    >
                      <span>/{ind.slug}</span>
                      <span className="text-[10px]">↗</span>
                    </Link>
                  </td>

                  {/* Status & Quick Toggle */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(ind)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border transition-all ${
                        ind.published !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                      }`}
                      title="Click to toggle status"
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          ind.published !== false ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span>{ind.published !== false ? 'Active' : 'Draft'}</span>
                    </button>
                  </td>

                  {/* Solutions Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-lg text-[11px] font-semibold">
                      {ind.solutions?.length || 0} Solutions
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(ind)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-sky-600 hover:text-white text-sky-400 rounded-lg font-semibold transition-all shadow-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSlug(ind.slug)}
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
        title={editingIndustry ? `Edit Industry: ${editingIndustry.title || editingIndustry.name}` : 'Create New Industry Sector'}
        description="Configure complete content, solutions, challenges, visual assets, and SEO metadata."
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
            1. Basic Information
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
            onClick={() => setActiveTab('solutions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'solutions'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            3. Solutions ({formData.solutions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('highlights')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'highlights'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/60'
            }`}
          >
            4. Challenges & Benefits
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
                  <label className="text-xs font-bold text-slate-300">Industry Name / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Textile Industry"
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        title,
                        slug: editingIndustry
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
                    placeholder="e.g. textile"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500 shadow-inner"
                  />
                  <span className="text-[10px] text-slate-500">
                    Live dynamic URL: <strong className="text-sky-400">/industries/{formData.slug || 'slug'}</strong>
                  </span>
                </div>
              </div>

              {/* Icon Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Industry Icon (Emoji or Character)</label>
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

              {/* Hero Subtitle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Hero Subtitle / Tagline</label>
                <input
                  type="text"
                  placeholder="e.g. Reliable packaging and processing technology for modern manufacturing."
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 shadow-inner"
                />
              </div>

              {/* Short Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Short Summary (Used in cards & navbar dropdown)</label>
                <input
                  type="text"
                  placeholder="Brief 1-sentence sector summary..."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 shadow-inner"
                />
              </div>

              {/* Full Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Full Overview Description * (At least 10 characters)</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detailed explanation of the industry sector challenges and AXION PackTech solutions..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 shadow-inner"
                />
              </div>
            </div>
          )}

          {/* TAB 2: VISUALS & MEDIA */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <AdminMediaPicker
                label="Industry Card Image"
                description="Card thumbnail displayed across customer industry catalog and dropdowns (Aspect ratio 4:3)"
                type="image"
                folder="industries"
                value={formData.image}
                onChange={(url) => setFormData((prev) => ({ ...prev, image: url }))}
                required
              />

              <AdminMediaPicker
                label="Hero Section Media"
                description="High-resolution visual banner displayed at the top of /industries/[slug]"
                type="image"
                folder="industries/hero"
                value={formData.heroImage}
                onChange={(url) => setFormData((prev) => ({ ...prev, heroImage: url }))}
              />
            </div>
          )}


          {/* TAB 3: SOLUTIONS */}
          {activeTab === 'solutions' && (
            <div className="space-y-4">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">Add Engineered Solution</span>
                <div className="grid grid-cols-1 gap-2.5">
                  <input
                    type="text"
                    placeholder="Solution title (e.g. Filling & Bagging Systems)"
                    value={newSolTitle}
                    onChange={(e) => setNewSolTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <textarea
                    rows={2}
                    placeholder="Solution description..."
                    value={newSolDesc}
                    onChange={(e) => setNewSolDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={addSolution}
                    className="self-start px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow transition-all"
                  >
                    + Add Solution to List
                  </button>
                </div>
              </div>

              <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                {formData.solutions.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No solutions added yet. Add at least one above.</p>
                ) : (
                  formData.solutions.map((sol, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 shadow-sm"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-bold flex items-center justify-center">
                            ✓
                          </span>
                          <span className="font-bold text-white text-xs">{sol.title}</span>
                        </div>
                        {sol.description && (
                          <p className="text-[11px] text-slate-400 pl-7">{sol.description}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSolution(idx)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove solution"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHALLENGES & BENEFITS */}
          {activeTab === 'highlights' && (
            <div className="space-y-6">
              {/* Challenges */}
              <div className="space-y-2.5">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">Key Industry Challenges</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add operational bottleneck..."
                    value={newChallenge}
                    onChange={(e) => setNewChallenge(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addChallenge();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={addChallenge}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.challenges.map((c, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-950/40 border border-amber-800/40 text-amber-200 text-xs"
                    >
                      <span>!</span>
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => removeChallenge(i)}
                        className="text-amber-400 hover:text-white font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Operational Benefits</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add measurable impact..."
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
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.benefits.map((b, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-200 text-xs"
                    >
                      <span>✓</span>
                      <span>{b}</span>
                      <button
                        type="button"
                        onClick={() => removeBenefit(i)}
                        className="text-emerald-400 hover:text-white font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Specific Applications */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">Targeted Product Applications</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Granular Fertilizers, Powdered Chemicals, Snack Foods..."
                    value={newApplication}
                    onChange={(e) => setNewApplication(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addApplication();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={addApplication}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {formData.applications.map((app, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-950/40 border border-sky-800/40 text-sky-200 text-xs"
                    >
                      <span>•</span>
                      <span>{app}</span>
                      <button
                        type="button"
                        onClick={() => removeApplication(i)}
                        className="text-sky-400 hover:text-white font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>


              {/* Related Category Cross-links */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">Related Machinery Divisions</span>
                <p className="text-[11px] text-slate-400">Select product categories to link at the bottom of the industry page:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {AVAILABLE_CATEGORY_SLUGS.map((cat) => {
                    const isChecked = formData.relatedCategories.includes(cat.slug);
                    return (
                      <label
                        key={cat.slug}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-sky-950/50 border-sky-500/50 text-sky-200'
                            : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategorySlug(cat.slug)}
                          className="rounded border-slate-700 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-xs font-medium">{cat.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SEO & SETTINGS */}
          {activeTab === 'seo' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Display Order (sortOrder)</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sortOrder: Number(e.target.value) || 1 }))}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500">Lower numbers appear first in Navbar and listing.</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Publishing Status</label>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-700 text-sky-600 focus:ring-sky-500"
                      />
                      <span className="text-xs font-bold text-white">
                        {formData.published ? 'Active & Published' : 'Draft (Hidden from Public)'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300">SEO Meta Title</label>
                <input
                  type="text"
                  placeholder="e.g. Textile Industry Packaging & Automation Solutions | AXION PackTech"
                  value={formData.seo.metaTitle}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaTitle: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">SEO Meta Description</label>
                <textarea
                  rows={2}
                  placeholder="Compelling search engine description..."
                  value={formData.seo.metaDescription}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      seo: { ...prev.seo, metaDescription: e.target.value },
                    }))
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">SEO Keywords</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. yarn packaging, fabric bagging"
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
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(formData.seo.keywords || []).map((k, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]"
                    >
                      <span>{k}</span>
                      <button
                        type="button"
                        onClick={() => removeKeyword(i)}
                        className="text-slate-500 hover:text-white font-bold ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              * Required fields. All changes invalidate Redis cache and update Next.js routes immediately.
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/20 transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : editingIndustry ? (
                  'Update Industry'
                ) : (
                  'Create Industry'
                )}
              </button>
            </div>
          </div>
        </form>
      </AdminModal>

      {/* 4. Safe Delete Confirmation Modal */}
      <AdminModal
        isOpen={!!deleteConfirmSlug}
        onClose={() => setDeleteConfirmSlug(null)}
        title="Confirm Industry Deletion"
        description="Are you sure you want to permanently delete this industry sector?"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-300">
            Deleting this industry will remove its public page at{' '}
            <strong className="text-rose-400 font-mono">/industries/{deleteConfirmSlug}</strong> and remove it from the customer Navbar.
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmSlug(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmSlug && handleDelete(deleteConfirmSlug)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
            >
              Delete Industry
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
