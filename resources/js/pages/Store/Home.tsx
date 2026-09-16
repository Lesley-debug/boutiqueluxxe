import { Head, Link } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";

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
}: HomeProps) {
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
            </main>
        </StoreLayout>
    );
}
