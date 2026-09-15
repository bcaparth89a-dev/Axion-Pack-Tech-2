'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getAllCareersAdmin,
  createCareerAdmin,
  updateCareerAdmin,
  deleteCareerAdmin,
} from '@/lib/api/admin';
import { CareerOpportunity, CareerType } from '@/data/careers';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminToolbar } from '@/components/admin/ui/AdminToolbar';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';
import { AdminLoadingState } from '@/components/admin/ui/AdminLoadingState';
import { useToast } from '@/context/ToastContext';

export default function AdminCareersPage() {
  const [careers, setCareers] = useState<CareerOpportunity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState<CareerOpportunity | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    type: 'job' as CareerType,
    department: 'Engineering',
    location: 'Vadodara, Gujarat, India',
    employmentType: 'Full-Time',
    experience: '2-4 Years',
    shortDescription: '',
    description: '',
    applicationDeadline: 'Open Until Filled',
    isActive: true,
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAllCareersAdmin({ limit: 100 });
      setCareers(res.items || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load careers';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenCreate = () => {
    setEditingCareer(null);
    setFormData({
      title: '',
      slug: '',
      type: 'job',
      department: 'Engineering',
      location: 'Vadodara, Gujarat, India',
      employmentType: 'Full-Time',
      experience: '2-4 Years',
      shortDescription: '',
      description: '',
      applicationDeadline: 'Open Until Filled',
      isActive: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: CareerOpportunity) => {
    setEditingCareer(c);
    setFormData({
      title: c.title,
      slug: c.slug,
      type: c.type,
      department: c.department || 'Engineering',
      location: c.location || 'Vadodara, Gujarat, India',
      employmentType: c.employmentType || 'Full-Time',
      experience: c.experience || 'Not specified',
      shortDescription: c.shortDescription || '',
      description: c.description || '',
      applicationDeadline: c.applicationDeadline || 'Open Until Filled',
      isActive: c.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug) {
      showToast('Title and slug are required.', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      if (editingCareer) {
        await updateCareerAdmin(editingCareer.slug, formData);
        showToast(`Career "${formData.title}" updated successfully`, 'success');
      } else {
        await createCareerAdmin(formData);
        showToast(`Career "${formData.title}" created successfully`, 'success');
      }
      setModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save career';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await deleteCareerAdmin(slug);
      showToast('Career position deleted successfully', 'success');
      setDeleteConfirmSlug(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete career';
      showToast(msg, 'error');
    }
  };

  const filtered = careers.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || c.type === selectedType;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && c.isActive !== false) ||
      (statusFilter === 'closed' && c.isActive === false);
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: 'Careers', href: '/admin/careers' }, { label: 'Job Openings' }]}
        title="Job Openings & Roles"
        badge={`${careers.length} Total`}
        description="Publish packaging machinery engineering positions, field technician roles, and graduate internships."
      >
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-sky-950 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <span className="text-sm font-black leading-none">+</span>
          <span>Add Job Opening</span>
        </button>
      </AdminPageHeader>

      {/* Search & Filter Toolbar */}
      <AdminToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search positions by title, dept, slug..."
        totalCount={careers.length}
        filteredCount={filtered.length}
        hasActiveFilters={searchQuery !== '' || selectedType !== 'all' || statusFilter !== 'all'}
        onClearFilters={() => {
          setSearchQuery('');
          setSelectedType('all');
          setStatusFilter('all');
        }}
        filters={
          <>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#040c16] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Types</option>
              <option value="job">Full Jobs</option>
              <option value="internship">Internships</option>
              <option value="apprenticeship">Apprenticeships</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'closed')}
              className="bg-[#040c16] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Open)</option>
              <option value="closed">Closed</option>
            </select>
          </>
        }
      />

      {/* Loading Skeleton */}
      {isLoading ? (
        <AdminLoadingState type="table" count={5} message="Loading career positions from database..." />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon="💼"
          title="No Career Openings Found"
          description={
            careers.length === 0
              ? 'There are currently no job positions published in the database. Create your first listing to start accepting candidate resumes.'
              : 'No job openings matched your search and filter criteria. Try resetting your filters.'
          }
          actionLabel={careers.length === 0 ? 'Create Job Opening' : undefined}
          onAction={careers.length === 0 ? handleOpenCreate : undefined}
          secondaryActionLabel={careers.length > 0 ? 'Clear Filters' : undefined}
          onSecondaryAction={
            careers.length > 0
              ? () => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setStatusFilter('all');
                }
              : undefined
          }
        />
      ) : (
        <div className="bg-[#071524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#040d18] text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-4">Role Title</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Location & Exp</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((c) => (
                  <tr key={c.slug} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block max-w-sm truncate text-xs group-hover:text-sky-300 transition-colors">
                        {c.title}
                      </span>
                      <span className="text-[11px] text-slate-400 block font-mono mt-0.5">
                        /{c.slug}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded-md border border-slate-700 uppercase font-mono text-[10px] font-semibold">
                        {c.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{c.department || 'Engineering'}</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div>{c.location || 'Vadodara, India'}</div>
                      <div className="text-[10px] text-slate-400">{c.experience}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <AdminBadge variant={c.isActive !== false ? 'success' : 'neutral'}>
                        {c.isActive !== false ? 'Active' : 'Closed'}
                      </AdminBadge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-xl font-semibold transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmSlug(c.slug)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-rose-950/60 text-rose-400 border border-slate-800 hover:border-rose-800/50 rounded-xl font-semibold transition-colors"
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

          {/* Mobile Card Grid View */}
          <div className="md:hidden divide-y divide-slate-800/80">
            {filtered.map((c) => (
              <div key={c.slug} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.title}</h3>
                    <p className="text-[10px] font-mono text-slate-400">/{c.slug}</p>
                  </div>
                  <AdminBadge variant={c.isActive !== false ? 'success' : 'neutral'}>
                    {c.isActive !== false ? 'Active' : 'Closed'}
                  </AdminBadge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-[#040c16] p-2.5 rounded-xl border border-slate-800/60">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Department</span>
                    <span className="text-slate-200 font-medium">{c.department || 'Engineering'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase">Experience</span>
                    <span className="text-slate-200 font-medium">{c.experience}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleOpenEdit(c)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-xl text-xs font-semibold text-center"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirmSlug(c.slug)}
                    className="py-1.5 px-3 bg-slate-900 hover:bg-rose-950/60 text-rose-400 border border-slate-800 rounded-xl text-xs font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Career Create / Edit Modal */}
      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCareer ? 'Edit Career Opening' : 'Create Career Opening'}
        description="Publish packaging machinery engineering positions, shop roles, and internships."
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Position Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setFormData((prev) => ({
                    ...prev,
                    title,
                    slug: editingCareer
                      ? prev.slug
                      : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                  }));
                }}
                placeholder="e.g. Senior Mechanical Design Engineer"
                className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">URL Slug *</label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="senior-mechanical-engineer"
                className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Program Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as CareerType }))}
                className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              >
                <option value="job">Full Job</option>
                <option value="internship">Internship</option>
                <option value="apprenticeship">Apprenticeship</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Department</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Experience</label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
                className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Application Deadline</label>
              <input
                type="text"
                value={formData.applicationDeadline}
                onChange={(e) => setFormData((prev) => ({ ...prev, applicationDeadline: e.target.value }))}
                className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Short Summary</label>
            <input
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
              placeholder="Brief summary of the role for career listings..."
              className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Full Job Description & Responsibilities</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Outline responsibilities, key requirements, qualifications, and benefits..."
              className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-700 text-sky-600 focus:ring-sky-500 bg-slate-950"
              />
              <span className="text-xs font-bold text-slate-200">Active (Accepting New Applications)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
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
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              {isSaving ? 'Saving...' : editingCareer ? 'Update Opening' : 'Create Opening'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={!!deleteConfirmSlug}
        onClose={() => setDeleteConfirmSlug(null)}
        title="Confirm Position Deletion"
        description="Are you sure you want to permanently delete this career opening? This will also remove it from the public careers page."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-slate-300 font-mono bg-[#040c16] p-3 rounded-xl border border-slate-800">
            {deleteConfirmSlug}
          </p>
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={() => setDeleteConfirmSlug(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteConfirmSlug && handleDelete(deleteConfirmSlug)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              Delete Position
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
