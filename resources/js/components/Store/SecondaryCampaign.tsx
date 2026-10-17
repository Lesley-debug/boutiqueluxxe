import { Link } from "@inertiajs/react";

interface SecondaryCampaignContent {
  watches_title: string | null;
  watches_subtitle: string | null;
  watches_cta_text: string | null;
  watches_cta_url: string | null;
  watches_image_url: string | null;
  watches_video_url: string | null;
}

export default function SecondaryCampaign({
  content,
}: {
  content: SecondaryCampaignContent;
}) {
  if (!content.watches_image_url && !content.watches_video_url) return null;

  const title = content.watches_title || "Discover the collection";
  const suppliedLink = content.watches_cta_url || "";
  const href = /^\/(?!\/)[^\s\\]*$/.test(suppliedLink) ? suppliedLink : "/shop";

  return (
    <section
      aria-label={title}
      className="hidden bg-white px-6 py-12 lg:block lg:py-16"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-2 items-center gap-14">
        <div className="flex min-h-[320px] min-w-0 items-center justify-center overflow-hidden rounded-2xl bg-[#F4EFE7] p-8">
          {content.watches_video_url ? (
            <video
              aria-label={`${title} — campaign video`}
              controls
              muted
              playsInline
              preload="metadata"
              poster={content.watches_image_url || undefined}
              className="h-auto max-h-[440px] w-auto max-w-full rounded-lg object-contain"
            >
              <source src={content.watches_video_url} />
              Your browser does not support this video.
            </video>
          ) : (
            <img
              src={content.watches_image_url!}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-auto max-h-[440px] w-auto max-w-full rounded-lg object-contain"
            />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#805E2D]">
            In focus
          </p>
          <h2 className="mt-4 break-words font-serif text-4xl font-medium leading-tight text-[#181512] xl:text-5xl">
            {title}
          </h2>
          {content.watches_subtitle && (
            <p className="mt-5 whitespace-pre-line break-words text-base leading-7 text-[#514C46]">
              {content.watches_subtitle}
            </p>
          )}
          {content.watches_cta_text && (
            <Link
              href={href}
              className="mt-7 inline-flex min-h-11 max-w-full items-center justify-center gap-3 rounded-full bg-[#181512] px-6 py-3 text-center text-xs font-semibold uppercase tracking-[.15em] text-white transition-colors hover:bg-[#805E2D] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#805E2D]"
            >
              <span className="min-w-0 break-words">{content.watches_cta_text}</span>
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
