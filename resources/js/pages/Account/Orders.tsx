import { Head, Link, router } from "@inertiajs/react";
import { ChevronRight, Clock, RotateCcw, Truck, CheckCircle, XCircle } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";
import { formatPrice } from "@/lib/format";

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; bg: string }> = {
    pending:    { label: "Pending",    icon: Clock,       color: "text-amber-700",  bg: "bg-amber-50" },
    processing: { label: "Processing", icon: RotateCcw,   color: "text-blue-700",   bg: "bg-blue-50" },
    shipped:    { label: "Shipped",    icon: Truck,       color: "text-indigo-700", bg: "bg-indigo-50" },
    delivered:  { label: "Delivered",  icon: CheckCircle, color: "text-green-700",  bg: "bg-green-50" },
    cancelled:  { label: "Cancelled",  icon: XCircle,     color: "text-red-600",    bg: "bg-red-50" },
};

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
                    <div className="space-y-3">
                        {orders.data.map((order) => {
                            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                            const StatusIcon = cfg.icon;
                            return (
                                <Link
                                    key={order.id}
                                    href={`/account/orders/${order.id}`}
                                    className="group flex items-center gap-4 rounded-2xl border border-[#171310]/8 bg-white p-4 transition duration-300 hover:border-[#9C7A3C]/30 hover:shadow-[0_8px_24px_-8px_rgba(23,19,16,0.12)] sm:p-5"
                                >
                                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                                        <StatusIcon size={16} className={cfg.color} strokeWidth={1.8} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-[#171310]">
                                            {order.order_number}
                                        </p>
                                        <p className="mt-0.5 text-[11px] text-[#252525]/45">
                                            {new Date(order.created_at).toLocaleDateString("en-US", {
                                                month: "short", day: "numeric", year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5">
                                        <span className="text-sm font-semibold text-[#171310]">
                                            {formatPrice(order.total)}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${cfg.bg} ${cfg.color}`}>
                                            <StatusIcon size={9} strokeWidth={2.5} />
                                            {cfg.label}
                                        </span>
                                    </div>
                                    <ChevronRight size={15} className="flex-shrink-0 text-[#171310]/15 transition-transform group-hover:translate-x-0.5 group-hover:text-[#9C7A3C]" />
                                </Link>
                            );
                        })}
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
