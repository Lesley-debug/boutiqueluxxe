import { Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import { Heart, User, ShoppingBag } from "lucide-react";

const ANNOUNCEMENT =
    "Complimentary shipping on selected orders · Discover the latest collection";

export default function StoreHeader() {
    const { auth, cart, megaMenu, shopByStyle } = usePage().props;
    const currentPath = usePage().url;
    const [categoriesOpen, setCategoriesOpen] = useState(false);

    function navLinkClass(path: string) {
        const active =
            currentPath === path ||
            (path !== "/" && currentPath.startsWith(path));
        return `transition ${active ? "font-semibold text-[#9C7A3C]" : "hover:text-[#9C7A3C]"}`;
    }

    return (
        <header className="sticky top-0 z-40 bg-[#F8F5EF] shadow-sm">
            {/* Announcement bar — always visible, never collapses */}
            <div className="bg-[#171310] px-4 py-2 text-center text-[10px] font-medium tracking-[0.05em] text-[#F8F5EF]/90 sm:text-[11px]">
                {ANNOUNCEMENT}
            </div>

            {/* Mobile header — logo, account, bag only. No search. */}
            <div className="flex items-center justify-between border-b border-[#171310]/10 px-4 py-3 lg:hidden">
                <img
                    src="/images/logo.png"
                    alt="Boutique Luxxe"
                    className="h-8 w-auto"
                />
                <div className="flex items-center gap-1">
                    {auth.user ? (
                        <Link
                            href="/account"
                            className="rounded-full p-2.5 text-[#171310]"
                            title="Account"
                        >
                            <User size={20} />
                        </Link>
                    ) : (
                        <Link
                            href="/login"
                            className="rounded-full p-2.5 text-[#171310]"
                            title="Account"
                        >
                            <User size={20} />
                        </Link>
                    )}
                    <Link
                        href="/cart"
                        className="relative rounded-full p-2.5 text-[#171310]"
                        title="Bag"
                    >
                        <ShoppingBag size={20} />
                        {cart.item_count > 0 && (
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#9C7A3C] text-[9px] font-bold text-white">
                                {cart.item_count}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Desktop nav — unchanged, hidden below lg */}
            <div className="hidden border-b border-[#171310]/10 px-6 lg:block">
                <div className="mx-auto flex max-w-7xl items-center justify-between py-5">
                    <Link href="/" className="flex items-center">
                        <img
                            src="/images/logo.png"
                            alt="Boutique Luxxe"
                            className="h-10 w-auto"
                        />
                    </Link>

                    <nav className="flex items-center gap-8 text-xs font-medium uppercase tracking-[0.15em] text-[#171310]">
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
                        <Link href="/about" className={navLinkClass("/about")}>
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
                                href="/account"
                                className="rounded-full p-2 text-[#171310] transition hover:bg-[#171310]/5 hover:text-[#9C7A3C]"
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
