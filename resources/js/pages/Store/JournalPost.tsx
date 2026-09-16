import { Head } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";

interface PostProps {
    post: {
        title: string;
        content: string;
        cover_image_url: string | null;
        published_at: string;
    };
}

export default function JournalPostPage({ post }: PostProps) {
    return (
        <StoreLayout>
            <Head title={post.title} />
            <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
                <p className="text-xs text-[#252525]/40">
                    {new Date(post.published_at).toLocaleDateString()}
                </p>
                <h1 className="mt-2 text-3xl font-bold text-[#171310]">
                    {post.title}
                </h1>
                {post.cover_image_url && (
                    <img
                        src={post.cover_image_url}
                        alt={post.title}
                        className="mt-8 w-full rounded-2xl"
                    />
                )}
                <div
                    className="prose prose-sm mt-8 max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>
        </StoreLayout>
    );
}
