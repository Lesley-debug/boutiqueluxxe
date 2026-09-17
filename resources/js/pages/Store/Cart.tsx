import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import { ShoppingBag, Minus, Plus, Trash2, Tag, ArrowRight } from 'lucide-react';
import StoreLayout from '@/components/Store/StoreLayout';
import Reveal from '@/components/Store/Reveal';
import type { Cart } from '@/types/cart';

export default function CartPage({ cart }: { cart: Cart }) {
  const { data, setData, post, processing, errors, reset } = useForm({ code: '' });

  function updateQuantity(itemId: number, quantity: number) {
    if (quantity < 1) return;
    router.patch(`/cart/items/${itemId}`, { quantity }, { preserveScroll: true });
  }

  function removeItem(itemId: number) {
    router.delete(`/cart/items/${itemId}`, { preserveScroll: true });
  }

  function applyDiscount(e: FormEvent) {
    e.preventDefault();
    post('/cart/discount', { preserveScroll: true, onSuccess: () => reset() });
  }

  function removeDiscount() {
    router.delete('/cart/discount', { preserveScroll: true });
  }

  return (
    <StoreLayout>
      <Head title="Shopping Bag" />
      
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
        {/* Header */}
        <Reveal>
          <div className="mb-12 text-center">
            <h1 className="font-serif text-4xl font-medium tracking-tight text-[#171310] md:text-5xl">
              Shopping Bag
            </h1>
            <p className="mt-3 text-sm text-[#252525]/60">
              {cart.item_count} {cart.item_count === 1 ? 'item' : 'items'} in your bag
            </p>
          </div>
        </Reveal>

        {cart.items.length === 0 ? (
          <Reveal delay={100}>
            <div className="mx-auto max-w-md rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-12 text-center">
              <div className="mb-6 flex justify-center">
                <div className="rounded-full bg-white p-6 shadow-sm">
                  <ShoppingBag className="h-12 w-12 text-[#171310]/30" />
                </div>
              </div>
              <h2 className="mb-2 font-serif text-xl font-medium text-[#171310]">
                Your bag is empty
              </h2>
              <p className="mb-8 text-sm text-[#252525]/60">
                Discover our curated collection of luxury designer bags
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-[#171310] px-8 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C]"
              >
                <span>Shop Collection</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        ) : (
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {cart.items.map((item, index) => {
                  const primary = item.variant.product.images?.[0];
                  const label = [item.variant.color, item.variant.size, item.variant.material]
                    .filter(Boolean)
                    .join(' / ');

                  return (
                    <Reveal key={item.id} delay={index * 60}>
                      <div className="group relative overflow-hidden rounded-[2px] border border-[#171310]/10 bg-white p-6 transition-all duration-300 hover:shadow-[0_16px_32px_-16px_rgba(23,19,16,0.12)]">
                        <div className="flex gap-6">
                          {/* Product Image */}
                          <Link
                            href={`/products/${item.variant.product.slug}`}
                            className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-[2px] bg-[#F8F5EF]"
                          >
                            {primary ? (
                              <img
                                src={primary.url}
                                alt={item.variant.product.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag className="h-12 w-12 text-[#171310]/20" />
                              </div>
                            )}
                          </Link>

                          {/* Product Details */}
                          <div className="flex flex-1 flex-col">
                            <Link
                              href={`/products/${item.variant.product.slug}`}
                              className="font-serif text-lg font-medium text-[#171310] transition hover:text-[#9C7A3C]"
                            >
                              {item.variant.product.name}
                            </Link>
                            {label && (
                              <p className="mt-2 text-sm text-[#252525]/60">{label}</p>
                            )}
                            <p className="mt-1 text-xs text-[#252525]/40">
                              SKU: {item.variant.sku}
                            </p>

                            {/* Quantity & Price */}
                            <div className="mt-6 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-medium uppercase tracking-[0.1em] text-[#252525]/60">
                                  Qty
                                </span>
                                <div className="flex items-center gap-1 rounded-full border border-[#171310]/15 bg-[#F8F5EF]">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="rounded-full p-2 text-[#171310] transition hover:bg-white"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="h-3.5 w-3.5" />
                                  </button>
                                  <span className="w-10 text-center text-sm font-medium text-[#171310]">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="rounded-full p-2 text-[#171310] transition hover:bg-white"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="font-serif text-lg font-medium text-[#171310]">
                                  {Number(item.line_total).toLocaleString()} FCFA
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="absolute right-4 top-4 rounded-full p-2 text-[#252525]/30 transition hover:bg-red-50 hover:text-red-600"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </div>

              {/* Continue Shopping */}
              <Reveal delay={cart.items.length * 60 + 100}>
                <div className="mt-8">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-[0.1em] text-[#171310] transition hover:text-[#9C7A3C]"
                  >
                    <ArrowRight className="h-4 w-4 rotate-180" />
                    <span>Continue Shopping</span>
                  </Link>
                </div>
              </Reveal>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <Reveal delay={200}>
                <div className="sticky top-24 rounded-2xl border border-[#171310]/10 bg-[#F8F5EF] p-8">
                  <h2 className="mb-6 font-serif text-xl font-medium text-[#171310]">
                    Order Summary
                  </h2>

                  {/* Discount Code */}
                  <div className="mb-6">
                    <label className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.1em] text-[#252525]/60">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Discount Code</span>
                    </label>
                    
                    {cart.discount ? (
                      <div className="flex items-center justify-between rounded-full border border-[#9C7A3C]/30 bg-[#9C7A3C]/10 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold uppercase tracking-[0.1em] text-[#9C7A3C]">
                            {cart.discount.code}
                          </span>
                          <span className="text-xs text-[#252525]/50">Applied</span>
                        </div>
                        <button
                          onClick={removeDiscount}
                          className="text-xs font-medium uppercase tracking-[0.1em] text-red-600 transition hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={applyDiscount} className="flex gap-2">
                        <input
                          value={data.code}
                          onChange={(e) => setData('code', e.target.value.toUpperCase())}
                          placeholder="Enter code"
                          className="flex-1 rounded-full border border-[#171310]/15 bg-white px-4 py-2.5 text-sm font-mono uppercase text-[#171310] transition focus:border-[#9C7A3C] focus:outline-none focus:ring-2 focus:ring-[#9C7A3C]/20"
                        />
                        <button
                          type="submit"
                          disabled={processing}
                          className="rounded-full border border-[#171310]/15 bg-white px-5 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-[#171310] transition hover:border-[#171310] hover:bg-[#171310] hover:text-white disabled:opacity-50"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                    {errors.code && (
                      <p className="mt-2 text-xs text-red-600">{errors.code}</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="space-y-3 border-t border-[#171310]/10 pt-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#252525]/70">Subtotal</span>
                      <span className="font-medium text-[#171310]">
                        {Number(cart.subtotal).toLocaleString()} FCFA
                      </span>
                    </div>
                    
                    {cart.discount_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-[#9C7A3C]">Discount</span>
                        <span className="font-medium text-[#9C7A3C]">
                          −{Number(cart.discount_amount).toLocaleString()} FCFA
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-[#171310]/10 pt-4">
                      <span className="font-serif text-lg font-medium text-[#171310]">
                        Total
                      </span>
                      <span className="font-serif text-xl font-medium text-[#171310]">
                        {Number(cart.total).toLocaleString()} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Link
                    href="/checkout"
                    className="mt-8 block w-full rounded-full bg-[#171310] py-4 text-center text-sm font-semibold uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-8px_rgba(23,19,16,0.35)] transition duration-300 hover:bg-[#9C7A3C]"
                  >
                    Proceed to Checkout
                  </Link>

                  {/* Benefits */}
                  <div className="mt-6 space-y-3 border-t border-[#171310]/10 pt-6">
                    <p className="flex items-start gap-2 text-xs text-[#252525]/60">
                      <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#9C7A3C]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Complimentary shipping on selected orders</span>
                    </p>
                    <p className="flex items-start gap-2 text-xs text-[#252525]/60">
                      <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#9C7A3C]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Secure checkout with multiple payment options</span>
                    </p>
                    <p className="flex items-start gap-2 text-xs text-[#252525]/60">
                      <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#9C7A3C]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Easy returns within 14 days</span>
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
