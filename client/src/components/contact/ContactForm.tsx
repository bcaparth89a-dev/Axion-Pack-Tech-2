"use client";

import { useState, useRef } from "react";
import { getInquiryOptionGroups, submitContactInquiry } from "@/lib/api/contact";
import { useServicesData } from "@/hooks/useServicesData";
import { useIndustriesData } from "@/hooks/useIndustriesData";
import HumanVerification, { HumanVerificationRef } from "@/components/common/HumanVerification";

export default function ContactForm() {
  const { services } = useServicesData();
  const { industries } = useIndustriesData();
  const optionGroups = getInquiryOptionGroups(services, industries);

  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    interest: "General Inquiry",
    message: "",
  });

  const [hpWebsite, setHpWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const turnstileRef = useRef<HumanVerificationRef>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Please provide details regarding your inquiry";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message should be at least 10 characters";
    }

    if (!turnstileToken) {
      newErrors.verification = "Please complete the human verification check.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await submitContactInquiry({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        company: formData.companyName.trim() || undefined,
        subject: formData.interest || "General Inquiry",
        message: formData.message.trim(),
        inquiryType: formData.interest || "General Inquiry",
        selectedProductOrService: formData.interest,
        turnstileToken,
        hp_website: hpWebsite || undefined,
      });
      setIsSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission failed. Please try again.";
      setServerError(msg);
      // Reset Turnstile token & widget on verification/server error
      setTurnstileToken("");
      turnstileRef.current?.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: "",
      companyName: "",
      email: "",
      phone: "",
      interest: "General Inquiry",
      message: "",
    });
    setHpWebsite("");
    setTurnstileToken("");
    turnstileRef.current?.reset();
    setErrors({});
    setServerError(null);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-6 sm:p-10 lg:p-12 border border-slate-200 shadow-xl text-center space-y-6 h-full">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl shadow-inner">
          ✓
        </div>

        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-bold uppercase tracking-wider border border-emerald-200">
            Inquiry Dispatched
          </span>
          <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Thank you, {formData.fullName.split(" ")[0]}!
          </h3>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-md mx-auto leading-relaxed">
            Human verification verified. Your message has been received. Our team will get back to you soon.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 max-w-sm w-full text-xs text-left text-slate-600 space-y-1.5">
          <p>
            <strong className="text-slate-900">Inquiry Scope:</strong>{" "}
            {formData.interest}
          </p>
          <p>
            <strong className="text-slate-900">Email:</strong> {formData.email}
          </p>
          {formData.phone && (
            <p>
              <strong className="text-slate-900">Phone:</strong> {formData.phone}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 rounded-xl bg-[#061527] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-sky-950 active:scale-95 cursor-pointer"
        >
          <span>Send Another Message</span>
          <span>↺</span>
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 lg:p-10 border border-slate-200 shadow-xl relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-orange via-sky-500 to-[#061527]" />

      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Request a Consultation / RFQ
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-600">
          Fill in your production details. Our engineers respond within 24 hours.
        </p>
      </div>

      {serverError && (
        <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* Hidden Honeypot Input */}
        <input
          type="text"
          name="hp_website"
          value={hpWebsite}
          onChange={(e) => setHpWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: "absolute",
            opacity: 0,
            left: "-9999px",
            width: "1px",
            height: "1px",
            pointerEvents: "none",
          }}
        />

        {/* 2-Column: Name & Company */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1"
            >
              Full Name <span className="text-brand-orange">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.fullName
                  ? "border-red-400 bg-red-50/40 focus:ring-red-400"
                  : "border-slate-200 bg-slate-50/70 focus:border-[#061527] focus:bg-white focus:ring-brand-orange/20"
              }`}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="companyName"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1"
            >
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Apex Packaging Ltd"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#061527] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* 2-Column: Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1"
            >
              Email Address <span className="text-brand-orange">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@apexpack.com"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.email
                  ? "border-red-400 bg-red-50/40 focus:ring-red-400"
                  : "border-slate-200 bg-slate-50/70 focus:border-[#061527] focus:bg-white focus:ring-brand-orange/20"
              }`}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1"
            >
              Phone / WhatsApp
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#061527] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Full Width: Industry/Service Scope */}
        <div>
          <label
            htmlFor="interest"
            className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1"
          >
            Inquiry Scope / Machine Category
          </label>
          <div className="relative">
            <select
              id="interest"
              name="interest"
              value={formData.interest}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#061527] focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/20 transition-all duration-200 cursor-pointer"
            >
              {optionGroups.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Full Width: Message Textarea */}
        <div>
          <label
            htmlFor="message"
            className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1"
          >
            Message <span className="text-brand-orange">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
            placeholder="Describe your requirements, capacity, products to be packed, or any specific engineering requirements..."
            className={`w-full rounded-xl border px-3.5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 leading-relaxed ${
              errors.message
                ? "border-red-400 bg-red-50/40 focus:ring-red-400"
                : "border-slate-200 bg-slate-50/70 focus:border-[#061527] focus:bg-white focus:ring-brand-orange/20"
            }`}
          />
          {errors.message && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.message}
            </p>
          )}
        </div>

        {/* Reusable Turnstile Human Verification Widget */}
        <div className="pt-1">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-1">
            Security Check <span className="text-brand-orange">*</span>
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
              setTurnstileToken("");
              turnstileRef.current?.reset();
            }}
            onError={() => {
              setTurnstileToken("");
              turnstileRef.current?.reset();
            }}
          />
          {errors.verification && (
            <p className="mt-1 text-xs text-red-600 font-medium">
              {errors.verification}
            </p>
          )}
        </div>

        {/* Full Width Button: ✈ SEND MESSAGE */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !turnstileToken}
            className="group relative inline-flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#061527] hover:bg-[#0B1E36] px-8 py-4 text-sm font-bold tracking-wider text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed border border-sky-900/40 hover:border-brand-orange/60 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>SENDING MESSAGE...</span>
              </>
            ) : (
              <>
                <span className="text-base transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ✈
                </span>
                <span>SEND MESSAGE</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
