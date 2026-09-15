'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getAllApplicationsAdmin,
  updateApplicationStatusAdmin,
  deleteApplicationAdmin,
  downloadResumeFileAdmin,
} from '@/lib/api/admin';
import { AdminApplication } from '@/lib/api/admin/types';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminToolbar } from '@/components/admin/ui/AdminToolbar';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';
import { AdminLoadingState } from '@/components/admin/ui/AdminLoadingState';
import { useToast } from '@/context/ToastContext';

type AppStatusType = 'new' | 'reviewing' | 'shortlisted' | 'rejected' | 'hired';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewingApp, setViewingApp] = useState<AdminApplication | null>(null);
  const [deleteConfirmApp, setDeleteConfirmApp] = useState<AdminApplication | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<AppStatusType>('new');
  const [notesUpdate, setNotesUpdate] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getAllApplicationsAdmin({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        search: searchQuery.trim() ? searchQuery.trim() : undefined,
        limit: 100,
      });
      setApplications(res.items || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load applications';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedStatus, searchQuery, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const normalizeStatus = (status: string): AppStatusType => {
    if (status === 'pending') return 'new';
    if (status === 'reviewed') return 'reviewing';
    if (['new', 'reviewing', 'shortlisted', 'rejected', 'hired'].includes(status)) {
      return status as AppStatusType;
    }
    return 'new';
  };

  const handleOpenDetail = (app: AdminApplication) => {
    setViewingApp(app);
    setStatusUpdate(normalizeStatus(app.status));
    setNotesUpdate(app.notes || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingApp) return;

    setIsUpdating(true);
    try {
      await updateApplicationStatusAdmin(viewingApp._id, statusUpdate, notesUpdate);
      showToast('Application status updated successfully', 'success');
      setViewingApp(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update application';
      showToast(msg, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      await deleteApplicationAdmin(id);
      showToast('Candidate application removed', 'success');
      setDeleteConfirmApp(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete application';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadResume = async (app: AdminApplication) => {
    try {
      setIsDownloading(true);
      const fileName =
        app.resumeFileName ||
        `${app.candidateName.replace(/\s+/g, '_')}_Resume.pdf`;
      await downloadResumeFileAdmin(app._id, fileName);
      showToast('Resume downloaded successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to download resume';
      showToast(msg, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const norm = normalizeStatus(status);
    switch (norm) {
      case 'new':
        return <AdminBadge variant="warning">New</AdminBadge>;
      case 'reviewing':
        return <AdminBadge variant="info">Reviewing</AdminBadge>;
      case 'shortlisted':
        return <AdminBadge variant="success">Shortlisted</AdminBadge>;
      case 'hired':
        return <AdminBadge variant="success">Hired</AdminBadge>;
      case 'rejected':
        return <AdminBadge variant="danger">Rejected</AdminBadge>;
      default:
        return <AdminBadge variant="neutral">{status}</AdminBadge>;
    }
  };

  const filtered = applications.filter((app) => {
    const q = searchQuery.toLowerCase().trim();
    const name = (app.candidateName || '').toLowerCase();
    const title = (app.careerTitle || '').toLowerCase();
    const mail = (app.email || '').toLowerCase();
    const num = (app.phone || '').toLowerCase();
    const msg = (app.coverMessage || '').toLowerCase();

    const matchesSearch =
      !q ||
      name.includes(q) ||
      title.includes(q) ||
      mail.includes(q) ||
      num.includes(q) ||
      msg.includes(q);

    const matchesStatus =
      selectedStatus === 'all' || normalizeStatus(app.status) === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: 'Careers', href: '/admin/careers' }, { label: 'Candidate Applications' }]}
        title="Candidate Applications"
        badge={`${applications.length} Applicants`}
        description="Review incoming engineering and technician job applications, download stored resumes, and update recruitment pipeline statuses."
      />

      {/* Search & Filter Toolbar */}
      <AdminToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search candidates by name, position, email, phone..."
        totalCount={applications.length}
        filteredCount={filtered.length}
        hasActiveFilters={searchQuery !== '' || selectedStatus !== 'all'}
        onClearFilters={() => {
          setSearchQuery('');
          setSelectedStatus('all');
        }}
        filters={
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-[#040c16] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
          >
            <option value="all">All Application Statuses</option>
            <option value="new">New</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        }
      />

      {/* Loading Skeleton */}
      {isLoading ? (
        <AdminLoadingState type="table" count={5} message="Loading candidate applications..." />
      ) : filtered.length === 0 ? (
        <AdminEmptyState
          icon="📄"
          title="No Candidate Applications Found"
          description={
            applications.length === 0
              ? 'No candidate applications have been submitted through the public career portal yet.'
              : 'No applications match your active filter and search keywords. Try resetting your filters.'
          }
          secondaryActionLabel={applications.length > 0 ? 'Clear Filters' : undefined}
          onSecondaryAction={
            applications.length > 0
              ? () => {
                  setSearchQuery('');
                  setSelectedStatus('all');
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
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Position</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block text-sm group-hover:text-sky-300 transition-colors">
                        {app.candidateName}
                      </span>
                      {app.resumeFileName && (
                        <span className="text-[11px] text-sky-400 font-mono flex items-center gap-1 mt-0.5">
                          📎 {app.resumeFileName}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <a
                        href={`mailto:${app.email}`}
                        className="text-slate-300 hover:text-sky-400 transition-colors block"
                      >
                        {app.email}
                      </a>
                      <a
                        href={`tel:${app.phone}`}
                        className="text-slate-400 hover:text-white font-mono text-[11px] block mt-0.5"
                      >
                        {app.phone}
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-200">
                      {app.careerTitle}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(app.submittedAt || app.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleDownloadResume(app)}
                          title="Download Resume"
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-sky-950 text-sky-300 border border-slate-800 hover:border-sky-600/50 rounded-xl font-semibold transition-colors flex items-center gap-1"
                        >
                          <span>📥</span>
                          <span className="hidden lg:inline">Resume</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(app)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-xl font-semibold transition-colors"
                        >
                          Review
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmApp(app)}
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
            {filtered.map((app) => (
              <div key={app._id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{app.candidateName}</h3>
                    <p className="text-xs text-sky-400 font-semibold">{app.careerTitle}</p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 bg-[#040c16] p-3 rounded-xl border border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <span>Email:</span>
                    <span className="text-slate-200">{app.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Phone:</span>
                    <span className="text-slate-200 font-mono">{app.phone}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Date:</span>
                    <span className="text-slate-300">
                      {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDownloadResume(app)}
                    className="flex-1 py-1.5 bg-slate-900 text-sky-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <span>📥</span>
                    <span>Resume</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDetail(app)}
                    className="flex-1 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold text-center"
                  >
                    Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmApp(app)}
                    className="py-1.5 px-3 bg-slate-900 text-rose-400 border border-slate-800 rounded-xl text-xs font-semibold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Application Detail & Review Modal */}
      <AdminModal
        isOpen={!!viewingApp}
        onClose={() => setViewingApp(null)}
        title="Candidate Application Profile"
        description="Review candidate background, download resume document, and update hiring pipeline status."
        maxWidth="lg"
      >
        {viewingApp && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="p-4 bg-[#040c16] rounded-2xl border border-slate-800 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Candidate Full Name
                  </span>
                  <span className="text-white font-bold text-sm mt-0.5 block">
                    {viewingApp.candidateName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Position Applied
                  </span>
                  <span className="text-sky-300 font-semibold text-xs mt-0.5 block">
                    {viewingApp.careerTitle}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${viewingApp.email}`}
                    className="text-sky-400 hover:underline font-medium text-xs mt-0.5 block"
                  >
                    {viewingApp.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Phone Number
                  </span>
                  <a
                    href={`tel:${viewingApp.phone}`}
                    className="text-white hover:text-sky-400 font-mono text-xs mt-0.5 block"
                  >
                    {viewingApp.phone}
                  </a>
                </div>
              </div>

              {viewingApp.coverMessage && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[11px] font-bold block mb-1">
                    Candidate Cover Message:
                  </span>
                  <div className="p-3 bg-slate-900 rounded-xl text-slate-200 text-xs leading-relaxed border border-slate-800/80 whitespace-pre-wrap">
                    {viewingApp.coverMessage}
                  </div>
                </div>
              )}

              {/* Secure Resume Download Strip */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-slate-400 text-xs block font-medium">
                    Stored Resume:
                  </span>
                  <span className="text-slate-300 text-xs font-mono">
                    {viewingApp.resumeFileName || 'Candidate_Resume.pdf'}
                    {viewingApp.resumeSize ? ` (${(viewingApp.resumeSize / 1024 / 1024).toFixed(2)} MB)` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={() => handleDownloadResume(viewingApp)}
                  className="px-4 py-2 bg-sky-950/80 hover:bg-sky-900 border border-sky-600/40 text-sky-200 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <span>📥</span>
                  <span>{isDownloading ? 'Downloading...' : 'Download Resume'}</span>
                </button>
              </div>
            </div>

            {/* Status Change Control */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Update Status <span className="text-sky-400">*</span>
              </label>
              <select
                value={statusUpdate}
                onChange={(e) => setStatusUpdate(e.target.value as AppStatusType)}
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="new">New</option>
                <option value="reviewing">Reviewing</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
            </div>

            {/* Internal Hiring Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                Internal Hiring Notes &amp; Panel Feedback
              </label>
              <textarea
                rows={3}
                value={notesUpdate}
                onChange={(e) => setNotesUpdate(e.target.value)}
                placeholder="Interview schedule, panel impressions, compensation notes..."
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingApp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isUpdating}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                {isUpdating ? 'Saving Changes...' : 'Save & Update Status'}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={!!deleteConfirmApp}
        onClose={() => setDeleteConfirmApp(null)}
        title="Confirm Application Deletion"
        description="Are you sure you want to permanently delete this candidate application and remove their stored resume?"
        maxWidth="sm"
      >
        {deleteConfirmApp && (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-xs text-slate-300">
              <p>
                Candidate: <strong className="text-white">{deleteConfirmApp.candidateName}</strong>
              </p>
              <p className="mt-1">
                Position: <strong className="text-sky-300">{deleteConfirmApp.careerTitle}</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmApp(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => deleteConfirmApp && handleDelete(deleteConfirmApp._id)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-colors active:scale-95"
              >
                {isDeleting ? 'Deleting...' : 'Delete Application'}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
