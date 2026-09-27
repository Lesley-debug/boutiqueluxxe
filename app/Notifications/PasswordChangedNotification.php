<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $changedAt,
        public ?string $ipAddress = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type' => 'password_changed',
            'title' => 'Password changed',
            'message' => 'Your Boutique Luxxe password was changed. Sign in again with your new password.',
            'url' => '/account/activity',
            'icon' => 'security',
            'changed_at' => $this->changedAt,
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage())
            ->subject('Your Boutique Luxxe password was changed')
            ->view('emails.auth.password-changed', [
                'user' => $notifiable,
                'changedAt' => $this->changedAt,
                'ipAddress' => $this->ipAddress,
            ]);
    }
}
