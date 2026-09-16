import { Head, router, useForm } from "@inertiajs/react";
import { FormEvent } from "react";

interface StyleRow {
    id: number;
    name: string;
    slug: string;
    products_count: number;
}

export default function Index({ styles }: { styles: StyleRow[] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        slug: "",
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/admin/styles", { onSuccess: () => reset() });
    }

    function destroy(id: number) {
        if (
            confirm(
                "Remove this style? Products using it will just have no style set.",
            )
        ) {
            router.delete(`/admin/styles/${id}`);
        }
    }

    return (
        <>
            <Head title="Admin — Styles" />
            <div className="mx-auto max-w-2xl px-4 py-10">
                <h1 className="mb-6 text-xl font-semibold">Styles</h1>

                <form onSubmit={submit} className="mb-8 flex gap-2">
                    <input
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        placeholder="Style name (e.g. Tote Bags)"
                        className="flex-1 rounded-sm border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                        value={data.slug}
                        onChange={(e) => setData("slug", e.target.value)}
                        placeholder="slug (e.g. tote-bags)"
                        className="w-48 rounded-sm border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-sm bg-[#7C3AED] px-4 py-2 text-sm text-white disabled:opacity-50"
                    >
                        Add
                    </button>
                </form>
                {errors.name && (
                    <p className="mb-4 text-xs text-red-600">{errors.name}</p>
                )}
                {errors.slug && (
                    <p className="mb-4 text-xs text-red-600">{errors.slug}</p>
                )}

                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                            <th className="py-2">Name</th>
                            <th>Products</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {styles.map((s) => (
                            <tr key={s.id} className="border-b border-gray-100">
                                <td className="py-2">{s.name}</td>
                                <td>{s.products_count}</td>
                                <td className="text-right">
                                    <button
                                        onClick={() => destroy(s.id)}
                                        className="text-red-600 underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
