"use client";

import { motion } from "framer-motion";

export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  space?: "defrag" | "covenant" | "alignment";
  featured?: boolean;
}

// Schema-ready testimonials array — populate as real testimonials come in
export const TESTIMONIALS: Testimonial[] = [
  // Placeholder structure — replace with real testimonials
  // {
  //   id: "t1",
  //   quote: "...",
  //   author: "...",
  //   role: "...",
  //   space: "defrag",
  //   featured: true,
  // },
];

interface TestimonialsGridProps {
  testimonials?: Testimonial[];
  className?: string;
}

export function TestimonialsGrid({
  testimonials = TESTIMONIALS,
  className = "",
}: TestimonialsGridProps) {
  if (testimonials.length === 0) return null;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {testimonials.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="border border-white/[0.07] bg-[#0c0a0d] p-6 flex flex-col gap-4"
          style={{ borderRadius: 14 }}
        >
          {t.space && (
            <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#e0743a]/60">
              {t.space}
            </span>
          )}
          <blockquote className="text-[14px] text-[#c8c2bc] leading-relaxed flex-1">
            &ldquo;{t.quote}&rdquo;
          </blockquote>
          <div className="pt-3 border-t border-white/[0.05]">
            <p className="text-[13px] text-[#f4efe9]">{t.author}</p>
            {t.role && (
              <p className="text-[11px] text-[#4f4b47] mt-0.5">{t.role}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface TestimonialsFeaturedProps {
  testimonial: Testimonial;
}

export function TestimonialFeatured({ testimonial }: TestimonialsFeaturedProps) {
  return (
    <div className="border border-white/[0.08] bg-[#0c0a0d] p-10 max-w-2xl mx-auto text-center" style={{ borderRadius: 14 }}>
      {testimonial.space && (
        <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-[#e0743a]/60 mb-6 block">
          {testimonial.space}
        </span>
      )}
      <blockquote
        className="font-serif text-[#f4efe9] leading-[1.2] tracking-[-0.01em] mb-6"
        style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)" }}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <p className="text-[13px] text-[#a8a29a]">{testimonial.author}</p>
      {testimonial.role && (
        <p className="text-[11px] text-[#4f4b47] mt-1">{testimonial.role}</p>
      )}
    </div>
  );
}

// JSON-LD schema for testimonials — inject into page head when populated
export function TestimonialsSchema({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: testimonials.map((t, i) => ({
      "@type": "Review",
      position: i + 1,
      reviewBody: t.quote,
      author: { "@type": "Person", name: t.author },
      itemReviewed: { "@type": "SoftwareApplication", name: "Sovereign.os" },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}