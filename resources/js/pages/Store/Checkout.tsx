import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FormEvent, useState } from "react";
import {
    ArrowLeft,
    BadgeCheck,
    Check,
    ChevronRight,
    Clock,
    MapPin,
    Shield,
} from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";
import { formatPrice } from "@/lib/format";
import type { Address } from "@/types/account";
import type { Cart } from "@/types/cart";

interface CheckoutProps {
    cart: Cart;
    user: { name: string; email: string } | null;
    addresses?: Address[];
}

interface CheckoutForm {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    fulfillment_method: "delivery";
    shipping_address: string;
    city: string;
    region: string;
    notes: string;
}


const TRUST = [
    { icon: Shield, text: "Secure Reservation" },
    { icon: BadgeCheck, text: "Authenticity & Quality Guarantee" },
    { icon: Clock, text: "24-Hour Concierge Response" },
];

const inputCls =
    "w-full rounded-xl border border-[#171310]/15 bg-[#F8F5EF] px-4 py-3 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20";
const labelCls = "mb-1.5 block text-xs font-medium text-[#252525]/60";

type View = "form" | "review";
type CheckoutErrors = Partial<Record<keyof CheckoutForm, string>>;
type SetCheckoutData = <K extends keyof CheckoutForm>(
    key: K,
    value: CheckoutForm[K],
) => void;

