import { Head, Link } from "@inertiajs/react";
import {
    ChevronLeft,
    Package,
    MapPin,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    RotateCcw,
} from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";

const STATUS_CONFIG: Record<string, {
    label: string;
    icon: typeof Clock;
    color: string;
    bg: string;
    border: string;
}> = {
    pending:    { label: "Pending",    icon: Clock,       color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
    processing: { label: "Processing", icon: RotateCcw,   color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
    shipped:    { label: "Shipped",    icon: Truck,       color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
    delivered:  { label: "Delivered",  icon: CheckCircle, color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
    cancelled:  { label: "Cancelled",  icon: XCircle,     color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" },
};

export default function OrderDetail({ order }: { order: Order }) {
    const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
    const StatusIcon = cfg.icon;

    return (
        <StoreLayout showMobileHeader>
            <Head title={`Order ${order.order_number}`} />

            {/* ── Mobile ── */}
            <div className="lg:hidden">
                <div className="space-y-3 px-4 pb-28 pt-3">
                    {/* Back + status */}
                    <div className="flex items-center justify-between">
                        <Link
                            href="/account/orders"
                            className="flex items-center gap-1 text-xs text-[#252525]/50"
                        >
                            <ChevronLeft size={14} strokeWidth={2} />
                            Orders
                        </Link>
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                            <StatusIcon size={11} strokeWidth={2} />
                            {cfg.label}
                        </span>
                    </div>

                    {/* Order number + date */}
                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">Order</p>
                        <p className="mt-0.5 font-serif text-xl font-medium text-[#171310]">{order.order_number}</p>
                        <p className="mt-1 text-xs text-[#252525]/45">
                            Placed {new Date(order.created_at).toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric",
                            })}
                        </p>
                    </div>

                    {/* Items */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="border-b border-[#171310]/8 px-4 py-3">
                            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9C7A3C]">
                                <Package size={13} strokeWidth={1.8} />
                                Items
                            </p>
                        </div>
                        <div className="divide-y divide-[#171310]/5">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between px-4 py-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-[#171310]">{item.product_name}</p>
                                        {item.variant_label && (
                                            <p className="mt-0.5 text-[11px] text-[#252525]/45">{item.variant_label}</p>
                                        )}
                                        <p className="mt-0.5 text-[11px] text-[#252525]/45">
                                            Qty {item.quantity} × {formatPrice(item.unit_price)}
                                        </p>
                                    </div>
                                    <p className="flex-shrink-0 pl-3 text-sm font-semibold text-[#171310]">
                                        {formatPrice(item.line_total)}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 border-t border-[#171310]/8 bg-[#F8F5EF] px-4 py-3">
                            <div className="flex justify-between text-xs text-[#252525]/60">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {Number(order.shipping_cost) > 0 && (
                                <div className="flex justify-between text-xs text-[#252525]/60">
                                    <span>Shipping</span>
                                    <span>{formatPrice(order.shipping_cost)}</span>
                                </div>
                            )}
                            {Number(order.discount_amount) > 0 && (
                                <div className="flex justify-between text-xs text-green-700">
                                    <span>Discount {order.discount_code && `(${order.discount_code})`}</span>
                                    <span>−{formatPrice(order.discount_amount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-[#171310]/10 pt-2">
                                <span className="font-serif text-sm font-medium text-[#171310]">Total</span>
                                <span className="font-serif text-base font-semibold text-[#171310]">{formatPrice(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Delivery */}
                    {order.shipping_address && (
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                            <p className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9C7A3C]">
                                <MapPin size={13} strokeWidth={1.8} />
                                Delivery Address
                            </p>
                            <div className="space-y-0.5 text-sm text-[#252525]/65">
                                <p className="font-medium text-[#171310]">{order.customer_name}</p>
                                <p>{order.shipping_address}</p>
                                <p>{order.city}{order.region ? `, ${order.region}` : ""}</p>
                                {order.customer_phone && <p>{order.customer_phone}</p>}
                            </div>
                        </div>
                    )}

                    {/* CTAs */}
                    <div className="flex gap-2 pt-1">
                        <Link
                            href="/shop"
                            className="flex-1 rounded-full bg-[#171310] py-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white"
                        >
                            Shop More
                        </Link>
                        <Link
                            href="/account/orders"
                            className="flex-1 rounded-full border border-[#171310]/15 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-[#171310]"
                        >
                            All Orders
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Desktop ── */}
            <div className="hidden lg:block">
            <div className="mx-auto max-w-3xl px-4 pb-6 pt-8 sm:px-6 sm:pt-12 lg:pb-16">

                {/* Back link */}
                <Link
                    href="/account/orders"
                    className="mb-6 inline-flex items-center gap-1.5 text-sm text-[#252525]/50 transition hover:text-[#171310]"
                >
                    <ChevronLeft size={15} strokeWidth={2} />
                    Back to Orders
                </Link>

                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9C7A3C]">
                            Order
                        </p>
                        <h1 className="mt-0.5 font-serif text-2xl font-medium text-[#171310] sm:text-3xl">
                            {order.order_number}
                        </h1>
                        <p className="mt-1 text-xs text-[#252525]/45">
                            Placed {new Date(order.created_at).toLocaleDateString("en-US", {
                                year: "numeric", month: "long", day: "numeric",
                            })}
                        </p>
                    </div>
                    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                        <StatusIcon size={13} strokeWidth={2} />
                        {cfg.label}
                    </span>
                </div>

                {/* Items */}
                <div className="mt-8 overflow-hidden rounded-2xl border border-[#171310]/8 bg-white">
                    <div className="border-b border-[#171310]/8 px-5 py-4">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#171310]">
                            <Package size={15} className="text-[#9C7A3C]" strokeWidth={1.8} />
                            Order Items
                        </h2>
                    </div>
                    <div className="divide-y divide-[#171310]/5">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between px-5 py-4">
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-[#171310] truncate">
                                        {item.product_name}
                                    </p>
                                    {item.variant_label && (
                                        <p className="mt-0.5 text-xs text-[#252525]/45">
                                            {item.variant_label}
                                        </p>
                                    )}
                                    <p className="mt-0.5 text-xs text-[#252525]/45">
                                        Qty: {item.quantity} × {formatPrice(item.unit_price)}
                                    </p>
                                </div>
                                <p className="flex-shrink-0 pl-4 text-sm font-semibold text-[#171310]">
                                    {formatPrice(item.line_total)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 border-t border-[#171310]/8 bg-[#F8F5EF] px-5 py-4">
                        <div className="flex justify-between text-sm text-[#252525]/60">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {Number(order.shipping_cost) > 0 && (
                            <div className="flex justify-between text-sm text-[#252525]/60">
                                <span>Shipping</span>
                                <span>{formatPrice(order.shipping_cost)}</span>
                            </div>
                        )}
                        {Number(order.discount_amount) > 0 && (
                            <div className="flex justify-between text-sm text-green-700">
                                <span>Discount {order.discount_code && `(${order.discount_code})`}</span>
                                <span>−{formatPrice(order.discount_amount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between border-t border-[#171310]/10 pt-3">
                            <span className="font-serif text-base font-medium text-[#171310]">Total</span>
                            <span className="font-serif text-lg font-semibold text-[#171310]">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Shipping address */}
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#171310]/8 bg-white px-5 py-4">
                    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#171310]">
                        <MapPin size={15} className="text-[#9C7A3C]" strokeWidth={1.8} />
                        Shipping Address
                    </h2>
                    <div className="text-sm text-[#252525]/65 space-y-0.5">
                        <p className="font-medium text-[#171310]">{order.customer_name}</p>
                        <p>{order.shipping_address}</p>
                        <p>{order.city}{order.region ? `, ${order.region}` : ""}</p>
                        {order.customer_phone && <p>{order.customer_phone}</p>}
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/shop"
                        className="flex-1 rounded-full bg-[#171310] py-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition hover:bg-[#9C7A3C]"
                    >
                        Continue Shopping
                    </Link>
                    <Link
                        href="/account/orders"
                        className="flex-1 rounded-full border border-[#171310]/15 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-[#171310] transition hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                    >
                        All Orders
                    </Link>
                </div>
            </div>
            </div>
        </StoreLayout>
    );
}
