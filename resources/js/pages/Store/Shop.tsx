import { Head, router } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import ProductCard from "@/components/ProductCard";
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
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                        Shop
                    </h1>
                    <form onSubmit={onSearchSubmit} className="flex gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products..."
                            className="w-56 rounded-sm border border-stone-300 px-3 py-2 text-sm focus:border-stone-900 focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="rounded-sm bg-stone-900 px-4 py-2 text-sm text-white"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
                    <aside className="lg:col-span-1">
                        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                            Categories
                        </h2>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <button
                                    onClick={() =>
                                        applyFilter({ category: undefined })
                                    }
                                    className={
                                        !filters.category
                                            ? "font-semibold text-stone-900"
                                            : "text-stone-600"
                                    }
                                >
                                    All
                                </button>
                            </li>
                            {categories.map((cat) => (
                                <li key={cat.id}>
                                    <button
                                        onClick={() =>
                                            applyFilter({ category: cat.slug })
                                        }
                                        className={
                                            filters.category === cat.slug
                                                ? "font-semibold text-stone-900"
                                                : "text-stone-600"
                                        }
                                    >
                                        {cat.name}
                                    </button>
                                    {cat.children &&
                                        cat.children.length > 0 && (
                                            <ul className="ml-3 mt-1 space-y-1">
                                                {cat.children.map((child) => (
                                                    <li key={child.id}>
                                                        <button
                                                            onClick={() =>
                                                                applyFilter({
                                                                    category:
                                                                        child.slug,
                                                                })
                                                            }
                                                            className={
                                                                filters.category ===
                                                                child.slug
                                                                    ? "font-semibold text-stone-900"
                                                                    : "text-stone-500"
                                                            }
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

                        <div className="mt-8">
                            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-stone-500">
                                Sort
                            </h2>
                            <select
                                value={filters.sort ?? ""}
                                onChange={(e) =>
                                    applyFilter({ sort: e.target.value })
                                }
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            >
                                <option value="">Featured</option>
                                <option value="newest">Newest</option>
                                <option value="price_asc">
                                    Price: Low to High
                                </option>
                                <option value="price_desc">
                                    Price: High to Low
                                </option>
                            </select>
                        </div>
                    </aside>

                    <div className="lg:col-span-3">
                        {products.data.length === 0 ? (
                            <p className="text-stone-500">No products found.</p>
                        ) : (
                            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
                                {products.data.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                    />
                                ))}
                            </div>
                        )}

                        {products.last_page > 1 && (
                            <div className="mt-10 flex flex-wrap gap-2">
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
                                        className={`rounded-sm border px-3 py-1 text-sm ${
                                            link.active
                                                ? "border-stone-900 bg-stone-900 text-white"
                                                : "border-stone-300 text-stone-700"
                                        } disabled:opacity-40`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
