import { Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { notifications } = usePage().props;

    if (!notifications) return null;

    function markAsRead(id: string) {
        router.patch(
            `/admin/notifications/${id}/read`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    }

    function markAllAsRead() {
        router.post(
            "/admin/notifications/read-all",
            {},
            { preserveScroll: true, preserveState: true },
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="relative rounded-sm border border-stone-300 px-3 py-2 text-sm"
            >
                🔔
                {notifications.unread_count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white">
                        {notifications.unread_count}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 z-10 mt-2 w-80 rounded-sm border border-stone-200 bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b border-stone-100 px-4 py-2">
                        <span className="text-sm font-semibold">
                            Notifications
                        </span>
                        {notifications.unread_count > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-stone-500 underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.recent.length === 0 && (
                            <p className="px-4 py-6 text-center text-sm text-stone-400">
                                No notifications yet.
                            </p>
                        )}
                        {notifications.recent.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => markAsRead(n.id)}
                                className={`block w-full px-4 py-3 text-left text-sm hover:bg-stone-50 ${
                                    n.read_at
                                        ? "text-stone-500"
                                        : "font-medium text-stone-900"
                                }`}
                            >
                                {n.data.message}
                                <div className="text-xs text-stone-400">
                                    {new Date(n.created_at).toLocaleString()}
                                </div>
                            </button>
                        ))}
                    </div>
                    <Link
                        href="/admin/notifications"
                        className="block border-t border-stone-100 px-4 py-2 text-center text-xs text-stone-500 underline"
                    >
                        View all
                    </Link>
                </div>
            )}
        </div>
    );
}
