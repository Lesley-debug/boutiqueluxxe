import { Link } from "@inertiajs/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { PrimaryButton, SecondaryButton } from "./ui";

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
        const timer = setInterval(
            () => setIndex((i) => (i + 1) % slides.length),
            6000,
        );
        return () => clearInterval(timer);
    }, [slides.length]);

    if (slides.length === 0) return null;

    const slide = slides[index];

    function prev() {
        setIndex((i) => (i - 1 + slides.length) % slides.length);
    }
    function next() {
        setIndex((i) => (i + 1) % slides.length);
    }

    return (
        <section className="relative flex h-[85vh] min-h-[560px] items-end justify-center overflow-hidden bg-[#171310] px-6 pb-16 sm:h-screen sm:min-h-0 sm:items-center sm:pb-0">
            {slide.image_url && (
                <>
                    <img
                        key={slide.id}
                        src={slide.image_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#171310] via-[#171310]/50 to-[#171310]/10 sm:bg-gradient-to-r sm:from-[#171310]/70 sm:via-[#171310]/20 sm:to-transparent" />
                </>
            )}

            <div className="relative text-center">
                {slide.eyebrow && (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9C7A3C] sm:text-[11px] sm:tracking-[0.35em]">
                        {slide.eyebrow}
                    </p>
                )}
                <h1 className="mt-4 font-serif text-4xl font-medium leading-[1] tracking-tight text-white sm:mt-6 sm:text-6xl md:text-8xl">
                    {slide.title}
                </h1>
                {slide.subtitle && (
                    <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-white/80 sm:mt-8 sm:max-w-lg sm:text-base md:text-lg">
                        {slide.subtitle}
                    </p>
                )}
                <div className="mt-8 flex flex-col justify-center gap-3 sm:mt-12 sm:flex-row sm:gap-4">
                    {slide.primary_cta_text && (
                        <PrimaryButton
                            href={slide.primary_cta_url || "/shop"}
                            className="!px-7 !py-3.5 !text-[10px] sm:!px-10 sm:!py-4 sm:!text-[11px]"
                        >
                            {slide.primary_cta_text}
                        </PrimaryButton>
                    )}
                    {slide.secondary_cta_text && (
                        <SecondaryButton
                            href={slide.secondary_cta_url || "/shop"}
                            light
                            className="!px-7 !py-3.5 !text-[10px] sm:!px-10 sm:!py-4 sm:!text-[11px]"
                        >
                            {slide.secondary_cta_text}
                        </SecondaryButton>
                    )}
                </div>
            </div>

            {slides.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-[#171310] shadow-md transition hover:bg-white sm:left-8"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-2 text-[#171310] shadow-md transition hover:bg-white sm:right-8"
                    >
                        <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
                        {slides.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => setIndex(i)}
                                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-[#9C7A3C]" : "w-1.5 bg-white/30"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
