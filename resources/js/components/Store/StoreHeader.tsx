import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Search, Heart, User, ShoppingBag } from "lucide-react";

const ANNOUNCEMENT =
    "Complimentary shipping on selected orders · Discover the latest collection";

export default function StoreHeader() {
    const { auth, cart, megaMenu, shopByStyle } = usePage().props;
    const currentPath = usePage().url;
    const [categoriesOpen, setCategoriesOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        function onScroll() {
            setScrolled(window.scrollY > 8);
        }
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.get(
                "/shop",
                { search: searchTerm },
                { preserveState: false },
            );
        }
    }

    function navLinkClass(path: string) {
        const active =
            currentPath === path ||
            (path !== "/" && currentPath.startsWith(path));
        return `transition ${active ? "font-semibold text-[#9C7A3C]" : "hover:text-[#9C7A3C]"}`;
    }

    return (
        <header
            className={`sticky top-0 z-40 bg-[#F8F5EF] transition-shadow ${scrolled ? "shadow-sm" : ""}`}
        >
            <div className="bg-[#171310] px-4 py-2.5 text-center text-[11px] font-medium tracking-[0.05em] text-[#F8F5EF]/90">
                {ANNOUNCEMENT}
            </div>

            <div
                className={`border-b transition-colors ${scrolled ? "border-[#171310]/10" : "border-transparent"} px-4 sm:px-6`}
            >
                <div className="mx-auto flex max-w-7xl items-center justify-between py-5">
                    <Link
                        href="/"
                        className="font-serif text-lg tracking-tight text-[#171310]"
                    >
                        Designer Bags Boutique
                    </Link>

                    <nav className="hidden items-center gap-8 text-xs font-medium uppercase tracking-[0.15em] text-[#171310] lg:flex">
                        <Link href="/shop" className={navLinkClass("/shop")}>
                            Shop
                        </Link>

                        <div
                            className="relative"
                            onMouseEnter={() => setCategoriesOpen(true)}
                            onMouseLeave={() => setCategoriesOpen(false)}
                        >
                            <button className="transition hover:text-[#9C7A3C]">
                                Categories
                            </button>
                            {categoriesOpen && megaMenu.length > 0 && (
                                <div className="absolute left-1/2 top-full flex w-[36rem] -translate-x-1/2 gap-6 rounded-sm border border-[#171310]/10 bg-[#F8F5EF] p-6 shadow-lg">
                                    {megaMenu.map((top) => (
                                        <div key={top.id} className="flex-1">
                                            <Link
                                                href={`/shop?category=${top.slug}`}
                                                className="mb-3 block text-xs font-semibold uppercase tracking-wider text-[#9C7A3C]"
                                            >
                                                {top.name}
                                            </Link>

                                            {top.audience.length > 0 && (
                                                <div className="mb-4">
                                                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[#171310]/40">
                                                        Shop by Audience
                                                    </p>
                                                    {top.audience.map((a) => (
                                                        <Link
                                                            key={a.id}
                                                            href={`/shop?category=${a.slug}`}
                                                            className="block rounded-sm px-2 py-1.5 text-xs normal-case tracking-normal hover:bg-[#171310]/5"
                                                        >
                                                            {a.name}
                                                        </Link>
                                                    ))}
                                                    <Link
                                                        href={`/shop?category=${top.slug}`}
                                                        className="block rounded-sm px-2 py-1.5 text-xs normal-case tracking-normal font-medium hover:bg-[#171310]/5"
                                                    >
                                                        All {top.name}
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {shopByStyle.length > 0 && (
                                        <div className="flex-1 border-l border-[#171310]/10 pl-6">
                                            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-[#171310]/40">
                                                Shop by Style
                                            </p>
                                            {shopByStyle.map((s) => (
                                                <Link
                                                    key={s.id}
                                                    href={`/shop?style=${s.slug}`}
                                                    className="block rounded-sm px-2 py-1.5 text-xs normal-case tracking-normal hover:bg-[#171310]/5"
                                                >
                                                    {s.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <Link
                            href="/shop?sort=newest"
                            className={navLinkClass("/shop")}
                        >
                            New Arrivals
                        </Link>
                        <Link
                            href="/collections"
                            className={navLinkClass("/collections")}
                        >
                            Collections
                        </Link>
                        <Link
                            href="/about"
                            className={navLinkClass("/about")}
                        >
                            About
                        </Link>
                        <Link
                            href="/journal"
                            className={navLinkClass("/journal")}
                        >
                            Journal
                        </Link>
                    </nav>

                    <div className="flex items-center gap-1">
                        {searchOpen ? (
                            <form onSubmit={submitSearch}>
                                <input
                                    autoFocus
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onBlur={() =>
                                        !searchTerm && setSearchOpen(false)
                                    }
                                    placeholder="Search..."
                                    className="w-40 rounded-full border border-[#171310]/15 bg-transparent px-3 py-1.5 text-sm focus:outline-none sm:w-56"
                                />
                            </form>
                        ) : (
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="rounded-full p-2 text-[#171310] transition hover:bg-[#171310]/5 hover:text-[#9C7A3C]"
                                title="Search"
                            >
                                <Search size={18} />
                            </button>
                        )}

                        {auth.user ? (
                            <Link
                                href="/account/wishlist"
                                className="rounded-full p-2 text-[#171310] transition hover:bg-[#171310]/5 hover:text-[#9C7A3C]"
                                title="Wishlist"
                            >
                                <Heart size={18} />
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="rounded-full p-2 text-[#171310] transition hover:bg-[#171310]/5 hover:text-[#9C7A3C]"
                                title="Account"
                            >
                                <User size={18} />
                            </Link>
                        )}

                        {auth.user && (
                            <Link
                                href="/account/profile"
                                className="hidden rounded-full p-2 text-[#171310] transition hover:bg-[#171310]/5 hover:text-[#9C7A3C] sm:block"
                                title="Account"
                            >
                                <User size={18} />
                            </Link>
                        )}

                        <Link
                            href="/cart"
                            className="relative ml-1 rounded-full bg-[#171310] p-2.5 text-white transition hover:bg-[#9C7A3C]"
                            title="Bag"
                        >
                            <ShoppingBag size={18} />
                            {cart.item_count > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#9C7A3C] text-[10px] font-bold text-white ring-2 ring-[#F8F5EF]">
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
