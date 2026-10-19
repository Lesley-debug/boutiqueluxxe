import { Link } from "@inertiajs/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";
import { useEffect, useState } from "react";
interface Slide {
  id: number;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  primary_cta_text: string | null;
  primary_cta_url: string | null;
  secondary_cta_text?: string | null;
  secondary_cta_url?: string | null;
  image_url: string | null;
}
export default function HeroCarousel({
  slides,
  variant = "desktop",
}: {
  slides: Slide[];
  variant?: "desktop" | "mobile";
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const viewport = window.matchMedia("(min-width: 64rem)");
    let timer: ReturnType<typeof window.setInterval> | undefined;
    const sync = () => {
      if (timer !== undefined) window.clearInterval(timer);
      timer = undefined;
      if (
        !preference.matches &&
        !document.hidden &&
        viewport.matches === (variant === "desktop")
      )
        timer = window.setInterval(
          () => setIndex((value) => (value + 1) % slides.length),
          7000,
        );
    };
    sync();
    preference.addEventListener("change", sync);
    viewport.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      if (timer !== undefined) window.clearInterval(timer);
      preference.removeEventListener("change", sync);
      viewport.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [slides.length, paused, variant]);
  if (!slides.length) return null;
  const selected = index % slides.length;
  const slide = slides[selected];
  const choose = (next: number) => {
    setIndex((next + slides.length) % slides.length);
    setPaused(true);
  };
  return (
    <section className="border-b border-[#181512]/10 bg-[#F4EFE7]">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-6 py-8 lg:grid-cols-[.95fr_1.05fr] lg:gap-12 lg:px-10 lg:py-10">
        <div className="min-w-0 py-4 lg:py-6">
          {slide.eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[.28em] text-[#805E2D]">
              {slide.eyebrow}
            </p>
          )}
          <h1 className="mt-4 max-w-xl break-words font-serif text-[clamp(1.9rem,4.3vw,4.3rem)] font-medium leading-[1.04] tracking-[-.035em] text-[#181512]">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="mt-5 max-w-md text-base leading-7 text-[#514C46]">
              {slide.subtitle}
            </p>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            {slide.primary_cta_text && (
              <Link
                href={slide.primary_cta_url || "/shop"}
                className="inline-flex min-h-11 items-center gap-3 rounded-full bg-[#181512] px-6 py-3 text-[11px] font-semibold uppercase tracking-[.15em] text-white hover:bg-[#805E2D]"
              >
                {slide.primary_cta_text}
                <ArrowRight size={16} />
              </Link>
            )}
            {slide.secondary_cta_text && (
              <Link
                href={slide.secondary_cta_url || "/shop"}
                className="inline-flex min-h-11 items-center rounded-full border border-[#181512]/25 px-6 py-3 text-[11px] font-semibold uppercase tracking-[.15em] text-[#181512]"
              >
                {slide.secondary_cta_text}
              </Link>
            )}
          </div>
          {slides.length > 1 && (
            <div
              className="mt-7 flex flex-wrap items-center gap-2"
              aria-label="Campaign controls"
            >
              <button
                type="button"
                onClick={() => choose(selected - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#181512]/20"
                aria-label="Previous campaign"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="px-2 text-xs tabular-nums text-[#514C46]">
                {selected + 1} / {slides.length}
              </span>
              <button
                type="button"
                onClick={() => choose(selected + 1)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#181512]/20"
                aria-label="Next campaign"
              >
                <ChevronRight size={18} />
              </button>
              <button
                type="button"
                onClick={() => setPaused((value) => !value)}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#181512]/20"
                aria-label={
                  paused
                    ? "Resume automatic campaigns"
                    : "Pause automatic campaigns"
                }
              >
                {paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
            </div>
          )}
        </div>
        <div className="order-first flex min-h-48 min-w-0 items-center justify-center rounded-2xl bg-[#E8E1D7] p-6 lg:order-last lg:min-h-[420px]">
          {slide.image_url ? (
            <img
              key={slide.id}
              src={slide.image_url}
              alt=""
              decoding="async"
              className="h-auto max-h-[220px] lg:max-h-[380px] w-auto max-w-full object-contain"
            />
          ) : (
            <div className="p-12 text-center font-serif text-2xl text-[#514C46]">
              Boutique Luxxe
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
