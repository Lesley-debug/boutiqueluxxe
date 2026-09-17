import { Head, Link, router } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";

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
        <StoreLayout>
            <Head title="My Orders" />
            <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
                <div className="mb-12">
                    <h1 className="font-serif text-4xl font-medium tracking-tight text-[#171310]">
                        My Orders
                    </h1>
                    <p className="mt-2 text-sm text-[#252525]/60">
                        Track and manage your order history
                    </p>
                </div>

                {orders.data.length === 0 ? (
                    <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-12 text-center">
                        <p className="text-lg text-[#252525]/60">
                            You haven&apos;t placed any orders yet.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-6 inline-flex items-center rounded-full bg-[#171310] px-8 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition duration-300 hover:bg-[#9C7A3C]"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.data.map((order) => (
                            <Link
                                key={order.id}
                                href={`/account/orders/${order.id}`}
                                className="block rounded-2xl border border-[#171310]/10 bg-white p-6 transition duration-300 hover:border-[#9C7A3C]/30 hover:shadow-[0_8px_24px_-8px_rgba(23,19,16,0.15)]"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-[#171310]">
                                            Order {order.order_number}
                                        </p>
                                        <p className="mt-1 text-sm text-[#252525]/60">
                                            Placed on{" "}
                                            {new Date(
                                                order.created_at,
                                            ).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="rounded-full bg-[#F8F5EF] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.1em] text-[#171310]">
                                            {order.status}
                                        </span>
                                        <span className="text-lg font-semibold text-[#171310]">
                                            {Number(order.total).toLocaleString()} FCFA
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {orders.links.length > 3 && (
                    <div className="mt-12 flex justify-center">
                        <div className="flex gap-2">
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
                                    className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-40 ${
                                        link.active
                                            ? "border-[#9C7A3C] bg-[#9C7A3C] text-white"
                                            : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
