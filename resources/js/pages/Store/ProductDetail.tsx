import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import ProductCard from "@/components/Store/ProductCard";
import StoreLayout from "@/components/Store/StoreLayout";
import type { Product, ProductVariant } from "@/types/catalog";

interface ProductDetailProps {
    product: Product;
    related: Product[];
}

export default function ProductDetail({
    product,
    related,
}: ProductDetailProps) {
    const [activeImage, setActiveImage] = useState(0);
    const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
        product.variants[0]?.id ?? null,
    );
    const [quantity, setQuantity] = useState(1);
    const [wishlisted, setWishlisted] = useState(false);
    const [addedMessage, setAddedMessage] = useState<string | null>(null);

    const colors = useMemo(
        () => [
            ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
        ],
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
        if (!selectedVariant || !inStock) return;

        router.post(
            "/cart/items",
            {
                variant_id: selectedVariant.id,
                quantity,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAddedMessage(
                        `Added ${quantity} × ${product.name} to cart.`,
                    );
                    setTimeout(() => setAddedMessage(null), 3000);
                },
                onError: () => {
                    setAddedMessage(
                        "Could not add to cart — check stock availability.",
                    );
                },
            },
        );
    }

    function toggleWishlist() {
        if (wishlisted) {
            router.delete(`/account/wishlist/${product.id}`, {
                preserveScroll: true,
                onSuccess: () => setWishlisted(false),
            });
        } else {
            router.post(
                "/account/wishlist",
                { product_id: product.id },
                {
                    preserveScroll: true,
                    onSuccess: () => setWishlisted(true),
                },
            );
        }
    }

    return (
        <StoreLayout>
            <Head title={product.name} />
            <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:px-8">
                <div className="grid grid-cols-1 gap-14 lg:grid-cols-2">
                    {/* Gallery */}
                    <div>
                        <div className="aspect-square overflow-hidden rounded-[2px] border border-[#171310]/[0.06] bg-[#F8F5EF]">
                            {product.images[activeImage] && (
                                <img
                                    src={product.images[activeImage].url}
                                    alt={
                                        product.images[activeImage].alt_text ??
                                        product.name
                                    }
                                    className="h-full w-full object-cover"
                                />
                            )}
                        </div>
                        {product.images.length > 1 && (
                            <div className="mt-4 flex gap-3">
                                {product.images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(i)}
                                        className={`h-20 w-20 overflow-hidden rounded-[2px] border-2 transition duration-300 ${
                                            i === activeImage
                                                ? "border-[#9C7A3C]"
                                                : "border-transparent hover:border-[#171310]/20"
                                        }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        {product.brand && (
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#171310]/40">
                                {product.brand}
                            </p>
                        )}
                        <h1 className="mt-2 font-serif text-3xl font-medium tracking-tight text-[#171310] md:text-4xl">
                            {product.name}
                        </h1>

                        <div className="mt-4 flex items-baseline gap-3">
                            <span className="text-2xl font-semibold text-[#171310]">
                                {Number(price).toLocaleString()} FCFA
                            </span>
                            {product.sale_price && (
                                <span className="text-sm text-[#252525]/35 line-through">
                                    {Number(
                                        product.base_price,
                                    ).toLocaleString()}{" "}
                                    FCFA
                                </span>
                            )}
                        </div>

                        {product.description && (
                            <p className="mt-6 text-base leading-relaxed text-[#252525]/70">
                                {product.description}
                            </p>
                        )}

                        {colors.length > 0 && (
                            <div className="mt-8">
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#171310]">
                                    Color
                                </p>
                                <div className="flex gap-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() =>
                                                pickByAttribute(
                                                    color,
                                                    selectedVariant?.size,
                                                )
                                            }
                                            className={`rounded-full border px-5 py-2.5 text-sm transition duration-300 ${
                                                selectedVariant?.color === color
                                                    ? "border-[#171310] bg-[#171310] text-white"
                                                    : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {sizes.length > 0 && (
                            <div className="mt-6">
                                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#171310]">
                                    Size
                                </p>
                                <div className="flex gap-2">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() =>
                                                pickByAttribute(
                                                    selectedVariant?.color,
                                                    size,
                                                )
                                            }
                                            className={`rounded-full border px-5 py-2.5 text-sm transition duration-300 ${
                                                selectedVariant?.size === size
                                                    ? "border-[#171310] bg-[#171310] text-white"
                                                    : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p
                            className={`mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] ${inStock ? "text-green-700" : "text-red-600"}`}
                        >
                            {inStock ? "In stock" : "Out of stock"}
                        </p>

                        <div className="mt-8 flex items-center gap-3">
                            <div className="flex items-center rounded-full border border-[#171310]/15">
                                <button
                                    onClick={() =>
                                        setQuantity((q) => Math.max(1, q - 1))
                                    }
                                    className="px-4 py-3 text-[#171310] transition hover:text-[#9C7A3C]"
                                >
                                    −
                                </button>
                                <span className="w-10 text-center text-sm font-medium text-[#171310]">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="px-4 py-3 text-[#171310] transition hover:text-[#9C7A3C]"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                className="flex-1 rounded-full bg-[#171310] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C] disabled:opacity-40"
                            >
                                Add to Cart
                            </button>

                            <button
                                onClick={toggleWishlist}
                                className={`rounded-full border px-5 py-4 text-lg transition duration-300 ${
                                    wishlisted
                                        ? "border-[#9C7A3C] bg-[#9C7A3C]/5 text-[#9C7A3C]"
                                        : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                                }`}
                                title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                {wishlisted ? "♥" : "♡"}
                            </button>
                        </div>

                        {addedMessage && (
                            <p className="mt-4 text-sm text-green-700">
                                {addedMessage}
                            </p>
                        )}
                    </div>
                </div>

                {related.length > 0 && (
                    <div className="mt-24 border-t border-[#171310]/10 pt-20">
                        <h2 className="mb-10 font-serif text-3xl font-medium tracking-tight text-[#171310]">
                            You may also like
                        </h2>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-14 sm:grid-cols-4">
                            {related.map((p) => (
                                <ProductCard key={p.id} product={p} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
