import { Head, useForm, usePage, Link } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import { Check, ChevronRight, Package, CreditCard, Eye } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";
import Reveal from "@/components/Store/Reveal";
import type { Address } from "@/types/account";
import type { Cart } from "@/types/cart";

type FulfillmentMethod = "delivery" | "pickup";
type CheckoutStep = 1 | 2 | 3;

interface CheckoutProps {
    cart: Cart;
    user: { name: string; email: string } | null;
    addresses?: Address[];
    pickupLocation?: {
        name: string;
        address: string;
        hours: string;
    };
}

interface CheckoutForm {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    fulfillment_method: FulfillmentMethod;
    shipping_address: string;
    city: string;
    region: string;
    notes: string;
}

export default function Checkout({
    cart,
    user,
    addresses = [],
    pickupLocation,
}: CheckoutProps) {
    const pageErrors = usePage().props.errors;
    const defaultAddress = addresses[0];
    const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
    
    const { data, setData, post, processing, errors } = useForm<CheckoutForm>({
        customer_name: user?.name ?? "",
        customer_email: user?.email ?? "",
        customer_phone: defaultAddress?.phone ?? "",
        fulfillment_method: "delivery",
        shipping_address: defaultAddress?.address_line ?? "",
        city: defaultAddress?.city ?? "",
        region: defaultAddress?.region ?? "",
        notes: "",
    });

    function selectAddress(addressId: string) {
        const address = addresses.find((a) => a.id === Number(addressId));
        if (!address) return;

        setData((current) => ({
            ...current,
            customer_phone: address.phone,
            shipping_address: address.address_line,
            city: address.city,
            region: address.region ?? "",
        }));
    }

    function validateStep(step: CheckoutStep): boolean {
        if (step === 1) {
            if (!data.customer_name || !data.customer_email || !data.customer_phone) {
                return false;
            }
            if (data.fulfillment_method === "delivery") {
                return !!(data.shipping_address && data.city);
            }
            return true;
        }
        return true;
    }

    function nextStep() {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(3, prev + 1) as CheckoutStep);
        }
    }

    function prevStep() {
        setCurrentStep((prev) => Math.max(1, prev - 1) as CheckoutStep);
    }

    function submit(e: FormEvent) {
        e.preventDefault();
        if (currentStep === 3) {
            post("/checkout");
        }
    }

    const steps = [
        { number: 1, title: "Shipping", icon: Package },
        { number: 2, title: "Payment", icon: CreditCard },
        { number: 3, title: "Review", icon: Eye },
    ];

    return (
        <StoreLayout>
            <Head title="Checkout" />
            <div className="min-h-screen bg-[#F8F5EF] py-12">
                <div className="mx-auto max-w-6xl px-6">
                    {/* Progress Steps */}
                    <Reveal>
                        <div className="mb-12">
                            <div className="mx-auto max-w-3xl">
                                <div className="relative flex items-center justify-between">
                                    {/* Progress Line */}
                                    <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-[#171310]/10">
                                        <div
                                            className="h-full bg-[#9C7A3C] transition-all duration-500"
                                            style={{
                                                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                                            }}
                                        />
                                    </div>

                                    {/* Step Indicators */}
                                    {steps.map((step, index) => {
                                        const Icon = step.icon;
                                        const isComplete = currentStep > step.number;
                                        const isCurrent = currentStep === step.number;

                                        return (
                                            <div
                                                key={step.number}
                                                className="relative flex flex-col items-center"
                                            >
                                                <div
                                                    className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                                        isComplete
                                                            ? "border-[#9C7A3C] bg-[#9C7A3C]"
                                                            : isCurrent
                                                              ? "border-[#9C7A3C] bg-white"
                                                              : "border-[#171310]/20 bg-white"
                                                    }`}
                                                >
                                                    {isComplete ? (
                                                        <Check className="h-6 w-6 text-white" />
                                                    ) : (
                                                        <Icon
                                                            className={`h-6 w-6 ${isCurrent ? "text-[#9C7A3C]" : "text-[#171310]/30"}`}
                                                        />
                                                    )}
                                                </div>
                                                <span
                                                    className={`mt-3 text-xs font-medium uppercase tracking-[0.1em] ${
                                                        isCurrent || isComplete
                                                            ? "text-[#171310]"
                                                            : "text-[#252525]/40"
                                                    }`}
                                                >
                                                    {step.title}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    <form onSubmit={submit} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            <Reveal delay={100}>
                                <div className="rounded-2xl border border-[#171310]/10 bg-white p-8">
                                    {pageErrors.stock && (
                                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                                            {pageErrors.stock}
                                        </div>
                                    )}

                                    {/* Step 1: Shipping */}
                                    {currentStep === 1 && (
                                        <div className="space-y-6">
                                            <h2 className="font-serif text-2xl font-medium text-[#171310]">
                                                Shipping Details
                                            </h2>

                                            {/* Fulfillment Method */}
                                            <div>
                                                <label className="mb-3 block text-sm font-medium uppercase tracking-[0.1em] text-[#252525]/70">
                                                    Fulfillment Method
                                                </label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {(["delivery", "pickup"] as FulfillmentMethod[]).map(
                                                        (method) => (
                                                            <button
                                                                key={method}
                                                                type="button"
                                                                onClick={() =>
                                                                    setData("fulfillment_method", method)
                                                                }
                                                                className={`rounded-full border-2 px-6 py-3 text-sm font-medium capitalize transition ${
                                                                    data.fulfillment_method === method
                                                                        ? "border-[#9C7A3C] bg-[#9C7A3C] text-white"
                                                                        : "border-[#171310]/15 bg-white text-[#171310] hover:border-[#171310]/30"
                                                                }`}
                                                            >
                                                                {method}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {/* Contact Information */}
                                            <div className="space-y-4">
                                                <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-[#252525]/70">
                                                    Contact Information
                                                </h3>

                                                <div>
                                                    <label className="mb-2 block text-sm text-[#252525]/70">
                                                        Full Name *
                                                    </label>
                                                    <input
                                                        value={data.customer_name}
                                                        onChange={(e) =>
                                                            setData("customer_name", e.target.value)
                                                        }
                                                        className="w-full rounded-full border border-[#171310]/15 bg-[#F8F5EF] px-5 py-3 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                                    />
                                                    {errors.customer_name && (
                                                        <p className="mt-2 text-xs text-red-600">
                                                            {errors.customer_name}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className="mb-2 block text-sm text-[#252525]/70">
                                                            Email *
                                                        </label>
                                                        <input
                                                            type="email"
                                                            value={data.customer_email}
                                                            onChange={(e) =>
                                                                setData("customer_email", e.target.value)
                                                            }
                                                            className="w-full rounded-full border border-[#171310]/15 bg-[#F8F5EF] px-5 py-3 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                                        />
                                                        {errors.customer_email && (
                                                            <p className="mt-2 text-xs text-red-600">
                                                                {errors.customer_email}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div>
                                                        <label className="mb-2 block text-sm text-[#252525]/70">
                                                            Phone *
                                                        </label>
                                                        <input
                                                            value={data.customer_phone}
                                                            onChange={(e) =>
                                                                setData("customer_phone", e.target.value)
                                                            }
                                                            className="w-full rounded-full border border-[#171310]/15 bg-[#F8F5EF] px-5 py-3 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                                        />
                                                        {errors.customer_phone && (
                                                            <p className="mt-2 text-xs text-red-600">
                                                                {errors.customer_phone}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delivery Address */}
                                            {data.fulfillment_method === "delivery" ? (
                                                <div className="space-y-4">
                                                    <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-[#252525]/70">
                                                        Delivery Address
                                                    </h3>

                                                    {addresses.length > 0 && (
                                                        <div>
                                                            <label className="mb-2 block text-sm text-[#252525]/70">
                                                                Saved Address
                                                            </label>
                                                            <select
                                                                defaultValue=""
                                                                onChange={(e) => selectAddress(e.target.value)}
                                                                className="w-full rounded-full border border-[#171310]/15 bg-[#F8F5EF] px-5 py-3 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                                            >
                                                                <option value="" disabled>
                                                                    Choose an address
                                                                </option>
                                                                {addresses.map((address) => (
                                                                    <option key={address.id} value={address.id}>
                                                                        {address.label ?? address.address_line}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="mb-2 block text-sm text-[#252525]/70">
                                                            Street Address *
                                                        </label>
                                                        <input
                                                            value={data.shipping_address}
                                                            onChange={(e) =>
                                                                setData("shipping_address", e.target.value)
                                                            }
                                                            className="w-full rounded-full border border-[#171310]/15 bg-[#F8F5EF] px-5 py-3 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                                        />
                                                        {errors.shipping_address && (
                                                            <p className="mt-2 text-xs text-red-600">
                                                                {errors.shipping_address}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="mb-2 block text-sm text-[#252525]/70">
                                                                City *
                                                            </label>
                                                            <input
                                                                value={data.city}
                                                                onChange={(e) => setData("city", e.target.value)}
                                                                className="w-full rounded-full border border-[#171310]/15 bg-[#F8F5EF] px-5 py-3 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                                            />
                                                            {errors.city && (
                                                                <p className="mt-2 text-xs text-red-600">
                                                                    {errors.city}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="mb-2 block text-sm text-[#252525]/70">
                                                                Region
                                                            </label>
                                                            <input
                                                                value={data.region}
                                                                onChange={(e) =>
                                                                    setData("region", e.target.value)
                                                                }
                                                                className="w-full rounded-full border border-[#171310]/15 bg-[#F8F5EF] px-5 py-3 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                pickupLocation && (
                                                    <div className="rounded-xl border border-[#9C7A3C]/20 bg-[#9C7A3C]/5 p-6">
                                                        <h3 className="mb-3 text-sm font-medium uppercase tracking-[0.1em] text-[#9C7A3C]">
                                                            Pickup Location
                                                        </h3>
                                                        <p className="font-serif text-lg text-[#171310]">
                                                            {pickupLocation.name}
                                                        </p>
                                                        <p className="mt-2 text-sm text-[#252525]/70">
                                                            {pickupLocation.address}
                                                        </p>
                                                        <p className="mt-1 text-sm text-[#252525]/70">
                                                            {pickupLocation.hours}
                                                        </p>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    )}

                                    {/* Step 2: Payment */}
                                    {currentStep === 2 && (
                                        <div className="space-y-6">
                                            <h2 className="font-serif text-2xl font-medium text-[#171310]">
                                                Payment Method
                                            </h2>
                                            <div className="rounded-xl border border-[#9C7A3C]/20 bg-[#9C7A3C]/5 p-6 text-center">
                                                <CreditCard className="mx-auto h-12 w-12 text-[#9C7A3C]" />
                                                <p className="mt-4 font-serif text-lg text-[#171310]">
                                                    Payment on Delivery
                                                </p>
                                                <p className="mt-2 text-sm text-[#252525]/70">
                                                    Pay with cash or mobile money when you receive your order
                                                </p>
                                            </div>

                                            <div>
                                                <label className="mb-2 block text-sm text-[#252525]/70">
                                                    Order Notes (optional)
                                                </label>
                                                <textarea
                                                    value={data.notes}
                                                    onChange={(e) => setData("notes", e.target.value)}
                                                    rows={4}
                                                    placeholder="Any special instructions for your order..."
                                                    className="w-full rounded-2xl border border-[#171310]/15 bg-[#F8F5EF] px-5 py-3 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Step 3: Review */}
                                    {currentStep === 3 && (
                                        <div className="space-y-6">
                                            <h2 className="font-serif text-2xl font-medium text-[#171310]">
                                                Review Your Order
                                            </h2>

                                            {/* Contact Info Review */}
                                            <div className="space-y-3 rounded-xl bg-[#F8F5EF] p-6">
                                                <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-[#252525]/70">
                                                    Contact Information
                                                </h3>
                                                <p className="text-sm text-[#171310]">{data.customer_name}</p>
                                                <p className="text-sm text-[#252525]/70">
                                                    {data.customer_email}
                                                </p>
                                                <p className="text-sm text-[#252525]/70">
                                                    {data.customer_phone}
                                                </p>
                                            </div>

                                            {/* Shipping Info Review */}
                                            <div className="space-y-3 rounded-xl bg-[#F8F5EF] p-6">
                                                <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-[#252525]/70">
                                                    {data.fulfillment_method === "delivery"
                                                        ? "Delivery Address"
                                                        : "Pickup Location"}
                                                </h3>
                                                {data.fulfillment_method === "delivery" ? (
                                                    <>
                                                        <p className="text-sm text-[#171310]">
                                                            {data.shipping_address}
                                                        </p>
                                                        <p className="text-sm text-[#252525]/70">
                                                            {data.city}
                                                            {data.region && `, ${data.region}`}
                                                        </p>
                                                    </>
                                                ) : (
                                                    pickupLocation && (
                                                        <>
                                                            <p className="text-sm text-[#171310]">
                                                                {pickupLocation.name}
                                                            </p>
                                                            <p className="text-sm text-[#252525]/70">
                                                                {pickupLocation.address}
                                                            </p>
                                                        </>
                                                    )
                                                )}
                                            </div>

                                            {/* Order Items Review */}
                                            <div className="space-y-4 rounded-xl bg-[#F8F5EF] p-6">
                                                <h3 className="text-sm font-medium uppercase tracking-[0.1em] text-[#252525]/70">
                                                    Order Items ({cart.item_count})
                                                </h3>
                                                {cart.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between text-sm"
                                                    >
                                                        <span className="text-[#171310]">
                                                            {item.variant.product.name} × {item.quantity}
                                                        </span>
                                                        <span className="font-medium text-[#171310]">
                                                            {Number(item.line_total).toLocaleString()} FCFA
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Navigation Buttons */}
                                    <div className="mt-8 flex gap-3">
                                        {currentStep > 1 && (
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="flex-1 rounded-full border border-[#171310]/20 py-3.5 text-sm font-medium uppercase tracking-[0.1em] text-[#171310] transition hover:border-[#171310] hover:bg-white"
                                            >
                                                Back
                                            </button>
                                        )}
                                        {currentStep < 3 ? (
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                disabled={!validateStep(currentStep)}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171310] py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-white transition hover:bg-[#9C7A3C] disabled:opacity-50"
                                            >
                                                <span>Continue</span>
                                                <ChevronRight className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="flex-1 rounded-full bg-[#171310] py-3.5 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C] disabled:opacity-50"
                                            >
                                                {processing ? "Processing..." : "Place Order"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </Reveal>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-1">
                            <Reveal delay={200}>
                                <div className="sticky top-24 rounded-2xl border border-[#171310]/10 bg-white p-6">
                                    <h2 className="mb-4 font-serif text-lg font-medium text-[#171310]">
                                        Order Summary
                                    </h2>
                                    <div className="mb-4 space-y-3 border-b border-[#171310]/10 pb-4">
                                        {cart.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex justify-between text-sm"
                                            >
                                                <span className="text-[#252525]/70">
                                                    {item.variant.product.name} × {item.quantity}
                                                </span>
                                                <span className="font-medium text-[#171310]">
                                                    {Number(item.line_total).toLocaleString()} FCFA
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-[#252525]/70">Subtotal</span>
                                            <span className="font-medium text-[#171310]">
                                                {Number(cart.subtotal).toLocaleString()} FCFA
                                            </span>
                                        </div>
                                        {cart.discount_amount > 0 && (
                                            <div className="flex justify-between text-[#9C7A3C]">
                                                <span>
                                                    Discount{" "}
                                                    {cart.discount ? `(${cart.discount.code})` : ""}
                                                </span>
                                                <span className="font-medium">
                                                    −{Number(cart.discount_amount).toLocaleString()} FCFA
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-[#171310]/10 pt-3">
                                            <span className="font-serif text-base font-medium text-[#171310]">
                                                Total
                                            </span>
                                            <span className="font-serif text-lg font-medium text-[#171310]">
                                                {Number(cart.total).toLocaleString()} FCFA
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    </form>
                </div>
            </div>
        </StoreLayout>
    );
}
