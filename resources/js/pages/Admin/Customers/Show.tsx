import AdminLayout from "@/components/admin/AdminLayout";
import { Link } from "@inertiajs/react";
import type { Order } from "@/types/order";

interface Summary {
    email: string;
    name: string;
    phone: string | null;
    user_id: number | null;
    orders_count: number;
    total_spent: number;
    first_order_at: string;
    last_order_at: string;
}

export default function Show({
    summary,
    orders,
}: {
    summary: Summary;
    orders: Order[];
}) {
    return (
        <AdminLayout title={summary.name}>
                <Link
                    href="/admin/customers"
                    className="text-sm text-stone-500 underline"
                >
                    ← Back to Customers
                </Link>

                <div className="mt-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">
                            {summary.name}
                        </h1>
                        <p className="text-sm text-stone-500">
                            {summary.email}
                        </p>
                        {summary.phone && (
                            <p className="text-sm text-stone-500">
                                {summary.phone}
                            </p>
                        )}
                    </div>
                    {summary.user_id ? (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800">
                            Registered account
                        </span>
                    ) : (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                            Guest checkout
                        </span>
                    )}
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="rounded-sm border border-stone-200 p-4">
                        <p className="text-xs text-stone-500">Total Orders</p>
                        <p className="text-lg font-semibold">
                            {summary.orders_count}
                        </p>
                    </div>
                    <div className="rounded-sm border border-stone-200 p-4">
                        <p className="text-xs text-stone-500">Total Spent</p>
                        <p className="text-lg font-semibold">
                            {Number(summary.total_spent).toLocaleString()} FCFA
                        </p>
                    </div>
                    <div className="rounded-sm border border-stone-200 p-4">
                        <p className="text-xs text-stone-500">Customer Since</p>
                        <p className="text-lg font-semibold">
                            {new Date(
                                summary.first_order_at,
                            ).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="mb-3 text-sm font-semibold text-stone-500">
                        Order History
                    </h2>
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-stone-200 text-stone-500">
                                <th className="py-2">Order #</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Status</th>
                                <th className="text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    className="border-b border-stone-100"
                                >
                                    <td className="py-2">
                                        <Link
                                            href={`/admin/orders/${order.id}`}
                                            className="underline"
                                        >
                                            {order.order_number}
                                        </Link>
                                    </td>
                                    <td className="text-xs text-stone-500">
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleDateString()}
                                    </td>
                                    <td>{order.items.length}</td>
                                    <td className="capitalize">
                                        {order.status}
                                    </td>
                                    <td className="text-right">
                                        {Number(order.total).toLocaleString()}{" "}
                                        FCFA
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
        </AdminLayout>
    );
}
