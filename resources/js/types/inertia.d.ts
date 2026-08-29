export interface SharedAuthUser {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    role: string | null;
}

export interface NotificationItem {
    id: string;
    data: { message: string };
    read_at: string | null;
    created_at: string;
}

export interface SharedNotifications {
    unread_count: number;
    recent: NotificationItem[];
}

declare module "@inertiajs/core" {
    interface PageProps {
        auth: {
            user: SharedAuthUser | null;
        };
        errors: Record<string, string>;
        notifications?: SharedNotifications;
    }
}

export interface SharedCart {
    item_count: number;
}

declare module "@inertiajs/core" {
    interface PageProps {
        auth: {
            user: SharedAuthUser | null;
        };
        errors: Record<string, string>;
        notifications?: SharedNotifications;
        cart: SharedCart;
        paymentFailed?: boolean;
    }
}