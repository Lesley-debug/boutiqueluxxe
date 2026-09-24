import { Head, Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import StoreLayout from "./StoreLayout";

export interface LegalSection { title: string; paragraphs: string[]; }

export default function LegalPage({ title, updated, intro, sections }: { title: string; updated: string; intro: string; sections: LegalSection[] }) {
    return (
        <StoreLayout showMobileHeader>
            <Head title={title}>
                <meta name="description" content={`${title} for Boutique Luxxe customers.`} />
            </Head>
            <div className="border-b border-[#181512]/10 bg-white">
                <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
                    <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#6F6961] hover:text-[#181512]"><ArrowLeft className="h-4 w-4" /> Back to Boutique Luxxe</Link>
                    <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9B7435]">Legal</p>
                    <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-[#181512] sm:text-5xl">{title}</h1>
                    <p className="mt-4 text-sm text-[#6F6961]">Last updated: {updated}</p>
                    <p className="mt-8 max-w-2xl text-base leading-7 text-[#514C46]">{intro}</p>
                </div>
            </div>
            <article className="mx-auto max-w-3xl space-y-10 px-5 py-12 sm:px-8 sm:py-16">
                {sections.map((section) => (
                    <section key={section.title}>
                        <h2 className="font-serif text-2xl font-medium text-[#181512]">{section.title}</h2>
                        <div className="mt-4 space-y-4 text-[15px] leading-7 text-[#5F5952]">
                            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                        </div>
                    </section>
                ))}
                <div className="rounded-xl border border-[#9B7435]/20 bg-[#F3EADB] p-5 text-sm leading-6 text-[#514C46]">
                    Questions? Email <a className="font-semibold text-[#181512] underline underline-offset-4" href="mailto:concierge@boutiqueluxxe.com">concierge@boutiqueluxxe.com</a>.
                </div>
            </article>
        </StoreLayout>
    );
}
