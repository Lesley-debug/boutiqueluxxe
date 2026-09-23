import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import StoreLayout from "@/components/Store/StoreLayout";
import ProductCard from "@/components/Store/ProductCard";
import Reveal from "@/components/Store/Reveal";
import NewsletterSection from "@/components/Store/NewsletterSection";
import HeroCarousel from "@/components/Store/HeroCarousel";
import MobileCategoryShortcuts from "@/components/Store/MobileCategoryShortcuts";
import MobileHomeFeed from "@/components/Store/MobileHomeFeed";
import {
    Container,
    Eyebrow,
    SectionHeading,
    PrimaryButton,
    SecondaryButton,
    TextLink,
} from "@/components/Store/ui";

interface CategoryCard {
    id: number;
    name: string;
    slug: string;
    image: string | null;
}
interface ProductCardType {
    id: number;
    name: string;
    slug: string;
    base_price: string;
    sale_price: string | null;
    new_arrival: boolean;
    images: { url: string }[];
}
interface HomepageContent {
    editorial_title: string | null;
    editorial_subtitle: string | null;
    editorial_cta_text: string | null;
    editorial_cta_url: string | null;
    editorial_image_url: string | null;
    editorial_video_url: string | null;
    watches_title: string | null;
    watches_subtitle: string | null;
    watches_cta_text: string | null;
    watches_cta_url: string | null;
    watches_image_url: string | null;
    watches_video_url: string | null;
    story_title: string | null;
    story_text: string | null;
    story_cta_text: string | null;
    story_image_url: string | null;
}
interface StyleCard {
    id: number;
    name: string;
    slug: string;
    image_url: string | null;
}
interface TestimonialItem {
    id: number;
    customer_name: string;
    quote: string;
    rating: number;
}
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

interface HomeProps {
    heroSlides: Slide[];
    categories: CategoryCard[];
    featuredProducts: ProductCardType[];
    newArrivals: ProductCardType[];
    content: HomepageContent;
    styles: StyleCard[];
    testimonials: TestimonialItem[];
}

// ─── Testimonials Carousel ────────────────────────────────────────────────────

