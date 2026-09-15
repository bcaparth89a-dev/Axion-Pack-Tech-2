'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardStats, DashboardStats } from '@/lib/api/admin';
import { AdminBadge } from '@/components/admin/ui/AdminBadge';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminLoadingState } from '@/components/admin/ui/AdminLoadingState';

export default function AdminDashboardOverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Dashboard Overview"
          description="Real-time operations, content repository and live system metrics."
        />
        <AdminLoadingState count={8} message="Loading live system metrics from MongoDB..." />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Dashboard Overview"
          description="Real-time operations, content repository and live system metrics."
        />
        <div className="p-6 bg-rose-950/40 border border-rose-500/30 rounded-2xl text-rose-300 space-y-3">
          <h3 className="text-sm font-bold">Failed to load Dashboard Statistics</h3>
          <p className="text-xs">{error || 'Unknown error occurred while connecting to API.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-3.5 py-1.5 bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/50 rounded-xl text-xs font-semibold"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { counts } = stats;

  return (
    <div className="space-y-8">
      {/* Top Breadcrumbs & Page Header */}
      <AdminPageHeader
        title="Admin Control Center"
        badge="Live Metrics"
        description="Unified Content Management System & Real-Time Operational Overview for AXION PackTech."
      >
        <Link
          href="/admin/product-pages"
          className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-950 transition-all flex items-center gap-2"
        >
          <span>Manage Catalog Tree</span>
          <span>&rarr;</span>
        </Link>
      </AdminPageHeader>

      {/* SECTION 1: CATALOG MANAGEMENT METRICS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white uppercase tracking-wider">
              Catalog Hierarchy
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Single Source of Truth</span>
          </div>
          <Link
            href="/admin/product-pages"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
          >
            Open Catalog Workspace &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Categories Card */}
          <Link
            href="/admin/product-pages?filter=categories"
            className="p-5 bg-[#071524] hover:bg-[#0a1e33] border border-slate-800 hover:border-amber-500/40 rounded-2xl transition-all group flex flex-col justify-between shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📁</span>
                <span className="text-xs font-bold text-slate-300 group-hover:text-amber-300 transition-colors uppercase tracking-wider">
                  Categories
                </span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono uppercase bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/40 font-bold">
                Divisions
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-3">
              <span className="text-3xl font-black text-white tracking-tight">
                {counts.categories}
              </span>
              <span className="text-xs text-slate-400">
                ({counts.publishedCategories ?? counts.categories} published
                {counts.draftCategories ? `, ${counts.draftCategories} draft` : ''})
              </span>
            </div>
            <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Manage categories</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Products Card */}
          <Link
            href="/admin/product-pages?filter=products"
            className="p-5 bg-[#071524] hover:bg-[#0a1e33] border border-slate-800 hover:border-sky-500/40 rounded-2xl transition-all group flex flex-col justify-between shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <span className="text-xs font-bold text-slate-300 group-hover:text-sky-300 transition-colors uppercase tracking-wider">
                  Products
                </span>
              </div>
              <span className="text-[10px] text-sky-400 font-mono uppercase bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-800/40 font-bold">
                Machines
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-3">
              <span className="text-3xl font-black text-white tracking-tight">
                {counts.products}
              </span>
              <span className="text-xs text-slate-400">
                ({counts.publishedProducts ?? counts.products} published
                {counts.draftProducts ? `, ${counts.draftProducts} draft` : ''})
              </span>
            </div>
            <div className="text-[11px] text-sky-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Manage products</span>
              <span>&rarr;</span>
            </div>
          </Link>

          {/* Models Card */}
          <Link
            href="/admin/product-pages?filter=models"
            className="p-5 bg-[#071524] hover:bg-[#0a1e33] border border-slate-800 hover:border-emerald-500/40 rounded-2xl transition-all group flex flex-col justify-between shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏷️</span>
                <span className="text-xs font-bold text-slate-300 group-hover:text-emerald-300 transition-colors uppercase tracking-wider">
                  Models / Variants
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono uppercase bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/40 font-bold">
                Specs
              </span>
            </div>
            <div className="my-3 flex items-baseline gap-3">
              <span className="text-3xl font-black text-white tracking-tight">
                {counts.models ?? 0}
              </span>
              <span className="text-xs text-slate-400">
                ({counts.publishedModels ?? counts.models ?? 0} published
                {counts.draftModels ? `, ${counts.draftModels} draft` : ''})
              </span>
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Manage models</span>
              <span>&rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION 2: LEADS & INQUIRIES */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-white uppercase tracking-wider">
              Customer Leads & Recruitment
            </span>
          </div>
          <Link
            href="/admin/inquiries"
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
          >
            View All Inquiries &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Catalog Leads */}
          <Link
            href="/admin/inquiries"
            className="p-5 bg-[#071524] hover:bg-[#0a1e33] border border-slate-800 hover:border-purple-500/40 rounded-2xl transition-all group flex flex-col justify-between shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-purple-300 transition-colors">
                Catalog Downloads
              </span>
              <span className="text-base">📑</span>
            </div>
            <div className="text-3xl font-black text-white tracking-tight my-2">
              {counts.catalogDownloads ?? 0}
            </div>
            <div className="text-[11px] text-purple-400 font-medium flex items-center gap-1">
              <span>View catalog leads &rarr;</span>
            </div>
          </Link>

          {/* Contact Requests */}
          <Link
            href="/admin/inquiries"
            className="p-5 bg-[#071524] hover:bg-[#0a1e33] border border-slate-800 hover:border-rose-500/40 rounded-2xl transition-all group flex flex-col justify-between shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-rose-300 transition-colors">
                Contact Inquiries
              </span>
              {counts.unreadInquiries > 0 && (
                <span className="px-2 py-0.5 bg-rose-950 text-rose-300 text-[10px] font-bold rounded-full border border-rose-500/30 animate-pulse">
                  {counts.unreadInquiries} unread
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-white tracking-tight my-2">
              {counts.contactRequests ?? counts.inquiries}
            </div>
            <div className="text-[11px] text-rose-400 font-medium flex items-center gap-1">
              <span>View contact messages &rarr;</span>
            </div>
          </Link>

          {/* Career Applications */}
          <Link
            href="/admin/applications"
            className="p-5 bg-[#071524] hover:bg-[#0a1e33] border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition-all group flex flex-col justify-between shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-300 transition-colors">
                Candidate Applications
              </span>
              {counts.pendingApplications > 0 && (
                <span className="px-2 py-0.5 bg-amber-950 text-amber-300 text-[10px] font-bold rounded-full border border-amber-500/30">
                  {counts.pendingApplications} pending
                </span>
              )}
            </div>
            <div className="text-3xl font-black text-white tracking-tight my-2">
              {counts.applications}
            </div>
            <div className="text-[11px] text-indigo-400 font-medium flex items-center gap-1">
              <span>Review candidate resumes &rarr;</span>
            </div>
          </Link>
        </div>
      </section>

      {/* SECTION 3: CONTENT & BUSINESS MODULES */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-black text-white uppercase tracking-wider">
            Content & Business Modules
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/admin/industries"
            className="p-4 bg-[#071524] hover:bg-[#0a1e33] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all group flex flex-col justify-between gap-2 shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-white">Industries</span>
              <span>🏭</span>
            </div>
            <div className="text-2xl font-black text-white">{counts.industries}</div>
            <span className="text-[10px] text-sky-400">View solutions &rarr;</span>
          </Link>

          <Link
            href="/admin/services"
            className="p-4 bg-[#071524] hover:bg-[#0a1e33] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all group flex flex-col justify-between gap-2 shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-white">Services</span>
              <span>🔧</span>
            </div>
            <div className="text-2xl font-black text-white">{counts.services}</div>
            <span className="text-[10px] text-sky-400">View capabilities &rarr;</span>
          </Link>

          <Link
            href="/admin/news"
            className="p-4 bg-[#071524] hover:bg-[#0a1e33] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all group flex flex-col justify-between gap-2 shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-white">News & Press</span>
              <span>📰</span>
            </div>
            <div className="text-2xl font-black text-white">{counts.news}</div>
            <span className="text-[10px] text-sky-400">Manage press &rarr;</span>
          </Link>

          <Link
            href="/admin/blogs"
            className="p-4 bg-[#071524] hover:bg-[#0a1e33] border border-slate-800 hover:border-slate-700 rounded-2xl transition-all group flex flex-col justify-between gap-2 shadow"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 group-hover:text-white">Blogs & Insights</span>
              <span>✍️</span>
            </div>
            <div className="text-2xl font-black text-white">{counts.blogs}</div>
            <span className="text-[10px] text-sky-400">Manage articles &rarr;</span>
          </Link>
        </div>
      </section>

      {/* SECTION 4: RECENT ACTIVITY (INQUIRIES & APPLICATIONS) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries */}
        <div className="p-5 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Recent Customer Inquiries</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Incoming leads from public catalog & contact forms</p>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              View All &rarr;
            </Link>
          </div>

          {stats.recentInquiries.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No inquiries received yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {stats.recentInquiries.map((inq) => (
                <div key={inq._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{inq.name}</span>
                      {inq.company && (
                        <span className="text-[10px] text-slate-400">({inq.company})</span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {inq.email} {inq.phone ? `• ${inq.phone}` : ''}
                    </div>
                    {inq.inquiryType && (
                      <span className="inline-block mt-1 text-[10px] font-medium text-sky-400 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-800/30">
                        {inq.inquiryType}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <AdminBadge
                      variant={
                        inq.status === 'unread'
                          ? 'warning'
                          : inq.status === 'contacted'
                          ? 'info'
                          : inq.status === 'resolved'
                          ? 'success'
                          : 'neutral'
                      }
                    >
                      {inq.status}
                    </AdminBadge>
                    <span className="text-[10px] text-slate-500">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="p-5 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Recent Job Applications</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Candidates applying for packaging & engineering roles</p>
            </div>
            <Link
              href="/admin/applications"
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              View All &rarr;
            </Link>
          </div>

          {stats.recentApplications.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">
              No applications submitted yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/60">
              {stats.recentApplications.map((app) => (
                <div key={app._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white truncate block">
                      {app.candidateName}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                      {app.careerTitle}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {app.email} • {app.phone}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <AdminBadge
                      variant={
                        app.status === 'pending' || app.status === 'new'
                          ? 'warning'
                          : app.status === 'reviewed' || app.status === 'reviewing'
                          ? 'info'
                          : app.status === 'shortlisted' || app.status === 'hired'
                          ? 'success'
                          : 'danger'
                      }
                    >
                      {app.status}
                    </AdminBadge>
                    <span className="text-[10px] text-slate-500">
                      {new Date(app.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
