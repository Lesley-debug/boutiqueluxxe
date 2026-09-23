import { Head, Link } from "@inertiajs/react";
import { CheckCircle, Package, MapPin, CreditCard, Mail, ArrowRight, Download } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";
import Reveal from "@/components/Store/Reveal";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/types/order";

interface PaymentMethod {
    method: string;
    detail: string;
}

interface ConfirmationOrder extends Order {
    payment_status: string;
    fulfillment_method: string;
}

interface ConfirmationProps {
    order: ConfirmationOrder;
    paymentInstructions: {
        international: PaymentMethod[];
        cameroon: PaymentMethod[];
    };
}

export default function OrderConfirmation({
    order,
    paymentInstructions,
}: ConfirmationProps) {
    return (
        <StoreLayout>
            <Head title="Order Confirmed" />
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
                                We've received your order and will send you a confirmation email shortly
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

                            {/* Payment Status Badge */}
                            <div className="mt-4">
                                <span
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
                                        order.payment_status === "paid"
                                            ? "bg-[#9C7A3C]/10 text-[#9C7A3C]"
                                            : "bg-amber-50 text-amber-700"
                                    }`}
                                >
                                    {order.payment_status === "paid" ? (
                                        <>
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Payment Received</span>
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-4 w-4" />
                                            <span>Awaiting Payment</span>
                                        </>
                                    )}
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
                                            {order.fulfillment_method === "delivery" 
                                                ? "Delivery Address" 
                                                : "Pickup Information"}
                                        </span>
                                    </h2>
                                    {order.fulfillment_method === "delivery" ? (
                                        <div className="space-y-1 text-sm">
                                            <p className="font-medium text-[#171310]">{order.customer_name}</p>
                                            <p className="text-[#252525]/70">{order.shipping_address}</p>
                                            <p className="text-[#252525]/70">
                                                {order.city}{order.region && `, ${order.region}`}
                                            </p>
                                            <p className="pt-2 text-[#252525]/70">{order.customer_phone}</p>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-[#9C7A3C]/20 bg-[#9C7A3C]/5 p-6">
                                            <p className="font-serif text-lg text-[#171310]">
                                                Designer Bags Boutique
                                            </p>
                                            <p className="mt-2 text-sm text-[#252525]/70">
                                                Commercial Avenue, Bamenda
                                            </p>
                                            <p className="text-sm text-[#252525]/70">
                                                North-West Region
                                            </p>
                                            <p className="mt-3 text-sm font-medium text-[#9C7A3C]">
                                                Mon–Sat, 9am–6pm
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Reveal>

                            {/* Payment Instructions */}
                            {order.payment_status !== "paid" && (
                                <Reveal delay={200}>
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
                                        <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-medium text-amber-900">
                                            <CreditCard className="h-5 w-5" />
                                            <span>Payment Instructions</span>
                                        </h2>
                                        <p className="mb-6 text-sm leading-relaxed text-amber-800">
                                            Please send payment using one of the methods below. Include your order number{" "}
                                            <strong className="font-mono">{order.order_number}</strong> as the reference. Your order will be confirmed once payment is received.
                                        </p>

                                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                            <div className="rounded-xl border border-amber-200 bg-white p-5">
                                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#252525]/60">
                                                    International
                                                </h3>
                                                <div className="space-y-3">
                                                    {paymentInstructions.international.map((m) => (
                                                        <div key={m.method}>
                                                            <p className="text-sm font-semibold text-[#171310]">
                                                                {m.method}
                                                            </p>
                                                            <p className="mt-1 text-sm text-[#252525]/70">
                                                                {m.detail}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="rounded-xl border border-amber-200 bg-white p-5">
                                                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#252525]/60">
                                                    Cameroon
                                                </h3>
                                                <div className="space-y-3">
                                                    {paymentInstructions.cameroon.map((m) => (
                                                        <div key={m.method}>
                                                            <p className="text-sm font-semibold text-[#171310]">
                                                                {m.method}
                                                            </p>
                                                            <p className="mt-1 text-sm text-[#252525]/70">
                                                                {m.detail}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Reveal>
                            )}
                        </div>

                        {/* Sidebar - Next Steps */}
                        <div className="lg:col-span-1">
                            <Reveal delay={250}>
                                <div className="sticky top-24 space-y-6">
                                    {/* Contact Information */}
                                    <div className="rounded-2xl border border-[#171310]/10 bg-white p-6">
                                        <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-medium text-[#171310]">
                                            <Mail className="h-5 w-5 text-[#9C7A3C]" />
                                            <span>Confirmation Sent</span>
                                        </h3>
                                        <p className="text-sm leading-relaxed text-[#252525]/70">
                                            A confirmation email has been sent to:
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
                                                    Print Receipt
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
        </StoreLayout>
    );
}
