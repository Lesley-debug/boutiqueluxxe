import { Head, Link } from "@inertiajs/react";
import { PackageSearch } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";
import { Eyebrow, Container } from "@/components/Store/ui";

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
            <Container className="py-16 sm:py-20">
                {/* Header */}
                <div className="mb-12 text-center sm:mb-16">
                    <Eyebrow>Curated Edits</Eyebrow>
                    <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight text-[#171310] md:text-5xl">
                        Collections
                    </h1>
                    <p className="mx-auto mt-4 max-w-lg text-sm text-[#252525]/55">
                        Discover our carefully curated edits — pieces selected to tell a story.
                    </p>
                </div>

                {collections.length === 0 ? (
                    <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#171310]/12 py-24 text-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F8F5EF]">
                            <PackageSearch size={22} className="text-[#171310]/25" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium text-[#171310]">No collections yet</p>
                        <p className="mt-1 text-xs text-[#252525]/45">
                            Check back soon — new edits are always in the works.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-6 rounded-full bg-[#171310] px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-[#9C7A3C]"
                        >
                            Browse All Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        {collections.map((c, i) => (
                            <Link
                                key={c.id}
                                href={`/collections/${c.slug}`}
                                className={`group relative overflow-hidden rounded-2xl bg-[#F0EBE3] transition-all duration-500 hover:shadow-[0_30px_60px_-20px_rgba(23,19,16,0.25)] ${
                                    i === 0 && collections.length > 2 ? "sm:col-span-2 aspect-[16/7]" : "aspect-[4/3]"
                                }`}
                            >
                                {c.hero_image_url ? (
                                    <img
                                        src={c.hero_image_url}
                                        alt={c.name}
                                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <span className="font-serif text-4xl text-[#9C7A3C]/30">◈</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#171310]/70 via-[#171310]/10 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#9C7A3C]">
                                        Collection
                                    </p>
                                    <h2 className="mt-1 font-serif text-2xl font-medium text-white sm:text-3xl">
                                        {c.name}
                                    </h2>
                                    {c.description && (
                                        <p className="mt-1.5 max-w-sm text-sm text-white/70 line-clamp-2">
                                            {c.description}
                                        </p>
                                    )}
                                    <span className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/80 transition-colors group-hover:text-[#9C7A3C]">
                                        Explore
                                        <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </Container>
        </StoreLayout>
    );
}
