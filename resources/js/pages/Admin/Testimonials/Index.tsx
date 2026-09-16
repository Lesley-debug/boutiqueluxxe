import AdminLayout from "@/components/admin/AdminLayout";
import { router, useForm } from "@inertiajs/react";
import { FormEvent } from "react";

interface TestimonialRow {
    id: number;
    customer_name: string;
    quote: string;
    rating: number;
    active: boolean;
}

export default function Index({
    testimonials,
}: {
    testimonials: TestimonialRow[];
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        customer_name: "",
        quote: "",
        rating: 5,
        active: true,
        sort_order: 0,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/admin/testimonials", { onSuccess: () => reset() });
    }

    function destroy(id: number) {
        if (confirm("Remove this testimonial?")) {
            router.delete(`/admin/testimonials/${id}`);
        }
    }

    return (
        <AdminLayout title="Testimonials">
                <p className="mb-6 text-sm text-gray-500">
                    Only add quotes from real customers who've given permission.
                </p>

                <form
                    onSubmit={submit}
                    className="mb-8 space-y-3 rounded-2xl border border-gray-200 p-5"
                >
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Customer Name
                        </label>
                        <input
                            value={data.customer_name}
                            onChange={(e) =>
                                setData("customer_name", e.target.value)
                            }
                            className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                        />
                        {errors.customer_name && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.customer_name}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Quote
                        </label>
                        <textarea
                            value={data.quote}
                            onChange={(e) => setData("quote", e.target.value)}
                            rows={3}
                            className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                        />
                        {errors.quote && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.quote}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Rating
                        </label>
                        <select
                            value={data.rating}
                            onChange={(e) =>
                                setData("rating", Number(e.target.value))
                            }
                            className="rounded-sm border border-gray-300 px-3 py-2 text-sm"
                        >
                            {[5, 4, 3, 2, 1].map((n) => (
                                <option key={n} value={n}>
                                    {n} ★
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-full bg-[#171310] px-6 py-2 text-sm text-white disabled:opacity-50"
                    >
                        Add Testimonial
                    </button>
                </form>

                <div className="space-y-3">
                    {testimonials.map((t) => (
                        <div
                            key={t.id}
                            className="rounded-2xl border border-gray-200 p-4"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-amber-500">
                                        {"★".repeat(t.rating)}
                                    </p>
                                    <p className="mt-1 text-sm italic text-gray-700">
                                        "{t.quote}"
                                    </p>
                                    <p className="mt-2 text-xs text-gray-500">
                                        — {t.customer_name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => destroy(t.id)}
                                    className="text-xs text-red-600 underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                    {testimonials.length === 0 && (
                        <p className="py-8 text-center text-sm text-gray-400">
                            No testimonials yet.
                        </p>
                    )}
                </div>
        </AdminLayout>
    );
}
