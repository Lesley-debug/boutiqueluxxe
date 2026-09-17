import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import AuthLayout from "@/components/Auth/AuthLayout";

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/forgot-password");
    }

    return (
        <AuthLayout
            heroTitle="Reset Your Password"
            heroSubtitle="Enter your email address and we'll send you a link to reset your password."
        >
            <Head title="Forgot Password" />

            <div className="mb-10">
                <h1 className="font-serif text-3xl font-medium tracking-tight text-[#171310]">
                    Forgot Password?
                </h1>
                <p className="mt-2 text-sm text-[#252525]/60">
                    No worries, we'll send you reset instructions
                </p>
            </div>

            {status && (
                <div className="mb-6 rounded-2xl border border-[#9C7A3C]/20 bg-[#9C7A3C]/5 p-4 text-sm text-[#171310]">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label className="mb-2 block text-sm font-medium text-[#171310]">
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                        placeholder="you@example.com"
                        autoFocus
                    />
                    {errors.email && (
                        <p className="mt-2 text-xs text-red-600">
                            {errors.email}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-full bg-[#171310] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C] disabled:opacity-40"
                >
                    {processing ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            <div className="mt-8 text-center">
                <Link
                    href="/login"
                    className="text-sm font-medium text-[#9C7A3C] transition hover:text-[#171310]"
                >
                    ← Back to login
                </Link>
            </div>

            <div className="mt-10 text-center">
                <Link
                    href="/"
                    className="text-xs text-[#252525]/60 underline decoration-[#9C7A3C] decoration-1 underline-offset-4 transition hover:text-[#171310]"
                >
                    ← Back to store
                </Link>
            </div>
        </AuthLayout>
    );
}
