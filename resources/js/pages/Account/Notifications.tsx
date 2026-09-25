import { Head, Link, router } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";
import {
    Bell,
    ShoppingBag,
    Tag,
    Sparkles,
    Package,
    Truck,
    Star,
    Info,
    ChevronLeft,
    CheckCheck,
} from "lucide-react";

interface NotificationItem {
    id: string;
    data: {
        title?: string;
        message?: string;
        url?: string;
        icon?: string;
    };
    read_at: string | null;
    created_at: string;
}

interface Paginated {
    data: NotificationItem[];
    current_page: number;
    last_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

// Map icon slug to lucide icon
const ICON_MAP: Record<string, typeof Bell> = {
    welcome:       Sparkles,
    order_placed:  ShoppingBag,
    order_status:  Truck,
    new_product:   Tag,
    new_category:  Tag,
    new_arrival:   Star,
    order:         Package,
    info:          Info,
};

function NotificationIcon({ icon }: { icon?: string }) {
    const Icon = (icon && ICON_MAP[icon]) ? ICON_MAP[icon] : Bell;
    return (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F8F5EF]">
            <Icon size={17} className="text-[#9C7A3C]" strokeWidth={1.8} />
        </div>
    );
}

function timeAgo(dateStr: string): string {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Notifications({
    notifications,
}: {
    notifications: Paginated;
}) {
    const unreadCount = notifications.data.filter((n) => !n.read_at).length;

    function markRead(id: string) {
        router.post(`/account/notifications/${id}/read`, {}, { preserveScroll: true });
    }

    function markAllRead() {
        router.post("/account/notifications/mark-all-read", {}, { preserveScroll: true });
    }

    return (
        <StoreLayout showMobileHeader>
            <Head title="Notifications" />

            <div className="mx-auto max-w-3xl px-6 pb-6 pt-10 sm:px-8 lg:pb-20">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <Link
                        href="/account"
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F8F5EF] transition hover:bg-[#171310]/5"
                    >
                        <ChevronLeft size={17} strokeWidth={2} className="text-[#171310]" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="font-serif text-2xl font-medium text-[#171310]">
                            Notifications
                        </h1>
                        {unreadCount > 0 && (
                            <p className="mt-0.5 text-xs text-[#252525]/50">
                                {unreadCount} unread
                            </p>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-1.5 rounded-full border border-[#171310]/10 bg-white px-4 py-2 text-[11px] font-medium text-[#171310] shadow-sm transition hover:bg-[#F8F5EF]"
                        >
                            <CheckCheck size={13} className="text-[#9C7A3C]" />
                            Mark all read
                        </button>
                    )}
                </div>

                {/* List */}
                {notifications.data.length === 0 ? (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#171310]/10 py-24 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F8F5EF]">
                            <Bell size={24} className="text-[#171310]/20" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium text-[#171310]">No notifications yet</p>
                        <p className="mt-1 text-xs text-[#252525]/45">
                            We'll notify you about orders, new arrivals, and more.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {notifications.data.map((n) => {
                            const isUnread = !n.read_at;
                            const content = (
                                <div
                                    className={`group flex items-start gap-4 rounded-2xl p-4 transition duration-200 sm:p-5 ${
                                        isUnread
                                            ? "bg-white shadow-sm hover:shadow-md"
                                            : "bg-white/60 hover:bg-white hover:shadow-sm"
                                    }`}
                                    onClick={() => isUnread && markRead(n.id)}
                                >
                                    <NotificationIcon icon={n.data.icon} />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm ${isUnread ? "font-semibold text-[#171310]" : "font-medium text-[#252525]/70"}`}>
                                                {n.data.title ?? "Notification"}
                                            </p>
                                            <span className="flex-shrink-0 text-[10px] text-[#252525]/35">
                                                {timeAgo(n.created_at)}
                                            </span>
                                        </div>
                                        {n.data.message && (
                                            <p className="mt-1 text-xs leading-relaxed text-[#252525]/55">
                                                {n.data.message}
                                            </p>
                                        )}
                                    </div>

                                    {/* Unread dot */}
                                    {isUnread && (
                                        <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#9C7A3C]" />
                                    )}
                                </div>
                            );

                            return n.data.url ? (
                                <Link key={n.id} href={n.data.url} className="block">
                                    {content}
                                </Link>
                            ) : (
                                <div key={n.id} className="cursor-pointer">
                                    {content}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {notifications.last_page > 1 && (
                    <div className="mt-8 flex justify-center gap-2">
                        {notifications.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url, { preserveScroll: true })}
                                className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-40 ${
                                    link.active
                                        ? "border-[#9C7A3C] bg-[#9C7A3C] text-white"
                                        : "border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C]"
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
