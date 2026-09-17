import { Head } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";
import ProductCard from "@/components/Store/ProductCard";
import type { Product } from "@/types/catalog";

interface CollectionDetailProps {
    collection: {
        name: string;
        description: string | null;
        hero_image_url: string | null;
        products: Product[];
    };
}

export default function CollectionDetail({
    collection,
}: CollectionDetailProps) {
    return (
        <StoreLayout>
            <Head title={collection.name} />

            {collection.hero_image_url && (
                <div className="relative h-64 w-full overflow-hidden sm:h-96">
                    <img
                        src={collection.hero_image_url}
                        alt={collection.name}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <h1 className="text-4xl font-bold text-white">
                            {collection.name}
                        </h1>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                {!collection.hero_image_url && (
                    <h1 className="mb-2 text-3xl font-bold text-[#171310]">
                        {collection.name}
                    </h1>
                )}
                {collection.description && (
                    <p className="mb-10 max-w-2xl text-[#252525]/60">
                        {collection.description}
                    </p>
                )}

                {collection.products.length === 0 ? (
                    <p className="text-[#252525]/60">
                        No products in this collection yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                        {collection.products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
