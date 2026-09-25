import { Head } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";

interface PostProps { post: { title: string; content: string; cover_image_url: string | null; published_at: string; }; }

function sanitizeRichText(html: string): string {
    if (typeof window === "undefined") return "";
    const documentNode = new DOMParser().parseFromString(html, "text/html");
    const allowedTags = new Set(["P", "BR", "H2", "H3", "H4", "UL", "OL", "LI", "BLOCKQUOTE", "STRONG", "EM", "B", "I", "A", "CODE", "PRE"]);
    documentNode.body.querySelectorAll("*").forEach((element) => {
        if (!allowedTags.has(element.tagName)) {
            element.replaceWith(...Array.from(element.childNodes));
            return;
        }
        for (const attribute of Array.from(element.attributes)) {
            const keepHref = element.tagName === "A" && attribute.name === "href" && /^(https?:|mailto:|\/)/i.test(attribute.value);
            if (!keepHref) element.removeAttribute(attribute.name);
        }
        if (element.tagName === "A") {
            element.setAttribute("rel", "noopener noreferrer nofollow");
            element.setAttribute("target", "_blank");
        }
    });
    return documentNode.body.innerHTML;
}

export default function JournalPostPage({ post }: PostProps) {
    const safeContent = sanitizeRichText(post.content);
    return (
        <StoreLayout showMobileHeader>
            <Head title={post.title} />
            <article className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#9B7435]">{new Date(post.published_at).toLocaleDateString()}</p>
                <h1 className="mt-4 max-w-2xl font-serif text-4xl font-medium tracking-tight text-[#181512] sm:text-5xl">{post.title}</h1>
                {post.cover_image_url && <img src={post.cover_image_url} alt={`${post.title} cover`} width={1200} height={675} fetchPriority="high" decoding="async" className="mt-10 aspect-[16/9] w-full rounded-xl object-cover" />}
                <div className="prose prose-stone mt-10 max-w-none prose-headings:font-serif prose-a:text-[#9B7435]" dangerouslySetInnerHTML={{ __html: safeContent }} />
            </article>
        </StoreLayout>
    );
}
