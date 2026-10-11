import { Link } from "@inertiajs/react";
interface CampaignContent {
  editorial_title: string | null;
  editorial_subtitle: string | null;
  editorial_cta_text: string | null;
  editorial_cta_url: string | null;
  editorial_image_url: string | null;
  editorial_video_url: string | null;
}
export default function EditorialCampaign({
  content,
}: {
  content: CampaignContent;
}) {
  if (!content.editorial_image_url && !content.editorial_video_url) return null;
  return (
    <section className="bg-white px-6 py-10 lg:py-16">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#805E2D]">
            Editorial
          </p>
          {content.editorial_title && (
            <h2 className="mt-4 break-words font-serif text-3xl font-medium leading-tight text-[#181512] lg:text-5xl">
              {content.editorial_title}
            </h2>
          )}
          {content.editorial_subtitle && (
            <p className="mt-5 whitespace-pre-line break-words text-sm leading-7 text-[#514C46] lg:text-base">
              {content.editorial_subtitle}
            </p>
          )}
          {content.editorial_cta_text && (
            <Link
              href={content.editorial_cta_url || "/shop"}
              className="mt-7 inline-flex min-h-11 items-center rounded-full bg-[#181512] px-6 py-3 text-xs font-semibold uppercase tracking-[.15em] text-white"
            >
              {content.editorial_cta_text}
            </Link>
          )}
        </div>
        <div className="flex min-w-0 items-center justify-center rounded-2xl bg-[#F4EFE7] p-5 lg:p-8">
          {content.editorial_video_url ? (
            <video
              controls
              muted
              playsInline
              preload="metadata"
              poster={content.editorial_image_url || undefined}
              className="h-auto max-h-[420px] w-auto max-w-full object-contain"
            >
              <source src={content.editorial_video_url} />
            </video>
          ) : (
            <img
              src={content.editorial_image_url!}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-auto max-h-[420px] w-auto max-w-full object-contain"
            />
          )}
        </div>
      </div>
    </section>
  );
}
