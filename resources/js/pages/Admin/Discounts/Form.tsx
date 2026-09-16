import AdminLayout from "@/components/admin/AdminLayout";
import { useForm } from "@inertiajs/react";
import { FormEvent } from "react";

interface DiscountData {
    id: number;
    code: string;
    type: string;
    value: string;
    min_order_amount: string | null;
    max_uses: number | null;
    starts_at: string | null;
    expires_at: string | null;
    active: boolean;
}

export default function Form({ discount }: { discount?: DiscountData }) {
    const isEdit = !!discount;
    const { data, setData, post, put, processing, errors } = useForm({
        code: discount?.code ?? "",
        type: discount?.type ?? "percentage",
        value: discount?.value ?? "",
        min_order_amount: discount?.min_order_amount ?? "",
        max_uses: discount?.max_uses ?? "",
        starts_at: discount?.starts_at?.slice(0, 10) ?? "",
        expires_at: discount?.expires_at?.slice(0, 10) ?? "",
        active: discount?.active ?? true,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        if (isEdit) {
            put(`/admin/discounts/${discount!.id}`);
        } else {
            post("/admin/discounts");
        }
    }

    return (
        <AdminLayout title={isEdit ? "Edit Discount" : "New Discount"}>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Code
                        </label>
                        <input
                            value={data.code}
                            onChange={(e) =>
                                setData("code", e.target.value.toUpperCase())
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm font-mono"
                            placeholder="SUMMER25"
                        />
                        {errors.code && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.code}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Type
                            </label>
                            <select
                                value={data.type}
                                onChange={(e) =>
                                    setData("type", e.target.value)
                                }
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            >
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </select>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Value{" "}
                                {data.type === "percentage" ? "(%)" : "(FCFA)"}
                            </label>
                            <input
                                type="number"
                                value={data.value}
                                onChange={(e) =>
                                    setData("value", e.target.value)
                                }
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                            {errors.value && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.value}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Minimum Order Amount (optional)
                        </label>
                        <input
                            type="number"
                            value={data.min_order_amount}
                            onChange={(e) =>
                                setData("min_order_amount", e.target.value)
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Max Uses (optional, blank = unlimited)
                        </label>
                        <input
                            type="number"
                            value={data.max_uses ?? ""}
                            onChange={(e) =>
                                setData("max_uses", e.target.value)
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Starts (optional)
                            </label>
                            <input
                                type="date"
                                value={data.starts_at}
                                onChange={(e) =>
                                    setData("starts_at", e.target.value)
                                }
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Expires (optional)
                            </label>
                            <input
                                type="date"
                                value={data.expires_at}
                                onChange={(e) =>
                                    setData("expires_at", e.target.value)
                                }
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                            {errors.expires_at && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.expires_at}
                                </p>
                            )}
                        </div>
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

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-sm bg-stone-900 px-6 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {isEdit ? "Save Changes" : "Create Discount"}
                    </button>
                </form>
        </AdminLayout>
    );
}
