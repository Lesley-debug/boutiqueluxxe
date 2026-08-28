import { Head, Link, router } from "@inertiajs/react";
import type { WishlistItem } from "@/types/account";

export default function Wishlist({ items }: { items: WishlistItem[] }) {
    function remove(productId: number) {
        router.delete(`/account/wishlist/${productId}`, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title="My Wishlist" />
            <div className="mx-auto max-w-4xl px-4 py-10">
                <h1 className="mb-6 text-xl font-semibold">My Wishlist</h1>

                {items.length === 0 ? (
                    <div>
                        <p className="text-stone-500">
                            Your wishlist is empty.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-4 inline-block text-sm underline"
                        >
                            Browse products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
                        {items.map((item) => {
                            const price =
                                item.product.sale_price ??
                                item.product.base_price;
                            const primary = item.product.images[0];
                            return (
                                <div key={item.id}>
                                    <Link
                                        href={`/products/${item.product.slug}`}
                                    >
                                        <div className="aspect-[3/4] overflow-hidden rounded-sm bg-stone-100">
                                            {primary && (
                                                <img
                                                    src={primary.url}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            )}
                                        </div>
                                    </Link>
                                    <p className="mt-2 text-sm font-medium">
                                        {item.product.name}
                                    </p>
                                    <p className="text-sm text-stone-600">
                                        {Number(price).toLocaleString()} FCFA
                                    </p>
                                    <button
                                        onClick={() => remove(item.product.id)}
                                        className="mt-1 text-xs text-red-600 underline"
                                    >
                                        Remove
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
}
