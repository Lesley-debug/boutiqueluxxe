import { Head, Link, usePage } from "@inertiajs/react";
import {
    Package,
    Heart,
    MapPin,
    User as UserIcon,
    LogOut,
    ChevronRight,
    ShoppingBag,
    Bell,
    Settings,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    RotateCcw,
    Star,
} from "lucide-react";
import { router } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";
import { formatPrice } from "@/lib/format";

interface OrderRow {
    id: number;
    order_number: string;
    status: string;
    total: string;
    created_at: string;
}

interface Stats {
    orders_count: number;
    wishlist_count: number;
    addresses_count: number;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
    string,
    { label: string; icon: typeof Clock; color: string; bg: string }
> = {
    pending:    { label: "Pending",    icon: Clock,        color: "text-amber-600",  bg: "bg-amber-50" },
    processing: { label: "Processing", icon: RotateCcw,    color: "text-blue-600",   bg: "bg-blue-50" },
    shipped:    { label: "Shipped",    icon: Truck,        color: "text-indigo-600", bg: "bg-indigo-50" },
    delivered:  { label: "Delivered",  icon: CheckCircle,  color: "text-green-600",  bg: "bg-green-50" },
    cancelled:  { label: "Cancelled",  icon: XCircle,      color: "text-red-500",    bg: "bg-red-50" },
};

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${cfg.bg} ${cfg.color}`}>
            <Icon size={10} strokeWidth={2.5} />
            {cfg.label}
        </span>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
    href,
    icon: Icon,
    value,
    label,
    sub,
}: {
    href: string;
    icon: typeof Package;
    value: number;
    label: string;
    sub?: string;
}) {
    return (
        <Link
            href={href}
            className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition duration-300 hover:shadow-[0_20px_40px_-12px_rgba(23,19,16,0.15)]"
        >
            {/* Subtle gold accent corner */}
            <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-[3rem] bg-[#9C7A3C]/5 transition-all duration-300 group-hover:h-20 group-hover:w-20" />

            <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F8F5EF]">
                    <Icon size={18} className="text-[#9C7A3C]" strokeWidth={1.8} />
                </div>
                <p className="mt-4 font-serif text-3xl font-medium text-[#171310]">
                    {value}
                </p>
                <p className="mt-1 text-xs font-medium text-[#252525]/60">{label}</p>
                {sub && <p className="mt-0.5 text-[10px] text-[#252525]/35">{sub}</p>}
            </div>

            <div className="absolute bottom-4 right-4 text-[#9C7A3C] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ChevronRight size={16} strokeWidth={2} />
            </div>
        </Link>
    );
}

// ─── Quick action ─────────────────────────────────────────────────────────────

function QuickAction({
    href,
    icon: Icon,
    label,
    description,
    onClick,
    danger,
}: {
    href?: string;
    icon: typeof UserIcon;
    label: string;
    description: string;
    onClick?: () => void;
    danger?: boolean;
}) {
    const cls = `group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition duration-300 hover:shadow-[0_12px_32px_-8px_rgba(23,19,16,0.12)] ${
        danger ? "hover:border-red-100" : ""
    }`;

    const inner = (
        <>
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${danger ? "bg-red-50" : "bg-[#F8F5EF]"} transition-colors duration-300`}>
                <Icon size={17} className={danger ? "text-red-500" : "text-[#9C7A3C]"} strokeWidth={1.8} />
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${danger ? "text-red-600" : "text-[#171310]"}`}>
                    {label}
                </p>
                <p className="text-xs text-[#252525]/45">{description}</p>
            </div>
            <ChevronRight size={15} className="flex-shrink-0 text-[#171310]/20 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[#9C7A3C]" />
        </>
    );

    if (onClick) {
        return (
            <button onClick={onClick} className={`${cls} w-full text-left`}>
                {inner}
            </button>
        );
    }
    return <Link href={href!} className={cls}>{inner}</Link>;
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export default function Dashboard({
    stats,
    recentOrders,
}: {
    stats: Stats;
    recentOrders: OrderRow[];
}) {
    const { auth } = usePage().props;
    const firstName = auth.user?.name.split(" ")[0] ?? "there";
    const fullName = auth.user?.name ?? "";

    // Greeting based on time of day
    const hour = new Date().getHours();
    const greeting =
        hour < 12 ? "Good morning" :
        hour < 17 ? "Good afternoon" :
        "Good evening";

    return (
        <StoreLayout>
            <Head title="My Account" />

            {/* ── Hero Header ── */}
            <div className="relative overflow-hidden bg-[#171310]">
                {/* Ambient radial glows */}
                <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#9C7A3C]/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#9C7A3C]/8 blur-2xl" />

                {/* Fine dot grid */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "28px 28px",
                    }}
                />

                <div className="relative mx-auto max-w-7xl px-6 pb-14 pt-12 sm:px-8 lg:px-12">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#9C7A3C]">
                                {greeting}
                            </p>
                            <h1 className="mt-1 font-serif text-4xl font-medium tracking-tight text-white sm:text-5xl">
                                {firstName}
                            </h1>
                            <p className="mt-2 text-sm text-white/45">
                                {auth.user?.email}
                            </p>
                        </div>

                        {/* Avatar circle */}
                        <div className="flex-shrink-0">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/10 backdrop-blur-sm sm:h-16 sm:w-16">
                                <span className="font-serif text-2xl font-medium text-white sm:text-3xl">
                                    {firstName[0]?.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Member since strip */}
                    <div className="mt-8 flex items-center gap-2">
                        <Star size={12} className="text-[#9C7A3C]" fill="#9C7A3C" />
                        <p className="text-[11px] text-white/40">
                            Boutique Luxxe Member
                        </p>
                        <span className="mx-2 text-white/15">·</span>
                        <ShoppingBag size={12} className="text-white/40" />
                        <p className="text-[11px] text-white/40">
                            {stats.orders_count} {stats.orders_count === 1 ? "order" : "orders"} placed
                        </p>
                    </div>
                </div>

                {/* Bottom fade into page background */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#F8F5EF] to-transparent" />
            </div>

            {/* ── Page Body ── */}
            <div className="mx-auto max-w-7xl px-6 pb-6 pt-2 sm:px-8 lg:pb-20 lg:px-12">

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-3">
                    <StatCard
                        href="/account/orders"
                        icon={Package}
                        value={stats.orders_count}
                        label="Orders"
                        sub="All time"
                    />
                    <StatCard
                        href="/account/wishlist"
                        icon={Heart}
                        value={stats.wishlist_count}
                        label="Saved"
                        sub="Wishlist"
                    />
                    <StatCard
                        href="/account/addresses"
                        icon={MapPin}
                        value={stats.addresses_count}
                        label="Addresses"
                        sub="Saved"
                    />
                </div>

                {/* ── Main two-col layout ── */}
                <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-5">

                    {/* Left — Recent Orders */}
                    <div className="lg:col-span-3">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="font-serif text-xl font-medium text-[#171310]">
                                Recent Orders
                            </h2>
                            <Link
                                href="/account/orders"
                                className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9C7A3C] transition hover:text-[#171310]"
                            >
                                View all <ChevronRight size={12} strokeWidth={2.5} />
                            </Link>
                        </div>

                        {recentOrders.length === 0 ? (
                            <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#171310]/10 py-16 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F5EF]">
                                    <ShoppingBag size={22} className="text-[#171310]/25" strokeWidth={1.5} />
                                </div>
                                <p className="text-sm font-medium text-[#171310]">No orders yet</p>
                                <p className="mt-1 text-xs text-[#252525]/45">
                                    Your order history will appear here
                                </p>
                                <Link
                                    href="/shop"
                                    className="mt-5 rounded-full bg-[#171310] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#9C7A3C]"
                                >
                                    Start Shopping
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentOrders.map((o, i) => (
                                    <Link
                                        key={o.id}
                                        href={`/account/orders/${o.id}`}
                                        className="group flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition duration-300 hover:shadow-[0_12px_32px_-8px_rgba(23,19,16,0.12)] sm:p-5"
                                    >
                                        {/* Order index badge */}
                                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#F8F5EF] font-serif text-sm font-medium text-[#9C7A3C]">
                                            {String(i + 1).padStart(2, "0")}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-[#171310]">
                                                    {o.order_number}
                                                </p>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-[#252525]/45">
                                                {new Date(o.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end gap-1.5">
                                            <p className="text-sm font-semibold text-[#171310]">
                                                {formatPrice(o.total)}
                                            </p>
                                            <StatusBadge status={o.status} />
                                        </div>

                                        <ChevronRight
                                            size={15}
                                            className="flex-shrink-0 text-[#171310]/15 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-[#9C7A3C]"
                                        />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right — Quick Actions */}
                    <div className="lg:col-span-2">
                        <h2 className="mb-4 font-serif text-xl font-medium text-[#171310]">
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <QuickAction
                                href="/account/profile"
                                icon={UserIcon}
                                label="Edit Profile"
                                description="Update your name and email"
                            />
                            <QuickAction
                                href="/account/orders"
                                icon={Package}
                                label="My Orders"
                                description="Track and manage orders"
                            />
                            <QuickAction
                                href="/account/wishlist"
                                icon={Heart}
                                label="Wishlist"
                                description="Pieces you've saved"
                            />
                            <QuickAction
                                href="/account/addresses"
                                icon={MapPin}
                                label="Addresses"
                                description="Manage delivery addresses"
                            />
                            <QuickAction
                                href="/account/notifications"
                                icon={Bell}
                                label="Notifications"
                                description="View your updates"
                            />
                            <QuickAction
                                href="/account/profile"
                                icon={Settings}
                                label="Account Settings"
                                description="Password and preferences"
                            />
                            <QuickAction
                                icon={LogOut}
                                label="Sign Out"
                                description="Log out of your account"
                                onClick={() => router.post("/logout")}
                                danger
                            />
                        </div>
                    </div>
                </div>

                {/* ── Bottom CTA ── */}
                <div className="mt-10 overflow-hidden rounded-2xl bg-[#171310]">
                    <div className="relative flex flex-col items-start gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
                        <div
                            className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[#9C7A3C]/10"
                        />
                        <div className="relative">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9C7A3C]">
                                Continue Exploring
                            </p>
                            <p className="mt-1 font-serif text-2xl font-medium text-white">
                                Discover new arrivals
                            </p>
                            <p className="mt-1 text-xs text-white/45">
                                The latest pieces, curated for you
                            </p>
                        </div>
                        <Link
                            href="/shop?sort=newest"
                            className="relative inline-flex items-center gap-2 rounded-full bg-[#9C7A3C] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-white shadow-[0_8px_24px_-8px_rgba(156,122,60,0.6)] transition hover:bg-[#b08d4c]"
                        >
                            Shop New Arrivals
                            <ChevronRight size={14} strokeWidth={2.5} />
                        </Link>
                    </div>
                </div>
            </div>
        </StoreLayout>
    );
}
