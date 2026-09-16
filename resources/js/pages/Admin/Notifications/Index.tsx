import AdminLayout from "@/components/admin/AdminLayout";
import { router } from "@inertiajs/react";

interface NotificationItem {
    id: string;
    data: { message: string };
    read_at: string | null;
    created_at: string;
}

interface Paginated {
    data: NotificationItem[];
}

export default function Index({ notifications }: { notifications: Paginated }) {
    function markAsRead(id: string) {
        router.patch(
            `/admin/notifications/${id}/read`,
            {},
            { preserveScroll: true },
        );
    }

    return (
        <AdminLayout title="Notifications">
                <div className="divide-y divide-stone-100 border-y border-stone-200">
                    {notifications.data.map((n) => (
                        <div
                            key={n.id}
                            className={`flex items-center justify-between py-3 text-sm ${
                                n.read_at ? "text-stone-500" : "font-medium"
                            }`}
                        >
                            <div>
                                <p>{n.data.message}</p>
                                <p className="text-xs text-stone-400">
                                    {new Date(n.created_at).toLocaleString()}
                                </p>
                            </div>
                            {!n.read_at && (
                                <button
                                    onClick={() => markAsRead(n.id)}
                                    className="text-xs text-stone-600 underline"
                                >
                                    Mark read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {notifications.data.length === 0 && (
                    <p className="py-10 text-center text-stone-500">
                        No notifications.
                    </p>
                )}
        </AdminLayout>
    );
}
