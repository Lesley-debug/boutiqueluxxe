import AuthLayout from "@/components/Auth/AuthLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";

interface VerifyEmailProps {
    email: string;
    status?: string | null;
    deliveryFailed?: boolean;
    required: boolean;
}

export default function VerifyEmail({
    email,
    status,
    deliveryFailed = false,
    required,
}: VerifyEmailProps) {
    const { post, processing } = useForm({});

    return (
        <AuthLayout
            heroTitle="Verify Your Email"
            heroSubtitle="One final step protects your account and personal information."
        >
            <Head title="Verify email" />

            <div className="mb-8">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#9C7A3C]">
                    Account security
                </p>
                <h1 className="mt-3 font-serif text-3xl font-medium tracking-tight text-[#171310]">
                    Check your inbox
                </h1>
                <p className="mt-4 text-sm leading-7 text-[#252525]/65">
                    We sent a verification link to <strong>{email}</strong>. Open the link to confirm that this email belongs to you.
                </p>
            </div>

            {status === "verification-link-sent" && (
                <p className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                    A new verification link has been sent.
                </p>
            )}

            {deliveryFailed && (
                <p className="mb-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    We could not send the message right now. Please wait a moment and try again.
                </p>
            )}

            {!required && (
                <p className="mb-6 rounded-lg bg-[#F3EADB] px-4 py-3 text-sm text-[#6B4D20]">
                    Verification is not yet required, but confirming your email now will keep your account ready.
                </p>
            )}

            <div className="space-y-3">
                <button
                    type="button"
                    disabled={processing}
                    onClick={() => post("/email/verification-notification")}
                    className="w-full rounded-full bg-[#171310] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#9C7A3C] disabled:opacity-40"
                >
                    {processing ? "Sending..." : "Resend verification email"}
                </button>

                {!required && (
                    <Link
                        href="/account"
                        className="flex w-full items-center justify-center rounded-full border border-[#171310]/15 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#171310] transition hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
                    >
                        Continue to account
                    </Link>
                )}

                <button
                    type="button"
                    onClick={() => router.post("/logout")}
                    className="w-full px-6 py-3 text-xs text-[#252525]/60 underline decoration-[#9C7A3C] underline-offset-4 transition hover:text-[#171310]"
                >
                    Log out
                </button>
            </div>
        </AuthLayout>
    );
}
