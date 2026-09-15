'use client';

import React, { useEffect, useState } from 'react';
import { getContactSettingsAdmin, updateContactSettingsAdmin } from '@/lib/api/admin';
import { AdminPageHeader } from '@/components/admin/ui/AdminPageHeader';
import { AdminLoadingState } from '@/components/admin/ui/AdminLoadingState';
import { useToast } from '@/context/ToastContext';

interface ContactSettingsData {
  companyName?: string;
  tagline?: string;
  slogan?: string;
  email?: string;
  phones?: string[];
  website?: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    display?: string;
    fullStreet?: string;
    postalCode?: string;
  };
  social?: {
    whatsapp?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    email?: string;
  };
  businessHours?: {
    weekdays?: string;
    saturday?: string;
    sunday?: string;
  };
}

export default function AdminContactSettingsPage() {
  const [data, setData] = useState<ContactSettingsData>({});
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getContactSettingsAdmin<ContactSettingsData>();
        setData(res || {});
        if (res?.phones && res.phones.length > 0) {
          setPhone1(res.phones[0] || '');
          setPhone2(res.phones[1] || '');
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to load contact settings';
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
      const payload: ContactSettingsData = {
        ...data,
        phones: [phone1, phone2].filter(Boolean),
      };
      await updateContactSettingsAdmin(payload);
      showToast('Contact information updated successfully', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save contact settings';
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          breadcrumbs={[{ label: 'System Settings', href: '/admin/settings/site' }, { label: 'Contact Settings' }]}
          title="Contact & Facility Information"
          description="Facility location, official communication channels, and business hours."
        />
        <AdminLoadingState type="form" count={3} message="Loading contact settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        breadcrumbs={[{ label: 'System Settings', href: '/admin/settings/site' }, { label: 'Contact Settings' }]}
        title="Contact Information & Operations"
        badge="Live Info"
        description="Configure manufacturing facility addresses, official dispatch telephone lines, inquiry email routing, and social media channels."
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
          <span>{isSaving ? 'Saving...' : 'Save Contact Info'}</span>
        </button>
      </AdminPageHeader>

      <form onSubmit={handleSave} className="space-y-6">
        {/* OFFICIAL COMMUNICATION CHANNELS */}
        <div className="p-6 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-sky-400 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
              Official Communication Channels
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Channels</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Official Inquiry Email *</label>
              <input
                type="email"
                required
                value={data.email || ''}
                onChange={(e) => setData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="info@axionpacktech.com"
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Official Website URL</label>
              <input
                type="url"
                value={data.website || ''}
                onChange={(e) => setData((prev) => ({ ...prev, website: e.target.value }))}
                placeholder="https://axionpacktech.com"
                className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Primary Phone / Sales Hotline</label>
              <input
                type="text"
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Secondary Phone / Plant Dispatch</label>
              <input
                type="text"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                placeholder="+91 98765 43211"
                className="w-full px-3.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* PHYSICAL FACILITY & DISPATCH ADDRESS */}
        <div className="p-6 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-emerald-400 tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              Manufacturing Plant &amp; Corporate Address
            </h2>
            <span className="text-[10px] text-slate-500 uppercase font-mono">Location</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Full Street Address &amp; Industrial Estate</label>
            <input
              type="text"
              value={data.address?.fullStreet || ''}
              onChange={(e) =>
                setData((prev) => ({
                  ...prev,
                  address: { ...prev.address, fullStreet: e.target.value },
                }))
              }
              placeholder="Plot No. 124, GIDC Industrial Estate, Manjusar"
              className="w-full px-3.5 py-2.5 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">City</label>
              <input
                type="text"
                value={data.address?.city || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    address: { ...prev.address, city: e.target.value },
                  }))
                }
                placeholder="Vadodara"
                className="w-full px-3.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">State / Province</label>
              <input
                type="text"
                value={data.address?.state || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    address: { ...prev.address, state: e.target.value },
                  }))
                }
                placeholder="Gujarat"
                className="w-full px-3.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Postal Code</label>
              <input
                type="text"
                value={data.address?.postalCode || ''}
                onChange={(e) =>
                  setData((prev) => ({
                    ...prev,
                    address: { ...prev.address, postalCode: e.target.value },
                  }))
                }
                placeholder="391775"
                className="w-full px-3.5 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        {/* SOCIAL CHANNELS & BUSINESS HOURS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Social Channels */}
          <div className="p-6 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-indigo-400 tracking-tight flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Social Media Channels
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">WhatsApp Business Hotline</label>
                <input
                  type="text"
                  value={data.social?.whatsapp || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      social: { ...prev.social, whatsapp: e.target.value },
                    }))
                  }
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">LinkedIn Company Page</label>
                <input
                  type="url"
                  value={data.social?.linkedin || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      social: { ...prev.social, linkedin: e.target.value },
                    }))
                  }
                  placeholder="https://linkedin.com/company/axion-packtech"
                  className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="p-6 bg-[#071524] border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-amber-400 tracking-tight flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Plant &amp; Office Operating Hours
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Monday - Friday (Weekdays)</label>
                <input
                  type="text"
                  value={data.businessHours?.weekdays || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      businessHours: { ...prev.businessHours, weekdays: e.target.value },
                    }))
                  }
                  placeholder="9:00 AM – 6:30 PM IST"
                  className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400">Saturday (Plant Operations)</label>
                <input
                  type="text"
                  value={data.businessHours?.saturday || ''}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      businessHours: { ...prev.businessHours, saturday: e.target.value },
                    }))
                  }
                  placeholder="9:00 AM – 2:00 PM IST"
                  className="w-full px-3 py-2 bg-[#040c16] border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>
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
            <span>{isSaving ? 'Saving Changes...' : 'Save Contact Information'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
