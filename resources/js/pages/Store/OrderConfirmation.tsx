import { Head, Link } from "@inertiajs/react";
import { CheckCircle, Package, MapPin, Mail, ArrowRight, Download } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";
import Reveal from "@/components/Store/Reveal";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";


export default function OrderConfirmation({ order }: { order: Order }) {
    return (
        <StoreLayout showMobileHeader>
            <Head title="Reservation Received" />

            {/* ── Mobile layout ── */}
            <div className="lg:hidden">
                <div className="min-h-screen bg-[#F8F5EF] pb-28">

                    {/* Success hero */}
                    <div className="px-4 pb-4 pt-6 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#9C7A3C]/10">
                            <CheckCircle className="h-7 w-7 text-[#9C7A3C]" />
                        </div>
                        <h1 className="font-serif text-2xl font-medium text-[#171310]">Reservation Received</h1>
                        <p className="mt-1 text-sm text-[#252525]/60">
                            Thank you, <span className="font-medium text-[#171310]">{order.customer_name}</span>!
                        </p>
                        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#171310]/10 bg-white px-4 py-2">
                            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-[#252525]/50">Order</span>
                            <span className="font-mono text-sm font-semibold text-[#171310]">{order.order_number}</span>
                        </div>
                    </div>

                    <div className="space-y-3 px-4">

                        {/* Order items */}
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9C7A3C]">
                                <Package className="h-3.5 w-3.5" /> Items
                            </h2>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex justify-between border-b border-[#171310]/5 pb-3 last:border-0 last:pb-0">
                                        <div className="min-w-0 pr-4">
                                            <p className="text-sm font-medium text-[#171310] truncate">{item.product_name}</p>
                                            {item.variant_label && (
                                                <p className="text-xs text-[#252525]/50">{item.variant_label}</p>
                                            )}
                                            <p className="text-xs text-[#252525]/40">Qty: {item.quantity} × {formatPrice(item.unit_price)}</p>
                                        </div>
                                        <p className="flex-shrink-0 font-serif text-sm font-semibold text-[#171310]">
                                            {formatPrice(item.line_total)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-3 space-y-1.5 border-t border-[#171310]/8 pt-3">
                                <div className="flex justify-between text-xs text-[#252525]/60">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(order.subtotal)}</span>
                                </div>
                                {Number(order.discount_amount) > 0 && (
                                    <div className="flex justify-between text-xs text-[#9C7A3C]">
                                        <span>Discount {order.discount_code && `(${order.discount_code})`}</span>
                                        <span>−{formatPrice(order.discount_amount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-[#171310]/8 pt-2">
                                    <span className="font-serif text-sm font-medium text-[#171310]">Total</span>
                                    <span className="font-serif text-base font-semibold text-[#171310]">{formatPrice(order.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Delivery info */}
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <h2 className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9C7A3C]">
                                <MapPin className="h-3.5 w-3.5" />
                                Delivery Address
                            </h2>
                            <div className="space-y-0.5 text-sm">
                                    <p className="font-medium text-[#171310]">{order.customer_name}</p>
                                    <p className="text-[#252525]/60">{order.shipping_address}</p>
                                    <p className="text-[#252525]/60">{order.city}{order.region && `, ${order.region}`}</p>
                                    <p className="pt-1 text-[#252525]/60">{order.customer_phone}</p>
                                </div>
                        </div>

                        {/* Confirmation email */}
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-[#9C7A3C]" />
                                <p className="text-xs font-semibold text-[#171310]">Confirmation email</p>
                            </div>
                            <p className="mt-1 text-sm text-[#252525]/70">{order.customer_email}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                            <Link
                                href="/account/orders"
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#171310] py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_-12px_rgba(23,19,16,0.45)]"
                            >
                                Track Order <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                            <Link
                                href="/shop"
                                className="flex flex-1 items-center justify-center rounded-full border border-[#171310]/15 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#171310]"
                            >
                                Shop More
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Desktop layout ── */}
            <div className="hidden lg:block">
            <div className="min-h-screen bg-[#F8F5EF] py-16">
                <div className="mx-auto max-w-4xl px-6">
                    {/* Success Message */}
                    <Reveal>
                        <div className="mb-12 text-center">
                            <div className="mb-6 flex justify-center">
                                <div className="rounded-full bg-[#9C7A3C]/10 p-6">
                                    <CheckCircle className="h-16 w-16 text-[#9C7A3C]" />
                                </div>
                            </div>
                            <h1 className="mb-3 font-serif text-4xl font-medium text-[#171310] md:text-5xl">
                                Order Confirmed
                            </h1>
                            <p className="mb-2 text-lg text-[#252525]/70">
                                Thank you, <span className="font-medium text-[#171310]">{order.customer_name}</span>!
                            </p>
                            <p className="text-sm text-[#252525]/60">
                                We've received your reservation request. Our team will contact you shortly
                            </p>
                            
                            {/* Order Number Badge */}
                            <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-[#171310]/10 bg-white px-6 py-3">
                                <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#252525]/60">
                                    Order Number
                                </span>
                                <span className="font-mono text-lg font-semibold text-[#171310]">
                                    {order.order_number}
                                </span>
                            </div>

                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Order Details - Main Content */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Order Items */}
                            <Reveal delay={100}>
                                <div className="rounded-2xl border border-[#171310]/10 bg-white p-8">
                                    <h2 className="mb-6 flex items-center gap-2 font-serif text-xl font-medium text-[#171310]">
                                        <Package className="h-5 w-5 text-[#9C7A3C]" />
                                        <span>Order Items</span>
                                    </h2>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between border-b border-[#171310]/5 pb-4 last:border-0 last:pb-0"
                                            >
                                                <div>
                                                    <p className="font-medium text-[#171310]">
                                                        {item.product_name}
                                                    </p>
                                                    {item.variant_label && (
                                                        <p className="mt-1 text-sm text-[#252525]/60">
                                                            {item.variant_label}
                                                        </p>
                                                    )}
                                                    <p className="mt-1 text-xs text-[#252525]/40">
                                                        SKU: {item.sku}
                                                    </p>
                                                    <p className="mt-2 text-sm text-[#252525]/70">
                                                        Qty: {item.quantity} × {formatPrice(item.unit_price)}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-serif text-lg font-medium text-[#171310]">
                                                        {formatPrice(item.line_total)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Totals */}
                                    <div className="mt-6 space-y-2 border-t border-[#171310]/10 pt-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[#252525]/70">Subtotal</span>
                                            <span className="font-medium text-[#171310]">
                                                {formatPrice(order.subtotal)}
                                            </span>
                                        </div>
                                        {Number(order.discount_amount) > 0 && (
                                            <div className="flex justify-between text-sm text-[#9C7A3C]">
                                                <span>
                                                    Discount{" "}
                                                    {order.discount_code && `(${order.discount_code})`}
                                                </span>
                                                <span className="font-medium">
                                                    −{formatPrice(order.discount_amount)}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-[#171310]/10 pt-3">
                                            <span className="font-serif text-lg font-medium text-[#171310]">
                                                Total
                                            </span>
                                            <span className="font-serif text-xl font-medium text-[#171310]">
                                                {formatPrice(order.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>

                            {/* Fulfillment Information */}
                            <Reveal delay={150}>
                                <div className="rounded-2xl border border-[#171310]/10 bg-white p-8">
                                    <h2 className="mb-6 flex items-center gap-2 font-serif text-xl font-medium text-[#171310]">
                                        <MapPin className="h-5 w-5 text-[#9C7A3C]" />
                                        <span>
                                            "Delivery Address"
                                        </span>
                                    </h2>
                                    <div className="space-y-1 text-sm">
                                            <p className="font-medium text-[#171310]">{order.customer_name}</p>
                                            <p className="text-[#252525]/70">{order.shipping_address}</p>
                                            <p className="text-[#252525]/70">
                                                {order.city}{order.region && `, ${order.region}`}
                                            </p>
                                            <p className="pt-2 text-[#252525]/70">{order.customer_phone}</p>
                                        </div>
                                </div>
                            </Reveal>

                        </div>

                        {/* Sidebar - Next Steps */}
                        <div className="lg:col-span-1">
                            <Reveal delay={250}>
                                <div className="sticky top-24 space-y-6">
                                    {/* Contact Information */}
                                    <div className="rounded-2xl border border-[#171310]/10 bg-white p-6">
                                        <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-medium text-[#171310]">
                                            <Mail className="h-5 w-5 text-[#9C7A3C]" />
                                            <span>Confirmation Email</span>
                                        </h3>
                                        <p className="text-sm leading-relaxed text-[#252525]/70">
                                            Confirmation details will be sent to:
                                        </p>
                                        <p className="mt-2 font-medium text-[#171310]">
                                            {order.customer_email}
                                        </p>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-6">
                                        <h3 className="mb-4 font-serif text-lg font-medium text-[#171310]">
                                            What's Next?
                                        </h3>
                                        <div className="space-y-3">
                                            <Link
                                                href="/account/orders"
                                                className="flex items-center justify-between rounded-lg border border-[#171310]/10 bg-white p-3 text-sm transition hover:border-[#9C7A3C] hover:shadow-sm"
                                            >
                                                <span className="font-medium text-[#171310]">
                                                    Track Your Order
                                                </span>
                                                <ArrowRight className="h-4 w-4 text-[#9C7A3C]" />
                                            </Link>
                                            <Link
                                                href="/shop"
                                                className="flex items-center justify-between rounded-lg border border-[#171310]/10 bg-white p-3 text-sm transition hover:border-[#9C7A3C] hover:shadow-sm"
                                            >
                                                <span className="font-medium text-[#171310]">
                                                    Continue Shopping
                                                </span>
                                                <ArrowRight className="h-4 w-4 text-[#9C7A3C]" />
                                            </Link>
                                            <button
                                                onClick={() => window.print()}
                                                className="flex w-full items-center justify-between rounded-lg border border-[#171310]/10 bg-white p-3 text-sm transition hover:border-[#9C7A3C] hover:shadow-sm"
                                            >
                                                <span className="font-medium text-[#171310]">
                                                    Print Reservation
                                                </span>
                                                <Download className="h-4 w-4 text-[#9C7A3C]" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Help */}
                                    <div className="rounded-2xl border border-[#171310]/10 bg-white p-6">
                                        <h3 className="mb-2 font-serif text-lg font-medium text-[#171310]">
                                            Need Help?
                                        </h3>
                                        <p className="text-sm leading-relaxed text-[#252525]/70">
                                            Contact us if you have any questions about your order.
                                        </p>
                                        <Link
                                            href="/about"
                                            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#9C7A3C] transition hover:text-[#171310]"
                                        >
                                            <span>Contact Support</span>
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </StoreLayout>
    );
}
