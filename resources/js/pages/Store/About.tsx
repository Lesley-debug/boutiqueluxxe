import { Head } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";

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
        <StoreLayout>
            <Head title="About" />

            {aboutPage.hero_image_url ? (
                <div className="relative h-72 w-full overflow-hidden sm:h-[28rem]">
                    <img
                        src={aboutPage.hero_image_url}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-black/10 px-6 text-center">
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#B89B6A]">
                            Our Story
                        </p>
                        <h1 className="max-w-2xl text-3xl font-bold text-white sm:text-5xl">
                            {aboutPage.hero_title}
                        </h1>
                    </div>
                </div>
            ) : (
                <div className="bg-[#171310] px-6 py-24 text-center">
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#B89B6A]">
                        Our Story
                    </p>
                    <h1 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-5xl">
                        {aboutPage.hero_title}
                    </h1>
                </div>
            )}

            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
                {aboutPage.hero_subtitle && (
                    <p className="text-lg leading-relaxed text-[#252525]/70">
                        {aboutPage.hero_subtitle}
                    </p>
                )}

                <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2">
                    <div className="rounded-3xl bg-[#F8F5EF] p-8">
                        <h2 className="text-lg font-bold text-[#171310]">
                            {aboutPage.philosophy_title}
                        </h2>
                        {aboutPage.philosophy_text && (
                            <p className="mt-3 text-sm leading-relaxed text-[#252525]/70">
                                {aboutPage.philosophy_text}
                            </p>
                        )}
                    </div>
                    <div className="rounded-3xl bg-[#F8F5EF] p-8">
                        <h2 className="text-lg font-bold text-[#171310]">
                            {aboutPage.approach_title}
                        </h2>
                        {aboutPage.approach_text && (
                            <p className="mt-3 text-sm leading-relaxed text-[#252525]/70">
                                {aboutPage.approach_text}
                            </p>
                        )}
                    </div>
                </div>

                <div className="mt-16 rounded-3xl bg-[#171310] p-10 text-center text-white">
                    <h2 className="text-xl font-bold">
                        {aboutPage.contact_title}
                    </h2>
                    {aboutPage.contact_text && (
                        <p className="mt-2 text-sm text-[#B89B6A]">
                            {aboutPage.contact_text}
                        </p>
                    )}
                </div>
            </div>
        </StoreLayout>
    );
}
