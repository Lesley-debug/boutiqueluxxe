import { Head, useForm, usePage } from "@inertiajs/react";
import { FormEvent } from "react";
import type { Cart } from "@/types/cart";

interface CheckoutProps {
    cart: Cart;
    user: { name: string; email: string } | null;
}

export default function Checkout({ cart, user }: CheckoutProps) {
    const pageErrors = usePage().props.errors;
    const { data, setData, post, processing, errors } = useForm({
        customer_name: user?.name ?? "",
        customer_email: user?.email ?? "",
        customer_phone: "",
        shipping_address: "",
        city: "",
        region: "",
        notes: "",
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/checkout");
    }

    return (
        <>
            <Head title="Checkout" />
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-3">
                <form onSubmit={submit} className="space-y-4 lg:col-span-2">
                    <h1 className="text-xl font-semibold text-stone-900">
                        Shipping Details
                    </h1>

                    {pageErrors.stock && (
                        <p className="text-sm text-red-600">
                            {pageErrors.stock}
                        </p>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Full Name
                        </label>
                        <input
                            value={data.customer_name}
                            onChange={(e) =>
                                setData("customer_name", e.target.value)
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                        {errors.customer_name && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.customer_name}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            value={data.customer_email}
                            onChange={(e) =>
                                setData("customer_email", e.target.value)
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                        {errors.customer_email && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.customer_email}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Phone
                        </label>
                        <input
                            value={data.customer_phone}
                            onChange={(e) =>
                                setData("customer_phone", e.target.value)
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Shipping Address
                        </label>
                        <input
                            value={data.shipping_address}
                            onChange={(e) =>
                                setData("shipping_address", e.target.value)
                            }
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                        {errors.shipping_address && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.shipping_address}
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

                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Order Notes (optional)
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
                            rows={3}
                            className="w-full rounded-sm border border-stone-300 px-3 py-2 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full rounded-sm bg-stone-900 px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
                    >
                        Place Order
                    </button>
                </form>

                <div className="rounded-sm border border-stone-200 p-4">
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-stone-500">
                        Order Summary
                    </h2>
                    <div className="space-y-2">
                        {cart.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between text-sm"
                            >
                                <span>
                                    {item.variant.product.name} ×{" "}
                                    {item.quantity}
                                </span>
                                <span>
                                    {Number(item.line_total).toLocaleString()}{" "}
                                    FCFA
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-1 border-t border-stone-200 pt-3 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>
                                {Number(cart.subtotal).toLocaleString()} FCFA
                            </span>
                        </div>
                        {cart.discount_amount > 0 && (
                            <div className="flex justify-between text-green-700">
                                <span>
                                    Discount{" "}
                                    {cart.discount
                                        ? `(${cart.discount.code})`
                                        : ""}
                                </span>
                                <span>
                                    −
                                    {Number(
                                        cart.discount_amount,
                                    ).toLocaleString()}{" "}
                                    FCFA
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>
                                {Number(cart.total).toLocaleString()} FCFA
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
