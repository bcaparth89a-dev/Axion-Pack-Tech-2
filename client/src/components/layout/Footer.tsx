import Image from "next/image";
import Link from "next/link";
import { getContactInfo } from "@/lib/api/contact";
import { getNavigationCategories } from "@/lib/api/products";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us" },
  { name: "Products Directory", href: "/products" },
  { name: "Engineering Catalogs", href: "/catalogs" },
  { name: "Industries Served", href: "/industries" },
  { name: "Lifecycle Services", href: "/services" },
  { name: "Careers & Apprenticeships", href: "/careers" },
  { name: "Official News & Press", href: "/news" },
  { name: "Technical Blog", href: "/blog" },
  { name: "Contact & Plant Location", href: "/contact" },
];

export default async function Footer() {
  const [contactInfo, categories] = await Promise.all([
    getContactInfo(),
    getNavigationCategories(null).catch(() => []),
  ]);
  const activeCategories = (Array.isArray(categories) ? categories : []).slice(0, 6);

  return (
    <footer className="w-full bg-[#040911] text-white border-t border-slate-800/80">
      {/* Top subtle brand accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-sky-600 via-brand-orange to-sky-700 opacity-90" />

      {/* Main Footer Content - 94% Wide Viewport Container */}
      <div className="container-wide py-14 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Column 1: Company Profile (Col span 4) */}
          <div className="lg:col-span-4 space-y-5">
            <Link href="/" className="inline-block" aria-label="AXION PackTech Home">
              <div className="rounded-xl bg-white px-3.5 py-1.5 shadow-sm inline-block border border-slate-200">
                <Image
                  src="/logo.jpeg"
                  alt="AXION PackTech Logo"
                  width={150}
                  height={38}
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>

            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white">
                {contactInfo.companyName}
              </h2>
              <p className="text-xs font-mono uppercase tracking-wider text-sky-400 mt-1 font-semibold">
                {contactInfo.tagline}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md font-normal">
              AXION PackTech engineers high-speed automated bagging, secondary packaging, sanitary conveying,
              and turnkey plant handling systems designed for continuous, heavy-duty industrial manufacturing.
            </p>

            {/* Industrial Plant & Engineering Certifications */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                ISO 9001:2015
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                CE COMPLIANT
              </span>
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                FDA SANITARY SPEC
              </span>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mb-2.5">
                Direct Channels &amp; Network
              </span>
              <div className="flex items-center gap-2">
                {/* WhatsApp */}
                <a
                  href={contactInfo.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 hover:-translate-y-0.5"
                >
                  <span className="text-base leading-none">💬</span>
                </a>

                {/* Email */}
                <a
                  href={contactInfo.social.email}
                  aria-label="Email AXION PackTech"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-amber-400 shadow-sm transition-all duration-200 hover:bg-brand-orange hover:text-white hover:border-brand-orange hover:-translate-y-0.5"
                >
                  <span className="text-sm leading-none">✉️</span>
                </a>

                {/* Facebook */}
                <a
                  href={contactInfo.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-sky-300 shadow-sm transition-all duration-200 hover:bg-sky-600 hover:text-white hover:border-sky-500 hover:-translate-y-0.5 text-xs font-mono font-bold"
                >
                  FB
                </a>

                {/* Instagram */}
                <a
                  href={contactInfo.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-pink-400 shadow-sm transition-all duration-200 hover:bg-pink-600 hover:text-white hover:border-pink-500 hover:-translate-y-0.5 text-xs font-mono font-bold"
                >
                  IG
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation & Quick Links (Col span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase border-l-2 border-brand-orange pl-2.5">
              Quick Links
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {quickLinks.slice(0, 7).map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition-colors duration-200 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 group"
                  >
                    <span className="text-slate-600 text-xs transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-orange">
                      ›
                    </span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Machinery Divisions (Col span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase border-l-2 border-brand-orange pl-2.5">
              Machinery Divisions
            </h3>
            {activeCategories.length > 0 ? (
              <ul className="space-y-2 text-xs sm:text-sm">
                {activeCategories.map((cat) => (
                  <li key={cat._id || cat.slug}>
                    <Link
                      href={`/products/${cat.slug}`}
                      className="text-slate-400 transition-colors duration-200 hover:text-white hover:translate-x-1 inline-flex items-center gap-1.5 group"
                    >
                      <span className="text-slate-600 text-xs transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand-orange">
                        ›
                      </span>
                      <span>{cat.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-500 font-normal">
                Explore our automated packaging machinery and plant line integrations.
              </p>
            )}
            <div className="pt-2">
              <Link
                href="/catalogs"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors group"
              >
                <span>Download Engineering Datasheets</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Column 4: Plant Location & Engineering Hotline (Col span 3) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-xs font-mono font-bold tracking-widest text-sky-400 uppercase border-l-2 border-sky-400 pl-2.5">
              Plant Headquarters
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-base text-sky-400 shrink-0">📍</span>
                <span className="leading-relaxed">{contactInfo.address.display}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-base text-sky-400 shrink-0">📞</span>
                <div className="flex flex-col space-y-0.5">
                  {contactInfo.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="hover:text-brand-orange text-slate-300 font-semibold transition-colors"
                    >
                      {phone}
                    </a>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-base text-sky-400 shrink-0">✉️</span>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="hover:text-brand-orange text-slate-300 transition-colors break-all"
                >
                  {contactInfo.email}
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center w-full rounded-xl bg-brand-orange hover:bg-brand-orange-light text-white font-bold text-xs px-4 py-3 shadow-md transition-all active:scale-95"
              >
                <span>Request Quotation / Plant Visit</span>
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-14 border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            © 2026 AXION PackTech Private Limited. All Rights Reserved. Engineered for Industrial Excellence.
          </p>

          <p className="text-center sm:text-right flex items-center justify-center sm:justify-end flex-wrap">
            <span>Made with</span>
            <span
              className="inline-block text-red-500 mx-1.5 text-sm select-none"
              aria-label="love"
            >
              ❤️
            </span>
            <span>by</span>
            <a
              href="https://pronixdigital.tech/?utm_source=chatgpt.com"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1.5 font-bold text-brand-orange hover:text-amber-300 hover:underline underline-offset-4 transition-colors focus:outline-none focus:ring-1 focus:ring-brand-orange/40 rounded px-1"
            >
              Pronix Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
