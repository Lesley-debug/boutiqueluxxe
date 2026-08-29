import { Link } from "@inertiajs/react";

export default function StoreFooter() {
    return (
        <footer className="border-t border-gray-100 bg-white px-4 py-16 sm:px-6">
            <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 sm:grid-cols-4">
                <div className="col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-sm font-bold text-white">
                            D
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                            Designer Bags
                        </span>
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                        Discover pieces that define your style.
                    </p>
                </div>
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                        Shop
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                        <Link
                            href="/shop"
                            className="block hover:text-[#7C3AED]"
                        >
                            All Products
                        </Link>
                        <Link
                            href="/shop?sort=newest"
                            className="block hover:text-[#7C3AED]"
                        >
                            New Arrivals
                        </Link>
                    </div>
                </div>
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                        Account
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                        <Link
                            href="/account/orders"
                            className="block hover:text-[#7C3AED]"
                        >
                            My Orders
                        </Link>
                        <Link
                            href="/account/wishlist"
                            className="block hover:text-[#7C3AED]"
                        >
                            Wishlist
                        </Link>
                        <Link
                            href="/account/addresses"
                            className="block hover:text-[#7C3AED]"
                        >
                            Addresses
                        </Link>
                    </div>
                </div>
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#7C3AED]">
                        Help
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p>Contact us for support</p>
                    </div>
                </div>
            </div>
            <p className="mx-auto mt-12 max-w-7xl text-xs text-gray-400">
                © {new Date().getFullYear()} Designer Bags Boutique
            </p>
        </footer>
    );
}
