import { Link } from "@inertiajs/react";

export default function StoreFooter() {
    return (
        <footer className="border-t border-[#171310]/10 bg-[#F8F5EF] px-6 py-20 text-[#171310]">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 sm:grid-cols-5">
                <div className="col-span-2 sm:col-span-1">
                    <img
                        src="/images/logo.png"
                        alt="Boutique Luxxe"
                        className="h-9 w-auto"
                    />
                    <p className="mt-4 text-sm leading-relaxed text-[#252525]/60">
                        Discover pieces that define your style.
                    </p>
                </div>
                <div>
                    <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#9C7A3C]">
                        Shop
                    </p>
                    <div className="space-y-3 text-sm text-[#252525]/80">
                        <Link
                            href="/shop"
                            className="block transition hover:text-[#171310]"
                        >
                            All Products
                        </Link>
                        <Link
                            href="/shop?sort=newest"
                            className="block transition hover:text-[#171310]"
                        >
                            New Arrivals
                        </Link>
                    </div>
                </div>
                <div>
                    <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#9C7A3C]">
                        Account
                    </p>
                    <div className="space-y-3 text-sm text-[#252525]/80">
                        <Link
                            href="/account/orders"
                            className="block transition hover:text-[#171310]"
                        >
                            My Orders
                        </Link>
                        <Link
                            href="/account/wishlist"
                            className="block transition hover:text-[#171310]"
                        >
                            Wishlist
                        </Link>
                        <Link
                            href="/account/addresses"
                            className="block transition hover:text-[#171310]"
                        >
                            Addresses
                        </Link>
                    </div>
                </div>
                <div>
                    <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#9C7A3C]">
                        Explore
                    </p>
                    <div className="space-y-3 text-sm text-[#252525]/80">
                        <Link
                            href="/collections"
                            className="block transition hover:text-[#171310]"
                        >
                            Collections
                        </Link>
                        <Link
                            href="/about"
                            className="block transition hover:text-[#171310]"
                        >
                            About
                        </Link>
                        <Link
                            href="/journal"
                            className="block transition hover:text-[#171310]"
                        >
                            Journal
                        </Link>
                    </div>
                </div>
                <div>
                    <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-[#9C7A3C]">
                        Help
                    </p>
                    <div className="space-y-3 text-sm text-[#252525]/80">
                        <p>Contact us for support</p>
                    </div>
                </div>
            </div>
            <p className="mx-auto mt-16 max-w-7xl text-xs text-[#252525]/40">
                © {new Date().getFullYear()} Designer Bags Boutique
            </p>
        </footer>
    );
}
