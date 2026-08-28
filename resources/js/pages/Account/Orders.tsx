import { Head, Link, router } from "@inertiajs/react";

interface OrderRow {
    id: number;
    order_number: string;
    status: string;
    total: string;
    created_at: string;
}

interface Paginated {
    data: OrderRow[];
    links: { url: string | null; label: string; active: boolean }[];
}

export default function Orders({ orders }: { orders: Paginated }) {
    return (
        <>
            <Head title="My Orders" />
            <div className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="mb-6 text-xl font-semibold">My Orders</h1>

                {orders.data.length === 0 ? (
                    <p className="text-stone-500">
                        You haven&apos;t placed any orders yet.
                    </p>
                ) : (
                    <div className="divide-y divide-stone-100 border-y border-stone-200">
                        {orders.data.map((order) => (
                            <Link
                                key={order.id}
                                href={`/account/orders/${order.id}`}
                                className="flex items-center justify-between py-4 text-sm hover:bg-stone-50"
                            >
                                <div>
                                    <p className="font-medium">
                                        {order.order_number}
                                    </p>
                                    <p className="text-xs text-stone-500">
                                        {new Date(
                                            order.created_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className="capitalize text-stone-600">
                                    {order.status}
                                </span>
                                <span className="font-medium">
                                    {Number(order.total).toLocaleString()} FCFA
                                </span>
                            </Link>
                        ))}
                    </div>
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
                                        : "border-stone-300"
                                } disabled:opacity-40`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
