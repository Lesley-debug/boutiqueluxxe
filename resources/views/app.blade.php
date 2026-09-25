<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    @php
        $seo = data_get($page, 'props.seo', []);
        $seoTitle = data_get($seo, 'title', 'Boutique Luxxe');
        $fullTitle = $seoTitle === 'Boutique Luxxe'
            ? 'Boutique Luxxe — Curated Luxury Pieces'
            : $seoTitle.' — Boutique Luxxe';
        $seoDescription = data_get(
            $seo,
            'description',
            'Boutique Luxxe curates distinctive luxury bags, watches, and accessories with personal service.',
        );
        $seoCanonical = data_get($seo, 'canonical', url()->current());
        $seoRobots = data_get($seo, 'robots', 'index,follow');
        $seoType = data_get($seo, 'type', 'website');
        $seoImage = data_get($seo, 'image');
        $organizationSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'Organization',
            'name' => 'Boutique Luxxe',
            'url' => config('app.url'),
            'logo' => url('/images/logo.png'),
            'email' => 'info@boutiqueluxxe.com',
        ];
    @endphp
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#181512">
    <meta name="description" content="{{ $seoDescription }}">
    <meta name="robots" content="{{ $seoRobots }}">
    <link rel="canonical" href="{{ $seoCanonical }}">
    <meta property="og:type" content="{{ $seoType }}">
    <meta property="og:site_name" content="Boutique Luxxe">
    <meta property="og:title" content="{{ $fullTitle }}">
    <meta property="og:description" content="{{ $seoDescription }}">
    <meta property="og:url" content="{{ $seoCanonical }}">
    @if ($seoImage)
        <meta property="og:image" content="{{ $seoImage }}">
    @endif
    <meta name="twitter:card" content="{{ $seoImage ? 'summary_large_image' : 'summary' }}">
    <meta name="twitter:title" content="{{ $fullTitle }}">
    <meta name="twitter:description" content="{{ $seoDescription }}">
    @if ($seoImage)
        <meta name="twitter:image" content="{{ $seoImage }}">
    @endif
    <script type="application/ld+json">{!! json_encode($organizationSchema, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
    <title inertia>{{ $fullTitle }}</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
