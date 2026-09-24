import { Head } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";
import ProductCard from "@/components/Store/ProductCard";
import Reveal from "@/components/Store/Reveal";
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
        <StoreLayout showMobileHeader>
            <Head title={collection.name} />

            {collection.hero_image_url && (
                <div className="relative h-[70vh] w-full overflow-hidden">
                    <img
                        src={collection.hero_image_url}
                        alt={collection.name}
                        className="h-full w-full object-cover transition-transform duration-1000 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#171310]/60 via-[#171310]/20 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
                        <Reveal>
                            <h1 className="font-serif text-5xl font-medium text-white md:text-7xl">
                                {collection.name}
                            </h1>
                            {collection.description && (
                                <p className="mx-auto mt-6 max-w-2xl text-lg text-white/85">
                                    {collection.description}
                                </p>
                            )}
                        </Reveal>
                    </div>
                </div>
            )}

            <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28">
                {!collection.hero_image_url && (
                    <Reveal>
                        <div className="mb-16 text-center">
                            <h1 className="font-serif text-5xl font-medium tracking-tight text-[#171310] md:text-6xl">
                                {collection.name}
                            </h1>
                            {collection.description && (
                                <p className="mx-auto mt-6 max-w-2xl text-lg text-[#252525]/70">
                                    {collection.description}
                                </p>
                            )}
                        </div>
                    </Reveal>
                )}

                {collection.products.length === 0 ? (
                    <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-12 text-center">
                        <p className="text-lg text-[#252525]/60">
                            No products in this collection yet.
                        </p>
                        <p className="mt-2 text-sm text-[#252525]/40">
                            Check back soon for new additions
                        </p>
                    </div>
                ) : (
                    <>
                        <Reveal>
                            <div className="mb-12 text-center">
                                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#9C7A3C]">
                                    Collection
                                </p>
                                <h2 className="mt-2 font-serif text-2xl font-medium text-[#171310]">
                                    {collection.products.length} Piece{collection.products.length !== 1 ? 's' : ''}
                                </h2>
                            </div>
                        </Reveal>
                        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
                            {collection.products.map((product, index) => (
                                <Reveal key={product.id} delay={index * 80}>
                                    <ProductCard product={product} />
                                </Reveal>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </StoreLayout>
    );
}
