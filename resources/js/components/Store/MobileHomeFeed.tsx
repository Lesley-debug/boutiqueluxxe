import { Link, router, usePage } from "@inertiajs/react";
import {
    Bell,
    Search,
    ShoppingBag,
    SlidersHorizontal,
    Heart,
    Plus,
    Menu,
    X,
    Home,
    LayoutGrid,
    Package,
    User,
    ChevronRight,
    Mail,
    Info,
    BookOpen,
    Star,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface Slide {
    id: number;
    eyebrow: string | null;
    title: string;
    subtitle: string | null;
    primary_cta_text: string | null;
    primary_cta_url: string | null;
    image_url: string | null;
}

interface ProductItem {
    id: number;
    name: string;
    slug: string;
    brand?: string | null;
    base_price: string;
    sale_price: string | null;
    new_arrival?: boolean;
    images: { url: string }[];
    is_wishlisted?: boolean;
}

interface CategoryCard {
    id: number;
    name: string;
    slug: string;
    image: string | null;
}

interface TestimonialItem {
    id: number;
    customer_name: string;
    quote: string;
    rating: number;
}

interface HomepageContent {
    editorial_title: string | null;
    editorial_subtitle: string | null;
    editorial_cta_text: string | null;
    editorial_cta_url: string | null;
    editorial_image_url: string | null;
    editorial_video_url: string | null;
    watches_title: string | null;
    watches_subtitle: string | null;
    watches_cta_text: string | null;
    watches_cta_url: string | null;
    watches_image_url: string | null;
    watches_video_url: string | null;
    story_title: string | null;
    story_text: string | null;
    story_cta_text: string | null;
    story_image_url: string | null;
}

interface MobileHomeFeedProps {
    heroSlides: Slide[];
    featuredProducts: ProductItem[];
    newArrivals: ProductItem[];
    categories: CategoryCard[];
    testimonials: TestimonialItem[];
    content: HomepageContent;
}

// ─── Hamburger Drawer ─────────────────────────────────────────────────────────

function HamburgerDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
    const { auth } = usePage().props;
    const navLinks = [
        { label: "Home", href: "/", icon: Home },
        { label: "Shop All", href: "/shop", icon: LayoutGrid },
        { label: "New Arrivals", href: "/shop?sort=newest", icon: Star },
        { label: "Collections", href: "/collections", icon: Package },
        { label: "Journal", href: "/journal", icon: BookOpen },
        { label: "About", href: "/about", icon: Info },
        { label: "Newsletter", href: "#newsletter", icon: Mail },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-50 bg-[#171310]/50 backdrop-blur-sm transition-opacity duration-300 ${
                    open ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                onClick={onClose}
            />
            {/* Drawer */}
            <div
                className={`fixed left-0 top-0 z-50 h-full w-[78%] max-w-[320px] bg-[#F8F5EF] shadow-2xl transition-transform duration-400 ease-out ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-[#171310]/10 px-5 py-5">
                        <img src="/images/logo.png" alt="Boutique Luxxe" className="h-8 w-auto" />
                        <button
                            onClick={onClose}
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
                        >
                            <X size={17} color="#171310" />
                        </button>
                    </div>

                    {/* User greeting */}
                    {auth.user && (
                        <div className="border-b border-[#171310]/10 px-5 py-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9C7A3C]">
                                Signed in as
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-[#171310]">
                                {auth.user.name}
                            </p>
                        </div>
                    )}

                    {/* Nav links */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={onClose}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-[#171310] transition active:bg-[#171310]/5"
                                >
                                    <Icon size={17} strokeWidth={1.8} className="text-[#9C7A3C]" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom auth links */}
                    <div className="border-t border-[#171310]/10 px-5 py-5">
                        {auth.user ? (
                            <div className="space-y-2">
                                <Link
                                    href="/account"
                                    onClick={onClose}
                                    className="flex w-full items-center gap-2 rounded-full bg-[#171310] px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white"
                                >
                                    <User size={14} />
                                    My Account
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Link
                                    href="/login"
                                    onClick={onClose}
                                    className="block w-full rounded-full bg-[#171310] px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-white"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={onClose}
                                    className="block w-full rounded-full border border-[#171310]/20 px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-[#171310]"
                                >
                                    Create Account
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

function HeroCard({ slides }: { slides: Slide[] }) {
    const [index, setIndex] = useState(0);
    if (slides.length === 0) return null;
    const slide = slides[index];

    return (
        <div className="mx-4 overflow-hidden rounded-2xl bg-[#171310]">
            <div className="relative flex min-h-[210px] items-end">
                {slide.image_url && (
                    <img
                        src={slide.image_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-[#171310]/90 via-[#171310]/55 to-transparent" />
                <div className="relative z-10 w-[64%] p-5">
                    {slide.eyebrow && (
                        <span className="inline-block rounded-full bg-[#9C7A3C] px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
                            {slide.eyebrow}
                        </span>
                    )}
                    <h2 className="mt-2 font-serif text-2xl font-medium leading-[1.1] tracking-tight text-white">
                        {slide.title}
                    </h2>
                    {slide.subtitle && (
                        <p className="mt-1.5 text-[11px] leading-relaxed text-white/70">
                            {slide.subtitle}
                        </p>
                    )}
                    {slide.primary_cta_text && (
                        <Link
                            href={slide.primary_cta_url || "/shop"}
                            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#9C7A3C] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-white"
                        >
                            {slide.primary_cta_text}
                            <ChevronRight size={11} strokeWidth={2.5} />
                        </Link>
                    )}
                </div>
            </div>
            {slides.length > 1 && (
                <div className="flex justify-center gap-1.5 pb-3 pt-2">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`h-1.5 rounded-full transition-all ${
                                i === index ? "w-5 bg-[#9C7A3C]" : "w-1.5 bg-white/30"
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Category Quick-Scroll ────────────────────────────────────────────────────

function CategoryQuickScroll({ categories }: { categories: CategoryCard[] }) {
    const { megaMenu } = usePage().props as any;

    const items = [
        { label: "New In", href: "/shop?sort=newest", image: null },
        ...megaMenu.slice(0, 4).map((m: any) => ({
            label: m.name,
            href: `/shop?category=${m.slug}`,
            image: null,
        })),
        ...categories.slice(0, 3).map((c) => ({
            label: c.name,
            href: `/shop?category=${c.slug}`,
            image: c.image,
        })),
    ].slice(0, 7);

    return (
        <div className="scrollbar-hide flex gap-3 overflow-x-auto px-4 pb-1">
            {items.map((s, i) => (
                <Link
                    key={`${i}-${s.href}`}
                    href={s.href}
                    className="flex flex-shrink-0 flex-col items-center gap-1.5"
                >
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-[#171310]/10 bg-white shadow-sm">
                        {s.image ? (
                            <img src={s.image} alt={s.label} className="h-full w-full object-cover" />
                        ) : (
                            <span className="font-serif text-base text-[#9C7A3C]">✦</span>
                        )}
                    </div>
                    <span className="w-16 text-center text-[10px] font-medium leading-tight text-[#171310]/65">
                        {s.label}
                    </span>
                </Link>
            ))}
        </div>
    );
}

// ─── Category List (reference image style) ────────────────────────────────────

function CategoryList({ categories }: { categories: CategoryCard[] }) {
    const { megaMenu } = usePage().props as any;

    // Merge megaMenu top-levels with passed categories, deduplicate by slug
    const seen = new Set<string>();
    const combined = [
        ...megaMenu.map((m: any) => ({
            id: m.id,
            name: m.name,
            slug: m.slug,
            image: null as string | null,
            subtitle: m.audience?.length
                ? m.audience.map((a: any) => a.name).join(", ")
                : "Explore collection",
            count: null as number | null,
        })),
        ...categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            image: c.image,
            subtitle: "Browse products",
            count: null as number | null,
        })),
    ].filter((item) => {
        if (seen.has(item.slug)) return false;
        seen.add(item.slug);
        return true;
    });

    if (combined.length === 0) return null;

    return (
        <div className="px-4">
            <div className="flex items-center justify-between pb-3">
                <h2 className="font-serif text-lg font-medium text-[#171310]">
                    Categories
                </h2>
                <Link
                    href="/shop"
                    className="flex items-center gap-1 text-[11px] font-medium text-[#9C7A3C]"
                >
                    View All <ChevronRight size={11} strokeWidth={2.5} />
                </Link>
            </div>
            <div className="space-y-3">
                {combined.map((cat) => (
                    <Link
                        key={cat.slug}
                        href={`/shop?category=${cat.slug}`}
                        className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm active:bg-[#F8F5EF]"
                    >
                        {/* Circle image */}
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F0EBE3]">
                            {cat.image ? (
                                <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="font-serif text-xl text-[#9C7A3C]">◈</span>
                            )}
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#171310]">{cat.name}</p>
                            <p className="mt-0.5 truncate text-[11px] text-[#252525]/50">
                                {cat.subtitle}
                            </p>
                        </div>
                        {/* Browse button */}
                        <div className="flex-shrink-0">
                            <div className="rounded-full bg-[#171310] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white">
                                Browse
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

// ─── Stars ────────────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={9}
                    fill={s <= rating ? "#9C7A3C" : "none"}
                    color={s <= rating ? "#9C7A3C" : "#9C7A3C"}
                    strokeWidth={1.5}
                />
            ))}
        </div>
    );
}

// ─── Mobile Product Card (grid) ───────────────────────────────────────────────

function MobileProductCard({ product }: { product: ProductItem }) {
    const { auth } = usePage().props;
    const price = product.sale_price ?? product.base_price;
    const primary = product.images[0];
    // Static 4-star display since rating isn't on the product type yet
    const displayRating = 4;

    function toggleWishlist(e: React.MouseEvent) {
        e.preventDefault();
        if (!auth.user) { router.visit("/login"); return; }
        if (product.is_wishlisted) {
            router.delete(`/account/wishlist/${product.id}`, { preserveScroll: true, preserveState: true });
        } else {
            router.post("/account/wishlist", { product_id: product.id }, { preserveScroll: true, preserveState: true });
        }
    }

    return (
        <Link href={`/products/${product.slug}`} className="block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#F0EBE3]">
                {primary && (
                    <img
                        src={primary.url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                    />
                )}
                {product.new_arrival && (
                    <span className="absolute left-1.5 top-1.5 rounded-full bg-[#171310] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-white">
                        New
                    </span>
                )}
                <button
                    onClick={toggleWishlist}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow-sm"
                >
                    <Heart
                        size={11}
                        fill={product.is_wishlisted ? "#9C7A3C" : "none"}
                        color={product.is_wishlisted ? "#9C7A3C" : "#171310"}
                    />
                </button>
            </div>
            <div className="mt-1.5 space-y-0.5">
                <Stars rating={displayRating} />
                {product.brand && (
                    <p className="text-[8px] font-semibold uppercase tracking-[0.1em] text-[#9C7A3C]">
                        {product.brand}
                    </p>
                )}
                <p className="text-[11px] font-medium leading-tight text-[#171310] line-clamp-2">
                    {product.name}
                </p>
                <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[11px] font-semibold text-[#171310]">
                        ${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#171310]">
                        <Plus size={9} color="white" strokeWidth={2.5} />
                    </div>
                </div>
            </div>
        </Link>
    );
}

// ─── Product Grid Section ─────────────────────────────────────────────────────

function ProductGrid({
    title,
    viewAllHref,
    products,
}: {
    title: string;
    viewAllHref: string;
    products: ProductItem[];
}) {
    if (products.length === 0) return null;
    return (
        <div className="px-4">
            <div className="flex items-center justify-between pb-3">
                <h2 className="font-serif text-lg font-medium text-[#171310]">{title}</h2>
                <Link
                    href={viewAllHref}
                    className="flex items-center gap-1 text-[11px] font-medium text-[#9C7A3C]"
                >
                    View All <ChevronRight size={11} strokeWidth={2.5} />
                </Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {products.map((p) => (
                    <MobileProductCard key={p.id} product={p} />
                ))}
            </div>
        </div>
    );
}

// ─── Promo Banner ─────────────────────────────────────────────────────────────

function PromoBanner() {
    return (
        <div className="mx-4 overflow-hidden rounded-2xl bg-[#2A1F14]">
            <div className="relative flex min-h-[120px] items-center">
                <div className="absolute right-5 top-1/2 flex h-16 w-16 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#9C7A3C] shadow-lg">
                    <span className="font-serif text-lg font-bold leading-none text-white">30%</span>
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-white/80">OFF</span>
                </div>
                <div className="relative z-10 p-5 pr-24">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#9C7A3C]">
                        Special Offer
                    </span>
                    <h3 className="mt-1 font-serif text-xl font-medium leading-tight text-white">
                        Up to 30% Off
                    </h3>
                    <p className="mt-0.5 text-[11px] text-white/60">
                        On selected luxury pieces
                    </p>
                    <Link
                        href="/shop"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#9C7A3C] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                    >
                        Shop Now <ChevronRight size={11} strokeWidth={2.5} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ─── Editorial Banner ─────────────────────────────────────────────────────────

function EditorialBanner({ content }: { content: HomepageContent }) {
    if (!content.editorial_video_url && !content.editorial_image_url) return null;
    return (
        <div className="mx-4 overflow-hidden rounded-2xl">
            <div className="relative h-44 w-full">
                {content.editorial_video_url ? (
                    <video
                        autoPlay muted loop playsInline
                        poster={content.editorial_image_url ?? undefined}
                        className="h-full w-full object-cover"
                    >
                        <source src={content.editorial_video_url} />
                    </video>
                ) : (
                    <img src={content.editorial_image_url!} alt="" className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-[#171310]/80 to-transparent p-5">
                    {content.editorial_title && (
                        <h3 className="font-serif text-xl font-medium text-white">
                            {content.editorial_title}
                        </h3>
                    )}
                    {content.editorial_cta_text && (
                        <Link
                            href={content.editorial_cta_url || "/shop"}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                        >
                            {content.editorial_cta_text} <ChevronRight size={11} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Watches Banner ───────────────────────────────────────────────────────────

function WatchesBanner({ content }: { content: HomepageContent }) {
    if (!content.watches_video_url && !content.watches_image_url) return null;
    return (
        <div className="mx-4 overflow-hidden rounded-2xl">
            <div className="relative h-44 w-full">
                {content.watches_video_url ? (
                    <video
                        autoPlay muted loop playsInline
                        poster={content.watches_image_url ?? undefined}
                        className="h-full w-full object-cover"
                    >
                        <source src={content.watches_video_url} />
                    </video>
                ) : (
                    <img src={content.watches_image_url!} alt="" className="h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 flex flex-col items-start justify-end bg-gradient-to-t from-[#171310]/80 to-transparent p-5">
                    {content.watches_title && (
                        <h3 className="font-serif text-xl font-medium text-white">
                            {content.watches_title}
                        </h3>
                    )}
                    {content.watches_subtitle && (
                        <p className="mt-1 text-[11px] text-white/70">
                            {content.watches_subtitle}
                        </p>
                    )}
                    {content.watches_cta_text && (
                        <Link
                            href={content.watches_cta_url || "/shop"}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#9C7A3C] px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                        >
                            {content.watches_cta_text} <ChevronRight size={11} />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Brand Story Banner ────────────────────────────────────────────────────────

function StoryBanner({ content }: { content: HomepageContent }) {
    if (!content.story_image_url) return null;
    return (
        <div className="mx-4 overflow-hidden rounded-2xl bg-white shadow-sm">
            <div className="relative h-48 w-full">
                <img
                    src={content.story_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171310]/70 to-transparent" />
            </div>
            <div className="p-5">
                {content.story_title && (
                    <h3 className="font-serif text-xl font-medium text-[#171310]">
                        {content.story_title}
                    </h3>
                )}
                {content.story_text && (
                    <p className="mt-2 text-[11px] leading-relaxed text-[#252525]/60 line-clamp-3">
                        {content.story_text}
                    </p>
                )}
                {content.story_cta_text && (
                    <Link
                        href="/about"
                        className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9C7A3C]"
                    >
                        {content.story_cta_text} <ChevronRight size={11} />
                    </Link>
                )}
            </div>
        </div>
    );
}

function TrustFeatures() {
    const features = [
        {
            icon: "✦",
            title: "Carefully Curated",
            body: "Every piece selected with intention and timeless appeal.",
        },
        {
            icon: "◎",
            title: "Seamless Experience",
            body: "Simple, elegant checkout designed for your convenience.",
        },
        {
            icon: "⬡",
            title: "Flexible Fulfillment",
            body: "Choose delivery or in-store pickup to suit your lifestyle.",
        },
    ];
    return (
        <div className="mx-4 overflow-hidden rounded-2xl bg-[#171310] p-5">
            <p className="mb-1 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9C7A3C]">
                The Boutique Experience
            </p>
            <h3 className="font-serif text-lg font-medium text-white">
                Every detail considered
            </h3>
            <div className="mt-4 space-y-4">
                {features.map((f) => (
                    <div key={f.title} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#9C7A3C]/30 bg-[#9C7A3C]/10 text-sm text-[#9C7A3C]">
                            {f.icon}
                        </span>
                        <div>
                            <p className="text-xs font-semibold text-white">{f.title}</p>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-white/55">{f.body}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialSection({ testimonials }: { testimonials: TestimonialItem[] }) {
    if (testimonials.length === 0) return null;

    const [index, setIndex] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    function resetTimer() {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % testimonials.length);
        }, 4000);
    }

    useEffect(() => {
        if (testimonials.length <= 1) return;
        timerRef.current = setInterval(() => {
            setIndex((i) => (i + 1) % testimonials.length);
        }, 4000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [testimonials.length]);

    const t = testimonials[index];

    return (
        <div className="px-4">
            <div className="pb-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9C7A3C]">Reviews</p>
                <h2 className="font-serif text-lg font-medium text-[#171310]">
                    Loved by those who wear it
                </h2>
            </div>

            {/* Card */}
            <div
                key={t.id}
                className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm"
            >
                {/* Decorative quote mark */}
                <div className="absolute left-4 top-3 font-serif text-5xl leading-none text-[#9C7A3C]/10 select-none">
                    "
                </div>
                <Stars rating={t.rating} />
                <p className="mt-3 font-serif text-sm italic leading-relaxed text-[#171310]">
                    "{t.quote}"
                </p>
                <div className="mt-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#171310]/8" />
                    <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#252525]/45">
                        {t.customer_name}
                    </p>
                    <div className="h-px flex-1 bg-[#171310]/8" />
                </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-center gap-5">
                <button
                    onClick={() => {
                        setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
                        resetTimer();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#171310]/10 bg-white shadow-sm"
                >
                    <svg className="h-3.5 w-3.5 text-[#171310]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex gap-1.5">
                    {testimonials.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => { setIndex(i); resetTimer(); }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === index ? "w-5 bg-[#9C7A3C]" : "w-1.5 bg-[#171310]/15"
                            }`}
                        />
                    ))}
                </div>

                <button
                    onClick={() => {
                        setIndex((i) => (i + 1) % testimonials.length);
                        resetTimer();
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#171310]/10 bg-white shadow-sm"
                >
                    <svg className="h-3.5 w-3.5 text-[#171310]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}

// ─── Newsletter ───────────────────────────────────────────────────────────────

function NewsletterBlock() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;
        router.post("/newsletter", { email }, {
            preserveScroll: true,
            onSuccess: () => setSubmitted(true),
        });
    }

    return (
        <div id="newsletter" className="mx-4 overflow-hidden rounded-2xl bg-[#9C7A3C]/10 p-5">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#9C7A3C]">
                Stay in the loop
            </p>
            <h3 className="mt-1 font-serif text-lg font-medium text-[#171310]">
                Join the Inner Circle
            </h3>
            <p className="mt-1 text-[11px] leading-relaxed text-[#252525]/60">
                Exclusive arrivals, private sales and style notes — direct to your inbox.
            </p>
            {submitted ? (
                <p className="mt-4 text-sm font-medium text-[#9C7A3C]">
                    ✦ You're on the list.
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="flex-1 rounded-full border border-[#171310]/15 bg-white px-4 py-2.5 text-sm text-[#171310] placeholder:text-[#252525]/35 focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/30"
                    />
                    <button
                        type="submit"
                        className="rounded-full bg-[#171310] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white"
                    >
                        Join
                    </button>
                </form>
            )}
        </div>
    );
}

// ─── Mobile Footer ────────────────────────────────────────────────────────────

function MobileFooter() {
    return (
        <footer className="px-4 pt-6">
            <div className="rounded-2xl bg-white p-5">
                <img src="/images/logo.png" alt="Boutique Luxxe" className="h-7 w-auto" />
                <p className="mt-2 text-[11px] leading-relaxed text-[#252525]/55">
                    Discover elegant, considered pieces designed to make every look unforgettable.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
                    {[
                        { label: "Shop All", href: "/shop" },
                        { label: "New Arrivals", href: "/shop?sort=newest" },
                        { label: "Collections", href: "/collections" },
                        { label: "About", href: "/about" },
                        { label: "Journal", href: "/journal" },
                        { label: "My Orders", href: "/account/orders" },
                    ].map((l) => (
                        <Link
                            key={l.href}
                            href={l.href}
                            className="text-[11px] text-[#252525]/60 transition hover:text-[#9C7A3C]"
                        >
                            {l.label}
                        </Link>
                    ))}
                </div>
                <p className="mt-5 text-[10px] text-[#252525]/35">
                    © {new Date().getFullYear()} Boutique Luxxe. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MobileHomeFeed({
    heroSlides,
    featuredProducts,
    newArrivals,
    categories,
    testimonials,
    content,
}: MobileHomeFeedProps) {
    const { auth, cart } = usePage().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.get("/shop", { search: searchTerm }, { preserveState: false });
        }
    }

    const firstName = auth.user?.name.split(" ")[0] ?? null;

    return (
        <div className="min-h-screen bg-[#F8F5EF] pb-20">
            <HamburgerDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

            {/* ── Header ── */}
            <div className="flex items-start justify-between px-4 pb-3 pt-5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
                    >
                        <Menu size={18} color="#171310" strokeWidth={1.8} />
                    </button>
                    <div>
                        {firstName ? (
                            <>
                                <p className="text-[10px] text-[#252525]/50">Hello, {firstName} ✦</p>
                                <h1 className="font-serif text-xl font-medium leading-tight text-[#171310]">
                                    Discover Luxxe
                                </h1>
                            </>
                        ) : (
                            <>
                                <p className="text-[10px] text-[#252525]/50">Welcome ✦</p>
                                <h1 className="font-serif text-xl font-medium leading-tight text-[#171310]">
                                    Boutique Luxxe
                                </h1>
                            </>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                    <Link
                        href="/account/notifications"
                        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
                    >
                        <Bell size={16} color="#171310" strokeWidth={1.8} />
                    </Link>
                    <Link
                        href="/cart"
                        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#171310] shadow-sm"
                    >
                        <ShoppingBag size={16} color="white" strokeWidth={1.8} />
                        {(cart as any).item_count > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#9C7A3C] text-[8px] font-bold text-white">
                                {(cart as any).item_count}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* ── Hero ── */}
            <HeroCard slides={heroSlides} />

            {/* ── Search ── */}
            <div className="px-4 py-3">
                <form onSubmit={submitSearch} className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#252525]/35" strokeWidth={2} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for products..."
                            className="w-full rounded-full border-0 bg-white py-2.5 pl-9 pr-4 text-sm text-[#171310] shadow-sm placeholder:text-[#252525]/35 focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/30"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => router.visit("/shop")}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white shadow-sm"
                    >
                        <SlidersHorizontal size={14} color="#171310" strokeWidth={2} />
                    </button>
                </form>
            </div>

            {/* ── Category quick-scroll ── */}
            <CategoryQuickScroll categories={categories} />

            {/* ── Featured products grid ── */}
            <div className="mt-6">
                <ProductGrid
                    title="The Edit"
                    viewAllHref="/shop?sort=featured"
                    products={featuredProducts}
                />
            </div>

            {/* ── Editorial campaign (after The Edit) ── */}
            <div className="mt-6">
                <EditorialBanner content={content} />
            </div>

            {/* ── Promo banner ── */}
            <div className="mt-6">
                <PromoBanner />
            </div>

            {/* ── New Arrivals grid ── */}
            <div className="mt-6">
                <ProductGrid
                    title="New Arrivals"
                    viewAllHref="/shop?sort=newest"
                    products={newArrivals}
                />
            </div>

            {/* ── Watches campaign (after New Arrivals) ── */}
            <div className="mt-6">
                <WatchesBanner content={content} />
            </div>

            {/* ── Brand story ── */}
            <div className="mt-6">
                <StoryBanner content={content} />
            </div>

            {/* ── Category list (reference image style) ── */}
            <div className="mt-6">
                <CategoryList categories={categories} />
            </div>

            {/* ── Trust features ── */}
            <div className="mt-6">
                <TrustFeatures />
            </div>

            {/* ── Testimonials ── */}
            <div className="mt-6">
                <TestimonialSection testimonials={testimonials} />
            </div>

            {/* ── Newsletter ── */}
            <div className="mt-6">
                <NewsletterBlock />
            </div>

            {/* ── Footer ── */}
            <div className="mt-6">
                <MobileFooter />
            </div>
        </div>
    );
}
