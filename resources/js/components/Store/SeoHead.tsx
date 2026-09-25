import { Head, usePage } from "@inertiajs/react";

interface SeoMetadata {
    title: string;
    description: string;
    canonical: string;
    image?: string | null;
    robots: string;
    type?: string;
    schema?: Record<string, unknown>[];
}

export default function SeoHead() {
    const { seo } = usePage().props as unknown as { seo?: SeoMetadata };

    if (!seo) return null;

    const keyed = (key: string) => ({ "head-key": key });

    return (
        <Head title={seo.title}>
            <meta {...keyed("description")} name="description" content={seo.description} />
            <meta {...keyed("robots")} name="robots" content={seo.robots} />
            <link {...keyed("canonical")} rel="canonical" href={seo.canonical} />
            <meta {...keyed("og:type")} property="og:type" content={seo.type ?? "website"} />
            <meta {...keyed("og:title")} property="og:title" content={seo.title} />
            <meta {...keyed("og:description")} property="og:description" content={seo.description} />
            <meta {...keyed("og:url")} property="og:url" content={seo.canonical} />
            {seo.image && <meta {...keyed("og:image")} property="og:image" content={seo.image} />}
            <meta {...keyed("twitter:card")} name="twitter:card" content={seo.image ? "summary_large_image" : "summary"} />
            <meta {...keyed("twitter:title")} name="twitter:title" content={seo.title} />
            <meta {...keyed("twitter:description")} name="twitter:description" content={seo.description} />
            {seo.image && <meta {...keyed("twitter:image")} name="twitter:image" content={seo.image} />}
            {seo.schema?.map((schema, index) => (
                <script
                    {...keyed(`structured-data-${index}`)}
                    key={`structured-data-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(schema).replace(/</g, "\u003c"),
                    }}
                />
            ))}
        </Head>
    );
}
