export interface Address {
    id: number;
    label: string | null;
    recipient_name: string;
    phone: string;
    address_line: string;
    city: string;
    region: string | null;
    is_default: boolean;
}

export interface WishlistItem {
    id: number;
    product: {
        id: number;
        name: string;
        slug: string;
        base_price: string;
        sale_price: string | null;
        images: { url: string }[];
    };
}
