import { Link } from "@inertiajs/react";
import { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
    heroImage?: string;
    heroTitle?: string;
    heroSubtitle?: string;
}

export default function AuthLayout({
    children,
    heroImage = "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200&q=80",
    heroTitle = "Welcome to Designer Bags Boutique",
    heroSubtitle = "Where elegance meets timeless design",
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-screen">
            {/* Left: Hero Section */}
            <div className="hidden w-1/2 lg:block">
                <div className="relative h-full">
                    <img
                        src={heroImage}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#171310]/80 via-[#171310]/60 to-transparent">
                        <div className="flex h-full flex-col justify-between p-12">
                            <Link
                                href="/"
                                className="font-serif text-2xl tracking-tight text-white"
                            >
                                Designer Bags Boutique
                            </Link>
                            <div>
                                <h1 className="font-serif text-5xl font-medium leading-tight tracking-tight text-white">
                                    {heroTitle}
                                </h1>
                                <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
                                    {heroSubtitle}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Form Section */}
            <div className="flex w-full items-center justify-center bg-[#F8F5EF] px-6 py-12 lg:w-1/2">
                <div className="w-full max-w-md">
                    {/* Mobile Brand */}
                    <Link
                        href="/"
                        className="mb-12 block font-serif text-2xl tracking-tight text-[#171310] lg:hidden"
                    >
                        Designer Bags Boutique
                    </Link>

                    {children}
                </div>
            </div>
        </div>
    );
}
