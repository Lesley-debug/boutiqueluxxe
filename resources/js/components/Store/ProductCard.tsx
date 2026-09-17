import { Link } from "@inertiajs/react";

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        slug: string;
        brand?: string | null;
        base_price: string;
        sale_price: string | null;
        new_arrival?: boolean;
        images: { url: string }[];
        variants?: { stock_quantity: number }[];
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const price = product.sale_price ?? product.base_price;
    const primary = product.images[0];
    const inStock = product.variants
        ? product.variants.some((v) => v.stock_quantity > 0)
        : true;

    return (
        <Link href={`/products/${product.slug}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[2px] border border-[#171310]/[0.06] bg-[#F8F5EF] transition-all duration-500 group-hover:shadow-[0_24px_48px_-24px_rgba(23,19,16,0.3)]">
                {primary && (
                    <img
                        src={primary.url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    />
                )}
                {product.new_arrival && (
                    <span className="absolute left-4 top-4 rounded-full bg-[#171310] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
                        New
                    </span>
                )}
                {!inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#F8F5EF]/80">
                        <span className="rounded-full bg-[#171310] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-white">
                            Sold Out
                        </span>
                    </div>
                )}
            </div>
            <div className="mt-4 space-y-1">
                {product.brand && (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#171310]/40">
                        {product.brand}
                    </p>
                )}
                <p className="text-sm text-[#171310] transition group-hover:text-[#9C7A3C]">
                    {product.name}
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-[#171310]">
                        {Number(price).toLocaleString()} FCFA
                    </span>
                    {product.sale_price && (
                        <span className="text-xs text-[#252525]/35 line-through">
                            {Number(product.base_price).toLocaleString()} FCFA
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
