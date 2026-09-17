import { useState, useEffect, useRef } from 'react';
import { router, Link } from '@inertiajs/react';
import { Bell, Check, X, Package, AlertCircle, Sparkles } from 'lucide-react';

interface Notification {
    id: string;
    type: string;
    data: {
        title: string;
        message: string;
        url?: string;
        icon?: string;
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationDropdownProps {
    notifications: Notification[];
    unreadCount: number;
}

export default function NotificationDropdown({ notifications, unreadCount }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen]);

    function markAsRead(notificationId: string) {
        router.post(`/notifications/${notificationId}/read`, {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    function markAllAsRead() {
        router.post('/notifications/mark-all-read', {}, {
            preserveScroll: true,
            preserveState: true,
        });
    }

    function getNotificationIcon(type: string) {
        switch (type) {
            case 'order_placed':
            case 'order_status_updated':
                return <Package className="h-5 w-5 text-[#9C7A3C]" />;
            case 'welcome':
                return <Sparkles className="h-5 w-5 text-[#9C7A3C]" />;
            default:
                return <AlertCircle className="h-5 w-5 text-[#9C7A3C]" />;
        }
    }

    function getRelativeTime(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    }

    return (
        <div ref={dropdownRef} className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative rounded-full p-2 text-[#171310] transition hover:bg-[#171310]/5 hover:text-[#9C7A3C]"
                title="Notifications"
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#9C7A3C] text-[10px] font-bold text-white ring-2 ring-[#F8F5EF]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-2xl border border-[#171310]/10 bg-white shadow-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#171310]/10 p-4">
                        <h3 className="font-serif text-lg font-medium text-[#171310]">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-medium uppercase tracking-[0.1em] text-[#9C7A3C] transition hover:text-[#171310]"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center">
                                <Bell className="mx-auto h-12 w-12 text-[#171310]/20" />
                                <p className="mt-4 text-sm text-[#252525]/60">
                                    No notifications yet
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#171310]/5">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`group relative p-4 transition hover:bg-[#F8F5EF] ${
                                            !notification.read_at ? 'bg-[#9C7A3C]/5' : ''
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon */}
                                            <div className="flex-shrink-0">
                                                <div className="rounded-full bg-[#F8F5EF] p-2">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                {notification.data.url ? (
                                                    <Link
                                                        href={notification.data.url}
                                                        onClick={() => {
                                                            if (!notification.read_at) {
                                                                markAsRead(notification.id);
                                                            }
                                                            setIsOpen(false);
                                                        }}
                                                        className="block"
                                                    >
                                                        <p className="text-sm font-medium text-[#171310]">
                                                            {notification.data.title}
                                                        </p>
                                                        <p className="mt-1 text-xs leading-relaxed text-[#252525]/70">
                                                            {notification.data.message}
                                                        </p>
                                                        <p className="mt-2 text-xs text-[#252525]/40">
                                                            {getRelativeTime(notification.created_at)}
                                                        </p>
                                                    </Link>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-medium text-[#171310]">
                                                            {notification.data.title}
                                                        </p>
                                                        <p className="mt-1 text-xs leading-relaxed text-[#252525]/70">
                                                            {notification.data.message}
                                                        </p>
                                                        <p className="mt-2 text-xs text-[#252525]/40">
                                                            {getRelativeTime(notification.created_at)}
                                                        </p>
                                                    </>
                                                )}
                                            </div>

                                            {/* Mark as Read/Unread Button */}
                                            {!notification.read_at && (
                                                <button
                                                    onClick={() => markAsRead(notification.id)}
                                                    className="absolute right-4 top-4 rounded-full p-1 opacity-0 transition hover:bg-white group-hover:opacity-100"
                                                    title="Mark as read"
                                                >
                                                    <Check className="h-4 w-4 text-[#9C7A3C]" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Unread Indicator */}
                                        {!notification.read_at && (
                                            <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#9C7A3C]" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="border-t border-[#171310]/10 p-4 text-center">
                            <Link
                                href="/account/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-xs font-medium uppercase tracking-[0.1em] text-[#171310] transition hover:text-[#9C7A3C]"
                            >
                                View All Notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
