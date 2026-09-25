import { Link } from "@inertiajs/react";
import { ReactNode } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

interface AuthLayoutProps { children: ReactNode; heroImage?: string; heroTitle?: string; heroSubtitle?: string; }

export default function AuthLayout({ children, heroImage = "/images/logo.png", heroTitle = "Welcome to Boutique Luxxe", heroSubtitle = "A considered destination for timeless pieces." }: AuthLayoutProps) {
    return (
        <main className="relative min-h-screen overflow-x-clip bg-[#181512] lg:grid lg:grid-cols-[1.05fr_.95fr]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(155,116,53,.22),transparent_32%),radial-gradient(circle_at_90%_90%,rgba(255,255,255,.06),transparent_30%)] lg:hidden" />
            <section className="relative hidden min-h-screen overflow-hidden lg:block">
                <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />
                <div className="absolute inset-0 bg-gradient-to-br from-[#181512]/95 via-[#181512]/65 to-[#9B7435]/30" />
                <div className="relative flex min-h-screen flex-col justify-between p-12 xl:p-16">
                    <Link href="/" className="inline-flex"><img src="/images/logo.png" alt="Boutique Luxxe" className="h-12 w-auto brightness-0 invert" /></Link>
                    <div className="max-w-xl pb-8"><p className="text-[11px] font-semibold uppercase tracking-[.25em] text-[#D9BB82]">Private client access</p><h1 className="mt-5 font-serif text-5xl font-medium leading-tight text-white xl:text-6xl">{heroTitle}</h1><p className="mt-6 max-w-md text-base leading-7 text-white/65">{heroSubtitle}</p><p className="mt-10 flex items-center gap-2 text-sm text-white/55"><ShieldCheck className="h-4 w-4 text-[#D9BB82]" /> Secure account access</p></div>
                </div>
            </section>
            <section className="relative flex min-h-screen items-center justify-center px-4 py-6 sm:px-8 lg:bg-[#FAF8F4] lg:py-12">
                <div className="w-full max-w-md">
                    <div className="mb-6 flex items-center justify-between lg:hidden">
                        <Link href="/" className="inline-flex"><img src="/images/logo.png" alt="Boutique Luxxe" className="h-11 w-auto brightness-0 invert" /></Link>
                        <Link href="/" aria-label="Back to store" className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white"><ArrowLeft className="h-5 w-5" /></Link>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-[#FAF8F4] p-5 shadow-2xl sm:p-8 lg:border-[#181512]/8 lg:bg-white lg:shadow-[0_20px_60px_-34px_rgba(24,21,18,.35)]">{children}</div>
                </div>
            </section>
        </main>
    );
}
