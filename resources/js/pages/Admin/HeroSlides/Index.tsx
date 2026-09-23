import { Link, router } from "@inertiajs/react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Table, Badge, Button, PageActions } from "@/components/admin/ui";

interface SlideRow {
    id: number;
    title: string;
    active: boolean;
    sort_order: number;
}

export default function Index({ slides }: { slides: SlideRow[] }) {
    function destroy(id: number) {
        if (confirm("Delete this slide?"))
            router.delete(`/admin/hero-slides/${id}`);
    }

    return (
        <AdminLayout title="Hero Slides">
            <PageActions>
                <p className="text-sm text-stone-500">
                    These rotate on the homepage every 6 seconds.
                </p>
                <Link href="/admin/hero-slides/create">
                    <Button>New Slide</Button>
                </Link>
            </PageActions>

            <Table head={["Title", "Order", "Status", ""]}>
                {slides.map((s) => (
                    <tr key={s.id} className="hover:bg-stone-50">
                        <td className="px-4 py-3">{s.title}</td>
                        <td className="px-4 py-3">{s.sort_order}</td>
                        <td className="px-4 py-3">
                            <Badge tone={s.active ? "success" : "neutral"}>
                                {s.active ? "Active" : "Inactive"}
                            </Badge>
                        </td>
                        <td className="space-x-3 px-4 py-3 text-right">
                            <Link
                                href={`/admin/hero-slides/${s.id}/edit`}
                                className="text-sm underline"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => destroy(s.id)}
                                className="text-sm text-red-600 underline"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </Table>
        </AdminLayout>
    );
}
