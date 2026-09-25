<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use RuntimeException;
use Tests\TestCase;

class ProductionErrorPageTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['app.debug' => false]);
    }

    public function test_missing_html_page_uses_the_branded_404_page(): void
    {
        $response = $this->get('/this-page-does-not-exist');

        $response->assertNotFound();
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Errors/Status')
                ->where('status', 404)
                ->where('title', 'Page not found')
                ->has('description'),
        );
    }

    public function test_supported_http_errors_use_branded_pages_and_preserve_retry_after(): void
    {
        foreach ([403, 419, 429, 503] as $status) {
            $path = "/__error-page-test/{$status}";
            $headers = $status === 429 ? ['Retry-After' => '60'] : [];

            Route::get($path, fn () => abort($status, 'Internal detail', $headers));

            $response = $this->get($path);

            $response->assertStatus($status);
            $response->assertInertia(
                fn (Assert $page) => $page
                    ->component('Errors/Status')
                    ->where('status', $status)
                    ->has('title')
                    ->has('description'),
            );

            if ($status === 429) {
                $response->assertHeader('Retry-After', '60');
            }
        }
    }

    public function test_500_page_does_not_expose_exception_details(): void
    {
        Route::get('/__error-page-test/500', function () {
            throw new RuntimeException('sensitive production exception detail');
        });

        $response = $this->get('/__error-page-test/500');

        $response->assertStatus(500);
        $response->assertDontSee('sensitive production exception detail');
        $response->assertInertia(
            fn (Assert $page) => $page
                ->component('Errors/Status')
                ->where('status', 500)
                ->where('title', 'Something went wrong'),
        );
    }

    public function test_json_errors_remain_json_responses(): void
    {
        $response = $this->withHeader('Accept', 'application/json')
            ->get('/this-json-page-does-not-exist');

        $response->assertNotFound();
        $response->assertHeader('Content-Type', 'application/json');
        $this->assertFalse($response->headers->has('X-Inertia'));
    }
}
