import { Head } from '@inertiajs/react';
import { Calendar, ShoppingBag, Heart, MapPin, User, LogIn, Package, Eye } from 'lucide-react';
import StoreLayout from '@/components/Store/StoreLayout';
import Reveal from '@/components/Store/Reveal';

interface ActivityLog {
    id: number;
    activity_type: string;
    description: string;
    metadata: any;
    created_at: string;
}

interface ActivityProps {
    activities: {
        data: ActivityLog[];
        links: any[];
        meta: any;
    };
}

export default function Activity({ activities }: ActivityProps) {
    function getActivityIcon(type: string) {
        switch (type) {
            case 'login':
            case 'register':
                return <LogIn className="h-5 w-5" />;
            case 'order_placed':
            case 'order_viewed':
                return <Package className="h-5 w-5" />;
            case 'wishlist_added':
            case 'wishlist_removed':
                return <Heart className="h-5 w-5" />;
            case 'product_viewed':
                return <Eye className="h-5 w-5" />;
            case 'cart_updated':
                return <ShoppingBag className="h-5 w-5" />;
            case 'address_added':
            case 'address_updated':
            case 'address_deleted':
                return <MapPin className="h-5 w-5" />;
            case 'profile_updated':
                return <User className="h-5 w-5" />;
            default:
                return <Calendar className="h-5 w-5" />;
        }
    }

    function getActivityColor(type: string) {
        switch (type) {
            case 'order_placed':
                return 'bg-[#9C7A3C]/10 text-[#9C7A3C]';
            case 'wishlist_added':
                return 'bg-red-50 text-red-600';
            case 'login':
            case 'register':
                return 'bg-green-50 text-green-600';
            default:
                return 'bg-[#F8F5EF] text-[#171310]';
        }
    }

    function formatDate(dateString: string) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function groupActivitiesByDate(activities: ActivityLog[]) {
        const groups: { [key: string]: ActivityLog[] } = {};

        activities.forEach((activity) => {
            const date = new Date(activity.created_at);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let groupKey: string;
            if (date.toDateString() === today.toDateString()) {
                groupKey = 'Today';
            } else if (date.toDateString() === yesterday.toDateString()) {
                groupKey = 'Yesterday';
            } else {
                groupKey = date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                });
            }

            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(activity);
        });

        return groups;
    }

    const groupedActivities = groupActivitiesByDate(activities.data);

    return (
        <StoreLayout>
            <Head title="Activity" />
            <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
                <Reveal>
                    <div className="mb-12">
                        <h1 className="font-serif text-4xl font-medium tracking-tight text-[#171310]">
                            Your Activity
                        </h1>
                        <p className="mt-3 text-sm text-[#252525]/60">
                            Track your recent interactions and shopping history
                        </p>
                    </div>
                </Reveal>

                {activities.data.length === 0 ? (
                    <Reveal delay={100}>
                        <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-12 text-center">
                            <Calendar className="mx-auto h-12 w-12 text-[#171310]/30" />
                            <p className="mt-4 text-lg text-[#252525]/60">No activity yet</p>
                            <p className="mt-2 text-sm text-[#252525]/40">
                                Start shopping to see your activity here
                            </p>
                        </div>
                    </Reveal>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(groupedActivities).map(([date, logs], groupIndex) => (
                            <Reveal key={date} delay={groupIndex * 50}>
                                <div>
                                    <h2 className="mb-4 text-sm font-medium uppercase tracking-[0.1em] text-[#252525]/60">
                                        {date}
                                    </h2>
                                    <div className="space-y-3">
                                        {logs.map((activity, index) => (
                                            <div
                                                key={activity.id}
                                                className="group relative overflow-hidden rounded-xl border border-[#171310]/10 bg-white p-5 transition-all duration-300 hover:shadow-[0_8px_24px_-8px_rgba(23,19,16,0.12)]"
                                                style={{
                                                    animationDelay: `${index * 30}ms`,
                                                }}
                                            >
                                                <div className="flex items-start gap-4">
                                                    {/* Icon */}
                                                    <div
                                                        className={`flex-shrink-0 rounded-full p-3 ${getActivityColor(activity.activity_type)}`}
                                                    >
                                                        {getActivityIcon(activity.activity_type)}
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-[#171310]">
                                                            {activity.description}
                                                        </p>
                                                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                {activity.metadata.product_name && (
                                                                    <span className="rounded-full bg-[#F8F5EF] px-3 py-1 text-xs text-[#252525]/70">
                                                                        {activity.metadata.product_name}
                                                                    </span>
                                                                )}
                                                                {activity.metadata.order_number && (
                                                                    <span className="rounded-full bg-[#9C7A3C]/10 px-3 py-1 text-xs font-mono text-[#9C7A3C]">
                                                                        #{activity.metadata.order_number}
                                                                    </span>
                                                                )}
                                                                {activity.metadata.quantity && (
                                                                    <span className="rounded-full bg-[#F8F5EF] px-3 py-1 text-xs text-[#252525]/70">
                                                                        Qty: {activity.metadata.quantity}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        <p className="mt-2 text-xs text-[#252525]/40">
                                                            {formatDate(activity.created_at)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Decorative line */}
                                                <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#9C7A3C] to-transparent transition-all duration-500 group-hover:w-full" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {activities.links && activities.links.length > 3 && (
                    <Reveal delay={200}>
                        <div className="mt-12 flex justify-center gap-2">
                            {activities.links.map((link: any, i: number) => (
                                <button
                                    key={i}
                                    disabled={!link.url}
                                    onClick={() => link.url && (window.location.href = link.url)}
                                    className={`rounded-full border px-4 py-2 text-sm transition disabled:opacity-40 ${
                                        link.active
                                            ? 'border-[#9C7A3C] bg-[#9C7A3C] text-white'
                                            : 'border-[#171310]/15 text-[#171310] hover:border-[#9C7A3C] hover:text-[#9C7A3C]'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </Reveal>
                )}
            </div>
        </StoreLayout>
    );
}
