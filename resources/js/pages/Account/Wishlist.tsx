import { Head, Link, router } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";
import { formatPrice } from "@/lib/format";
import type { WishlistItem } from "@/types/account";

export default function Wishlist({ items }: { items: WishlistItem[] }) {
    function remove(productId: number) {
        router.delete(`/account/wishlist/${productId}`, {
            preserveScroll: true,
        });
    }

    return (
        <StoreLayout showMobileHeader>
            <Head title="My Wishlist" />

            {/* ── Mobile layout ── */}
            <div className="lg:hidden">
                <div className="px-4 pb-24 pt-4">
                    <h1 className="font-serif text-xl font-medium text-[#171310]">Wishlist</h1>
                    <p className="text-[10px] text-[#252525]/45">{items.length} {items.length === 1 ? 'piece' : 'pieces'} saved</p>

                    {items.length === 0 ? (
                        <div className="mt-12 flex flex-col items-center text-center">
                            <p className="text-sm text-[#252525]/60">Your wishlist is empty.</p>
                            <p className="mt-1 text-xs text-[#252525]/40">Discover pieces you love and save them here</p>
                            <Link
                                href="/shop"
                                className="mt-6 inline-flex items-center rounded-full bg-[#171310] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white"
                            >
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="mt-4 grid grid-cols-3 gap-2.5">
                            {items.map((item) => {
                                const price = item.product.sale_price ?? item.product.base_price;
                                const primary = item.product.images[0];
                                return (
                                    <div key={item.id} className="group">
                                        <Link href={`/products/${item.product.slug}`} className="block">
                                            <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] bg-[#F8F5EF]">
                                                {primary && (
                                                    <img
                                                        src={primary.url}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                )}
                                                <button
                                                    onClick={(e) => { e.preventDefault(); remove(item.product.id); }}
                                                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm"
                                                    aria-label="Remove from wishlist"
                                                >
                                                    <span className="text-[10px] text-red-500">✕</span>
                                                </button>
                                            </div>
                                        </Link>
                                        <div className="mt-1.5 space-y-0.5">
                                            <p className="line-clamp-2 text-[11px] leading-tight text-[#171310]">
                                                {item.product.name}
                                            </p>
                                            <div className="flex flex-wrap items-baseline gap-x-1">
                                                <span className="text-[10px] font-semibold text-[#171310]">
                                                    {formatPrice(price)}
                                                </span>
                                                {item.product.sale_price && (
                                                    <span className="text-[9px] text-[#252525]/35 line-through">
                                                        {formatPrice(item.product.base_price)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Desktop layout ── */}
            <div className="hidden lg:block">
            <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                <div className="mb-12">
                    <h1 className="font-serif text-4xl font-medium tracking-tight text-[#171310]">
                        My Wishlist
                    </h1>
                    <p className="mt-2 text-sm text-[#252525]/60">
                        Save your favorite pieces for later
                    </p>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-12 text-center">
                        <p className="text-lg text-[#252525]/60">
                            Your wishlist is empty.
                        </p>
                        <p className="mt-2 text-sm text-[#252525]/40">
                            Discover pieces you love and save them here
                        </p>
                        <Link
                            href="/shop"
                            className="mt-6 inline-flex items-center rounded-full bg-[#171310] px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:bg-[#9C7A3C]"
                        >
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
                        {items.map((item) => {
                            const price =
                                item.product.sale_price ??
                                item.product.base_price;
                            const primary = item.product.images[0];
                            return (
                                <div key={item.id} className="group">
                                    <Link
                                        href={`/products/${item.product.slug}`}
                                        className="block"
                                    >
                                        <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] border border-[#171310]/[0.06] bg-[#F8F5EF] transition-all duration-500 group-hover:shadow-[0_24px_48px_-24px_rgba(23,19,16,0.3)]">
                                            {primary && (
                                                <img
                                                    src={primary.url}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                                                />
                                            )}
                                        </div>
                                    </Link>
                                    <div className="mt-4 space-y-2">
                                        <p className="text-sm text-[#171310] transition group-hover:text-[#9C7A3C]">
                                            {item.product.name}
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-sm font-semibold text-[#171310]">
                                                {formatPrice(price)}
                                            </span>
                                            {item.product.sale_price && (
                                                <span className="text-xs text-[#252525]/35 line-through">
                                                    {formatPrice(item.product.base_price)}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => remove(item.product.id)}
                                            className="text-xs text-[#252525]/60 underline decoration-red-600 decoration-1 underline-offset-2 transition hover:text-red-600"
                                        >
                                            Remove from wishlist
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            </div>
        </StoreLayout>
    );
}
