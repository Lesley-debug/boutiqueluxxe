import { Head, router } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import ProductCard from "@/components/Store/ProductCard";
import StoreLayout from "@/components/Store/StoreLayout";
import type { Category, PaginatedProducts, ShopFilters } from "@/types/catalog";

interface ShopProps {
    products: PaginatedProducts;
    categories: Category[];
    filters: ShopFilters;
}

export default function Shop({ products, categories, filters }: ShopProps) {
    const [search, setSearch] = useState(filters.search ?? "");

    function applyFilter(next: Partial<ShopFilters>) {
        router.get(
            "/shop",
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true },
        );
    }

    function onSearchSubmit(e: FormEvent) {
        e.preventDefault();
        applyFilter({ search });
    }

    return (
        <StoreLayout>
            <Head title="Shop" />
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
                <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="font-serif text-5xl font-medium tracking-tight text-[#171310]">
                            Shop
                        </h1>
                        <p className="mt-2 text-sm text-[#252525]/60">
                            Discover our curated collection of luxury designer bags
                        </p>
                    </div>
                    <form onSubmit={onSearchSubmit} className="flex gap-3">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-64 rounded-full border border-[#171310]/15 bg-white px-5 py-3 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                        />
                        <button
                            type="submit"
                            className="rounded-full bg-[#171310] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C]"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
                    <aside className="lg:col-span-1">
                        <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-6">
                            <h2 className="mb-6 font-serif text-xl font-medium text-[#171310]">
                                Categories
                            </h2>
                            <ul className="space-y-3 text-sm">
                                <li>
                                    <button
                                        onClick={() =>
                                            applyFilter({ category: undefined })
                                        }
                                        className={`transition ${
                                            !filters.category
                                                ? "font-semibold text-[#9C7A3C]"
                                                : "text-[#252525]/70 hover:text-[#171310]"
                                        }`}
                                    >
                                        All Products
                                    </button>
                                </li>
                                {categories.map((cat) => (
                                    <li key={cat.id}>
                                        <button
                                            onClick={() =>
                                                applyFilter({ category: cat.slug })
                                            }
                                            className={`transition ${
                                                filters.category === cat.slug
                                                    ? "font-semibold text-[#9C7A3C]"
                                                    : "text-[#252525]/70 hover:text-[#171310]"
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                        {cat.children &&
                                            cat.children.length > 0 && (
                                                <ul className="ml-4 mt-2 space-y-2">
                                                    {cat.children.map((child) => (
                                                        <li key={child.id}>
                                                            <button
                                                                onClick={() =>
                                                                    applyFilter({
                                                                        category:
                                                                            child.slug,
                                                                    })
                                                                }
                                                                className={`text-xs transition ${
                                                                    filters.category ===
                                                                    child.slug
                                                                        ? "font-semibold text-[#9C7A3C]"
                                                                        : "text-[#252525]/60 hover:text-[#171310]"
                                                                }`}
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

                            <div className="mt-8 border-t border-[#171310]/10 pt-6">
                                <h3 className="mb-4 font-serif text-lg font-medium text-[#171310]">
                                    Sort By
                                </h3>
                                <select
                                    value={filters.sort ?? ""}
                                    onChange={(e) =>
                                        applyFilter({ sort: e.target.value })
                                    }
                                    className="w-full rounded-full border border-[#171310]/15 bg-white px-4 py-2.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                >
                                    <option value="">Featured</option>
                                    <option value="newest">Newest First</option>
                                    <option value="price_asc">
                                        Price: Low to High
                                    </option>
                                    <option value="price_desc">
                                        Price: High to Low
                                    </option>
                                </select>
                            </div>
                        </div>
                    </aside>

                    <div className="lg:col-span-3">
                        {products.data.length === 0 ? (
                            <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-12 text-center">
                                <p className="text-lg text-[#252525]/60">
                                    No products match your search.
                                </p>
                                <p className="mt-2 text-sm text-[#252525]/40">
                                    Try adjusting your filters or search terms
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}

                        {products.last_page > 1 && (
                            <div className="mt-12 flex justify-center">
                                <div className="flex gap-2">
                                    {products.links.map((link, i) => (
                                        <button
                                            key={i}
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url &&
                                                router.visit(link.url, {
                                                    preserveScroll: true,
                                                })
                                            }
                                            className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-40 ${
                                                link.active
                                                    ? "border-[#9C7A3C] bg-[#9C7A3C] text-white"
                                                    : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                                            }`}
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
