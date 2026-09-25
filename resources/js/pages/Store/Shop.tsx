import { Head, router } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import {
    Search,
    SlidersHorizontal,
    X,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import ProductCard from "@/components/Store/ProductCard";
import StoreLayout from "@/components/Store/StoreLayout";
import type { Category, PaginatedProducts, ShopFilters } from "@/types/catalog";

interface ShopProps {
    products: PaginatedProducts;
    categories: Category[];
    filters: ShopFilters;
}

const SORT_LABELS: Record<string, string> = {
    "":           "Featured",
    newest:       "Newest",
    price_asc:    "Price ↑",
    price_desc:   "Price ↓",
};

// ─── Mobile filter drawer ─────────────────────────────────────────────────────

function FilterDrawer({
    open,
    onClose,
    categories,
    filters,
    onApply,
}: {
    open: boolean;
    onClose: () => void;
    categories: Category[];
    filters: ShopFilters;
    onApply: (next: Partial<ShopFilters>) => void;
}) {
    return (
        <>
            <div
                className={`fixed inset-0 z-50 bg-[#171310]/40 backdrop-blur-sm transition-opacity duration-300 ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
            />
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-white px-5 pb-10 pt-4 shadow-2xl transition-transform duration-400 ease-out ${
                    open ? "translate-y-0" : "translate-y-full"
                }`}
            >
                {/* Handle */}
                <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[#171310]/15" />

                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-serif text-lg font-medium text-[#171310]">Filters & Sort</h2>
                    <button onClick={onClose} className="rounded-full p-1.5 text-[#171310]/40 hover:bg-[#F8F5EF]">
                        <X size={18} />
                    </button>
                </div>

                {/* Sort */}
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">Sort By</p>
                <div className="mb-6 flex flex-wrap gap-2">
                    {Object.entries(SORT_LABELS).map(([val, label]) => (
                        <button
                            key={val}
                            onClick={() => onApply({ sort: val || undefined })}
                            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                                (filters.sort ?? "") === val
                                    ? "border-[#171310] bg-[#171310] text-white"
                                    : "border-[#171310]/15 text-[#171310]"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Categories */}
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">Category</p>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => onApply({ category: undefined })}
                        className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                            !filters.category
                                ? "border-[#171310] bg-[#171310] text-white"
                                : "border-[#171310]/15 text-[#171310]"
                        }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onApply({ category: cat.slug })}
                            className={`rounded-full border px-4 py-2 text-xs font-medium transition ${
                                filters.category === cat.slug
                                    ? "border-[#171310] bg-[#171310] text-white"
                                    : "border-[#171310]/15 text-[#171310]"
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Shop({ products, categories, filters }: ShopProps) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [searchOpen, setSearchOpen] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const selectedSort = typeof filters.sort === "string" ? filters.sort : "";

    function applyFilter(next: Partial<ShopFilters>) {
        router.get("/shop", { ...filters, ...next }, { preserveState: true, preserveScroll: true });
        setFilterOpen(false);
    }

    function onSearchSubmit(e: FormEvent) {
        e.preventDefault();
        applyFilter({ search });
        setSearchOpen(false);
    }

    const activeFilterCount = [
        filters.category,
        selectedSort,
        filters.search,
        filters.min_price,
        filters.max_price,
    ].filter(Boolean).length;

    const activeCategory = categories.find((c) => c.slug === filters.category);

    return (
        <StoreLayout showMobileHeader>
            <Head title="Shop" />

            {/* ── Mobile layout ── */}
            <div className="lg:hidden">
                <div className="px-4 pb-2 pt-4">
                    {searchOpen ? (
                        <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#252525]/35" />
                                <input
                                    autoFocus
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-full rounded-full border-0 bg-white py-2.5 pl-8 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/30"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setSearchOpen(false)}
                                className="text-xs text-[#252525]/50"
                            >
                                Cancel
                            </button>
                        </form>
                    ) : (
                        <div className="flex items-end justify-between gap-3">
                            <div className="min-w-0">
                                <h1 className="truncate font-serif text-xl font-medium text-[#171310]">
                                    {activeCategory?.name ?? "Collection"}
                                </h1>
                                <p className="text-[10px] text-[#252525]/45">
                                    {products.total} pieces
                                </p>
                            </div>
                            <div className="flex flex-shrink-0 items-center gap-2">
                                <button
                                    onClick={() => setSearchOpen(true)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
                                    aria-label="Search products"
                                >
                                    <Search size={15} color="#171310" strokeWidth={2} />
                                </button>
                                <button
                                    onClick={() => setFilterOpen(true)}
                                    className="relative flex h-9 items-center gap-1.5 rounded-full bg-white px-3 shadow-sm"
                                >
                                    <SlidersHorizontal size={14} color="#171310" strokeWidth={2} />
                                    <span className="text-[11px] font-medium text-[#171310]">Filter</span>
                                    {activeFilterCount > 0 && (
                                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#9C7A3C] text-[8px] font-bold text-white">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {(filters.category || selectedSort) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {filters.category && (
                                <button
                                    onClick={() => applyFilter({ category: undefined })}
                                    className="flex items-center gap-1 rounded-full bg-[#171310] px-3 py-1 text-[10px] font-medium text-white"
                                >
                                    {activeCategory?.name ?? filters.category}
                                    <X size={10} />
                                </button>
                            )}
                            {selectedSort && (
                                <button
                                    onClick={() => applyFilter({ sort: undefined })}
                                    className="flex items-center gap-1 rounded-full bg-[#171310] px-3 py-1 text-[10px] font-medium text-white"
                                >
                                    {SORT_LABELS[selectedSort] ?? selectedSort}
                                    <X size={10} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Product grid */}
                <div className="px-3 py-4">
                    {products.data.length === 0 ? (
                        <div className="flex flex-col items-center py-20 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                                <Search size={20} className="text-[#171310]/25" strokeWidth={1.5} />
                            </div>
                            <p className="text-sm font-medium text-[#171310]">No products found</p>
                            <p className="mt-1 text-xs text-[#252525]/45">Try different filters</p>
                            <button
                                onClick={() => applyFilter({ category: undefined, sort: undefined, search: undefined })}
                                className="mt-5 rounded-full bg-[#171310] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {products.data.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {products.last_page > 1 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {products.links.map((link, i) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                    className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-40 ${
                                        link.active
                                            ? "border-[#9C7A3C] bg-[#9C7A3C] text-white"
                                            : "border-[#171310]/15 text-[#171310]"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <FilterDrawer
                    open={filterOpen}
                    onClose={() => setFilterOpen(false)}
                    categories={categories}
                    filters={filters}
                    onApply={applyFilter}
                />
            </div>

            {/* ── Desktop layout ── */}
            <div className="hidden lg:block">
                <div className="mx-auto max-w-7xl px-8 py-16 lg:px-12">
                    {/* Header */}
                    <div className="mb-10 flex items-end justify-between border-b border-[#171310]/8 pb-8">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#9C7A3C]">
                                Boutique Luxxe
                            </p>
                            <h1 className="mt-1 font-serif text-5xl font-medium tracking-tight text-[#171310]">
                                {activeCategory?.name ?? "The Collection"}
                            </h1>
                            <p className="mt-2 text-sm text-[#252525]/50">
                                {products.total} {products.total === 1 ? "piece" : "pieces"}
                                {filters.category ? ` in ${activeCategory?.name}` : " available"}
                            </p>
                        </div>
                        <form onSubmit={onSearchSubmit} className="flex items-center gap-2">
                            <div className="relative">
                                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#252525]/35" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search..."
                                    className="w-56 rounded-full border border-[#171310]/12 bg-white py-3 pl-10 pr-4 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/15"
                                />
                            </div>
                        </form>
                    </div>

                    <div className="grid grid-cols-4 gap-10">
                        {/* Sidebar */}
                        <aside className="col-span-1">
                            <div className="sticky top-24 space-y-8">
                                {/* Categories */}
                                <div>
                                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">
                                        Category
                                    </p>
                                    <ul className="space-y-2">
                                        <li>
                                            <button
                                                onClick={() => applyFilter({ category: undefined })}
                                                className={`text-sm transition ${!filters.category ? "font-semibold text-[#171310]" : "text-[#252525]/55 hover:text-[#171310]"}`}
                                            >
                                                All Products
                                            </button>
                                        </li>
                                        {categories.map((cat) => (
                                            <li key={cat.id}>
                                                <button
                                                    onClick={() => applyFilter({ category: cat.slug })}
                                                    className={`text-sm transition ${filters.category === cat.slug ? "font-semibold text-[#171310]" : "text-[#252525]/55 hover:text-[#171310]"}`}
                                                >
                                                    {cat.name}
                                                </button>
                                                {cat.children && cat.children.length > 0 && (
                                                    <ul className="ml-3 mt-1.5 space-y-1.5 border-l border-[#171310]/8 pl-3">
                                                        {cat.children.map((child) => (
                                                            <li key={child.id}>
                                                                <button
                                                                    onClick={() => applyFilter({ category: child.slug })}
                                                                    className={`text-xs transition ${filters.category === child.slug ? "font-semibold text-[#9C7A3C]" : "text-[#252525]/45 hover:text-[#171310]"}`}
                                                                >
                                                                    {child.name}
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Sort */}
                                <div>
                                    <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">
                                        Sort
                                    </p>
                                    <div className="relative">
                                        <select
                                            value={selectedSort}
                                            onChange={(e) => applyFilter({ sort: e.target.value || undefined })}
                                            className="w-full appearance-none rounded-xl border border-[#171310]/10 bg-white py-2.5 pl-4 pr-8 text-sm text-[#171310] focus:border-[#9C7A3C] focus:outline-none"
                                        >
                                            <option value="">Featured</option>
                                            <option value="newest">Newest First</option>
                                            <option value="price_asc">Price: Low to High</option>
                                            <option value="price_desc">Price: High to Low</option>
                                        </select>
                                        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#171310]/40" />
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Grid */}
                        <div className="col-span-3">
                            {products.data.length === 0 ? (
                                <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#171310]/10 py-24 text-center">
                                    <Search size={28} className="mb-4 text-[#171310]/20" strokeWidth={1.5} />
                                    <p className="text-sm font-medium text-[#171310]">No products found</p>
                                    <p className="mt-1 text-xs text-[#252525]/45">Try adjusting your filters</p>
                                    <button
                                        onClick={() => applyFilter({ category: undefined, sort: undefined, search: undefined })}
                                        className="mt-6 rounded-full bg-[#171310] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#9C7A3C]"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-6 xl:gap-8">
                                    {products.data.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            )}

                            {products.last_page > 1 && (
                                <div className="mt-14 flex justify-center gap-2">
                                    {products.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                            className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-40 ${
                                                link.active
                                                    ? "border-[#9C7A3C] bg-[#9C7A3C] text-white"
                                                    : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C]"
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
