import AdminLayout from "@/components/admin/AdminLayout";
import { Link, router } from "@inertiajs/react";

interface Category {
    id: number;
    name: string;
    slug: string;
    status: string;
    parent?: { name: string } | null;
}

export default function Index({ categories }: { categories: Category[] }) {
    function destroy(id: number) {
        if (confirm("Delete this category?")) {
            router.delete(`/admin/categories/${id}`);
        }
    }

    return (
        <AdminLayout title="Categories">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/admin/categories/create"
                        className="rounded-sm bg-stone-900 px-4 py-2 text-sm text-white"
                    >
                        New Category
                    </Link>
                </div>

                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 text-stone-500">
                            <th className="py-2">Name</th>
                            <th>Parent</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((c) => (
                            <tr
                                key={c.id}
                                className="border-b border-stone-100"
                            >
                                <td className="py-2">{c.name}</td>
                                <td>{c.parent?.name ?? "—"}</td>
                                <td>{c.status}</td>
                                <td className="space-x-3 text-right">
                                    <Link
                                        href={`/admin/categories/${c.id}/edit`}
                                        className="text-stone-600 underline"
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
        </AdminLayout>
    );
}
