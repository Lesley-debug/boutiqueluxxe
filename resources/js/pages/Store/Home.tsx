import { Head, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import StoreLayout from "@/components/Store/StoreLayout";
import ProductCard from "@/components/Store/ProductCard";
import Reveal from "@/components/Store/Reveal";
import NewsletterSection from "@/components/Store/NewsletterSection";
import HeroCarousel from "@/components/Store/HeroCarousel";
import MobileCategoryShortcuts from "@/components/Store/MobileCategoryShortcuts";
import MobileHomeFeed from "@/components/Store/MobileHomeFeed";
import { Container, Eyebrow, TextLink } from "@/components/Store/ui";

interface CategoryCard {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}
interface ProductCardType {
  id: number;
  name: string;
  slug: string;
  base_price: string;
  sale_price: string | null;
  new_arrival: boolean;
  images: { url: string }[];
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
interface StyleCard {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
}
interface TestimonialItem {
  id: number;
  customer_name: string;
  quote: string;
  rating: number;
}
interface Slide {
  id: number;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  primary_cta_text: string | null;
  primary_cta_url: string | null;
  secondary_cta_text: string | null;
  secondary_cta_url: string | null;
  image_url: string | null;
}

interface HomeProps {
  heroSlides: Slide[];
  categories: CategoryCard[];
  featuredProducts: ProductCardType[];
  newArrivals: ProductCardType[];
  content: HomepageContent;
  styles: StyleCard[];
  testimonials: TestimonialItem[];
}

// ─── Testimonials Carousel ────────────────────────────────────────────────────

function TestimonialsCarousel({
  testimonials,
}: {
  testimonials: {
    id: number;
    customer_name: string;
    quote: string;
    rating: number;
  }[];
}) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function prev() {
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  }

  function next() {
    setIndex((i) => (i + 1) % testimonials.length);
  }

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
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testimonials.length]);

  const t = testimonials[index];

  return (
    <div className="mx-auto max-w-3xl">
      {/* Card */}
      <div
        key={t.id}
        className="relative rounded-[2px] border border-[#171310]/10 bg-white p-10 text-center shadow-[0_20px_60px_-20px_rgba(23,19,16,0.10)] transition-all duration-500"
      >
        {/* Decorative quote mark */}
        <div className="absolute left-8 top-6 font-serif text-6xl leading-none text-[#9C7A3C]/15 select-none">
          "
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <svg
              key={s}
              className={`h-4 w-4 ${s <= t.rating ? "text-[#9C7A3C]" : "text-[#171310]/10"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        {/* Quote */}
        <p className="mx-auto mt-6 max-w-xl font-serif text-xl italic leading-relaxed text-[#171310]">
          "{t.quote}"
        </p>

        {/* Attribution */}
        <div className="mt-8 flex items-center justify-center gap-3">
          <div className="h-px w-12 bg-[#171310]/10" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#252525]/50">
            {t.customer_name}
          </p>
          <div className="h-px w-12 bg-[#171310]/10" />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center justify-center gap-6">
        <button
          onClick={() => {
            prev();
            resetTimer();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#171310]/15 bg-white text-[#171310] shadow-sm transition hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
          aria-label="Previous"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setIndex(i);
                resetTimer();
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-[#9C7A3C]" : "w-1.5 bg-[#171310]/15"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => {
            next();
            resetTimer();
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#171310]/15 bg-white text-[#171310] shadow-sm transition hover:border-[#9C7A3C] hover:text-[#9C7A3C]"
          aria-label="Next"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Home({
  heroSlides,
  categories,
  featuredProducts,
  newArrivals,
  content,
  testimonials,
}: HomeProps) {
  const { welcomeBack, auth } = usePage().props;
  const [showWelcome, setShowWelcome] = useState(!!welcomeBack);

  const desktopFeatured = [...featuredProducts, ...newArrivals]
    .filter(
      (product, index, items) =>
        items.findIndex((candidate) => candidate.id === product.id) === index,
    )
    .slice(0, 4);
  const desktopArrivals = newArrivals.slice(0, 4);

  return (
    <StoreLayout noPadding showMobileHeader>
      <Head title="Home" />

      {/* ── Mobile feed (lg and above sees nothing here) ── */}
      <div className="lg:hidden">
        <MobileHomeFeed
          heroSlides={heroSlides}
          featuredProducts={featuredProducts}
          newArrivals={newArrivals}
          categories={categories}
          testimonials={testimonials}
          content={content}
        />
      </div>

      {/* ── Desktop storefront ── */}
      <main className="hidden lg:block">
        {showWelcome && auth.user && (
          <div className="bg-[#181512] px-6 py-3 text-center text-sm text-white">
            Welcome back, {auth.user.name.split(" ")[0]} — visit{" "}
            <a
              href="/account"
              className="font-medium text-[#D9BB82] underline underline-offset-4"
            >
              your dashboard
            </a>
            .
            <button
              onClick={() => setShowWelcome(false)}
              className="ml-4 text-white/55 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        <HeroCarousel slides={heroSlides} />

        {categories.length > 0 && (
          <section className="bg-[#F8F5EF] py-20">
            <Container>
              <Reveal>
                <div className="mb-10 flex items-end justify-between gap-8">
                  <div>
                    <Eyebrow>Discover</Eyebrow>
                    <h2 className="mt-3 font-serif text-5xl font-medium tracking-tight text-[#181512]">
                      Shop by department
                    </h2>
                  </div>
                  <p className="max-w-sm text-sm leading-6 text-[#6F6961]">
                    A considered edit of statement bags, modern essentials and
                    exceptional timepieces.
                  </p>
                </div>
              </Reveal>
              <div
                className={`grid gap-6 ${categories.length === 1 ? "mx-auto max-w-3xl grid-cols-1" : categories.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
              >
                {categories.slice(0, 3).map((category, index) => (
                  <Reveal key={category.id} delay={index * 80}>
                    <a
                      href={`/shop?category=${category.slug}`}
                      className={`group relative block overflow-hidden rounded-[24px] bg-[#181512] ${categories.length === 2 ? "aspect-[16/10]" : "aspect-[4/5]"}`}
                    >
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="h-full w-full bg-[radial-gradient(circle_at_70%_20%,#715f4c,#181512_75%)]" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#181512]/85 via-[#181512]/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-8">
                        <div>
                          <p className="font-serif text-3xl text-white">
                            {category.name}
                          </p>
                          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                            Explore collection
                          </p>
                        </div>
                        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition group-hover:border-[#D9BB82] group-hover:bg-[#D9BB82] group-hover:text-[#181512]">
                          →
                        </span>
                      </div>
                    </a>
                  </Reveal>
                ))}
              </div>
            </Container>
          </section>
        )}

        {desktopFeatured.length > 0 && (
          <section className="bg-white py-20">
            <Container>
              <div className="mb-10 flex items-end justify-between gap-8">
                <Reveal>
                  <div>
                    <Eyebrow>Curated</Eyebrow>
                    <h2 className="mt-3 font-serif text-5xl font-medium tracking-tight text-[#181512]">
                      The Boutique Edit
                    </h2>
                    <p className="mt-3 text-sm text-[#6F6961]">
                      Signature pieces selected for character, versatility and
                      lasting appeal.
                    </p>
                  </div>
                </Reveal>
                <TextLink href="/shop">Shop all pieces</TextLink>
              </div>
              <div
                className={`grid gap-6 ${desktopFeatured.length === 1 ? "max-w-sm grid-cols-1" : desktopFeatured.length === 2 ? "grid-cols-2" : desktopFeatured.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}
              >
                {desktopFeatured.map((product, index) => (
                  <Reveal key={product.id} delay={index * 60}>
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </div>
            </Container>
          </section>
        )}

        {(content.editorial_video_url || content.editorial_image_url) && (
          <section className="relative h-[560px] overflow-hidden">
            {content.editorial_video_url ? (
              <video
                autoPlay
                muted
                loop
                playsInline
                poster={content.editorial_image_url ?? undefined}
                className="h-full w-full object-cover"
              >
                <source src={content.editorial_video_url} />
              </video>
            ) : (
              <img
                src={content.editorial_image_url!}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#181512]/80 via-[#181512]/35 to-transparent" />
            <div className="absolute inset-0 flex items-center">
              <Container className="w-full">
                <Reveal>
                  <div className="max-w-xl text-left">
                    <Eyebrow light>Editorial</Eyebrow>
                    {content.editorial_title && (
                      <h2 className="mt-4 font-serif text-6xl font-medium leading-[1.02] text-white">
                        {content.editorial_title}
                      </h2>
                    )}
                    {content.editorial_subtitle && (
                      <p className="mt-5 max-w-md text-base leading-7 text-white/78">
                        {content.editorial_subtitle}
                      </p>
                    )}
                    {content.editorial_cta_text && (
                      <a
                        href={content.editorial_cta_url || "/shop"}
                        className="mt-8 inline-flex rounded-full bg-white px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#181512] transition hover:bg-[#D9BB82]"
                      >
                        {content.editorial_cta_text}
                      </a>
                    )}
                  </div>
                </Reveal>
              </Container>
            </div>
          </section>
        )}

        {desktopArrivals.length > 0 && (
          <section className="bg-[#F8F5EF] py-20">
            <Container>
              <div className="mb-10 flex items-end justify-between gap-8">
                <div>
                  <Eyebrow>Just In</Eyebrow>
                  <h2 className="mt-3 font-serif text-5xl font-medium tracking-tight text-[#181512]">
                    New arrivals
                  </h2>
                  <p className="mt-3 text-sm text-[#6F6961]">
                    The latest additions to the Boutique Luxxe collection.
                  </p>
                </div>
                <TextLink href="/shop?sort=newest">View all arrivals</TextLink>
              </div>
              <div
                className={`grid gap-6 ${desktopArrivals.length === 1 ? "max-w-sm grid-cols-1" : desktopArrivals.length === 2 ? "grid-cols-2" : desktopArrivals.length === 3 ? "grid-cols-3" : "grid-cols-4"}`}
              >
                {desktopArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </Container>
          </section>
        )}

        {content.story_image_url && (
          <section className="bg-white py-20">
            <Container>
              <div className="grid grid-cols-[1.05fr_.95fr] items-center gap-16">
                <Reveal>
                  <div className="aspect-[16/11] overflow-hidden rounded-[24px]">
                    <img
                      src={content.story_image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </Reveal>
                <Reveal delay={100}>
                  <Eyebrow>Our point of view</Eyebrow>
                  {content.story_title && (
                    <h2 className="mt-4 font-serif text-5xl font-medium leading-tight text-[#181512]">
                      {content.story_title}
                    </h2>
                  )}
                  {content.story_text && (
                    <p className="mt-6 max-w-lg text-base leading-8 text-[#6F6961]">
                      {content.story_text}
                    </p>
                  )}
                  <div className="mt-8">
                    <TextLink href="/about">
                      {content.story_cta_text || "Discover our story"}
                    </TextLink>
                  </div>
                </Reveal>
              </div>
            </Container>
          </section>
        )}

        <section className="bg-[#181512] py-16 text-white">
          <Container>
            <div className="grid grid-cols-3 divide-x divide-white/10">
              {[
                [
                  "Carefully Curated",
                  "Distinctive pieces selected with intention and care.",
                ],
                [
                  "Personal Service",
                  "A human, attentive ordering experience from enquiry to delivery.",
                ],
                [
                  "Flexible Fulfilment",
                  "Delivery coordinated for local and international clients.",
                ],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="px-10 text-center first:pl-0 last:pr-0"
                >
                  <span className="mx-auto block h-2 w-2 rounded-full bg-[#D9BB82]" />
                  <h3 className="mt-5 font-serif text-2xl">{title}</h3>
                  <p className="mx-auto mt-3 max-w-xs text-sm leading-6 text-white/55">
                    {copy}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {testimonials.length > 0 && (
          <section className="bg-[#F8F5EF] py-20">
            <Container>
              <div className="mb-10 text-center">
                <Eyebrow>Reviews</Eyebrow>
                <h2 className="mt-3 font-serif text-5xl font-medium text-[#181512]">
                  Loved by those who wear it
                </h2>
              </div>
              <TestimonialsCarousel testimonials={testimonials} />
            </Container>
          </section>
        )}

        <NewsletterSection />
      </main>
    </StoreLayout>
  );
}
