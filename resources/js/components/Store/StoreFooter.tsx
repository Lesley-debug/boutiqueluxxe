import { Link } from "@inertiajs/react";
import { ArrowUpRight, Mail } from "lucide-react";

const groups = [
    { title: "Shop", links: [["All products", "/shop"], ["New arrivals", "/shop?sort=newest"], ["Collections", "/collections"]] },
    { title: "Discover", links: [["Our story", "/about"], ["Journal", "/journal"], ["Testimonials", "/testimonials"], ["My orders", "/account/orders"]] },
    { title: "Support", links: [["Contact us", "/contact"], ["Frequently asked questions", "/faqs"]] },
    { title: "Legal", links: [["Privacy policy", "/privacy-policy"], ["Terms of service", "/terms-of-service"], ["Cookie policy", "/cookie-policy"]] },
] as const;

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

export default function StoreFooter() {
    return (
        <footer className="border-t border-[#181512]/10 bg-[#181512] px-5 pb-28 pt-12 text-white lg:px-8 lg:pb-10 lg:pt-16">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-10 lg:grid-cols-[1.15fr_2fr] lg:gap-16">
                    <div className="max-w-sm">
                        <img src="/images/logo.png" alt="Boutique Luxxe" className="h-12 w-auto brightness-0 invert" />
                        <p className="mt-5 text-sm leading-6 text-white/60">Considered luxury pieces, selected with care and delivered with personal service.</p>
                        <a href="mailto:info@boutiqueluxxe.com" className="mt-6 inline-flex min-h-11 items-center gap-2 break-all text-sm font-medium text-[#D9BB82] transition hover:text-white">
                            <Mail className="h-4 w-4 shrink-0" /> info@boutiqueluxxe.com
                        </a>
                        <div className="mt-6 flex items-center gap-3">
                            <a href="https://www.tiktok.com/@boutique.luxxe" target="_blank" rel="noopener noreferrer" aria-label="Boutique Luxxe on TikTok" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-[#D9BB82] hover:text-[#D9BB82]">
                                <TikTokIcon />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=61594929059568" target="_blank" rel="noopener noreferrer" aria-label="Boutique Luxxe on Facebook" className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 transition hover:border-[#D9BB82] hover:text-[#D9BB82]">
                                <FacebookIcon />
                            </a>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                        {groups.map((group) => (
                            <div key={group.title} className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#D9BB82]">{group.title}</p>
                                <div className="mt-4 space-y-3">
                                    {group.links.map(([label, href]) => (
                                        <Link key={href} href={href} className="flex min-h-8 items-center text-sm leading-5 text-white/65 transition hover:text-white">{label}</Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} Boutique Luxxe. All rights reserved.</p>
                    <Link href="/contact" className="inline-flex min-h-8 items-center gap-1.5 transition hover:text-white">Concierge support <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                </div>
            </div>
        </footer>
    );
}
