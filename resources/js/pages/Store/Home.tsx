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
        <div className="mb-10 flex items-end justify-between">
            <div>
                {eyebrow && (
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                        {eyebrow}
                    </p>
                )}
                <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
                )}
            </div>
        </div>
    );
}

function ProductTile({ product }: { product: ProductCard }) {
    const price = product.sale_price ?? product.base_price;
    const primary = product.images[0];

    return (
        <Link
            href={`/products/${product.slug}`}
            className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-lg"
        >
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                {primary && (
                    <img
                        src={primary.url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                )}
                {product.new_arrival && (
                    <span className="absolute left-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                        New
                    </span>
                )}
            </div>
            <div className="p-4">
                <p className="truncate text-sm font-medium text-gray-900">
                    {product.name}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-[#7C3AED]">
                        {Number(price).toLocaleString()} FCFA
                    </span>
                    {product.sale_price && (
                        <span className="text-xs text-gray-400 line-through">
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
        <StoreLayout categories={categories}>
            <Head title="Home" />

            <main className="bg-[#FAFAFC]">
                {/* Hero — purple gradient banner */}
                <section className="px-4 pt-10 sm:px-6">
                    <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#6D28D9] via-[#7C3AED] to-[#A855F7] px-8 py-20 text-center sm:px-16 sm:py-28">
                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />

                        <p className="relative mb-4 text-xs font-bold uppercase tracking-[0.2em] text-purple-200">
                            Designer Bags Boutique
                        </p>
                        <h1 className="relative text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
                            Your Signature Style
                        </h1>
                        <p className="relative mx-auto mt-5 max-w-lg text-base text-purple-100 sm:text-lg">
                            Discover elegant, affordable fashion pieces designed
                            to make every look unforgettable.
                        </p>

                        <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                            <Link
                                href="/shop"
                                className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-[#7C3AED] shadow-lg transition hover:scale-105"
                            >
                                Shop Collection
                            </Link>
                            <Link
                                href="/shop?sort=newest"
                                className="rounded-full border-2 border-white/40 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                            >
                                New Arrivals
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Category Discovery */}
                {categories.length > 0 && (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <SectionHeading
                            eyebrow="Discover"
                            title="Shop by Category"
                        />

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/shop?category=${category.slug}`}
                                    className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-gray-100 shadow-sm transition hover:shadow-xl"
                                >
                                    {category.image && (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#4C1D95]/80 via-transparent to-transparent" />
                                    <div className="absolute bottom-6 left-6 text-white">
                                        <p className="text-xl font-bold">
                                            {category.name}
                                        </p>
                                        <p className="mt-1 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                            Explore →
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* The Edit */}
                {featuredProducts.length > 0 && (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <SectionHeading
                            eyebrow="Curated"
                            title="The Edit"
                            subtitle="Pieces selected for their character and timeless appeal."
                        />

                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {featuredProducts.map((product) => (
                                <ProductTile
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    </section>
                )}

                {/* New Arrivals */}
                {newArrivals.length > 0 && (
                    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <div className="mb-10 flex items-end justify-between">
                            <div>
                                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                                    Just In
                                </p>
                                <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                                    New Arrivals
                                </h2>
                            </div>
                            <Link
                                href="/shop?sort=newest"
                                className="hidden rounded-full bg-[#F5F3FF] px-5 py-2 text-sm font-semibold text-[#7C3AED] transition hover:bg-[#7C3AED] hover:text-white sm:block"
                            >
                                View All
                            </Link>
                        </div>

                        <div className="flex gap-4 overflow-x-auto pb-4">
                            {newArrivals.map((product) => (
                                <div
                                    key={product.id}
                                    className="w-44 flex-shrink-0"
                                >
                                    <ProductTile product={product} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trust */}
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <div className="rounded-3xl bg-gradient-to-br from-[#F5F3FF] to-white p-10 sm:p-14">
                        <p className="mb-10 text-center text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                            The Boutique Experience
                        </p>
                        <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-3">
                            <div>
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                                    ✨
                                </div>
                                <p className="font-bold text-gray-900">
                                    Carefully Curated
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    Selected pieces chosen with intention.
                                </p>
                            </div>
                            <div>
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                                    🛍️
                                </div>
                                <p className="font-bold text-gray-900">
                                    Easy Ordering
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                    A simple, guided checkout experience.
                                </p>
                            </div>
                            <div>
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm">
                                    📦
                                </div>
                                <p className="font-bold text-gray-900">
                                    Delivery or Pickup
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
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
