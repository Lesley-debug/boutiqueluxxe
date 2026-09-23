import AdminLayout from "@/components/admin/AdminLayout";
import { Link, router } from "@inertiajs/react";
import { formatPrice } from "@/lib/format";

interface DiscountRow {
    id: number;
    code: string;
    type: string;
    value: string;
    max_uses: number | null;
    uses_count: number;
    active: boolean;
    expires_at: string | null;
}

export default function Index({ discounts }: { discounts: DiscountRow[] }) {
    function destroy(id: number) {
        if (confirm("Delete this discount code?")) {
            router.delete(`/admin/discounts/${id}`);
        }
    }

    return (
        <AdminLayout title="Discounts">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/admin/discounts/create"
                        className="rounded-sm bg-stone-900 px-4 py-2 text-sm text-white"
                    >
                        New Discount
                    </Link>
                </div>

                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 text-stone-500">
                            <th className="py-2">Code</th>
                            <th>Value</th>
                            <th>Uses</th>
                            <th>Expires</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {discounts.map((d) => (
                            <tr
                                key={d.id}
                                className="border-b border-stone-100"
                            >
                                <td className="py-2 font-mono">{d.code}</td>
                                <td>
                                    {d.type === "percentage"
                                        ? `${Number(d.value)}%`
                                        : formatPrice(d.value)}
                                </td>
                                <td>
                                    {d.uses_count}
                                    {d.max_uses ? ` / ${d.max_uses}` : ""}
                                </td>
                                <td className="text-xs text-stone-500">
                                    {d.expires_at
                                        ? new Date(
                                              d.expires_at,
                                          ).toLocaleDateString()
                                        : "Never"}
                                </td>
                                <td>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs ${
                                            d.active
                                                ? "bg-green-100 text-green-800"
                                                : "bg-stone-100 text-stone-600"
                                        }`}
                                    >
                                        {d.active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="space-x-3 text-right">
                                    <Link
                                        href={`/admin/discounts/${d.id}/edit`}
                                        className="text-stone-600 underline"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => destroy(d.id)}
                                        className="text-red-600 underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {discounts.length === 0 && (
                    <p className="py-10 text-center text-stone-500">
                        No discount codes yet.
                    </p>
                )}
        </AdminLayout>
    );
}
