import { Head, Link, router } from "@inertiajs/react";

interface PostRow {
    id: number;
    title: string;
    status: string;
    published_at: string | null;
}

export default function Index({ posts }: { posts: PostRow[] }) {
    function destroy(id: number) {
        if (confirm("Delete this post?")) {
            router.delete(`/admin/journal/${id}`);
        }
    }

    return (
        <>
            <Head title="Admin — Journal" />
            <div className="mx-auto max-w-3xl px-4 py-10">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Journal Posts</h1>
                    <Link
                        href="/admin/journal/create"
                        className="rounded-sm bg-[#7C3AED] px-4 py-2 text-sm text-white"
                    >
                        New Post
                    </Link>
                </div>
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                            <th className="py-2">Title</th>
                            <th>Status</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts.map((p) => (
                            <tr key={p.id} className="border-b border-gray-100">
                                <td className="py-2">{p.title}</td>
                                <td>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs ${p.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}
                                    >
                                        {p.status}
                                    </span>
                                </td>
                                <td className="space-x-3 text-right">
                                    <Link
                                        href={`/admin/journal/${p.id}/edit`}
                                        className="text-gray-600 underline"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => destroy(p.id)}
                                        className="text-red-600 underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {posts.length === 0 && (
                    <p className="py-10 text-center text-gray-400">
                        No posts yet.
                    </p>
                )}
            </div>
        </>
    );
}
