import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FormEvent } from "react";
import AuthLayout from "@/components/Auth/AuthLayout";
import GoogleButton from "@/components/Auth/GoogleButton";

export default function Register() {
    const { features } = usePage().props as {
        features?: { googleAuth?: boolean };
    };
    const googleAuthEnabled = features?.googleAuth === true;

    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/register");
    }

    return (
        <AuthLayout
            heroTitle="Join Boutique Luxxe"
            heroSubtitle="Create your account and discover a world of timeless elegance curated just for you."
        >
            <Head title="Register" />

            <div className="mb-10">
                <h1 className="font-serif text-3xl font-medium tracking-tight text-[#171310]">
                    Create Account
                </h1>
                <p className="mt-2 text-sm text-[#252525]/60">
                    Start your journey with Boutique Luxxe
                </p>
            </div>

            {googleAuthEnabled && (
                <>
                    <GoogleButton label="Sign up with Google" />
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
                        Full Name
                    </label>
                    <input
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                        placeholder="John Doe"
                        autoFocus
                    />
                    {errors.name && (
                        <p className="mt-2 text-xs text-red-600">
                            {errors.name}
                        </p>
                    )}
                </div>

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
                    />
                    {errors.email && (
                        <p className="mt-2 text-xs text-red-600">
                            {errors.email}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-[#171310]">
                        Password
                    </label>
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

                <div>
                    <label className="mb-2 block text-sm font-medium text-[#171310]">
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        className="w-full rounded-full border border-[#171310]/15 bg-white px-5 py-3.5 text-sm text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full rounded-full bg-[#171310] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C] disabled:opacity-40"
                >
                    {processing ? "Creating Account..." : "Create Account"}
                </button>

                <p className="text-xs leading-relaxed text-[#252525]/60">
                    By creating an account, you agree to our{" "}
                    <Link
                        href="/terms-of-service"
                        className="text-[#9C7A3C] underline decoration-1 underline-offset-2"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        href="/privacy-policy"
                        className="text-[#9C7A3C] underline decoration-1 underline-offset-2"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </form>

            <div className="mt-8 text-center">
                <p className="text-sm text-[#252525]/60">
                    Already have an account?{" "}
                    <Link
                        href="/login"
                        className="font-medium text-[#9C7A3C] transition hover:text-[#171310]"
                    >
                        Sign in
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
