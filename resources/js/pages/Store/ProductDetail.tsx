import { Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
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
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
                    {/* Gallery */}
                    <div>
                        <div className="aspect-square overflow-hidden rounded-sm bg-stone-100">
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
                            <div className="mt-3 flex gap-2">
                                {product.images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setActiveImage(i)}
                                        className={`h-16 w-16 overflow-hidden rounded-sm border-2 ${
                                            i === activeImage
                                                ? "border-stone-900"
                                                : "border-transparent"
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
                            <p className="text-xs uppercase tracking-wider text-stone-500">
                                {product.brand}
                            </p>
                        )}
                        <h1 className="mt-1 text-2xl font-semibold text-stone-900">
                            {product.name}
                        </h1>

                        <div className="mt-3 flex items-center gap-3">
                            <span className="text-xl font-semibold text-stone-900">
                                {Number(price).toLocaleString()} FCFA
                            </span>
                            {product.sale_price && (
                                <span className="text-sm text-stone-400 line-through">
                                    {Number(
                                        product.base_price,
                                    ).toLocaleString()}{" "}
                                    FCFA
                                </span>
                            )}
                        </div>

                        {product.description && (
                            <p className="mt-4 text-sm leading-relaxed text-stone-600">
                                {product.description}
                            </p>
                        )}

                        {colors.length > 0 && (
                            <div className="mt-6">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
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
                                            className={`rounded-sm border px-3 py-1.5 text-sm ${
                                                selectedVariant?.color === color
                                                    ? "border-stone-900 bg-stone-900 text-white"
                                                    : "border-stone-300 text-stone-700"
                                            }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {sizes.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
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
                                            className={`rounded-sm border px-3 py-1.5 text-sm ${
                                                selectedVariant?.size === size
                                                    ? "border-stone-900 bg-stone-900 text-white"
                                                    : "border-stone-300 text-stone-700"
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p
                            className={`mt-4 text-sm ${inStock ? "text-green-700" : "text-red-600"}`}
                        >
                            {inStock ? "In stock" : "Out of stock"}
                        </p>

                        <div className="mt-6 flex items-center gap-3">
                            <div className="flex items-center rounded-sm border border-stone-300">
                                <button
                                    onClick={() =>
                                        setQuantity((q) => Math.max(1, q - 1))
                                    }
                                    className="px-3 py-2 text-stone-600"
                                >
                                    −
                                </button>
                                <span className="w-8 text-center text-sm">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity((q) => q + 1)}
                                    className="px-3 py-2 text-stone-600"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                className="flex-1 rounded-sm bg-stone-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-40"
                            >
                                Add to Cart
                            </button>

                            <button
                                onClick={toggleWishlist}
                                className={`rounded-sm border px-4 py-3 text-sm ${
                                    wishlisted
                                        ? "border-stone-900 bg-stone-100"
                                        : "border-stone-300"
                                }`}
                            >
                                {wishlisted ? "♥" : "♡"}
                            </button>
                        </div>

                        {addedMessage && (
                            <p className="mt-3 text-sm text-green-700">
                                {addedMessage}
                            </p>
                        )}
                    </div>
                </div>

                {related.length > 0 && (
                    <div className="mt-16">
                        <h2 className="mb-6 text-lg font-semibold text-stone-900">
                            You may also like
                        </h2>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
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
