import { Head, Link, router } from "@inertiajs/react";

interface CollectionRow {
    id: number;
    name: string;
    active: boolean;
    products_count: number;
}

export default function Index({
    collections,
}: {
    collections: CollectionRow[];
}) {
    function destroy(id: number) {
        if (confirm("Delete this collection?")) {
            router.delete(`/admin/collections/${id}`);
        }
    }

    return (
        <>
            <Head title="Admin — Collections" />
            <div className="mx-auto max-w-3xl px-4 py-10">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Collections</h1>
                    <Link
                        href="/admin/collections/create"
                        className="rounded-sm bg-[#7C3AED] px-4 py-2 text-sm text-white"
                    >
                        New Collection
                    </Link>
                </div>

                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                            <th className="py-2">Name</th>
                            <th>Products</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {collections.map((c) => (
                            <tr key={c.id} className="border-b border-gray-100">
                                <td className="py-2">{c.name}</td>
                                <td>{c.products_count}</td>
                                <td>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs ${c.active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                                    >
                                        {c.active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="space-x-3 text-right">
                                    <Link
                                        href={`/admin/collections/${c.id}/edit`}
                                        className="text-gray-600 underline"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => destroy(c.id)}
                                        className="text-red-600 underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
