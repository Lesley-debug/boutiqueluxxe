# Mobile and Desktop Continuation Notes

Last reviewed: 2026-09-23
Last updated: 2026-09-23 after Phase 1 correctness fixes

This document is a handoff for the current storefront/account work. It is not only a list of errors. It separates confirmed correctness issues from mobile/desktop UX work so the next person can continue without rereading the whole project.

## Current Snapshot

- Current branch: `feature/mobile-ui-overhaul`
- Latest commit: `3fc221e feat: mobile-first UI overhaul, shop/product redesign, notifications, wishlist badge`
- Relationship to `main`: 1 commit ahead
- Worktree at initial review time: clean
- Current uncommitted work after this update: Phase 1 correctness fixes plus this document update
- Frontend build: `npm run build` passes
- Route list: `php artisan route:list --except-vendor` works and shows 120 app routes
- Backend tests: `php artisan test` is blocked locally because PHP is missing the SQLite PDO driver. The failing example feature test hits `/`, then Laravel tries to query `hero_slides` using in-memory SQLite and throws `could not find driver`.

## Fixed In The Phase 1 Pass

These items were fixed after the initial review:

- Product detail now receives `is_wishlisted` for the main product and related products from `ProductController@show`.
- Product detail wishlist toggling now redirects guests to `/login`, matching `ProductCard`.
- Mobile `/categories` now renders inside `StoreLayout`, so the mobile bottom tab bar is available there.
- `NotificationDropdown` now posts to the current account notification routes:
  - `POST /account/notifications/{id}/read`
  - `POST /account/notifications/mark-all-read`

## What Is Already Implemented

### Storefront

- Home page with mobile feed and desktop luxury layout.
- Shop page with search, category filtering, sort, pagination, mobile filter drawer, and desktop sidebar.
- Product detail page with gallery, variants, quantity selector, add-to-cart, wishlist button, and related products.
- Category browse page.
- Collections, collection detail, journal, journal detail, about, newsletter.
- Shared product card with optimistic wishlist toggle.
- Desktop header with logo, nav, categories mega menu, wishlist/account/cart actions.
- Mobile bottom tab bar.

### Commerce

- Guest and authenticated carts.
- Cart item add/update/delete.
- Discount apply/remove.
- Checkout with delivery/pickup, saved addresses, payment-on-delivery, order notes, order review.
- Order creation inside a transaction.
- Stock decrement and low-stock admin notifications.
- Order confirmation email.
- Customer order confirmation page.

### Account

- Account dashboard.
- Profile.
- Addresses.
- Wishlist.
- Orders and order detail.
- Notifications.
- Activity page.

### Admin

- Dashboard.
- Products, categories, variants, images, styles.
- Collections, journal, about page.
- Homepage content, hero slides, testimonials, newsletter.
- Bulk pricing.
- Orders, customers, discounts, notifications, admin users.
- Role/permission gates for `super_admin`, `manager`, and `support_staff`.

## Remaining Decisions And Risks

These are not all errors. Some are product/UX choices still waiting for a decision.

### 1. MobileCategoryShortcuts Is Effectively Unused On Home

File: `resources/js/pages/Store/Home.tsx`

`MobileCategoryShortcuts` is rendered inside the desktop-only block, while the component itself is `lg:hidden`. That means it does not show in practice.

Decision needed:

- Move it into mobile home if still wanted.
- Or remove it because `MobileHomeFeed` already has `CategoryQuickScroll`.

### 2. Unused Storefront Components Need A Decision

Files:

- `resources/js/components/Store/SlideoverCart.tsx`
- `resources/js/components/Store/UserProfileDropdown.tsx`
- `resources/js/components/Store/NotificationDropdown.tsx`

These exist but are not wired into the current header/layout. They may be leftovers from the previous desktop header/cart approach.

Decision needed:

- Reconnect them for desktop polish.
- Or delete them later after confirming they are no longer part of the intended UX.

Note: `NotificationDropdown` route usage has been corrected, but the component is still not currently mounted in `StoreHeader`.

### 3. Backend Test Environment Needs SQLite PDO

`php artisan test` still cannot fully run in the current local environment because the in-memory SQLite driver is missing.

Decision needed:

- Install/enable `pdo_sqlite` for the PHP CLI.
- Or update the test environment to use another available database driver.

