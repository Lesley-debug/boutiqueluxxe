import { Head, useForm } from "@inertiajs/react";
import { FormEvent } from "react";

interface AboutPageData {
    hero_title: string;
    hero_subtitle: string | null;
    hero_image_url: string | null;
    philosophy_title: string;
    philosophy_text: string | null;
    approach_title: string;
    approach_text: string | null;
    contact_title: string;
    contact_text: string | null;
}

export default function Edit({ aboutPage }: { aboutPage: AboutPageData }) {
    const { data, setData, post, processing, errors } = useForm({
        hero_title: aboutPage.hero_title,
        hero_subtitle: aboutPage.hero_subtitle ?? "",
        hero_image: null as File | null,
        philosophy_title: aboutPage.philosophy_title,
        philosophy_text: aboutPage.philosophy_text ?? "",
        approach_title: aboutPage.approach_title,
        approach_text: aboutPage.approach_text ?? "",
        contact_title: aboutPage.contact_title,
        contact_text: aboutPage.contact_text ?? "",
    });

    function submit(e: FormEvent) {
        e.preventDefault();
        post("/admin/about-page", {
            forceFormData: true,
            method: "put" as any,
        });
    }

    return (
        <>
            <Head title="Admin — About Page" />
            <div className="mx-auto max-w-2xl px-4 py-10">
                <h1 className="mb-2 text-xl font-semibold">Edit About Page</h1>
                <p className="mb-6 text-sm text-gray-500">
                    Changes here update the live <code>/about</code> page
                    immediately.
                </p>

                <form onSubmit={submit} className="space-y-8">
                    <div className="rounded-2xl border border-gray-200 p-5">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#7C3AED]">
                            Hero
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Title
                                </label>
                                <input
                                    value={data.hero_title}
                                    onChange={(e) =>
                                        setData("hero_title", e.target.value)
                                    }
                                    className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                                />
                                {errors.hero_title && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.hero_title}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Subtitle
                                </label>
                                <textarea
                                    value={data.hero_subtitle}
                                    onChange={(e) =>
                                        setData("hero_subtitle", e.target.value)
                                    }
                                    rows={3}
                                    className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">
                                    Hero Image
                                </label>
                                {aboutPage.hero_image_url && (
                                    <img
                                        src={aboutPage.hero_image_url}
                                        alt=""
                                        className="mb-2 h-32 w-full rounded-lg object-cover"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData(
                                            "hero_image",
                                            e.target.files?.[0] ?? null,
                                        )
                                    }
                                    className="block text-sm"
                                />
                                {errors.hero_image && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.hero_image}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-5">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#7C3AED]">
                            Philosophy
                        </h2>
                        <div className="space-y-3">
                            <input
                                value={data.philosophy_title}
                                onChange={(e) =>
                                    setData("philosophy_title", e.target.value)
                                }
                                className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Section title"
                            />
                            <textarea
                                value={data.philosophy_text}
                                onChange={(e) =>
                                    setData("philosophy_text", e.target.value)
                                }
                                rows={3}
                                className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Section text"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-5">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#7C3AED]">
                            Approach
                        </h2>
                        <div className="space-y-3">
                            <input
                                value={data.approach_title}
                                onChange={(e) =>
                                    setData("approach_title", e.target.value)
                                }
                                className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Section title"
                            />
                            <textarea
                                value={data.approach_text}
                                onChange={(e) =>
                                    setData("approach_text", e.target.value)
                                }
                                rows={3}
                                className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Section text"
                            />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 p-5">
                        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[#7C3AED]">
                            Contact Callout
                        </h2>
                        <div className="space-y-3">
                            <input
                                value={data.contact_title}
                                onChange={(e) =>
                                    setData("contact_title", e.target.value)
                                }
                                className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Section title"
                            />
                            <textarea
                                value={data.contact_text}
                                onChange={(e) =>
                                    setData("contact_text", e.target.value)
                                }
                                rows={2}
                                className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm"
                                placeholder="Section text"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded-full bg-[#7C3AED] px-8 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        Save About Page
                    </button>
                </form>
            </div>
        </>
    );
}
