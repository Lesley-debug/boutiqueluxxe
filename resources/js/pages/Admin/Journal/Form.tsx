import { Head, useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import RichTextEditor from "@/components/admin/RichTextEditor";

interface PostData {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    status: string;
}

export default function Form({ post }: { post?: PostData }) {
    const isEdit = !!post;
    const {
        data,
        setData,
        post: submitPost,
        processing,
        errors,
    } = useForm({
        title: post?.title ?? "",
        slug: post?.slug ?? "",
        excerpt: post?.excerpt ?? "",
        content: post?.content ?? "",
        status: post?.status ?? "draft",
        cover_image: null as File | null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        const url = isEdit ? `/admin/journal/${post!.id}` : "/admin/journal";
        submitPost(url, {
            forceFormData: true,
            ...(isEdit && { method: "put" as any }),
        });
    }

    return (
        <>
            <Head title={isEdit ? "Edit Post" : "New Post"} />
            <div className="mx-auto max-w-2xl px-4 py-10">
                <h1 className="mb-6 text-xl font-semibold">
                    {isEdit ? "Edit" : "New"} Journal Post
                </h1>
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Title
                        </label>
                        <input
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                            className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                        />
                        {errors.title && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.title}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Slug
                        </label>
                        <input
                            value={data.slug}
                            onChange={(e) => setData("slug", e.target.value)}
                            className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                        />
                        {errors.slug && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.slug}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Excerpt
                        </label>
                        <textarea
                            value={data.excerpt}
                            onChange={(e) => setData("excerpt", e.target.value)}
                            rows={2}
                            className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Content
                        </label>
                        <RichTextEditor
                            content={data.content}
                            onChange={(html) => setData("content", html)}
                        />
                        {errors.content && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.content}
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Cover Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData(
                                    "cover_image",
                                    e.target.files?.[0] ?? null,
                                )
                            }
                            className="block text-sm"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Status
                        </label>
                        <select
                            value={data.status}
                            onChange={(e) => setData("status", e.target.value)}
                            className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                        >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-sm bg-[#7C3AED] px-6 py-2 text-sm text-white disabled:opacity-50"
                    >
                        {isEdit ? "Save Changes" : "Create Post"}
                    </button>
                </form>
            </div>
        </>
    );
}
