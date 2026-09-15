import Image from "next/image";
import Link from "next/link";
import { getContactInfo } from "@/lib/api/contact";
import { getNavigationCategories } from "@/lib/api/products";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us" },
  { name: "Products", href: "/products" },
  { name: "Industries", href: "/industries" },
  { name: "Services", href: "/services" },
  { name: "News & Updates", href: "/news" },
  { name: "Careers", href: "/careers" },
  { name: "Blog & Insights", href: "/blog" },
  { name: "Contact Us", href: "/contact" },
];

export default async function Footer() {
  const [contactInfo, categories] = await Promise.all([
    getContactInfo(),
    getNavigationCategories(null).catch(() => []),
  ]);
  const activeCategories = (Array.isArray(categories) ? categories : []).slice(0, 5);
  return (
    <footer className="w-full bg-[#061527] text-white border-t border-sky-900/40">
      {/* Top subtle brand accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-sky-600 via-brand-orange to-sky-700 opacity-80" />

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1: Company Information */}
          <div className="space-y-4">
            <Link href="/" className="inline-block" aria-label="AXION PackTech Home">
              <div className="rounded-xl bg-white px-3.5 py-1.5 shadow-sm inline-block border border-white/20">
                <Image
                  src="/logo.jpeg"
                  alt="AXION PackTech Logo"
                  width={140}
                  height={36}
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>

            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white">
                {contactInfo.companyName}
              </h2>
              <p className="text-xs font-semibold text-sky-400 mt-0.5">
                {contactInfo.tagline}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              Delivering reliable packaging, processing, automation, and engineering
              solutions designed to improve industrial productivity and performance.
            </p>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Follow Us
              </span>
              <div className="flex items-center gap-2.5">
                {/* WhatsApp */}
                <a
                  href={contactInfo.social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat with AXION PackTech on WhatsApp"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-950/80 border border-sky-800/60 text-emerald-400 shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 hover:-translate-y-0.5"
                >
                  <span className="text-base leading-none">💬</span>
                </a>

                {/* Facebook */}
                <a
                  href={contactInfo.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AXION PackTech on Facebook"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-950/80 border border-sky-800/60 text-sky-300 shadow-sm transition-all duration-200 hover:bg-sky-600 hover:text-white hover:border-sky-500 hover:-translate-y-0.5"
                >
                  <span className="text-xs font-bold font-mono">FB</span>
                </a>

                {/* Instagram */}
                <a
                  href={contactInfo.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="AXION PackTech on Instagram"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-950/80 border border-sky-800/60 text-pink-400 shadow-sm transition-all duration-200 hover:bg-pink-600 hover:text-white hover:border-pink-500 hover:-translate-y-0.5"
                >
                  <span className="text-xs font-bold font-mono">IG</span>
                </a>

                {/* Email */}
                <a
                  href={contactInfo.social.email}
                  aria-label="Email AXION PackTech"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-950/80 border border-sky-800/60 text-amber-400 shadow-sm transition-all duration-200 hover:bg-brand-orange hover:text-white hover:border-brand-orange hover:-translate-y-0.5"
                >
                  <span className="text-sm leading-none">✉️</span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase border-l-2 border-brand-orange pl-2.5">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-300 transition-colors duration-200 hover:text-sky-300 hover:translate-x-1 inline-flex items-center gap-1.5 group"
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

          {/* Column 3: Products Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase border-l-2 border-brand-orange pl-2.5">
              Products
            </h3>
            {activeCategories.length > 0 ? (
              <ul className="space-y-2.5 text-xs sm:text-sm">
                {activeCategories.map((cat) => (
                  <li key={cat._id || cat.slug}>
                    <Link
                      href={`/products/${cat.slug}`}
                      className="text-slate-300 transition-colors duration-200 hover:text-sky-300 hover:translate-x-1 inline-flex items-center gap-1.5 group"
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
              <p className="text-xs text-slate-400">
                Explore our engineered machinery catalog and automated solutions.
              </p>
            )}
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-white transition-colors group"
              >
                <span>View Full Catalog</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Column 4: Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-wider text-white uppercase border-l-2 border-sky-400 pl-2.5">
              Contact Information
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-base text-sky-400 shrink-0">📍</span>
                <span>{contactInfo.address.display}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-0.5 text-base text-sky-400 shrink-0">📞</span>
                <div className="flex flex-col space-y-0.5">
                  {contactInfo.phones.map((phone) => (
                    <a
                      key={phone}
                      href={`tel:${phone.replace(/\s+/g, "")}`}
                      className="hover:text-brand-orange transition-colors"
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
                  className="hover:text-brand-orange transition-colors break-all"
                >
                  {contactInfo.email}
                </a>
              </li>
            </ul>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:text-amber-300 transition-colors group"
              >
                <span>Contact Our Engineering Team</span>
                <span className="transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="mt-12 border-t border-sky-900/40 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="text-center sm:text-left">
            © 2026 AXION PackTech. All Rights Reserved.
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
