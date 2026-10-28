import { FormEvent } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { CheckCircle, Mail, Send } from "lucide-react";
import StoreLayout from "@/components/Store/StoreLayout";

function TikTokIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
        </svg>
    );
}

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
                    <div className="mt-6 flex items-center gap-3">
                        <a href="https://www.tiktok.com/@boutique.luxxe" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:border-[#D9BB82] hover:text-[#D9BB82]">
                            <TikTokIcon />
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=61594929059568" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white/60 transition hover:border-[#D9BB82] hover:text-[#D9BB82]">
                            <FacebookIcon />
                        </a>
                    </div>
                    <Link href="/faqs" className="mt-6 inline-flex min-h-11 items-center rounded-lg border border-white/20 px-4 text-sm font-medium text-white transition hover:bg-white/10">Read our FAQs</Link>
                </aside>
                <div className="rounded-xl border border-[#181512]/10 bg-[#FAF8F4] p-5 sm:p-8">
                    {submitted && <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-700/15 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle className="mt-0.5 h-5 w-5 shrink-0" /><span>Your message has been received by our team. We will reply as soon as possible.</span></div>}
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
