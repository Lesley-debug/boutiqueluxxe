import { Head, router, useForm } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import StoreLayout from "@/components/Store/StoreLayout";
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
        <StoreLayout>
            <Head title="My Addresses" />
            <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="font-serif text-4xl font-medium tracking-tight text-[#171310]">
                            My Addresses
                        </h1>
                        <p className="mt-2 text-sm text-[#252525]/60">
                            Manage your delivery and billing addresses
                        </p>
                    </div>
                    {editingId === null && (
                        <button
                            onClick={startAdd}
                            className="rounded-full bg-[#171310] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C]"
                        >
                            + Add Address
                        </button>
                    )}
                </div>

                <div className="space-y-6">
                    {addresses.map((a) => (
                        <div
                            key={a.id}
                            className="rounded-2xl border border-[#171310]/10 bg-white p-6"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    {a.label && (
                                        <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#9C7A3C]">
                                            {a.label}
                                        </p>
                                    )}
                                    <p className="mt-1 text-lg font-medium text-[#171310]">
                                        {a.recipient_name}
                                    </p>
                                    <p className="mt-1 text-sm text-[#252525]/70">
                                        {a.phone}
                                    </p>
                                    <p className="mt-1 text-sm text-[#252525]/70">
                                        {a.address_line}, {a.city}
                                        {a.region && `, ${a.region}`}
                                    </p>
                                    {a.is_default && (
                                        <span className="mt-3 inline-block rounded-full bg-[#9C7A3C]/10 px-3 py-1 text-xs font-medium text-[#9C7A3C]">
                                            Default Address
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => startEdit(a)}
                                        className="text-sm text-[#9C7A3C] underline decoration-1 underline-offset-2 transition hover:text-[#171310]"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => destroy(a.id)}
                                        className="text-sm text-red-600 underline decoration-1 underline-offset-2 transition hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {addresses.length === 0 && editingId === null && (
                        <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-12 text-center">
                            <p className="text-lg text-[#252525]/60">
                                No saved addresses yet.
                            </p>
                            <p className="mt-2 text-sm text-[#252525]/40">
                                Add an address to make checkout faster
                            </p>
                        </div>
                    )}
                </div>

                {editingId !== null && (
                    <form
                        onSubmit={submit}
                        className="mt-8 space-y-6 rounded-2xl border border-[#171310]/10 bg-white p-8"
                    >
                        <div className="mb-6">
                            <h3 className="font-serif text-2xl font-medium tracking-tight text-[#171310]">
                                {editingId === -1 ? "Add New Address" : "Edit Address"}
                            </h3>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#171310]">
                                Label (optional)
                            </label>
                            <input
                                value={data.label}
                                onChange={(e) =>
                                    setData("label", e.target.value)
                                }
                                placeholder="Home, Office, etc."
                                className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#171310]">
                                    Recipient Name
                                </label>
                                <input
                                    value={data.recipient_name}
                                    onChange={(e) =>
                                        setData("recipient_name", e.target.value)
                                    }
                                    className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                />
                                {errors.recipient_name && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.recipient_name}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#171310]">
                                    Phone Number
                                </label>
                                <input
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                    className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                />
                                {errors.phone && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-[#171310]">
                                Street Address
                            </label>
                            <input
                                value={data.address_line}
                                onChange={(e) =>
                                    setData("address_line", e.target.value)
                                }
                                className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                            />
                            {errors.address_line && (
                                <p className="mt-2 text-xs text-red-600">
                                    {errors.address_line}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#171310]">
                                    City
                                </label>
                                <input
                                    value={data.city}
                                    onChange={(e) =>
                                        setData("city", e.target.value)
                                    }
                                    className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                />
                                {errors.city && (
                                    <p className="mt-2 text-xs text-red-600">
                                        {errors.city}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-[#171310]">
                                    Region (optional)
                                </label>
                                <input
                                    value={data.region}
                                    onChange={(e) =>
                                        setData("region", e.target.value)
                                    }
                                    className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                />
                            </div>
                        </div>

                        <label className="flex items-center gap-3 text-sm text-[#171310]">
                            <input
                                type="checkbox"
                                checked={data.is_default}
                                onChange={(e) =>
                                    setData("is_default", e.target.checked)
                                }
                                className="h-4 w-4 rounded border-[#171310]/20 text-[#9C7A3C] focus:ring-2 focus:ring-[#9C7A3C]/20"
                            />
                            <span>Set as default address</span>
                        </label>

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-full bg-[#171310] px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C] disabled:opacity-40"
                            >
                                {processing ? "Saving..." : "Save Address"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="rounded-full border border-[#171310]/15 px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#171310] transition duration-300 hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </StoreLayout>
    );
}
