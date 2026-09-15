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
      className={`relative w-full overflow-hidden bg-slate-50 border-t border-slate-200 ${className}`}
    >
      {/* Background Engineering Blueprint Pattern Accent */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#061527 1px, transparent 1px), linear-gradient(90deg, #061527 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        {/* Section Header (Centered) */}
        {showHeading && (
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 lg:mb-16">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-600/20 bg-sky-100/60 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-900 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-orange shadow-[0_0_6px_#ea580c]" />
              GET IN TOUCH
            </div>

            <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Let&apos;s Discuss Your Packaging Requirements
            </h2>

            <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-brand-orange shadow-[0_0_6px_#ea580c]" />

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Connect with our engineering team to discuss your packaging,
              processing, automation, and production requirements.
            </p>
          </div>
        )}

        {/* Balanced Two-Column Grid: [0.9fr_1.1fr] on Desktop, Stack on Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-6 sm:gap-8 lg:gap-10 items-stretch">
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
