import AdminLayout from "@/components/admin/AdminLayout";
import { Link, router } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import { formatPrice } from "@/lib/format";

interface CustomerRow {
    customer_email: string;
    customer_name: string;
    user_id: number | null;
    orders_count: number;
    total_spent: string;
    last_order_at: string;
}

interface Paginated {
    data: CustomerRow[];
    links: { url: string | null; label: string; active: boolean }[];
}

export default function Index({
    customers,
    filters,
}: {
    customers: Paginated;
    filters: { search?: string };
}) {
    const [search, setSearch] = useState(filters.search ?? "");

    function onSearchSubmit(e: FormEvent) {
        e.preventDefault();
        router.get(
            "/admin/customers",
            { search },
            { preserveState: true, preserveScroll: true },
        );
    }

    return (
        <AdminLayout title="Customers">
                <div className="mb-6 flex items-center justify-between">
                    <form onSubmit={onSearchSubmit} className="flex gap-2">
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search name or email..."
                            className="w-64 rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                        <button
                            type="submit"
                            className="rounded-sm bg-stone-900 px-4 py-2 text-sm text-white"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 text-stone-500">
                            <th className="py-2">Name</th>
                            <th>Email</th>
                            <th>Account</th>
                            <th>Orders</th>
                            <th>Total Spent</th>
                            <th>Last Order</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.data.map((c) => (
                            <tr
                                key={c.customer_email}
                                className="border-b border-stone-100"
                            >
                                <td className="py-2">{c.customer_name}</td>
                                <td>{c.customer_email}</td>
                                <td>
                                    {c.user_id ? (
                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                            Registered
                                        </span>
                                    ) : (
                                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">
                                            Guest
                                        </span>
                                    )}
                                </td>
                                <td>{c.orders_count}</td>
                                <td>
                                    {formatPrice(c.total_spent)}
                                </td>
                                <td className="text-xs text-stone-500">
                                    {new Date(
                                        c.last_order_at,
                                    ).toLocaleDateString()}
                                </td>
                                <td className="text-right">
                                    <Link
                                        href={`/admin/customers/${encodeURIComponent(c.customer_email)}`}
                                        className="text-stone-600 underline"
                                    >
                                        View
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {customers.data.length === 0 && (
                    <p className="py-10 text-center text-stone-500">
                        No customers found.
                    </p>
                )}

                {customers.links.length > 3 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {customers.links.map((link, i) => (
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
