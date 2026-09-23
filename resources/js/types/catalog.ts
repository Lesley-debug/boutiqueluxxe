export interface Category {
    id: number;
    parent_id: number | null;
    name: string;
    slug: string;
    status: string;
    children?: Category[];
}

export interface ProductImage {
    id: number;
    path: string;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
}

export interface ProductVariant {
    id: number;
    color: string | null;
    size: string | null;
    material: string | null;
    sku: string;
    stock_quantity: number;
}

export interface Product {
    id: number;
    category_id: number;
    category?: Category;
    brand: string | null;
    name: string;
    slug: string;
    description: string | null;
    base_price: string;
    sale_price: string | null;
    featured: boolean;
    new_arrival: boolean;
    images: ProductImage[];
    variants: ProductVariant[];
    is_wishlisted?: boolean;
}

export interface PaginatedProducts {
    data: Product[];
    links: { url: string | null; label: string; active: boolean }[];
    current_page: number;
    last_page: number;
    total: number;
}

export interface ShopFilters {
    category?: string;
    search?: string;
    min_price?: string;
    max_price?: string;
    sort?: string;
}
