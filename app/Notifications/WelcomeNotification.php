<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class WelcomeNotification extends Notification
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Welcome to Designer Bags Boutique!',
            'message' => 'Thank you for joining us. Explore our curated collection of luxury designer bags.',
            'url' => '/shop',
            'icon' => 'welcome',
        ];
    }
}
