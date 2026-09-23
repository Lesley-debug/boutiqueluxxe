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

export interface SharedCart {
    item_count: number;
}

export interface MegaMenuCategory {
    id: number;
    name: string;
    slug: string;
    audience: { id: number; name: string; slug: string }[];
}

export interface ShopByStyleItem {
    id: number;
    name: string;
    slug: string;
}

declare module "@inertiajs/core" {
    interface PageProps {
        auth: {
            user: SharedAuthUser | null;
            permissions: string[];
        };
        errors: Record<string, string>;
        notifications?: SharedNotifications;
        cart: SharedCart;
        megaMenu: MegaMenuCategory[];
        shopByStyle: ShopByStyleItem[];
        paymentFailed?: boolean;
        welcomeBack?: boolean;
        registered?: boolean;
        wishlist_count?: number;
    }
}