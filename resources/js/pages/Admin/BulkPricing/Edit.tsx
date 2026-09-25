import { useForm } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Button } from "@/components/admin/ui";

interface VariantRow {
    id: number;
    product_id: number;
    sku: string;
    price_override: string | null;
}

interface ProductRow {
    id: number;
    name: string;
    brand: string | null;
    base_price: string;
    sale_price: string | null;
    variants: VariantRow[];
}

export default function Edit({ products }: { products: ProductRow[] }) {
    const [rows, setRows] = useState(
        products.map((p) => ({
            id: p.id,
            name: p.name,
            base_price: p.base_price,
            sale_price: p.sale_price ?? "",
            variants: p.variants.map((v) => ({
                id: v.id,
                sku: v.sku,
                price_override: v.price_override ?? "",
            })),
        })),
    );
    const { post, processing } = useForm();

    function updateProduct(
        id: number,
        field: "base_price" | "sale_price",
        value: string,
    ) {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
        );
    }

    function updateVariant(
        productId: number,
        variantId: number,
        value: string,
    ) {
        setRows((prev) =>
            prev.map((r) =>
                r.id === productId
                    ? {
                          ...r,
                          variants: r.variants.map((v) =>
                              v.id === variantId
                                  ? { ...v, price_override: value }
                                  : v,
                          ),
                      }
                    : r,
            ),
        );
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/admin/bulk-pricing", {
            data: {
                products: rows.map((r) => ({
                    id: r.id,
                    base_price: r.base_price,
                    sale_price: r.sale_price || null,
                })),
                variants: rows.flatMap((r) =>
                    r.variants.map((v) => ({
                        id: v.id,
                        price_override: v.price_override || null,
                    })),
                ),
            },
            preserveScroll: true,
        } as any);
    }

    return (
        <AdminLayout title="Bulk Pricing">
            <p className="mb-5 text-sm text-stone-500">
                Enter real USD prices for every product. Leave "Sale Price"
                blank if there's no discount. Variant price overrides only apply
                if that specific variant should cost differently than the base
                product.
            </p>

            <form onSubmit={submit} className="space-y-3">
                {rows.map((row) => (
                    <Card key={row.id}>
                        <p className="mb-3 text-sm font-semibold text-[#171310]">
                            {row.name}
                        </p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <div>
                                <label className="mb-1 block text-xs text-stone-500">
                                    Base Price ($)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={row.base_price}
                                    onChange={(e) =>
                                        updateProduct(
                                            row.id,
                                            "base_price",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs text-stone-500">
                                    Sale Price ($, optional)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={row.sale_price}
                                    onChange={(e) =>
                                        updateProduct(
                                            row.id,
                                            "sale_price",
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                                />
                            </div>
                        </div>

                        {row.variants.length > 0 && (
                            <div className="mt-3 border-t border-stone-100 pt-3">
                                <p className="mb-2 text-xs font-medium text-stone-500">
                                    Variant Overrides (optional)
                                </p>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    {row.variants.map((v) => (
                                        <div key={v.id}>
                                            <label className="mb-1 block text-xs text-stone-400">
                                                {v.sku}
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                placeholder="—"
                                                value={v.price_override}
                                                onChange={(e) =>
                                                    updateVariant(
                                                        row.id,
                                                        v.id,
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full rounded-lg border border-stone-300 px-2 py-1.5 text-sm"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                ))}

                <div className="sticky bottom-4 flex justify-end">
                    <Button type="submit" disabled={processing}>
                        Save All Prices
                    </Button>
                </div>
            </form>
        </AdminLayout>
    );
}
