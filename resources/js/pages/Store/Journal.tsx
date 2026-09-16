import { Head, Link } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";

interface PostCard {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image_url: string | null;
    published_at: string;
}

export default function Journal({ posts }: { posts: PostCard[] }) {
    return (
        <StoreLayout>
            <Head title="Journal" />
            <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
                <h1 className="mb-2 text-3xl font-bold text-[#171310]">
                    Journal
                </h1>
                <p className="mb-10 text-[#252525]/60">
                    Style guides, care tips, and stories from Designer Bags
                    Boutique.
                </p>

                {posts.length === 0 ? (
                    <p className="text-[#252525]/60">
                        No posts published yet — check back soon.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        {posts.map((post) => (
                            <Link
                                key={post.id}
                                href={`/journal/${post.slug}`}
                                className="group"
                            >
                                <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
                                    {post.cover_image_url && (
                                        <img
                                            src={post.cover_image_url}
                                            alt={post.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    )}
                                </div>
                                <p className="mt-4 text-xs text-[#252525]/40">
                                    {new Date(
                                        post.published_at,
                                    ).toLocaleDateString()}
                                </p>
                                <h2 className="mt-1 text-lg font-bold text-[#171310]">
                                    {post.title}
                                </h2>
                                {post.excerpt && (
                                    <p className="mt-2 text-sm text-[#252525]/60">
                                        {post.excerpt}
                                    </p>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
