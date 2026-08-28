import { Head, Link } from "@inertiajs/react";
import type { Order } from "@/types/order";

export default function OrderDetail({ order }: { order: Order }) {
    return (
        <>
            <Head title={order.order_number} />
            <div className="mx-auto max-w-2xl px-4 py-10">
                <Link
                    href="/account/orders"
                    className="text-sm text-stone-500 underline"
                >
                    ← Back to Orders
                </Link>

                <div className="mt-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">
                        {order.order_number}
                    </h1>
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs capitalize text-stone-700">
                        {order.status}
                    </span>
                </div>

                <div className="mt-6 rounded-sm border border-stone-200 p-4">
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
                    <div className="mt-3 space-y-1 text-right text-sm">
                        <p>
                            Subtotal: {Number(order.subtotal).toLocaleString()}{" "}
                            FCFA
                        </p>
                        {Number(order.discount_amount) > 0 && (
                            <p className="text-green-700">
                                Discount: −
                                {Number(order.discount_amount).toLocaleString()}{" "}
                                FCFA
                            </p>
                        )}
                        <p className="text-base font-semibold">
                            Total: {Number(order.total).toLocaleString()} FCFA
                        </p>
                    </div>
                </div>

                <p className="mt-4 text-sm text-stone-500">
                    Shipping to: {order.shipping_address}, {order.city}
                </p>
            </div>
        </>
    );
}
