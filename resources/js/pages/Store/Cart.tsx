import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEvent } from 'react';
import StoreLayout from '@/components/Store/StoreLayout';
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
    <StoreLayout categories={[]}>
      <Head title="Your Cart" />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-semibold text-stone-900">Your Cart</h1>

        {cart.items.length === 0 ? (
          <div>
            <p className="text-stone-500">Your cart is empty.</p>
            <Link href="/shop" className="mt-4 inline-block text-sm underline">
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {cart.items.map((item) => {
                const primary = item.variant.product.images?.[0];
                const label = [item.variant.color, item.variant.size, item.variant.material]
                  .filter(Boolean)
                  .join(' / ');

                return (
                  <div key={item.id} className="flex items-center gap-4 py-4">
                    {primary && (
                      <img
                        src={primary.url}
                        alt={item.variant.product.name}
                        className="h-20 w-20 rounded-sm object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-stone-900">{item.variant.product.name}</p>
                      {label && <p className="text-xs text-stone-500">{label}</p>}
                      <p className="text-xs text-stone-500">SKU: {item.variant.sku}</p>
                    </div>
                    <div className="flex items-center rounded-sm border border-stone-300">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-stone-600"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-stone-600"
                      >
                        +
                      </button>
                    </div>
                    <p className="w-24 text-right text-sm font-medium">
                      {Number(item.line_total).toLocaleString()} FCFA
                    </p>
                    <button onClick={() => removeItem(item.id)} className="text-xs text-red-600 underline">
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-start justify-between gap-8">
              <div className="flex-1">
                <Link href="/shop" className="text-sm underline">
                  Continue shopping
                </Link>

                <div className="mt-6">
                  {cart.discount ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="rounded-sm bg-green-100 px-2 py-1 font-mono text-green-800">
                        {cart.discount.code}
                      </span>
                      <span className="text-stone-500">applied</span>
                      <button onClick={removeDiscount} className="text-red-600 underline">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={applyDiscount} className="flex gap-2">
                      <input
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value.toUpperCase())}
                        placeholder="Discount code"
                        className="w-40 rounded-sm border border-stone-300 px-3 py-2 text-sm font-mono"
                      />
                      <button
                        type="submit"
                        disabled={processing}
                        className="rounded-sm border border-stone-300 px-4 py-2 text-sm"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {errors.code && <p className="mt-1 text-xs text-red-600">{errors.code}</p>}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-stone-500">Subtotal</p>
                <p className="text-sm">{Number(cart.subtotal).toLocaleString()} FCFA</p>
                {cart.discount_amount > 0 && (
                  <p className="text-sm text-green-700">
                    −{Number(cart.discount_amount).toLocaleString()} FCFA
                  </p>
                )}
                <p className="mt-1 text-xl font-semibold">{Number(cart.total).toLocaleString()} FCFA</p>
              </div>
            </div>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-sm bg-stone-900 px-6 py-3 text-center text-sm font-medium text-white"
            >
              Proceed to Checkout
            </Link>
          </>
        )}
      </div>
    </StoreLayout>
  );
}
