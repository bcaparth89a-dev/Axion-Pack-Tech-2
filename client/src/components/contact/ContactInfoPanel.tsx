import { getContactInfo } from "@/lib/api/contact";

export default async function ContactInfoPanel() {
  const contactInfo = await getContactInfo();
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#061527] p-8 sm:p-10 lg:p-12 text-white border border-sky-900/40 shadow-2xl">
      {/* Background Engineering Blueprint Grid Accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 space-y-8">
        {/* Header Branding */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/70 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-200 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange shadow-[0_0_6px_#ea580c]" />
            COMPANY INFORMATION
          </div>

          <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {contactInfo.companyName}
          </h2>

          <p className="mt-1 text-sm font-medium text-sky-300">
            {contactInfo.tagline}
          </p>

          <div className="mt-3 h-1 w-14 rounded-full bg-brand-orange shadow-[0_0_6px_#ea580c]" />
        </div>

        {/* Contact Points List */}
        <div className="space-y-6">
          {/* Email Item */}
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-300 shadow-sm">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                EMAIL
              </span>
              <a
                href={`mailto:${contactInfo.email}`}
                className="mt-0.5 inline-block text-sm sm:text-base font-semibold text-white hover:text-brand-orange transition-colors"
              >
                {contactInfo.email}
              </a>
            </div>
          </div>

          {/* Phone Item */}
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-300 shadow-sm">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                PHONE
              </span>
              <div className="mt-0.5 flex flex-col space-y-1">
                {contactInfo.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="text-sm sm:text-base font-semibold text-white hover:text-brand-orange transition-colors"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Website Item */}
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-300 shadow-sm">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                WEBSITE
              </span>
              <a
                href={`https://${contactInfo.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-block text-sm sm:text-base font-semibold text-white hover:text-brand-orange transition-colors"
              >
                {contactInfo.website}
              </a>
            </div>
          </div>

          {/* Address Item */}
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-300 shadow-sm">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                ADDRESS
              </span>
              <p className="mt-0.5 text-sm sm:text-base font-semibold text-white leading-snug">
                {contactInfo.address.city}
                <br />
                <span className="text-slate-300 font-normal">
                  {contactInfo.address.state}, {contactInfo.address.country}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="relative z-10 mt-10 border-t border-sky-900/60 pt-6">
        <span className="block text-xs font-mono font-bold uppercase tracking-widest text-sky-400">
          FOLLOW US
        </span>

        <div className="mt-4 flex items-center gap-3">
          {/* WhatsApp */}
          <a
            href={contactInfo.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contact on WhatsApp"
            className="group flex h-11 w-11 items-center justify-center rounded-xl bg-sky-950/80 border border-sky-800/60 text-emerald-400 shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 hover:-translate-y-0.5"
          >
            <span className="text-xl leading-none">💬</span>
          </a>

          {/* Facebook */}
          <a
            href={contactInfo.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="AXION PackTech on Facebook"
            className="group flex h-11 w-11 items-center justify-center rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-400 shadow-sm transition-all duration-200 hover:bg-sky-600 hover:text-white hover:border-sky-500 hover:-translate-y-0.5"
          >
            <span className="text-sm font-bold font-sans">fb</span>
          </a>

          {/* Instagram */}
          <a
            href={contactInfo.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="AXION PackTech on Instagram"
            className="group flex h-11 w-11 items-center justify-center rounded-xl bg-sky-950/80 border border-sky-800/60 text-pink-400 shadow-sm transition-all duration-200 hover:bg-pink-600 hover:text-white hover:border-pink-500 hover:-translate-y-0.5"
          >
            <span className="text-sm font-bold font-sans">ig</span>
          </a>

          {/* Email Direct */}
          <a
            href={contactInfo.social.email}
            aria-label="Email AXION PackTech"
            className="group flex h-11 w-11 items-center justify-center rounded-xl bg-sky-950/80 border border-sky-800/60 text-amber-400 shadow-sm transition-all duration-200 hover:bg-brand-orange hover:text-white hover:border-brand-orange hover:-translate-y-0.5"
          >
            <span className="text-lg leading-none">✉️</span>
          </a>
        </div>
      </div>
    </div>
  );
}
