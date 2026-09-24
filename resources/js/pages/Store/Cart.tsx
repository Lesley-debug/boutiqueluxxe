import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import {
    ArrowRight,
    CheckCircle,
    ChevronLeft,
    Minus,
    Plus,
    ShoppingBag,
    Tag,
    Trash2,
} from 'lucide-react';
import StoreLayout from '@/components/Store/StoreLayout';
import Reveal from '@/components/Store/Reveal';
import { formatPrice } from '@/lib/format';
import type { Cart, CartItem } from '@/types/cart';

function itemLabel(item: CartItem) {
    return [item.variant.color, item.variant.size, item.variant.material]
        .filter(Boolean)
        .join(' / ');
}

function itemPrimaryImage(item: CartItem) {
    return item.variant.product.images?.[0];
}

export default function CartPage({ cart }: { cart: Cart }) {
    const { data, setData, post, processing, errors, reset } = useForm({ code: '' });

    function updateQuantity(itemId: number, quantity: number) {
        if (quantity < 1) return;
        router.patch(`/cart/items/${itemId}`, { quantity }, { preserveScroll: true });
    }

    function removeItem(itemId: number) {
        router.delete(`/cart/items/${itemId}`, { preserveScroll: true });
    }

    function applyDiscount(e: FormEvent) {
        e.preventDefault();
        post('/cart/discount', { preserveScroll: true, onSuccess: () => reset() });
    }

    function removeDiscount() {
        router.delete('/cart/discount', { preserveScroll: true });
    }

    return (
        <StoreLayout showMobileHeader>
            <Head title="Shopping Bag" />

            <div className="lg:hidden">
                {cart.items.length === 0 ? (
                    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pb-24 text-center">
                        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                            <ShoppingBag className="h-7 w-7 text-[#171310]/25" />
                        </div>
                        <h2 className="font-serif text-2xl font-medium text-[#171310]">
                            Your bag is empty
                        </h2>
                        <p className="mt-2 max-w-xs text-sm leading-relaxed text-[#252525]/55">
                            Discover curated designer bags and watches selected for Boutique Luxxe.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#171310] px-7 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white shadow-[0_10px_24px_-12px_rgba(23,19,16,0.45)]"
                        >
                            Shop Collection
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="px-4 pt-4">
                            <h1 className="font-serif text-xl font-medium text-[#171310]">
                                Shopping Bag
                            </h1>
                            <p className="text-[10px] text-[#252525]/45">
                                {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'}
                            </p>
                        </div>

                        <div className="space-y-4 px-4 pb-56 pt-3">
                            {cart.items.map((item) => {
                                const primary = itemPrimaryImage(item);
                                const label = itemLabel(item);

                                return (
                                    <div
                                        key={item.id}
                                        className="relative rounded-2xl bg-white p-3 shadow-sm"
                                    >
                                        <div className="flex gap-3">
                                            <Link
                                                href={`/products/${item.variant.product.slug}`}
                                                className="h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-[#F0EBE3]"
                                            >
                                                {primary ? (
                                                    <img
                                                        src={primary.url}
                                                        alt={item.variant.product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <ShoppingBag className="h-8 w-8 text-[#171310]/20" />
                                                    </div>
                                                )}
                                            </Link>

                                            <div className="min-w-0 flex-1 pr-8">
                                                <Link
                                                    href={`/products/${item.variant.product.slug}`}
                                                    className="line-clamp-2 text-sm font-semibold leading-snug text-[#171310]"
                                                >
                                                    {item.variant.product.name}
                                                </Link>
                                                {label && (
                                                    <p className="mt-1 truncate text-xs text-[#252525]/50">
                                                        {label}
                                                    </p>
                                                )}
                                                <p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-[#252525]/35">
                                                    {item.variant.sku}
                                                </p>

                                                <div className="mt-4 flex items-center justify-between gap-2">
                                                    <div className="flex h-9 items-center rounded-full border border-[#171310]/10 bg-[#F8F5EF]">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="flex h-9 w-9 items-center justify-center text-[#171310]"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus className="h-3.5 w-3.5" />
                                                        </button>
                                                        <span className="w-7 text-center text-xs font-semibold text-[#171310]">
                                                            {item.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="flex h-9 w-9 items-center justify-center text-[#171310]"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                    <p className="font-serif text-base font-medium text-[#171310]">
                                                        {formatPrice(item.line_total)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F5EF] text-[#252525]/40"
                                            aria-label="Remove item"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                );
                            })}

                            <div className="rounded-2xl bg-white p-4 shadow-sm">
                                <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9C7A3C]">
                                    <Tag className="h-3.5 w-3.5" />
                                    Discount Code
                                </div>

                                {cart.discount ? (
                                    <div className="flex items-center justify-between rounded-xl border border-[#9C7A3C]/25 bg-[#9C7A3C]/10 px-4 py-3">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9C7A3C]">
                                                {cart.discount.code}
                                            </p>
                                            <p className="text-[10px] text-[#252525]/45">Applied</p>
                                        </div>
                                        <button
                                            onClick={removeDiscount}
                                            className="text-[10px] font-semibold uppercase tracking-[0.12em] text-red-600"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={applyDiscount} className="flex gap-2">
                                        <input
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                            placeholder="Enter code"
                                            className="min-w-0 flex-1 rounded-full border border-[#171310]/10 bg-[#F8F5EF] px-4 py-3 text-sm font-mono uppercase text-[#171310] placeholder:text-[#252525]/35 focus:border-[#9C7A3C] focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="rounded-full bg-[#171310] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-50"
                                        >
                                            Apply
                                        </button>
                                    </form>
                                )}
                                {errors.code && (
                                    <p className="mt-2 text-xs text-red-600">{errors.code}</p>
                                )}
                            </div>

                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#171310]"
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                                Continue Shopping
                            </Link>
                        </div>

                        <div
                            className="fixed inset-x-0 z-30 px-4 lg:hidden"
                            style={{ bottom: 'calc(4.75rem + env(safe-area-inset-bottom))' }}
                        >
                            <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF]/95 p-3 shadow-[0_20px_50px_-20px_rgba(23,19,16,0.35)] backdrop-blur-sm">
                                {cart.discount_amount > 0 && (
                                    <div className="mb-2 flex items-center justify-between px-1 text-[11px]">
                                        <span className="text-[#252525]/55">Discount</span>
                                        <span className="font-medium text-[#9C7A3C]">
                                            -{formatPrice(cart.discount_amount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#252525]/45">
                                            Total
                                        </p>
                                        <p className="font-serif text-xl font-semibold text-[#171310]">
                                            {formatPrice(cart.total)}
                                        </p>
                                    </div>
                                    <Link
                                        href="/checkout"
                                        className="inline-flex h-12 items-center gap-2 rounded-full bg-[#171310] px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_-12px_rgba(23,19,16,0.55)]"
                                    >
                                        Checkout
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="hidden lg:block">
                <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
                    <Reveal>
                        <div className="mb-12 text-center">
                            <h1 className="font-serif text-4xl font-medium tracking-tight text-[#171310] md:text-5xl">
                                Shopping Bag
                            </h1>
                            <p className="mt-3 text-sm text-[#252525]/60">
                                {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'} in your bag
                            </p>
                        </div>
                    </Reveal>

                    {cart.items.length === 0 ? (
                        <Reveal delay={100}>
                            <div className="mx-auto max-w-md rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-12 text-center">
                                <div className="mb-6 flex justify-center">
                                    <div className="rounded-full bg-white p-6 shadow-sm">
                                        <ShoppingBag className="h-12 w-12 text-[#171310]/30" />
                                    </div>
                                </div>
                                <h2 className="mb-2 font-serif text-xl font-medium text-[#171310]">
                                    Your bag is empty
                                </h2>
                                <p className="mb-8 text-sm text-[#252525]/60">
                                    Discover our curated collection of luxury designer bags
                                </p>
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center gap-2 rounded-full bg-[#171310] px-8 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C]"
                                >
                                    <span>Shop Collection</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </Reveal>
                    ) : (
                        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                            <div className="lg:col-span-2">
                                <div className="space-y-6">
                                    {cart.items.map((item, index) => {
                                        const primary = itemPrimaryImage(item);
                                        const label = itemLabel(item);

                                        return (
                                            <Reveal key={item.id} delay={index * 60}>
                                                <div className="group relative overflow-hidden rounded-[2px] border border-[#171310]/10 bg-white p-6 transition-all duration-300 hover:shadow-[0_16px_32px_-16px_rgba(23,19,16,0.12)]">
                                                    <div className="flex gap-6">
                                                        <Link
                                                            href={`/products/${item.variant.product.slug}`}
                                                            className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-[2px] bg-[#F8F5EF]"
                                                        >
                                                            {primary ? (
                                                                <img
                                                                    src={primary.url}
                                                                    alt={item.variant.product.name}
                                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                                />
                                                            ) : (
                                                                <div className="flex h-full w-full items-center justify-center">
                                                                    <ShoppingBag className="h-12 w-12 text-[#171310]/20" />
                                                                </div>
                                                            )}
                                                        </Link>

                                                        <div className="flex flex-1 flex-col">
                                                            <Link
                                                                href={`/products/${item.variant.product.slug}`}
                                                                className="font-serif text-lg font-medium text-[#171310] transition hover:text-[#9C7A3C]"
                                                            >
                                                                {item.variant.product.name}
                                                            </Link>
                                                            {label && (
                                                                <p className="mt-2 text-sm text-[#252525]/60">{label}</p>
                                                            )}
                                                            <p className="mt-1 text-xs text-[#252525]/40">
                                                                SKU: {item.variant.sku}
                                                            </p>

                                                            <div className="mt-6 flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#252525]/60">
                                                                        Qty
                                                                    </span>
                                                                    <div className="flex items-center gap-1 rounded-full border border-[#171310]/15 bg-[#F8F5EF]">
                                                                        <button
                                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                                            className="rounded-full p-2 text-[#171310] transition hover:bg-white"
                                                                            aria-label="Decrease quantity"
                                                                        >
                                                                            <Minus className="h-3.5 w-3.5" />
                                                                        </button>
                                                                        <span className="w-10 text-center text-sm font-medium text-[#171310]">
                                                                            {item.quantity}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                                            className="rounded-full p-2 text-[#171310] transition hover:bg-white"
                                                                            aria-label="Increase quantity"
                                                                        >
                                                                            <Plus className="h-3.5 w-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>

                                                                <div className="text-right">
                                                                    <p className="font-serif text-lg font-medium text-[#171310]">
                                                                        {formatPrice(item.line_total)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="absolute right-4 top-4 rounded-full p-2 text-[#252525]/30 transition hover:bg-red-50 hover:text-red-600"
                                                            aria-label="Remove item"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </Reveal>
                                        );
                                    })}
                                </div>

                                <Reveal delay={cart.items.length * 60 + 100}>
                                    <div className="mt-8">
                                        <Link
                                            href="/shop"
                                            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.1em] text-[#171310] transition hover:text-[#9C7A3C]"
                                        >
                                            <ArrowRight className="h-4 w-4 rotate-180" />
                                            <span>Continue Shopping</span>
                                        </Link>
                                    </div>
                                </Reveal>
                            </div>

                            <div className="lg:col-span-1">
                                <Reveal delay={200}>
                                    <div className="sticky top-24 rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-8">
                                        <h2 className="mb-6 font-serif text-xl font-medium text-[#171310]">
                                            Order Summary
                                        </h2>

                                        <div className="mb-6">
                                            <label className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-[#252525]/60">
                                                <Tag className="h-3.5 w-3.5" />
                                                <span>Discount Code</span>
                                            </label>

                                            {cart.discount ? (
                                                <div className="flex items-center justify-between rounded-full border border-[#9C7A3C]/30 bg-[#9C7A3C]/10 px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-semibold uppercase tracking-[0.1em] text-[#9C7A3C]">
                                                            {cart.discount.code}
                                                        </span>
                                                        <span className="text-xs text-[#252525]/50">Applied</span>
                                                    </div>
                                                    <button
                                                        onClick={removeDiscount}
                                                        className="text-xs font-medium uppercase tracking-[0.1em] text-red-600 transition hover:text-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <form onSubmit={applyDiscount} className="flex gap-2">
                                                    <input
                                                        value={data.code}
                                                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                                        placeholder="Enter code"
                                                        className="flex-1 rounded-full border border-[#171310]/15 bg-white px-4 py-2.5 text-sm font-mono uppercase text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={processing}
                                                        className="rounded-full border border-[#171310]/15 bg-white px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-[#171310] transition hover:border-[#171310] hover:bg-[#171310] hover:text-white disabled:opacity-50"
                                                    >
                                                        Apply
                                                    </button>
                                                </form>
                                            )}
                                            {errors.code && (
                                                <p className="mt-2 text-xs text-red-600">{errors.code}</p>
                                            )}
                                        </div>

                                        <div className="space-y-3 border-t border-[#171310]/10 pt-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[#252525]/70">Subtotal</span>
                                                <span className="font-medium text-[#171310]">
                                                    {formatPrice(cart.subtotal)}
                                                </span>
                                            </div>

                                            {cart.discount_amount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-[#9C7A3C]">Discount</span>
                                                    <span className="font-medium text-[#9C7A3C]">
                                                        -{formatPrice(cart.discount_amount)}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex justify-between border-t border-[#171310]/10 pt-4">
                                                <span className="font-serif text-lg font-medium text-[#171310]">
                                                    Total
                                                </span>
                                                <span className="font-serif text-xl font-medium text-[#171310]">
                                                    {formatPrice(cart.total)}
                                                </span>
                                            </div>
                                        </div>

                                        <Link
                                            href="/checkout"
                                            className="mt-8 block w-full rounded-full bg-[#171310] py-4 text-center text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C]"
                                        >
                                            Proceed to Checkout
                                        </Link>

                                        <div className="mt-6 space-y-3 border-t border-[#171310]/10 pt-6">
                                            {[
                                                'Delivery details confirmed before payment',
                                                'Secure checkout with multiple payment options',
                                                'Concierge support for every order',
                                            ].map((text) => (
                                                <p
                                                    key={text}
                                                    className="flex items-start gap-2 text-xs text-[#252525]/60"
                                                >
                                                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#9C7A3C]" />
                                                    <span>{text}</span>
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StoreLayout>
    );
}
