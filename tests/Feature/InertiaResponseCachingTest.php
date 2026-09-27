<?php

namespace Tests\Feature;

use App\Http\Middleware\PreventDynamicResponseCaching;
use Illuminate\Http\Request;
use PHPUnit\Framework\Attributes\Test;
use Symfony\Component\HttpFoundation\Response;
use Tests\TestCase;

class InertiaResponseCachingTest extends TestCase
{
    #[Test]
    public function it_prevents_dynamic_responses_from_entering_shared_caches(): void
    {
        $request = Request::create('/contact', 'GET');
        $response = (new PreventDynamicResponseCaching())->handle(
            $request,
            fn () => new Response('<html>Contact</html>', 200, [
                'Content-Type' => 'text/html; charset=UTF-8',
            ]),
        );

        $this->assertProtectedHeaders($response);
    }

    #[Test]
    public function it_isolates_inertia_json_from_document_responses(): void
    {
        $request = Request::create('/contact', 'GET', server: [
            'HTTP_X_INERTIA' => 'true',
            'HTTP_X_REQUESTED_WITH' => 'XMLHttpRequest',
        ]);
        $response = (new PreventDynamicResponseCaching())->handle(
            $request,
            fn () => new Response('{"component":"Store/Contact"}', 200, [
                'Content-Type' => 'application/json',
                'Vary' => 'Accept-Encoding',
            ]),
        );

        $this->assertProtectedHeaders($response);

        $vary = (string) $response->headers->get('Vary');
        $this->assertStringContainsString('Accept-Encoding', $vary);

        $varyTokens = array_map(
            'strtolower',
            array_map('trim', explode(',', $vary)),
        );
        $this->assertSame(1, count(array_filter(
            $varyTokens,
            fn (string $value) => $value === 'x-inertia',
        )));
    }

    #[Test]
    public function cache_protection_is_registered_as_the_outer_web_middleware(): void
    {
        $bootstrap = file_get_contents(base_path('bootstrap/app.php'));

        $this->assertIsString($bootstrap);
        $this->assertStringContainsString(
            'prepend: [PreventDynamicResponseCaching::class]',
            $bootstrap,
        );
    }

    private function assertProtectedHeaders(Response $response): void
    {
        $cacheControl = (string) $response->headers->get('Cache-Control');
        $vary = (string) $response->headers->get('Vary');

        $this->assertStringContainsString('no-store', $cacheControl);
        $this->assertStringContainsString('private', $cacheControl);
        $this->assertStringContainsString('max-age=0', $cacheControl);
        $this->assertSame('no-store', $response->headers->get('CDN-Cache-Control'));
        $this->assertSame('no-store', $response->headers->get('Surrogate-Control'));
        $this->assertSame('no-cache', $response->headers->get('X-LiteSpeed-Cache-Control'));
        $this->assertStringContainsString('X-Inertia', $vary);
        $this->assertStringContainsString('Cookie', $vary);
        $this->assertStringContainsString('Authorization', $vary);
    }
}
