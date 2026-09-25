import AdminLayout from "@/components/admin/AdminLayout";
import { useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import ImageManager from "@/components/admin/ImageManager";
import VariantManager from "@/components/admin/VariantManager";
import type { ProductImage, ProductVariant } from "@/types/catalog";

interface CategoryOption {
    id: number;
    name: string;
}

interface StyleOption {
    id: number;
    name: string;
    slug: string;
}

interface FormProps {
    product?: {
        id: number;
        category_id: number;
        style_id: number | null;
        brand: string | null;
        name: string;
        slug: string;
        description: string | null;
        base_price: string;
        sale_price: string | null;
        status: string;
        featured: boolean;
        new_arrival: boolean;
        variants: ProductVariant[];
        images: ProductImage[];
    };
    categories: CategoryOption[];
    styles: StyleOption[];
}

export default function Form({ product, categories, styles }: FormProps) {
    const isEdit = !!product;
    const { data, setData, post, put, processing, errors } = useForm({
        category_id: product?.category_id?.toString() ?? "",
        style_id: product?.style_id?.toString() ?? "",
        brand: product?.brand ?? "",
        name: product?.name ?? "",
        slug: product?.slug ?? "",
        description: product?.description ?? "",
        base_price: product?.base_price ?? "",
        sale_price: product?.sale_price ?? "",
        status: product?.status ?? "draft",
        featured: product?.featured ?? false,
        new_arrival: product?.new_arrival ?? false,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/products/${product!.id}`);
        } else {
            post("/admin/products");
        }
    }

    return (
        <AdminLayout title={isEdit ? "Edit Product" : "New Product"}>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Category
                        </label>
                        <select
                            value={data.category_id}
                            onChange={(e) =>
                                setData("category_id", e.target.value)
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        >
                            <option value="">Select a category</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {errors.category_id && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.category_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Style (optional)
                        </label>
                        <select
                            value={data.style_id}
                            onChange={(e) => {
                                const selectedStyleId = e.target.value;
                                setData("style_id", selectedStyleId);

                                // Auto-fill slug when style is selected (only once if slug is empty)
                                if (selectedStyleId && !data.slug) {
                                    const selectedStyle = styles.find(
                                        (s) => s.id.toString() === selectedStyleId
                                    );
                                    if (selectedStyle) {
                                        setData((prev) => ({
                                            ...prev,
                                            style_id: selectedStyleId,
                                            slug: selectedStyle.slug,
                                        }));
                                    }
                                }
                            }}
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        >
                            <option value="">No style</option>
                            {styles.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                </option>
                            ))}
                        </select>
                        {errors.style_id && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.style_id}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Brand
                        </label>
                        <input
                            value={data.brand}
                            onChange={(e) => setData("brand", e.target.value)}
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>

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
                            Description
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
                            rows={4}
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Base Price ($)
                            </label>
                            <input
                                type="number"
                                value={data.base_price}
                                onChange={(e) =>
                                    setData("base_price", e.target.value)
                                }
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                            {errors.base_price && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.base_price}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Sale Price (optional)
                            </label>
                            <input
                                type="number"
                                value={data.sale_price}
                                onChange={(e) =>
                                    setData("sale_price", e.target.value)
                                }
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                            {errors.sale_price && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.sale_price}
                                </p>
                            )}
                        </div>
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
                            <option value="draft">Draft</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.featured}
                                onChange={(e) =>
                                    setData("featured", e.target.checked)
                                }
                            />
                            Featured
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.new_arrival}
                                onChange={(e) =>
                                    setData("new_arrival", e.target.checked)
                                }
                            />
                            New Arrival
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-sm bg-stone-900 px-6 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {isEdit ? "Save Changes" : "Create Product"}
                    </button>
                </form>

                {isEdit && (
                    <>
                        <VariantManager
                            productId={product!.id}
                            variants={product!.variants}
                        />
                        <ImageManager
                            productId={product!.id}
                            images={product!.images}
                        />
                    </>
                )}
        </AdminLayout>
    );
}
