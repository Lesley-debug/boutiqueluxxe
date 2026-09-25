import { FormEvent } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { CheckCircle, Mail, Send } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";

interface ContactForm { name: string; email: string; subject: string; message: string; website: string; }
const inputClass = "mt-2 w-full rounded-xl border border-[#181512]/12 bg-white px-4 py-3 text-sm text-[#181512] outline-none transition focus:border-[#9B7435] focus:ring-2 focus:ring-[#9B7435]/15";

export default function Contact({ submitted = false }: { submitted?: boolean }) {
    const { data, setData, post, processing, errors, reset } = useForm<ContactForm>({ name: "", email: "", subject: "", message: "", website: "" });
    function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); post("/contact", { preserveScroll: true, onSuccess: () => reset() }); }
    return (
        <StoreLayout showMobileHeader>
            <Head title="Contact" />
            <section className="border-b border-[#181512]/10 bg-white px-5 py-14 sm:py-20">
                <div className="mx-auto max-w-5xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#9B7435]">Boutique concierge</p>
                    <h1 className="mt-3 max-w-2xl font-serif text-4xl font-medium text-[#181512] sm:text-5xl">How can we help?</h1>
                    <p className="mt-5 max-w-xl text-base leading-7 text-[#6F6961]">Questions about a piece, an existing order, or international delivery are welcome.</p>
                </div>
            </section>
            <section className="mx-auto grid max-w-5xl gap-8 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.75fr_1.25fr]">
                <aside className="rounded-xl bg-[#181512] p-6 text-white sm:p-8">
                    <Mail className="h-6 w-6 text-[#D9BB82]" />
                    <h2 className="mt-5 font-serif text-2xl">Contact details</h2>
                    <a href="mailto:info@boutiqueluxxe.com" className="mt-5 block break-all text-sm font-medium text-[#D9BB82]">info@boutiqueluxxe.com</a>
                    <p className="mt-3 text-sm leading-6 text-white/60">We aim to respond within one business day.</p>
                    <Link href="/faqs" className="mt-8 inline-flex min-h-11 items-center rounded-lg border border-white/20 px-4 text-sm font-medium text-white transition hover:bg-white/10">Read our FAQs</Link>
                </aside>
                <div className="rounded-xl border border-[#181512]/10 bg-[#FAF8F4] p-5 sm:p-8">
                    {submitted && <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-700/15 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0" /><span>Your message has been sent. We will reply as soon as possible.</span></div>}
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <label className="text-sm font-medium text-[#514C46]">Name<input value={data.name} onChange={(e) => setData("name", e.target.value)} autoComplete="name" className={inputClass} />{errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name}</span>}</label>
                            <label className="text-sm font-medium text-[#514C46]">Email<input type="email" value={data.email} onChange={(e) => setData("email", e.target.value)} autoComplete="email" className={inputClass} />{errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}</label>
                        </div>
                        <label className="block text-sm font-medium text-[#514C46]">Subject<input value={data.subject} onChange={(e) => setData("subject", e.target.value)} className={inputClass} />{errors.subject && <span className="mt-1 block text-xs text-red-600">{errors.subject}</span>}</label>
                        <label className="block text-sm font-medium text-[#514C46]">Message<textarea rows={6} value={data.message} onChange={(e) => setData("message", e.target.value)} className={inputClass} />{errors.message && <span className="mt-1 block text-xs text-red-600">{errors.message}</span>}</label>
                        <div className="hidden" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" value={data.website} onChange={(e) => setData("website", e.target.value)} /></label></div>
                        <button type="submit" disabled={processing} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#181512] px-6 text-sm font-semibold text-white transition hover:bg-[#9B7435] disabled:opacity-50 sm:w-auto">{processing ? "Sending…" : "Send message"}<Send className="h-4 w-4" /></button>
                    </form>
                </div>
            </section>
        </StoreLayout>
    );
}
