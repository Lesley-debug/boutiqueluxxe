import AdminLayout from "@/components/admin/AdminLayout";
import { useForm } from "@inertiajs/react";
import { FormEvent } from "react";

interface CategoryOption {
    id: number;
    name: string;
}

interface FormProps {
    category?: {
        id: number;
        name: string;
        slug: string;
        parent_id: number | null;
        status: string;
        sort_order: number;
    };
    categories: CategoryOption[];
}

export default function Form({ category, categories }: FormProps) {
    const isEdit = !!category;
    const { data, setData, post, put, processing, errors } = useForm({
        name: category?.name ?? "",
        slug: category?.slug ?? "",
        parent_id: category?.parent_id?.toString() ?? "",
        status: category?.status ?? "active",
        sort_order: category?.sort_order ?? 0,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        const payload = { ...data, parent_id: data.parent_id || null };
        if (isEdit) {
            put(`/admin/categories/${category!.id}`);
        } else {
            post("/admin/categories");
        }
    }

    return (
        <AdminLayout title={isEdit ? "Edit Category" : "New Category"}>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Name
                        </label>
                        <input
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                        {errors.name && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Slug
                        </label>
                        <input
                            value={data.slug}
                            onChange={(e) => setData("slug", e.target.value)}
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                        {errors.slug && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.slug}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Parent Category
                        </label>
                        <select
                            value={data.parent_id}
                            onChange={(e) =>
                                setData("parent_id", e.target.value)
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        >
                            <option value="">— None (top-level) —</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Status
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData("status", e.target.value)}
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Sort Order
                        </label>
                        <input
                            type="number"
                            value={data.sort_order}
                            onChange={(e) =>
                                setData("sort_order", Number(e.target.value))
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-sm bg-stone-900 px-6 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {isEdit ? "Save Changes" : "Create Category"}
                    </button>
                </form>
        </AdminLayout>
    );
}
