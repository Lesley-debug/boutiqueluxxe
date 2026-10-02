import { Link, router, usePage } from "@inertiajs/react";
import { ArrowUpRight, Heart, ImageOff } from "lucide-react";
import { useEffect, useState } from "react";
import ProductRating from "@/components/Store/ProductRating";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    brand?: string | null;
    base_price: string;
    sale_price: string | null;
    rating?: number | string | null;
    reviews_count?: number;
    new_arrival?: boolean;
    images: { url: string }[];
    variants?: { stock_quantity: number }[];
    is_wishlisted?: boolean;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { auth } = usePage().props;
  const price = product.sale_price ?? product.base_price;
  const primary = product.images[0];
  const secondary = product.images[1];
  const inStock = product.variants
    ? product.variants.some((variant) => variant.stock_quantity > 0)
    : true;
  const [wishlisted, setWishlisted] = useState(!!product.is_wishlisted);
  const [message, setMessage] = useState<string | null>(null);
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [secondaryFailed, setSecondaryFailed] = useState(false);

  useEffect(() => {
    setPrimaryFailed(false);
    setSecondaryFailed(false);
  }, [primary?.url, secondary?.url]);

  function toggleWishlist(event: React.MouseEvent) {
    event.preventDefault();
    if (!auth.user) {
      router.visit("/login");
      return;
    }

    const next = !wishlisted;
    setWishlisted(next);
    setMessage(next ? "Saved" : "Removed");
    window.setTimeout(() => setMessage(null), 2200);

    if (wishlisted) {
      router.delete(`/account/wishlist/${product.id}`, {
        preserveScroll: true,
        preserveState: true,
        onError: () => setWishlisted(true),
      });
    } else {
      router.post(
        "/account/wishlist",
        { product_id: product.id },
        {
          preserveScroll: true,
          preserveState: true,
          onError: () => setWishlisted(false),
        },
      );
    }
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex h-full min-w-0 flex-col"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-[#181512]/[0.07] bg-[#F0EBE3] lg:aspect-[4/5] lg:rounded-[20px]">
        {primary && !primaryFailed ? (
          <img
            src={primary.url}
            alt={product.name}
            width={800}
            height={1000}
            loading="lazy"
            decoding="async"
            onError={() => setPrimaryFailed(true)}
            className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_35%,#FFFCF7,#E9E0D3)] px-5 text-center">
            <ImageOff className="h-7 w-7 text-[#9B7435]/65" strokeWidth={1.4} />
            <span className="mt-3 font-serif text-lg text-[#181512]/70">
              Boutique Luxxe
            </span>
            <span className="mt-1 text-[9px] uppercase tracking-[0.18em] text-[#6F6961]">
              Image coming soon
            </span>
          </div>
        )}
        {secondary && !secondaryFailed && !primaryFailed && (
          <img
            src={secondary.url}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setSecondaryFailed(true)}
            className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition duration-700 group-hover:opacity-100 lg:block"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-full bg-gradient-to-t from-[#181512]/75 to-transparent px-5 pb-5 pt-14 transition duration-300 group-hover:translate-y-0 lg:block">
          <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
            View piece <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
        {product.new_arrival && (
          <span className="absolute left-2 top-2 rounded-full bg-[#181512] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-white sm:left-4 sm:top-4 sm:px-3 sm:text-[9px]">
            New
          </span>
        )}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-[#181512]/8 bg-white/94 text-[#181512] shadow-sm transition hover:border-[#9B7435] hover:text-[#9B7435] sm:right-4 sm:top-4"
        >
          <Heart
            className="h-4 w-4"
            fill={wishlisted ? "#9B7435" : "none"}
            color={wishlisted ? "#9B7435" : "currentColor"}
          />
        </button>
        {message && (
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#181512] px-3 py-1.5 text-[9px] font-medium text-white">
            {message}
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F8F5EF]/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-[#181512] px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-white">
              Sold out
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col pt-3 sm:pt-4">
        {product.brand && (
          <p className="truncate text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9B7435]">
            {product.brand}
          </p>
        )}
        <p className="mt-1 line-clamp-2 min-h-[2.5rem] text-[12px] font-medium leading-5 text-[#181512] transition group-hover:text-[#9B7435] sm:text-sm">
          {product.name}
        </p>
        <div className="mt-1.5 min-h-4">
          <ProductRating
            rating={product.rating}
            reviewsCount={product.reviews_count}
            compact
          />
        </div>
        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-2">
          <span className="text-sm font-semibold text-[#181512]">
            {formatPrice(price)}
          </span>
          {product.sale_price && (
            <span className="text-xs text-[#6F6961]/60 line-through">
              {formatPrice(product.base_price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
