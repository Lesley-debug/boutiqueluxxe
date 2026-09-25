# Boutique Luxxe — latest edit setup

## Apply the edit patch

Back up your project first, then from the project root run:

```bash
patch -p1 < /path/to/boutiqueluxxe-latest-edits.patch
```

No database migration and no new Composer or npm package are required by this patch.

## Fix the `@react-refresh` 404

Use only one asset mode.

### Development / hot reload

Run Laravel and Vite in separate terminals:

```bash
php artisan serve
npm run dev
```

Open `http://127.0.0.1:8000`, not the Vite URL directly.

### Built assets

Stop Vite, then run:

```bash
rm -f public/hot
npm run build
php artisan optimize:clear
php artisan serve
```

A stale `public/hot` file is removed by this patch. Do not use a stale hot file with production-built assets.

## Google sign-in

Create OAuth web credentials in Google Cloud and add both redirect URIs there:

- Local: `http://127.0.0.1:8000/auth/google/callback`
- Production: `https://your-domain.com/auth/google/callback`

Set these values in `.env`:

```env
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

On production, replace the redirect URI with the HTTPS domain. Then run:

```bash
php artisan optimize:clear
```

Never commit the real client secret.

## Password reset

Laravel's password broker is wired to the forgot/reset pages. Delivery still requires a working production mail configuration. For local development with `MAIL_MAILER=log`, inspect `storage/logs/laravel.log` for the reset link.

## Verification completed

```bash
npx tsc --noEmit
npm run build
```

Both completed successfully. PHP CLI was not available in the build sandbox, so run your normal Laravel test suite locally before deployment.
