import { Link } from "@inertiajs/react";
import { TrendingUp, ShoppingBag, Users, AlertTriangle } from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Table, Badge, EmptyState } from "@/components/admin/ui";
import type { DashboardData } from "@/types/dashboard";

const STATUS_TONE: Record<
    string,
    "neutral" | "success" | "warning" | "danger" | "info"
> = {
    pending: "warning",
    processing: "info",
    shipped: "info",
    delivered: "success",
    cancelled: "danger",
};

function fcfa(n: number | string) {
    return `${Number(n).toLocaleString()} FCFA`;
}

export default function Dashboard({
    revenue,
    orders,
    statusBreakdown,
    lowStock,
    recentOrders,
    topProducts,
    newCustomersThisMonth,
}: DashboardData) {
    return (
        <AdminLayout title="Dashboard">
            {/* Stat cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={TrendingUp}
                    label="Revenue Today"
                    value={fcfa(revenue.today)}
                    sub={`${orders.today} orders`}
                />
                <StatCard
                    icon={TrendingUp}
                    label="This Week"
                    value={fcfa(revenue.week)}
                    sub={`${orders.week} orders`}
                />
                <StatCard
                    icon={ShoppingBag}
                    label="This Month"
                    value={fcfa(revenue.month)}
                    sub={`${orders.month} orders`}
                />
                <StatCard
                    icon={Users}
                    label="New Customers"
                    value={String(newCustomersThisMonth)}
                    sub="this month"
                />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <Card>
                    <h2 className="mb-4 text-sm font-semibold text-[#171310]">
                        Orders by Status
                    </h2>
                    {Object.entries(statusBreakdown).length === 0 ? (
                        <p className="text-sm text-stone-400">No orders yet.</p>
                    ) : (
                        <div className="space-y-2.5">
                            {Object.entries(statusBreakdown).map(
                                ([status, count]) => (
                                    <div
                                        key={status}
                                        className="flex items-center justify-between"
                                    >
                                        <Badge
                                            tone={
                                                STATUS_TONE[status] ?? "neutral"
                                            }
                                        >
                                            {status}
                                        </Badge>
                                        <span className="text-sm font-semibold text-[#171310]">
                                            {count}
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    )}
                </Card>

                <Card>
                    <div className="mb-4 flex items-center gap-2">
                        <AlertTriangle size={15} className="text-amber-500" />
                        <h2 className="text-sm font-semibold text-[#171310]">
                            Low Stock
                        </h2>
                    </div>
                    {lowStock.length === 0 ? (
                        <p className="text-sm text-stone-400">
                            Nothing low on stock.
                        </p>
                    ) : (
                        <div className="space-y-2.5">
                            {lowStock.map((v) => (
                                <div
                                    key={v.id}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-[#171310]">
                                            {v.product.name}
                                        </p>
                                        <p className="truncate text-xs text-stone-400">
                                            {[v.color, v.size]
                                                .filter(Boolean)
                                                .join(" / ") || v.sku}
                                        </p>
                                    </div>
                                    <span
                                        className={`ml-2 font-semibold ${v.stock_quantity === 0 ? "text-red-600" : "text-amber-600"}`}
                                    >
                                        {v.stock_quantity}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                <Card>
                    <h2 className="mb-4 text-sm font-semibold text-[#171310]">
                        Top Products
                    </h2>
                    {topProducts.length === 0 ? (
                        <p className="text-sm text-stone-400">No sales yet.</p>
                    ) : (
                        <div className="space-y-2.5">
                            {topProducts.map((p) => (
                                <div
                                    key={p.sku}
                                    className="flex items-center justify-between text-sm"
                                >
                                    <span className="truncate text-[#171310]">
                                        {p.product_name}
                                    </span>
                                    <span className="ml-2 whitespace-nowrap text-stone-500">
                                        {p.total_sold} sold
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            <div className="mt-6">
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#171310]">
                        Recent Orders
                    </h2>
                    <Link
                        href="/admin/orders"
                        className="text-sm text-stone-500 underline hover:text-[#171310]"
                    >
                        View all
                    </Link>
                </div>
                {recentOrders.length === 0 ? (
                    <Card>
                        <EmptyState message="No orders yet." />
                    </Card>
                ) : (
                    <Table head={["Order #", "Customer", "Status", "Total"]}>
                        {recentOrders.map((order) => (
                            <tr key={order.id} className="hover:bg-stone-50">
                                <td className="px-4 py-3">
                                    <Link
                                        href={`/admin/orders/${order.id}`}
                                        className="font-medium underline"
                                    >
                                        {order.order_number}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">
                                    {order.customer_name}
                                </td>
                                <td className="px-4 py-3">
                                    <Badge
                                        tone={
                                            STATUS_TONE[order.status] ??
                                            "neutral"
                                        }
                                    >
                                        {order.status}
                                    </Badge>
                                </td>
                                <td className="px-4 py-3 font-medium">
                                    {fcfa(order.total)}
                                </td>
                            </tr>
                        ))}
                    </Table>
                )}
            </div>
        </AdminLayout>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
}: {
    icon: typeof TrendingUp;
    label: string;
    value: string;
    sub: string;
}) {
    return (
        <div className="rounded-xl border border-stone-200 bg-white p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8F5EF] text-[#B89B6A]">
                <Icon size={17} />
            </div>
            <p className="text-xs uppercase tracking-wide text-stone-400">
                {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-[#171310]">{value}</p>
            <p className="text-xs text-stone-400">{sub}</p>
        </div>
    );
}
