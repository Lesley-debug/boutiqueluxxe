import { Head, Link } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";
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
        <StoreLayout categories={[]}>
            <Head title="Order Confirmed" />
            <div className="mx-auto max-w-2xl px-4 py-16">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-stone-900">
                        Thank you, {order.customer_name}!
                    </h1>
                    <p className="mt-2 text-stone-600">
                        Your order{" "}
                        <span className="font-medium">
                            {order.order_number}
                        </span>{" "}
                        has been placed.
                    </p>
                    <p className="mt-1 text-sm capitalize text-stone-500">
                        {order.fulfillment_method === "pickup"
                            ? "Store pickup"
                            : "Delivery"}
                    </p>
                    <span
                        className={`mt-3 inline-block rounded-full px-3 py-1 text-xs ${
                            order.payment_status === "paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                        }`}
                    >
                        {order.payment_status === "paid"
                            ? "Payment Received"
                            : "Awaiting Payment"}
                    </span>
                </div>

                <div className="mt-8 rounded-sm border border-stone-200 p-6">
                    {order.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex justify-between border-b border-stone-100 py-2 text-sm"
                        >
                            <span>
                                {item.product_name}
                                {item.variant_label &&
                                    ` (${item.variant_label})`}{" "}
                                × {item.quantity}
                            </span>
                            <span>
                                {Number(item.line_total).toLocaleString()} FCFA
                            </span>
                        </div>
                    ))}
                    {Number(order.discount_amount) > 0 && (
                        <div className="flex justify-between border-b border-stone-100 py-2 text-sm text-green-700">
                            <span>
                                Discount{" "}
                                {order.discount_code
                                    ? `(${order.discount_code})`
                                    : ""}
                            </span>
                            <span>
                                −
                                {Number(order.discount_amount).toLocaleString()}{" "}
                                FCFA
                            </span>
                        </div>
                    )}
                    <div className="mt-3 flex justify-between font-semibold">
                        <span>Total Due</span>
                        <span>{Number(order.total).toLocaleString()} FCFA</span>
                    </div>
                </div>

                {order.payment_status !== "paid" && (
                    <div className="mt-8 rounded-sm border border-amber-200 bg-amber-50 p-6">
                        <h2 className="mb-1 text-sm font-semibold text-amber-900">
                            How to Pay
                        </h2>
                        <p className="mb-4 text-xs text-amber-800">
                            Please send payment using one of the methods below,
                            then include your order number{" "}
                            <strong>{order.order_number}</strong> as the
                            reference. Your order will be confirmed once payment
                            is received.
                        </p>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                                    International
                                </h3>
                                <div className="space-y-2 text-sm">
                                    {paymentInstructions.international.map(
                                        (m) => (
                                            <div key={m.method}>
                                                <p className="font-medium">
                                                    {m.method}
                                                </p>
                                                <p className="text-stone-600">
                                                    {m.detail}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
                                    Cameroon
                                </h3>
                                <div className="space-y-2 text-sm">
                                    {paymentInstructions.cameroon.map((m) => (
                                        <div key={m.method}>
                                            <p className="font-medium">
                                                {m.method}
                                            </p>
                                            <p className="text-stone-600">
                                                {m.detail}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {order.fulfillment_method === "delivery" && (
                    <p className="mt-6 text-center text-sm text-stone-500">
                        Shipping to: {order.shipping_address}, {order.city}
                    </p>
                )}

                <div className="mt-8 text-center">
                    <Link href="/shop" className="text-sm underline">
                        Continue shopping
                    </Link>
                </div>
            </div>
        </StoreLayout>
    );
}
