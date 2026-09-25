import { Link } from "@inertiajs/react";
import { ArrowUpRight, Mail } from "lucide-react";

const groups = [
    { title: "Shop", links: [["All products", "/shop"], ["New arrivals", "/shop?sort=newest"], ["Collections", "/collections"]] },
    { title: "Discover", links: [["Our story", "/about"], ["Journal", "/journal"], ["Testimonials", "/testimonials"], ["My orders", "/account/orders"]] },
    { title: "Support", links: [["Contact us", "/contact"], ["Frequently asked questions", "/faqs"]] },
    { title: "Legal", links: [["Privacy policy", "/privacy-policy"], ["Terms of service", "/terms-of-service"], ["Cookie policy", "/cookie-policy"]] },
] as const;

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
