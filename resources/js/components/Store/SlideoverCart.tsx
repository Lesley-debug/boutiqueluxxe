import { Fragment } from 'react';
import { Link, router } from '@inertiajs/react';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { Cart } from '@/types/cart';

interface SlideoverCartProps {
    cart: Cart;
    isOpen: boolean;
    onClose: () => void;
}

export default function SlideoverCart({ cart, isOpen, onClose }: SlideoverCartProps) {
    function updateQuantity(itemId: number, quantity: number) {
        if (quantity < 1) return;
        router.patch(
            `/cart/items/${itemId}`,
            { quantity },
            { preserveScroll: true, preserveState: true }
        );
    }

    function removeItem(itemId: number) {
        router.delete(`/cart/items/${itemId}`, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-[#171310]/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
                }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Slideover Panel */}
            <div
                className={`fixed right-0 top-0 z-50 h-full w-full bg-white shadow-2xl transition-transform duration-500 ease-out sm:w-[480px] ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#171310]/10 px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full bg-[#F8F5EF] p-2">
                                <ShoppingBag className="h-5 w-5 text-[#9C7A3C]" />
                            </div>
                            <div>
                                <h2 className="font-serif text-xl font-medium text-[#171310]">
                                    Shopping Bag
                                </h2>
                                <p className="text-xs text-[#252525]/60">
                                    {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-[#171310] transition hover:bg-[#F8F5EF]"
                            aria-label="Close cart"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Cart Items */}
                    {cart.items.length === 0 ? (
                        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                            <div className="mb-4 rounded-full bg-[#F8F5EF] p-6">
                                <ShoppingBag className="h-12 w-12 text-[#171310]/30" />
                            </div>
                            <p className="mb-2 font-serif text-lg text-[#171310]">
                                Your bag is empty
                            </p>
                            <p className="mb-6 text-sm text-[#252525]/60">
                                Add items to get started
                            </p>
                            <button
                                onClick={onClose}
                                className="rounded-full bg-[#171310] px-8 py-3 text-sm font-medium uppercase tracking-[0.1em] text-white transition hover:bg-[#9C7A3C]"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto px-6 py-6">
                                <div className="space-y-6">
                                    {cart.items.map((item) => {
                                        const primary = item.variant.product.images?.[0];
                                        const label = [
                                            item.variant.color,
                                            item.variant.size,
                                            item.variant.material,
                                        ]
                                            .filter(Boolean)
                                            .join(' / ');

                                        return (
                                            <div
                                                key={item.id}
                                                className="group flex gap-4 rounded-[2px] border border-[#171310]/5 bg-[#F8F5EF]/30 p-4 transition-all hover:border-[#171310]/10 hover:shadow-sm"
                                            >
                                                {/* Product Image */}
                                                <Link
                                                    href={`/products/${item.variant.product.slug}`}
                                                    className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-[2px] bg-white"
                                                    onClick={onClose}
                                                >
                                                    {primary ? (
                                                        <img
                                                            src={primary.url}
                                                            alt={item.variant.product.name}
                                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <ShoppingBag className="h-8 w-8 text-[#171310]/20" />
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Product Details */}
                                                <div className="flex flex-1 flex-col">
                                                    <Link
                                                        href={`/products/${item.variant.product.slug}`}
                                                        className="font-serif text-sm font-medium text-[#171310] transition hover:text-[#9C7A3C]"
                                                        onClick={onClose}
                                                    >
                                                        {item.variant.product.name}
                                                    </Link>
                                                    {label && (
                                                        <p className="mt-1 text-xs text-[#252525]/60">
                                                            {label}
                                                        </p>
                                                    )}
                                                    <p className="mt-1 text-xs text-[#252525]/40">
                                                        SKU: {item.variant.sku}
                                                    </p>

                                                    <div className="mt-3 flex items-center justify-between">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-1 rounded-full border border-[#171310]/15 bg-white">
                                                            <button
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.id,
                                                                        item.quantity - 1
                                                                    )
                                                                }
                                                                className="rounded-full p-1.5 text-[#171310] transition hover:bg-[#F8F5EF]"
                                                                aria-label="Decrease quantity"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm font-medium text-[#171310]">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    updateQuantity(
                                                                        item.id,
                                                                        item.quantity + 1
                                                                    )
                                                                }
                                                                className="rounded-full p-1.5 text-[#171310] transition hover:bg-[#F8F5EF]"
                                                                aria-label="Increase quantity"
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </button>
                                                        </div>

                                                        {/* Price & Remove */}
                                                        <div className="flex items-center gap-3">
                                                            <p className="text-sm font-medium text-[#171310]">
                                                                {formatPrice(item.line_total)}
                                                            </p>
                                                            <button
                                                                onClick={() => removeItem(item.id)}
                                                                className="rounded-full p-1.5 text-[#252525]/40 transition hover:bg-red-50 hover:text-red-600"
                                                                aria-label="Remove item"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Footer with Totals & Actions */}
                            <div className="border-t border-[#171310]/10 bg-[#F8F5EF] px-6 py-6">
                                {/* Discount Info */}
                                {cart.discount && (
                                    <div className="mb-4 flex items-center justify-between rounded-[2px] border border-[#9C7A3C]/20 bg-[#9C7A3C]/5 px-4 py-2.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#9C7A3C]">
                                                {cart.discount.code}
                                            </span>
                                            <span className="text-xs text-[#252525]/60">
                                                Applied
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-[#9C7A3C]">
                                            −{formatPrice(cart.discount_amount)}
                                        </span>
                                    </div>
                                )}

                                {/* Subtotal */}
                                <div className="mb-3 flex items-center justify-between text-sm">
                                    <span className="text-[#252525]/70">Subtotal</span>
                                    <span className="font-medium text-[#171310]">
                                        {formatPrice(cart.subtotal)}
                                    </span>
                                </div>

                                {/* Total */}
                                <div className="mb-6 flex items-center justify-between border-t border-[#171310]/10 pt-3">
                                    <span className="font-serif text-lg font-medium text-[#171310]">
                                        Total
                                    </span>
                                    <span className="font-serif text-xl font-medium text-[#171310]">
                                        {formatPrice(cart.total)}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-3">
                                    <Link
                                        href="/checkout"
                                        onClick={onClose}
                                        className="block w-full rounded-full bg-[#171310] py-3.5 text-center text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C]"
                                    >
                                        Proceed to Checkout
                                    </Link>
                                    <Link
                                        href="/cart"
                                        onClick={onClose}
                                        className="block w-full rounded-full border border-[#171310]/20 py-3.5 text-center text-sm font-medium uppercase tracking-[0.1em] text-[#171310] transition hover:border-[#171310] hover:bg-white"
                                    >
                                        View Full Cart
                                    </Link>
                                </div>

                                {/* Free Shipping Notice */}
                                <p className="mt-4 text-center text-xs text-[#252525]/50">
                                    Complimentary shipping on selected orders
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
