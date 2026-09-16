import AdminLayout from "@/components/admin/AdminLayout";
import { Link, router } from "@inertiajs/react";

interface Product {
    id: number;
    name: string;
    status: string;
    base_price: string;
    category: { name: string };
}

interface Paginated {
    data: Product[];
}

export default function Index({ products }: { products: Paginated }) {
    function destroy(id: number) {
        if (confirm("Delete this product?")) {
            router.delete(`/admin/products/${id}`);
        }
    }

    return (
        <AdminLayout title="Products">
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        href="/admin/products/create"
                        className="rounded-sm bg-stone-900 px-4 py-2 text-sm text-white"
                    >
                        New Product
                    </Link>
                </div>

                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-stone-200 text-stone-500">
                            <th className="py-2">Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.data.map((p) => (
                            <tr
                                key={p.id}
                                className="border-b border-stone-100"
                            >
                                <td className="py-2">{p.name}</td>
                                <td>{p.category.name}</td>
                                <td>
                                    {Number(p.base_price).toLocaleString()} FCFA
                                </td>
                                <td>{p.status}</td>
                                <td className="space-x-3 text-right">
                                    <Link
                                        href={`/admin/products/${p.id}/edit`}
                                        className="text-stone-600 underline"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => destroy(p.id)}
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