## UX Work Still Worth Doing

These are not build errors. They are the highest-value next product improvements.

### Mobile First Priority

The mobile foundation is strongest on:

- Home
- Shop
- Product detail
- Categories
- Account dashboard

The mobile buying path still needs the most polish:

1. Cart
2. Checkout
3. Order confirmation
4. Wishlist
5. Account orders and order detail
6. Notifications page

Recommended direction:

- Make the cart feel like a mobile bag screen, not a squeezed desktop page.
- Make checkout feel like a clean step flow with a sticky bottom action area.
- Make order confirmation easier to scan on mobile.
- Add a clear wishlist-to-cart path where possible.
- Keep the mobile tab bar visible on customer-facing mobile pages unless there is a strong reason to hide it.

### Desktop Priority

Desktop is already more complete. The next desktop polish is mostly about reconnecting or simplifying:

- Decide whether desktop should use a notification dropdown.
- Decide whether desktop cart should be a slide-over or direct `/cart` navigation.
- Improve shop filters beyond category/sort if the business needs style and price browsing.
- Review mega menu behavior and category hierarchy after real catalog data is loaded.

## Suggested Work Order

### Phase 1: Quick Correctness Fixes

Status: mostly done.

Done:

1. Set `is_wishlisted` in `ProductController@show` for product detail and related products.
2. Added guest redirect handling to product detail wishlist toggle.
3. Fixed `NotificationDropdown` route usage.
4. Ensured `/categories` mobile uses `StoreLayout` and gets the mobile bottom navigation.

Still open:

- Decide whether `MobileCategoryShortcuts` should be moved or removed.
- Decide whether the unused dropdown/slide-over components should be reconnected or deleted.

### Phase 2: Mobile Cart

Files to inspect first:

- `resources/js/pages/Store/Cart.tsx`
- `resources/js/types/cart.ts`
- `app/Http/Controllers/CartController.php`

Target behavior:

- Compact mobile header with item count.
- Product rows sized for thumbs.
- Quantity steppers that do not overflow.
- Clear remove action.
- Discount code inside a collapsible or quiet section.
- Sticky checkout summary/action at the bottom on mobile.

### Phase 3: Mobile Checkout

Files to inspect first:

- `resources/js/pages/Store/Checkout.tsx`
- `app/Http/Controllers/CheckoutController.php`
- `resources/js/types/account.ts`
- `resources/js/types/cart.ts`

Target behavior:

- Mobile-specific progress stepper.
- Short, scannable sections.
- Better saved-address selection on mobile.
- Sticky bottom action for Continue/Back/Place Order.
- Order summary that is visible but not overwhelming.
- Validation messages close to their fields.

### Phase 4: Mobile Confirmation And Account Follow-Through

Files to inspect first:

- `resources/js/pages/Store/OrderConfirmation.tsx`
- `resources/js/pages/Account/Orders.tsx`
- `resources/js/pages/Account/OrderDetail.tsx`
- `resources/js/pages/Account/Wishlist.tsx`
- `resources/js/pages/Account/Notifications.tsx`

Target behavior:

- Confirmation page should clearly show order number, status, contact/delivery details, and next actions.
- Orders list should be easy to scan on mobile.
- Order detail should expose tracking/status clearly.
- Wishlist should make it easy to continue shopping or open product details.

## Verification Checklist

Run these after meaningful changes:

```bash
npm run build
php artisan route:list --except-vendor
git status --short
```

Run this when the local PHP SQLite driver is installed:

```bash
php artisan test
```

Manual browser checks to do with seeded/real data:

- Mobile `/`
- Mobile `/shop`
- Mobile `/products/{slug}`
- Mobile `/cart`
- Mobile `/checkout`
- Mobile `/orders/{orderNumber}/confirmation`
- Mobile `/account`
- Mobile `/account/orders`
- Mobile `/account/wishlist`
- Desktop `/`
- Desktop `/shop`
- Desktop `/cart`
- Desktop `/checkout`
- Admin `/admin`

## Notes For The Next Session

- The app compiles, so treat the next work as focused product polish plus small correctness fixes.
- Do not start by redesigning everything. Preserve the current luxury visual language.
- Mobile buying path is the best next investment.
- If work stops mid-stream, update this file with:
  - what changed,
  - what still fails,
  - what command was last run,
  - which file should be opened first next time.
