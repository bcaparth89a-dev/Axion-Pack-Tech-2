'use client';

import React, { useState, useEffect, useRef } from 'react';
import { submitCatalogLead } from '@/lib/api/catalogLeads';
import HumanVerification, { HumanVerificationRef } from './HumanVerification';

export interface CatalogLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  pdfName?: string;
  pdfSize?: number;
  catalogName: string;
  entityType?: 'category' | 'product' | 'model' | 'general';
  entitySlug?: string;
}

export default function CatalogLeadModal({
  isOpen,
  onClose,
  pdfUrl,
  pdfName,
  pdfSize,
  catalogName,
  entityType = 'general',
  entitySlug = '',
}: CatalogLeadModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    requirement: '',
  });

  const [hpWebsite, setHpWebsite] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const turnstileRef = useRef<HumanVerificationRef>(null);

  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setServerError(null);
      setErrors({});
      setTurnstileToken('');
      setHpWebsite('');
      turnstileRef.current?.reset();
      // Focus on first field when modal opens
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid work email address.';
    }

    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{4,20}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone / WhatsApp number is required.';
    } else if (!phoneRegex.test(formData.phone.trim()) || formData.phone.replace(/\D/g, '').length < 6) {
      newErrors.phone = 'Please enter a valid phone number (min 6 digits).';
    }

    if (!turnstileToken) {
      newErrors.verification = 'Please complete the human verification check.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const triggerDirectDownload = () => {
    if (!pdfUrl) return;
    try {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfName || `${catalogName.replace(/\s+/g, '_')}_Catalog.pdf`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(pdfUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      await submitCatalogLead({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim() || undefined,
        requirement: formData.requirement.trim() || undefined,
        catalogName,
        entityType,
        entitySlug: entitySlug || undefined,
        pdfUrl,
        turnstileToken,
        hp_website: hpWebsite || undefined,
      });

      setIsSuccess(true);

      // Automatically trigger download ONLY after successful verification + submission
      setTimeout(() => {
        triggerDirectDownload();
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Security verification or submission failed. Please try again.';
      setServerError(msg);
      // Reset Turnstile token & widget on verification/submission failure
      setTurnstileToken('');
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes || bytes <= 0) return 'Technical Datasheet (PDF)';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB PDF`;
    const kb = Math.round(bytes / 1024);
    return `${kb} KB PDF`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden transition-all transform animate-scale-up"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-800/80 flex items-start justify-between bg-slate-950/60">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Official Technical Catalog
              </span>
              <h3 id="modal-title" className="text-lg font-bold text-white tracking-tight leading-tight">
                {catalogName}
              </h3>
              <p className="text-xs text-slate-400">
                {formatFileSize(pdfSize)} • Free Instant Download
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/80 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div className="space-y-2">
                <h4 className="text-xl font-bold text-white tracking-tight">
                  Thank You, {formData.name.split(' ')[0]}!
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  Human verification completed. Your official catalog download for <strong className="text-white font-semibold">{catalogName}</strong> has started automatically.
                </p>
              </div>

              <div className="p-4 bg-slate-950/70 rounded-xl border border-slate-800 max-w-sm mx-auto text-left space-y-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Verification details registered</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Engineering team notified</span>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={triggerDirectDownload}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Again</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden Honeypot Input to catch automated bots */}
              <input
                type="text"
                name="hp_website"
                value={hpWebsite}
                onChange={(e) => setHpWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  opacity: 0,
                  left: '-9999px',
                  width: '1px',
                  height: '1px',
                  pointerEvents: 'none',
                }}
              />

              <p className="text-xs text-slate-400">
                Please provide your contact details to access full technical specs, dimensions, and capacity ratings.
              </p>

              {serverError && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{serverError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  ref={firstInputRef}
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: '' });
                  }}
                  placeholder="e.g. John Doe"
                  className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                    errors.name
                      ? 'border-rose-500 focus:border-rose-400'
                      : 'border-slate-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30'
                  }`}
                />
                {errors.name && <p className="text-[11px] text-rose-400 mt-0.5">{errors.name}</p>}
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Work Email <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="name@company.com"
                    className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.email
                        ? 'border-rose-500 focus:border-rose-400'
                        : 'border-slate-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30'
                    }`}
                  />
                  {errors.email && <p className="text-[11px] text-rose-400 mt-0.5">{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Phone / WhatsApp <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: '' });
                    }}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full px-3.5 py-2.5 bg-slate-950/80 border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
                      errors.phone
                        ? 'border-rose-500 focus:border-rose-400'
                        : 'border-slate-800 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30'
                    }`}
                  />
                  {errors.phone && <p className="text-[11px] text-rose-400 mt-0.5">{errors.phone}</p>}
                </div>
              </div>

              {/* Company Name (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Company / Organization <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="e.g. Apex Packaging Ltd"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 transition-colors"
                />
              </div>

              {/* Requirement / Description (Optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Project Requirement / Notes <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.requirement}
                  onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                  placeholder="Target speed (BPM), bottle/container dimensions, project timeline..."
                  className="w-full px-3.5 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/30 transition-colors resize-none"
                />
              </div>

              {/* Reusable Turnstile Human Verification Widget */}
              <div className="space-y-1 pt-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Security Verification <span className="text-amber-400">*</span>
                </label>
                <HumanVerification
                  ref={turnstileRef}
                  onVerify={(token) => {
                    setTurnstileToken(token);
                    if (errors.verification) {
                      setErrors((prev) => {
                        const cp = { ...prev };
                        delete cp.verification;
                        return cp;
                      });
                    }
                  }}
                  onExpire={() => {
                    setTurnstileToken('');
                    turnstileRef.current?.reset();
                  }}
                  onError={() => {
                    setTurnstileToken('');
                    turnstileRef.current?.reset();
                  }}
                />
                {errors.verification && (
                  <p className="text-[11px] text-rose-400 mt-0.5">{errors.verification}</p>
                )}
              </div>

              {/* Submit & Privacy */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isSubmitting || !turnstileToken}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Verifying & Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Download Catalog PDF</span>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-slate-400 flex items-center justify-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Protected by Cloudflare Turnstile human challenge.</span>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
