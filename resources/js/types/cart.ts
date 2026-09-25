import type { Product, ProductVariant } from "./catalog";

export interface CartItem {
    id: number;
    cart_id: number;
    product_variant_id: number;
    quantity: number;
    unit_price: number;
    line_total: number;
    variant: ProductVariant & { product: Product };
}

export interface CartDiscount {
    id: number;
    code: string;
    type: "percentage" | "fixed";
    value: string;
}

export interface Cart {
    id: number | null;
    items: CartItem[];
    subtotal: number;
    item_count: number;
    discount_amount: number;
    total: number;
    discount: CartDiscount | null;
}
