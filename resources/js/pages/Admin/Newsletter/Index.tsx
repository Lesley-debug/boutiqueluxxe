import AdminLayout from "@/components/admin/AdminLayout";
import {  } from "@inertiajs/react";

interface Subscriber {
    id: number;
    email: string;
    created_at: string;
}

export default function Index({
    subscribers,
    total,
}: {
    subscribers: { data: Subscriber[] };
    total: number;
}) {
    function exportCsv() {
        const csv = ["Email,Subscribed"]
            .concat(
                subscribers.data.map(
                    (s) =>
                        `${s.email},${new Date(s.created_at).toLocaleDateString()}`,
                ),
            )
            .join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "newsletter-subscribers.csv";
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <AdminLayout title="Newsletter">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">
                            {total} active subscriber{total === 1 ? "" : "s"}
                        </p>
                    </div>
                    <button
                        onClick={exportCsv}
                        className="rounded-full border border-gray-300 px-4 py-2 text-sm"
                    >
                        Export CSV
                    </button>
                </div>

                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                            <th className="py-2">Email</th>
                            <th>Subscribed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subscribers.data.map((s) => (
                            <tr key={s.id} className="border-b border-gray-100">
                                <td className="py-2">{s.email}</td>
                                <td className="text-xs text-gray-500">
                                    {new Date(
                                        s.created_at,
                                    ).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {subscribers.data.length === 0 && (
                    <p className="py-8 text-center text-sm text-gray-400">
                        No subscribers yet.
                    </p>
                )}
        </AdminLayout>
    );
}
