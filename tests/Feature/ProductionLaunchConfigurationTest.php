<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Notifications\NewOrderNotification;
use App\Notifications\OrderPlacedNotification;
use App\Support\Money;
use Tests\TestCase;

class ProductionLaunchConfigurationTest extends TestCase
{
    public function test_secret_backup_is_absent_and_environment_variants_are_ignored(): void
    {
        $this->assertFileDoesNotExist(base_path('.env.backup-before-smtp'));

        $gitignore = file_get_contents(base_path('.gitignore'));
        $this->assertStringContainsString('.env.*', $gitignore);
        $this->assertStringContainsString('!.env.example', $gitignore);
        $this->assertStringContainsString('!.env.production.example', $gitignore);
    }

    public function test_production_template_has_contact_recipient_and_usd_currency(): void
    {
        $template = file_get_contents(base_path('.env.production.example'));

        $this->assertStringContainsString('CONTACT_EMAIL=info@boutiqueluxxe.com', $template);
        $this->assertStringContainsString('STORE_CURRENCY=USD', $template);
        $this->assertSame('USD', config('commerce.currency'));
        $this->assertSame('$1,234.50', Money::format(1234.5));
    }

    public function test_order_notifications_use_consistent_usd_formatting(): void
    {
        $order = new Order([
            'order_number' => 'ORD-USD-TEST',
            'customer_name' => 'Test Customer',
            'total' => 1250,
        ]);
        $order->id = 1;

        $adminMessage = (new NewOrderNotification($order))->toDatabase(null)['message'];
        $customerMessage = (new OrderPlacedNotification($order))->toArray((object) [])['message'];

        $this->assertStringContainsString('$1,250.00', $adminMessage);
        $this->assertStringContainsString('$1,250.00', $customerMessage);
        $this->assertStringNotContainsString('FCFA', $adminMessage);
        $this->assertStringNotContainsString('FCFA', $customerMessage);

        $confirmationTemplate = file_get_contents(resource_path('views/emails/orders/confirmation.blade.php'));
        $this->assertStringNotContainsString('FCFA', $confirmationTemplate);
        $this->assertStringContainsString('Money::format', $confirmationTemplate);
    }

    public function test_contact_recipient_has_safe_non_empty_fallback(): void
    {
        $mailConfig = file_get_contents(config_path('mail.php'));

        $this->assertStringContainsString(
            "env('CONTACT_EMAIL') ?: env('MAIL_FROM_ADDRESS', 'info@boutiqueluxxe.com')",
            $mailConfig,
        );
    }
}
