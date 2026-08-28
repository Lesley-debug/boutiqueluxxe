import { Head, router, useForm } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import type { Address } from "@/types/account";

export default function Addresses({ addresses }: { addresses: Address[] }) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const { data, setData, post, put, processing, errors, reset } = useForm({
        label: "",
        recipient_name: "",
        phone: "",
        address_line: "",
        city: "",
        region: "",
        is_default: false,
    });

    function startAdd() {
        setEditingId(-1);
        reset();
    }

    function startEdit(a: Address) {
        setEditingId(a.id);
        setData({
            label: a.label ?? "",
            recipient_name: a.recipient_name,
            phone: a.phone,
            address_line: a.address_line,
            city: a.city,
            region: a.region ?? "",
            is_default: a.is_default,
        });
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (editingId === -1) {
            post("/account/addresses", { onSuccess: () => setEditingId(null) });
        } else if (editingId !== null) {
            put(`/account/addresses/${editingId}`, {
                onSuccess: () => setEditingId(null),
            });
        }
    }

    function destroy(id: number) {
        if (confirm("Delete this address?")) {
            router.delete(`/account/addresses/${id}`);
        }
    }

    return (
        <>
            <Head title="My Addresses" />
            <div className="mx-auto max-w-2xl px-4 py-10">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">My Addresses</h1>
                    {editingId === null && (
                        <button
                            onClick={startAdd}
                            className="rounded-sm bg-stone-900 px-4 py-2 text-sm text-white"
                        >
                            + Add Address
                        </button>
                    )}
                </div>

                <div className="space-y-4">
                    {addresses.map((a) => (
                        <div
                            key={a.id}
                            className="rounded-sm border border-stone-200 p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    {a.label && (
                                        <p className="text-xs uppercase text-stone-500">
                                            {a.label}
                                        </p>
                                    )}
                                    <p className="text-sm font-medium">
                                        {a.recipient_name}
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        {a.phone}
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        {a.address_line}, {a.city}
                                        {a.region && `, ${a.region}`}
                                    </p>
                                    {a.is_default && (
                                        <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <div className="space-x-3 text-sm">
                                    <button
                                        onClick={() => startEdit(a)}
                                        className="text-stone-600 underline"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => destroy(a.id)}
                                        className="text-red-600 underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {addresses.length === 0 && editingId === null && (
                        <p className="text-stone-500">
                            No saved addresses yet.
                        </p>
                    )}
                </div>

                {editingId !== null && (
                    <form
                        onSubmit={submit}
                        className="mt-6 space-y-4 rounded-sm border border-stone-200 p-4"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Label (optional)
                            </label>
                            <input
                                value={data.label}
                                onChange={(e) =>
                                    setData("label", e.target.value)
                                }
                                placeholder="Home, Office..."
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Recipient Name
                            </label>
                            <input
                                value={data.recipient_name}
                                onChange={(e) =>
                                    setData("recipient_name", e.target.value)
                                }
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                            {errors.recipient_name && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.recipient_name}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Phone
                            </label>
                            <input
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                            {errors.phone && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.phone}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Address
                            </label>
                            <input
                                value={data.address_line}
                                onChange={(e) =>
                                    setData("address_line", e.target.value)
                                }
                                className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                            />
                            {errors.address_line && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.address_line}
                                </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    City
                                </label>
                                <input
                                    value={data.city}
                                    onChange={(e) =>
                                        setData("city", e.target.value)
                                    }
                                    className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                                />
                                {errors.city && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.city}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Region
                                </label>
                                <input
                                    value={data.region}
                                    onChange={(e) =>
                                        setData("region", e.target.value)
                                    }
                                    className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={data.is_default}
                                onChange={(e) =>
                                    setData("is_default", e.target.checked)
                                }
                            />
                            Set as default address
                        </label>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-sm bg-stone-900 px-4 py-2 text-sm text-white disabled:opacity-50"
                            >
                                Save Address
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="rounded-sm border border-stone-300 px-4 py-2 text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
