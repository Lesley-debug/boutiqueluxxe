import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, ChevronRight, Share2, Check } from "lucide-react";
import ProductCard from "@/components/Store/ProductCard";
import StoreLayout from "@/components/Store/StoreLayout";
import { formatPrice } from "@/lib/format";
import type { Product, ProductVariant } from "@/types/catalog";

interface ProductDetailProps {
    product: Product;
    related: Product[];
}

export default function ProductDetail({ product, related }: ProductDetailProps) {
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        product.variants[0]?.id ?? null,
    );
    const [quantity, setQuantity] = useState(1);
    const [wishlisted, setWishlisted] = useState(!!product.is_wishlisted);
    const [addedToCart, setAddedToCart] = useState(false);
    const [adding, setAdding] = useState(false);

    const colors = useMemo(
        () => [...new Set(product.variants.map((v) => v.color).filter(Boolean))],
        [product.variants],
    );
    const sizes = useMemo(
        () => [...new Set(product.variants.map((v) => v.size).filter(Boolean))],
        [product.variants],
    );

    const selectedVariant: ProductVariant | undefined = product.variants.find(
        (v) => v.id === selectedVariantId,
    );
    const inStock = (selectedVariant?.stock_quantity ?? 0) > 0;
    const price = product.sale_price ?? product.base_price;

    function pickByAttribute(color?: string | null, size?: string | null) {
        const match = product.variants.find(
            (v) =>
                (color === undefined || v.color === color) &&
                (size === undefined || v.size === size),
        );
        if (match) setSelectedVariantId(match.id);
    }

    function handleAddToCart() {
        if (!selectedVariant || !inStock || adding) return;
        setAdding(true);
        router.post(
            "/cart/items",
            { variant_id: selectedVariant.id, quantity },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddedToCart(true);
                    setAdding(false);
                    setTimeout(() => setAddedToCart(false), 3000);
                },
                onError: () => setAdding(false),
            },
        );
    }

    function toggleWishlist() {
        const next = !wishlisted;
        setWishlisted(next);
        if (wishlisted) {
            router.delete(`/account/wishlist/${product.id}`, {
                preserveScroll: true,
                onError: () => setWishlisted(true),
            });
        } else {
            router.post(
                "/account/wishlist",
                { product_id: product.id },
                {
                    preserveScroll: true,
                    onError: () => setWishlisted(false),
                },
            );
        }
    }

    function prevImage() {
        setActiveImage((i) => (i - 1 + product.images.length) % product.images.length);
    }
    function nextImage() {
        setActiveImage((i) => (i + 1) % product.images.length);
    }

    return (
        <StoreLayout>
            <Head title={product.name} />

            {/* ── Mobile Layout ── */}
            <div className="lg:hidden">
                {/* Back nav */}
                <div className="flex items-center gap-3 border-b border-[#171310]/8 bg-white px-4 py-3">
                    <button
                        onClick={() => window.history.back()}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F8F5EF]"
                    >
                        <ChevronLeft size={17} color="#171310" strokeWidth={2} />
                    </button>
                    <span className="flex-1 truncate text-center text-sm font-medium text-[#171310]">
                        {product.name}
                    </span>
                    <button
                        onClick={toggleWishlist}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F8F5EF]"
                    >
                        <Heart
                            size={16}
                            fill={wishlisted ? "#9C7A3C" : "none"}
                            color={wishlisted ? "#9C7A3C" : "#171310"}
                            strokeWidth={1.8}
                        />
                    </button>
                </div>
                {/* Full-bleed image with swipe navigation */}
                <div className="relative bg-[#F0EBE3]">
                    <div className="relative aspect-[4/5] overflow-hidden">
                        {product.images[activeImage] && (
                            <img
                                key={activeImage}
                                src={product.images[activeImage].url}
                                alt={product.images[activeImage].alt_text ?? product.name}
                                className="h-full w-full object-cover transition-opacity duration-300"
                            />
                        )}

                        {/* Navigation arrows */}
                        {product.images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm"
                                >
                                    <ChevronLeft size={16} color="#171310" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm"
                                >
                                    <ChevronRight size={16} color="#171310" />
                                </button>
                            </>
                        )}

                        {/* Image dots */}
                        {product.images.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                                {product.images.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImage(i)}
                                        className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-5 bg-[#9C7A3C]" : "w-1.5 bg-white/60"}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Floating action buttons removed — wishlist is in top bar */}

                        {/* New badge */}
                        {product.new_arrival && (
                            <span className="absolute left-3 top-3 rounded-full bg-[#171310] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
                                New
                            </span>
                        )}
                    </div>
                </div> {/* end bg-[#F0EBE3] wrapper */}

                {/* Product info card */}
                <div className="rounded-t-3xl bg-white px-5 pt-5 pb-6 -mt-4 relative z-10 shadow-[0_-4px_24px_-4px_rgba(23,19,16,0.08)]">
                    {/* Brand + name + price */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                            {product.brand && (
                                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">
                                    {product.brand}
                                </p>
                            )}
                            <h1 className="mt-0.5 font-serif text-xl font-medium leading-tight text-[#171310]">
                                {product.name}
                            </h1>
                        </div>
                        <div className="flex-shrink-0 text-right">
                            <p className="font-serif text-xl font-semibold text-[#171310]">
                                {formatPrice(price)}
                            </p>
                            {product.sale_price && (
                                <p className="text-xs text-[#252525]/35 line-through">
                                    {formatPrice(product.base_price)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Stock status */}
                    <div className="mt-3 flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`} />
                        <span className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${inStock ? "text-green-600" : "text-red-500"}`}>
                            {inStock ? "In Stock" : "Out of Stock"}
                        </span>
                    </div>

                    {/* Color selector */}
                    {colors.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#252525]/50">
                                Color — <span className="text-[#171310]">{selectedVariant?.color ?? ""}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {colors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => pickByAttribute(color, selectedVariant?.size)}
                                        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                                            selectedVariant?.color === color
                                                ? "border-[#171310] bg-[#171310] text-white"
                                                : "border-[#171310]/15 text-[#171310]"
                                        }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size selector */}
                    {sizes.length > 0 && (
                        <div className="mt-4">
                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#252525]/50">
                                Size — <span className="text-[#171310]">{selectedVariant?.size ?? ""}</span>
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => pickByAttribute(selectedVariant?.color, size)}
                                        className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                                            selectedVariant?.size === size
                                                ? "border-[#171310] bg-[#171310] text-white"
                                                : "border-[#171310]/15 text-[#171310]"
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {product.description && (
                        <p className="mt-4 text-[12px] leading-relaxed text-[#252525]/60">
                            {product.description}
                        </p>
                    )}

                    {/* Quantity + Add to cart */}
                    <div className="mt-5 flex items-center gap-3">
                        <div className="flex items-center rounded-xl border border-[#171310]/12 bg-[#F8F5EF]">
                            <button
                                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                className="flex h-10 w-10 items-center justify-center text-[#171310] transition active:bg-[#171310]/5"
                            >
                                <Minus size={14} strokeWidth={2} />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-[#171310]">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                                className="flex h-10 w-10 items-center justify-center text-[#171310] transition active:bg-[#171310]/5"
                            >
                                <Plus size={14} strokeWidth={2} />
                            </button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={!inStock || adding}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-[11px] font-semibold uppercase tracking-[0.15em] shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 disabled:opacity-40 ${
                                addedToCart
                                    ? "bg-green-600 text-white"
                                    : "bg-[#171310] text-white hover:bg-[#9C7A3C]"
                            }`}
                        >
                            {addedToCart ? (
                                <><Check size={14} strokeWidth={2.5} /> Added</>
                            ) : (
                                <><ShoppingBag size={14} strokeWidth={2} /> Add to Bag</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Desktop Layout ── */}
            <div className="hidden lg:block">
                <div className="mx-auto max-w-7xl px-8 py-16 lg:px-12">
                    {/* Back */}
                    <button
                        onClick={() => window.history.back()}
                        className="mb-8 inline-flex items-center gap-1.5 text-sm text-[#252525]/45 transition hover:text-[#171310]"
                    >
                        <ChevronLeft size={15} strokeWidth={2} />
                        Back
                    </button>
                    <div className="grid grid-cols-2 gap-16">
                        {/* Gallery */}
                        <div className="space-y-4">
                            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#171310]/[0.05] bg-[#F0EBE3]">
                                {product.images[activeImage] && (
                                    <img
                                        key={activeImage}
                                        src={product.images[activeImage].url}
                                        alt={product.images[activeImage].alt_text ?? product.name}
                                        className="h-full w-full object-cover transition-opacity duration-300"
                                    />
                                )}
                                {product.new_arrival && (
                                    <span className="absolute left-4 top-4 rounded-full bg-[#171310] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
                                        New Arrival
                                    </span>
                                )}
                            </div>
                            {product.images.length > 1 && (
                                <div className="flex gap-3">
                                    {product.images.map((img, i) => (
                                        <button
                                            key={img.id}
                                            onClick={() => setActiveImage(i)}
                                            className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition duration-300 ${
                                                i === activeImage
                                                    ? "border-[#9C7A3C]"
                                                    : "border-transparent opacity-60 hover:opacity-100"
                                            }`}
                                        >
                                            <img src={img.url} alt="" className="h-full w-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-col justify-center">
                            {product.brand && (
                                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9C7A3C]">
                                    {product.brand}
                                </p>
                            )}
                            <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight text-[#171310]">
                                {product.name}
                            </h1>

                            <div className="mt-4 flex items-baseline gap-3">
                                <span className="font-serif text-3xl font-medium text-[#171310]">
                                    {formatPrice(price)}
                                </span>
                                {product.sale_price && (
                                    <span className="text-sm text-[#252525]/30 line-through">
                                        {formatPrice(product.base_price)}
                                    </span>
                                )}
                            </div>

                            <div className="mt-3 flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${inStock ? "bg-green-500" : "bg-red-400"}`} />
                                <span className={`text-[11px] font-semibold uppercase tracking-[0.15em] ${inStock ? "text-green-600" : "text-red-500"}`}>
                                    {inStock ? "In Stock" : "Out of Stock"}
                                </span>
                            </div>

                            {product.description && (
                                <p className="mt-6 text-sm leading-relaxed text-[#252525]/65 border-t border-[#171310]/8 pt-6">
                                    {product.description}
                                </p>
                            )}

                            {colors.length > 0 && (
                                <div className="mt-6">
                                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#252525]/50">
                                        Color — <span className="text-[#171310]">{selectedVariant?.color}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {colors.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => pickByAttribute(color, selectedVariant?.size)}
                                                className={`rounded-full border px-5 py-2.5 text-sm transition duration-300 ${
                                                    selectedVariant?.color === color
                                                        ? "border-[#171310] bg-[#171310] text-white"
                                                        : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C]"
                                                }`}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {sizes.length > 0 && (
                                <div className="mt-5">
                                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#252525]/50">
                                        Size — <span className="text-[#171310]">{selectedVariant?.size}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map((size) => (
                                            <button
                                                key={size}
                                                onClick={() => pickByAttribute(selectedVariant?.color, size)}
                                                className={`rounded-full border px-5 py-2.5 text-sm transition duration-300 ${
                                                    selectedVariant?.size === size
                                                        ? "border-[#171310] bg-[#171310] text-white"
                                                        : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C]"
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 flex items-center gap-3">
                                {/* Quantity */}
                                <div className="flex items-center rounded-full border border-[#171310]/15">
                                    <button
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                        className="flex h-11 w-11 items-center justify-center text-[#171310] transition hover:text-[#9C7A3C]"
                                    >
                                        <Minus size={14} strokeWidth={2} />
                                    </button>
                                    <span className="w-10 text-center text-sm font-semibold text-[#171310]">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity((q) => q + 1)}
                                        className="flex h-11 w-11 items-center justify-center text-[#171310] transition hover:text-[#9C7A3C]"
                                    >
                                        <Plus size={14} strokeWidth={2} />
                                    </button>
                                </div>

                                {/* Add to cart */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!inStock || adding}
                                    className={`flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 disabled:opacity-40 ${
                                        addedToCart
                                            ? "bg-green-600 text-white"
                                            : "bg-[#171310] text-white hover:bg-[#9C7A3C]"
                                    }`}
                                >
                                    {addedToCart ? (
                                        <><Check size={14} strokeWidth={2.5} /> Added to Bag</>
                                    ) : (
                                        <><ShoppingBag size={14} strokeWidth={1.8} /> Add to Bag</>
                                    )}
                                </button>

                                {/* Wishlist */}
                                <button
                                    onClick={toggleWishlist}
                                    className={`flex h-12 w-12 items-center justify-center rounded-full border transition duration-300 ${
                                        wishlisted
                                            ? "border-[#9C7A3C] bg-[#9C7A3C]/8 text-[#9C7A3C]"
                                            : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                                    }`}
                                    title={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                                >
                                    <Heart
                                        size={18}
                                        fill={wishlisted ? "#9C7A3C" : "none"}
                                        strokeWidth={1.8}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Related products */}
                    {related.length > 0 && (
                        <div className="mt-24 border-t border-[#171310]/8 pt-16">
                            <div className="mb-10 flex items-end justify-between">
                                <h2 className="font-serif text-3xl font-medium text-[#171310]">
                                    You may also like
                                </h2>
                            </div>
                            <div className="grid grid-cols-4 gap-6">
                                {related.map((p) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile related products */}
            {related.length > 0 && (
                <div className="mt-8 lg:hidden px-4 pb-6">
                    <h2 className="mb-4 font-serif text-lg font-medium text-[#171310]">You may also like</h2>
                    <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-1">
                        {related.map((p) => (
                            <div key={p.id} className="w-40 flex-shrink-0">
                                <ProductCard product={p} />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </StoreLayout>
    );
}
