import { Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Heart } from "lucide-react";

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        slug: string;
        brand?: string | null;
        base_price: string;
        sale_price: string | null;
        new_arrival?: boolean;
        images: { url: string }[];
        variants?: { stock_quantity: number }[];
        is_wishlisted?: boolean;
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const { auth } = usePage().props;
    const price = product.sale_price ?? product.base_price;
    const primary = product.images[0];
    const inStock = product.variants
        ? product.variants.some((v) => v.stock_quantity > 0)
        : true;

    // Optimistic local state — updates instantly on click without waiting for server
    const [wishlisted, setWishlisted] = useState(!!product.is_wishlisted);
    const [message, setMessage] = useState<string | null>(null);

    function toggleWishlist(e: React.MouseEvent) {
        e.preventDefault();
        if (!auth.user) {
            router.visit("/login");
            return;
        }

        const next = !wishlisted;
        setWishlisted(next);
        setMessage(next ? "Added to wishlist ♥" : "Removed from wishlist");
        setTimeout(() => setMessage(null), 2500);

        if (wishlisted) {
            router.delete(`/account/wishlist/${product.id}`, {
                preserveScroll: true,
                preserveState: true,
                onError: () => {
                    setWishlisted(true); // revert on error
                    setMessage(null);
                },
            });
        } else {
            router.post(
                "/account/wishlist",
                { product_id: product.id },
                {
                    preserveScroll: true,
                    preserveState: true,
                    onError: () => {
                        setWishlisted(false); // revert on error
                        setMessage(null);
                    },
                },
            );
        }
    }

    return (
        <Link href={`/products/${product.slug}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] border border-[#171310]/[0.06] bg-[#F8F5EF] transition-all duration-500 group-hover:shadow-[0_24px_48px_-24px_rgba(23,19,16,0.3)]">
                {primary && (
                    <img
                        src={primary.url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                )}
                {product.new_arrival && (
                    <span className="absolute left-3 top-3 rounded-full bg-[#171310] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white sm:left-4 sm:top-4">
                        New
                    </span>
                )}
                <button
                    onClick={toggleWishlist}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#171310] shadow-sm transition hover:bg-white sm:right-4 sm:top-4"
                >
                    <Heart
                        size={15}
                        fill={wishlisted ? "#9C7A3C" : "none"}
                        color={wishlisted ? "#9C7A3C" : "currentColor"}
                    />
                </button>

                {/* Toast message */}
                {message && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#171310]/90 px-3 py-1.5 text-[10px] font-medium text-white shadow-lg">
                        {message}
                    </div>
                )}

                {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#F8F5EF]/80">
                        <span className="rounded-full bg-[#171310] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>
            <div className="mt-3 space-y-1 sm:mt-4">
                {product.brand && (
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#171310]/40 sm:text-[10px]">
                        {product.brand}
                    </p>
                )}
                <p className="text-xs text-[#171310] transition group-hover:text-[#9C7A3C] sm:text-sm">
                    {product.name}
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-xs font-semibold text-[#171310] sm:text-sm">
                        ${Number(price).toLocaleString()}
                    </span>
                    {product.sale_price && (
                        <span className="text-[10px] text-[#252525]/35 line-through sm:text-xs">
                            ${Number(product.base_price).toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
