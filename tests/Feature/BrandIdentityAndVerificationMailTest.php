<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Tests\TestCase;

class BrandIdentityAndVerificationMailTest extends TestCase
{
    public function test_verification_email_uses_branded_styled_action(): void
    {
        $user = User::factory()->make(['name' => 'Luxury Customer']);
        $html = view('emails.auth.verify-email', [
            'user' => $user,
            'verificationUrl' => 'https://boutiqueluxxe.com/email/verify/example',
            'expiresIn' => 60,
        ])->render();

        $this->assertStringContainsString('Verify my email', $html);
        $this->assertStringContainsString('background-color:#b58a43', $html);
        $this->assertStringContainsString('border-radius:999px', $html);
        $this->assertStringContainsString('Boutique Luxxe', $html);
    }

    public function test_user_dispatches_the_branded_verification_notification(): void
    {
        $source = file_get_contents(app_path('Models/User.php'));

        $this->assertStringContainsString(VerifyEmailNotification::class, $source);
        $this->assertStringContainsString('new VerifyEmailNotification()', $source);
    }

    public function test_complete_favicon_set_exists(): void
    {
        foreach ([
            'favicon.ico',
            'favicon.svg',
            'apple-touch-icon.png',
            'icon-192.png',
            'icon-512.png',
            'site.webmanifest',
        ] as $file) {
            $this->assertFileExists(public_path($file));
            $this->assertGreaterThan(0, filesize(public_path($file)));
        }
    }
}
