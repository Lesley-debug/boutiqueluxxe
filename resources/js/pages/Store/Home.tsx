import { Head } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";
import ProductCard from "@/components/Store/ProductCard";
import Reveal from "@/components/Store/Reveal";
import NewsletterSection from "@/components/Store/NewsletterSection";
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

interface HomeProps {
    categories: CategoryCard[];
    featuredProducts: ProductCardType[];
    newArrivals: ProductCardType[];
    content: HomepageContent;
    styles: StyleCard[];
    testimonials: TestimonialItem[];
}

export default function Home({
    categories,
    featuredProducts,
    newArrivals,
    content,
    styles,
    testimonials,
}: HomeProps) {
    return (
        <StoreLayout>
            <Head title="Home" />

            <main>
                {/* Hero */}
                <section className="flex min-h-screen items-center justify-center bg-[#F8F5EF] px-6">
                    <div className="text-center">
                        <Reveal>
                            <Eyebrow>Designer Bags Boutique</Eyebrow>
                        </Reveal>
                        <Reveal delay={100}>
                            <h1 className="mt-6 font-serif text-6xl font-medium leading-[0.95] tracking-tight text-[#171310] md:text-8xl">
                                Your Signature Style
                            </h1>
                        </Reveal>
                        <Reveal delay={200}>
                            <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-[#252525]/60 md:text-lg">
                                Discover elegant, considered pieces designed to
                                make every look unforgettable.
                            </p>
                        </Reveal>
                        <Reveal delay={300}>
                            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
                                <PrimaryButton href="/shop">
                                    Shop Collection
                                </PrimaryButton>
                                <SecondaryButton href="/shop?sort=newest">
                                    New Arrivals
                                </SecondaryButton>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* Category Discovery — cream */}
                {categories.length > 0 && (
                    <section className="bg-[#F8F5EF] py-28">
                        <Container>
                            <Reveal>
                                <SectionHeading
                                    eyebrow="Discover"
                                    title="Explore the Collection"
                                    subtitle="Carefully selected pieces designed to complement every expression of style."
                                />
                            </Reveal>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                                {categories.map((category, i) => (
                                    <Reveal key={category.id} delay={i * 80}>
                                        <a
                                            href={`/shop?category=${category.slug}`}
                                            className="group relative block aspect-[4/5] overflow-hidden rounded-[2px] bg-[#171310]/[0.04] transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(23,19,16,0.35)]"
                                        >
                                            {category.image && (
                                                <img
                                                    src={category.image}
                                                    alt={category.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#171310]/75 via-[#171310]/10 to-transparent" />
                                            <div className="absolute bottom-8 left-8 text-white">
                                                <p className="font-serif text-2xl tracking-tight">
                                                    {category.name}
                                                </p>
                                                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80 transition group-hover:text-[#9C7A3C]">
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

                {/* The Edit — white, for contrast against cream above/below */}
                {featuredProducts.length > 0 && (
                    <section className="bg-white py-28">
                        <Container>
                            <Reveal>
                                <SectionHeading
                                    eyebrow="Curated"
                                    title="The Edit"
                                    subtitle="Pieces selected for their character, versatility, and timeless appeal."
                                />
                            </Reveal>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-14 sm:grid-cols-4">
                                {featuredProducts.map((product, i) => (
                                    <Reveal key={product.id} delay={i * 60}>
                                        <ProductCard product={product} />
                                    </Reveal>
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

                {/* New Arrivals — cream */}
                {newArrivals.length > 0 && (
                    <section className="bg-[#F8F5EF] py-28">
                        <Container>
                            <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <Reveal>
                                    <Eyebrow>Just In</Eyebrow>
                                    <h2 className="mt-4 font-serif text-4xl font-medium tracking-tight text-[#171310] md:text-5xl">
                                        New Arrivals
                                    </h2>
                                </Reveal>
                                <TextLink href="/shop?sort=newest">
                                    View All
                                </TextLink>
                            </div>
                            <div className="scrollbar-hide flex gap-8 overflow-x-auto pb-4">
                                {newArrivals.map((product) => (
                                    <div
                                        key={product.id}
                                        className="w-52 flex-shrink-0"
                                    >
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                {/* Shop by Style — white */}
                {styles.length > 0 && (
                    <section className="bg-white py-28">
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
                    <section className="bg-white py-28">
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

                {/* Trust — dark band for visual rhythm */}
                <section className="bg-[#171310] py-28">
                    <Container>
                        <Reveal>
                            <Eyebrow light>The Boutique Experience</Eyebrow>
                        </Reveal>
                        <div className="mt-14 grid grid-cols-1 gap-14 text-center sm:grid-cols-3">
                            {[
                                [
                                    "Carefully Curated",
                                    "Selected pieces chosen with intention.",
                                ],
                                [
                                    "Easy Ordering",
                                    "A simple, guided checkout experience.",
                                ],
                                [
                                    "Delivery or Pickup",
                                    "Choose what works best for you.",
                                ],
                            ].map(([title, text], i) => (
                                <Reveal key={title} delay={i * 100}>
                                    <p className="font-serif text-lg text-white">
                                        {title}
                                    </p>
                                    <p className="mt-3 text-sm leading-relaxed text-white/50">
                                        {text}
                                    </p>
                                </Reveal>
                            ))}
                        </div>
                    </Container>
                </section>

                {/* Testimonials — cream */}
                {testimonials.length > 0 && (
                    <section className="bg-[#F8F5EF] py-28">
                        <Container>
                            <Reveal>
                                <SectionHeading
                                    eyebrow="Reviews"
                                    title="Loved by those who wear it."
                                />
                            </Reveal>
                            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-14 sm:grid-cols-3">
                                {testimonials.map((t, i) => (
                                    <Reveal key={t.id} delay={i * 100}>
                                        <div className="text-center">
                                            <p className="text-sm tracking-widest text-[#9C7A3C]">
                                                {"★".repeat(t.rating)}
                                            </p>
                                            <p className="mt-4 text-sm italic leading-relaxed text-[#252525]/70">
                                                "{t.quote}"
                                            </p>
                                            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#252525]/50">
                                                — {t.customer_name}
                                            </p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                {/* Newsletter — white */}
                <NewsletterSection />
            </main>
        </StoreLayout>
    );
}
