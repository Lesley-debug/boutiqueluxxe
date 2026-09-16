import AdminLayout from "@/components/admin/AdminLayout";
import { useForm } from "@inertiajs/react";
import { FormEvent } from "react";

interface ContentData {
    editorial_title: string | null;
    editorial_subtitle: string | null;
    editorial_cta_text: string | null;
    editorial_cta_url: string | null;
    editorial_image_url: string | null;
    watches_title: string | null;
    watches_subtitle: string | null;
    watches_cta_text: string | null;
    watches_cta_url: string | null;
    watches_image_url: string | null;
    story_title: string | null;
    story_text: string | null;
    story_cta_text: string | null;
    story_image_url: string | null;
}

export default function Edit({ content }: { content: ContentData }) {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        _method: 'PUT',
        editorial_title: content.editorial_title ?? "",
        editorial_subtitle: content.editorial_subtitle ?? "",
        editorial_cta_text: content.editorial_cta_text ?? "",
        editorial_cta_url: content.editorial_cta_url ?? "",
        editorial_image: null as File | null,
        watches_title: content.watches_title ?? "",
        watches_subtitle: content.watches_subtitle ?? "",
        watches_cta_text: content.watches_cta_text ?? "",
        watches_cta_url: content.watches_cta_url ?? "",
        watches_image: null as File | null,
        story_title: content.story_title ?? "",
        story_text: content.story_text ?? "",
        story_cta_text: content.story_cta_text ?? "",
        story_image: null as File | null,
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/admin/homepage", { 
            forceFormData: true,
            preserveScroll: true,
        });
    }

    return (
        <AdminLayout title="Homepage">
            <div className="mx-auto max-w-2xl">
                <p className="mb-6 text-sm text-gray-500">
                    Each section only appears on the homepage once it has an
                    image uploaded.
                </p>

                <form onSubmit={submit} className="space-y-8">
                    <Block
                        title="Editorial Campaign"
                        imageUrl={content.editorial_image_url}
                    >
                        <Field
                            label="Title"
                            value={data.editorial_title}
                            onChange={(v) => setData("editorial_title", v)}
                        />
                        <Field
                            label="Subtitle"
                            value={data.editorial_subtitle}
                            onChange={(v) => setData("editorial_subtitle", v)}
                            textarea
                        />
                        <Field
                            label="Button Text"
                            value={data.editorial_cta_text}
                            onChange={(v) => setData("editorial_cta_text", v)}
                        />
                        <Field
                            label="Button Link (e.g. /shop)"
                            value={data.editorial_cta_url}
                            onChange={(v) => setData("editorial_cta_url", v)}
                        />
                        <FileField
                            onChange={(f) => setData("editorial_image", f)}
                        />
                    </Block>

                    <Block
                        title="Watches Campaign"
                        imageUrl={content.watches_image_url}
                    >
                        <Field
                            label="Title"
                            value={data.watches_title}
                            onChange={(v) => setData("watches_title", v)}
                        />
                        <Field
                            label="Subtitle"
                            value={data.watches_subtitle}
                            onChange={(v) => setData("watches_subtitle", v)}
                            textarea
                        />
                        <Field
                            label="Button Text"
                            value={data.watches_cta_text}
                            onChange={(v) => setData("watches_cta_text", v)}
                        />
                        <Field
                            label="Button Link"
                            value={data.watches_cta_url}
                            onChange={(v) => setData("watches_cta_url", v)}
                        />
                        <FileField
                            onChange={(f) => setData("watches_image", f)}
                        />
                    </Block>

                    <Block
                        title="Brand Story"
                        imageUrl={content.story_image_url}
                    >
                        <Field
                            label="Title"
                            value={data.story_title}
                            onChange={(v) => setData("story_title", v)}
                        />
                        <Field
                            label="Text"
                            value={data.story_text}
                            onChange={(v) => setData("story_text", v)}
                            textarea
                        />
                        <Field
                            label="Button Text"
                            value={data.story_cta_text}
                            onChange={(v) => setData("story_cta_text", v)}
                        />
                        <FileField
                            onChange={(f) => setData("story_image", f)}
                        />
                    </Block>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-full bg-[#171310] px-8 py-3 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {processing ? "Saving..." : "Save Homepage"}
                    </button>

                    {recentlySuccessful && (
                        <p className="text-sm text-green-600">
                            ✓ Homepage content saved successfully!
                        </p>
                    )}

                    {Object.keys(errors).length > 0 && (
                        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
                            <p className="font-semibold mb-2">
                                Please fix the following errors:
                            </p>
                            <ul className="list-disc list-inside space-y-1">
                                {Object.entries(errors).map(([key, message]) => (
                                    <li key={key}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </form>
            </div>
        </AdminLayout>
    );
}

function Block({
    title,
    imageUrl,
    children,
}: {
    title: string;
    imageUrl: string | null;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 p-5">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-[#B89B6A]">
                    {title}
                </h2>
                {!imageUrl && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                        Hidden — no image
                    </span>
                )}
            </div>
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt=""
                    className="mb-3 h-32 w-full rounded-lg object-cover"
                />
            )}
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    textarea,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    textarea?: boolean;
}) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium">{label}</label>
            {textarea ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={3}
                    className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                />
            ) : (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                />
            )}
        </div>
    );
}

function FileField({ onChange }: { onChange: (f: File | null) => void }) {
    return (
        <div>
            <label className="mb-1 block text-sm font-medium">Image</label>
            <input
                type="file"
                accept="image/*"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
                className="block text-sm"
            />
        </div>
    );
}
