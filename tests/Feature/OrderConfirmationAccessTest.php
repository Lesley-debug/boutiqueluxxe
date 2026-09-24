<?php

namespace Tests\Feature;

use App\Models\Order;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class OrderConfirmationAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_open_confirmation_with_a_valid_signed_link(): void
    {
        $order = $this->createGuestOrder();

        $url = URL::temporarySignedRoute(
            'orders.confirmation',
            now()->addMinutes(10),
            ['orderNumber' => $order->order_number],
            absolute: false,
        );

        $this->get($url)->assertOk();
    }

    public function test_guest_cannot_open_confirmation_without_authorization(): void
    {
        $order = $this->createGuestOrder();

        $this->get(route('orders.confirmation', $order->order_number))
            ->assertForbidden();
    }

    public function test_guest_cannot_open_confirmation_with_an_expired_link(): void
    {
        $order = $this->createGuestOrder();

        $url = URL::temporarySignedRoute(
            'orders.confirmation',
            now()->subMinute(),
            ['orderNumber' => $order->order_number],
            absolute: false,
        );

        $this->get($url)->assertForbidden();
    }

    private function createGuestOrder(): Order
    {
        return Order::create([
            'order_number' => 'BLX-TEST-'.fake()->unique()->numerify('######'),
            'user_id' => null,
            'status' => 'pending',
            'fulfillment_method' => 'delivery',
            'payment_status' => 'pending',
            'payment_method' => 'bank',
            'customer_name' => 'Guest Customer',
            'customer_email' => 'guest@example.com',
            'customer_phone' => '+237600000000',
            'shipping_address' => 'Test address',
            'city' => 'Douala',
            'region' => null,
            'notes' => null,
            'subtotal' => 10000,
            'shipping_cost' => 0,
            'discount_code' => null,
            'discount_amount' => 0,
            'total' => 10000,
        ]);
    }
}
