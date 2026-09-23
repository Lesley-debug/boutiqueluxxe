import AdminLayout from "@/components/admin/AdminLayout";
import { Link, router } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import { formatPrice } from "@/lib/format";

interface OrderRow {
    id: number;
    order_number: string;
    customer_name: string;
    customer_email: string;
    status: string;
    total: string;
    items_count: number;
    created_at: string;
}

interface Paginated {
    data: OrderRow[];
    links: { url: string | null; label: string; active: boolean }[];
}

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
};

export default function Index({
    orders,
    filters,
}: {
    orders: Paginated;
    filters: { status?: string; search?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? "");

    function applyFilter(next: Partial<typeof filters>) {
        router.get(
            "/admin/orders",
            { ...filters, ...next },
            { preserveState: true, preserveScroll: true },
        );
    }

    function onSearchSubmit(e: FormEvent) {
        e.preventDefault();
        applyFilter({ search });
    }

    return (
        <AdminLayout title="Orders">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2">
                        <form onSubmit={onSearchSubmit} className="flex gap-2">
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search order #, name, email..."
                                className="w-64 rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                            <button
                                type="submit"
                                className="rounded-sm bg-stone-900 px-4 py-2 text-sm text-white"
                            >
                                Search
                            </button>
                        </form>
                        <select
                            value={filters.status ?? ""}
                            onChange={(e) =>
                                applyFilter({ status: e.target.value })
                            }
                            className="rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        >
                            <option value="">All statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 text-stone-500">
                            <th className="py-2">Order #</th>
                            <th>Customer</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.data.map((order) => (
                            <tr
                                key={order.id}
                                className="border-b border-stone-100"
                            >
                                <td className="py-2 font-medium">
                                    {order.order_number}
                                </td>
                                <td>
                                    <div>{order.customer_name}</div>
                                    <div className="text-xs text-stone-500">
                                        {order.customer_email}
                                    </div>
                                </td>
                                <td>{order.items_count}</td>
                                <td>
                                    {formatPrice(order.total)}
                                </td>
                                <td>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs ${STATUS_COLORS[order.status] ?? ""}`}
                                    >
                                        {order.status}
                                    </span>
                                </td>
                                <td className="text-xs text-stone-500">
                                    {new Date(
                                        order.created_at,
                                    ).toLocaleDateString()}
                                </td>
                                <td className="text-right">
                                    <Link
                                        href={`/admin/orders/${order.id}`}
                                        className="text-stone-600 underline"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {orders.data.length === 0 && (
                    <p className="py-10 text-center text-stone-500">
                        No orders found.
                    </p>
                )}

                {orders.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {orders.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url &&
                                    router.visit(link.url, {
                                        preserveScroll: true,
                                    })
                                }
                                className={`rounded-sm border px-3 py-1 text-sm ${
                                    link.active
                                        ? "border-stone-900 bg-stone-900 text-white"
                                        : "border-stone-300 text-stone-700"
                                } disabled:opacity-40`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
        </AdminLayout>
    );
}
