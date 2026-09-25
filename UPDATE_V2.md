# Boutique Luxxe UI update v2

- Standardized mobile product grids to two products per row on Home, Shop, Collection Detail, and related-product sections.
- Replaced horizontally scrolling mobile category and filter rows with wrapped/grid layouts.
- Added global overflow guards to prevent page-level horizontal scrolling.
- Fixed desktop and mobile sticky headers by moving sticky positioning to persistent layout wrappers.
- Replaced the top-right shopping-bag glyph with a clearer shopping-cart icon.
- Simplified the compact mobile header to prevent overflow on narrow screens; notifications remain available in the menu.
- Added `info@boutiqueluxxe.com` to the responsive footer.
- Added working FAQ and Contact pages using the Boutique Luxxe ivory, charcoal, and heritage-gold palette.
- Added contact-form validation, spam honeypot, rate limiting, reply-to behavior, and delivery to the configured contact address.
- Added `CONTACT_EMAIL=info@boutiqueluxxe.com` to environment templates.
- TypeScript strict check and Vite production build both pass.
