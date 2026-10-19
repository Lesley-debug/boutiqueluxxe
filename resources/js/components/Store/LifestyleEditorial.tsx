import { Link } from "@inertiajs/react";
import { ArrowRight } from "lucide-react";
interface StoryContent {
  story_title: string | null;
  story_text: string | null;
  story_cta_text: string | null;
  story_image_url: string | null;
}
export default function LifestyleEditorial({
  content,
}: {
  content: StoryContent;
}) {
  const suppliedImage = !content.story_image_url;
  return (
    <section className="bg-[#F8F5EF] px-6 py-10 lg:py-16">
      <div className="mx-auto grid max-w-5xl items-center gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-16">
        <div className="flex min-w-0 justify-center rounded-2xl bg-[#E8E1D7] p-5 lg:p-7">
          <img
            src={
              content.story_image_url ||
              "/images/editorial/boutique-luxxe-lifestyle.webp"
            }
            width={suppliedImage ? 335 : undefined}
            height={suppliedImage ? 597 : undefined}
            alt={
              suppliedImage
                ? "Person carrying a patterned tote bag"
                : "Boutique Luxxe editorial photograph"
            }
            loading="lazy"
            decoding="async"
            className="h-auto max-h-[540px] w-auto max-w-full rounded-lg object-contain"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#805E2D]">
            The everyday edit
          </p>
          <h2 className="mt-4 break-words font-serif text-3xl font-medium leading-tight text-[#181512] lg:text-5xl">
            {content.story_title || "Carried your way."}
          </h2>
          {content.story_text && (
            <p className="mt-5 whitespace-pre-line break-words text-sm leading-7 text-[#514C46] lg:text-base">
              {content.story_text}
            </p>
          )}
          <Link
            href="/about"
            className="mt-7 inline-flex min-h-11 items-center gap-3 border-b border-[#805E2D] py-2 text-xs font-semibold uppercase tracking-[.15em] text-[#181512]"
          >
            {content.story_cta_text || "Discover our story"}
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/shop"
            className="mt-4 flex min-h-11 w-fit items-center py-2 text-sm text-[#514C46] underline underline-offset-4"
          >
            Explore the collection
          </Link>
        </div>
      </div>
    </section>
  );
}
