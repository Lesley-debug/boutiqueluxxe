import { Head, useForm } from "@inertiajs/react";
import { FormEvent } from "react";

interface ProductOption {
    id: number;
    name: string;
}

interface CollectionData {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    active: boolean;
    sort_order: number;
    products: { id: number }[];
}

export default function Form({
    collection,
    products,
}: {
    collection?: CollectionData;
    products: ProductOption[];
}) {
    const isEdit = !!collection;
    const { data, setData, post, processing, errors } = useForm({
        name: collection?.name ?? "",
        slug: collection?.slug ?? "",
        description: collection?.description ?? "",
        active: collection?.active ?? true,
        sort_order: collection?.sort_order ?? 0,
        hero_image: null as File | null,
        product_ids: collection?.products.map((p) => p.id) ?? ([] as number[]),
    });

    function toggleProduct(id: number) {
        setData(
            "product_ids",
            data.product_ids.includes(id)
                ? data.product_ids.filter((p) => p !== id)
                : [...data.product_ids, id],
        );
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        const url = isEdit
            ? `/admin/collections/${collection!.id}`
            : "/admin/collections";
        post(url, {
            forceFormData: true,
            ...(isEdit && { method: "put" as any }),
        });
    }

    return (
        <>
            <Head title={isEdit ? "Edit Collection" : "New Collection"} />
            <div className="mx-auto max-w-2xl px-4 py-10">
                <h1 className="mb-6 text-xl font-semibold">
                    {isEdit ? "Edit" : "New"} Collection
                </h1>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Name
                        </label>
                        <input
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
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
                            className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                        />
                        {errors.slug && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.slug}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            rows={3}
                            className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Hero Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData(
                                    "hero_image",
                                    e.target.files?.[0] ?? null,
                                )
                            }
                            className="block text-sm"
                        />
                        {errors.hero_image && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.hero_image}
                            </p>
                        )}
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.active}
                            onChange={(e) =>
                                setData("active", e.target.checked)
                            }
                        />
                        Active
                    </label>

                    <div>
                        <label className="mb-2 block text-sm font-medium">
                            Products
                        </label>
                        <div className="max-h-64 space-y-1 overflow-y-auto rounded-sm border border-gray-200 p-3">
                            {products.map((p) => (
                                <label
                                    key={p.id}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <input
                                        type="checkbox"
                                        checked={data.product_ids.includes(
                                            p.id,
                                        )}
                                        onChange={() => toggleProduct(p.id)}
                                    />
                                    {p.name}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-sm bg-[#7C3AED] px-6 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {isEdit ? "Save Changes" : "Create Collection"}
                    </button>
                </form>
            </div>
        </>
    );
}
