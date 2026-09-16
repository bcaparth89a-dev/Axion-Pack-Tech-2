import ContactInfoCard from "@/components/contact/ContactInfoCard";
import ContactForm from "@/components/contact/ContactForm";

interface ContactSectionProps {
  id?: string;
  className?: string;
  showHeading?: boolean;
}

export default function ContactSection({
  id = "contact",
  className = "",
  showHeading = true,
}: ContactSectionProps) {
  return (
    <section
      id={id}
      className={`relative w-full overflow-hidden bg-[#F8FAFC] border-t border-slate-200 ${className}`}
    >
      {/* Background Engineering Blueprint Pattern Accent */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-grid-blueprint-dark" />

      <div className="container-wide py-16 sm:py-20 lg:py-28 relative z-10">
        {/* Section Header */}
        {showHeading && (
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-50 px-3.5 py-1 text-xs font-mono font-bold tracking-widest text-[#0B192C] uppercase shadow-sm">
              <span className="h-2 w-2 rounded-full bg-brand-orange shadow-[0_0_6px_#ea580c]" />
              <span>DIRECT ENGINEERING HOTLINE &amp; INQUIRY</span>
            </div>

            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0B192C] leading-tight">
              Let&apos;s Discuss Your Packaging Project
            </h2>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-orange" />

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Connect directly with our application and project engineers to review machinery specifications,
              floorplan space limits, and turnkey line integrations.
            </p>
          </div>
        )}

        {/* Balanced Two-Column Grid: [0.9fr_1.1fr] on Desktop, Stack on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 sm:gap-8 lg:gap-12 items-stretch max-w-6xl mx-auto">
          {/* Left Column: Contact Information Panel */}
          <div className="flex flex-col">
            <ContactInfoCard />
          </div>

          {/* Right Column: Contact Message Form */}
          <div className="flex flex-col justify-center">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}
