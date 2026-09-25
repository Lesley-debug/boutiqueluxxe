import AdminLayout from "@/components/admin/AdminLayout";
import { Link, router } from "@inertiajs/react";
import { formatPrice } from "@/lib/format";

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
    function archive(id: number) {
        if (
            confirm(
                "Archive this product? It will be removed from the storefront and customer carts, while order history and media remain available.",
            )
        ) {
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
                                    {formatPrice(p.base_price)}
                                </td>
                                <td>{p.status}</td>
                                <td className="space-x-3 text-right">
                                    <Link
                                        href={`/admin/products/${p.id}/edit`}
                                        className="text-stone-600 underline"
                                    >
                                        Edit
                                    </Link>
                                    {p.status !== "archived" && (
                                        <button
                                            onClick={() => archive(p.id)}
                                            className="text-amber-700 underline"
                                        >
                                            Archive
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
        </AdminLayout>
    );
}
