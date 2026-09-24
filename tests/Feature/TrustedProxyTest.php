<?php

namespace Tests\Feature;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;
use Tests\TestCase;

class TrustedProxyTest extends TestCase
{
    public function test_forwarded_headers_from_an_untrusted_source_are_ignored(): void
    {
        $request = Request::create('http://boutiqueluxxe.com/test', 'GET', server: [
            'REMOTE_ADDR' => '203.0.113.10',
            'HTTP_X_FORWARDED_FOR' => '198.51.100.20',
            'HTTP_X_FORWARDED_HOST' => 'attacker.example',
            'HTTP_X_FORWARDED_PROTO' => 'https',
            'HTTP_X_FORWARDED_PORT' => '443',
        ]);

        $result = $this->inspectRequest($request);

        $this->assertSame('203.0.113.10', $result['ip']);
        $this->assertFalse($result['secure']);
        $this->assertSame('boutiqueluxxe.com', $result['host']);
    }

    public function test_forwarded_client_and_https_are_honored_from_cloudflare(): void
    {
        $request = Request::create('http://boutiqueluxxe.com/test', 'GET', server: [
            'REMOTE_ADDR' => '173.245.48.5',
            'HTTP_X_FORWARDED_FOR' => '198.51.100.20',
            'HTTP_X_FORWARDED_HOST' => 'attacker.example',
            'HTTP_X_FORWARDED_PROTO' => 'https',
            'HTTP_X_FORWARDED_PORT' => '443',
        ]);

        $result = $this->inspectRequest($request);

        $this->assertSame('198.51.100.20', $result['ip']);
        $this->assertTrue($result['secure']);
        $this->assertSame('boutiqueluxxe.com', $result['host']);
    }

    public function test_cloudflare_configuration_never_uses_a_wildcard(): void
    {
        $proxies = config('trusted_proxies.cloudflare');

        $this->assertNotEmpty($proxies);
        $this->assertNotContains('*', $proxies);
        $this->assertNotContains('0.0.0.0/0', $proxies);
        $this->assertNotContains('::/0', $proxies);
    }

    private function inspectRequest(Request $request): array
    {
        $middleware = new class(config('trusted_proxies.cloudflare')) extends TrustProxies
        {
            public function __construct(array $proxies)
            {
                $this->proxies = $proxies;
                $this->headers = Request::HEADER_X_FORWARDED_FOR
                    | Request::HEADER_X_FORWARDED_PORT
                    | Request::HEADER_X_FORWARDED_PROTO;
            }
        };

        $response = $middleware->handle(
            $request,
            fn (Request $trustedRequest) => new JsonResponse([
                'ip' => $trustedRequest->ip(),
                'secure' => $trustedRequest->isSecure(),
                'host' => $trustedRequest->getHost(),
            ]),
        );

        return $response->getData(true);
    }
}
