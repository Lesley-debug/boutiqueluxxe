import { useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, Input, Textarea, Button } from "@/components/admin/ui";

interface SlideData {
    id: number;
    eyebrow: string | null;
    title: string;
    subtitle: string | null;
    primary_cta_text: string | null;
    primary_cta_url: string | null;
    secondary_cta_text: string | null;
    secondary_cta_url: string | null;
    active: boolean;
    sort_order: number;
}

export default function Form({ slide }: { slide?: SlideData }) {
    const isEdit = !!slide;
    const { data, setData, post, processing, errors } = useForm({
        eyebrow: slide?.eyebrow ?? "",
        title: slide?.title ?? "",
        subtitle: slide?.subtitle ?? "",
        primary_cta_text: slide?.primary_cta_text ?? "",
        primary_cta_url: slide?.primary_cta_url ?? "",
        secondary_cta_text: slide?.secondary_cta_text ?? "",
        secondary_cta_url: slide?.secondary_cta_url ?? "",
        active: slide?.active ?? true,
        sort_order: slide?.sort_order ?? 0,
        image: null as File | null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        const url = isEdit
            ? `/admin/hero-slides/${slide!.id}`
            : "/admin/hero-slides";
        post(url, {
            forceFormData: true,
            ...(isEdit && { method: "put" as any }),
        });
    }

    return (
        <AdminLayout title={isEdit ? "Edit Slide" : "New Slide"}>
            <Card className="max-w-xl">
                <form onSubmit={submit} className="space-y-4">
                    <Input
                        label="Eyebrow (small text above title)"
                        value={data.eyebrow}
                        onChange={(e) => setData("eyebrow", e.target.value)}
                    />
                    <Input
                        label="Title"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        error={errors.title}
                    />
                    <Textarea
                        label="Subtitle"
                        rows={3}
                        value={data.subtitle}
                        onChange={(e) => setData("subtitle", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Primary Button Text"
                            value={data.primary_cta_text}
                            onChange={(e) =>
                                setData("primary_cta_text", e.target.value)
                            }
                        />
                        <Input
                            label="Primary Button Link"
                            value={data.primary_cta_url}
                            onChange={(e) =>
                                setData("primary_cta_url", e.target.value)
                            }
                            placeholder="/shop"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Secondary Button Text"
                            value={data.secondary_cta_text}
                            onChange={(e) =>
                                setData("secondary_cta_text", e.target.value)
                            }
                        />
                        <Input
                            label="Secondary Button Link"
                            value={data.secondary_cta_url}
                            onChange={(e) =>
                                setData("secondary_cta_url", e.target.value)
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-stone-700">
                            Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setData("image", e.target.files?.[0] ?? null)
                            }
                            className="block text-sm"
                        />
                        {errors.image && (
                            <p className="mt-1 text-xs text-red-600">
                                {errors.image}
                            </p>
                        )}
                    </div>
                    <Input
                        type="number"
                        label="Sort Order"
                        value={String(data.sort_order)}
                        onChange={(e) =>
                            setData("sort_order", Number(e.target.value))
                        }
                    />
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={data.active}
                            onChange={(e) =>
                                setData("active", e.target.checked)
                            }
                        />
                        Active
                    </label>
                    <Button type="submit" disabled={processing}>
                        {isEdit ? "Save Changes" : "Create Slide"}
                    </Button>
                </form>
            </Card>
        </AdminLayout>
    );
}