function TestimonialsCarousel({
    testimonials,
}: {
    testimonials: { id: number; customer_name: string; quote: string; rating: number }[];
}) {
    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    function prev() {
        setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
    }

    function next() {
        setIndex((i) => (i + 1) % testimonials.length);
    }

    function resetTimer() {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % testimonials.length);
        }, 4000);
    }

    useEffect(() => {
        if (testimonials.length <= 1) return;
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % testimonials.length);
        }, 4000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [testimonials.length]);

    const t = testimonials[index];

    return (
        <div className="mx-auto max-w-3xl">
            {/* Card */}
            <div
                key={t.id}
                className="relative rounded-[2px] border border-[#171310]/10 bg-white p-10 text-center shadow-[0_20px_60px_-20px_rgba(23,19,16,0.10)] transition-all duration-500"
            >
                {/* Decorative quote mark */}
                <div className="absolute left-8 top-6 font-serif text-6xl leading-none text-[#9C7A3C]/15 select-none">
                    "
                </div>

                {/* Stars */}
                <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                            key={s}
                            className={`h-4 w-4 ${s <= t.rating ? "text-[#9C7A3C]" : "text-[#171310]/10"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>

                {/* Quote */}
                <p className="mx-auto mt-6 max-w-xl font-serif text-xl italic leading-relaxed text-[#171310]">
                    "{t.quote}"
                </p>

                {/* Attribution */}
                <div className="mt-8 flex items-center justify-center gap-3">
                    <div className="h-px w-12 bg-[#171310]/10" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#252525]/50">
                        {t.customer_name}
                    </p>
                    <div className="h-px w-12 bg-[#171310]/10" />
                </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex items-center justify-center gap-6">
                <button
                    onClick={() => { prev(); resetTimer(); }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#171310]/15 bg-white text-[#171310] shadow-sm transition hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                    aria-label="Previous"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Dots */}
                <div className="flex gap-2">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setIndex(i); resetTimer(); }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === index ? "w-6 bg-[#9C7A3C]" : "w-1.5 bg-[#171310]/15"
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => { next(); resetTimer(); }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#171310]/15 bg-white text-[#171310] shadow-sm transition hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                    aria-label="Next"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Home({
    heroSlides,
    categories,
    featuredProducts,
    newArrivals,
    content,
    styles,
    testimonials,
}: HomeProps) {
    const { welcomeBack, auth } = usePage().props;
    const [showWelcome, setShowWelcome] = useState(!!welcomeBack);

    return (
        <StoreLayout noPadding>
            <Head title="Home" />

            {/* ── Mobile feed (lg and above sees nothing here) ── */}
            <div className="lg:hidden">
                <MobileHomeFeed
                    heroSlides={heroSlides}
                    featuredProducts={featuredProducts}
                    newArrivals={newArrivals}
                    categories={categories}
                    testimonials={testimonials}
                    content={content}
                />
            </div>

            {/* ── Desktop layout (hidden on mobile) ── */}
            <main className="hidden lg:block">
                {showWelcome && auth.user && (
                    <div className="bg-[#171310] px-6 py-3 text-center text-sm text-white">
                        Welcome back, {auth.user.name.split(' ')[0]} — don&apos;t forget to visit{' '}
                        <a href="/account" className="underline decoration-[#9C7A3C]">
                            your dashboard
                        </a>.
                        <button
                            onClick={() => setShowWelcome(false)}
                            className="ml-4 text-white/60 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>
                )}
                {/* Hero Carousel */}
                <HeroCarousel slides={heroSlides} />

                <MobileCategoryShortcuts />

                {/* Category Discovery — refined layout */}
                {categories.length > 0 && (
                    <section className="bg-[#F8F5EF] py-16 sm:py-20 lg:py-28">
                        <Container>
                            <Reveal>
                                <div className="mb-20 text-center">
                                    <Eyebrow>Discover</Eyebrow>
                                    <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-[#171310] md:text-5xl">
                                        Explore the Collection
                                    </h2>
                                    <p className="mx-auto mt-6 max-w-2xl text-base text-[#252525]/70">
                                        Carefully selected pieces designed to complement every expression of style.
                                    </p>
                                </div>
                            </Reveal>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {categories.map((category, i) => (
                                    <Reveal key={category.id} delay={i * 80}>
                                        <a
                                            href={`/shop?category=${category.slug}`}
                                            className="group relative block aspect-[4/5] overflow-hidden rounded-[2px] bg-[#171310]/[0.04] transition-all duration-500 hover:shadow-[0_30px_60px_-30px_rgba(23,19,16,0.35)]"
                                        >
                                            {category.image && (
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#171310]/75 via-[#171310]/10 to-transparent" />
                                            <div className="absolute bottom-10 left-10 right-10">
                                                <p className="font-serif text-2xl tracking-tight text-white">
                                                    {category.name}
                                                </p>
                                                <div className="mt-4 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white/80 transition-colors group-hover:text-[#9C7A3C]">
                                                    <span>Explore</span>
                                                    <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </a>
                                    </Reveal>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                {/* The Edit — white background for contrast */}
                {featuredProducts.length > 0 && (
                    <section className="bg-white py-16 sm:py-20 lg:py-28">
                        <Container>
                            <Reveal>
                                <div className="mb-20 text-center">
                                    <Eyebrow>Curated</Eyebrow>
                                    <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-[#171310] md:text-5xl">
                                        The Edit
                                    </h2>
                                    <p className="mx-auto mt-6 max-w-2xl text-base text-[#252525]/70">
                                        Pieces selected for their character, versatility, and timeless appeal.
                                    </p>
                                </div>
                            </Reveal>
                            <div className="scrollbar-hide -mx-6 flex gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-8">
                                {featuredProducts.map((product, i) => (
                                    <div key={product.id} className="w-[46%] flex-shrink-0 sm:w-auto">
                                        <Reveal delay={i * 60}>
                                            <ProductCard product={product} />
                                        </Reveal>
                                    </div>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                {/* Editorial Campaign — video or image, full bleed */}
                {(content.editorial_video_url ||
                    content.editorial_image_url) && (
                    <section className="relative h-[75vh] w-full overflow-hidden">
                        {content.editorial_video_url ? (
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                poster={
                                    content.editorial_image_url ?? undefined
                                }
                                className="h-full w-full object-cover"
                            >
                                <source src={content.editorial_video_url} />
                            </video>
                        ) : (
                            <img
                                src={content.editorial_image_url!}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#171310]/35 px-6 text-center">
                            <Reveal>
                                {content.editorial_title && (
                                    <h2 className="font-serif text-4xl font-medium text-white md:text-6xl">
                                        {content.editorial_title}
                                    </h2>
                                )}
                                {content.editorial_subtitle && (
                                    <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-white/85">
                                        {content.editorial_subtitle}
                                    </p>
                                )}
                                {content.editorial_cta_text && (
                                    <div className="mt-10">
                                        <SecondaryButton
                                            href={
                                                content.editorial_cta_url ||
                                                "/shop"
                                            }
                                            light
                                        >
                                            {content.editorial_cta_text}
                                        </SecondaryButton>
                                    </div>
                                )}
                            </Reveal>
                        </div>
                    </section>
                )}

                {/* New Arrivals — cream with premium carousel treatment */}
                {newArrivals.length > 0 && (
                    <section className="relative overflow-hidden bg-[#F8F5EF] py-16 sm:py-20 lg:py-28">
                        <Container>
                            <div className="mb-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
                                <Reveal>
                                    <div>
                                        <Eyebrow>Just In</Eyebrow>
                                        <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-[#171310] md:text-5xl">
                                            New Arrivals
                                        </h2>
                                        <p className="mt-4 max-w-lg text-sm text-[#252525]/60">
                                            The latest additions to our curated collection
                                        </p>
                                    </div>
                                </Reveal>
                                <Reveal delay={100}>
                                    <TextLink href="/shop?sort=newest">
                                        View All Arrivals
                                    </TextLink>
                                </Reveal>
                            </div>
                            
                            <div className="scrollbar-hide -mx-6 flex gap-4 overflow-x-auto px-6 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4 lg:gap-8">
                                {newArrivals.map((product, i) => (
                                    <div key={product.id} className="w-[46%] flex-shrink-0 sm:w-auto">
                                        <Reveal delay={i * 60}>
                                            <ProductCard product={product} />
                                        </Reveal>
                                    </div>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                {/* Shop by Style — white */}
                {styles.length > 0 && (
                    <section className="bg-white py-16 sm:py-20 lg:py-28">
                        <Container>
                            <Reveal>
                                <SectionHeading
                                    eyebrow="Inspiration"
                                    title="Shop by Style"
                                />
                            </Reveal>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                                {styles.map((style, i) => (
                                    <Reveal key={style.id} delay={i * 80}>
                                        <a
                                            href={`/shop?style=${style.slug}`}
                                            className="group relative block aspect-[4/5] overflow-hidden rounded-[2px] bg-[#171310]/[0.04] transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(23,19,16,0.35)]"
                                        >
                                            {style.image_url && (
                                                <img
                                                    src={style.image_url}
                                                    alt={style.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#171310]/70 via-transparent to-transparent" />
                                            <div className="absolute bottom-8 left-8 text-white">
                                                <p className="font-serif text-2xl tracking-tight">
                                                    {style.name}
                                                </p>
                                                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">
                                                    Explore →
                                                </p>
                                            </div>
                                        </a>
                                    </Reveal>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                {/* Watches Campaign */}
                {(content.watches_video_url || content.watches_image_url) && (
                    <section className="relative h-[65vh] w-full overflow-hidden">
                        {content.watches_video_url ? (
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                poster={content.watches_image_url ?? undefined}
                                className="h-full w-full object-cover"
                            >
                                <source src={content.watches_video_url} />
                            </video>
                        ) : (
                            <img
                                src={content.watches_image_url!}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#171310]/40 px-6 text-center">
                            <Reveal>
                                {content.watches_title && (
                                    <h2 className="font-serif text-4xl font-medium text-white md:text-5xl">
                                        {content.watches_title}
                                    </h2>
                                )}
                                {content.watches_subtitle && (
                                    <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-white/85">
                                        {content.watches_subtitle}
                                    </p>
                                )}
                                {content.watches_cta_text && (
                                    <div className="mt-9">
                                        <PrimaryButton
                                            href={
                                                content.watches_cta_url ||
                                                "/shop"
                                            }
                                        >
                                            {content.watches_cta_text}
                                        </PrimaryButton>
                                    </div>
                                )}
                            </Reveal>
                        </div>
                    </section>
                )}

                {/* Brand Story — white */}
                {content.story_image_url && (
                    <section className="bg-white py-16 sm:py-20 lg:py-28">
                        <Container>
                            <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
                                <Reveal>
                                    <div className="aspect-[4/5] overflow-hidden rounded-[2px]">
                                        <img
                                            src={content.story_image_url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </Reveal>
                                <Reveal delay={150}>
                                    {content.story_title && (
                                        <h2 className="font-serif text-4xl font-medium tracking-tight text-[#171310] md:text-5xl">
                                            {content.story_title}
                                        </h2>
                                    )}
                                    {content.story_text && (
                                        <p className="mt-6 text-base leading-relaxed text-[#252525]/70">
                                            {content.story_text}
                                        </p>
                                    )}
                                    {content.story_cta_text && (
                                        <div className="mt-8">
                                            <TextLink href="/about">
                                                {content.story_cta_text}
                                            </TextLink>
                                        </div>
                                    )}
                                </Reveal>
                            </div>
                        </Container>
                    </section>
                )}

                {/* Trust Features — elegant dark band with icons */}
                <section className="relative overflow-hidden bg-[#171310] py-16 sm:py-20 lg:py-28">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-[0.02]">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '40px 40px',
                        }} />
                    </div>
                    
                    <Container>
                        <Reveal>
                            <div className="mb-20 text-center">
                                <Eyebrow light>The Boutique Experience</Eyebrow>
                                <p className="mx-auto mt-6 max-w-2xl text-base text-white/60">
                                    Every detail considered for your complete satisfaction
                                </p>
                            </div>
                        </Reveal>
                        
                        <div className="grid grid-cols-1 gap-16 md:grid-cols-3">
                            {/* Feature 1 - Curated */}
                            <Reveal delay={0}>
                                <div className="text-center">
                                    {/* Icon */}
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#9C7A3C]/30 bg-[#9C7A3C]/10">
                                        <svg className="h-7 w-7 text-[#9C7A3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-serif text-xl font-medium text-white">
                                        Carefully Curated
                                    </h3>
                                    <p className="mt-4 text-sm leading-relaxed text-white/60">
                                        Every piece is selected with intention, ensuring quality and timeless appeal.
                                    </p>
                                </div>
                            </Reveal>
                            
                            {/* Feature 2 - Ordering */}
                            <Reveal delay={100}>
                                <div className="text-center">
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#9C7A3C]/30 bg-[#9C7A3C]/10">
                                        <svg className="h-7 w-7 text-[#9C7A3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-serif text-xl font-medium text-white">
                                        Seamless Experience
                                    </h3>
                                    <p className="mt-4 text-sm leading-relaxed text-white/60">
                                        A simple, elegant checkout process designed for your convenience.
                                    </p>
                                </div>
                            </Reveal>
                            
                            {/* Feature 3 - Delivery */}
                            <Reveal delay={200}>
                                <div className="text-center">
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#9C7A3C]/30 bg-[#9C7A3C]/10">
                                        <svg className="h-7 w-7 text-[#9C7A3C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                        </svg>
                                    </div>
                                    <h3 className="font-serif text-xl font-medium text-white">
                                        Flexible Fulfillment
                                    </h3>
                                    <p className="mt-4 text-sm leading-relaxed text-white/60">
                                        Choose delivery or in-store pickup to suit your lifestyle.
                                    </p>
                                </div>
                            </Reveal>
                        </div>
                    </Container>
                </section>

                {/* Testimonials — refined presentation */}
                {testimonials.length > 0 && (
                    <section className="bg-[#F8F5EF] py-16 sm:py-20 lg:py-28">
                        <Container>
                            <Reveal>
                                <div className="mb-16 text-center">
                                    <Eyebrow>Reviews</Eyebrow>
                                    <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-[#171310] md:text-5xl">
                                        Loved by those who wear it
                                    </h2>
                                </div>
                            </Reveal>
                            <TestimonialsCarousel testimonials={testimonials} />
                        </Container>
                    </section>
                )}

                {/* Newsletter — white */}
                <NewsletterSection />
            </main>
        </StoreLayout>
    );
}