function OrderSummaryCard({ cart }: { cart: Cart }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-[#171310]/8 bg-white">
            <div className="border-b border-[#171310]/8 px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">
                    Order Summary
                </p>
            </div>

            <div className="divide-y divide-[#171310]/5">
                {cart.items.map((item) => {
                    const img = item.variant.product.images?.[0];
                    const variantParts = [
                        item.variant.color,
                        item.variant.size,
                        item.variant.material,
                    ].filter(Boolean);

                    return (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 px-5 py-4"
                        >
                            {img ? (
                                <img
                                    src={img.url}
                                    alt={item.variant.product.name}
                                    className="h-14 w-14 flex-shrink-0 rounded-xl object-cover"
                                />
                            ) : (
                                <div className="h-14 w-14 flex-shrink-0 rounded-xl bg-[#F8F5EF]" />
                            )}

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[#171310]">
                                    {item.variant.product.name}
                                </p>
                                {variantParts.length > 0 && (
                                    <p className="mt-0.5 text-[11px] text-[#252525]/45">
                                        {variantParts.join(" · ")}
                                    </p>
                                )}
                                <p className="mt-0.5 text-[11px] text-[#252525]/45">
                                    Qty {item.quantity}
                                </p>
                            </div>

                            <p className="flex-shrink-0 text-sm font-semibold text-[#171310]">
                                {formatPrice(item.line_total)}
                            </p>
                        </div>
                    );
                })}
            </div>

            <div className="space-y-2.5 border-t border-[#171310]/8 px-5 py-4 text-sm">
                <div className="flex justify-between">
                    <span className="text-[#252525]/60">Subtotal</span>
                    <span className="font-medium text-[#171310]">
                        {formatPrice(cart.subtotal)}
                    </span>
                </div>

                {cart.discount_amount > 0 && (
                    <div className="flex justify-between text-[#9C7A3C]">
                        <span>
                            Discount {cart.discount ? `(${cart.discount.code})` : ""}
                        </span>
                        <span className="font-medium">
                            −{formatPrice(cart.discount_amount)}
                        </span>
                    </div>
                )}

                <div className="flex justify-between text-[#252525]/60">
                    <span>Deposit / Payment</span>
                    <span className="text-xs font-medium text-[#9C7A3C]">
                        Confirmed via email
                    </span>
                </div>

                <div className="flex justify-between text-[#252525]/60">
                    <span>Fulfillment</span>
                    <span className="text-xs font-medium text-[#9C7A3C]">
                        Arranged post-confirmation
                    </span>
                </div>

                <div className="flex justify-between border-t border-[#171310]/10 pt-3">
                    <span className="font-serif text-base font-medium text-[#171310]">
                        Total
                    </span>
                    <span className="font-serif text-lg font-semibold text-[#171310]">
                        {formatPrice(cart.total)}
                    </span>
                </div>
            </div>

            <div className="space-y-3 border-t border-[#171310]/8 bg-[#F8F5EF] px-5 py-4">
                {TRUST.map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3">
                        <Icon
                            size={14}
                            className="flex-shrink-0 text-[#9C7A3C]"
                            strokeWidth={2}
                        />
                        <span className="text-xs text-[#252525]/60">{text}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

interface FormViewProps {
    data: CheckoutForm;
    setData: SetCheckoutData;
    errors: CheckoutErrors;
    pageErrors: Record<string, string>;
    addresses: Address[];
    onSelectAddress: (id: string) => void;
    canReview: boolean;
    onReview: () => void;
}

function FormView({
    data,
    setData,
    errors,
    pageErrors,
    addresses,
    onSelectAddress,
    canReview,
    onReview,
}: FormViewProps) {
    return (
        <div className="space-y-3">
            <div className="rounded-2xl border border-[#9C7A3C]/25 bg-[#9C7A3C]/8 p-4 lg:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">
                    Complete Your Reservation
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-[#252525]/65 lg:text-sm">
                    Submit your reservation securely. Our team will review availability
                    and contact you directly to discuss the next steps.
                </p>
            </div>

            <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm lg:border lg:border-[#171310]/8 lg:p-6 lg:shadow-none">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">
                    Your Details
                </p>

                {(pageErrors.checkout || pageErrors.stock || pageErrors.cart) && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">
                        {pageErrors.checkout || pageErrors.stock || pageErrors.cart}
                    </div>
                )}

                <div>
                    <label className={labelCls} htmlFor="customer_name">
                        Full Name *
                    </label>
                    <input
                        id="customer_name"
                        autoComplete="name"
                        value={data.customer_name}
                        onChange={(e) => setData("customer_name", e.target.value)}
                        className={inputCls}
                    />
                    {errors.customer_name && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.customer_name}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelCls} htmlFor="customer_email">
                        Email Address *
                    </label>
                    <input
                        id="customer_email"
                        type="email"
                        autoComplete="email"
                        value={data.customer_email}
                        onChange={(e) => setData("customer_email", e.target.value)}
                        className={inputCls}
                    />
                    {errors.customer_email && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.customer_email}
                        </p>
                    )}
                </div>

                <div>
                    <label className={labelCls} htmlFor="customer_phone">
                        Phone Number *
                    </label>
                    <input
                        id="customer_phone"
                        type="tel"
                        autoComplete="tel"
                        value={data.customer_phone}
                        onChange={(e) => setData("customer_phone", e.target.value)}
                        className={inputCls}
                    />
                    {errors.customer_phone && (
                        <p className="mt-1 text-xs text-red-600">
                            {errors.customer_phone}
                        </p>
                    )}
                </div>

                <div className="pt-1">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#252525]/40">
                        Delivery Address
                    </p>

                    {addresses.length > 0 && (
                        <div className="mb-3">
                            <label className={labelCls} htmlFor="saved_address">
                                Saved Address
                            </label>
                            <select
                                id="saved_address"
                                defaultValue=""
                                onChange={(e) => onSelectAddress(e.target.value)}
                                className={inputCls}
                            >
                                <option value="" disabled>
                                    Choose a saved address
                                </option>
                                {addresses.map((address) => (
                                    <option key={address.id} value={address.id}>
                                        {address.label ?? address.address_line}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-3">
                        <div>
                            <label className={labelCls} htmlFor="shipping_address">
                                Street Address *
                            </label>
                            <input
                                id="shipping_address"
                                autoComplete="street-address"
                                value={data.shipping_address}
                                onChange={(e) =>
                                    setData("shipping_address", e.target.value)
                                }
                                placeholder="Street address"
                                className={inputCls}
                            />
                            {errors.shipping_address && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.shipping_address}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className={labelCls} htmlFor="city">
                                    City *
                                </label>
                                <input
                                    id="city"
                                    autoComplete="address-level2"
                                    value={data.city}
                                    onChange={(e) => setData("city", e.target.value)}
                                    className={inputCls}
                                />
                                {errors.city && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.city}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className={labelCls} htmlFor="region">
                                    Region
                                </label>
                                <input
                                    id="region"
                                    autoComplete="address-level1"
                                    value={data.region}
                                    onChange={(e) => setData("region", e.target.value)}
                                    className={inputCls}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label className={labelCls} htmlFor="notes">
                        Additional Notes / Special Requests (optional)
                    </label>
                    <textarea
                        id="notes"
                        value={data.notes}
                        onChange={(e) => setData("notes", e.target.value)}
                        rows={3}
                        placeholder="Any special instructions for your order..."
                        className={inputCls}
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href="/cart"
                    aria-label="Return to cart"
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#171310]/15 bg-white text-[#252525]/50 transition hover:border-[#171310]/40 hover:text-[#171310]"
                >
                    <ArrowLeft size={16} strokeWidth={2} />
                </Link>

                <button
                    type="button"
                    disabled={!canReview}
                    onClick={onReview}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171310] py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.4)] transition hover:bg-[#9C7A3C] disabled:opacity-40 lg:text-xs"
                >
                    Review Order
                    <ChevronRight size={13} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
}

interface ReviewViewProps {
    data: CheckoutForm;
    cart: Cart;
    agreedToTerms: boolean;
    onToggleTerms: () => void;
    onBack: () => void;
    onSubmit: (e: FormEvent<HTMLFormElement>) => void;
    processing: boolean;
}

function ReviewView({
    data,
    cart,
    agreedToTerms,
    onToggleTerms,
    onBack,
    onSubmit,
    processing,
}: ReviewViewProps) {
    return (
        <form onSubmit={onSubmit} className="space-y-3">
            <div className="rounded-2xl border border-[#9C7A3C]/25 bg-[#9C7A3C]/8 p-4 lg:p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">
                    Review Your Order
                </p>
                <p className="mt-1 text-xs text-[#252525]/55">
                    Please confirm your details before placing your reservation.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm lg:border lg:border-[#171310]/8 lg:shadow-none">
                <div className="flex items-center gap-3 border-b border-[#171310]/6 px-5 py-3.5">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#9C7A3C]/10">
                        <MapPin
                            size={14}
                            className="text-[#9C7A3C]"
                            strokeWidth={2}
                        />
                    </div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#252525]/50">
                        Shipping Address
                    </p>
                </div>

                <div className="space-y-0.5 px-5 py-4">
                    <p className="text-sm font-semibold text-[#171310]">
                        {data.customer_name}
                    </p>
                    <p className="text-sm text-[#252525]/65">
                        {data.shipping_address}
                    </p>
                    <p className="text-sm text-[#252525]/65">
                        {data.city}
                        {data.region ? `, ${data.region}` : ""}
                    </p>
                    <p className="pt-1 text-xs text-[#252525]/45">
                        {data.customer_email}
                    </p>
                    {data.customer_phone && (
                        <p className="text-xs text-[#252525]/45">
                            {data.customer_phone}
                        </p>
                    )}
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-sm lg:border lg:border-[#171310]/8 lg:shadow-none">
                <div className="border-b border-[#171310]/6 px-5 py-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#252525]/50">
                        Items ({cart.item_count})
                    </p>
                </div>

                <div className="divide-y divide-[#171310]/5">
                    {cart.items.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center justify-between px-5 py-3"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-[#171310]">
                                    {item.variant.product.name}
                                </p>
                                <p className="mt-0.5 text-xs text-[#252525]/45">
                                    Qty {item.quantity}
                                </p>
                            </div>
                            <p className="flex-shrink-0 pl-4 text-sm font-semibold text-[#171310]">
                                {formatPrice(item.line_total)}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between border-t border-[#171310]/8 bg-[#F8F5EF] px-5 py-3">
                    <span className="font-serif text-sm font-medium text-[#171310]">
                        Total
                    </span>
                    <span className="font-serif text-base font-semibold text-[#171310]">
                        {formatPrice(cart.total)}
                    </span>
                </div>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#171310]/8 bg-white px-4 py-4 shadow-sm lg:shadow-none">
                <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={onToggleTerms}
                    className="sr-only"
                />
                <span
                    aria-hidden="true"
                    className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition ${
                        agreedToTerms
                            ? "border-[#9C7A3C] bg-[#9C7A3C]"
                            : "border-[#171310]/20 bg-white"
                    }`}
                >
                    {agreedToTerms && (
                        <Check size={10} strokeWidth={3} className="text-white" />
                    )}
                </span>
                <span className="text-xs leading-relaxed text-[#252525]/60">
                    I agree to the{" "}
                    <Link href="/terms-of-service" onClick={(event) => event.stopPropagation()} className="font-medium text-[#171310] underline decoration-[#9C7A3C]/40 underline-offset-2">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy-policy" onClick={(event) => event.stopPropagation()} className="font-medium text-[#171310] underline decoration-[#9C7A3C]/40 underline-offset-2">
                        Privacy Policy
                    </Link>
                </span>
            </label>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Edit checkout details"
                    className="flex h-[3.25rem] w-[3.25rem] flex-shrink-0 items-center justify-center rounded-full border-2 border-[#171310]/15 bg-white text-[#171310] transition hover:border-[#171310]/40"
                >
                    <ArrowLeft size={16} strokeWidth={2} />
                </button>

                <button
                    type="submit"
                    disabled={processing || !agreedToTerms}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#171310] py-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_30px_-10px_rgba(23,19,16,0.45)] transition hover:bg-[#9C7A3C] disabled:opacity-40 lg:text-sm"
                >
                    {processing ? (
                        "Processing..."
                    ) : (
                        <>
                            Submit Reservation <span className="opacity-70">·</span>{" "}
                            {formatPrice(cart.total)}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}

export default function Checkout({
    cart,
    user,
    addresses = [],
}: CheckoutProps) {
    const pageErrors = usePage().props.errors as Record<string, string>;
    const defaultAddress = addresses[0];

    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [view, setView] = useState<View>("form");

    const { data, setData, post, processing, errors } =
        useForm<CheckoutForm>({
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
        const address = addresses.find(
            (candidate) => candidate.id === Number(addressId),
        );

        if (!address) return;

        setData((previous) => ({
            ...previous,
            customer_phone: address.phone,
            shipping_address: address.address_line,
            city: address.city,
            region: address.region ?? "",
        }));
    }

    function canReview() {
        return Boolean(
            data.customer_name.trim() &&
                data.customer_email.trim() &&
                data.customer_phone.trim() &&
                data.shipping_address.trim() &&
                data.city.trim(),
        );
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post("/checkout");
    }

    const checkoutContent =
        view === "form" ? (
            <FormView
                data={data}
                setData={setData}
                errors={errors}
                pageErrors={pageErrors}
                addresses={addresses}
                onSelectAddress={selectAddress}
                canReview={canReview()}
                onReview={() => setView("review")}
            />
        ) : (
            <ReviewView
                data={data}
                cart={cart}
                agreedToTerms={agreedToTerms}
                onToggleTerms={() => setAgreedToTerms((current) => !current)}
                onBack={() => setView("form")}
                onSubmit={submit}
                processing={processing}
            />
        );

    return (
        <StoreLayout showMobileHeader>
            <Head title="Checkout" />

            <div className="space-y-3 px-4 pb-10 pt-3 lg:hidden">
                {checkoutContent}
                <OrderSummaryCard cart={cart} />
            </div>

            <div className="hidden lg:block">
                <div className="min-h-screen bg-[#F8F5EF] py-14">
                    <div className="mx-auto max-w-6xl px-6">
                        <div className="grid grid-cols-3 gap-8">
                            <div className="col-span-2">{checkoutContent}</div>
                            <div className="col-span-1">
                                <div className="sticky top-24">
                                    <OrderSummaryCard cart={cart} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
