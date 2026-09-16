import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Link, router } from "@inertiajs/react";
import type { Order } from "@/types/order";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function Show({ order }: { order: Order }) {
    const [isPaymentStatusUpdating, setIsPaymentStatusUpdating] =
        useState(false);

    function updateStatus(status: string) {
        router.patch(
            `/admin/orders/${order.id}/status`,
            { status },
            { preserveScroll: true },
        );
    }

    function updatePaymentStatus(payment_status: string) {
        setIsPaymentStatusUpdating(true);
        router.patch(
            `/admin/orders/${order.id}/payment`,
            { payment_status },
            {
                preserveScroll: true,
                onFinish: () => setIsPaymentStatusUpdating(false),
            },
        );
    }

    return (
        <AdminLayout title={`Order ${order.order_number}`}>
                <Link
                    href="/admin/orders"
                    className="text-sm text-stone-500 underline"
                >
                    ← Back to Orders
                </Link>

                <div className="mt-4 flex items-center justify-between gap-3">
                    <h1 className="text-xl font-semibold">
                        {order.order_number}
                    </h1>
                    <div className="flex flex-wrap items-center justify-end gap-2">
                        <select
                            value={order.status}
                            onChange={(e) => updateStatus(e.target.value)}
                            className="rounded-sm border border-stone-300 px-3 py-2 text-sm capitalize"
                        >
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                        <select
                            value={order.payment_status}
                            disabled={isPaymentStatusUpdating}
                            onChange={(e) =>
                                updatePaymentStatus(e.target.value)
                            }
                            className={`rounded-sm border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70 ${
                                order.payment_status === "paid"
                                    ? "border-green-300 bg-green-50"
                                    : "border-amber-300 bg-amber-50"
                            }`}
                        >
                            <option value="pending">Payment: Pending</option>
                            <option value="paid">Payment: Received</option>
                        </select>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
                    <div>
                        <h2 className="mb-2 font-semibold text-stone-500">
                            Customer
                        </h2>
                        <p>{order.customer_name}</p>
                        <p>{order.customer_email}</p>
                        {order.customer_phone && <p>{order.customer_phone}</p>}
                    </div>
                    <div>
                        <h2 className="mb-2 font-semibold text-stone-500">
                            Shipping Address
                        </h2>
                        <p>{order.shipping_address}</p>
                        <p>
                            {order.city}
                            {order.region && `, ${order.region}`}
                        </p>
                    </div>
                </div>

                {order.notes && (
                    <div className="mt-6 text-sm">
                        <h2 className="mb-1 font-semibold text-stone-500">
                            Notes
                        </h2>
                        <p>{order.notes}</p>
                    </div>
                )}

                <div className="mt-8">
                    <h2 className="mb-3 text-sm font-semibold text-stone-500">
                        Items
                    </h2>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-stone-200 text-stone-500">
                                <th className="py-2">Product</th>
                                <th>SKU</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th className="text-right">Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-b border-stone-100"
                                >
                                    <td className="py-2">
                                        {item.product_name}
                                        {item.variant_label && (
                                            <span className="text-stone-500">
                                                {" "}
                                                ({item.variant_label})
                                            </span>
                                        )}
                                    </td>
                                    <td>{item.sku}</td>
                                    <td>{item.quantity}</td>
                                    <td>
                                        {Number(
                                            item.unit_price,
                                        ).toLocaleString()}{" "}
                                        FCFA
                                    </td>
                                    <td className="text-right">
                                        {Number(
                                            item.line_total,
                                        ).toLocaleString()}{" "}
                                        FCFA
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="mt-4 space-y-1 text-right text-sm">
                        <p>
                            Subtotal: {Number(order.subtotal).toLocaleString()}{" "}
                            FCFA
                        </p>
                        <p>
                            Shipping:{" "}
                            {Number(order.shipping_cost).toLocaleString()} FCFA
                        </p>
                        {Number(order.discount_amount) > 0 && (
                            <p className="text-green-700">
                                Discount{" "}
                                {order.discount_code
                                    ? `(${order.discount_code})`
                                    : ""}
                                : −
                                {Number(
                                    order.discount_amount,
                                ).toLocaleString()}{" "}
                                FCFA
                            </p>
                        )}
                        <p className="text-base font-semibold">
                            Total: {Number(order.total).toLocaleString()} FCFA
                        </p>
                    </div>
                </div>
        </AdminLayout>
    );
}
