import { Link, usePage } from "@inertiajs/react";
import { Home, LayoutGrid, Heart, Package, User } from "lucide-react";

const TABS = [
    { label: "Home",       href: "/",                  icon: Home },
    { label: "Categories", href: "/categories",         icon: LayoutGrid },
    { label: "Wishlist",   href: "/account/wishlist",   icon: Heart },
    { label: "Orders",     href: "/account/orders",     icon: Package },
    { label: "Account",    href: "/account",            icon: User },
];

export default function MobileTabBar() {
    const { wishlist_count } = usePage().props as { wishlist_count?: number };
    const currentUrl = usePage().url;

    function isActive(href: string) {
        if (href === "/") return currentUrl === "/";
        return currentUrl.startsWith(href);
    }

    return (
        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[#171310]/10 bg-[#F8F5EF]/95 backdrop-blur-sm lg:hidden">
            <div
                className="flex items-center justify-around px-2 py-2"
                style={{
                    paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
                }}
            >
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    const active = isActive(tab.href);
                    const showBadge = tab.href === "/account/wishlist" && !!wishlist_count && wishlist_count > 0;

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex flex-col items-center gap-1 px-2 py-1 text-[10px] font-medium ${
                                active ? "text-[#9C7A3C]" : "text-[#171310]/50"
                            }`}
                        >
                            <div className="relative">
                                <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                                {showBadge && (
                                    <span className="absolute -right-2 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#9C7A3C] text-[8px] font-bold text-white">
                                        {wishlist_count > 99 ? "99+" : wishlist_count}
                                    </span>
                                )}
                            </div>
                            {tab.label}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
