import { Head, Link } from "@inertiajs/react";
import { Quote, Star } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";

interface Testimonial { id: number; customer_name: string; quote: string; rating: number; }

export default function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
    return (
        <StoreLayout showMobileHeader>
            <Head title="Client Stories"><meta name="description" content="Read verified client experiences with Boutique Luxxe." /></Head>
            <section className="border-b border-[#181512]/10 bg-[#181512] px-5 py-16 text-white sm:py-24">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#D9BB82]">Client stories</p>
                    <h1 className="mt-4 font-serif text-4xl font-medium sm:text-6xl">A personal standard of service</h1>
                    <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/60">Experiences shared by Boutique Luxxe clients and published by our team.</p>
                </div>
            </section>
            <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-18">
                {testimonials.length === 0 ? (
                    <div className="rounded-2xl border border-[#181512]/10 bg-white p-10 text-center">
                        <Quote className="mx-auto h-7 w-7 text-[#9B7435]" />
                        <h2 className="mt-4 font-serif text-2xl text-[#181512]">Client stories are coming soon</h2>
                        <p className="mt-2 text-sm text-[#6F6961]">New testimonials published from the admin dashboard will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {testimonials.map((item) => (
                            <article key={item.id} className="flex min-h-64 flex-col rounded-2xl border border-[#181512]/10 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,.04)]">
                                <Quote className="h-6 w-6 text-[#9B7435]" />
                                <div className="mt-5 flex gap-1" aria-label={`${item.rating} out of 5 stars`}>
                                    {[1,2,3,4,5].map((star) => <Star key={star} className={`h-4 w-4 ${star <= item.rating ? "fill-[#9B7435] text-[#9B7435]" : "text-[#D8D2C9]"}`} />)}
                                </div>
                                <blockquote className="mt-5 flex-1 text-[15px] leading-7 text-[#514C46]">“{item.quote}”</blockquote>
                                <p className="mt-6 border-t border-[#181512]/8 pt-4 text-sm font-semibold text-[#181512]">{item.customer_name}</p>
                            </article>
                        ))}
                    </div>
                )}
                <div className="mt-12 text-center"><Link href="/contact" className="inline-flex min-h-12 items-center rounded-xl bg-[#181512] px-6 text-sm font-semibold text-white transition hover:bg-[#9B7435]">Speak with our concierge</Link></div>
            </section>
        </StoreLayout>
    );
}
