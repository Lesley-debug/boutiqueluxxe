<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use App\Models\UserActivityLog;
use App\Notifications\NewOrderNotification;
use App\Notifications\OrderPlacedNotification;
use App\Notifications\PasswordChangedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AccountSecurityAndNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_change_notifies_logs_activity_and_requires_fresh_login(): void
    {
        Notification::fake();
        $user = User::factory()->create(['password' => Hash::make('CurrentPassword123!')]);

        $response = $this->actingAs($user)->patch('/account/profile/password', [
            'current_password' => 'CurrentPassword123!',
            'password' => 'NewSecurePassword456!',
            'password_confirmation' => 'NewSecurePassword456!',
        ]);

        $response->assertRedirect('/login');
        $response->assertSessionHas('passwordChanged', true);
        $this->assertGuest();
        $this->assertTrue(Hash::check('NewSecurePassword456!', $user->fresh()->password));
        Notification::assertSentTo($user, PasswordChangedNotification::class);
        $this->assertDatabaseHas('user_activity_logs', [
            'user_id' => $user->id,
            'activity_type' => UserActivityLog::TYPE_PASSWORD_CHANGED,
        ]);
    }

    public function test_password_security_notification_has_mail_and_database_channels(): void
    {
        $notification = new PasswordChangedNotification(now()->toIso8601String(), '127.0.0.1');
        $this->assertSame(['database', 'mail'], $notification->via(new User()));
        $payload = $notification->toDatabase(new User());
        $this->assertSame('Password changed', $payload['title']);
        $this->assertSame('security', $payload['icon']);
    }

    public function test_customer_order_notification_links_to_owned_order_by_id(): void
    {
        $order = new Order(['order_number' => 'ORD-NOTIFY', 'total' => 400]);
        $order->id = 42;
        $payload = (new OrderPlacedNotification($order))->toArray(new User());

        $this->assertSame('/account/orders/42', $payload['url']);
        $this->assertSame('order_placed', $payload['icon']);
        $this->assertSame(['database'], (new OrderPlacedNotification($order))->via(new User()));
    }

    public function test_admin_order_notification_has_rich_dashboard_payload(): void
    {
        $order = new Order([
            'order_number' => 'ORD-ADMIN',
            'customer_name' => 'Customer',
            'total' => 500,
        ]);
        $order->id = 7;
        $payload = (new NewOrderNotification($order))->toDatabase(new User());

        $this->assertSame('New order received', $payload['title']);
        $this->assertSame('/admin/orders/7', $payload['url']);
        $this->assertSame('new_order', $payload['icon']);
    }

    public function test_account_dashboard_exposes_luxury_analytics_and_private_updates(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/account')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Account/Dashboard')
                ->has('stats.orders_count')
                ->has('stats.unread_notifications_count')
                ->has('stats.total_spent')
                ->has('profileCompletion')
                ->has('recentOrders')
                ->has('recentNotifications')
                ->has('recentActivity'));
    }

    public function test_checkout_dispatches_customer_and_staff_database_notifications(): void
    {
        $source = file_get_contents(app_path('Http/Controllers/CheckoutController.php'));

        $this->assertStringContainsString('new OrderPlacedNotification($order)', $source);
        $this->assertStringContainsString("orWhereIn('role', ['super_admin', 'manager', 'support_staff'])", $source);
        $this->assertStringContainsString('new NewOrderNotification($order)', $source);
    }
}
