'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  getAllInquiriesAdmin,
  updateInquiryStatusAdmin,
  deleteInquiryAdmin,
  getAllCatalogLeadsAdmin,
  updateCatalogLeadStatusAdmin,
  deleteCatalogLeadAdmin,
} from '@/lib/api/admin';
import { AdminInquiry, AdminCatalogLead } from '@/lib/api/admin/types';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminToolbar } from '@/components/admin/ui/AdminToolbar';
import { AdminModal } from '@/components/admin/ui/AdminModal';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminEmptyState } from '@/components/admin/ui/AdminEmptyState';
import { AdminLoadingState } from '@/components/admin/ui/AdminLoadingState';
import { useToast } from '@/context/ToastContext';

type ActiveTab = 'catalogLeads' | 'inquiries';

export default function AdminInquiriesPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('catalogLeads');

  // Contact Inquiries State
  const [inquiries, setInquiries] = useState<AdminInquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState<string>('all');
  const [viewingInquiry, setViewingInquiry] = useState<AdminInquiry | null>(null);
  const [inquiryDeleteId, setInquiryDeleteId] = useState<string | null>(null);
  const [inquiryStatusUpdate, setInquiryStatusUpdate] = useState<'unread' | 'contacted' | 'resolved' | 'archived'>('unread');
  const [inquiryNotesUpdate, setInquiryNotesUpdate] = useState('');
  const [isInquiryUpdating, setIsInquiryUpdating] = useState(false);

  // Catalog Leads State
  const [catalogLeads, setCatalogLeads] = useState<AdminCatalogLead[]>([]);
  const [catalogLeadsLoading, setCatalogLeadsLoading] = useState(true);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatus, setLeadStatus] = useState<string>('all');
  const [leadCatalogFilter, setLeadCatalogFilter] = useState<string>('all');
  const [viewingLead, setViewingLead] = useState<AdminCatalogLead | null>(null);
  const [leadDeleteId, setLeadDeleteId] = useState<string | null>(null);
  const [leadStatusUpdate, setLeadStatusUpdate] = useState<'unread' | 'contacted' | 'resolved' | 'archived'>('unread');
  const [leadNotesUpdate, setLeadNotesUpdate] = useState('');
  const [isLeadUpdating, setIsLeadUpdating] = useState(false);

  const { showToast } = useToast();

  // Load Contact Inquiries
  const loadInquiriesData = useCallback(async () => {
    try {
      setInquiriesLoading(true);
      const res = await getAllInquiriesAdmin({
        status: inquiryStatus === 'all' ? undefined : inquiryStatus,
        limit: 100,
      });
      setInquiries(res.items || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load contact inquiries';
      showToast(msg, 'error');
    } finally {
      setInquiriesLoading(false);
    }
  }, [inquiryStatus, showToast]);

  // Load Catalog Leads
  const loadCatalogLeadsData = useCallback(async () => {
    try {
      setCatalogLeadsLoading(true);
      const res = await getAllCatalogLeadsAdmin({
        status: leadStatus === 'all' ? undefined : leadStatus,
        catalogName: leadCatalogFilter === 'all' ? undefined : leadCatalogFilter,
        search: leadSearch.trim() || undefined,
        limit: 100,
      });
      setCatalogLeads(res.items || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load catalog leads';
      showToast(msg, 'error');
    } finally {
      setCatalogLeadsLoading(false);
    }
  }, [leadStatus, leadCatalogFilter, leadSearch, showToast]);

  useEffect(() => {
    loadInquiriesData();
  }, [loadInquiriesData]);

  useEffect(() => {
    loadCatalogLeadsData();
  }, [loadCatalogLeadsData]);

  // Handle Contact Inquiry Detail Open
  const handleOpenInquiryDetail = (inq: AdminInquiry) => {
    setViewingInquiry(inq);
    setInquiryStatusUpdate(inq.status);
    setInquiryNotesUpdate(inq.notes || '');
  };

  // Handle Contact Inquiry Status Save
  const handleUpdateInquiryStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingInquiry) return;

    setIsInquiryUpdating(true);
    try {
      await updateInquiryStatusAdmin(viewingInquiry._id, inquiryStatusUpdate, inquiryNotesUpdate);
      showToast('Inquiry status updated successfully', 'success');
      setViewingInquiry(null);
      await loadInquiriesData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update inquiry';
      showToast(msg, 'error');
    } finally {
      setIsInquiryUpdating(false);
    }
  };

  // Handle Contact Inquiry Delete
  const handleDeleteInquiry = async (id: string) => {
    try {
      await deleteInquiryAdmin(id);
      showToast('Inquiry deleted successfully', 'success');
      setInquiryDeleteId(null);
      await loadInquiriesData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete inquiry';
      showToast(msg, 'error');
    }
  };

  // Handle Catalog Lead Detail Open
  const handleOpenLeadDetail = (lead: AdminCatalogLead) => {
    setViewingLead(lead);
    setLeadStatusUpdate(lead.status);
    setLeadNotesUpdate(lead.notes || '');
  };

  // Handle Catalog Lead Status Save
  const handleUpdateLeadStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!viewingLead) return;

    setIsLeadUpdating(true);
    try {
      await updateCatalogLeadStatusAdmin(viewingLead._id, leadStatusUpdate, leadNotesUpdate);
      showToast('Catalog lead status updated successfully', 'success');
      setViewingLead(null);
      await loadCatalogLeadsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update catalog lead';
      showToast(msg, 'error');
    } finally {
      setIsLeadUpdating(false);
    }
  };

  // Handle Catalog Lead Delete
  const handleDeleteLead = async (id: string) => {
    try {
      await deleteCatalogLeadAdmin(id);
      showToast('Catalog lead deleted successfully', 'success');
      setLeadDeleteId(null);
      await loadCatalogLeadsData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete lead';
      showToast(msg, 'error');
    }
  };

  const getInquiryStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <AdminBadge variant="warning">Unread</AdminBadge>;
      case 'contacted':
        return <AdminBadge variant="info">Contacted</AdminBadge>;
      case 'resolved':
        return <AdminBadge variant="success">Resolved</AdminBadge>;
      case 'archived':
        return <AdminBadge variant="neutral">Archived</AdminBadge>;
      default:
        return <AdminBadge variant="neutral">{status}</AdminBadge>;
    }
  };

  // Unique catalog names list for filter
  const uniqueCatalogNames = Array.from(
    new Set(catalogLeads.map((l) => l.catalogName).filter(Boolean))
  );

  // Filter inquiries
  const filteredInquiries = inquiries.filter((inq) => {
    const q = inquirySearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (inq.name || '').toLowerCase().includes(q) ||
      (inq.email || '').toLowerCase().includes(q) ||
      (inq.phone || '').toLowerCase().includes(q) ||
      (inq.company || '').toLowerCase().includes(q) ||
      (inq.inquiryType || '').toLowerCase().includes(q) ||
      (inq.message || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminPageHeader
        breadcrumbs={[{ label: 'Operations', href: '/admin/inquiries' }, { label: 'Inquiries & Leads' }]}
        title="Inquiries & Customer Leads"
        description="Review catalog downloads, specification requests, and direct customer contact submissions."
      >
        {/* Tab Switcher */}
        <div className="flex items-center bg-[#040c16] p-1 rounded-2xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('catalogLeads')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'catalogLeads'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📑</span>
            <span>Catalog Leads</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'catalogLeads'
                  ? 'bg-sky-950 text-sky-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {catalogLeads.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inquiries')}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'inquiries'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📬</span>
            <span>Contact Messages</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === 'inquiries'
                  ? 'bg-sky-950 text-sky-300'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {inquiries.length}
            </span>
          </button>
        </div>
      </AdminPageHeader>

      {/* TAB 1: CATALOG LEADS */}
      {activeTab === 'catalogLeads' && (
        <div className="space-y-4">
          <AdminToolbar
            searchQuery={leadSearch}
            onSearchChange={setLeadSearch}
            searchPlaceholder="Search leads by name, email, company, catalog..."
            totalCount={catalogLeads.length}
            hasActiveFilters={leadSearch !== '' || leadStatus !== 'all' || leadCatalogFilter !== 'all'}
            onClearFilters={() => {
              setLeadSearch('');
              setLeadStatus('all');
              setLeadCatalogFilter('all');
            }}
            filters={
              <>
                <select
                  value={leadStatus}
                  onChange={(e) => setLeadStatus(e.target.value)}
                  className="bg-[#040c16] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                >
                  <option value="all">All Lead Statuses</option>
                  <option value="unread">Unread</option>
                  <option value="contacted">Contacted</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>

                {uniqueCatalogNames.length > 0 && (
                  <select
                    value={leadCatalogFilter}
                    onChange={(e) => setLeadCatalogFilter(e.target.value)}
                    className="bg-[#040c16] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
                  >
                    <option value="all">All Catalogs</option>
                    {uniqueCatalogNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                )}
              </>
            }
          />

          {catalogLeadsLoading ? (
            <AdminLoadingState type="table" count={5} message="Loading catalog download leads..." />
          ) : catalogLeads.length === 0 ? (
            <AdminEmptyState
              icon="📑"
              title="No Catalog Leads Found"
              description="No brochure download requests or catalog inquiries match your current filter."
            />
          ) : (
            <div className="bg-[#071524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#040d18] text-slate-400 uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4">Lead Contact</th>
                      <th className="py-3.5 px-4">Catalog / Product</th>
                      <th className="py-3.5 px-4">Requirements & Message</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {catalogLeads.map((lead) => (
                      <tr key={lead._id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block text-sm group-hover:text-sky-300 transition-colors">
                            {lead.name}
                          </span>
                          {lead.company && (
                            <span className="text-[11px] text-slate-300 block font-medium">
                              🏢 {lead.company}
                            </span>
                          )}
                          <a href={`mailto:${lead.email}`} className="text-[11px] text-sky-400 block hover:underline mt-0.5">
                            {lead.email}
                          </a>
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="text-[11px] text-slate-400 block font-mono">
                              📞 {lead.phone}
                            </a>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-sky-950 text-sky-300 rounded-md border border-sky-800/50 font-semibold text-[10px] inline-block mb-1">
                            {lead.catalogName}
                          </span>
                          {lead.inquiryType && (
                            <span className="text-[10px] text-slate-400 block">
                              Type: {lead.inquiryType}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-xs truncate">
                          {lead.requirement || lead.message || <span className="text-slate-500 italic">No message provided</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">{getInquiryStatusBadge(lead.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenLeadDetail(lead)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-xl font-semibold transition-colors"
                            >
                              Review
                            </button>
                            <button
                              type="button"
                              onClick={() => setLeadDeleteId(lead._id)}
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
                {catalogLeads.map((lead) => (
                  <div key={lead._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">{lead.name}</h3>
                        {lead.company && <p className="text-xs text-slate-300 font-medium">🏢 {lead.company}</p>}
                        <p className="text-xs text-sky-400 font-semibold mt-1">{lead.catalogName}</p>
                      </div>
                      {getInquiryStatusBadge(lead.status)}
                    </div>

                    <div className="text-[11px] text-slate-400 bg-[#040c16] p-3 rounded-xl border border-slate-800/60 space-y-1">
                      <div>📧 {lead.email}</div>
                      {lead.phone && <div>📞 {lead.phone}</div>}
                      {(lead.requirement || lead.message) && (
                        <div className="text-slate-300 italic pt-1 border-t border-slate-800/60">
                          "{lead.requirement || lead.message}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenLeadDetail(lead)}
                        className="flex-1 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold text-center"
                      >
                        Review Lead
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeadDeleteId(lead._id)}
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
        </div>
      )}

      {/* TAB 2: CONTACT INQUIRIES */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          <AdminToolbar
            searchQuery={inquirySearch}
            onSearchChange={setInquirySearch}
            searchPlaceholder="Search messages by name, email, company, requirement..."
            totalCount={inquiries.length}
            filteredCount={filteredInquiries.length}
            hasActiveFilters={inquirySearch !== '' || inquiryStatus !== 'all'}
            onClearFilters={() => {
              setInquirySearch('');
              setInquiryStatus('all');
            }}
            filters={
              <select
                value={inquiryStatus}
                onChange={(e) => setInquiryStatus(e.target.value)}
                className="bg-[#040c16] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="all">All Inquiry Statuses</option>
                <option value="unread">Unread</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            }
          />

          {inquiriesLoading ? (
            <AdminLoadingState type="table" count={5} message="Loading contact inquiries..." />
          ) : filteredInquiries.length === 0 ? (
            <AdminEmptyState
              icon="📬"
              title="No Contact Inquiries Found"
              description="No direct contact inquiries match your search and filter criteria."
            />
          ) : (
            <div className="bg-[#071524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#040d18] text-slate-400 uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Subject / Type</th>
                      <th className="py-3.5 px-4">Message Preview</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredInquiries.map((inq) => (
                      <tr key={inq._id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white block text-sm group-hover:text-sky-300 transition-colors">
                            {inq.name}
                          </span>
                          {inq.company && (
                            <span className="text-[11px] text-slate-300 block font-medium">
                              🏢 {inq.company}
                            </span>
                          )}
                          <a href={`mailto:${inq.email}`} className="text-[11px] text-sky-400 block hover:underline mt-0.5">
                            {inq.email}
                          </a>
                          {inq.phone && (
                            <a href={`tel:${inq.phone}`} className="text-[11px] text-slate-400 block font-mono">
                              📞 {inq.phone}
                            </a>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded-md border border-slate-700 font-semibold text-[10px] inline-block">
                            {inq.inquiryType || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300 max-w-sm truncate">
                          {inq.message}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">{getInquiryStatusBadge(inq.status)}</td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenInquiryDetail(inq)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-800 rounded-xl font-semibold transition-colors"
                            >
                              Review
                            </button>
                            <button
                              type="button"
                              onClick={() => setInquiryDeleteId(inq._id)}
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
                {filteredInquiries.map((inq) => (
                  <div key={inq._id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-white">{inq.name}</h3>
                        {inq.company && <p className="text-xs text-slate-300 font-medium">🏢 {inq.company}</p>}
                        <span className="text-[10px] text-sky-400 font-semibold bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/30 inline-block mt-1">
                          {inq.inquiryType || 'General'}
                        </span>
                      </div>
                      {getInquiryStatusBadge(inq.status)}
                    </div>

                    <div className="text-[11px] text-slate-400 bg-[#040c16] p-3 rounded-xl border border-slate-800/60 space-y-1">
                      <div>📧 {inq.email}</div>
                      {inq.phone && <div>📞 {inq.phone}</div>}
                      <div className="text-slate-200 pt-1 border-t border-slate-800/60 line-clamp-2">
                        {inq.message}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenInquiryDetail(inq)}
                        className="flex-1 py-1.5 bg-sky-600 text-white rounded-xl text-xs font-bold text-center"
                      >
                        Review Message
                      </button>
                      <button
                        type="button"
                        onClick={() => setInquiryDeleteId(inq._id)}
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
        </div>
      )}

      {/* Catalog Lead Detail Modal */}
      <AdminModal
        isOpen={!!viewingLead}
        onClose={() => setViewingLead(null)}
        title="Catalog Lead Details"
        description="Review customer catalog request and update follow-up status."
        maxWidth="lg"
      >
        {viewingLead && (
          <form onSubmit={handleUpdateLeadStatus} className="space-y-4">
            <div className="p-4 bg-[#040c16] rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Name</span>
                  <span className="text-white font-bold text-sm block mt-0.5">{viewingLead.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Company</span>
                  <span className="text-white font-medium block mt-0.5">{viewingLead.company || 'Not Specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                  <a href={`mailto:${viewingLead.email}`} className="text-sky-400 hover:underline block mt-0.5">
                    {viewingLead.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                  <a href={`tel:${viewingLead.phone}`} className="text-white font-mono block mt-0.5">
                    {viewingLead.phone || 'Not Provided'}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Catalog Requested</span>
                  <span className="text-sky-300 font-bold block mt-0.5">{viewingLead.catalogName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Received Date</span>
                  <span className="text-slate-300 block mt-0.5">{new Date(viewingLead.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {(viewingLead.requirement || viewingLead.message) && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[11px] font-bold block mb-1">Customer Requirement / Notes:</span>
                  <div className="p-3 bg-slate-900 rounded-xl text-slate-200 text-xs leading-relaxed border border-slate-800/80 whitespace-pre-wrap">
                    {viewingLead.requirement || viewingLead.message}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Update Lead Status *</label>
              <select
                value={leadStatusUpdate}
                onChange={(e) => setLeadStatusUpdate(e.target.value as 'unread' | 'contacted' | 'resolved' | 'archived')}
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="unread">Unread</option>
                <option value="contacted">Contacted / Brochure Sent</option>
                <option value="resolved">Resolved / Deal Closed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Sales Notes &amp; Follow-up Details</label>
              <textarea
                rows={3}
                value={leadNotesUpdate}
                onChange={(e) => setLeadNotesUpdate(e.target.value)}
                placeholder="Sales team notes, quote provided, scheduled demo call..."
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isLeadUpdating}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                {isLeadUpdating ? 'Saving...' : 'Update Lead Status'}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Contact Inquiry Detail Modal */}
      <AdminModal
        isOpen={!!viewingInquiry}
        onClose={() => setViewingInquiry(null)}
        title="Contact Message Details"
        description="Review customer submission and track follow-up progress."
        maxWidth="lg"
      >
        {viewingInquiry && (
          <form onSubmit={handleUpdateInquiryStatus} className="space-y-4">
            <div className="p-4 bg-[#040c16] rounded-2xl border border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Name</span>
                  <span className="text-white font-bold text-sm block mt-0.5">{viewingInquiry.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Company</span>
                  <span className="text-white font-medium block mt-0.5">{viewingInquiry.company || 'Not Specified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                  <a href={`mailto:${viewingInquiry.email}`} className="text-sky-400 hover:underline block mt-0.5">
                    {viewingInquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone</span>
                  <a href={`tel:${viewingInquiry.phone}`} className="text-white font-mono block mt-0.5">
                    {viewingInquiry.phone || 'Not Provided'}
                  </a>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 text-[11px] font-bold block mb-1">Message:</span>
                <div className="p-3 bg-slate-900 rounded-xl text-slate-200 text-xs leading-relaxed border border-slate-800/80 whitespace-pre-wrap">
                  {viewingInquiry.message}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Update Inquiry Status *</label>
              <select
                value={inquiryStatusUpdate}
                onChange={(e) => setInquiryStatusUpdate(e.target.value as 'unread' | 'contacted' | 'resolved' | 'archived')}
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 font-medium"
              >
                <option value="unread">Unread</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Internal Notes</label>
              <textarea
                rows={3}
                value={inquiryNotesUpdate}
                onChange={(e) => setInquiryNotesUpdate(e.target.value)}
                placeholder="Follow-up notes, call history..."
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-600"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setViewingInquiry(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isInquiryUpdating}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
              >
                {isInquiryUpdating ? 'Saving...' : 'Update Status'}
              </button>
            </div>
          </form>
        )}
      </AdminModal>

      {/* Delete Confirmation Modals */}
      <AdminModal
        isOpen={!!leadDeleteId}
        onClose={() => setLeadDeleteId(null)}
        title="Confirm Lead Deletion"
        description="Are you sure you want to permanently delete this catalog lead?"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setLeadDeleteId(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => leadDeleteId && handleDeleteLead(leadDeleteId)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95"
            >
              Delete Lead
            </button>
          </div>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={!!inquiryDeleteId}
        onClose={() => setInquiryDeleteId(null)}
        title="Confirm Message Deletion"
        description="Are you sure you want to permanently delete this contact inquiry?"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setInquiryDeleteId(null)}
              className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => inquiryDeleteId && handleDeleteInquiry(inquiryDeleteId)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95"
            >
              Delete Message
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
