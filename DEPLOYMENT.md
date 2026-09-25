# Boutique Luxxe deployment checklist

1. Rotate the database password that appeared in the previous local `.env` and verify `.env` has never been committed.
2. Create the server `.env` from `.env.production.example`; generate `APP_KEY`; keep `APP_DEBUG=false`.
3. Configure a real SMTP/Postmark/SES provider and verify order, status, welcome, and password-reset emails.
4. Run `composer install --no-dev --optimize-autoloader`, `npm ci && npm run build`, `php artisan migrate --force`, and `php artisan storage:link`.
5. Run `php artisan optimize`, start the queue worker, and configure its process monitor.
6. Confirm Cloudflare forwards HTTPS and client IP headers; trusted proxy handling is enabled in `bootstrap/app.php`.
7. Smoke-test guest checkout, signed-in checkout, confirmation authorization, email delivery, images, legal links, and mobile navigation.
8. Replace the default favicon/logo asset set with final approved brand exports before launch.
