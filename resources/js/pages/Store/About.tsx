import { Head, Link } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";
import { ArrowRight } from "lucide-react";
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
export default function About({ aboutPage }: { aboutPage: AboutPageData }) {
  return (
    <StoreLayout noPadding showMobileHeader>
      <Head title="Our Story" />
      <section className="border-b border-[#181512]/10 bg-[#F4EFE7] px-6 py-10 lg:py-16">
        <div
          className={`mx-auto grid max-w-6xl items-center gap-8 ${aboutPage.hero_image_url ? "lg:grid-cols-[1.1fr_.9fr] lg:gap-14" : ""}`}
        >
          <div className="min-w-0 max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#805E2D]">
              Our story
            </p>
            <h1 className="mt-4 break-words font-serif text-4xl font-medium leading-[1.08] tracking-tight text-[#181512] lg:text-6xl">
              {aboutPage.hero_title || "About Boutique Luxxe"}
            </h1>
            {aboutPage.hero_subtitle && (
              <p className="mt-6 whitespace-pre-line break-words text-base leading-8 text-[#514C46]">
                {aboutPage.hero_subtitle}
              </p>
            )}
            <Link
              href="/shop"
              className="mt-7 inline-flex min-h-11 items-center gap-3 rounded-full bg-[#181512] px-6 py-3 text-xs font-semibold uppercase tracking-[.15em] text-white"
            >
              Explore the collection
              <ArrowRight size={16} />
            </Link>
          </div>
          {aboutPage.hero_image_url && (
            <div className="flex min-w-0 items-center justify-center rounded-2xl bg-[#E8E1D7] p-6">
              <img
                src={aboutPage.hero_image_url}
                alt="Boutique Luxxe story photograph"
                decoding="async"
                className="h-auto max-h-[440px] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
          )}
        </div>
      </section>
      {(aboutPage.philosophy_text || aboutPage.approach_text) && (
        <section className="bg-white px-6 py-12 lg:py-16">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2 lg:gap-16">
            {aboutPage.philosophy_text && (
              <article className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#805E2D]">
                  01
                </p>
                <h2 className="mt-3 break-words font-serif text-3xl text-[#181512]">
                  {aboutPage.philosophy_title}
                </h2>
                <p className="mt-5 whitespace-pre-line break-words text-base leading-8 text-[#514C46]">
                  {aboutPage.philosophy_text}
                </p>
              </article>
            )}
            {aboutPage.approach_text && (
              <article className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#805E2D]">
                  02
                </p>
                <h2 className="mt-3 break-words font-serif text-3xl text-[#181512]">
                  {aboutPage.approach_title}
                </h2>
                <p className="mt-5 whitespace-pre-line break-words text-base leading-8 text-[#514C46]">
                  {aboutPage.approach_text}
                </p>
              </article>
            )}
          </div>
        </section>
      )}
      <section className="bg-[#F8F5EF] px-6 py-12 lg:py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 border-t border-[#181512]/15 pt-8 lg:flex-row lg:items-center">
          <div className="min-w-0 max-w-2xl">
            <h2 className="break-words font-serif text-3xl text-[#181512]">
              {aboutPage.contact_title}
            </h2>
            {aboutPage.contact_text && (
              <p className="mt-4 whitespace-pre-line break-words text-base leading-7 text-[#514C46]">
                {aboutPage.contact_text}
              </p>
            )}
          </div>
          <Link
            href="/contact"
            className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-full border border-[#181512]/25 px-6 py-3 text-xs font-semibold uppercase tracking-[.15em] text-[#181512]"
          >
            Contact us
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </StoreLayout>
  );
}
