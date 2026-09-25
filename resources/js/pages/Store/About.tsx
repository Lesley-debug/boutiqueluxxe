import { Head, Link } from "@inertiajs/react";
import StoreLayout from "@/components/Store/StoreLayout";
import Reveal from "@/components/Store/Reveal";
import NewsletterSection from "@/components/Store/NewsletterSection";
import {
    Container,
    Eyebrow,
    PrimaryButton,
    SecondaryButton,
} from "@/components/Store/ui";
import {
    Award,
    Shield,
    Heart,
    Globe,
    Star,
    ArrowRight,
    Package,
    RefreshCw,
    Headphones,
    CheckCircle,
} from "lucide-react";

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

const VALUES = [
    {
        icon: Award,
        title: "Uncompromising Quality",
        text: "Every piece in our collection is carefully selected and reviewed using the product information available to our team.",
    },
    {
        icon: Shield,
        title: "Careful Product Review",
        text: "We review listing details, condition information, and available documentation before presenting a piece for sale.",
    },
    {
        icon: Heart,
        title: "Curated with Passion",
        text: "We are collectors ourselves. That obsession drives every acquisition decision — if we wouldn't carry it ourselves, we won't offer it to you.",
    },
    {
        icon: Globe,
        title: "Global Sourcing",
        text: "From Paris boutiques to Tokyo archives, our network spans the world's most prestigious fashion capitals and private collections.",
    },
];

const MILESTONES = [
    { year: "01", label: "Select", description: "We source distinctive pieces from trusted suppliers and established networks." },
    { year: "02", label: "Review", description: "Every listing is assessed for quality, condition, and the details clients need." },
    { year: "03", label: "Present", description: "We create a considered shopping experience with clear information and personal support." },
    { year: "04", label: "Deliver", description: "Orders are prepared carefully and coordinated for local or international delivery." },
];

const SERVICES = [
    { icon: Package, title: "White-glove Delivery", text: "Signature packaging and insured shipping on every order." },
    { icon: Shield, title: "Product Documentation", text: "Available product and condition details are shared clearly before purchase." },
    { icon: RefreshCw, title: "Easy Returns", text: "Clear guidance and personal support for eligible return requests." },
    { icon: Headphones, title: "Concierge Support", text: "Dedicated personal shoppers available 6 days a week." },
];

const STATS = [
    { value: "Curated", label: "Considered selection" },
    { value: "Personal", label: "Concierge support" },
    { value: "Secure", label: "Protected checkout" },
    { value: "Global", label: "International service" },
];

