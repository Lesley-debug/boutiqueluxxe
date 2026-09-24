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
        <StoreLayout showMobileHeader>
            <Head title="Journal" />
            <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
                <div className="mb-16 text-center">
                    <h1 className="font-serif text-5xl font-medium tracking-tight text-[#171310]">
                        Journal
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-[#252525]/70">
                        Style guides, care tips, and stories from Boutique Luxxe
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-12 text-center">
                        <p className="text-lg text-[#252525]/60">
                            No posts published yet — check back soon.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post, index) => (
                            <Link
                                key={post.id}
                                href={`/journal/${post.slug}`}
                                className="group"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                }}
                            >
                                <article className="overflow-hidden rounded-[2px] bg-white transition-all duration-500 group-hover:shadow-[0_24px_48px_-24px_rgba(23,19,16,0.2)]">
                                    <div className="relative aspect-[4/3] overflow-hidden bg-[#F8F5EF]">
                                        {post.cover_image_url && (
                                            <img
                                                src={post.cover_image_url}
                                                alt={post.title}
                                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#171310]/20 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                    </div>
                                    <div className="p-6">
                                        <time className="text-xs font-medium uppercase tracking-[0.1em] text-[#9C7A3C]">
                                            {new Date(post.published_at).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </time>
                                        <h2 className="mt-2 font-serif text-xl font-medium leading-tight tracking-tight text-[#171310] transition-colors group-hover:text-[#9C7A3C]">
                                            {post.title}
                                        </h2>
                                        {post.excerpt && (
                                            <p className="mt-3 text-sm leading-relaxed text-[#252525]/70">
                                                {post.excerpt}
                                            </p>
                                        )}
                                        <div className="mt-4 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-[#171310] transition-colors group-hover:text-[#9C7A3C]">
                                            <span>Read Article</span>
                                            <svg className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </article>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </StoreLayout>
    );
}
