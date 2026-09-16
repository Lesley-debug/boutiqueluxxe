import { FormEvent } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";


interface HomepageContent {
    editorial_title: string | null;
    editorial_subtitle: string | null;
    editorial_cta_text: string | null;
    editorial_cta_url: string | null;
    editorial_image_url: string | null;
    watches_title: string | null;
    watches_subtitle: string | null;
    watches_cta_text: string | null;
    watches_cta_url: string | null;
    watches_image_url: string | null;
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



interface CategoryCard {
    id: number;
    name: string;
    slug: string;
    image: string | null;
}

interface ProductCard {
    id: number;
    name: string;
    slug: string;
    base_price: string;
    sale_price: string | null;
    new_arrival: boolean;
    images: { url: string }[];
}

interface HomeProps {
    categories: CategoryCard[];
    featuredProducts: ProductCard[];
    newArrivals: ProductCard[];
    content: HomepageContent;
    styles: StyleCard[];
    testimonials: TestimonialItem[];
}

function SectionHeading({
    eyebrow,
    title,
    subtitle,
}: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
}) {
    return (
        <div className="mx-auto mb-16 max-w-xl text-center">
            {eyebrow && (
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#B89B6A]">
                    {eyebrow}
                </p>
            )}
            <h2 className="font-serif text-3xl font-medium tracking-tight text-[#171310] md:text-4xl">
                {title}
            </h2>
            {subtitle && (
                <p className="mt-4 text-sm leading-relaxed text-[#252525]/60">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

function ProductTile({ product }: { product: ProductCard }) {
    const price = product.sale_price ?? product.base_price;
    const primary = product.images[0];

    return (
        <Link href={`/products/${product.slug}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-[#171310]/[0.04]">
                {primary && (
                    <img
                        src={primary.url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                )}
                {product.new_arrival && (
                    <span className="absolute left-4 top-4 rounded-full bg-[#171310] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.15em] text-white">
                        New
                    </span>
                )}
            </div>
            <div className="mt-4 space-y-1">
                <p className="text-sm text-[#171310]">{product.name}</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-[#171310]">
                        {Number(price).toLocaleString()} FCFA
                    </span>
                    {product.sale_price && (
                        <span className="text-xs text-[#252525]/35 line-through">
                            {Number(product.base_price).toLocaleString()} FCFA
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function Home({
    categories,
    featuredProducts,
    newArrivals,
    content,
    styles,
    testimonials,
}: HomeProps) {
    const newsletter = useForm({ email: "" });

    function subscribe(e: FormEvent) {
        e.preventDefault();
        newsletter.post("/newsletter", {
            preserveScroll: true,
            onSuccess: () => newsletter.reset(),
        });
    }

    return (
        <StoreLayout>
            <Head title="Home" />

            <main className="text-[#171310]">
                <section className="flex min-h-screen items-center justify-center px-6">
                    <div className="text-center">
                        <p className="mb-6 text-xs font-medium uppercase tracking-[0.4em] text-[#B89B6A]">
                            Designer Bags Boutique
                        </p>
                        <h1 className="font-serif text-6xl font-medium leading-[0.95] tracking-tight md:text-8xl">
                            Your Signature Style
                        </h1>
                        <p className="mx-auto mt-8 max-w-lg text-base leading-relaxed text-[#252525]/60 md:text-lg">
                            Discover elegant, affordable fashion pieces designed
                            to make every look unforgettable.
                        </p>
                        <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
                            <Link
                                href="/shop"
                                className="rounded-full bg-[#171310] px-9 py-4 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-[#B89B6A]"
                            >
                                Shop Collection
                            </Link>
                            <Link
                                href="/shop?sort=newest"
                                className="rounded-full border border-[#171310]/15 px-9 py-4 text-xs font-medium uppercase tracking-[0.15em] transition hover:border-[#B89B6A] hover:text-[#B89B6A]"
                            >
                                New Arrivals
                            </Link>
                        </div>
                    </div>
                </section>

                {categories.length > 0 && (
                    <section className="mx-auto max-w-7xl px-6 py-28">
                        <SectionHeading
                            eyebrow="Discover"
                            title="Explore the Collection"
                            subtitle="Carefully selected pieces designed to complement every expression of style."
                        />
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/shop?category=${category.slug}`}
                                    className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-[#171310]/[0.04]"
                                >
                                    {category.image && (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#171310]/70 via-[#171310]/10 to-transparent" />
                                    <div className="absolute bottom-8 left-8 text-white">
                                        <p className="font-serif text-2xl tracking-tight">
                                            {category.name}
                                        </p>
                                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/80 transition group-hover:text-[#B89B6A]">
                                            Explore →
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {featuredProducts.length > 0 && (
                    <section className="mx-auto max-w-7xl px-6 py-28">
                        <SectionHeading
                            eyebrow="Curated"
                            title="The Edit"
                            subtitle="Pieces selected for their character, versatility, and timeless appeal."
                        />
                        <div className="grid grid-cols-2 gap-x-8 gap-y-14 sm:grid-cols-4">
                            {featuredProducts.map((product) => (
                                <ProductTile
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {content.editorial_image_url && (
                    <section className="relative h-[70vh] w-full overflow-hidden">
                        <img
                            src={content.editorial_image_url}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#171310]/30 px-6 text-center">
                            {content.editorial_title && (
                                <h2 className="font-serif text-4xl font-medium text-white md:text-6xl">
                                    {content.editorial_title}
                                </h2>
                            )}
                            {content.editorial_subtitle && (
                                <p className="mt-6 max-w-lg text-base leading-relaxed text-white/85">
                                    {content.editorial_subtitle}
                                </p>
                            )}
                            {content.editorial_cta_text && (
                                <Link
                                    href={content.editorial_cta_url || "/shop"}
                                    className="mt-10 rounded-full border border-white/50 px-9 py-4 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-white hover:text-[#171310]"
                                >
                                    {content.editorial_cta_text}
                                </Link>
                            )}
                        </div>
                    </section>
                )}

                {newArrivals.length > 0 && (
                    <section className="mx-auto max-w-7xl px-6 py-28">
                        <div className="mb-16 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#B89B6A]">
                                    Just In
                                </p>
                                <h2 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
                                    New Arrivals
                                </h2>
                                <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#252525]/60">
                                    Meet the latest additions to our collection.
                                </p>
                            </div>
                            <Link
                                href="/shop?sort=newest"
                                className="hidden text-xs font-medium uppercase tracking-[0.15em] underline underline-offset-4 sm:block"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="flex gap-8 overflow-x-auto pb-4">
                            {newArrivals.map((product) => (
                                <div
                                    key={product.id}
                                    className="w-52 flex-shrink-0"
                                >
                                    <ProductTile product={product} />
                                </div>
                            ))}
                        </div>
                        <Link
                            href="/shop?sort=newest"
                            className="mt-10 block text-center text-xs font-medium uppercase tracking-[0.15em] underline underline-offset-4 sm:hidden"
                        >
                            View All →
                        </Link>
                    </section>
                )}

                {styles.length > 0 && (
                    <section className="mx-auto max-w-7xl px-6 py-28">
                        <SectionHeading
                            eyebrow="Inspiration"
                            title="Shop by Style"
                        />
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                            {styles.map((style) => (
                                <Link
                                    key={style.id}
                                    href={`/shop?style=${style.slug}`}
                                    className="group relative aspect-[4/5] overflow-hidden rounded-sm bg-[#171310]/[0.04]"
                                >
                                    {style.image_url && (
                                        <img
                                            src={style.image_url}
                                            alt={style.name}
                                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#171310]/70 via-transparent to-transparent" />
                                    <div className="absolute bottom-8 left-8 text-white">
                                        <p className="font-serif text-2xl tracking-tight">
                                            {style.name}
                                        </p>
                                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-white/80">
                                            Explore →
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {content.watches_image_url && (
                    <section className="relative h-[60vh] w-full overflow-hidden">
                        <img
                            src={content.watches_image_url}
                            alt=""
                            className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#171310]/40 px-6 text-center">
                            {content.watches_title && (
                                <h2 className="font-serif text-4xl font-medium text-white md:text-5xl">
                                    {content.watches_title}
                                </h2>
                            )}
                            {content.watches_subtitle && (
                                <p className="mt-5 max-w-md text-sm leading-relaxed text-white/85">
                                    {content.watches_subtitle}
                                </p>
                            )}
                            {content.watches_cta_text && (
                                <Link
                                    href={content.watches_cta_url || "/shop"}
                                    className="mt-9 rounded-full bg-white px-9 py-4 text-xs font-medium uppercase tracking-[0.15em] text-[#171310] transition hover:bg-[#B89B6A] hover:text-white"
                                >
                                    {content.watches_cta_text}
                                </Link>
                            )}
                        </div>
                    </section>
                )}

                {content.story_image_url && (
                    <section className="mx-auto max-w-7xl px-6 py-28">
                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            <div className="aspect-[4/5] overflow-hidden rounded-sm">
                                <img
                                    src={content.story_image_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                {content.story_title && (
                                    <h2 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
                                        {content.story_title}
                                    </h2>
                                )}
                                {content.story_text && (
                                    <p className="mt-6 text-base leading-relaxed text-[#252525]/70">
                                        {content.story_text}
                                    </p>
                                )}
                                {content.story_cta_text && (
                                    <Link
                                        href="/about"
                                        className="mt-8 inline-block text-xs font-medium uppercase tracking-[0.15em] underline underline-offset-4"
                                    >
                                        {content.story_cta_text} →
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                <section className="border-t border-[#171310]/10 px-6 py-28">
                    <div className="mx-auto max-w-4xl">
                        <p className="mb-16 text-center text-xs font-medium uppercase tracking-[0.3em] text-[#B89B6A]">
                            The Boutique Experience
                        </p>
                        <div className="grid grid-cols-1 gap-16 text-center sm:grid-cols-3">
                            <div>
                                <p className="font-serif text-lg">
                                    Carefully Curated
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-[#252525]/60">
                                    Selected pieces chosen with intention.
                                </p>
                            </div>
                            <div>
                                <p className="font-serif text-lg">
                                    Easy Ordering
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-[#252525]/60">
                                    A simple, guided checkout experience.
                                </p>
                            </div>
                            <div>
                                <p className="font-serif text-lg">
                                    Delivery or Pickup
                                </p>
                                <p className="mt-3 text-sm leading-relaxed text-[#252525]/60">
                                    Choose what works best for you.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {testimonials.length > 0 && (
                    <section className="border-t border-[#171310]/10 px-6 py-28">
                        <SectionHeading
                            eyebrow="Reviews"
                            title="Loved by those who wear it."
                        />
                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-12 sm:grid-cols-3">
                            {testimonials.map((t) => (
                                <div key={t.id} className="text-center">
                                    <p className="text-sm tracking-widest text-[#B89B6A]">
                                        {"★".repeat(t.rating)}
                                    </p>
                                    <p className="mt-4 text-sm italic leading-relaxed text-[#252525]/70">
                                        "{t.quote}"
                                    </p>
                                    <p className="mt-4 text-xs uppercase tracking-[0.15em] text-[#252525]/50">
                                        — {t.customer_name}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                <section className="border-t border-[#171310]/10 px-6 py-28 text-center">
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-[#B89B6A]">
                        Newsletter
                    </p>
                    <h2 className="font-serif text-3xl font-medium tracking-tight md:text-4xl">
                        Enter the world of Designer Bags Boutique.
                    </h2>
                    <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#252525]/60">
                        Be the first to discover new arrivals, exclusive edits,
                        and special offers.
                    </p>

                    <form
                        onSubmit={subscribe}
                        className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row"
                    >
                        <input
                            type="email"
                            value={newsletter.data.email}
                            onChange={(e) =>
                                newsletter.setData("email", e.target.value)
                            }
                            placeholder="Your email address"
                            className="flex-1 rounded-full border border-[#171310]/15 bg-transparent px-5 py-3.5 text-sm focus:border-[#B89B6A] focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={newsletter.processing}
                            className="rounded-full bg-[#171310] px-9 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-white transition hover:bg-[#B89B6A] disabled:opacity-50"
                        >
                            Join
                        </button>
                    </form>
                    {newsletter.errors.email && (
                        <p className="mt-3 text-xs text-red-600">
                            {newsletter.errors.email}
                        </p>
                    )}
                    {newsletter.recentlySuccessful && (
                        <p className="mt-3 text-xs text-green-700">
                            Thank you — you're on the list.
                        </p>
                    )}
                </section>
            </main>
        </StoreLayout>
    );
}
