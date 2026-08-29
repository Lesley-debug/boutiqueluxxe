import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

interface Category {
    id: number;
    name: string;
    slug: string;
}

const ANNOUNCEMENT =
    "Free shipping on selected orders · Shop the new collection";

export default function StoreHeader({
    categories,
}: {
    categories: Category[];
}) {
    const { auth, cart } = usePage().props;
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 8);
        }
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-40 bg-white transition-shadow ${scrolled ? "shadow-md" : ""}`}
        >
            <div className="bg-gradient-to-r from-[#6D28D9] to-[#9333EA] px-4 py-2.5 text-center text-xs font-medium text-white">
                {ANNOUNCEMENT}
            </div>

            <div className="border-b border-gray-100 px-4 sm:px-6">
                <div className="mx-auto flex max-w-7xl items-center justify-between py-4">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-sm font-bold text-white">
                            D
                        </span>
                        <span className="text-base font-bold text-gray-900">
                            Designer Bags
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-8 text-sm font-medium text-gray-700 md:flex">
                        <div
                            className="relative"
                            onMouseEnter={() => setMenuOpen(true)}
                            onMouseLeave={() => setMenuOpen(false)}
                        >
                            <button className="transition hover:text-[#7C3AED]">
                                Shop
                            </button>
                            {menuOpen && categories.length > 0 && (
                                <div className="absolute left-1/2 top-full w-64 -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-3 shadow-xl">
                                    {categories.map((c) => (
                                        <Link
                                            key={c.id}
                                            href={`/shop?category=${c.slug}`}
                                            className="block rounded-xl px-3 py-2.5 text-sm hover:bg-[#F5F3FF] hover:text-[#7C3AED]"
                                        >
                                            {c.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                        <Link
                            href="/shop?sort=newest"
                            className="transition hover:text-[#7C3AED]"
                        >
                            New Arrivals
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {auth.user ? (
                            <Link
                                href="/account/wishlist"
                                className="rounded-full p-2 text-gray-600 transition hover:bg-[#F5F3FF] hover:text-[#7C3AED]"
                                title="Wishlist"
                            >
                                ♡
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-[#F5F3FF] hover:text-[#7C3AED]"
                            >
                                Account
                            </Link>
                        )}
                        <Link
                            href="/cart"
                            className="relative rounded-full bg-gradient-to-r from-[#7C3AED] to-[#A855F7] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:shadow-lg"
                        >
                            Bag
                            {cart.item_count > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white">
                                    {cart.item_count}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
