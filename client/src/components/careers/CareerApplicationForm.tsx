"use client";

import { useState, useRef, useEffect, ChangeEvent, FormEvent, DragEvent } from "react";
import Link from "next/link";
import { CareerOpportunity } from "@/data/careers";
import {
  getAllCareers,
  submitCareerApplication,
  CareerApplicationSubmissionResult,
} from "@/lib/api/careers";
import HumanVerification, { HumanVerificationRef } from "@/components/common/HumanVerification";

interface CareerApplicationFormProps {
  opportunity?: CareerOpportunity;
}

export default function CareerApplicationForm({
  opportunity,
}: CareerApplicationFormProps) {
  // Active openings from MongoDB
  const [activeCareers, setActiveCareers] = useState<CareerOpportunity[]>(
    opportunity ? [opportunity] : []
  );
  const [loadingCareers, setLoadingCareers] = useState(false);

  // Form fields state (Only the 6 required items: Name, Email, Phone, Position, Resume, Cover Message)
  const [candidateName, setCandidateName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [careerSlug, setCareerSlug] = useState(opportunity?.slug || "");
  const [careerTitle, setCareerTitle] = useState(opportunity?.title || "");
  const [coverMessage, setCoverMessage] = useState("");
  const [confirmAccurate, setConfirmAccurate] = useState(true);
  const [hpWebsite, setHpWebsite] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<HumanVerificationRef>(null);

  // CV / Resume File state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<CareerApplicationSubmissionResult | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch active career openings from MongoDB
  useEffect(() => {
    let isMounted = true;
    async function loadOpenings() {
      try {
        setLoadingCareers(true);
        const careers = await getAllCareers();
        const active = careers.filter((c) => c.isActive);
        if (isMounted) {
          if (active.length > 0) {
            setActiveCareers(active);
            if (!careerSlug) {
              setCareerSlug(active[0].slug);
              setCareerTitle(active[0].title);
            }
          }
        }
      } catch {
        // keep initial if any
      } finally {
        if (isMounted) setLoadingCareers(false);
      }
    }

    loadOpenings();
    return () => {
      isMounted = false;
    };
  }, [careerSlug]);

  const handlePositionChange = (slug: string) => {
    setCareerSlug(slug);
    const found = activeCareers.find((c) => c.slug === slug);
    if (found) {
      setCareerTitle(found.title);
    }
  };

  const validateAndSetFile = (file: File) => {
    setFileError(null);
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const validExtensions = [".pdf", ".doc", ".docx"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExt)) {
      setFileError("Invalid file format. Please upload a PDF, DOC, or DOCX document.");
      setResumeFile(null);
      return false;
    }

    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File size exceeds 10MB limit. Please choose a smaller file.");
      setResumeFile(null);
      return false;
    }

    setResumeFile(file);
    return true;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const errors: string[] = [];

    if (!candidateName.trim()) {
      errors.push("Full Name is required.");
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("A valid Email address is required.");
    }
    if (!phone.trim() || phone.trim().length < 8) {
      errors.push("A valid Phone number is required (at least 8 digits).");
    }
    if (!careerSlug || !careerTitle) {
      errors.push("Please select a Position / Job Opening.");
    }
    if (!resumeFile) {
      errors.push("Please upload your Resume/CV (PDF, DOC, or DOCX up to 10MB).");
    }
    if (!confirmAccurate) {
      errors.push("Please confirm that your information is accurate.");
    }
    if (!turnstileToken) {
      errors.push("Please complete the 'Verify you are human' security check.");
    }

    if (errors.length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 350, behavior: "smooth" });
      return;
    }

    setValidationErrors([]);
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("candidateName", candidateName.trim());
      formDataToSend.append("email", email.trim().toLowerCase());
      formDataToSend.append("phone", phone.trim());
      formDataToSend.append("careerSlug", careerSlug);
      formDataToSend.append("careerTitle", careerTitle);
      if (coverMessage.trim()) {
        formDataToSend.append("coverMessage", coverMessage.trim());
      }
      formDataToSend.append("turnstileToken", turnstileToken);
      if (hpWebsite) {
        formDataToSend.append("hp_website", hpWebsite);
      }
      formDataToSend.append("resume", resumeFile as File);

      const result = await submitCareerApplication(formDataToSend, careerSlug);
      setSubmissionResult(result);
      setIsSubmitted(true);
      window.scrollTo({ top: 300, behavior: "smooth" });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to submit application. Please check your connection and try again.";
      setApiError(message);
      // Reset Turnstile token & widget on verification/submission failure
      setTurnstileToken("");
      turnstileRef.current?.reset();
      window.scrollTo({ top: 350, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl bg-white border border-emerald-200 p-8 sm:p-12 shadow-xl text-center max-w-2xl mx-auto">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl mx-auto mb-6">
          ✓
        </div>

        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Application Submitted Successfully!
        </h3>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          Thank you, <span className="font-bold text-slate-900">{candidateName}</span>. Your application for{" "}
          <span className="font-bold text-sky-800">{careerTitle}</span> has been securely stored in our recruitment portal.
        </p>

        {/* Confirmation details box */}
        <div className="my-6 rounded-xl bg-sky-50 border border-sky-200 p-5 text-left text-xs text-slate-700 space-y-3">
          <div className="font-bold text-sky-900 flex items-center gap-2 text-sm">
            <span>📄</span> Application Reference Summary
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] text-slate-600 pt-2 border-t border-sky-200/60">
            <div><strong>Candidate:</strong> {candidateName}</div>
            <div><strong>Position:</strong> {careerTitle}</div>
            <div><strong>Email:</strong> {email}</div>
            <div><strong>Phone:</strong> {phone}</div>
            <div><strong>Resume Attached:</strong> {resumeFile?.name}</div>
            <div><strong>Status:</strong> <span className="capitalize text-emerald-700 font-semibold">{submissionResult?.status || 'New'}</span></div>
          </div>
          <p className="text-[11px] text-slate-500 italic pt-1">
            Our talent acquisition team will review your qualifications and contact you if your profile matches our requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link
            href="/careers"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-xs sm:text-sm font-bold text-white transition-all hover:bg-sky-600"
          >
            <span>Explore Other Opportunities</span>
            <span>→</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setCandidateName("");
              setEmail("");
              setPhone("");
              setCoverMessage("");
              setResumeFile(null);
              setSubmissionResult(null);
              setApiError(null);
            }}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  const selectedOpp = activeCareers.find((c) => c.slug === careerSlug);

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl bg-white border border-slate-200/90 shadow-xl overflow-hidden"
    >
      {/* Form Header */}
      <div className="bg-[#061527] px-6 py-6 sm:px-8 sm:py-8 text-white border-b border-sky-900/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Direct Candidate Application
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {careerTitle || "Submit Your Application"}
            </h2>
          </div>
          {selectedOpp && (
            <span className="rounded-lg bg-sky-950/80 px-3 py-1.5 text-xs font-bold text-sky-300 border border-sky-800/60">
              {selectedOpp.employmentType || "Full-Time"}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Join our packaging engineering &amp; automation team at Axion PackTech Vadodara.
        </p>
      </div>

      <div className="p-6 sm:p-10 space-y-8">
        {/* API Error / Duplicate Submission Alert */}
        {apiError && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800">
            <div className="font-bold flex items-center gap-2 mb-1 text-sm text-rose-900">
              <span>⚠️</span> Application Error
            </div>
            <p className="leading-relaxed">{apiError}</p>
          </div>
        )}

        {/* Validation Errors Box */}
        {validationErrors.length > 0 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900">
            <div className="font-bold flex items-center gap-1.5 mb-2 text-sm text-amber-950">
              <span>⚠️</span> Please fix the following before submitting:
            </div>
            <ul className="list-disc list-inside space-y-1">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. CANDIDATE CONTACT DETAILS */}
        {/* ======================================================== */}
        <div>
          <div className="border-b border-slate-200 pb-3 mb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-mono">
                1
              </span>
              Candidate Information
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Please enter your full name and direct contact details.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="candidateName"
                required
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul.sharma@example.com"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              />
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. POSITION / JOB OPENING (DYNAMIC FROM MONGODB) */}
        {/* ======================================================== */}
        <div>
          <div className="border-b border-slate-200 pb-3 mb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-mono">
                2
              </span>
              Target Position / Job Opening <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select the open role you wish to apply for.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Position <span className="text-red-500">*</span>
            </label>
            <select
              value={careerSlug}
              onChange={(e) => handlePositionChange(e.target.value)}
              disabled={loadingCareers}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20 bg-white"
            >
              {activeCareers.length === 0 ? (
                <option value="">{loadingCareers ? "Loading active openings..." : "No active positions found"}</option>
              ) : (
                activeCareers.map((opp) => (
                  <option key={opp.slug} value={opp.slug}>
                    {opp.title} {opp.department ? `(${opp.department})` : ""} - {opp.location || "Vadodara"}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 3. RESUME / CV UPLOAD */}
        {/* ======================================================== */}
        <div>
          <div className="border-b border-slate-200 pb-3 mb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-mono">
                3
              </span>
              Upload Resume / CV <span className="text-red-500">*</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Upload your updated resume in PDF, DOC, or DOCX format (Max 10MB).
            </p>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-sky-500 bg-sky-50/70"
                : resumeFile
                ? "border-emerald-400 bg-emerald-50/40"
                : "border-slate-300 bg-slate-50/50 hover:bg-slate-100/60 hover:border-slate-400"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />

            {resumeFile ? (
              <div className="space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl mx-auto">
                  📄
                </div>
                <div className="font-bold text-sm text-slate-900">
                  {resumeFile.name}
                </div>
                <div className="text-xs text-slate-500">
                  {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready to Upload
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setResumeFile(null);
                  }}
                  className="mt-2 text-xs font-semibold text-rose-600 hover:text-rose-700 underline"
                >
                  Remove &amp; Choose Another File
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 text-2xl mx-auto shadow-inner">
                  📁
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800">
                    Drag &amp; Drop your Resume / CV here
                  </span>{" "}
                  <span className="text-sm text-slate-500">or</span>{" "}
                  <span className="text-sm font-bold text-sky-600 hover:text-sky-700 underline">
                    Browse Files
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Accepted Formats: PDF, DOC, DOCX • Maximum file size: 10MB
                </p>
              </div>
            )}
          </div>

          {fileError && (
            <p className="mt-2 text-xs font-semibold text-rose-600">
              {fileError}
            </p>
          )}
        </div>

        {/* ======================================================== */}
        {/* 4. COVER MESSAGE (OPTIONAL) */}
        {/* ======================================================== */}
        <div>
          <div className="border-b border-slate-200 pb-3 mb-6">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-mono">
                4
              </span>
              Cover Message <span className="text-xs font-normal text-slate-400">(Optional)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add a brief note about your experience, motivation, or qualifications.
            </p>
          </div>

          <div>
            <textarea
              rows={4}
              value={coverMessage}
              onChange={(e) => setCoverMessage(e.target.value)}
              placeholder="Briefly introduce yourself or share why you are interested in this position..."
              className="w-full rounded-xl border border-slate-300 p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
          </div>
        </div>

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

        {/* ======================================================== */}
        {/* 5. DECLARATION & CONSENT */}
        {/* ======================================================== */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmAccurate}
              onChange={(e) => setConfirmAccurate(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-xs text-slate-700 leading-relaxed select-none">
              I confirm that the details and documents provided in this application are accurate, and I agree to be contacted by Axion PackTech HR regarding this opportunity.
            </span>
          </label>
        </div>

        {/* ======================================================== */}
        {/* 6. SECURITY VERIFICATION */}
        {/* ======================================================== */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-2">
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
            Security Check <span className="text-rose-500">*</span>
          </label>
          <HumanVerification
            ref={turnstileRef}
            action="career_application"
            onVerify={(token) => setTurnstileToken(token)}
            onExpire={() => {
              setTurnstileToken("");
            }}
            onError={() => {
              setTurnstileToken("");
            }}
          />
        </div>

        {/* Submit Action */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !turnstileToken}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#061527] px-8 py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-slate-900/20 transition-all duration-200 hover:bg-sky-700 hover:shadow-sky-600/30 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99] cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                <span>Submitting Application to Axion HR...</span>
              </>
            ) : (
              <span>Submit Application →</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
