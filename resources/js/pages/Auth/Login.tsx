import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FormEvent } from "react";
import AuthLayout from "@/components/Auth/AuthLayout";
import GoogleButton from "@/components/Auth/GoogleButton";

export default function Login() {
    const { registered, features } = usePage().props as {
        registered?: boolean;
        features?: { googleAuth?: boolean };
    };
    const googleAuthEnabled = features?.googleAuth === true;

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/login");
    }

    return (
        <AuthLayout
            heroTitle="Welcome Back"
            heroSubtitle="Sign in to access your account and continue your journey with us."
        >
            <Head title="Log in" />

            {registered && (
                <p className="mb-6 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                    Account created. Sign in, then open the verification link sent to your email.
                </p>
            )}

            <div className="mb-10">
                <h1 className="font-serif text-3xl font-medium tracking-tight text-[#171310]">
                    Log in
                </h1>
                <p className="mt-2 text-sm text-[#252525]/60">
                    Enter your credentials to access your account
                </p>
            </div>

            {googleAuthEnabled && (
                <>
                    <GoogleButton label="Continue with Google" />
                    <div className="my-6 flex items-center gap-3">
                        <span className="h-px flex-1 bg-[#181512]/10" />
                        <span className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#6F6961]">or use email</span>
                        <span className="h-px flex-1 bg-[#181512]/10" />
                    </div>
                </>
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

                <div>
                    <div className="mb-2 flex items-center justify-between">
                        <label className="block text-sm font-medium text-[#171310]">
                            Password
                        </label>
                        <Link
                            href="/forgot-password"
                            className="text-xs text-[#9C7A3C] transition hover:text-[#171310]"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <input
                        type="password"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                        placeholder="••••••••"
                    />
                    {errors.password && (
                        <p className="mt-2 text-xs text-red-600">
                            {errors.password}
                        </p>
                    )}
                </div>

                <label className="flex items-center gap-3 text-sm text-[#171310]">
                    <input
                        type="checkbox"
                        checked={data.remember}
                        onChange={(e) => setData("remember", e.target.checked)}
                        className="h-4 w-4 rounded border-[#171310]/20 text-[#9C7A3C] focus:ring-2 focus:ring-[#9C7A3C]/20"
                    />
                    <span>Remember me for 30 days</span>
                </label>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-full bg-[#171310] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C] disabled:opacity-40"
                >
                    {processing ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-[#252525]/60">
                    Don&apos;t have an account?{" "}
                    <Link
                        href="/register"
                        className="font-medium text-[#9C7A3C] transition hover:text-[#171310]"
                    >
                        Create one now
                    </Link>
                </p>
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
