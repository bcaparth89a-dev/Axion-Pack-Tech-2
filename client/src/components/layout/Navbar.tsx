"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import ProductsDropdown from "@/components/navigation/ProductsDropdown";
import IndustriesDropdown from "@/components/navigation/IndustriesDropdown";
import ServicesDropdown from "@/components/navigation/ServicesDropdown";
import NewsDropdown from "@/components/navigation/NewsDropdown";
import BlogDropdown from "@/components/navigation/BlogDropdown";

const MobileMenu = dynamic(() => import("@/components/navigation/MobileMenu"), {
  ssr: false,
});

interface NavItem {
  name: string;
  href: string;
  dropdownType?: "products" | "industries" | "services" | "news" | "blog";
}

const navItems: NavItem[] = [
  { name: "About Us", href: "/about-us" },
  { name: "Products", href: "/products", dropdownType: "products" },
  { name: "Industries", href: "/industries", dropdownType: "industries" },
  { name: "Services", href: "/services", dropdownType: "services" },
  { name: "Careers", href: "/careers" },
  { name: "News", href: "/news", dropdownType: "news" },
  { name: "Blog", href: "/blog", dropdownType: "blog" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hasOpenedMobileMenu, setHasOpenedMobileMenu] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"products" | "industries" | "services" | "news" | "blog" | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      // Toggle compact sticky state when scrolled past initial hero threshold
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDropdownMouseEnter = (type: "products" | "industries" | "services" | "news" | "blog") => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveDropdown(type);
  };

  const handleDropdownMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  return (
    <>
      {/* Mobile & Tablet Navbar Header (Visible on screens < lg) */}
      <header className="lg:hidden sticky top-0 z-40 w-full bg-[#061527]/95 backdrop-blur-md border-b border-sky-900/50 shadow-md">
        <div className="flex h-14 sm:h-16 items-center justify-between px-3.5 sm:px-6 max-w-7xl mx-auto">
          {/* Official Logo (Vertically centered, compact) */}
          <Link
            href="/"
            onClick={() => setActiveItem("")}
            className="flex items-center transition-transform duration-200 active:scale-95"
            aria-label="AXION PackTech Home"
          >
            <div className="rounded-lg bg-white px-2.5 py-1 shadow-sm border border-slate-100 flex items-center justify-center">
              <Image
                src="/logo.jpeg"
                alt="AXION PackTech"
                width={110}
                height={26}
                priority
                className="h-6 sm:h-7 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Right Action Group */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Contact CTA for Tablet/Large Mobile */}
            <Link
              href="/contact"
              onClick={() => setActiveItem("Contact Us")}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-sky-600/20 border border-sky-400/30 text-sky-200 px-3 py-1.5 text-xs font-bold transition-all hover:bg-brand-orange hover:text-white hover:border-brand-orange active:scale-95"
            >
              <span>Contact</span>
              <span className="text-xs">→</span>
            </Link>

            {/* Industrial Hamburger Button */}
            <button
              onClick={() => {
                setHasOpenedMobileMenu(true);
                setIsMobileMenuOpen(true);
              }}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg border border-sky-500/30 bg-[#0B1E36] text-slate-200 shadow-sm transition-all duration-200 hover:bg-sky-900/60 hover:text-white hover:border-sky-400 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            >
              <div className="flex flex-col items-center justify-center gap-1">
                <span className="h-0.5 w-[18px] rounded-full bg-slate-200 transition-colors" />
                <span className="h-0.5 w-3.5 rounded-full bg-brand-orange transition-colors" />
                <span className="h-0.5 w-[18px] rounded-full bg-slate-200 transition-colors" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Floating to Sticky Navbar (Visible on lg and larger screens) */}
      <div className="hidden lg:block sticky top-3 z-40 w-full px-6 transition-all duration-300">
        <nav
          className={`relative mx-auto max-w-6xl transition-all duration-300 ease-in-out ${
            isScrolled
              ? "rounded-xl bg-[#061527]/95 py-2.5 px-6 shadow-[0_12px_32px_-6px_rgba(0,0,0,0.6),0_0_20px_rgba(2,132,199,0.2)] border border-sky-500/30 backdrop-blur-md"
              : "rounded-2xl bg-[#0B1E36]/90 py-3.5 px-8 shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4),0_0_24px_rgba(2,132,199,0.12)] border border-white/15 backdrop-blur-md"
          }`}
          aria-label="Main Navigation"
        >
          <div className="flex items-center justify-between">
            {/* Left: Official AXION PackTech Logo (Acts as Home Button) */}
            <Link
              href="/"
              onClick={() => {
                setActiveItem("");
                setActiveDropdown(null);
              }}
              className="group flex items-center transition-transform duration-200 hover:scale-[1.02]"
              aria-label="AXION PackTech Home"
            >
              <div className="rounded-xl bg-white px-3 py-1.5 shadow-sm border border-slate-100/50">
                <Image
                  src="/logo.jpeg"
                  alt="AXION PackTech"
                  width={140}
                  height={38}
                  priority
                  className="h-8 w-auto object-contain"
                />
              </div>
            </Link>

            {/* Center/Right: Navigation Links */}
            <ul className="flex items-center space-x-1 xl:space-x-2">
              {navItems.map((item) => {
                const isActive =
                  activeItem === item.name ||
                  (pathname !== "/" && pathname.startsWith(item.href));
                const isDropdownOpen = activeDropdown === item.dropdownType;

                if (item.dropdownType) {
                  return (
                    <li
                      key={item.name}
                      onMouseEnter={() => handleDropdownMouseEnter(item.dropdownType!)}
                      onMouseLeave={handleDropdownMouseLeave}
                      className="relative"
                    >
                      <Link
                        href={item.href}
                        onClick={() => {
                          setActiveItem(item.name);
                        }}
                        className={`relative inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium tracking-wide transition-colors duration-200 rounded-lg ${
                          isActive || isDropdownOpen
                            ? "text-white font-semibold bg-white/10"
                            : "text-slate-200 hover:text-sky-300 hover:bg-white/5"
                        }`}
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="true"
                      >
                        <span>{item.name}</span>
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            isDropdownOpen
                              ? "rotate-180 text-brand-orange"
                              : "text-slate-400"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>

                        {/* Active Indicator */}
                        {(isActive || isDropdownOpen) && (
                          <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                        )}
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        setActiveItem(item.name);
                        setActiveDropdown(null);
                      }}
                      className={`relative px-3.5 py-2 text-sm font-medium tracking-wide transition-colors duration-200 rounded-lg ${
                        isActive
                          ? "text-white font-semibold"
                          : "text-slate-200 hover:text-sky-300 hover:bg-white/5"
                      }`}
                    >
                      <span>{item.name}</span>

                      {/* Active Indicator */}
                      {isActive && (
                        <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-brand-orange shadow-[0_0_8px_#ea580c]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right: Contact Us CTA Link */}
            <div className="flex items-center">
              <Link
                href="/contact"
                onClick={() => {
                  setActiveItem("Contact Us");
                  setActiveDropdown(null);
                }}
                className={`relative inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200 ${
                  activeItem === "Contact Us" || pathname === "/contact"
                    ? "bg-brand-orange text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]"
                    : "bg-sky-600/20 text-sky-200 border border-sky-400/30 hover:bg-brand-orange hover:text-white hover:border-brand-orange hover:shadow-[0_0_15px_rgba(234,88,12,0.3)] active:scale-95"
                }`}
              >
                <span>Contact Us</span>
                <span className="text-xs transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Desktop Mega Menu: Products */}
          {activeDropdown === "products" && (
            <ProductsDropdown
              isOpen={true}
              onClose={() => setActiveDropdown(null)}
              onMouseEnter={() => handleDropdownMouseEnter("products")}
              onMouseLeave={handleDropdownMouseLeave}
            />
          )}

          {/* Desktop Mega Menu: Industries */}
          {activeDropdown === "industries" && (
            <IndustriesDropdown
              isOpen={true}
              onClose={() => setActiveDropdown(null)}
              onMouseEnter={() => handleDropdownMouseEnter("industries")}
              onMouseLeave={handleDropdownMouseLeave}
            />
          )}

          {/* Desktop Mega Menu: Services */}
          {activeDropdown === "services" && (
            <ServicesDropdown
              isOpen={true}
              onClose={() => setActiveDropdown(null)}
              onMouseEnter={() => handleDropdownMouseEnter("services")}
              onMouseLeave={handleDropdownMouseLeave}
            />
          )}

          {/* Desktop Mega Menu: News */}
          {activeDropdown === "news" && (
            <NewsDropdown
              isOpen={true}
              onClose={() => setActiveDropdown(null)}
              onMouseEnter={() => handleDropdownMouseEnter("news")}
              onMouseLeave={handleDropdownMouseLeave}
            />
          )}

          {/* Desktop Mega Menu: Blog */}
          {activeDropdown === "blog" && (
            <BlogDropdown
              isOpen={true}
              onClose={() => setActiveDropdown(null)}
              onMouseEnter={() => handleDropdownMouseEnter("blog")}
              onMouseLeave={handleDropdownMouseLeave}
            />
          )}
        </nav>
      </div>

      {/* Right-Side Slide Mobile Drawer */}
      {hasOpenedMobileMenu && (
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          activeItem={activeItem}
        />
      )}
    </>
  );
}
