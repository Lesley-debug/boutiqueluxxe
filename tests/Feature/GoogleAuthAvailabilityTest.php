<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GoogleAuthAvailabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_google_sign_in_is_hidden_when_oauth_is_not_configured(): void
    {
        config(['services.google.client_id' => null, 'services.google.client_secret' => null]);

        $this->get('/login')->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Login')->where('features.googleAuth', false));
        $this->get('/register')->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Register')->where('features.googleAuth', false));
    }

    public function test_google_sign_in_is_exposed_when_oauth_is_configured(): void
    {
        config(['services.google.client_id' => 'test-id', 'services.google.client_secret' => 'test-secret']);

        $this->get('/login')->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Login')->where('features.googleAuth', true));
    }

    public function test_unconfigured_google_endpoint_is_unavailable(): void
    {
        config(['services.google.client_id' => null, 'services.google.client_secret' => null]);

        $this->get('/auth/google')->assertServiceUnavailable();
    }
}
