import { Head, Link } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";

interface CollectionCard {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    hero_image_url: string | null;
}

export default function Collections({
    collections,
}: {
    collections: CollectionCard[];
}) {
    return (
        <StoreLayout>
            <Head title="Collections" />
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                <h1 className="mb-10 text-3xl font-bold text-[#171310]">
                    Collections
                </h1>
                {collections.length === 0 ? (
                    <p className="text-[#252525]/60">
                        No collections available yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {collections.map((c) => (
                            <Link
                                key={c.id}
                                href={`/collections/${c.slug}`}
                                className="group relative aspect-[16/9] overflow-hidden rounded-3xl bg-gray-100 shadow-sm transition hover:shadow-xl"
                            >
                                {c.hero_image_url && (
                                    <img
                                        src={c.hero_image_url}
                                        alt={c.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-6 left-6 text-white">
                                    <p className="text-2xl font-bold">
                                        {c.name}
                                    </p>
                                    {c.description && (
                                        <p className="mt-1 max-w-md text-sm text-white/80">
                                            {c.description}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
