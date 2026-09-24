import { Link, usePage } from "@inertiajs/react";
import {
    Bell,
    BookOpen,
    Home,
    Info,
    LayoutGrid,
    Mail,
    Menu,
    Package,
    ShoppingCart,
    Star,
    User,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

function HamburgerDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { auth } = usePage().props as {
        auth: { user?: { name: string } | null };
    };

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const previousPaddingRight = document.body.style.paddingRight;

        document.body.style.overflow = "hidden";
        document.body.style.paddingRight = "0";

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.paddingRight = previousPaddingRight;
        };
    }, [open]);

    const navLinks = [
        { label: "Home", href: "/", icon: Home },
        { label: "Shop All", href: "/shop", icon: LayoutGrid },
        { label: "New Arrivals", href: "/shop?sort=newest", icon: Star },
        { label: "Collections", href: "/collections", icon: Package },
        { label: "Journal", href: "/journal", icon: BookOpen },
        { label: "About", href: "/about", icon: Info },
        { label: "Newsletter", href: "/#newsletter", icon: Mail },
        { label: "FAQs", href: "/faqs", icon: Info },
        { label: "Contact", href: "/contact", icon: Mail },
        { label: "Testimonials", href: "/testimonials", icon: Star },
        ...(auth.user ? [{ label: "Notifications", href: "/account/notifications", icon: Bell }] : []),
    ];

    return (
        <>
            <div
                className={`fixed inset-0 z-50 bg-[#171310]/50 backdrop-blur-sm transition-opacity duration-300 ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
            />
            <div
                style={{
                    backgroundColor: "#181512",
                    color: "#F8F5EF",
                }}
                className={`fixed inset-y-0 left-0 z-50 w-[min(86vw,340px)] max-w-full overflow-x-hidden text-[#F8F5EF] shadow-2xl transition-transform duration-300 ease-out ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-full flex-col">
                    <div className="relative flex items-center justify-between border-b-2 border-[#D9BB82] bg-[#FAF8F4] px-5 py-4">
                        <Link href="/" onClick={onClose} className="flex min-w-0 items-center">
                            <img
                                src="/images/logo.png"
                                alt="Boutique Luxxe"
                                className="h-11 max-w-[180px] object-contain"
                            />
                        </Link>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#181512]/10 bg-[#181512] text-[#D9BB82] shadow-sm transition hover:bg-[#9B7435] hover:text-white"
                            aria-label="Close menu"
                        >
                            <X size={18} strokeWidth={1.8} />
                        </button>
                    </div>

                    {auth.user && (
                        <div className="border-b border-[#171310]/10 px-5 py-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9C7A3C]">
                                Signed in as
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-[#171310]">
                                {auth.user.name}
                            </p>
                        </div>
                    )}

                    <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-[#F8F5EF] transition hover:bg-white/10 hover:text-[#D9BB82]"
                                >
                                    <Icon size={17} strokeWidth={1.8} className="text-[#D9BB82]" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="border-t border-white/10 px-5 py-5">
                        {auth.user ? (
                            <Link
                                href="/account"
                                onClick={onClose}
                                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#171310] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white"
                            >
                                <User size={14} />
                                My Account
                            </Link>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="block w-full rounded-xl bg-[#D9BB82] px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-[#181512]"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={onClose}
                                    className="block w-full rounded-xl border border-white/20 px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white"
                                >
                                    Create Account
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default function MobileStoreHeader() {
    const { auth, cart, unreadNotificationsCount } = usePage().props as {
        auth: { user?: { name: string } | null };
        cart?: { item_count?: number };
        unreadNotificationsCount?: number;
    };
    const [drawerOpen, setDrawerOpen] = useState(false);

    const firstName = auth.user?.name.split(" ")[0] ?? null;
    const itemCount = cart?.item_count ?? 0;
    const notificationCount = unreadNotificationsCount ?? 0;

    return (
        <>
            <HamburgerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            <header className="w-full border-b border-[#171310]/8 bg-[#FAF8F4]/95 px-4 py-3 shadow-[0_8px_24px_-24px_rgba(23,19,16,0.45)] backdrop-blur-md lg:hidden">
                <div className="flex items-start justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[#D9BB82]/35 bg-[#181512] text-[#D9BB82] shadow-[0_8px_20px_-10px_rgba(24,21,18,.7)]"
                            aria-label="Open menu"
                        >
                            <Menu size={20} strokeWidth={1.8} />
                        </button>
                        <div className="min-w-0">
                            {firstName ? (
                                <>
                                    <p className="text-[10px] text-[#252525]/50">Hello, {firstName} ✦</p>
                                    <h1 className="truncate font-serif text-xl font-medium leading-tight text-[#171310]">
                                        Discover Luxxe
                                    </h1>
                                </>
                            ) : (
                                <>
                                    <p className="text-[10px] text-[#252525]/50">Welcome ✦</p>
                                    <h1 className="truncate font-serif text-xl font-medium leading-tight text-[#171310]">
                                        Boutique Luxxe
                                    </h1>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2 pt-1">
                        <Link
                            href="/account/notifications"
                            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#171310]/8 bg-white text-[#171310] shadow-sm transition hover:border-[#9C7A3C]/30 hover:text-[#9C7A3C]"
                            aria-label={
                                notificationCount > 0
                                    ? `${notificationCount} unread notifications`
                                    : "Notifications"
                            }
                            title="Notifications"
                        >
                            <Bell size={18} strokeWidth={1.8} />

                            {notificationCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#9C7A3C] px-1 text-[9px] font-bold text-white ring-2 ring-[#FAF8F4]">
                                    {notificationCount > 99 ? "99+" : notificationCount}
                                </span>
                            )}
                        </Link>
                        <Link
                            href="/cart"
                            className="relative flex h-11 w-11 items-center justify-center rounded-full bg-[#171310] shadow-sm"
                            aria-label="Shopping cart"
                        >
                            <ShoppingCart size={18} color="white" strokeWidth={1.8} />
                            {itemCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#9C7A3C] text-[8px] font-bold text-white">
                                    {itemCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </header>
        </>
    );
}
