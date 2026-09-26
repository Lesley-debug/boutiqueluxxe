import { Star } from "lucide-react";

interface ProductRatingProps {
  rating?: number | string | null;
  reviewsCount?: number | null;
  compact?: boolean;
  className?: string;
}

export default function ProductRating({
  rating,
  reviewsCount = 0,
  compact = false,
  className = "",
}: ProductRatingProps) {
  const numericRating = Math.min(5, Math.max(0, Number(rating ?? 0)));
  const count = Math.max(0, Number(reviewsCount ?? 0));

  if (!numericRating || !count) {
    return (
      <span className={`text-[10px] font-medium text-[#6F6961] ${className}`}>
        Not yet rated
      </span>
    );
  }

  const roundedRating = Math.round(numericRating);
  const reviewLabel = `${count} ${count === 1 ? "review" : "reviews"}`;

  return (
    <div
      className={`flex flex-wrap items-center gap-1.5 ${className}`}
      aria-label={`${numericRating.toFixed(1)} out of 5 from ${reviewLabel}`}
    >
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={compact ? "h-3 w-3" : "h-3.5 w-3.5"}
            fill={star <= roundedRating ? "#9C7A3C" : "none"}
            color={star <= roundedRating ? "#9C7A3C" : "#CFC5B5"}
            strokeWidth={1.6}
          />
        ))}
      </span>
      <span
        className={`${compact ? "text-[9px] sm:text-[10px]" : "text-[11px]"} font-medium text-[#6F6961]`}
      >
        {numericRating.toFixed(1)} · {reviewLabel}
      </span>
    </div>
  );
}
