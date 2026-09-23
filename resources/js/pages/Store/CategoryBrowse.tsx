import { Head, Link, router } from "@inertiajs/react";
import { PackageSearch, ShoppingBag, Search, ArrowLeft } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";
import { Container } from "@/components/Store/ui";
import { useState } from "react";

interface CategoryRow {
    id: number;
    name: string;
    slug: string;
    products_count: number;
    image: string | null;
    description?: string | null;
}

// ─── Mobile view (< lg) ──────────────────────────────────────────────────────

function MobileCategoryBrowse({ categories }: { categories: CategoryRow[] }) {
    const [search, setSearch] = useState("");

    const filtered = categories
        .filter((c) => c.products_count > 0)
        .filter((c) =>
            search.trim() === ""
                ? true
                : c.name.toLowerCase().includes(search.toLowerCase()),
        );

    return (
        <div className="min-h-screen bg-[#F8F5EF] pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#171310]/8 bg-white px-4 py-4">
                <button
                    onClick={() => router.visit("/")}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F8F5EF]"
                >
                    <ArrowLeft size={17} color="#171310" strokeWidth={2} />
                </button>
                <h1 className="flex-1 text-center font-serif text-lg font-medium text-[#171310]">
                    All Categories
                </h1>
                {/* spacer to keep title centered */}
                <div className="h-9 w-9" />
            </div>

            {/* Search */}
            <div className="px-4 py-3">
                <div className="relative">
                    <Search
                        size={14}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#252525]/35"
                        strokeWidth={2}
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search categories..."
                        className="w-full rounded-full border-0 bg-white py-2.5 pl-9 pr-4 text-sm text-[#171310] shadow-sm placeholder:text-[#252525]/35 focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/30"
                    />
                </div>
            </div>

            {/* List */}
            <div className="px-4">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center">
                        <PackageSearch size={32} className="mb-4 text-[#171310]/25" />
                        <p className="text-sm text-[#252525]/50">
                            {search ? "No categories match your search." : "No categories stocked yet."}
                        </p>
                        <Link href="/shop" className="mt-4 text-sm text-[#9C7A3C] underline">
                            Browse all products
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((c) => (
                            <Link
                                key={c.id}
                                href={`/shop?category=${c.slug}`}
                                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition active:scale-[0.99] active:bg-[#F8F5EF]"
                            >
                                {/* Circle image */}
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-[#F0EBE3]">
                                    {c.image ? (
                                        <img
                                            src={c.image}
                                            alt={c.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <span className="font-serif text-2xl text-[#9C7A3C]">◈</span>
                                        </div>
                                    )}
                                </div>

                                {/* Text */}
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-[#171310]">
                                        {c.name}
                                    </p>
                                    {c.description && (
                                        <p className="mt-0.5 truncate text-xs italic text-[#252525]/50">
                                            {c.description}
                                        </p>
                                    )}
                                    <p className="mt-1 flex items-center gap-1 text-xs text-[#252525]/50">
                                        <ShoppingBag size={11} />
                                        {c.products_count}+ Products
                                    </p>
                                </div>

                                {/* CTA */}
                                <div className="flex-shrink-0">
                                    <span className="rounded-full bg-[#9C7A3C] px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                                        View Category
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Desktop view (lg+) ───────────────────────────────────────────────────────

function DesktopCategoryBrowse({ categories }: { categories: CategoryRow[] }) {
    const withStock = categories.filter((c) => c.products_count > 0);

    return (
        <StoreLayout>
            <Head title="Categories" />
            <Container className="py-16">
                <h1 className="mb-2 font-serif text-3xl font-medium text-[#171310]">
                    All Categories
                </h1>
                <p className="mb-8 text-sm text-[#252525]/50">
                    Browse our curated collections
                </p>

                {withStock.length === 0 ? (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#171310]/15 py-20 text-center">
                        <PackageSearch size={32} className="mb-4 text-[#171310]/30" />
                        <p className="text-sm text-[#252525]/60">
                            No categories are stocked yet — check back soon.
                        </p>
                        <Link href="/shop" className="mt-4 text-sm underline">
                            Browse all products instead
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {withStock.map((c) => (
                            <Link
                                key={c.id}
                                href={`/shop?category=${c.slug}`}
                                className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md active:bg-[#F8F5EF]"
                            >
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-[#F0EBE3]">
                                    {c.image ? (
                                        <img
                                            src={c.image}
                                            alt={c.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center">
                                            <span className="font-serif text-2xl text-[#9C7A3C]">◈</span>
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold text-[#171310]">{c.name}</p>
                                    {c.description && (
                                        <p className="mt-0.5 truncate text-xs italic text-[#252525]/50">
                                            {c.description}
                                        </p>
                                    )}
                                    <p className="mt-1 flex items-center gap-1 text-xs text-[#252525]/50">
                                        <ShoppingBag size={11} />
                                        {c.products_count}+ Products
                                    </p>
                                </div>
                                <div className="flex-shrink-0">
                                    <span className="rounded-full bg-[#9C7A3C] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-white">
                                        View Category
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </Container>
        </StoreLayout>
    );
}

// ─── Entry point — mobile vs desktop ─────────────────────────────────────────

export default function CategoryBrowse({
    categories,
}: {
    categories: CategoryRow[];
}) {
    return (
        <>
            <Head title="Categories" />
            {/* Mobile */}
            <div className="lg:hidden">
                <MobileCategoryBrowse categories={categories} />
            </div>
            {/* Desktop */}
            <div className="hidden lg:block">
                <DesktopCategoryBrowse categories={categories} />
            </div>
        </>
    );
}
