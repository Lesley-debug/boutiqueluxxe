import { Link } from "@inertiajs/react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface Slide {
  id: number;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  primary_cta_text: string | null;
  primary_cta_url: string | null;
  secondary_cta_text: string | null;
  secondary_cta_url: string | null;
  image_url: string | null;
}

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % slides.length),
      7000,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[index];

  return (
    <section className="relative grid min-h-[610px] overflow-hidden bg-[#181512] lg:h-[calc(100vh-118px)] lg:max-h-[760px] lg:grid-cols-[42%_58%]">
      <div className="relative z-10 flex flex-col justify-center bg-[#F4EFE7] px-12 py-16 xl:px-20 2xl:px-24">
        <div className="max-w-xl">
          {slide.eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#9B7435]">
              {slide.eyebrow}
            </p>
          )}
          <h1 className="mt-5 font-serif text-[clamp(3.25rem,5vw,5.8rem)] font-medium leading-[0.97] tracking-[-0.045em] text-[#181512]">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-7 max-w-md text-base leading-7 text-[#514C46]">
              {slide.subtitle}
            </p>
          )}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            {slide.primary_cta_text && (
              <Link
                href={slide.primary_cta_url || "/shop"}
                className="inline-flex items-center gap-3 rounded-full bg-[#181512] px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#9B7435]"
              >
                {slide.primary_cta_text} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {slide.secondary_cta_text && (
              <Link
                href={slide.secondary_cta_url || "/shop"}
                className="inline-flex items-center rounded-full border border-[#181512]/20 px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#181512] transition hover:border-[#9B7435] hover:text-[#9B7435]"
              >
                {slide.secondary_cta_text}
              </Link>
            )}
          </div>
        </div>
        {slides.length > 1 && (
          <div className="mt-14 flex items-center gap-4">
            <button
              onClick={() =>
                setIndex((value) => (value - 1 + slides.length) % slides.length)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#181512]/15 transition hover:border-[#9B7435] hover:text-[#9B7435]"
              aria-label="Previous campaign"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {slides.map((item, itemIndex) => (
                <button
                  key={item.id}
                  onClick={() => setIndex(itemIndex)}
                  className={`h-1.5 rounded-full transition-all ${itemIndex === index ? "w-8 bg-[#9B7435]" : "w-2 bg-[#181512]/15"}`}
                  aria-label={`Show campaign ${itemIndex + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setIndex((value) => (value + 1) % slides.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#181512]/15 transition hover:border-[#9B7435] hover:text-[#9B7435]"
              aria-label="Next campaign"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      <div className="relative min-h-[610px] overflow-hidden bg-[#D8CFC1]">
        {slide.image_url ? (
          <img
            key={slide.id}
            src={slide.image_url}
            alt=""
            className="h-full w-full object-cover transition duration-700"
          />
        ) : (
          <div className="h-full w-full bg-[radial-gradient(circle_at_60%_40%,#6f5b48,#181512_72%)]" />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#181512]/10 via-transparent to-transparent" />
        <div className="absolute bottom-7 right-8 rounded-full border border-white/30 bg-[#181512]/35 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
          Boutique Luxxe · Curated Luxury
        </div>
      </div>
    </section>
  );
}
