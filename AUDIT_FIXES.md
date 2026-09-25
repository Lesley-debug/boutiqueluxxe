# Boutique Luxxe remediation summary

## Fixed in this package

- Corrected the checkout page filename from `checkout.tsx` to `Checkout.tsx`, matching `Inertia::render('Store/Checkout')` on case-sensitive systems.
- Preserved guest checkout and added explicit delivery-only server validation.
- Kept order-confirmation ownership/session authorization and added confirmation-page throttling.
- Expanded throttling to password reset and cart mutation endpoints.
- Added a production-safe environment template with secure session settings and real-mail placeholders.
- Removed all remaining legacy “Designer Bags Boutique,” Douala, Bamenda, and pickup copy.
- Replaced unverified brand statistics, certification claims, and return promises with defensible language.
- Added responsive Privacy Policy and Terms of Service pages and linked them from checkout and the footer.
- Added a mobile-accessible footer, search action, clearer guest notification behavior, and larger touch targets.
- Added an accessible global Boutique Luxxe visual system: warm ivory canvas, ink, restrained heritage-gold accent, clear focus states, and reduced-motion support.
- Changed the smallest shop grid from three columns to two.
- Added global SEO metadata, canonical URL, `sitemap.xml`, and a sitemap reference in `robots.txt`.
- Added a strict client-side allowlist sanitizer before rendering journal rich text.
- Eager-loaded product variants on the homepage to prevent `in_stock` N+1 queries.
- Added a deployment checklist covering secret rotation, email, storage linking, queues, and production smoke tests.

## Verified

- TypeScript strict check: passed (`npx tsc --noEmit`).
- Production frontend build: passed (`npm run build`).
- The generated build contains `Checkout` and no `CheckoutOld` bundle.

## Requires deployment credentials or server access

- Rotate the exposed database credential. It is intentionally not copied into the distributable archive.
- Configure and test SMTP/Postmark/SES credentials.
- Run Laravel PHP tests, migrations, route inspection, and storage linking on a machine with PHP 8.3+.
- Replace the remaining default favicon with final approved brand exports.
- Review the supplied legal copy with qualified counsel for the countries where the store operates.
