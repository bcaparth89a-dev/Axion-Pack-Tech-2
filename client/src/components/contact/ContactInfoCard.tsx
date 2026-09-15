import { getContactInfo } from "@/lib/api/contact";

export default async function ContactInfoCard() {
  const contactInfo = await getContactInfo();
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#061527] p-6 sm:p-8 lg:p-10 text-white border border-sky-900/40 shadow-2xl h-full">
      {/* Background Engineering Blueprint Grid Accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 space-y-7 sm:space-y-8">
        {/* Header Branding */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/70 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-200 uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-orange shadow-[0_0_6px_#ea580c]" />
            HEADQUARTERS &amp; SUPPORT
          </div>

          <h3 className="mt-3.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {contactInfo.companyName}
          </h3>

          <p className="mt-1 text-xs sm:text-sm font-medium text-sky-300">
            {contactInfo.tagline}
          </p>

          <div className="mt-3 h-1 w-14 rounded-full bg-brand-orange shadow-[0_0_6px_#ea580c]" />
        </div>

        {/* Contact Points List */}
        <div className="space-y-5 sm:space-y-6 text-sm">
          {/* Email Item */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-300 shadow-sm">
              <span className="text-lg">📧</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                EMAIL
              </span>
              <a
                href={`mailto:${contactInfo.email}`}
                className="mt-0.5 block truncate font-semibold text-white hover:text-brand-orange transition-colors"
              >
                {contactInfo.email}
              </a>
            </div>
          </div>

          {/* Phone Item */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-300 shadow-sm">
              <span className="text-lg">📞</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                PHONE
              </span>
              <div className="mt-0.5 flex flex-col space-y-1">
                {contactInfo.phones.map((phone) => (
                  <a
                    key={phone}
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="font-semibold text-white hover:text-brand-orange transition-colors"
                  >
                    {phone}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* WhatsApp Dedicated Link */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 shadow-sm">
              <span className="text-lg">💬</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                WHATSAPP
              </span>
              <a
                href={contactInfo.social.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 inline-flex items-center gap-1.5 font-semibold text-white hover:text-emerald-400 transition-colors"
              >
                <span>Chat Directly on WhatsApp</span>
                <span className="text-xs">↗</span>
              </a>
            </div>
          </div>

          {/* Address Item */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-300 shadow-sm">
              <span className="text-lg">📍</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                ADDRESS
              </span>
              <p className="mt-0.5 font-semibold text-white leading-snug">
                {contactInfo.address.city}
                <br />
                <span className="text-slate-300 font-normal">
                  {contactInfo.address.state}, {contactInfo.address.country}
                </span>
              </p>
            </div>
          </div>

          {/* Website Item */}
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-950/80 border border-sky-800/60 text-sky-300 shadow-sm">
              <span className="text-lg">🌐</span>
            </div>
            <div className="min-w-0 flex-1">
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                WEBSITE
              </span>
              <a
                href={`https://${contactInfo.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-0.5 block truncate font-semibold text-white hover:text-brand-orange transition-colors"
              >
                {contactInfo.website}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="relative z-10 mt-8 border-t border-sky-900/60 pt-6">
        <span className="block text-xs font-mono font-bold uppercase tracking-widest text-sky-400">
          FOLLOW US
        </span>

        <div className="mt-3.5 flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* WhatsApp Icon Box */}
          <a
            href={contactInfo.social.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Connect via WhatsApp"
            className="group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-sky-950/80 border border-sky-800/60 text-emerald-400 shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 hover:-translate-y-0.5"
          >
            <span className="text-lg leading-none">💬</span>
          </a>

          {/* Facebook Icon Box */}
          <a
            href={contactInfo.social.facebook}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="AXION PackTech on Facebook"
            className="group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-sky-950/80 border border-sky-800/60 text-sky-300 shadow-sm transition-all duration-200 hover:bg-sky-600 hover:text-white hover:border-sky-500 hover:-translate-y-0.5"
          >
            <span className="text-xs sm:text-sm font-bold font-mono">FB</span>
          </a>

          {/* Instagram Icon Box */}
          <a
            href={contactInfo.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="AXION PackTech on Instagram"
            className="group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-sky-950/80 border border-sky-800/60 text-pink-400 shadow-sm transition-all duration-200 hover:bg-pink-600 hover:text-white hover:border-pink-500 hover:-translate-y-0.5"
          >
            <span className="text-xs sm:text-sm font-bold font-mono">IG</span>
          </a>

          {/* Email Direct Box */}
          <a
            href={contactInfo.social.email}
            aria-label="Send direct email"
            className="group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-sky-950/80 border border-sky-800/60 text-amber-400 shadow-sm transition-all duration-200 hover:bg-brand-orange hover:text-white hover:border-brand-orange hover:-translate-y-0.5"
          >
            <span className="text-lg leading-none">✉️</span>
          </a>
        </div>
      </div>
    </div>
  );
}
