import { Link, router, usePage } from "@inertiajs/react";
import { ReactNode, useState } from "react";
import {
    LayoutDashboard,
    Package,
    Tags,
    Shapes,
    Layers,
    ShoppingCart,
    Users,
    Percent,
    DollarSign,
    Bell,
    FileText,
    Home,
    Images,
    MessageSquareQuote,
    Mail,
    Info,
    UserCog,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

interface NavItem {
    label: string;
    href: string;
    icon: typeof LayoutDashboard;
    permission: string;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const NAV: NavGroup[] = [
    {
        title: "Overview",
        items: [
            {
                label: "Dashboard",
                href: "/admin",
                icon: LayoutDashboard,
                permission: "dashboard.view",
            },
        ],
    },
    {
        title: "Catalog",
        items: [
            {
                label: "Products",
                href: "/admin/products",
                icon: Package,
                permission: "products.manage",
            },
            {
                label: "Categories",
                href: "/admin/categories",
                icon: Tags,
                permission: "products.manage",
            },
            {
                label: "Styles",
                href: "/admin/styles",
                icon: Shapes,
                permission: "products.manage",
            },
            {
                label: "Collections",
                href: "/admin/collections",
                icon: Layers,
                permission: "products.manage",
            },
            {
                label: "Bulk Pricing",
                href: "/admin/bulk-pricing",
                icon: DollarSign,
                permission: "products.manage",
            },
        ],
    },
    {
        title: "Sales",
        items: [
            {
                label: "Orders",
                href: "/admin/orders",
                icon: ShoppingCart,
                permission: "orders.manage",
            },
            {
                label: "Customers",
                href: "/admin/customers",
                icon: Users,
                permission: "customers.view",
            },
            {
                label: "Discounts",
                href: "/admin/discounts",
                icon: Percent,
                permission: "discounts.manage",
            },
        ],
    },
    {
        title: "Content",
        items: [
            {
                label: "Homepage",
                href: "/admin/homepage",
                icon: Home,
                permission: "products.manage",
            },
            {
                label: "Hero Slides",
                href: "/admin/hero-slides",
                icon: Images,
                permission: "products.manage",
            },
            {
                label: "About Page",
                href: "/admin/about-page",
                icon: Info,
                permission: "products.manage",
            },
            {
                label: "Journal",
                href: "/admin/journal",
                icon: FileText,
                permission: "products.manage",
            },
            {
                label: "Testimonials",
                href: "/admin/testimonials",
                icon: MessageSquareQuote,
                permission: "products.manage",
            },
            {
                label: "Newsletter",
                href: "/admin/newsletter",
                icon: Mail,
                permission: "products.manage",
            },
        ],
    },
    {
        title: "System",
        items: [
            {
                label: "Notifications",
                href: "/admin/notifications",
                icon: Bell,
                permission: "notifications.view",
            },
            {
                label: "Admin Users",
                href: "/admin/users",
                icon: UserCog,
                permission: "admins.manage",
            },
        ],
    },
];

export default function AdminLayout({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    const { auth } = usePage().props;
    const currentUrl = usePage().url;
    const [mobileOpen, setMobileOpen] = useState(false);

    function can(permission: string) {
        return (
            auth.permissions.includes("*") ||
            auth.permissions.includes(permission)
        );
    }

    function isActive(href: string) {
        if (href === "/admin") return currentUrl === "/admin";
        return currentUrl.startsWith(href);
    }

    const visibleGroups = NAV.map((group) => ({
        ...group,
        items: group.items.filter((i) => can(i.permission)),
    })).filter((group) => group.items.length > 0);

    return (
        <div className="min-h-screen bg-stone-50">
            {/* Mobile header */}
            <div className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="rounded-lg p-2 text-stone-600 hover:bg-stone-100"
                >
                    <Menu size={20} />
                </button>
                <span className="font-serif text-base">
                    Designer Bags Admin
                </span>
                <NotificationBell />
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-stone-200 bg-white transition-transform lg:static lg:translate-x-0 ${
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-5">
                            <Link href="/admin" className="flex items-center">
                                <img
                                    src="/images/logo.png"
                                    alt="Boutique Luxxe"
                                    className="h-8 w-auto"
                                />
                            </Link>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="rounded-lg p-1 text-stone-400 lg:hidden"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <nav className="flex-1 overflow-y-auto px-3 py-4">
                            {visibleGroups.map((group) => (
                                <div key={group.title} className="mb-5">
                                    <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-stone-400">
                                        {group.title}
                                    </p>
                                    {group.items.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                onClick={() =>
                                                    setMobileOpen(false)
                                                }
                                                className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                                                    active
                                                        ? "bg-[#171310] font-medium text-white"
                                                        : "text-stone-600 hover:bg-stone-100 hover:text-[#171310]"
                                                }`}
                                            >
                                                <Icon size={16} />
                                                {item.label}
                                            </Link>
                                        );
                                    })}
                                </div>
                            ))}
                        </nav>

                        <div className="border-t border-stone-200 p-3">
                            <div className="mb-2 px-3">
                                <p className="truncate text-sm font-medium text-[#171310]">
                                    {auth.user?.name}
                                </p>
                                <p className="truncate text-xs capitalize text-stone-400">
                                    {auth.user?.role?.replace("_", " ")}
                                </p>
                            </div>
                            <div className="flex gap-2 px-1">
                                <Link
                                    href="/"
                                    className="flex-1 rounded-lg px-2 py-2 text-center text-xs text-stone-600 hover:bg-stone-100"
                                >
                                    View Store
                                </Link>
                                <button
                                    onClick={() => router.post("/logout")}
                                    className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs text-stone-600 hover:bg-stone-100"
                                >
                                    <LogOut size={14} />
                                    Log out
                                </button>
                            </div>
                        </div>
                    </div>
                </aside>

                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/30 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                )}

                {/* Main */}
                <div className="min-w-0 flex-1">
                    <div className="hidden items-center justify-between border-b border-stone-200 bg-white px-8 py-4 lg:flex">
                        <h1 className="text-lg font-semibold text-[#171310]">
                            {title}
                        </h1>
                        <NotificationBell />
                    </div>

                    <main className="p-4 sm:p-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