export default function About({ aboutPage }: { aboutPage: AboutPageData }) {
    const heroTitle = aboutPage.hero_title || "Where Luxury Meets Authenticity";
    const heroSubtitle =
        aboutPage.hero_subtitle ||
        "Boutique Luxxe offers curated luxury handbags, fine watches, and timeless accessories with considered selection and personal support.";
    const philosophyTitle = aboutPage.philosophy_title || "Our Philosophy";
    const philosophyText =
        aboutPage.philosophy_text ||
        "We believe luxury should be considered and personal. We review the details available for each piece and present clear information so clients can make informed choices.";
    const approachTitle = aboutPage.approach_title || "Our Approach";
    const approachText =
        aboutPage.approach_text ||
        "From the moment an item enters our hands to the moment it reaches yours, our process is meticulous. We verify provenance, check hardware, inspect stitching, and document every detail so you can buy with total confidence.";
    const contactTitle = aboutPage.contact_title || "Let's Connect";
    const contactText =
        aboutPage.contact_text ||
        "info@boutiqueluxxe.com";

    return (
        <StoreLayout showMobileHeader>
            <Head title="About Us" />

            {/* ── HERO ── */}
            <section className="relative overflow-hidden bg-[#171310]">
                {/* Decorative orbs */}
                <div className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-[#9C7A3C]/8 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-40 right-0 h-[500px] w-[500px] rounded-full bg-[#9C7A3C]/6 blur-3xl" />

                {/* Diagonal stripe texture */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage:
                            "repeating-linear-gradient(45deg, #9C7A3C 0, #9C7A3C 1px, transparent 0, transparent 50%)",
                        backgroundSize: "16px 16px",
                    }}
                />

                <Container className="relative py-32 lg:py-44">
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        {/* Left — copy */}
                        <div>
                            <Reveal>
                                <span className="inline-flex items-center gap-2 rounded-full border border-[#9C7A3C]/30 bg-[#9C7A3C]/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9C7A3C]">
                                    <Star className="h-3 w-3 fill-[#9C7A3C]" />
                                    Our Story
                                </span>
                            </Reveal>

                            <Reveal delay={80}>
                                <h1 className="mt-8 font-serif text-5xl font-medium leading-[1.05] tracking-tight text-white md:text-6xl lg:text-[4.5rem]">
                                    {heroTitle}
                                </h1>
                            </Reveal>

                            <Reveal delay={160}>
                                <p className="mt-7 text-lg leading-relaxed text-white/55">
                                    {heroSubtitle}
                                </p>
                            </Reveal>

                            <Reveal delay={240}>
                                <div className="mt-10 flex flex-wrap gap-4">
                                    <PrimaryButton href="/shop">
                                        Explore Collection
                                    </PrimaryButton>
                                    <SecondaryButton href="/journal" light>
                                        Read Our Journal
                                    </SecondaryButton>
                                </div>
                            </Reveal>

                            {/* Trust chips */}
                            <Reveal delay={320}>
                                <div className="mt-10 flex flex-wrap gap-3">
                                    {["Considered Selection", "Personal Service", "Global Delivery"].map(
                                        (chip) => (
                                            <span
                                                key={chip}
                                                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-white/60"
                                            >
                                                <CheckCircle className="h-3 w-3 text-[#9C7A3C]" />
                                                {chip}
                                            </span>
                                        ),
                                    )}
                                </div>
                            </Reveal>
                        </div>

                        {/* Right — stats grid */}
                        <Reveal delay={120}>
                            <div className="grid grid-cols-2 gap-4">
                                {STATS.map((stat, i) => (
                                    <div
                                        key={stat.label}
                                        className={`rounded-2xl border border-white/8 bg-white/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-[#9C7A3C]/30 hover:bg-white/8 ${
                                            i === 0 ? "col-span-2 sm:col-span-1" : ""
                                        }`}
                                    >
                                        <p className="font-serif text-4xl font-medium text-white">
                                            {stat.value}
                                        </p>
                                        <p className="mt-2 text-xs font-medium uppercase tracking-[0.15em] text-white/40">
                                            {stat.label}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </Container>
            </section>

            {/* ── STORY / PHILOSOPHY ── */}
            <section className="bg-[#F8F5EF] py-28">
                <Container>
                    <div className="grid items-center gap-16 lg:grid-cols-2">
                        {/* Visual block */}
                        <Reveal>
                            <div className="relative">
                                {/* Main card */}
                                <div className="relative overflow-hidden rounded-2xl bg-[#171310] px-10 py-14">
                                    {/* Corner ornament */}
                                    <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 opacity-10">
                                        <div className="absolute right-4 top-4 h-16 w-16 rounded-full border-2 border-[#9C7A3C]" />
                                        <div className="absolute right-0 top-0 h-10 w-10 rounded-full bg-[#9C7A3C]" />
                                    </div>

                                    <Eyebrow light>The Philosophy</Eyebrow>
                                    <blockquote className="mt-6 font-serif text-2xl font-medium leading-relaxed text-white md:text-3xl">
                                        "Luxury is not about price —<br />
                                        it's about the story behind every stitch."
                                    </blockquote>
                                    <p className="mt-6 text-sm text-white/40">
                                        — The Boutique Luxxe team
                                    </p>

                                    {/* Gold divider */}
                                    <div className="my-8 h-px w-12 bg-[#9C7A3C]" />

                                    <p className="text-sm leading-relaxed text-white/60">
                                        {philosophyText}
                                    </p>
                                </div>

                                {/* Floating badge */}
                                <div className="absolute -bottom-5 -right-5 hidden rounded-2xl border border-[#9C7A3C]/20 bg-white px-6 py-4 shadow-xl lg:block">
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#9C7A3C]">
                                        Personal service
                                    </p>
                                    <p className="mt-0.5 text-xs text-[#252525]/50">
                                        Local & international clients
                                    </p>
                                </div>
                            </div>
                        </Reveal>

                        {/* Text block */}
                        <div>
                            <Reveal>
                                <Eyebrow>Who We Are</Eyebrow>
                                <h2 className="mt-4 font-serif text-4xl font-medium leading-tight text-[#171310] md:text-5xl">
                                    {philosophyTitle}
                                </h2>
                                <div className="mt-6 h-px w-12 bg-[#9C7A3C]" />
                            </Reveal>

                            <Reveal delay={80}>
                                <p className="mt-8 text-base leading-relaxed text-[#252525]/65">
                                    {philosophyText}
                                </p>
                            </Reveal>

                            <Reveal delay={160}>
                                <p className="mt-4 text-base leading-relaxed text-[#252525]/65">
                                    {approachText}
                                </p>
                            </Reveal>

                            <Reveal delay={240}>
                                <div className="mt-10 space-y-4">
                                    {[
                                        "Every item reviewed before it is listed",
                                        "Clear product details and condition information",
                                        "Discreet packaging and insured delivery",
                                        "Personal styling consultation available",
                                    ].map((point) => (
                                        <div
                                            key={point}
                                            className="flex items-start gap-3"
                                        >
                                            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#9C7A3C]" />
                                            <p className="text-sm text-[#252525]/70">
                                                {point}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </Reveal>

                            <Reveal delay={320}>
                                <div className="mt-10">
                                    <Link
                                        href="/shop"
                                        className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.15em] text-[#171310] underline decoration-[#9C7A3C] decoration-2 underline-offset-8 transition hover:text-[#9C7A3C]"
                                    >
                                        Shop the Collection
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ── VALUES ── */}
            <section className="border-y border-[#171310]/8 bg-white py-28">
                <Container>
                    <Reveal>
                        <div className="mb-16 text-center">
                            <Eyebrow>What Drives Us</Eyebrow>
                            <h2 className="mt-4 font-serif text-4xl font-medium text-[#171310] md:text-5xl">
                                Our Core Values
                            </h2>
                            <div className="mx-auto mt-6 h-px w-12 bg-[#9C7A3C]" />
                        </div>
                    </Reveal>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {VALUES.map((v, i) => {
                            const Icon = v.icon;
                            return (
                                <Reveal key={v.title} delay={i * 70}>
                                    <div className="group relative overflow-hidden rounded-2xl border border-[#171310]/8 bg-[#F8F5EF] p-8 transition-all duration-500 hover:-translate-y-1 hover:border-[#9C7A3C]/20 hover:shadow-[0_20px_40px_-16px_rgba(23,19,16,0.12)]">
                                        {/* hover glow */}
                                        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#9C7A3C]/6 blur-2xl" />
                                        </div>

                                        <div className="relative">
                                            <div className="mb-5 inline-flex rounded-xl bg-[#9C7A3C]/10 p-3">
                                                <Icon className="h-5 w-5 text-[#9C7A3C]" />
                                            </div>
                                            <h3 className="font-serif text-lg font-medium text-[#171310]">
                                                {v.title}
                                            </h3>
                                            <p className="mt-3 text-sm leading-relaxed text-[#252525]/60">
                                                {v.text}
                                            </p>
                                        </div>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </Container>
            </section>

            {/* ── TIMELINE ── */}
            <section className="bg-[#F8F5EF] py-28">
                <Container>
                    <Reveal>
                        <div className="mb-20 text-center">
                            <Eyebrow>Our Journey</Eyebrow>
                            <h2 className="mt-4 font-serif text-4xl font-medium text-[#171310] md:text-5xl">
                                How We Got Here
                            </h2>
                            <div className="mx-auto mt-6 h-px w-12 bg-[#9C7A3C]" />
                        </div>
                    </Reveal>

                    <div className="relative mx-auto max-w-4xl">
                        {/* Vertical spine */}
                        <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-[#9C7A3C]/30 via-[#9C7A3C]/20 to-transparent lg:block" />

                        <div className="space-y-12">
                            {MILESTONES.map((m, i) => (
                                <Reveal key={m.year} delay={i * 100}>
                                    <div
                                        className={`flex items-center gap-8 ${
                                            i % 2 === 0
                                                ? "lg:flex-row"
                                                : "lg:flex-row-reverse"
                                        } flex-col lg:gap-16`}
                                    >
                                        {/* Content card */}
                                        <div className="flex-1">
                                            <div
                                                className={`rounded-2xl border border-[#171310]/8 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-md ${
                                                    i % 2 === 0
                                                        ? "lg:text-right"
                                                        : "lg:text-left"
                                                }`}
                                            >
                                                <p className="font-serif text-3xl font-medium text-[#9C7A3C]">
                                                    {m.year}
                                                </p>
                                                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#171310]/40">
                                                    {m.label}
                                                </p>
                                                <p className="mt-3 text-sm leading-relaxed text-[#252525]/65">
                                                    {m.description}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Center dot */}
                                        <div className="relative hidden shrink-0 lg:flex">
                                            <div className="h-5 w-5 rounded-full border-2 border-[#9C7A3C] bg-white shadow-[0_0_0_4px_#F8F5EF]" />
                                        </div>

                                        {/* Spacer on alternating side */}
                                        <div className="hidden flex-1 lg:block" />
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </Container>
            </section>

            {/* ── APPROACH / SERVICES ── */}
            <section className="bg-[#171310] py-28">
                <Container>
                    <Reveal>
                        <div className="mb-16 text-center">
                            <Eyebrow light>The Experience</Eyebrow>
                            <h2 className="mt-4 font-serif text-4xl font-medium text-white md:text-5xl">
                                {approachTitle}
                            </h2>
                            <div className="mx-auto mt-6 h-px w-12 bg-[#9C7A3C]" />
                            <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/50">
                                {approachText}
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {SERVICES.map((s, i) => {
                            const Icon = s.icon;
                            return (
                                <Reveal key={s.title} delay={i * 70}>
                                    <div className="group rounded-2xl border border-white/8 bg-white/5 p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-[#9C7A3C]/30 hover:bg-white/8">
                                        <div className="mx-auto mb-5 inline-flex rounded-xl bg-[#9C7A3C]/15 p-3.5">
                                            <Icon className="h-6 w-6 text-[#9C7A3C]" />
                                        </div>
                                        <h3 className="font-serif text-base font-medium text-white">
                                            {s.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-relaxed text-white/50">
                                            {s.text}
                                        </p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </Container>
            </section>

            {/* ── CONTACT / CTA ── */}
            <section className="bg-[#F8F5EF] py-28">
                <Container>
                    <div className="overflow-hidden rounded-3xl bg-[#171310]">
                        {/* Decorative top bar */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-[#9C7A3C]/20 via-[#9C7A3C] to-[#9C7A3C]/20" />

                        <div className="grid items-center gap-12 px-10 py-16 md:px-16 md:py-20 lg:grid-cols-5">
                            {/* Left — 3 cols */}
                            <div className="lg:col-span-3">
                                <Reveal>
                                    <Eyebrow light>Get in Touch</Eyebrow>
                                    <h2 className="mt-4 font-serif text-4xl font-medium leading-tight text-white md:text-5xl">
                                        {contactTitle}
                                    </h2>
                                    <div className="mt-6 h-px w-12 bg-[#9C7A3C]" />
                                </Reveal>

                                <Reveal delay={80}>
                                    <p className="mt-6 text-base leading-relaxed text-white/55">
                                        Have a question about a piece, need styling advice, or looking
                                        for something specific? Our team is here for you.
                                    </p>
                                </Reveal>

                                <Reveal delay={160}>
                                    <div className="mt-8 space-y-3">
                                        <p className="flex items-center gap-3 text-sm text-white/50">
                                            <span className="inline-block h-px w-6 bg-[#9C7A3C]" />
                                            {contactText}
                                        </p>
                                        <p className="flex items-center gap-3 text-sm text-white/50">
                                            <span className="inline-block h-px w-6 bg-[#9C7A3C]" />
                                            Responses within one business day
                                        </p>
                                    </div>
                                </Reveal>
                            </div>

                            {/* Right — 2 cols */}
                            <Reveal delay={100}>
                                <div className="flex flex-col gap-4 lg:col-span-2 lg:items-end">
                                    <PrimaryButton href="/shop">
                                        Shop Collection
                                    </PrimaryButton>
                                    <SecondaryButton href="/journal" light>
                                        Read Our Journal
                                    </SecondaryButton>
                                    <Link
                                        href="/shop?sort=newest"
                                        className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C] transition hover:gap-3"
                                    >
                                        New Arrivals
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            </Reveal>
                        </div>
                    </div>
                </Container>
            </section>

            {/* ── NEWSLETTER ── */}
            <NewsletterSection />
        </StoreLayout>
    );
}
