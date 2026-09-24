<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#181512">
    <meta name="description" content="Boutique Luxxe curates distinctive luxury bags, watches, and accessories for local and international clients.">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Boutique Luxxe">
    <meta property="og:title" content="Boutique Luxxe">
    <meta property="og:description" content="Considered luxury pieces, selected with care and delivered with personal service.">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="canonical" href="{{ url()->current() }}">
    <title inertia>{{ config('app.name', 'Boutique Luxxe') }}</title>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
